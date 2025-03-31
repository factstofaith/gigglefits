"""
Encryption utilities for securing sensitive data in the database.

This module provides utilities for encrypting and decrypting data stored in the database,
particularly sensitive fields like credentials, secrets, and personal information.
"""

import os
import base64
import logging
from typing import Optional, Union, Any, Dict, TypeVar, Generic, Type, cast
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import InvalidToken
from sqlalchemy.types import TypeDecorator, VARCHAR, Text
import sqlalchemy as sa

# Setting up logging
logger = logging.getLogger(__name__)

# Get encryption key from environment variable or use a default for development
# In production, this should always be set via environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", None)
ENCRYPTION_SALT = os.getenv("ENCRYPTION_SALT", None)

# Dictionary to store key rotation information
KEY_VERSIONS = {}

# For key derivation
DEFAULT_ITERATIONS = 100000

def _derive_key(password: str, salt: bytes, iterations: int = DEFAULT_ITERATIONS) -> bytes:
    """
    Derive a key from a password and salt using PBKDF2.
    
    Args:
        password: The master password string
        salt: The salt bytes
        iterations: Number of iterations for PBKDF2
        
    Returns:
        Derived key as bytes
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 32 bytes = 256 bits
        salt=salt,
        iterations=iterations,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def initialize_encryption():
    """
    Initialize the encryption system.
    
    This function should be called once at application startup.
    It sets up the encryption keys and validates the configuration.
    """
    global ENCRYPTION_KEY, ENCRYPTION_SALT
    
    # Check if encryption key is provided
    if not ENCRYPTION_KEY:
        logger.warning("No encryption key provided. Using development key. DO NOT USE IN PRODUCTION!")
        ENCRYPTION_KEY = "TAP_DEV_KEY_DO_NOT_USE_IN_PRODUCTION"
    
    # Check if salt is provided
    if not ENCRYPTION_SALT:
        logger.warning("No encryption salt provided. Using development salt. DO NOT USE IN PRODUCTION!")
        salt_bytes = b'TAP_DEV_SALT_DO_NOT_USE_IN_PRODUCTION'
    else:
        salt_bytes = ENCRYPTION_SALT.encode()
    
    # Derive the key
    ENCRYPTION_KEY = _derive_key(ENCRYPTION_KEY, salt_bytes).decode()
    
    # Load any key rotation information from environment
    key_rotation_env = os.getenv("ENCRYPTION_KEY_ROTATION", "{}")
    try:
        rotation_config = json.loads(key_rotation_env)
        for version, key_info in rotation_config.items():
            if 'key' in key_info and 'salt' in key_info:
                derived_key = _derive_key(
                    key_info['key'], 
                    key_info['salt'].encode(), 
                    key_info.get('iterations', DEFAULT_ITERATIONS)
                ).decode()
                KEY_VERSIONS[version] = derived_key
                logger.info(f"Loaded rotation key version {version}")
    except Exception as e:
        logger.error(f"Failed to load key rotation configuration: {str(e)}")

def encrypt_data(data: Union[str, bytes, dict, list]) -> str:
    """
    Encrypt data using Fernet symmetric encryption.
    
    Args:
        data: The data to encrypt (string, bytes, dict, or list)
        
    Returns:
        Base64-encoded encrypted data with version prefix
    """
    if ENCRYPTION_KEY is None:
        raise ValueError("Encryption key not initialized")
    
    # Convert data to JSON string if it's a dict or list
    if isinstance(data, (dict, list)):
        data = json.dumps(data)
    
    # Convert string to bytes if necessary
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    # Generate a Fernet key from our base key
    fernet = Fernet(ENCRYPTION_KEY.encode())
    
    # Encrypt the data
    encrypted_data = fernet.encrypt(data)
    
    # Return base64 encoded data with version prefix
    return f"v1:{base64.urlsafe_b64encode(encrypted_data).decode('utf-8')}"

def decrypt_data(encrypted_data: str) -> Union[str, dict, list, bytes]:
    """
    Decrypt data that was encrypted with the encrypt_data function.
    
    Args:
        encrypted_data: The encrypted data string with version prefix
        
    Returns:
        The original data (string, dict, list, or bytes)
    """
    if not encrypted_data:
        return encrypted_data
    
    # Check if the data has a version prefix
    parts = encrypted_data.split(':', 1)
    if len(parts) != 2:
        raise ValueError("Invalid encrypted data format")
    
    version, data = parts
    
    # Get the key for this version
    key = None
    if version == "v1":
        key = ENCRYPTION_KEY
    elif version in KEY_VERSIONS:
        key = KEY_VERSIONS[version]
    else:
        raise ValueError(f"Unsupported encryption version: {version}")
    
    if key is None:
        raise ValueError("Encryption key not initialized")
    
    # Decode the base64 data
    encrypted_bytes = base64.urlsafe_b64decode(data)
    
    # Generate a Fernet key from our base key
    fernet = Fernet(key.encode())
    
    # Decrypt the data
    try:
        decrypted_data = fernet.decrypt(encrypted_bytes)
    except InvalidToken:
        logger.error(f"Failed to decrypt data with version {version}")
        raise ValueError("Failed to decrypt data")
    
    # Try to parse as JSON
    try:
        return json.loads(decrypted_data)
    except json.JSONDecodeError:
        # If not JSON, return as string
        return decrypted_data.decode('utf-8')
    except UnicodeDecodeError:
        # If can't decode as UTF-8, return the raw bytes
        return decrypted_data

# SQLAlchemy type decorators for encrypted fields
class EncryptedString(TypeDecorator):
    """
    SQLAlchemy type decorator for encrypted string values.
    """
    impl = Text
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        """Encrypt the value before storing in the database"""
        if value is not None:
            return encrypt_data(value)
        return value
    
    def process_result_value(self, value, dialect):
        """Decrypt the value when loading from the database"""
        if value is not None:
            try:
                return decrypt_data(value)
            except Exception as e:
                logger.error(f"Failed to decrypt string: {str(e)}")
                return f"[Decryption Error: {str(e)}]"
        return value

class EncryptedJSON(TypeDecorator):
    """
    SQLAlchemy type decorator for encrypted JSON values.
    """
    impl = Text
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        """Encrypt the value before storing in the database"""
        if value is not None:
            return encrypt_data(value)
        return value
    
    def process_result_value(self, value, dialect):
        """Decrypt the value when loading from the database"""
        if value is not None:
            try:
                result = decrypt_data(value)
                # Ensure it's a dict or list
                if not isinstance(result, (dict, list)):
                    if isinstance(result, str):
                        result = json.loads(result)
                    else:
                        result = json.loads(result.decode('utf-8') if isinstance(result, bytes) else str(result))
                return result
            except Exception as e:
                logger.error(f"Failed to decrypt JSON: {str(e)}")
                return {"error": f"Decryption failed: {str(e)}"}
        return value

# Helper function to check if a value is encrypted
def is_encrypted(value: str) -> bool:
    """
    Check if a value appears to be encrypted.
    
    Args:
        value: The string value to check
        
    Returns:
        True if the value appears to be encrypted, False otherwise
    """
    if not isinstance(value, str):
        return False
    
    # Check for version prefix
    parts = value.split(':', 1)
    if len(parts) != 2:
        return False
    
    version, data = parts
    
    # Check if version is valid
    if version not in ["v1"] and version not in KEY_VERSIONS:
        return False
    
    # Check if data is valid base64
    try:
        base64.urlsafe_b64decode(data)
        return True
    except Exception:
        return False
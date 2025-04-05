"""
Encryption utilities for securing sensitive data in the database.

This module provides utilities for encrypting and decrypting data stored in the database,
particularly sensitive fields like credentials, secrets, and personal information.
The module includes functions for key derivation, data encryption/decryption, and 
SQLAlchemy type decorators for transparent encryption of database fields.

Typical usage:
    1. Initialize the encryption system at application startup:
       initialize_encryption()
    
    2. Encrypt sensitive data:
       encrypted = encrypt_data("sensitive information")
    
    3. Decrypt data:
       original = decrypt_data(encrypted)
    
    4. Use SQLAlchemy type decorators in models:
       class User(Base):
           __tablename__ = 'users'
           id = Column(Integer, primary_key=True)
           password = Column(EncryptedString)
           settings = Column(EncryptedJSON)
"""

import os
import base64
import json
import logging
import secrets
from datetime import datetime
from functools import lru_cache
from typing import Optional, Union, Any, Dict, List, Type, Tuple, cast, TypeVar, Generic, Callable

# Cryptography imports
try:
    from cryptography.fernet import Fernet, InvalidToken
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.exceptions import InvalidKey
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False
    
# SQLAlchemy imports
from sqlalchemy.types import TypeDecorator, VARCHAR, Text
import sqlalchemy as sa

# Setting up logging
logger = logging.getLogger(__name__)

# Constants
DEFAULT_ITERATIONS = 100000  # Number of PBKDF2 iterations for key derivation
KEY_LENGTH = 32  # 32 bytes = 256 bits
VERSION_PREFIX = "v1"  # Current encryption version
DEV_KEY_WARNING = "No encryption key provided. Using development key. DO NOT USE IN PRODUCTION!"
DEV_SALT_WARNING = "No encryption salt provided. Using development salt. DO NOT USE IN PRODUCTION!"
ENV_KEY_NAME = "ENCRYPTION_KEY"  # Environment variable name for encryption key
ENV_SALT_NAME = "ENCRYPTION_SALT"  # Environment variable name for encryption salt
ENV_ROTATION_NAME = "ENCRYPTION_KEY_ROTATION"  # Environment variable name for key rotation info

# Module level variables
# These will be initialized in initialize_encryption()
ENCRYPTION_KEY = os.getenv(ENV_KEY_NAME, None)
ENCRYPTION_SALT = os.getenv(ENV_SALT_NAME, None)

# Dictionary to store key rotation information
KEY_VERSIONS: Dict[str, str] = {}

# Exceptions
class EncryptionError(Exception):
    """Base exception for encryption-related errors."""
    pass

class EncryptionKeyError(EncryptionError):
    """Exception raised when there are issues with encryption keys."""
    pass

class EncryptionConfigError(EncryptionError):
    """Exception raised when there are issues with encryption configuration."""
    pass

class DecryptionError(EncryptionError):
    """Exception raised when decryption fails."""
    pass

class InvalidDataFormatError(EncryptionError):
    """Exception raised when data format is invalid for encryption/decryption."""
    pass

def _derive_key(password: str, salt: bytes, iterations: int = DEFAULT_ITERATIONS) -> bytes:
    """
    Derive a key from a password and salt using PBKDF2.
    
    Args:
        password: The master password string
        salt: The salt bytes
        iterations: Number of iterations for PBKDF2, defaults to DEFAULT_ITERATIONS
        
    Returns:
        Derived key as bytes
        
    Raises:
        EncryptionError: If cryptography module is not available
        EncryptionKeyError: If key derivation fails
    """
    if not CRYPTO_AVAILABLE:
        raise EncryptionError("Cryptography module is not available")
    
    try:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=KEY_LENGTH,
            salt=salt,
            iterations=iterations,
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))
    except Exception as e:
        logger.error(f"Key derivation failed: {str(e)}")
        raise EncryptionKeyError(f"Failed to derive key: {str(e)}") from e

def initialize_encryption() -> None:
    """
    Initialize the encryption system.
    
    This function should be called once at application startup.
    It sets up the encryption keys and validates the configuration.
    
    Raises:
        EncryptionConfigError: If encryption configuration is invalid
        EncryptionKeyError: If key derivation fails
    """
    global ENCRYPTION_KEY, ENCRYPTION_SALT
    
    if not CRYPTO_AVAILABLE:
        logger.error("Cryptography module is not available. Encryption will not function.")
        return
    
    logger.info("Initializing encryption system...")
    
    # Check if encryption key is provided
    if not ENCRYPTION_KEY:
        logger.warning(DEV_KEY_WARNING)
        ENCRYPTION_KEY = "TAP_DEV_KEY_DO_NOT_USE_IN_PRODUCTION"
    
    # Check if salt is provided
    if not ENCRYPTION_SALT:
        logger.warning(DEV_SALT_WARNING)
        salt_bytes = b'TAP_DEV_SALT_DO_NOT_USE_IN_PRODUCTION'
    else:
        salt_bytes = ENCRYPTION_SALT.encode()
    
    try:
        # Derive the key
        ENCRYPTION_KEY = _derive_key(ENCRYPTION_KEY, salt_bytes).decode()
        
        # Validate derived key
        test_fernet = Fernet(ENCRYPTION_KEY.encode())
        test_data = b"test_encryption_initialization"
        test_encrypted = test_fernet.encrypt(test_data)
        test_decrypted = test_fernet.decrypt(test_encrypted)
        
        if test_data != test_decrypted:
            raise EncryptionKeyError("Encryption key validation failed")
        
        logger.info("Encryption system initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize encryption: {str(e)}")
        raise EncryptionConfigError(f"Failed to initialize encryption: {str(e)}") from e
    
    # Load any key rotation information from environment
    _load_key_rotation_config()

def _load_key_rotation_config() -> None:
    """
    Load key rotation configuration from environment.
    
    This function loads key rotation information from the ENCRYPTION_KEY_ROTATION
    environment variable, which should contain a JSON object mapping version identifiers
    to key information (key, salt, and optionally iterations).
    
    Format:
    {
        "v2": {"key": "key_value", "salt": "salt_value", "iterations": 100000},
        "v3": {"key": "another_key", "salt": "another_salt"}
    }
    
    Raises:
        EncryptionConfigError: If key rotation configuration is invalid
    """
    global KEY_VERSIONS
    
    key_rotation_env = os.getenv(ENV_ROTATION_NAME, "{}")
    
    try:
        rotation_config = json.loads(key_rotation_env)
        
        if not isinstance(rotation_config, dict):
            logger.error("Key rotation configuration must be a JSON object")
            return
            
        for version, key_info in rotation_config.items():
            if not isinstance(key_info, dict):
                logger.error(f"Key info for version {version} must be a JSON object")
                continue
                
            if 'key' not in key_info or 'salt' not in key_info:
                logger.error(f"Key info for version {version} must contain 'key' and 'salt'")
                continue
                
            try:
                iterations = key_info.get('iterations', DEFAULT_ITERATIONS)
                derived_key = _derive_key(
                    key_info['key'], 
                    key_info['salt'].encode(), 
                    iterations
                ).decode()
                
                KEY_VERSIONS[version] = derived_key
                logger.info(f"Loaded rotation key version {version}")
            except Exception as e:
                logger.error(f"Failed to derive key for version {version}: {str(e)}")
                
        logger.info(f"Loaded {len(KEY_VERSIONS)} rotation keys")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse key rotation configuration: {str(e)}")
        raise EncryptionConfigError(f"Invalid key rotation configuration: {str(e)}") from e
    except Exception as e:
        logger.error(f"Failed to load key rotation configuration: {str(e)}")
        raise EncryptionConfigError(f"Failed to load key rotation configuration: {str(e)}") from e

def generate_key() -> str:
    """
    Generate a new random encryption key.
    
    Returns:
        A new random encryption key as a string
        
    Raises:
        EncryptionError: If cryptography module is not available
    """
    if not CRYPTO_AVAILABLE:
        raise EncryptionError("Cryptography module is not available")
        
    try:
        return Fernet.generate_key().decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to generate key: {str(e)}")
        raise EncryptionKeyError(f"Failed to generate key: {str(e)}") from e

def generate_salt(length: int = 16) -> str:
    """
    Generate a new random salt for key derivation.
    
    Args:
        length: The length of the salt in bytes, defaults to 16
        
    Returns:
        A new random salt as a string
        
    Raises:
        ValueError: If length is less than 8
    """
    if length < 8:
        raise ValueError("Salt length must be at least 8 bytes")
        
    try:
        return base64.b64encode(secrets.token_bytes(length)).decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to generate salt: {str(e)}")
        raise EncryptionKeyError(f"Failed to generate salt: {str(e)}") from e

def encrypt_data(data: Union[str, bytes, dict, list]) -> str:
    """
    Encrypt data using Fernet symmetric encryption.
    
    Args:
        data: The data to encrypt (string, bytes, dict, or list)
        
    Returns:
        Base64-encoded encrypted data with version prefix
        
    Raises:
        EncryptionKeyError: If encryption key is not initialized
        InvalidDataFormatError: If data cannot be serialized
        EncryptionError: If encryption fails
    """
    if not CRYPTO_AVAILABLE:
        raise EncryptionError("Cryptography module is not available")
        
    if ENCRYPTION_KEY is None:
        logger.error("Encryption key not initialized")
        raise EncryptionKeyError("Encryption key not initialized")
    
    try:
        # Convert data to JSON string if it's a dict or list
        if isinstance(data, (dict, list)):
            data = json.dumps(data)
        
        # Convert string to bytes if necessary
        if isinstance(data, str):
            data = data.encode('utf-8')
            
        if not isinstance(data, bytes):
            raise InvalidDataFormatError(f"Cannot encrypt data of type {type(data)}")
        
        # Generate a Fernet key from our base key
        fernet = Fernet(ENCRYPTION_KEY.encode())
        
        # Encrypt the data
        encrypted_data = fernet.encrypt(data)
        
        # Return base64 encoded data with version prefix
        return f"{VERSION_PREFIX}:{base64.urlsafe_b64encode(encrypted_data).decode('utf-8')}"
    except json.JSONDecodeError as e:
        logger.error(f"Failed to serialize data for encryption: {str(e)}")
        raise InvalidDataFormatError(f"Failed to serialize data for encryption: {str(e)}") from e
    except Exception as e:
        logger.error(f"Encryption failed: {str(e)}")
        raise EncryptionError(f"Encryption failed: {str(e)}") from e

def decrypt_data(encrypted_data: str) -> Union[str, dict, list, bytes]:
    """
    Decrypt data that was encrypted with the encrypt_data function.
    
    Args:
        encrypted_data: The encrypted data string with version prefix
        
    Returns:
        The original data (string, dict, list, or bytes)
        
    Raises:
        EncryptionKeyError: If encryption key is not initialized
        InvalidDataFormatError: If encrypted data format is invalid
        DecryptionError: If decryption fails
    """
    if not CRYPTO_AVAILABLE:
        raise EncryptionError("Cryptography module is not available")
        
    if not encrypted_data:
        return encrypted_data
    
    try:
        # Check if the data has a version prefix
        parts = encrypted_data.split(':', 1)
        if len(parts) != 2:
            raise InvalidDataFormatError("Invalid encrypted data format: missing version prefix")
        
        version, data = parts
        
        # Get the key for this version
        key = None
        if version == VERSION_PREFIX:
            key = ENCRYPTION_KEY
        elif version in KEY_VERSIONS:
            key = KEY_VERSIONS[version]
        else:
            raise InvalidDataFormatError(f"Unsupported encryption version: {version}")
        
        if key is None:
            raise EncryptionKeyError("Encryption key not initialized")
        
        # Decode the base64 data
        try:
            encrypted_bytes = base64.urlsafe_b64decode(data)
        except Exception as e:
            raise InvalidDataFormatError(f"Invalid base64 encoding: {str(e)}") from e
        
        # Generate a Fernet key from our base key
        fernet = Fernet(key.encode())
        
        # Decrypt the data
        try:
            decrypted_data = fernet.decrypt(encrypted_bytes)
        except InvalidToken as e:
            logger.error(f"Failed to decrypt data with version {version}: {str(e)}")
            raise DecryptionError(f"Invalid token: {str(e)}") from e
        except Exception as e:
            logger.error(f"Failed to decrypt data: {str(e)}")
            raise DecryptionError(f"Decryption failed: {str(e)}") from e
        
        # Try to parse as JSON
        try:
            return json.loads(decrypted_data)
        except json.JSONDecodeError:
            # If not JSON, return as string
            try:
                return decrypted_data.decode('utf-8')
            except UnicodeDecodeError:
                # If can't decode as UTF-8, return the raw bytes
                return decrypted_data
    except (InvalidDataFormatError, EncryptionKeyError, DecryptionError) as e:
        # Re-raise known exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during decryption: {str(e)}")
        raise DecryptionError(f"Decryption failed: {str(e)}") from e

@lru_cache(maxsize=128)
def get_encryption_info() -> Dict[str, Any]:
    """
    Get information about the current encryption configuration.
    
    Returns:
        Dictionary with encryption information
        
    Note:
        This function is cached to improve performance for repeated calls.
        The returned dictionary does NOT include actual encryption keys.
    """
    info = {
        "initialized": ENCRYPTION_KEY is not None,
        "crypto_available": CRYPTO_AVAILABLE,
        "current_version": VERSION_PREFIX,
        "available_versions": list(KEY_VERSIONS.keys()) + [VERSION_PREFIX] if ENCRYPTION_KEY else [],
        "key_rotation_enabled": len(KEY_VERSIONS) > 0,
        "encryption_timestamp": datetime.now().isoformat(),
    }
    
    return info

def rotate_to_new_key(encrypted_data: str, new_version: str = "vnew") -> str:
    """
    Re-encrypt data with a new key version.
    
    This function is used during key rotation to re-encrypt data with a new key.
    
    Args:
        encrypted_data: The encrypted data string with version prefix
        new_version: The new version identifier, defaults to "vnew"
        
    Returns:
        Re-encrypted data with new version prefix
        
    Raises:
        EncryptionKeyError: If the new version key is not available
        DecryptionError: If decryption with current key fails
        EncryptionError: If re-encryption fails
    """
    if not CRYPTO_AVAILABLE:
        raise EncryptionError("Cryptography module is not available")
        
    if not encrypted_data:
        return encrypted_data
        
    # Check if the new version key is available
    if new_version not in KEY_VERSIONS and new_version != VERSION_PREFIX:
        raise EncryptionKeyError(f"Key for version {new_version} not available")
        
    try:
        # Decrypt with current key
        decrypted = decrypt_data(encrypted_data)
        
        # Get the new key
        new_key = ENCRYPTION_KEY if new_version == VERSION_PREFIX else KEY_VERSIONS[new_version]
        
        # Convert back to bytes if it's a string, dict, or list
        if isinstance(decrypted, str):
            decrypted = decrypted.encode('utf-8')
        elif isinstance(decrypted, (dict, list)):
            decrypted = json.dumps(decrypted).encode('utf-8')
            
        # Encrypt with new key
        fernet = Fernet(new_key.encode())
        encrypted = fernet.encrypt(decrypted)
        
        # Return with new version prefix
        return f"{new_version}:{base64.urlsafe_b64encode(encrypted).decode('utf-8')}"
    except Exception as e:
        logger.error(f"Failed to rotate encryption key: {str(e)}")
        raise EncryptionError(f"Failed to rotate encryption key: {str(e)}") from e

# SQLAlchemy type decorators for encrypted fields
class EncryptedString(TypeDecorator):
    """
    SQLAlchemy type decorator for encrypted string values.
    
    This type automatically encrypts string values before storing them in the database
    and decrypts them when loading from the database.
    
    Example:
        class User(Base):
            __tablename__ = 'users'
            id = Column(Integer, primary_key=True)
            password = Column(EncryptedString)
    """
    impl = Text
    cache_ok = True
    
    def process_bind_param(self, value: Optional[str], dialect: Any) -> Optional[str]:
        """
        Encrypt the value before storing in the database.
        
        Args:
            value: The string value to encrypt
            dialect: SQLAlchemy dialect
            
        Returns:
            Encrypted string or None if value is None
        """
        if value is not None:
            try:
                return encrypt_data(value)
            except Exception as e:
                logger.error(f"Failed to encrypt string: {str(e)}")
                raise
        return value
    
    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[str]:
        """
        Decrypt the value when loading from the database.
        
        Args:
            value: The encrypted string from the database
            dialect: SQLAlchemy dialect
            
        Returns:
            Decrypted string or error message if decryption fails
        """
        if value is not None:
            try:
                result = decrypt_data(value)
                if isinstance(result, (dict, list, bytes)):
                    # Convert to string if not already a string
                    if isinstance(result, bytes):
                        return result.decode('utf-8')
                    else:
                        return json.dumps(result)
                return result
            except Exception as e:
                logger.error(f"Failed to decrypt string: {str(e)}")
                return f"[Decryption Error: {str(e)}]"
        return value

class EncryptedJSON(TypeDecorator):
    """
    SQLAlchemy type decorator for encrypted JSON values.
    
    This type automatically encrypts JSON values (dicts or lists) before
    storing them in the database and decrypts them when loading from the database.
    
    Example:
        class User(Base):
            __tablename__ = 'users'
            id = Column(Integer, primary_key=True)
            settings = Column(EncryptedJSON)
    """
    impl = Text
    cache_ok = True
    
    def process_bind_param(self, value: Optional[Union[Dict[str, Any], List[Any]]], dialect: Any) -> Optional[str]:
        """
        Encrypt the value before storing in the database.
        
        Args:
            value: The dict or list to encrypt
            dialect: SQLAlchemy dialect
            
        Returns:
            Encrypted string or None if value is None
        """
        if value is not None:
            try:
                return encrypt_data(value)
            except Exception as e:
                logger.error(f"Failed to encrypt JSON: {str(e)}")
                raise
        return value
    
    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[Union[Dict[str, Any], List[Any]]]:
        """
        Decrypt the value when loading from the database.
        
        Args:
            value: The encrypted string from the database
            dialect: SQLAlchemy dialect
            
        Returns:
            Decrypted dict/list or error dict if decryption fails
        """
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

def is_encrypted(value: Any) -> bool:
    """
    Check if a value appears to be encrypted.
    
    Args:
        value: The value to check
        
    Returns:
        True if the value appears to be encrypted, False otherwise
    """
    if not isinstance(value, str):
        return False
    
    try:
        # Check for version prefix
        parts = value.split(':', 1)
        if len(parts) != 2:
            return False
        
        version, data = parts
        
        # Check if version is valid
        valid_versions = [VERSION_PREFIX] + list(KEY_VERSIONS.keys())
        if version not in valid_versions:
            return False
        
        # Check if data is valid base64
        try:
            base64.urlsafe_b64decode(data)
            return True
        except Exception:
            return False
    except Exception:
        return False

def encrypt_model_fields(
    model: Any, 
    fields: List[str], 
    only_if_unencrypted: bool = True
) -> Tuple[int, List[str]]:
    """
    Encrypt specified fields in a model instance.
    
    This is a utility function for encrypting fields in a model instance that
    aren't already encrypted (useful for migration scripts).
    
    Args:
        model: The model instance
        fields: List of field names to encrypt
        only_if_unencrypted: Only encrypt fields that aren't already encrypted
        
    Returns:
        Tuple of (number of fields encrypted, list of encrypted field names)
    """
    encrypted_count = 0
    encrypted_fields = []
    
    for field_name in fields:
        if not hasattr(model, field_name):
            logger.warning(f"Field {field_name} does not exist in model")
            continue
            
        value = getattr(model, field_name)
        if value is None:
            continue
            
        if only_if_unencrypted and is_encrypted(value):
            continue
            
        try:
            encrypted_value = encrypt_data(value)
            setattr(model, field_name, encrypted_value)
            encrypted_count += 1
            encrypted_fields.append(field_name)
        except Exception as e:
            logger.error(f"Failed to encrypt field {field_name}: {str(e)}")
            
    return encrypted_count, encrypted_fields

def migrate_field_encryption(
    session: Any, 
    model_class: Type[Any], 
    field_name: str, 
    batch_size: int = 100
) -> Tuple[int, int]:
    """
    Migrate a field to use encryption for all records in a table.
    
    This is a utility function for migrating existing data to use encryption.
    It processes records in batches to avoid memory issues with large tables.
    
    Args:
        session: SQLAlchemy session
        model_class: The model class
        field_name: The field name to encrypt
        batch_size: Number of records to process in each batch
        
    Returns:
        Tuple of (total records processed, number of records encrypted)
    """
    if not hasattr(model_class, field_name):
        raise ValueError(f"Field {field_name} does not exist in model class {model_class.__name__}")
        
    total_processed = 0
    total_encrypted = 0
    
    try:
        # Get total record count
        total_records = session.query(model_class).count()
        logger.info(f"Migrating encryption for {total_records} records in {model_class.__name__}.{field_name}")
        
        # Process in batches
        for offset in range(0, total_records, batch_size):
            batch = session.query(model_class).offset(offset).limit(batch_size).all()
            batch_encrypted = 0
            
            for record in batch:
                value = getattr(record, field_name)
                if value is not None and not is_encrypted(value):
                    try:
                        encrypted_value = encrypt_data(value)
                        setattr(record, field_name, encrypted_value)
                        batch_encrypted += 1
                    except Exception as e:
                        logger.error(f"Failed to encrypt {model_class.__name__}.{field_name} for record {record.id}: {str(e)}")
            
            # Commit the batch
            session.commit()
            
            total_processed += len(batch)
            total_encrypted += batch_encrypted
            
            logger.info(f"Processed {total_processed}/{total_records} records, encrypted {batch_encrypted} in this batch")
            
        logger.info(f"Encryption migration complete for {model_class.__name__}.{field_name}: {total_encrypted}/{total_processed} records encrypted")
        return total_processed, total_encrypted
        
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to migrate encryption for {model_class.__name__}.{field_name}: {str(e)}")
        raise EncryptionError(f"Failed to migrate encryption for {model_class.__name__}.{field_name}: {str(e)}") from e
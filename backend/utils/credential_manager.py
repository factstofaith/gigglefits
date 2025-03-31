"""
Secure Credential Management System

This module provides a secure system for managing credentials,
including encryption, secure storage, and access control.
"""

import os
import json
import base64
import logging
import hashlib
import tempfile
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta

# Import cryptography for secure encryption
try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

# Try to import keyring for OS secure storage
try:
    import keyring
    KEYRING_AVAILABLE = True
except ImportError:
    KEYRING_AVAILABLE = False

logger = logging.getLogger(__name__)


class CredentialError(Exception):
    """Exception raised for credential-related errors"""
    pass


class CredentialManager:
    """
    Secure credential management system for storing and retrieving
    sensitive authentication information.
    """
    
    def __init__(self, 
                 app_id: str,
                 encryption_key: Optional[str] = None,
                 use_keyring: bool = True,
                 storage_path: Optional[str] = None,
                 master_password: Optional[str] = None):
        """
        Initialize the credential manager
        
        Args:
            app_id: Application identifier for namespacing credentials
            encryption_key: Optional encryption key for securing credentials
            use_keyring: Whether to use system keyring (if available)
            storage_path: Optional path for storing encrypted credentials
            master_password: Optional master password for additional security
        """
        self.app_id = app_id
        self.use_keyring = use_keyring and KEYRING_AVAILABLE
        self.storage_path = storage_path or os.path.join(tempfile.gettempdir(), f"{app_id}_credentials")
        self.master_password = master_password
        
        # Check for cryptography module
        if not CRYPTO_AVAILABLE:
            logger.warning("Cryptography module not available. Credentials will be encoded but not securely encrypted.")
        
        # Set up encryption
        self.encryption_key = None
        if CRYPTO_AVAILABLE:
            if encryption_key:
                # Use provided key
                if isinstance(encryption_key, str):
                    try:
                        # Pad or truncate to 32 bytes for Fernet
                        key_bytes = encryption_key.encode('utf-8')
                        key_bytes = key_bytes.ljust(32, b'\0')[:32]
                        self.encryption_key = base64.urlsafe_b64encode(key_bytes)
                    except Exception as e:
                        logger.error(f"Error processing encryption key: {str(e)}")
                        self.encryption_key = None
                else:
                    self.encryption_key = encryption_key
            
            if not self.encryption_key and master_password:
                # Derive key from master password
                try:
                    salt = self.app_id.encode('utf-8')[:16].ljust(16, b'\0')
                    kdf = PBKDF2HMAC(
                        algorithm=hashes.SHA256(),
                        length=32,
                        salt=salt,
                        iterations=100000
                    )
                    key = kdf.derive(master_password.encode('utf-8'))
                    self.encryption_key = base64.urlsafe_b64encode(key)
                except Exception as e:
                    logger.error(f"Error generating key from master password: {str(e)}")
                    self.encryption_key = None
            
            if not self.encryption_key:
                # Generate random key
                try:
                    self.encryption_key = Fernet.generate_key()
                    # Store the key in keyring if available
                    if self.use_keyring:
                        keyring.set_password(self.app_id, 'encryption_key', self.encryption_key.decode('utf-8'))
                except Exception as e:
                    logger.error(f"Error generating random encryption key: {str(e)}")
                    self.encryption_key = None
        
        # Ensure storage directory exists
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
    
    def store_credential(self, name: str, credential: Union[str, Dict[str, Any]], overwrite: bool = False) -> bool:
        """
        Store a credential securely
        
        Args:
            name: Credential name/identifier
            credential: Credential value (string or dictionary)
            overwrite: Whether to overwrite existing credential
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Check if credential already exists and overwrite not allowed
            if not overwrite and self.has_credential(name):
                return False
            
            # Convert dictionary to string
            if isinstance(credential, dict):
                credential = json.dumps(credential)
            
            # Use keyring if available and enabled
            if self.use_keyring:
                try:
                    keyring.set_password(self.app_id, name, credential)
                    return True
                except Exception as e:
                    logger.warning(f"Failed to store credential in keyring: {str(e)}")
                    # Fall back to file storage
            
            # Encrypt credential
            encrypted_credential = self._encrypt(credential)
            
            # Store in file
            credentials = self._load_credentials_file()
            credentials[name] = {
                'value': encrypted_credential,
                'timestamp': datetime.now().isoformat()
            }
            
            return self._save_credentials_file(credentials)
            
        except Exception as e:
            logger.error(f"Error storing credential: {str(e)}")
            return False
    
    def get_credential(self, name: str) -> Union[str, Dict[str, Any], None]:
        """
        Retrieve a credential
        
        Args:
            name: Credential name/identifier
            
        Returns:
            Union[str, Dict[str, Any], None]: Credential value or None if not found
        """
        try:
            # Try keyring first if enabled
            if self.use_keyring:
                try:
                    credential = keyring.get_password(self.app_id, name)
                    if credential:
                        # Try to parse as JSON
                        try:
                            return json.loads(credential)
                        except:
                            return credential
                except Exception as e:
                    logger.warning(f"Failed to get credential from keyring: {str(e)}")
                    # Fall back to file storage
            
            # Get from file
            credentials = self._load_credentials_file()
            if name not in credentials:
                return None
            
            # Decrypt credential
            encrypted_credential = credentials[name]['value']
            decrypted = self._decrypt(encrypted_credential)
            
            # Try to parse as JSON
            try:
                return json.loads(decrypted)
            except:
                return decrypted
            
        except Exception as e:
            logger.error(f"Error retrieving credential: {str(e)}")
            return None
    
    def delete_credential(self, name: str) -> bool:
        """
        Delete a credential
        
        Args:
            name: Credential name/identifier
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            success = True
            
            # Delete from keyring if enabled
            if self.use_keyring:
                try:
                    keyring.delete_password(self.app_id, name)
                except Exception as e:
                    logger.warning(f"Failed to delete credential from keyring: {str(e)}")
                    success = False
            
            # Delete from file
            credentials = self._load_credentials_file()
            if name in credentials:
                del credentials[name]
                file_success = self._save_credentials_file(credentials)
                success = success and file_success
            
            return success
            
        except Exception as e:
            logger.error(f"Error deleting credential: {str(e)}")
            return False
    
    def has_credential(self, name: str) -> bool:
        """
        Check if a credential exists
        
        Args:
            name: Credential name/identifier
            
        Returns:
            bool: True if credential exists, False otherwise
        """
        # Check keyring if enabled
        if self.use_keyring:
            try:
                credential = keyring.get_password(self.app_id, name)
                if credential:
                    return True
            except:
                pass
        
        # Check file
        credentials = self._load_credentials_file()
        return name in credentials
    
    def list_credentials(self) -> List[Dict[str, Any]]:
        """
        List all stored credentials (names only, not values)
        
        Returns:
            List[Dict[str, Any]]: List of credential metadata
        """
        result = []
        
        # Get all credentials from file
        credentials = self._load_credentials_file()
        for name, data in credentials.items():
            result.append({
                'name': name,
                'timestamp': data.get('timestamp')
            })
        
        # Add credentials from keyring if enabled
        if self.use_keyring and hasattr(keyring.get_keyring(), 'get_credential'):
            try:
                # This is keyring backend specific and may not work on all platforms
                keyring_creds = keyring.get_keyring().get_credential(self.app_id, '')
                if keyring_creds:
                    for name in keyring_creds:
                        if not any(r['name'] == name for r in result):
                            result.append({
                                'name': name,
                                'timestamp': None,
                                'source': 'keyring'
                            })
            except:
                pass
        
        return result
    
    def clear_all_credentials(self) -> bool:
        """
        Clear all stored credentials
        
        Returns:
            bool: True if successful, False otherwise
        """
        success = True
        
        # Clear keyring if enabled
        if self.use_keyring:
            try:
                creds = self.list_credentials()
                for cred in creds:
                    name = cred['name']
                    try:
                        keyring.delete_password(self.app_id, name)
                    except:
                        success = False
            except:
                success = False
        
        # Clear file
        try:
            if os.path.exists(self.storage_path):
                os.remove(self.storage_path)
        except:
            success = False
        
        return success
    
    def _encrypt(self, data: str) -> str:
        """
        Encrypt data
        
        Args:
            data: String data to encrypt
            
        Returns:
            str: Encrypted data in base64 format
        """
        if not data:
            return ""
        
        # Use strong encryption if available
        if CRYPTO_AVAILABLE and self.encryption_key:
            try:
                f = Fernet(self.encryption_key)
                encrypted = f.encrypt(data.encode('utf-8'))
                return base64.b64encode(encrypted).decode('utf-8')
            except Exception as e:
                logger.warning(f"Encryption failed, falling back to simple encoding: {str(e)}")
        
        # Fallback to simple encoding (not secure, but better than plaintext)
        return base64.b64encode(data.encode('utf-8')).decode('utf-8')
    
    def _decrypt(self, encoded_data: str) -> str:
        """
        Decrypt data
        
        Args:
            encoded_data: Encrypted data in base64 format
            
        Returns:
            str: Decrypted data
        """
        if not encoded_data:
            return ""
        
        # Use strong decryption if available
        if CRYPTO_AVAILABLE and self.encryption_key:
            try:
                f = Fernet(self.encryption_key)
                encrypted = base64.b64decode(encoded_data.encode('utf-8'))
                decrypted = f.decrypt(encrypted)
                return decrypted.decode('utf-8')
            except Exception as e:
                logger.warning(f"Decryption failed, trying simple decoding: {str(e)}")
        
        # Fallback to simple decoding
        try:
            return base64.b64decode(encoded_data.encode('utf-8')).decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to decode data: {str(e)}")
            raise CredentialError(f"Could not decrypt credential: {str(e)}")
    
    def _load_credentials_file(self) -> Dict[str, Any]:
        """
        Load credentials from file
        
        Returns:
            Dict[str, Any]: Loaded credentials
        """
        if not os.path.exists(self.storage_path):
            return {}
        
        try:
            with open(self.storage_path, 'r') as f:
                data = f.read()
                
                # If file is empty, return empty dict
                if not data:
                    return {}
                
                # Parse JSON
                return json.loads(data)
        except Exception as e:
            logger.error(f"Error loading credentials file: {str(e)}")
            return {}
    
    def _save_credentials_file(self, credentials: Dict[str, Any]) -> bool:
        """
        Save credentials to file
        
        Args:
            credentials: Credentials dictionary
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(self.storage_path, 'w') as f:
                json.dump(credentials, f)
            
            # Set proper permissions
            os.chmod(self.storage_path, 0o600)  # Owner read/write only
            
            return True
        except Exception as e:
            logger.error(f"Error saving credentials file: {str(e)}")
            return False


class CredentialProvider:
    """
    Provider interface for retrieving credentials for various services
    """
    
    def __init__(self, credential_manager: CredentialManager):
        """
        Initialize with a credential manager
        
        Args:
            credential_manager: CredentialManager instance
        """
        self.credential_manager = credential_manager
    
    def get_aws_credentials(self) -> Dict[str, str]:
        """
        Get AWS credentials
        
        Returns:
            Dict[str, str]: AWS credentials
        """
        creds = self.credential_manager.get_credential('aws')
        if not creds or not isinstance(creds, dict):
            return {}
        
        return {
            'aws_access_key_id': creds.get('access_key_id', ''),
            'aws_secret_access_key': creds.get('secret_access_key', ''),
            'region_name': creds.get('region', ''),
            'profile_name': creds.get('profile', '')
        }
    
    def get_azure_credentials(self) -> Dict[str, str]:
        """
        Get Azure credentials
        
        Returns:
            Dict[str, str]: Azure credentials
        """
        creds = self.credential_manager.get_credential('azure')
        if not creds or not isinstance(creds, dict):
            return {}
        
        return {
            'connection_string': creds.get('connection_string', ''),
            'account_name': creds.get('account_name', ''),
            'account_key': creds.get('account_key', ''),
            'sas_token': creds.get('sas_token', ''),
            'tenant_id': creds.get('tenant_id', ''),
            'client_id': creds.get('client_id', ''),
            'client_secret': creds.get('client_secret', '')
        }
    
    def get_sharepoint_credentials(self) -> Dict[str, str]:
        """
        Get SharePoint credentials
        
        Returns:
            Dict[str, str]: SharePoint credentials
        """
        creds = self.credential_manager.get_credential('sharepoint')
        if not creds or not isinstance(creds, dict):
            return {}
        
        return {
            'tenant_id': creds.get('tenant_id', ''),
            'client_id': creds.get('client_id', ''),
            'client_secret': creds.get('client_secret', ''),
            'username': creds.get('username', ''),
            'password': creds.get('password', '')
        }
    
    def get_database_credentials(self, db_name: str) -> Dict[str, str]:
        """
        Get database credentials
        
        Args:
            db_name: Database name or identifier
            
        Returns:
            Dict[str, str]: Database credentials
        """
        key = f"db_{db_name}"
        creds = self.credential_manager.get_credential(key)
        if not creds or not isinstance(creds, dict):
            return {}
        
        return {
            'host': creds.get('host', ''),
            'port': creds.get('port', ''),
            'database': creds.get('database', ''),
            'username': creds.get('username', ''),
            'password': creds.get('password', ''),
            'connection_string': creds.get('connection_string', '')
        }
    
    def get_api_credentials(self, api_name: str) -> Dict[str, str]:
        """
        Get API credentials
        
        Args:
            api_name: API name or identifier
            
        Returns:
            Dict[str, str]: API credentials
        """
        key = f"api_{api_name}"
        creds = self.credential_manager.get_credential(key)
        if not creds or not isinstance(creds, dict):
            return {}
        
        return {
            'api_key': creds.get('api_key', ''),
            'api_secret': creds.get('api_secret', ''),
            'token': creds.get('token', ''),
            'username': creds.get('username', ''),
            'password': creds.get('password', '')
        }
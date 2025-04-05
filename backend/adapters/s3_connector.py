"""
AWS S3 Storage Connector Implementation

This module implements the StorageConnector interface for AWS S3 storage.
It provides standardized methods for interacting with S3 buckets and objects,
supporting various authentication methods and operations.
"""

import os
import io
import logging
import time
import functools
from typing import Dict, Any, Optional, List, Union, BinaryIO, Tuple
from datetime import datetime, timedelta, timezone
import mimetypes
import pandas as pd

import boto3
from boto3.session import Session
from botocore.exceptions import ClientError, NoCredentialsError, EndpointConnectionError
from botocore.config import Config

from .storage_connector import StorageConnector
from ..utils.error_handling.exceptions import StorageError, ConnectionError, AuthenticationError, OperationError

logger = logging.getLogger(__name__)


def retry_with_backoff(max_retries=3, initial_backoff=1, backoff_factor=2):
    """
    Decorator for retrying S3 operations with exponential backoff.
    
    Args:
        max_retries (int): Maximum number of retries before giving up
        initial_backoff (float): Initial backoff time in seconds
        backoff_factor (float): Factor to multiply backoff time by after each retry
        
    Returns:
        Callable: Decorated function with retry logic
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_backoff = initial_backoff
            
            while True:
                try:
                    return func(*args, **kwargs)
                except (ClientError, EndpointConnectionError) as e:
                    # Only retry on specific error codes that might be transient
                    if isinstance(e, ClientError):
                        error_code = e.response.get('Error', {}).get('Code', '')
                        if error_code not in [
                            'Throttling', 'ThrottlingException', 'RequestLimitExceeded', 
                            'RequestTimeout', 'InternalError', 'ServiceUnavailable',
                            'SlowDown', 'ProvisionedThroughputExceededException'
                        ]:
                            # Don't retry on non-transient errors
                            logger.error(f"Non-transient AWS error: {str(e)}")
                            raise StorageError(f"AWS S3 operation failed: {str(e)}", original_error=e)
                    
                    retries += 1
                    if retries > max_retries:
                        logger.error(f"Operation failed after {max_retries} retries: {str(e)}")
                        raise StorageError(f"Operation failed after {max_retries} retries", original_error=e)
                    
                    logger.warning(f"Retry {retries}/{max_retries} after error: {str(e)}. Waiting {current_backoff}s")
                    time.sleep(current_backoff)
                    current_backoff *= backoff_factor
        return wrapper
    return decorator


class S3Connector(StorageConnector):
    """AWS S3 storage connector implementation
    
    This class implements the StorageConnector interface for AWS S3 storage.
    It provides methods for interacting with S3 buckets and objects in a 
    standardized way across different storage providers.
    
    The connector supports multiple authentication methods:
    - AWS access key and secret key
    - AWS profile
    - IAM role
    - IAM instance profile (automatic when no credentials provided)
    - Custom endpoint (for S3-compatible storage like MinIO)
    
    Attributes:
        s3 (boto3.resource): S3 resource for high-level operations
        s3_client (boto3.client): S3 client for low-level operations
        region_name (str): AWS region name
        endpoint_url (str): Custom endpoint URL if using S3-compatible storage
        connection_status (Dict): Current connection status and health information
    """
    
    def __init__(self, 
                 aws_access_key_id: Optional[str] = None,
                 aws_secret_access_key: Optional[str] = None,
                 region_name: Optional[str] = None,
                 endpoint_url: Optional[str] = None,
                 use_ssl: bool = True,
                 verify: bool = True,
                 profile_name: Optional[str] = None,
                 role_arn: Optional[str] = None,
                 session_name: str = 'S3ConnectorSession',
                 default_bucket: Optional[str] = None,
                 boto_config: Optional[Dict[str, Any]] = None,
                 max_retries: int = 3,
                 connect_timeout: int = 10,
                 read_timeout: int = 60,
                 max_pool_connections: int = 10):
        """
        Initialize the S3 connector
        
        Args:
            aws_access_key_id (Optional[str]): AWS access key ID
            aws_secret_access_key (Optional[str]): AWS secret access key
            region_name (Optional[str]): AWS region name
            endpoint_url (Optional[str]): Custom endpoint URL (for S3-compatible storage)
            use_ssl (bool): Whether to use SSL (default: True)
            verify (bool): Whether to verify SSL certificates (default: True)
            profile_name (Optional[str]): AWS profile name to use
            role_arn (Optional[str]): ARN of role to assume
            session_name (str): Session name for assumed role
            default_bucket (Optional[str]): Default bucket name to use
            boto_config (Optional[Dict[str, Any]]): Additional boto3 config parameters
            max_retries (int): Maximum number of retries for failed operations
            connect_timeout (int): Connection timeout in seconds
            read_timeout (int): Read timeout in seconds
            max_pool_connections (int): Maximum connections in the connection pool
            
        Raises:
            AuthenticationError: If no valid authentication method is provided
            ConnectionError: If connection attempt fails
        """
        # Validate authentication parameters
        has_key_pair = aws_access_key_id is not None and aws_secret_access_key is not None
        has_profile = profile_name is not None
        has_credentials = has_key_pair or has_profile or role_arn is not None
        
        # Store connection parameters
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key
        self.region_name = region_name
        self.endpoint_url = endpoint_url
        self.use_ssl = use_ssl
        self.verify = verify
        self.profile_name = profile_name
        self.role_arn = role_arn
        self.session_name = session_name
        self.default_bucket = default_bucket
        self.max_retries = max_retries
        
        # Create boto3 config with timeouts and retry configuration
        self.boto_config = Config(
            connect_timeout=connect_timeout,
            read_timeout=read_timeout,
            max_pool_connections=max_pool_connections,
            retries={
                'max_attempts': max_retries,
                'mode': 'standard'
            },
            **(boto_config or {})
        )
        
        # Initialize connection objects
        self.s3 = None
        self.s3_client = None
        self.session = None
        
        # Connection status tracking
        self.connection_status = {
            "connected": False,
            "last_connection_attempt": None,
            "last_successful_connection": None,
            "connection_errors": [],
            "auth_method": self._determine_auth_method(),
            "endpoint": endpoint_url or f"https://s3.{region_name}.amazonaws.com" if region_name else "default AWS S3 endpoint"
        }
        
        # Auto-connect if we have enough information
        try:
            self.connect()
        except Exception as e:
            logger.warning(f"Failed to connect during initialization: {str(e)}")
    
    def _determine_auth_method(self) -> str:
        """
        Determine which authentication method will be used
        
        Returns:
            str: The authentication method description
        """
        if self.profile_name:
            return "profile"
        elif self.aws_access_key_id and self.aws_secret_access_key:
            return "access_key"
        elif self.role_arn:
            return "assumed_role"
        else:
            return "instance_profile"
    
    def connect(self) -> bool:
        """
        Establish a connection to AWS S3
        
        Attempts to connect to AWS S3 using the provided credentials.
        Updates the connection status with the result.
        
        Returns:
            bool: True if connection is successful, False otherwise
            
        Raises:
            AuthenticationError: If authentication fails
            ConnectionError: If connection cannot be established
        """
        now = datetime.now(timezone.utc)
        self.connection_status["last_connection_attempt"] = now
        auth_method = self.connection_status["auth_method"]
        
        try:
            logger.info(f"Connecting to AWS S3 using {auth_method} authentication")
            
            # Create session
            session_kwargs = {}
            
            if self.profile_name:
                session_kwargs['profile_name'] = self.profile_name
            elif self.aws_access_key_id and self.aws_secret_access_key:
                session_kwargs['aws_access_key_id'] = self.aws_access_key_id
                session_kwargs['aws_secret_access_key'] = self.aws_secret_access_key
            
            if self.region_name:
                session_kwargs['region_name'] = self.region_name
            
            try:
                self.session = boto3.Session(**session_kwargs)
                logger.debug(f"Created boto3 session with region {self.region_name or 'default'}")
            except Exception as e:
                auth_error = f"Failed to create AWS session: {str(e)}"
                logger.error(auth_error)
                
                # Update connection status
                self.connection_status["connected"] = False
                self.connection_status["connection_errors"].append({
                    "timestamp": now.isoformat(),
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "stage": "session_creation"
                })
                
                raise AuthenticationError(auth_error, original_error=e)
            
            # Assume role if specified
            if self.role_arn:
                try:
                    logger.debug(f"Attempting to assume role {self.role_arn}")
                    sts_client = self.session.client('sts', 
                                                   config=self.boto_config,
                                                   endpoint_url=self.endpoint_url if self.endpoint_url else None,
                                                   use_ssl=self.use_ssl,
                                                   verify=self.verify)
                    
                    response = sts_client.assume_role(
                        RoleArn=self.role_arn,
                        RoleSessionName=self.session_name
                    )
                    
                    # Create new session with temporary credentials
                    credentials = response['Credentials']
                    self.session = boto3.Session(
                        aws_access_key_id=credentials['AccessKeyId'],
                        aws_secret_access_key=credentials['SecretAccessKey'],
                        aws_session_token=credentials['SessionToken'],
                        region_name=self.region_name
                    )
                    logger.debug(f"Successfully assumed role {self.role_arn}")
                except Exception as e:
                    auth_error = f"Failed to assume role {self.role_arn}: {str(e)}"
                    logger.error(auth_error)
                    
                    # Update connection status
                    self.connection_status["connected"] = False
                    self.connection_status["connection_errors"].append({
                        "timestamp": now.isoformat(),
                        "error": str(e),
                        "error_type": type(e).__name__,
                        "stage": "role_assumption"
                    })
                    
                    raise AuthenticationError(auth_error, original_error=e)
            
            # Create S3 resource and client
            client_kwargs = {
                'config': self.boto_config
            }
            
            if self.endpoint_url:
                client_kwargs['endpoint_url'] = self.endpoint_url
            
            client_kwargs['use_ssl'] = self.use_ssl
            client_kwargs['verify'] = self.verify
            
            try:
                # Create S3 resource and client
                self.s3 = self.session.resource('s3', **client_kwargs)
                self.s3_client = self.session.client('s3', **client_kwargs)
                
                # Test connection by listing buckets
                logger.debug("Testing connection with list_buckets API call")
                response = self.s3_client.list_buckets()
                
                # Update connection status with success details
                self.connection_status["connected"] = True
                self.connection_status["last_successful_connection"] = now
                self.connection_status["connection_errors"] = []
                
                # Add account ID if available
                try:
                    sts_client = self.session.client('sts', **client_kwargs)
                    identity = sts_client.get_caller_identity()
                    self.connection_status["account_id"] = identity.get('Account')
                    self.connection_status["user_id"] = identity.get('UserId')
                    self.connection_status["arn"] = identity.get('Arn')
                except Exception as e:
                    logger.debug(f"Could not retrieve account identity: {str(e)}")
                
                # Check default bucket if provided
                if self.default_bucket:
                    try:
                        self.s3_client.head_bucket(Bucket=self.default_bucket)
                        logger.debug(f"Default bucket '{self.default_bucket}' exists and is accessible")
                        self.connection_status["default_bucket_exists"] = True
                    except Exception as e:
                        logger.warning(f"Default bucket '{self.default_bucket}' is not accessible: {str(e)}")
                        self.connection_status["default_bucket_exists"] = False
                
                logger.info(f"Successfully connected to AWS S3 using {auth_method} authentication")
                return True
                
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                error_msg = f"AWS S3 connection failed: {error_code}: {str(e)}"
                logger.error(error_msg)
                
                # Update connection status
                self.connection_status["connected"] = False
                self.connection_status["connection_errors"].append({
                    "timestamp": now.isoformat(),
                    "error": str(e),
                    "error_code": error_code,
                    "error_type": "ClientError",
                    "stage": "client_validation"
                })
                
                # Clear resources
                self.s3 = None
                self.s3_client = None
                
                # Map different error codes to appropriate exception types
                if error_code in ('InvalidAccessKeyId', 'SignatureDoesNotMatch', 'AccessDenied', 'UnrecognizedClientException'):
                    raise AuthenticationError(error_msg, original_error=e)
                else:
                    raise ConnectionError(error_msg, original_error=e)
            
            except NoCredentialsError as e:
                error_msg = f"AWS credentials not found or invalid: {str(e)}"
                logger.error(error_msg)
                
                # Update connection status
                self.connection_status["connected"] = False
                self.connection_status["connection_errors"].append({
                    "timestamp": now.isoformat(),
                    "error": str(e),
                    "error_type": "NoCredentialsError",
                    "stage": "client_validation"
                })
                
                # Clear resources
                self.s3 = None
                self.s3_client = None
                
                raise AuthenticationError(error_msg, original_error=e)
                
            except EndpointConnectionError as e:
                error_msg = f"Cannot connect to S3 endpoint: {str(e)}"
                logger.error(error_msg)
                
                # Update connection status
                self.connection_status["connected"] = False
                self.connection_status["connection_errors"].append({
                    "timestamp": now.isoformat(),
                    "error": str(e),
                    "error_type": "EndpointConnectionError",
                    "stage": "client_validation"
                })
                
                # Clear resources
                self.s3 = None
                self.s3_client = None
                
                raise ConnectionError(error_msg, original_error=e)
                
        except (AuthenticationError, ConnectionError):
            # Re-raise these specific errors
            raise 
        except Exception as e:
            error_msg = f"Unexpected error connecting to AWS S3: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status
            self.connection_status["connected"] = False
            self.connection_status["connection_errors"].append({
                "timestamp": now.isoformat(),
                "error": str(e),
                "error_type": type(e).__name__,
                "stage": "connect"
            })
            
            # Clear resources
            self.s3 = None
            self.s3_client = None
            self.session = None
            
            raise ConnectionError(error_msg, original_error=e)
    
    def disconnect(self) -> bool:
        """
        Close the connection to AWS S3
        
        Releases the S3 resource and client connections and updates connection status.
        
        Returns:
            bool: True if disconnection is successful
        """
        # No explicit disconnection needed for S3, but we clear the objects
        self.s3 = None
        self.s3_client = None
        self.session = None
        
        # Update connection status
        self.connection_status["connected"] = False
        self.connection_status["last_disconnection"] = datetime.now(timezone.utc)
        
        logger.info("Disconnected from AWS S3")
        return True
    
    @retry_with_backoff()
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to AWS S3
        
        Performs a series of operations to verify the connection is working properly,
        including listing buckets and checking default bucket if specified.
        
        Returns:
            Dict[str, Any]: Connection test results with status, message, and details
            
        Raises:
            ConnectionError: If connection test fails
            AuthenticationError: If authentication fails
        """
        start_time = datetime.now(timezone.utc)
        result = {
            'status': 'error',
            'message': 'Connection test not completed',
            'details': {},
            'timestamp': start_time.isoformat()
        }
        
        try:
            if not self.s3_client:
                logger.info("No active client, attempting to connect")
                try:
                    self.connect()
                except (ConnectionError, AuthenticationError) as e:
                    result['message'] = f"Failed to connect: {str(e)}"
                    result['details']['error'] = str(e)
                    result['details']['error_type'] = type(e).__name__
                    return result
            
            # Get region and endpoint info
            region = self.region_name or "default"
            endpoint = self.endpoint_url or f"s3.{region}.amazonaws.com"
            result['details']['region'] = region
            result['details']['endpoint'] = endpoint
            result['details']['auth_method'] = self.connection_status["auth_method"]
            
            # List buckets to test connection
            logger.debug("Testing connection with list_buckets API call")
            bucket_start = datetime.now(timezone.utc)
            response = self.s3_client.list_buckets()
            bucket_list_duration = (datetime.now(timezone.utc) - bucket_start).total_seconds()
            
            buckets = response.get('Buckets', [])
            bucket_count = len(buckets)
            result['details']['bucket_count'] = bucket_count
            result['details']['bucket_list_duration'] = bucket_list_duration
            
            # Get account ID
            if 'Owner' in response and 'ID' in response['Owner']:
                result['details']['account_id'] = response['Owner']['ID']
                result['details']['display_name'] = response['Owner'].get('DisplayName')
            
            # Test default bucket if provided
            default_bucket_status = None
            if self.default_bucket:
                try:
                    logger.debug(f"Testing access to default bucket '{self.default_bucket}'")
                    default_start = datetime.now(timezone.utc)
                    # Check if bucket exists
                    self.s3_client.head_bucket(Bucket=self.default_bucket)
                    default_bucket_status = "accessible"
                    
                    # Try listing objects in the bucket (limited to 1 to minimize data transfer)
                    object_start = datetime.now(timezone.utc)
                    object_response = self.s3_client.list_objects_v2(
                        Bucket=self.default_bucket,
                        MaxKeys=1
                    )
                    object_list_duration = (datetime.now(timezone.utc) - object_start).total_seconds()
                    
                    # Add details about object listing
                    result['details']['default_bucket'] = {
                        'name': self.default_bucket,
                        'status': default_bucket_status,
                        'object_count': object_response.get('KeyCount', 0),
                        'list_duration': object_list_duration
                    }
                except ClientError as e:
                    error_code = e.response.get('Error', {}).get('Code', '')
                    if error_code == 'NoSuchBucket':
                        default_bucket_status = "does not exist"
                    elif error_code in ('AccessDenied', 'AllAccessDisabled'):
                        default_bucket_status = "access denied"
                    else:
                        default_bucket_status = f"error: {error_code}"
                    
                    result['details']['default_bucket'] = {
                        'name': self.default_bucket,
                        'status': default_bucket_status,
                        'error': str(e),
                        'error_code': error_code
                    }
                except Exception as e:
                    default_bucket_status = f"error: {str(e)}"
                    result['details']['default_bucket'] = {
                        'name': self.default_bucket,
                        'status': default_bucket_status,
                        'error': str(e)
                    }
            
            # Calculate total test duration
            total_duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            # Update connection status with test results
            self.connection_status["last_test"] = {
                "timestamp": start_time.isoformat(),
                "duration": total_duration,
                "success": True,
                "buckets": bucket_count,
                "default_bucket_status": default_bucket_status
            }
            
            # Return detailed test results
            return {
                'status': 'success',
                'message': f'Connection successful. Found {bucket_count} bucket(s).',
                'details': {
                    'bucket_count': bucket_count,
                    'default_bucket_status': default_bucket_status,
                    'region': region,
                    'endpoint': endpoint,
                    'auth_method': self.connection_status["auth_method"],
                    'test_duration': total_duration
                },
                'timestamp': start_time.isoformat()
            }
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_msg = f"AWS S3 connection test failed: {error_code}: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status with test failure
            self.connection_status["last_test"] = {
                "timestamp": start_time.isoformat(),
                "duration": (datetime.now(timezone.utc) - start_time).total_seconds(),
                "success": False,
                "error": str(e),
                "error_code": error_code
            }
            
            return {
                'status': 'error',
                'message': error_msg,
                'details': {
                    'error': str(e),
                    'error_code': error_code,
                    'region': self.region_name or "default",
                    'endpoint': self.endpoint_url or "default",
                    'auth_method': self.connection_status["auth_method"]
                },
                'timestamp': start_time.isoformat()
            }
            
        except Exception as e:
            error_msg = f"Unexpected error during S3 connection test: {str(e)}"
            logger.error(error_msg)
            
            # Update connection status with test failure
            self.connection_status["last_test"] = {
                "timestamp": start_time.isoformat(),
                "duration": (datetime.now(timezone.utc) - start_time).total_seconds(),
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }
            
            return {
                'status': 'error',
                'message': error_msg,
                'details': {
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'region': self.region_name or "default",
                    'endpoint': self.endpoint_url or "default",
                    'auth_method': self.connection_status["auth_method"] if "auth_method" in self.connection_status else "unknown"
                },
                'timestamp': start_time.isoformat()
            }
    
    @retry_with_backoff()
    def list_containers(self) -> List[Dict[str, Any]]:
        """
        List available buckets in AWS S3
        
        In S3, buckets are the equivalent of containers in the StorageConnector interface.
        This method lists all buckets accessible to the current credentials.
        
        Returns:
            List[Dict[str, Any]]: List of bucket details
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If bucket listing fails
        """
        try:
            if not self.s3_client:
                logger.debug("No active client for list_containers, attempting to connect")
                self.connect()
            
            # List buckets (note: S3 doesn't support pagination for bucket listing)
            logger.debug("Listing S3 buckets")
            start_time = datetime.now(timezone.utc)
            response = self.s3_client.list_buckets()
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            buckets = []
            bucket_list = response.get('Buckets', [])
            owner_id = response.get('Owner', {}).get('ID')
            owner_name = response.get('Owner', {}).get('DisplayName')
            
            for bucket in bucket_list:
                bucket_details = {
                    'name': bucket['Name'],
                    'created_at': bucket['CreationDate'].isoformat() if 'CreationDate' in bucket else None,
                    'owner_id': owner_id,
                    'owner_name': owner_name,
                    'is_default': self.default_bucket and self.default_bucket == bucket['Name']
                }
                
                # Try to get the bucket region if we can
                try:
                    region_response = self.s3_client.get_bucket_location(Bucket=bucket['Name'])
                    location = region_response.get('LocationConstraint')
                    # 'None' or 'null' means US East (N. Virginia) - us-east-1
                    bucket_details['region'] = location if location else 'us-east-1'
                except Exception as e:
                    logger.debug(f"Could not get location for bucket {bucket['Name']}: {str(e)}")
                    bucket_details['region'] = 'unknown'
                
                buckets.append(bucket_details)
            
            logger.info(f"Listed {len(buckets)} S3 buckets in {duration:.2f}s")
            return buckets
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_msg = f"Failed to list S3 buckets: {error_code}: {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error listing S3 buckets: {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def create_container(self, container_name: str, region: Optional[str] = None, 
                        acl: Optional[str] = None, tags: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Create a new bucket in AWS S3
        
        Args:
            container_name (str): Name of the bucket to create
            region (Optional[str]): AWS region for the bucket (defaults to account default)
            acl (Optional[str]): Access control policy for the bucket (e.g., 'private', 'public-read')
            tags (Optional[Dict[str, str]]): Tags to apply to the bucket
            
        Returns:
            Dict[str, Any]: Details of the created bucket
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If bucket creation fails
            ValueError: If bucket name is invalid
        """
        # Validate bucket name
        if not container_name:
            raise ValueError("Bucket name cannot be empty")
            
        # AWS S3 bucket naming rules
        if not all(c.islower() or c.isdigit() or c == '-' or c == '.' for c in container_name):
            raise ValueError("Bucket name must contain only lowercase letters, numbers, hyphens, and periods")
            
        if len(container_name) < 3 or len(container_name) > 63:
            raise ValueError("Bucket name must be 3-63 characters long")
            
        if not container_name[0].isalnum():
            raise ValueError("Bucket name must start with a letter or number")
            
        if not container_name[-1].isalnum():
            raise ValueError("Bucket name must end with a letter or number")
            
        if '..' in container_name:
            raise ValueError("Bucket name cannot contain consecutive periods")
            
        if container_name.startswith('xn--'):
            raise ValueError("Bucket name cannot start with 'xn--'")
            
        if container_name.endswith('-s3alias'):
            raise ValueError("Bucket name cannot end with '-s3alias'")
            
        if container_name.startswith('sthree-'):
            raise ValueError("Bucket name cannot start with 'sthree-'")
            
        if container_name.startswith('sthree-configurator'):
            raise ValueError("Bucket name cannot start with 'sthree-configurator'")
            
        if container_name.startswith('aws-'):
            raise ValueError("Bucket name cannot start with 'aws-'")
            
        if container_name.startswith('amzn-'):
            raise ValueError("Bucket name cannot start with 'amzn-'")
            
        try:
            if not self.s3_client:
                logger.debug("No active client for create_container, attempting to connect")
                self.connect()
            
            # Create bucket
            start_time = datetime.now(timezone.utc)
            create_kwargs = {'Bucket': container_name}
            
            # Add location constraint if region is specified (otherwise use account default)
            specified_region = region or self.region_name
            if specified_region and specified_region != 'us-east-1':
                create_kwargs['CreateBucketConfiguration'] = {
                    'LocationConstraint': specified_region
                }
            
            # Add ACL if specified
            if acl:
                create_kwargs['ACL'] = acl
            
            # Create the bucket
            logger.debug(f"Creating S3 bucket '{container_name}' with parameters: {create_kwargs}")
            self.s3_client.create_bucket(**create_kwargs)
            
            # Add tags if specified
            if tags:
                tag_set = [{'Key': k, 'Value': v} for k, v in tags.items()]
                self.s3_client.put_bucket_tagging(
                    Bucket=container_name,
                    Tagging={'TagSet': tag_set}
                )
                logger.debug(f"Added {len(tag_set)} tags to bucket '{container_name}'")
            
            # Check bucket properties
            bucket_data = {
                'name': container_name,
                'created': True,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'region': specified_region or 'us-east-1',
            }
            
            # Try to get the bucket's full details
            try:
                # Add bucket location
                location_response = self.s3_client.get_bucket_location(Bucket=container_name)
                bucket_data['location'] = location_response.get('LocationConstraint') or 'us-east-1'
                
                # Add tags
                if tags:
                    bucket_data['tags'] = tags
                
                # Get ACL
                acl_response = self.s3_client.get_bucket_acl(Bucket=container_name)
                bucket_data['owner'] = acl_response.get('Owner', {}).get('DisplayName', 'Unknown')
                bucket_data['owner_id'] = acl_response.get('Owner', {}).get('ID')
                
                # Get public access block status
                try:
                    pab_response = self.s3_client.get_public_access_block(Bucket=container_name)
                    bucket_data['public_access_block'] = pab_response.get('PublicAccessBlockConfiguration', {})
                except ClientError as e:
                    # This is ok to fail - might not be enabled
                    if e.response['Error']['Code'] != 'NoSuchPublicAccessBlockConfiguration':
                        logger.warning(f"Could not get public access block for bucket {container_name}: {str(e)}")
            except Exception as e:
                logger.warning(f"Failed to get additional details for bucket '{container_name}': {str(e)}")
            
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Created S3 bucket '{container_name}' in {duration:.2f}s")
            
            # Return detailed information about the created bucket
            return bucket_data
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_msg = f"Failed to create S3 bucket '{container_name}': {error_code}: {str(e)}"
            logger.error(error_msg)
            
            if error_code == 'BucketAlreadyExists':
                # Try to get information about the existing bucket
                try:
                    location_response = self.s3_client.get_bucket_location(Bucket=container_name)
                    location = location_response.get('LocationConstraint') or 'us-east-1'
                    
                    return {
                        'name': container_name,
                        'created': False,
                        'exists': True,
                        'region': location,
                        'error': 'Bucket already exists',
                        'error_code': error_code
                    }
                except Exception:
                    return {
                        'name': container_name,
                        'created': False,
                        'exists': True,
                        'error': 'Bucket already exists',
                        'error_code': error_code
                    }
            
            # Re-raise other errors as StorageError
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error creating S3 bucket '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def delete_container(self, container_name: str, force: bool = False) -> Dict[str, Any]:
        """
        Delete a bucket from AWS S3
        
        Args:
            container_name (str): Name of the bucket to delete
            force (bool): If True, will delete all objects in the bucket first
            
        Returns:
            Dict[str, Any]: Results of the deletion operation
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If bucket deletion fails
            ValueError: If bucket name is invalid
        """
        if not container_name:
            raise ValueError("Bucket name cannot be empty")
        
        try:
            if not self.s3_client:
                logger.debug("No active client for delete_container, attempting to connect")
                self.connect()
            
            # Start timer for operation
            start_time = datetime.now(timezone.utc)
            
            # Check if bucket exists first
            try:
                self.s3_client.head_bucket(Bucket=container_name)
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                
                # If bucket doesn't exist or we don't have access, return success with details
                if error_code in ('404', 'NoSuchBucket', '403', 'AccessDenied'):
                    logger.warning(f"Bucket '{container_name}' already doesn't exist or is not accessible: {error_code}")
                    return {
                        'name': container_name,
                        'deleted': False,
                        'exists': False,
                        'error': f"Bucket doesn't exist or is not accessible: {error_code}",
                        'error_code': error_code,
                        'duration': (datetime.now(timezone.utc) - start_time).total_seconds()
                    }
            
            # If force flag is set, delete all objects first
            if force:
                logger.info(f"Force flag set, deleting all objects in bucket '{container_name}'")
                
                # Get bucket using resource API for easier bulk operations
                bucket = self.s3.Bucket(container_name)
                
                # Delete all object versions and delete markers if versioning is enabled
                try:
                    bucket.object_versions.all().delete()
                    logger.debug(f"Deleted all object versions from bucket '{container_name}'")
                except Exception as e:
                    logger.warning(f"Error deleting object versions from bucket '{container_name}': {str(e)}")
                
                # Delete all objects (this will delete objects without versions)
                try:
                    bucket.objects.all().delete()
                    logger.debug(f"Deleted all objects from bucket '{container_name}'")
                except Exception as e:
                    logger.warning(f"Error deleting objects from bucket '{container_name}': {str(e)}")
            
            # Delete the bucket
            logger.debug(f"Deleting bucket '{container_name}'")
            self.s3_client.delete_bucket(Bucket=container_name)
            
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Deleted S3 bucket '{container_name}' in {duration:.2f}s")
            
            return {
                'name': container_name,
                'deleted': True,
                'force_used': force,
                'duration': duration
            }
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_msg = f"Failed to delete S3 bucket '{container_name}': {error_code}: {str(e)}"
            logger.error(error_msg)
            
            # If bucket is not empty and force flag is not set
            if error_code == 'BucketNotEmpty' and not force:
                return {
                    'name': container_name,
                    'deleted': False,
                    'exists': True,
                    'error': 'Bucket is not empty, use force=True to delete all objects first',
                    'error_code': error_code,
                    'duration': (datetime.now(timezone.utc) - start_time).total_seconds()
                }
            
            # For other errors, raise a StorageError
            raise StorageError(error_msg, original_error=e)
            
        except Exception as e:
            error_msg = f"Unexpected error deleting S3 bucket '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    @retry_with_backoff()
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None,
                  delimiter: Optional[str] = None, start_after: Optional[str] = None,
                  include_metadata: bool = False, include_versions: bool = False) -> List[Dict[str, Any]]:
        """
        List objects in an S3 bucket
        
        Args:
            container_name (str): Name of the bucket
            prefix (Optional[str]): Prefix to filter objects by
            limit (Optional[int]): Maximum number of objects to return
            delimiter (Optional[str]): Character used to group keys (e.g., '/' for directory-like listing)
            start_after (Optional[str]): Start listing after this key
            include_metadata (bool): Whether to include object metadata
            include_versions (bool): Whether to include object versions
            
        Returns:
            List[Dict[str, Any]]: List of object details
            
        Raises:
            ConnectionError: If not connected and connection attempt fails
            StorageError: If object listing fails
            ValueError: If bucket name is invalid
        """
        if not container_name:
            raise ValueError("Bucket name cannot be empty")
        
        try:
            if not self.s3_client:
                logger.debug("No active client for list_blobs, attempting to connect")
                self.connect()
            
            # Start timer for operation
            start_time = datetime.now(timezone.utc)
            
            # Prepare parameters for listing objects
            params = {'Bucket': container_name}
            
            if prefix:
                params['Prefix'] = prefix
                
            if delimiter:
                params['Delimiter'] = delimiter
                
            if start_after:
                params['StartAfter'] = start_after
                
            # Use versions if requested
            if include_versions:
                logger.debug(f"Listing object versions in bucket '{container_name}'")
                
                # For versions, we use a different API call
                version_params = params.copy()
                if 'StartAfter' in version_params:
                    # StartAfter not supported in list_object_versions
                    del version_params['StartAfter']
                
                return self._list_object_versions(
                    version_params, 
                    limit=limit, 
                    include_metadata=include_metadata
                )
            
            # For regular listing, use the paginator for better handling of large result sets
            logger.debug(f"Listing objects in bucket '{container_name}' with params: {params}")
            
            # Always use the paginator for consistent handling regardless of limit
            paginator = self.s3_client.get_paginator('list_objects_v2')
            
            # Configure pagination
            pagination_config = {}
            if limit:
                pagination_config['MaxItems'] = limit
            
            # Set page size - AWS default is 1000, but we can adjust for performance
            page_size = min(1000, limit) if limit else 1000
            pagination_config['PageSize'] = page_size
            
            # Get iterator
            pages = paginator.paginate(
                **params, 
                PaginationConfig=pagination_config
            )
            
            # Process results
            result = []
            total_objects = 0
            page_count = 0
            
            # Process each page
            for page in pages:
                page_count += 1
                
                # Handle prefixes/directories if delimiter is specified
                if delimiter and 'CommonPrefixes' in page:
                    for prefix_obj in page.get('CommonPrefixes', []):
                        prefix_key = prefix_obj.get('Prefix')
                        if prefix_key:
                            # This is a "directory" in the hierarchy
                            result.append({
                                'name': prefix_key,
                                'is_prefix': True,
                                'is_directory': True,
                                'size': None,
                                'count': None,  # We don't know how many objects are in this prefix
                                'modified_at': None  # We don't have a modification time for directories
                            })
                            total_objects += 1
                
                # Process actual objects
                for obj in page.get('Contents', []):
                    # Build basic object info
                    object_data = {
                        'name': obj['Key'],
                        'size': obj['Size'],
                        'modified_at': obj['LastModified'].isoformat() if 'LastModified' in obj else None,
                        'etag': obj.get('ETag', '').strip('"') if obj.get('ETag') else None,
                        'storage_class': obj.get('StorageClass'),
                        'is_prefix': False,
                        'is_directory': obj['Key'].endswith('/') and obj['Size'] == 0,
                        'version_id': obj.get('VersionId')
                    }
                    
                    # Add metadata if requested
                    if include_metadata:
                        try:
                            head_response = self.s3_client.head_object(
                                Bucket=container_name, 
                                Key=obj['Key']
                            )
                            # Add metadata
                            object_data['metadata'] = head_response.get('Metadata', {})
                            # Add content type and other useful headers
                            object_data['content_type'] = head_response.get('ContentType')
                            object_data['content_length'] = head_response.get('ContentLength')
                            object_data['cache_control'] = head_response.get('CacheControl')
                            object_data['content_disposition'] = head_response.get('ContentDisposition')
                            object_data['content_encoding'] = head_response.get('ContentEncoding')
                            object_data['content_language'] = head_response.get('ContentLanguage')
                            object_data['expires'] = head_response.get('Expires')
                        except Exception as e:
                            logger.debug(f"Could not get metadata for object {obj['Key']}: {str(e)}")
                    
                    result.append(object_data)
                    total_objects += 1
                
                # Break if we've reached the limit
                if limit and total_objects >= limit:
                    break
            
            # Calculate duration and log summary
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Listed {len(result)} objects from bucket '{container_name}' in {duration:.2f}s (pages: {page_count})")
            
            return result
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            
            if error_code == 'NoSuchBucket':
                error_msg = f"Bucket '{container_name}' not found"
                logger.warning(error_msg)
                return []
            
            error_msg = f"Failed to list objects in bucket '{container_name}': {error_code}: {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
        
        except Exception as e:
            error_msg = f"Unexpected error listing objects in bucket '{container_name}': {str(e)}"
            logger.error(error_msg)
            raise StorageError(error_msg, original_error=e)
    
    def _list_object_versions(self, params: Dict[str, Any], limit: Optional[int] = None, 
                             include_metadata: bool = False) -> List[Dict[str, Any]]:
        """
        Helper method to list object versions
        
        Args:
            params (Dict[str, Any]): Base parameters for the API call
            limit (Optional[int]): Maximum number of objects to return
            include_metadata (bool): Whether to include object metadata
            
        Returns:
            List[Dict[str, Any]]: List of object version details
        """
        bucket_name = params['Bucket']
        start_time = datetime.now(timezone.utc)
        
        # For versions, we use the version-specific paginator
        paginator = self.s3_client.get_paginator('list_object_versions')
        
        # Configure pagination
        pagination_config = {}
        if limit:
            pagination_config['MaxItems'] = limit
        
        # Set page size
        page_size = min(1000, limit) if limit else 1000
        pagination_config['PageSize'] = page_size
        
        # Get iterator
        pages = paginator.paginate(
            **params, 
            PaginationConfig=pagination_config
        )
        
        # Process results
        result = []
        total_objects = 0
        page_count = 0
        
        # Process each page
        for page in pages:
            page_count += 1
            
            # Handle prefixes/directories if delimiter is specified
            if 'CommonPrefixes' in page:
                for prefix_obj in page.get('CommonPrefixes', []):
                    prefix_key = prefix_obj.get('Prefix')
                    if prefix_key:
                        result.append({
                            'name': prefix_key,
                            'is_prefix': True,
                            'is_directory': True,
                            'size': None,
                            'version_id': None,
                            'is_latest': True
                        })
                        total_objects += 1
            
            # Process versions
            for version in page.get('Versions', []):
                version_data = {
                    'name': version['Key'],
                    'size': version['Size'],
                    'modified_at': version['LastModified'].isoformat() if 'LastModified' in version else None,
                    'etag': version.get('ETag', '').strip('"') if version.get('ETag') else None,
                    'storage_class': version.get('StorageClass'),
                    'version_id': version.get('VersionId'),
                    'is_latest': version.get('IsLatest', False),
                    'is_delete_marker': False,
                    'is_prefix': False,
                    'is_directory': version['Key'].endswith('/') and version['Size'] == 0,
                }
                
                # Add metadata if requested
                if include_metadata:
                    try:
                        head_response = self.s3_client.head_object(
                            Bucket=bucket_name, 
                            Key=version['Key'],
                            VersionId=version.get('VersionId')
                        )
                        version_data['metadata'] = head_response.get('Metadata', {})
                        version_data['content_type'] = head_response.get('ContentType')
                    except Exception as e:
                        logger.debug(f"Could not get metadata for object {version['Key']} (version {version.get('VersionId')}): {str(e)}")
                
                result.append(version_data)
                total_objects += 1
            
            # Process delete markers
            for marker in page.get('DeleteMarkers', []):
                marker_data = {
                    'name': marker['Key'],
                    'size': 0,
                    'modified_at': marker['LastModified'].isoformat() if 'LastModified' in marker else None,
                    'version_id': marker.get('VersionId'),
                    'is_latest': marker.get('IsLatest', False),
                    'is_delete_marker': True,
                    'is_prefix': False,
                    'is_directory': False,
                }
                
                result.append(marker_data)
                total_objects += 1
            
            # Break if we've reached the limit
            if limit and total_objects >= limit:
                break
        
        # Sort by name and version (latest first)
        result.sort(key=lambda x: (x['name'], not x.get('is_latest', False)))
        
        # Calculate duration and log summary
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        logger.info(f"Listed {len(result)} object versions from bucket '{bucket_name}' in {duration:.2f}s (pages: {page_count})")
        
        return result
    
    def upload_blob(self, container_name: str, blob_name: str, data: Union[bytes, BinaryIO, str], content_type: Optional[str] = None) -> Dict[str, Any]:
        """Upload an object to an S3 bucket"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return {'status': 'error', 'message': 'Failed to connect to S3'}
            
            # Prepare parameters
            params = {
                'Bucket': container_name,
                'Key': blob_name
            }
            
            # Add content type if provided
            if content_type:
                params['ContentType'] = content_type
            
            # Handle different data types
            if isinstance(data, bytes):
                params['Body'] = data
            elif hasattr(data, 'read'):  # File-like object
                params['Body'] = data
            elif isinstance(data, str):
                params['Body'] = data.encode('utf-8')
            else:
                raise ValueError(f"Unsupported data type: {type(data)}")
            
            # Upload the object
            response = self.s3_client.put_object(**params)
            
            return {
                'status': 'success',
                'message': 'Object uploaded successfully',
                'etag': response.get('ETag', '').strip('"'),
                'version_id': response.get('VersionId')
            }
            
        except Exception as e:
            logger.error(f"Failed to upload object '{blob_name}' to S3 bucket '{container_name}': {str(e)}")
            return {
                'status': 'error',
                'message': f'Upload failed: {str(e)}'
            }
    
    def download_blob(self, container_name: str, blob_name: str) -> Union[bytes, None]:
        """Download an object from an S3 bucket"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return None
            
            # Get the object
            response = self.s3_client.get_object(
                Bucket=container_name,
                Key=blob_name
            )
            
            # Read the object content
            return response['Body'].read()
            
        except botocore.exceptions.ClientError as e:
            error_code = e.response.get('Error', {}).get('Code')
            
            if error_code == 'NoSuchKey':
                logger.warning(f"Object '{blob_name}' not found in S3 bucket '{container_name}'")
            else:
                logger.error(f"Failed to download object '{blob_name}' from S3 bucket '{container_name}': {str(e)}")
            
            return None
        except Exception as e:
            logger.error(f"Failed to download object '{blob_name}' from S3 bucket '{container_name}': {str(e)}")
            return None
    
    def delete_blob(self, container_name: str, blob_name: str) -> bool:
        """Delete an object from an S3 bucket"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return False
            
            # Delete the object
            self.s3_client.delete_object(
                Bucket=container_name,
                Key=blob_name
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete object '{blob_name}' from S3 bucket '{container_name}': {str(e)}")
            return False
    
    def get_blob_properties(self, container_name: str, blob_name: str) -> Dict[str, Any]:
        """Get properties of an S3 object"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return {}
            
            # Get the object head
            response = self.s3_client.head_object(
                Bucket=container_name,
                Key=blob_name
            )
            
            # Extract properties
            properties = {
                'size': response.get('ContentLength'),
                'content_type': response.get('ContentType'),
                'etag': response.get('ETag', '').strip('"'),
                'modified_at': response.get('LastModified').isoformat() if 'LastModified' in response else None,
                'storage_class': response.get('StorageClass')
            }
            
            # Add metadata if present
            metadata = response.get('Metadata')
            if metadata:
                properties['metadata'] = metadata
            
            return properties
            
        except botocore.exceptions.ClientError as e:
            error_code = e.response.get('Error', {}).get('Code')
            
            if error_code == 'NoSuchKey':
                logger.warning(f"Object '{blob_name}' not found in S3 bucket '{container_name}'")
            else:
                logger.error(f"Failed to get properties for object '{blob_name}' in S3 bucket '{container_name}': {str(e)}")
            
            return {}
        except Exception as e:
            logger.error(f"Failed to get properties for object '{blob_name}' in S3 bucket '{container_name}': {str(e)}")
            return {}
    
    def get_blob_url(self, container_name: str, blob_name: str, expiry_hours: int = 1) -> str:
        """Get a presigned URL for accessing an S3 object"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return ''
            
            # Create a presigned URL
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': container_name,
                    'Key': blob_name
                },
                ExpiresIn=expiry_hours * 3600
            )
            
            return url
            
        except Exception as e:
            logger.error(f"Failed to create presigned URL for object '{blob_name}' in S3 bucket '{container_name}': {str(e)}")
            return ''
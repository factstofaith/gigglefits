"""
AWS S3 Storage Connector Implementation

This module implements the StorageConnector interface for AWS S3.
"""

import os
import io
import logging
from typing import Dict, Any, Optional, List, Union, BinaryIO
import boto3
import botocore.exceptions
from .storage_connector import StorageConnector

logger = logging.getLogger(__name__)


class S3Connector(StorageConnector):
    """AWS S3 storage connector implementation"""
    
    def __init__(self, 
                 aws_access_key_id: Optional[str] = None,
                 aws_secret_access_key: Optional[str] = None,
                 region_name: Optional[str] = None,
                 endpoint_url: Optional[str] = None,
                 use_ssl: bool = True,
                 verify: bool = True,
                 profile_name: Optional[str] = None,
                 role_arn: Optional[str] = None,
                 session_name: str = 'S3ConnectorSession'):
        """
        Initialize the S3 connector
        
        Args:
            aws_access_key_id: AWS access key ID
            aws_secret_access_key: AWS secret access key
            region_name: AWS region name
            endpoint_url: Custom endpoint URL (for S3-compatible storage)
            use_ssl: Whether to use SSL
            verify: Whether to verify SSL certificates
            profile_name: AWS profile name to use
            role_arn: ARN of role to assume
            session_name: Session name for assumed role
        """
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key
        self.region_name = region_name
        self.endpoint_url = endpoint_url
        self.use_ssl = use_ssl
        self.verify = verify
        self.profile_name = profile_name
        self.role_arn = role_arn
        self.session_name = session_name
        
        self.s3 = None
        self.s3_client = None
    
    def connect(self) -> bool:
        """Establish a connection to AWS S3"""
        try:
            # Create session
            session_kwargs = {}
            
            if self.profile_name:
                session_kwargs['profile_name'] = self.profile_name
            elif self.aws_access_key_id and self.aws_secret_access_key:
                session_kwargs['aws_access_key_id'] = self.aws_access_key_id
                session_kwargs['aws_secret_access_key'] = self.aws_secret_access_key
            
            if self.region_name:
                session_kwargs['region_name'] = self.region_name
            
            session = boto3.Session(**session_kwargs)
            
            # Assume role if specified
            if self.role_arn:
                sts_client = session.client('sts')
                response = sts_client.assume_role(
                    RoleArn=self.role_arn,
                    RoleSessionName=self.session_name
                )
                
                # Create new session with temporary credentials
                credentials = response['Credentials']
                session = boto3.Session(
                    aws_access_key_id=credentials['AccessKeyId'],
                    aws_secret_access_key=credentials['SecretAccessKey'],
                    aws_session_token=credentials['SessionToken'],
                    region_name=self.region_name
                )
            
            # Create S3 resource and client
            client_kwargs = {}
            
            if self.endpoint_url:
                client_kwargs['endpoint_url'] = self.endpoint_url
            
            client_kwargs['use_ssl'] = self.use_ssl
            client_kwargs['verify'] = self.verify
            
            self.s3 = session.resource('s3', **client_kwargs)
            self.s3_client = session.client('s3', **client_kwargs)
            
            # Test connection
            self.s3_client.list_buckets()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to S3: {str(e)}")
            self.s3 = None
            self.s3_client = None
            return False
    
    def disconnect(self) -> bool:
        """Close the connection to AWS S3"""
        # No explicit disconnection needed for S3
        self.s3 = None
        self.s3_client = None
        return True
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the connection to AWS S3"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return {
                        'status': 'error',
                        'message': 'Failed to connect to S3'
                    }
            
            # List buckets to test connection
            response = self.s3_client.list_buckets()
            bucket_count = len(response.get('Buckets', []))
            
            return {
                'status': 'success',
                'message': f'Connection successful. Found {bucket_count} bucket(s).',
                'buckets': bucket_count
            }
            
        except Exception as e:
            logger.error(f"S3 connection test failed: {str(e)}")
            return {
                'status': 'error',
                'message': f'Connection failed: {str(e)}'
            }
    
    def list_containers(self) -> List[Dict[str, Any]]:
        """List available buckets in AWS S3"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return []
            
            response = self.s3_client.list_buckets()
            
            return [
                {
                    'name': bucket['Name'],
                    'created_at': bucket['CreationDate'].isoformat() if 'CreationDate' in bucket else None
                }
                for bucket in response.get('Buckets', [])
            ]
            
        except Exception as e:
            logger.error(f"Failed to list S3 buckets: {str(e)}")
            return []
    
    def create_container(self, container_name: str) -> bool:
        """Create a new bucket in AWS S3"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return False
            
            # Create bucket
            create_kwargs = {'Bucket': container_name}
            
            # Add location constraint if region is specified (and not us-east-1)
            if self.region_name and self.region_name != 'us-east-1':
                create_kwargs['CreateBucketConfiguration'] = {
                    'LocationConstraint': self.region_name
                }
            
            self.s3_client.create_bucket(**create_kwargs)
            return True
            
        except Exception as e:
            logger.error(f"Failed to create S3 bucket '{container_name}': {str(e)}")
            return False
    
    def delete_container(self, container_name: str) -> bool:
        """Delete a bucket from AWS S3"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return False
            
            # Get bucket
            bucket = self.s3.Bucket(container_name)
            
            # Delete all objects first
            bucket.objects.all().delete()
            
            # Delete bucket
            bucket.delete()
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete S3 bucket '{container_name}': {str(e)}")
            return False
    
    def list_blobs(self, container_name: str, prefix: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """List objects in an S3 bucket"""
        try:
            if not self.s3_client:
                success = self.connect()
                if not success:
                    return []
            
            # Prepare parameters
            params = {'Bucket': container_name}
            
            if prefix:
                params['Prefix'] = prefix
            
            if limit:
                paginator = self.s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(**params, PaginationConfig={'MaxItems': limit})
                
                result = []
                for page in pages:
                    for obj in page.get('Contents', []):
                        result.append({
                            'name': obj['Key'],
                            'size': obj['Size'],
                            'modified_at': obj['LastModified'].isoformat() if 'LastModified' in obj else None,
                            'etag': obj.get('ETag', '').strip('"'),
                            'storage_class': obj.get('StorageClass')
                        })
                        
                        if len(result) >= limit:
                            break
                    
                    if len(result) >= limit:
                        break
                
                return result
            else:
                # No limit, get all objects
                response = self.s3_client.list_objects_v2(**params)
                
                return [
                    {
                        'name': obj['Key'],
                        'size': obj['Size'],
                        'modified_at': obj['LastModified'].isoformat() if 'LastModified' in obj else None,
                        'etag': obj.get('ETag', '').strip('"'),
                        'storage_class': obj.get('StorageClass')
                    }
                    for obj in response.get('Contents', [])
                ]
                
        except Exception as e:
            logger.error(f"Failed to list objects in S3 bucket '{container_name}': {str(e)}")
            return []
    
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
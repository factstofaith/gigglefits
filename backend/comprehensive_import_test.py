try:
    import main
    print("Main module imported successfully")
except Exception as e:
    error_message = str(e)
    print(f"Error level 1: {error_message}")
    import traceback
    traceback.print_exc()
    # Try to import with more granularity to identify specific issues
    try:
        import logging
        print("Logging imported successfully")
        from core.config_factory import ConfigFactory
        print("ConfigFactory imported successfully")
        settings = ConfigFactory.get_config()
        print("Settings loaded successfully")
        
        try:
            from db.base import Base
            print("Base imported successfully")
        except Exception as e:
            print(f"Error importing Base: {e}")
            traceback.print_exc()
            
        try:
            from utils.encryption.crypto import EncryptedString, EncryptedJSON
            print("EncryptedString, EncryptedJSON imported successfully")
        except Exception as e:
            print(f"Error importing encryption: {e}")
            traceback.print_exc()
            
        try:
            from utils.helpers import generate_uid
            print("generate_uid imported successfully")
        except Exception as e:
            print(f"Error importing helpers: {e}")
            traceback.print_exc()
            
        try:
            from utils.error_handling.exceptions import ValidationError
            print("ValidationError imported successfully")
        except Exception as e:
            print(f"Error importing ValidationError: {e}")
            traceback.print_exc()
            
        try:
            from utils.db.optimization import ConnectionPoolManager
            print("ConnectionPoolManager imported successfully")
        except Exception as e:
            print(f"Error importing ConnectionPoolManager: {e}")
            traceback.print_exc()
            
        try:
            from db.models import User, UserRole, UserAccountStatus
            print("Models imported successfully")
        except Exception as e:
            print(f"Error importing models: {e}")
            traceback.print_exc()
    except Exception as e:
        print(f"Error level 2: {e}")
        traceback.print_exc()

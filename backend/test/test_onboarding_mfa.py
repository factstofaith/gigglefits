"""
Integration Tests for MFA setup during user onboarding.

This test suite verifies that MFA is properly set up during the user onboarding process,
either through regular invitation acceptance or OAuth authentication.
"""

import pytest
import uuid
import pyotp
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session

from backend.db.models import User, Invitation, MFARecoveryCode
from backend.modules.users.service import InvitationService, UserService, MFAService, AuthService
from backend.modules.users.models import (
    InvitationCreate,
    UserCreate,
    MFAEnrollment,
    MFAVerification,
    OAuthAuthorizationResponse
)


class TestMFAOnboarding:
    """Test MFA setup during user onboarding process."""

    @pytest.fixture
    def test_invitation(self, db: Session):
        """Create a test invitation."""
        # Create invitation for testing
        invitation = Invitation(
            id=uuid.uuid4(),
            email="mfa_onboarding@example.com",
            role="USER",
            status="PENDING",
            token=str(uuid.uuid4()),
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=1),
            created_by=uuid.uuid4()
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
        return invitation

    @pytest.fixture
    def invitation_service(self, db: Session):
        """Create an invitation service instance for testing."""
        return InvitationService(db)

    @pytest.fixture
    def user_service(self, db: Session):
        """Create a user service instance for testing."""
        return UserService(db)

    @pytest.fixture
    def mfa_service(self, db: Session):
        """Create an MFA service instance for testing."""
        return MFAService(db)

    def test_mfa_onboarding_after_invitation_acceptance(self, invitation_service, mfa_service, test_invitation, db: Session):
        """Test MFA setup during onboarding after invitation acceptance."""
        # Step 1: User accepts invitation
        user_data = UserCreate(
            full_name="MFA Onboarding User",
            password="SecurePassword123!",
            client_company="Test Company"
        )
        
        user = invitation_service.accept_invitation(
            token=test_invitation.token,
            user_data=user_data
        )
        
        # Verify user is created but MFA not yet enabled
        assert user.mfa_enabled == False
        
        # Step 2: User initiates MFA enrollment
        enrollment = mfa_service.initiate_enrollment(user.id)
        assert enrollment.secret is not None
        assert enrollment.qr_code is not None
        
        # Step 3: User sets up authenticator app and confirms code
        totp = pyotp.TOTP(enrollment.secret)
        valid_code = totp.now()
        
        verification_result = mfa_service.verify_enrollment(
            user_id=user.id,
            code=valid_code,
            secret=enrollment.secret
        )
        
        # Step 4: Verify MFA is now enabled
        assert verification_result.success == True
        
        # Recovery codes should be generated
        assert verification_result.recovery_codes is not None
        assert len(verification_result.recovery_codes) == 10
        
        # User should now have MFA enabled
        db.refresh(user)
        assert user.mfa_enabled == True
        
        # Recovery codes should be stored in the database
        recovery_codes = db.query(MFARecoveryCode).filter(
            MFARecoveryCode.user_id == user.id
        ).all()
        assert len(recovery_codes) == 10

    @patch('backend.adapters.auth_module.Office365OAuth2Authentication')
    def test_mfa_onboarding_after_oauth_authentication(self, mock_oauth, invitation_service, mfa_service, test_invitation, db: Session):
        """Test MFA setup during onboarding after OAuth authentication."""
        # Arrange OAuth mocking
        mock_instance = MagicMock()
        mock_oauth.return_value = mock_instance
        mock_instance.exchange_code_for_token.return_value = True
        mock_instance.token = {
            "access_token": "access_token_value",
            "refresh_token": "refresh_token_value",
            "id_token": "id_token_value",
            "received_at": datetime.now().timestamp(),
            "expires_in": 3600
        }
        
        # Step 1: User logs in with OAuth
        callback_data = OAuthAuthorizationResponse(
            code="auth_code_123",
            state=f"{test_invitation.token}_random",
            provider="office365"
        )
        
        # Mock user data extraction
        with patch.object(invitation_service, '_extract_user_data_from_token', return_value={
            "full_name": "OAuth MFA User",
            "email": test_invitation.email,
            "client_company": "Test Corp"
        }):
            # Complete OAuth login
            result = invitation_service.complete_oauth_authentication(callback_data)
            assert result.user_id is not None
            
            # Get the created user
            user = db.query(User).filter(User.email == test_invitation.email).first()
            assert user is not None
            
            # Verify MFA is not yet enabled
            assert user.mfa_enabled == False
        
        # Step 2: User initiates MFA enrollment
        enrollment = mfa_service.initiate_enrollment(user.id)
        assert enrollment.secret is not None
        assert enrollment.qr_code is not None
        
        # Step 3: User sets up authenticator app and confirms code
        totp = pyotp.TOTP(enrollment.secret)
        valid_code = totp.now()
        
        verification_result = mfa_service.verify_enrollment(
            user_id=user.id,
            code=valid_code,
            secret=enrollment.secret
        )
        
        # Step 4: Verify MFA is now enabled
        assert verification_result.success == True
        
        # User should now have MFA enabled
        db.refresh(user)
        assert user.mfa_enabled == True


class TestEndToEndMFAOnboardingWorkflow:
    """
    End-to-end test of the complete MFA onboarding workflow.
    
    This test simulates the full user journey from invitation to MFA setup.
    """
    
    def test_end_to_end_onboarding_with_mfa(self, db: Session):
        """Test the complete user onboarding flow with MFA setup."""
        # Setup services
        invitation_service = InvitationService(db)
        user_service = UserService(db)
        mfa_service = MFAService(db)
        auth_service = AuthService(db)
        
        # Step 1: Create an admin user
        admin = User(
            id=uuid.uuid4(),
            email="onboarding_admin@example.com",
            hashed_password="hashed_password",
            full_name="Onboarding Admin",
            role="ADMIN",
            account_status="ACTIVE"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        # Step 2: Admin creates an invitation
        invitation_data = InvitationCreate(
            email="new_onboarding@example.com",
            role="USER",
            expiration_hours=48,
            custom_message="Please complete registration with MFA setup"
        )
        
        invitation = invitation_service.create_invitation(
            invitation_data=invitation_data,
            created_by=admin.id
        )
        
        # Step 3: User receives email and accepts invitation
        user_data = UserCreate(
            full_name="Onboarding Flow User",
            password="StrongPassword123!",
            client_company="Test Corporation",
            position="Engineer",
            department="IT"
        )
        
        user = invitation_service.accept_invitation(
            token=invitation.token,
            user_data=user_data
        )
        
        # Step 4: User begins MFA enrollment
        enrollment = mfa_service.initiate_enrollment(user.id)
        
        # Step 5: User sets up authenticator app (simulated)
        totp = pyotp.TOTP(enrollment.secret)
        valid_code = totp.now()
        
        # Step 6: User verifies code from authenticator app
        verification_result = mfa_service.verify_enrollment(
            user_id=user.id,
            code=valid_code,
            secret=enrollment.secret
        )
        
        # Step 7: User receives recovery codes
        assert verification_result.success == True
        recovery_codes = verification_result.recovery_codes
        assert len(recovery_codes) >= 10
        sample_recovery_code = recovery_codes[0]
        
        # Step 8: Verify MFA is enabled
        db.refresh(user)
        assert user.mfa_enabled == True
        
        # Step 9: User logs out and logs back in (simulate login)
        # Mock password validation
        auth_service.validate_password = lambda user, password: True
        
        login_request = auth_service.authenticate_by_email(
            email=user.email,
            password="password_sim"  # Doesn't matter as we mocked validation
        )
        
        # Step 10: Verify MFA is required for login
        assert login_request.requires_mfa == True
        assert login_request.user_id == user.id
        
        # Step 11: User provides MFA code
        mfa_verification = MFAVerification(
            user_id=user.id,
            code=totp.now()  # Get current code
        )
        
        # Step 12: User completes login with MFA
        complete_login = auth_service.complete_authentication(mfa_verification)
        assert complete_login.access_token is not None
        
        # Step 13: Simulate lost phone scenario, user logs in with recovery code
        recovery_login = auth_service.authenticate_by_email(
            email=user.email,
            password="password_sim"
        )
        
        assert recovery_login.requires_mfa == True
        
        # Step 14: User provides recovery code instead of MFA code
        recovery_result = mfa_service.verify_recovery_code(
            user_id=user.id,
            recovery_code=sample_recovery_code
        )
        
        assert recovery_result.success == True
        
        # Verify recovery code is now marked as used
        used_code = db.query(MFARecoveryCode).filter(
            MFARecoveryCode.user_id == user.id,
            MFARecoveryCode.code == sample_recovery_code
        ).first()
        
        assert used_code.used == True
        
        # Complete workflow succeeded
        print("End-to-end MFA onboarding workflow test completed successfully")
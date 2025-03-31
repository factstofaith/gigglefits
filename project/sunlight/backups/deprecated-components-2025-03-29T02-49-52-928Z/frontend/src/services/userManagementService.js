/**
 * User Management Service
 * 
 * Provides API calls for the User Invitation System, including:
 * - Invitation management
 * - User management
 * - MFA
 * - Email configuration
 * - OAuth integration
 */

import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

// Add auth token to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Invitation Management Service
 */
export const invitationService = {
  // Create a new invitation
  createInvitation: (invitationData) => 
    axios.post(`${API_URL}/admin/invitations`, invitationData),
  
  // Get list of invitations with optional filtering
  getInvitations: (filters = {}) => 
    axios.get(`${API_URL}/admin/invitations`, { params: filters }),
  
  // Get invitation details by ID
  getInvitation: (id) => 
    axios.get(`${API_URL}/admin/invitations/${id}`),
  
  // Cancel an invitation
  cancelInvitation: (id) => 
    axios.delete(`${API_URL}/admin/invitations/${id}`),
  
  // Resend an invitation
  resendInvitation: (id) => 
    axios.post(`${API_URL}/admin/invitations/${id}/resend`),
  
  // Verify an invitation token (public endpoint)
  verifyInvitation: (token) => 
    axios.get(`${API_URL}/invitations/verify/${token}`),
  
  // Accept an invitation and create a user account
  acceptInvitation: (data) => 
    axios.post(`${API_URL}/invitations/accept`, data),
    
  // Get Office 365 OAuth authorization URL
  getOffice365AuthUrl: (token) => 
    axios.get(`${API_URL}/invitations/oauth/office365/url`, { params: { token } }),
    
  // Get Gmail OAuth authorization URL
  getGmailAuthUrl: (token) => 
    axios.get(`${API_URL}/invitations/oauth/gmail/url`, { params: { token } }),
    
  // Complete OAuth authentication with authorization code
  completeOAuthAuthentication: (provider, code, token, state) => 
    axios.post(`${API_URL}/invitations/oauth/${provider}/callback`, { code, token, state }),
};

/**
 * MFA Service
 */
export const mfaService = {
  // Begin MFA enrollment process
  enrollMFA: () => 
    axios.post(`${API_URL}/users/mfa/enroll`),
  
  // Verify MFA code and complete enrollment
  verifyMFA: (code) => 
    axios.post(`${API_URL}/users/mfa/verify`, { code }),
  
  // Get current MFA status
  getMFAStatus: () => 
    axios.get(`${API_URL}/users/mfa/status`),
  
  // Get recovery codes
  getRecoveryCodes: () => 
    axios.get(`${API_URL}/users/mfa/recovery-codes`),
  
  // Regenerate recovery codes
  regenerateRecoveryCodes: () => 
    axios.post(`${API_URL}/users/mfa/recovery-codes/regenerate`),
  
  // Disable MFA
  disableMFA: () => 
    axios.post(`${API_URL}/users/mfa/disable`),
  
  // Reset MFA for a user (admin only)
  resetUserMFA: (userId) => 
    axios.post(`${API_URL}/admin/users/${userId}/mfa/reset`),
  
  // Get MFA settings (admin only)
  getMFASettings: () => 
    axios.get(`${API_URL}/admin/mfa/settings`),
  
  // Update MFA settings (admin only)
  updateMFASettings: (settingsData) => 
    axios.put(`${API_URL}/admin/mfa/settings`, settingsData),
};

/**
 * User Management Service
 */
export const userService = {
  // Get list of users with optional filtering (admin only)
  getUsers: (filters = {}) => 
    axios.get(`${API_URL}/admin/users`, { params: filters }),
  
  // Get user details by ID (admin or self)
  getUser: (userId) => 
    axios.get(`${API_URL}/admin/users/${userId}`),
  
  // Get current user profile
  getUserProfile: () => 
    axios.get(`${API_URL}/users/profile`),
  
  // Update current user profile
  updateUserProfile: (profileData) => 
    axios.put(`${API_URL}/users/profile`, profileData),
  
  // Update user status (admin only)
  updateUserStatus: (userId, status) => 
    axios.patch(`${API_URL}/admin/users/${userId}/status`, { status }),
  
  // Delete user (admin only)
  deleteUser: (userId) => 
    axios.delete(`${API_URL}/admin/users/${userId}`),
  
  // Get login history for user (admin or self)
  getLoginHistory: (userId, params = {}) => 
    axios.get(`${API_URL}/users/${userId}/login-history`, { params }),
};

/**
 * Email Configuration Service
 */
export const emailConfigService = {
  // Get email configuration (admin only)
  getEmailConfig: () => 
    axios.get(`${API_URL}/admin/email/config`),
  
  // Update email configuration (admin only)
  updateEmailConfig: (configData) => 
    axios.put(`${API_URL}/admin/email/config`, configData),
  
  // Send test email (admin only)
  sendTestEmail: (recipient) => 
    axios.post(`${API_URL}/admin/email/test`, { recipient }),
};

// Export all services
export default {
  invitation: invitationService,
  mfa: mfaService,
  user: userService,
  emailConfig: emailConfigService,
};
// TestUserProfile.jsx
// A standalone version of the UserProfile component for testing without Material UI or other dependencies

import React, { useState } from 'react';
import Avatar from './TestAvatarLegacy';

/**
 * A simplified implementation of UserProfile for testing purposes
 */
const TestUserProfile = ({ user = null, onSave = () => {
  // Added display name
  TestUserProfile.displayName = 'TestUserProfile';

  // Added display name
  TestUserProfile.displayName = 'TestUserProfile';

  // Added display name
  TestUserProfile.displayName = 'TestUserProfile';

  // Added display name
  TestUserProfile.displayName = 'TestUserProfile';

  // Added display name
  TestUserProfile.displayName = 'TestUserProfile';

} }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({
    name: user?.name || 'Test User',
    email: user?.email || 'test@example.com',
    jobTitle: user?.jobTitle || 'Developer',
    role: user?.role || 'user',
  });

  return (
    <div className="user-profile&quot; data-testid="user-profile">
      <div className="user-profile-header&quot; data-testid="user-profile-header">
        <h2>User Profile</h2>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="user-profile-content&quot;>
        <div className="user-avatar-section" data-testid="user-avatar-section">
          <AvatarLegacy
            className="user-avatar&quot;
            style={{ width: "100px', height: '100px' }}
            data-testid="user-avatar"
          >
            {profile.name?.charAt(0) || 'U'}
          </AvatarLegacy>
          <h3>{profile.name}</h3>
          <p>{profile.email}</p>
          {profile.role === 'admin' && (
            <span className="admin-badge&quot; data-testid="admin-badge">
              Admin
            </span>
          )}
          <button className="change-picture-btn&quot; data-testid="change-picture-btn">
            Change Picture
          </button>
        </div>

        <div className="user-details-section&quot;>
          <div className="tab-navigation" data-testid="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              data-testid="general-tab"
            >
              General
            </button>
            <button
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
              data-testid="notifications-tab"
            >
              Notifications
            </button>
            <button
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
              data-testid="security-tab"
            >
              Security
            </button>
          </div>

          {activeTab === 'general' && (
            <div className="general-tab-content&quot; data-testid="general-tab-content">
              <div className="form-field&quot;>
                <label htmlFor="name">Name</label>
                <input
                  id="name&quot;
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  data-testid="name-input"
                />
              </div>
              <div className="form-field&quot;>
                <label htmlFor="email">Email</label>
                <input
                  id="email&quot;
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  data-testid="email-input"
                />
              </div>
              <div className="form-field&quot;>
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  id="jobTitle&quot;
                  type="text"
                  value={profile.jobTitle}
                  onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                  data-testid="job-title-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-tab-content&quot; data-testid="notifications-tab-content">
              <h3>Notification Preferences</h3>
              <div className="form-field&quot;>
                <label>
                  <input
                    type="checkbox"
                    defaultChecked
                    data-testid="email-notifications-checkbox"
                  />
                  Email Notifications
                </label>
              </div>
              <div className="form-field&quot;>
                <label>
                  <input type="checkbox" defaultChecked data-testid="integration-alerts-checkbox" />
                  Integration Run Alerts
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-tab-content&quot; data-testid="security-tab-content">
              <h3>Password Settings</h3>
              <div className="form-field&quot;>
                <label htmlFor="current-password">Current Password</label>
                <input id="current-password&quot; type="password" data-testid="current-password-input" />
              </div>
              <div className="form-field&quot;>
                <label htmlFor="new-password">New Password</label>
                <input id="new-password&quot; type="password" data-testid="new-password-input" />
              </div>
            </div>
          )}

          <div className="form-actions&quot;>
            <button
              className="save-button"
              onClick={() => onSave(profile)}
              data-testid="save-button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUserProfile;

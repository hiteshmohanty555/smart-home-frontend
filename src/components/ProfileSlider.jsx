import React, { useState } from 'react';
import { createProfile, uploadProfilePhoto, setActiveProfile, API_BASE } from '../api';
import '../App.css';

const ProfileSlider = ({ user, profiles, isOpen, onClose, token, onProfileCreated, selectedProfile, onProfileSelect }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    backgroundPreference: '#ffffff',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfile({ ...newProfile, photo: file });
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim()) {
      setError('Profile name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let photoPath = null;

      // Upload photo if provided
      if (newProfile.photo) {
        const uploadResult = await uploadProfilePhoto(token, newProfile.photo);
        photoPath = uploadResult.photoPath;
      }

      // Create profile
      const profileData = {
        name: newProfile.name,
        backgroundPreference: newProfile.backgroundPreference,
        photo: photoPath
      };

      const result = await createProfile(token, profileData);

      if (result.success && onProfileCreated) {
        onProfileCreated(result.profile);
        setShowCreateForm(false);
        setNewProfile({ name: '', backgroundPreference: '#ffffff', photo: null });
        setPhotoPreview(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewProfile({ name: '', backgroundPreference: '#ffffff', photo: null });
    setPhotoPreview(null);
    setError('');
  };

  return (
    <div className="profile-slider-overlay" onClick={onClose}>
      <div className="profile-slider" onClick={(e) => e.stopPropagation()}>
        <div className="profile-slider-header">
          <h2 className="profile-slider-title">👤 User Profile</h2>
          <button className="profile-slider-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-slider-content">
          {/* User Information Section */}
          <div className="profile-section">
            <h3 className="profile-section-title">📋 Personal Information</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user?.phone || 'N/A'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{user?.address || 'N/A'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Profiles Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">🎨 Profiles ({profiles?.length || 0})</h3>
              <button
                className="create-profile-btn"
                onClick={() => setShowCreateForm(true)}
              >
                + Create Profile
              </button>
            </div>
            {profiles && profiles.length > 0 ? (
              <div className="profiles-list">
                {profiles.map((profile, index) => {
                  const isSelected = selectedProfile && selectedProfile._id === profile._id;
                  return (
                    <div
                      key={profile._id || index}
                      className={`profile-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onProfileSelect && onProfileSelect(profile)}
                      style={{ cursor: onProfileSelect ? 'pointer' : 'default' }}
                    >
                      <div className="profile-item-header">
                        <div className="profile-avatar-container">
                          {profile.photo ? (
                            <img
                              src={`${API_BASE}${profile.photo}`}
                              alt={profile.name}
                              className="profile-avatar-small"
                            />
                          ) : (
                            <div className="profile-avatar-placeholder-small">
                              <span className="avatar-icon-small">👤</span>
                            </div>
                          )}
                          <div className="profile-info">
                            <span className="profile-name">{profile.name}</span>
                            {profile.isDefault && <span className="default-badge">Default</span>}
                          </div>
                        </div>
                        <div
                          className="profile-color-preview"
                          style={{ backgroundColor: profile.backgroundPreference }}
                          title={profile.backgroundPreference}
                        />
                        {isSelected && <span className="selected-indicator">✓ Active</span>}
                      </div>
                      <div className="profile-item-details">
                        <small className="profile-created">
                          Created: {formatDate(profile.createdAt)}
                        </small>
                        {onProfileSelect && (
                          <button
                            className="select-profile-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onProfileSelect(profile);
                            }}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-profiles">
                <p>No profiles created yet.</p>
                <small>You can create profiles to customize your dashboard appearance.</small>
              </div>
            )}
          </div>

          {/* Create Profile Form */}
          {showCreateForm && (
            <div className="create-profile-form">
              <h3 className="form-title">Create New Profile</h3>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Profile Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="Enter profile name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Background Color</label>
                <input
                  type="color"
                  className="form-color-input"
                  value={newProfile.backgroundPreference}
                  onChange={(e) => setNewProfile({ ...newProfile, backgroundPreference: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <input
                  type="file"
                  className="form-file-input"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Preview" className="preview-image" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  className="form-btn secondary"
                  onClick={handleCancelCreate}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="form-btn primary"
                  onClick={handleCreateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Account Statistics */}
          <div className="profile-section">
            <h3 className="profile-section-title">📊 Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{profiles?.length || 0}</span>
                <span className="stat-label">Profiles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                </span>
                <span className="stat-label">Days Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">Premium</span>
                <span className="stat-label">Account Type</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-slider-footer">
          <button className="profile-slider-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSlider;

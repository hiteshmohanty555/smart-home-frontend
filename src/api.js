// frontend/src/api.js
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function getStatus() {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postLight(status) {
  await fetch(`${API_BASE}/api/light`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function postFan(speed) {
  await fetch(`${API_BASE}/api/fan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ speed }),
  });
}

// at bottom of file (or add these exports)
export async function postUpdate(payload) {
  await fetch(`${API_BASE}/api/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postLogin(phoneOrEmail) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneOrEmail, email: phoneOrEmail }),
  });
  return res.json();
}

export async function postVerifyOtp(phoneOrEmail, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneOrEmail, email: phoneOrEmail, otp }),
  });
  return res.json();
}

export async function postRegister(formData) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return res.json();
}

export async function getUserProfile(token) {
  const res = await fetch(`${API_BASE}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createProfile(token, profileData) {
  const res = await fetch(`${API_BASE}/api/user/profiles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function uploadProfilePhoto(token, photoFile) {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const res = await fetch(`${API_BASE}/api/user/upload-photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function setActiveProfile(token, profileId) {
  const res = await fetch(`${API_BASE}/api/user/profiles/active`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profileId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postSendOtp(phone, isRegistration = false) {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, isRegistration }),
  });
  return res.json();
}

// Test script to check frontend-backend connectivity
// Run this from the frontend directory

const API_BASE = "http://localhost:5000";

async function testConnectivity() {
  console.log("Testing connectivity to backend...\n");

  // Test 1: Check if backend is running
  try {
    const res = await fetch(`${API_BASE}/`);
    const text = await res.text();
    console.log("✓ Backend root endpoint:", text);
  } catch (e) {
    console.error("✗ Backend root failed:", e.message);
  }

  // Test 2: Check status endpoint
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    const status = await res.json();
    console.log("✓ Status endpoint:", JSON.stringify(status, null, 2));
  } catch (e) {
    console.error("✗ Status endpoint failed:", e.message);
  }

  // Test 3: Toggle light ON
  try {
    const res = await fetch(`${API_BASE}/api/light`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: true })
    });
    const result = await res.json();
    console.log("✓ Light ON:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("✗ Light ON failed:", e.message);
  }

  // Test 4: Toggle light OFF
  try {
    const res = await fetch(`${API_BASE}/api/light`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: false })
    });
    const result = await res.json();
    console.log("✓ Light OFF:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("✗ Light OFF failed:", e.message);
  }
}

testConnectivity();

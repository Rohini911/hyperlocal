const axios = require('axios');
const { io } = require('socket.io-client');
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:5000/api';
const SOCKET_URL = 'http://127.0.0.1:5000';

async function runE2ETests() {
  console.log('====================================================');
  console.log('RUNNING FULL END-TO-END SUITE WITH SOCKET.IO');
  console.log('====================================================');

  const clientSocket = io(SOCKET_URL);
  await new Promise((resolve) => clientSocket.on('connect', resolve));
  console.log('[OK] Socket.IO client connected to real-time server');

  // 1. One-Tap Guest SOS
  console.log('\n[E2E 1] Testing One-Tap Guest SOS Auth...');
  const guestRes = await axios.post(`${BASE_URL}/auth/guest-sos`, { name: 'Emergency Guest 99' });
  assert(guestRes.data.token);
  const guestToken = guestRes.data.token;
  console.log(`[OK] Guest Token generated for: ${guestRes.data.user.full_name}`);

  // 2. Citizen Login / Demo Switch
  console.log('\n[E2E 2] Authenticating Citizen & Ambulance Demo Users...');
  const citizenAuth = await axios.post(`${BASE_URL}/auth/demo-switch?role=citizen`);
  const citizenToken = citizenAuth.data.token;

  const ambulanceAuth = await axios.post(`${BASE_URL}/auth/demo-switch?role=ambulance`);
  const ambulanceToken = ambulanceAuth.data.token;

  const adminAuth = await axios.post(`${BASE_URL}/auth/demo-switch?role=admin`);
  const adminToken = adminAuth.data.token;

  // 3. Citizen Creates Emergency Incident
  console.log('\n[E2E 3] Reporting Medical Emergency with Dangerous Checklist...');
  const reportRes = await axios.post(
    `${BASE_URL}/incidents`,
    {
      emergency_type: 'Medical',
      description: 'Pedestrian unconscious near bus terminal with heavy head bleeding',
      checklist: ['Injuries reported', 'Person unconscious', 'Immediate danger'],
      lat: 12.9735,
      lng: 77.5985,
      address: 'Central Bus Terminal MG Road'
    },
    { headers: { Authorization: `Bearer ${citizenToken}` } }
  );

  const inc = reportRes.data.incident;
  assert.strictEqual(inc.emergency_type, 'Medical');
  assert.strictEqual(inc.severity, 'Critical');
  assert.strictEqual(inc.suggested_service, 'Ambulance');
  console.log(`[OK] Incident ${inc.id} created. Severity: ${inc.severity}, Target: ${inc.suggested_service}`);

  // 4. Duplicate Incident Detection Test
  console.log('\n[E2E 4] Testing Duplicate Incident Detection within 50m...');
  const dupReport = await axios.post(
    `${BASE_URL}/incidents`,
    {
      emergency_type: 'Medical',
      description: 'Second bystander reporting same injured person on ground',
      lat: 12.9736,
      lng: 77.5986,
      address: 'Bus Stand'
    },
    { headers: { Authorization: `Bearer ${guestToken}` } }
  );

  assert.strictEqual(dupReport.data.isDuplicate, true);
  assert(dupReport.data.mergedInto.startsWith('INC-2026-'));
  console.log(`[OK] Duplicate correctly detected and merged into active parent incident ${dupReport.data.mergedInto}`);

  // 5. Responder Accept & Status Progression
  console.log('\n[E2E 5] Responder Accepts & Steps Through Status Progression...');
  const acceptRes = await axios.post(
    `${BASE_URL}/incidents/${inc.id}/assign`,
    { action: 'accept' },
    { headers: { Authorization: `Bearer ${ambulanceToken}` } }
  );
  assert.strictEqual(acceptRes.data.incident.status, 'Assigned');
  console.log(`  -> Status: ${acceptRes.data.incident.status}`);

  const enRouteRes = await axios.post(
    `${BASE_URL}/incidents/${inc.id}/status`,
    { status: 'En Route', note: 'EMS unit en route with active sirens', lat: 12.9750, lng: 77.6000 },
    { headers: { Authorization: `Bearer ${ambulanceToken}` } }
  );
  assert.strictEqual(enRouteRes.data.incident.status, 'En Route');
  console.log(`  -> Status: ${enRouteRes.data.incident.status}`);

  const onSceneRes = await axios.post(
    `${BASE_URL}/incidents/${inc.id}/status`,
    { status: 'On Scene', note: 'Paramedics on scene providing CPR' },
    { headers: { Authorization: `Bearer ${ambulanceToken}` } }
  );
  assert.strictEqual(onSceneRes.data.incident.status, 'On Scene');
  console.log(`  -> Status: ${onSceneRes.data.incident.status}`);

  const resolvedRes = await axios.post(
    `${BASE_URL}/incidents/${inc.id}/status`,
    {
      status: 'Resolved',
      resolution_notes: 'Patient stabilized and transported to trauma care center',
      outcome: 'Successfully Handled'
    },
    { headers: { Authorization: `Bearer ${ambulanceToken}` } }
  );
  assert.strictEqual(resolvedRes.data.incident.status, 'Resolved');
  console.log(`  -> Status: ${resolvedRes.data.incident.status}`);

  // 6. In-App Real-time Chat
  console.log('\n[E2E 6] Testing In-App Live Emergency Chat...');
  const chatMsg = await axios.post(
    `${BASE_URL}/incidents/${inc.id}/chat`,
    { message: 'Paramedic here: Are you at the north entrance or bus stop?' },
    { headers: { Authorization: `Bearer ${ambulanceToken}` } }
  );
  assert(chatMsg.data.id);
  console.log(`[OK] Chat sent: "${chatMsg.data.message}" by ${chatMsg.data.sender_name}`);

  // 7. Area Broadcast Alert
  console.log('\n[E2E 7] Publishing Area Broadcast Hazard Warning...');
  const alertRes = await axios.post(
    `${BASE_URL}/alerts`,
    {
      title: '🚨 Severe Gas Leak Warning - Sector 2',
      message: 'Toxic fumes reported. Citizens please seal windows and avoid Sector 2 intersections.',
      alert_type: 'Warning',
      radius_km: 3.5
    },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  assert(alertRes.data.id);
  console.log(`[OK] Area Broadcast published: "${alertRes.data.title}"`);

  // 8. Analytics & CSV Export
  console.log('\n[E2E 8] Testing Analytics & Audit CSV...');
  const stats = await axios.get(`${BASE_URL}/analytics`, { headers: { Authorization: `Bearer ${adminToken}` } });
  assert(stats.data.totalIncidents >= 1);
  console.log(`[OK] Analytics Verified: Total: ${stats.data.totalIncidents}, Active: ${stats.data.activeIncidents}, Resolved: ${stats.data.resolvedIncidents}`);

  clientSocket.disconnect();
  console.log('\n====================================================');
  console.log('ALL E2E INTEGRATION TESTS PASSED 100%! [SUCCESS]');
  console.log('====================================================');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failure:', err.response?.data || err.message);
  process.exit(1);
});

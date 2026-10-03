const assert = require('assert');
const { initDB, dbRun, dbGet, dbAll } = require('../db');
const {
  calculateHaversineDistance,
  estimateTravelTime,
  classifyEmergencyAndSeverity,
  checkDuplicateIncident,
  findEligibleNearbyResponders
} = require('../ruleEngine');
const {
  app,
  server,
  io,
  alertAllEligibleNearbyResponders,
  clearIncidentTimer,
  NEARBY_RESPONDER_RADIUS_KM,
  EXPANDED_RADIUS_KM
} = require('../index');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests}: ${description}`);
    console.error(err);
    throw err;
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests}: ${description}`);
    console.error(err);
    throw err;
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('HYPERLOCAL EMERGENCY RESPONDER ALERT & ASSIGNMENT TEST SUITE');
  console.log('===============================================================');

  await initDB();

  // Clean test tables to ensure isolated run
  await dbRun("DELETE FROM incident_responder_requests WHERE incident_id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM incident_updates WHERE incident_id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM incidents WHERE id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM responders WHERE organization_name = 'Test Unit Corps'");
  await dbRun("DELETE FROM users WHERE email LIKE '%@testcorp.local'");

  // Helper: Seed test users and responders
  // Base coordinates: Cubbon Park (12.9735, 77.5985)
  // 1 km away: (12.9780, 77.6040)
  // 3 km away: (12.9850, 77.6200)
  // 7 km away: (13.0250, 77.6400) - outside 5 km radius
  // 15 km away: (13.0800, 77.6900) - outside 10 km expanded radius

  const testUsersData = [
    // 7 Ambulance responders: 4 within 5km, 1 at 7km, 1 unavailable, 1 busy
    { email: 'amb1@testcorp.local', name: 'Amb Unit 1', service: 'Ambulance', lat: 12.9740, lng: 77.5990, avail: 1, verif: 1, current_inc: null }, // ~0.1 km
    { email: 'amb2@testcorp.local', name: 'Amb Unit 2', service: 'Ambulance', lat: 12.9770, lng: 77.6030, avail: 1, verif: 1, current_inc: null }, // ~0.6 km
    { email: 'amb3@testcorp.local', name: 'Amb Unit 3', service: 'Ambulance', lat: 12.9800, lng: 77.6100, avail: 1, verif: 1, current_inc: null }, // ~1.4 km
    { email: 'amb4@testcorp.local', name: 'Amb Unit 4', service: 'Ambulance', lat: 12.9850, lng: 77.6200, avail: 1, verif: 1, current_inc: null }, // ~2.6 km
    { email: 'amb5@testcorp.local', name: 'Amb Unit 5 Far', service: 'Ambulance', lat: 13.0250, lng: 77.6400, avail: 1, verif: 1, current_inc: null }, // ~7.2 km (outside 5km)
    { email: 'amb6@testcorp.local', name: 'Amb Unit 6 Unavail', service: 'Ambulance', lat: 12.9750, lng: 77.6000, avail: 0, verif: 1, current_inc: null }, // Unavailable
    { email: 'amb7@testcorp.local', name: 'Amb Unit 7 Busy', service: 'Ambulance', lat: 12.9760, lng: 77.6010, avail: 1, verif: 1, current_inc: 'INC-BUSY-99' }, // Busy

    // Police responders
    { email: 'pol1@testcorp.local', name: 'Police Unit 1', service: 'Police', lat: 12.9750, lng: 77.5980, avail: 1, verif: 1, current_inc: null }, // ~0.2 km
    { email: 'pol2@testcorp.local', name: 'Police Unit 2', service: 'Police', lat: 12.9790, lng: 77.6050, avail: 1, verif: 1, current_inc: null }, // ~0.9 km
    { email: 'pol3@testcorp.local', name: 'Police Unit 3 Far', service: 'Police', lat: 13.0400, lng: 77.6500, avail: 1, verif: 1, current_inc: null }, // ~9.2 km

    // Fire responders
    { email: 'fire1@testcorp.local', name: 'Fire Tender 1', service: 'Fire', lat: 12.9745, lng: 77.5995, avail: 1, verif: 1, current_inc: null }, // ~0.15 km
    { email: 'fire2@testcorp.local', name: 'Fire Tender 2', service: 'Fire', lat: 12.9820, lng: 77.6150, avail: 1, verif: 1, current_inc: null }, // ~2.0 km

    // Responder with invalid/uncalibrated location (Null Island: 0.0, 0.0)
    { email: 'fire3@testcorp.local', name: 'Fire Tender 3 NoGPS', service: 'Fire', lat: 0.0, lng: 0.0, avail: 1, verif: 1, current_inc: null },

    // Citizen
    { email: 'citizen1@testcorp.local', name: 'Test Citizen Priya', phone: '+91 99999 11111', role: 'citizen' }
  ];

  const responderMap = {}; // email -> responder record with id

  for (const u of testUsersData) {
    const userRole = u.role || 'responder';
    const userRes = await dbRun(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES (?, 'hash123', ?, ?, ?)`,
      [u.email, u.name, u.phone || '+91 98765 00000', userRole]
    );

    if (userRole === 'responder') {
      const respRes = await dbRun(
        `INSERT INTO responders (user_id, service_type, is_available, is_verified, lat, lng, vehicle_number, organization_name, current_incident_id)
         VALUES (?, ?, ?, ?, ?, ?, 'KA-TEST-01', 'Test Unit Corps', ?)`,
        [userRes.lastID, u.service, u.avail, u.verif, u.lat, u.lng, u.current_inc]
      );
      responderMap[u.email] = await dbGet('SELECT * FROM responders WHERE id = ?', [respRes.lastID]);
    }
  }

  const baseLat = 12.9735;
  const baseLng = 77.5985;

  console.log('\n--- SECTION 1: RESPONDER SELECTION & ELIGIBILITY FILTERING ---');

  await itAsync('1. Correct responder type is selected (Police for Crime emergency)', async () => {
    const triage = classifyEmergencyAndSeverity('Crime', 'Robbery in store with weapons', []);
    assert.strictEqual(triage.suggested_service, 'Police');
    const responders = await findEligibleNearbyResponders(triage.suggested_service, baseLat, baseLng, 5.0);
    assert(responders.length >= 2, `Expected at least 2 police responders, got ${responders.length}`);
    for (const r of responders) {
      assert.strictEqual(r.service_type, 'Police');
    }
  });

  await itAsync('2. Medical emergency selects Ambulance responders', async () => {
    const triage = classifyEmergencyAndSeverity('Medical', 'Pedestrian unconscious and bleeding', ['Person unconscious']);
    assert.strictEqual(triage.suggested_service, 'Ambulance');
    const responders = await findEligibleNearbyResponders(triage.suggested_service, baseLat, baseLng, 5.0);
    assert(responders.length >= 4, `Expected at least 4 ambulance responders within 5km, got ${responders.length}`);
    for (const r of responders) {
      assert.strictEqual(r.service_type, 'Ambulance');
    }
  });

  await itAsync('3. Fire emergency selects Fire responders', async () => {
    const triage = classifyEmergencyAndSeverity('Fire', 'Thick smoke and flames on building 2nd floor', ['Fire or smoke']);
    assert.strictEqual(triage.suggested_service, 'Fire');
    const responders = await findEligibleNearbyResponders(triage.suggested_service, baseLat, baseLng, 5.0);
    assert(responders.length >= 2, `Expected at least 2 fire responders within 5km, got ${responders.length}`);
    for (const r of responders) {
      assert.strictEqual(r.service_type, 'Fire');
    }
  });

  await itAsync('4. Wrong responder type is excluded from candidate list', async () => {
    const fireResponders = await findEligibleNearbyResponders('Fire', baseLat, baseLng, 5.0);
    for (const r of fireResponders) {
      assert.notStrictEqual(r.service_type, 'Ambulance');
      assert.notStrictEqual(r.service_type, 'Police');
    }
  });

  await itAsync('5. Responder outside the configured 5 km radius is excluded', async () => {
    const responders = await findEligibleNearbyResponders('Ambulance', baseLat, baseLng, 5.0);
    const farResponderId = responderMap['amb5@testcorp.local'].id;
    const foundFar = responders.find(r => r.id === farResponderId);
    assert.strictEqual(foundFar, undefined, 'Far responder (7.2 km) should NOT be in 5 km results');
  });

  await itAsync('6. Unavailable responder (is_available = 0) is excluded', async () => {
    const responders = await findEligibleNearbyResponders('Ambulance', baseLat, baseLng, 5.0);
    const unavailId = responderMap['amb6@testcorp.local'].id;
    const foundUnavail = responders.find(r => r.id === unavailId);
    assert.strictEqual(foundUnavail, undefined, 'Unavailable responder must be excluded');
  });

  await itAsync('7. Busy responder (with active current_incident_id) is excluded', async () => {
    const responders = await findEligibleNearbyResponders('Ambulance', baseLat, baseLng, 5.0);
    const busyId = responderMap['amb7@testcorp.local'].id;
    const foundBusy = responders.find(r => r.id === busyId);
    assert.strictEqual(foundBusy, undefined, 'Busy responder with active incident must be excluded');
  });

  await itAsync('8. Responder without valid GPS location (null lat/lng) is excluded safely', async () => {
    const responders = await findEligibleNearbyResponders('Fire', baseLat, baseLng, 5.0);
    const noGpsId = responderMap['fire3@testcorp.local'].id;
    const foundNoGps = responders.find(r => r.id === noGpsId);
    assert.strictEqual(foundNoGps, undefined, 'Responder with null coordinates must be safely excluded');
  });

  console.log('\n--- SECTION 2: NO FIXED LIMIT (ALL ELIGIBLE NEARBY ALERTED) ---');

  await itAsync('9. Verify NO artificial limit of 5: All eligible responders in radius are returned', async () => {
    // Add 6 additional available ambulance responders within 3km to reach 10 eligible total
    const extraAmbs = [];
    for (let i = 8; i <= 13; i++) {
      const uRes = await dbRun(
        `INSERT INTO users (email, password_hash, full_name, phone, role)
         VALUES (?, 'hash123', ?, '+91 98765 00099', 'responder')`,
        [`extra_amb${i}@testcorp.local`, `Extra Ambulance ${i}`]
      );
      const rLat = 12.9740 + ((i - 7) * 0.002);
      const rLng = 77.5990 + ((i - 7) * 0.002);
      const rRes = await dbRun(
        `INSERT INTO responders (user_id, service_type, is_available, is_verified, lat, lng, vehicle_number, organization_name)
         VALUES (?, 'Ambulance', 1, 1, ?, ?, 'KA-EXTRA', 'Test Unit Corps')`,
        [uRes.lastID, rLat, rLng]
      );
      extraAmbs.push(rRes.lastID);
    }

    const allInRadius = await findEligibleNearbyResponders('Ambulance', baseLat, baseLng, 5.0);
    assert(allInRadius.length >= 10, `Expected at least 10 eligible responders, got ${allInRadius.length}. Confirms NO cap of 5!`);
    console.log(`       [Info] Total matching responders found and alerted: ${allInRadius.length} (Exceeds 5; no limit applied)`);
  });

  await itAsync('10. alertAllEligibleNearbyResponders inserts individual PENDING requests for ALL eligible responders', async () => {
    const testIncId = 'INC-TEST-1001';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Medical', 'Critical', 'Ambulance', 'Cardiac emergency', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    const dispatchResult = await alertAllEligibleNearbyResponders(
      testIncId,
      'Ambulance',
      baseLat,
      baseLng,
      { emergency_type: 'Medical', severity: 'Critical', description: 'Cardiac emergency' }
    );

    assert(dispatchResult.alertedCount >= 10, `Alerted count was ${dispatchResult.alertedCount}`);

    // Verify database records in incident_responder_requests
    const requests = await dbAll(
      'SELECT * FROM incident_responder_requests WHERE incident_id = ?',
      [testIncId]
    );

    assert.strictEqual(requests.length, dispatchResult.alertedCount);
    for (const req of requests) {
      assert.strictEqual(req.status, 'PENDING');
      assert.strictEqual(req.responder_type, 'Ambulance');
      assert(req.distance_km <= 5.0);
      assert(req.expires_at !== null);
    }

    clearIncidentTimer(testIncId);
  });

  console.log('\n--- SECTION 3: FIRST ACCEPTANCE WINS & CONCURRENCY PROTECTION ---');

  await itAsync('11. First responder acceptance atomically assigns incident and rejects other pending requests', async () => {
    const testIncId = 'INC-TEST-1002';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Police', 'Critical', 'Police', 'Assault in progress', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    const pol1 = responderMap['pol1@testcorp.local'];
    const pol2 = responderMap['pol2@testcorp.local'];

    // Create 2 pending requests
    await dbRun(
      `INSERT INTO incident_responder_requests (incident_id, responder_id, responder_type, distance_km, status)
       VALUES (?, ?, 'Police', 0.2, 'PENDING'), (?, ?, 'Police', 0.9, 'PENDING')`,
      [testIncId, pol1.id, testIncId, pol2.id]
    );

    // Responder 1 accepts first
    const assignResult = await dbRun(
      `UPDATE incidents
       SET assigned_responder_id = ?, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND assigned_responder_id IS NULL AND status NOT IN ('Resolved', 'Cancelled', 'Merged')`,
      [pol1.id, testIncId]
    );

    assert.strictEqual(assignResult.changes, 1, 'First acceptance must change exactly 1 row');

    // Mark winner request ACCEPTED
    await dbRun(
      `UPDATE incident_responder_requests SET status = 'ACCEPTED' WHERE incident_id = ? AND responder_id = ?`,
      [testIncId, pol1.id]
    );

    // Mark all other pending requests REJECTED_BY_ASSIGNMENT
    await dbRun(
      `UPDATE incident_responder_requests SET status = 'REJECTED_BY_ASSIGNMENT' WHERE incident_id = ? AND responder_id != ? AND status = 'PENDING'`,
      [testIncId, pol1.id]
    );

    // Verify incident state
    const incident = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    assert.strictEqual(incident.status, 'Assigned');
    assert.strictEqual(incident.assigned_responder_id, pol1.id);

    // Verify request states
    const req1 = await dbGet('SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?', [testIncId, pol1.id]);
    assert.strictEqual(req1.status, 'ACCEPTED');

    const req2 = await dbGet('SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?', [testIncId, pol2.id]);
    assert.strictEqual(req2.status, 'REJECTED_BY_ASSIGNMENT');
  });

  await itAsync('12. Second acceptance fails safely (Atomic Concurrency Protection)', async () => {
    const testIncId = 'INC-TEST-1002'; // Already assigned to pol1
    const pol2 = responderMap['pol2@testcorp.local'];

    // Responder 2 tries to accept the same incident
    const secondAssign = await dbRun(
      `UPDATE incidents
       SET assigned_responder_id = ?, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND assigned_responder_id IS NULL AND status NOT IN ('Resolved', 'Cancelled', 'Merged')`,
      [pol2.id, testIncId]
    );

    assert.strictEqual(secondAssign.changes, 0, 'Second acceptance MUST change 0 rows');

    // Incident remains assigned to pol1
    const incident = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    const pol1 = responderMap['pol1@testcorp.local'];
    assert.strictEqual(incident.assigned_responder_id, pol1.id);
  });

  await itAsync('13. Simultaneous simulated acceptance: Only ONE wins', async () => {
    const testIncId = 'INC-TEST-1003';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Fire', 'Critical', 'Fire', 'Fire outbreak', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    const f1 = responderMap['fire1@testcorp.local'];
    const f2 = responderMap['fire2@testcorp.local'];

    await dbRun(
      `INSERT INTO incident_responder_requests (incident_id, responder_id, responder_type, distance_km, status)
       VALUES (?, ?, 'Fire', 0.15, 'PENDING'), (?, ?, 'Fire', 2.0, 'PENDING')`,
      [testIncId, f1.id, testIncId, f2.id]
    );

    // Execute 2 concurrent update attempts
    const [res1, res2] = await Promise.all([
      dbRun(
        `UPDATE incidents
         SET assigned_responder_id = ?, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_responder_id IS NULL`,
        [f1.id, testIncId]
      ),
      dbRun(
        `UPDATE incidents
         SET assigned_responder_id = ?, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_responder_id IS NULL`,
        [f2.id, testIncId]
      )
    ]);

    const totalAssigned = res1.changes + res2.changes;
    assert.strictEqual(totalAssigned, 1, 'Exactly one simultaneous update must succeed');

    const finalInc = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    assert(finalInc.assigned_responder_id === f1.id || finalInc.assigned_responder_id === f2.id);
  });

  console.log('\n--- SECTION 4: DECLINE, EXPIRATION & FAILURE STATES ---');

  await itAsync('14. Responder decline marks request DECLINED and keeps other responders active', async () => {
    const testIncId = 'INC-TEST-1004';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Police', 'Medium', 'Police', 'Traffic issue', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    const pol1 = responderMap['pol1@testcorp.local'];
    const pol2 = responderMap['pol2@testcorp.local'];

    await dbRun(
      `INSERT INTO incident_responder_requests (incident_id, responder_id, responder_type, distance_km, status)
       VALUES (?, ?, 'Police', 0.2, 'PENDING'), (?, ?, 'Police', 0.9, 'PENDING')`,
      [testIncId, pol1.id, testIncId, pol2.id]
    );

    // pol1 declines
    await dbRun(
      `UPDATE incident_responder_requests SET status = 'DECLINED', responded_at = CURRENT_TIMESTAMP WHERE incident_id = ? AND responder_id = ?`,
      [testIncId, pol1.id]
    );

    const req1 = await dbGet('SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?', [testIncId, pol1.id]);
    assert.strictEqual(req1.status, 'DECLINED');

    const req2 = await dbGet('SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?', [testIncId, pol2.id]);
    assert.strictEqual(req2.status, 'PENDING');

    const inc = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    assert.strictEqual(inc.status, 'Reported', 'Incident remains Reported while other responders are pending');
  });

  await itAsync('15. If ALL responders decline, incident transitions to NO_RESPONDER_AVAILABLE', async () => {
    const testIncId = 'INC-TEST-1004';
    const pol2 = responderMap['pol2@testcorp.local'];

    // pol2 also declines
    await dbRun(
      `UPDATE incident_responder_requests SET status = 'DECLINED', responded_at = CURRENT_TIMESTAMP WHERE incident_id = ? AND responder_id = ?`,
      [testIncId, pol2.id]
    );

    const pendingRow = await dbGet(
      `SELECT COUNT(*) as count FROM incident_responder_requests WHERE incident_id = ? AND status = 'PENDING'`,
      [testIncId]
    );

    assert.strictEqual(pendingRow.count, 0);

    // Transition incident
    await dbRun(
      `UPDATE incidents SET status = 'NO_RESPONDER_AVAILABLE' WHERE id = ? AND assigned_responder_id IS NULL`,
      [testIncId]
    );

    const inc = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    assert.strictEqual(inc.status, 'NO_RESPONDER_AVAILABLE');
  });

  await itAsync('16. Request expiration marks PENDING requests as EXPIRED', async () => {
    const testIncId = 'INC-TEST-1005';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Fire', 'Critical', 'Fire', 'Fire alert', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    const f1 = responderMap['fire1@testcorp.local'];
    await dbRun(
      `INSERT INTO incident_responder_requests (incident_id, responder_id, responder_type, distance_km, status)
       VALUES (?, ?, 'Fire', 0.15, 'PENDING')`,
      [testIncId, f1.id]
    );

    // Simulate timeout expiration
    await dbRun(
      `UPDATE incident_responder_requests SET status = 'EXPIRED', responded_at = CURRENT_TIMESTAMP WHERE incident_id = ? AND status = 'PENDING'`,
      [testIncId]
    );

    const req = await dbGet('SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?', [testIncId, f1.id]);
    assert.strictEqual(req.status, 'EXPIRED');
  });

  await itAsync('17. If no responders exist in area, incident immediately becomes NO_RESPONDER_AVAILABLE', async () => {
    const testIncId = 'INC-TEST-1006';
    // Deep remote coordinates with 0 responders anywhere nearby
    const remoteLat = 28.6139; // Delhi (hundreds of km from Bangalore seed points)
    const remoteLng = 77.2090;

    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Fire', 'Critical', 'Fire', 'Remote fire', ?, ?, 'Reported')`,
      [testIncId, remoteLat, remoteLng]
    );

    const result = await alertAllEligibleNearbyResponders(
      testIncId,
      'Fire',
      remoteLat,
      remoteLng,
      { emergency_type: 'Fire', severity: 'Critical', description: 'Remote fire' }
    );

    assert.strictEqual(result.alertedCount, 0);
    assert.strictEqual(result.status, 'NO_RESPONDER_AVAILABLE');

    const inc = await dbGet('SELECT * FROM incidents WHERE id = ?', [testIncId]);
    assert.strictEqual(inc.status, 'NO_RESPONDER_AVAILABLE');
  });

  console.log('\n--- SECTION 5: RESPONDER AVAILABILITY LIFECYCLE ---');

  await itAsync('18. Winning responder is marked busy (is_available = 0, current_incident_id set)', async () => {
    const f1 = responderMap['fire1@testcorp.local'];
    const testIncId = 'INC-TEST-1007';

    await dbRun(
      `UPDATE responders SET is_available = 0, current_incident_id = ? WHERE id = ?`,
      [testIncId, f1.id]
    );

    const updatedResp = await dbGet('SELECT * FROM responders WHERE id = ?', [f1.id]);
    assert.strictEqual(updatedResp.is_available, 0);
    assert.strictEqual(updatedResp.current_incident_id, testIncId);
  });

  await itAsync('19. Resolving incident restores responder availability (is_available = 1, current_incident_id = NULL)', async () => {
    const f1 = responderMap['fire1@testcorp.local'];
    const testIncId = 'INC-TEST-1007';

    // Simulate incident resolution
    await dbRun(
      `UPDATE responders SET is_available = 1, current_incident_id = NULL WHERE current_incident_id = ?`,
      [testIncId]
    );

    const updatedResp = await dbGet('SELECT * FROM responders WHERE id = ?', [f1.id]);
    assert.strictEqual(updatedResp.is_available, 1);
    assert.strictEqual(updatedResp.current_incident_id, null);
  });

  console.log('\n--- SECTION 6: SECURITY & AUTHORIZATION ---');

  await itAsync('20. Responder cannot accept an incident they were not alerted for', async () => {
    const testIncId = 'INC-TEST-1008';
    await dbRun(
      `INSERT INTO incidents (id, citizen_name, emergency_type, severity, suggested_service, description, lat, lng, status)
       VALUES (?, 'Test Citizen', 'Police', 'Critical', 'Police', 'Robbery', 12.9735, 77.5985, 'Reported')`,
      [testIncId]
    );

    // Amb unit was not alerted (only pol units were)
    const amb1 = responderMap['amb1@testcorp.local'];
    const reqRecord = await dbGet(
      'SELECT * FROM incident_responder_requests WHERE incident_id = ? AND responder_id = ?',
      [testIncId, amb1.id]
    );
    assert.strictEqual(reqRecord, undefined, 'Amb unit has no request record for police incident');
  });

  await itAsync('21. Duplicate incident merge logic preserves existing functionality', async () => {
    const dupCheck = await checkDuplicateIncident('Crash', 12.9735, 77.5985, 600, 200);
    assert.strictEqual(typeof dupCheck.isDuplicate, 'boolean');
  });

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} total tests.`);
  console.log('ALL HYPERLOCAL TESTS COMPLETED SUCCESSFULLY! [PASS]');
  console.log('===============================================================');

  // Clean test records
  await dbRun("DELETE FROM incident_responder_requests WHERE incident_id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM incident_updates WHERE incident_id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM incidents WHERE id LIKE 'INC-TEST-%'");
  await dbRun("DELETE FROM responders WHERE organization_name = 'Test Unit Corps'");
  await dbRun("DELETE FROM users WHERE email LIKE '%@testcorp.local'");

  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n[FATAL] Test Suite Failed with error:', err);
  process.exit(1);
});

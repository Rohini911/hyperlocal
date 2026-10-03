import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

def run_tests():
    print("==================================================")
    print("RUNNING END-TO-END VERIFICATION OF EMERGENCY SUITE")
    print("==================================================")

    # 1. Test Demo Role Switch (Citizen)
    print("\n[Test 1] Testing Citizen Authentication & Demo Switch...")
    citizen_auth = make_req("/auth/demo-switch?role=citizen", method="POST")
    citizen_token = citizen_auth["access_token"]
    assert citizen_auth["user"]["role"] == "citizen"
    print(f"[OK] Citizen authenticated: {citizen_auth['user']['full_name']} (Role: {citizen_auth['user']['role']})")

    # 2. Test Offline Emergency Contacts
    print("\n[Test 2] Testing Emergency Contacts Directory...")
    contacts = make_req("/contacts")
    assert len(contacts) >= 8
    print(f"[OK] Verified {len(contacts)} offline-ready emergency contacts (112, 108, 100, 101, Hospitals, etc.)")

    # 3. Test Voice Translation API
    print("\n[Test 3] Testing Voice Translation Endpoint...")
    translation = make_req("/translate", method="POST", data={
        "text": "Accident ho gaya hai, khoon beh raha hai jaldi aao",
        "source_language": "hi-IN"
    })
    print(f"[OK] Translated: '{translation['original_text']}' -> '{translation['translated_text']}'")

    # 4. Test Citizen Emergency Report Submission
    print("\n[Test 4] Submitting Citizen Medical Emergency Report...")
    new_incident = make_req("/incidents", method="POST", data={
        "emergency_type": "Medical",
        "description": "Pedestrian collapsed near park bench, severe bleeding and unconscious",
        "checklist": ["Injuries reported", "Person unconscious", "Immediate danger"],
        "latitude": 12.9735,
        "longitude": 77.5985,
        "address_text": "Cubbon Park North Entrance, MG Road"
    }, token=citizen_token)
    
    inc_id = new_incident["id"]
    print(f"[OK] Emergency incident created: ID={inc_id}, Type={new_incident['emergency_type']}, TargetUnit={new_incident['suggested_responder_type']}, Priority={new_incident['urgency_level']}, Status={new_incident['status']}")

    # 5. Test Responder Auth (Ambulance)
    print("\n[Test 5] Switching to Ambulance Responder...")
    amb_auth = make_req("/auth/demo-switch?role=ambulance", method="POST")
    amb_token = amb_auth["access_token"]
    print(f"[OK] Ambulance authenticated: {amb_auth['user']['full_name']} (Service: {amb_auth['user']['service_type']})")

    # 6. Test Incident Queue Discovery for Ambulance
    print("\n[Test 6] Fetching Eligible Incident Discovery Queue...")
    incidents = make_req("/incidents", token=amb_token)
    target_inc = next((i for i in incidents if i["id"] == inc_id), None)
    assert target_inc is not None
    print(f"[OK] Found eligible incident {target_inc['id']} in Ambulance queue. Calculated distance: {target_inc['distance_km']} km")

    # 7. Test Assignment (Accept)
    print("\n[Test 7] Accepting Assignment with Backend Lock...")
    assign_res = make_req(f"/incidents/{inc_id}/assign?action=accept", method="POST", token=amb_token)
    assert assign_res["incident"]["status"] == "Assigned"
    print(f"[OK] Assignment locked: Status is now '{assign_res['incident']['status']}' with unit {assign_res['incident']['assigned_responder']['name']}")

    # 8. Test Status Progression Workflow
    print("\n[Test 8] Stepping through Incident Status Progression...")
    
    # Acknowledged
    res1 = make_req(f"/incidents/{inc_id}/status", method="POST", data={
        "status": "Acknowledged",
        "note": "Unit acknowledged dispatch. Preparing vehicle."
    }, token=amb_token)
    assert res1["status"] == "Acknowledged"
    print(f"  -> Status: {res1['status']}")

    # En Route
    res2 = make_req(f"/incidents/{inc_id}/status", method="POST", data={
        "status": "En Route",
        "note": "Vehicle en route with sirens active.",
        "responder_lat": 12.9750,
        "responder_lng": 77.6000
    }, token=amb_token)
    assert res2["status"] == "En Route"
    print(f"  -> Status: {res2['status']}")

    # On Scene
    res3 = make_req(f"/incidents/{inc_id}/status", method="POST", data={
        "status": "On Scene",
        "note": "Paramedics arrived on scene. First aid initiated.",
        "responder_lat": 12.9735,
        "responder_lng": 77.5985
    }, token=amb_token)
    assert res3["status"] == "On Scene"
    print(f"  -> Status: {res3['status']}")

    # Resolved
    res4 = make_req(f"/incidents/{inc_id}/status", method="POST", data={
        "status": "Resolved",
        "note": "Patient stabilized and transported to Victoria Hospital. Incident cleared."
    }, token=amb_token)
    assert res4["status"] == "Resolved"
    print(f"  -> Status: {res4['status']}")

    # 9. Test OSRM Route Engine
    print("\n[Test 9] Testing Route Engine...")
    route = make_req("/route?start_lat=12.9760&start_lng=77.6010&end_lat=12.9735&end_lng=77.5985")
    assert "coordinates" in route and len(route["coordinates"]) > 0
    print(f"[OK] Route computed: {len(route['coordinates'])} waypoints, {route['distance_km']} km, {route['duration_minutes']} mins (Engine: {route['source']})")

    # 10. Test Admin EOC Center Stats & Audit Log
    print("\n[Test 10] Testing Admin Operations Center Stats...")
    admin_auth = make_req("/auth/demo-switch?role=admin", method="POST")
    admin_token = admin_auth["access_token"]
    stats = make_req("/admin/stats", token=admin_token)
    print(f"[OK] Admin KPIs: Total Incidents: {stats['total_incidents']}, Active: {stats['active_incidents']}, Resolved: {stats['resolved_incidents']}, Fleet: {stats['total_responders']} units")

    print("\n==================================================")
    print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY! [SUCCESS]")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

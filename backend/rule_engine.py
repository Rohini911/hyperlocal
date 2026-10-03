import math
import httpx
from typing import Dict, Any, List, Tuple

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)

def estimate_travel_time(distance_km: float) -> int:
    """
    Estimate travel time in minutes assuming average urban emergency vehicle speed of 35 km/h + 2 min dispatch time.
    """
    if distance_km <= 0:
        return 1
    # Speed in km/min = 35 / 60 ≈ 0.58 km/min
    minutes = (distance_km / 35.0) * 60 + 2
    return max(1, round(minutes))

def classify_emergency(emergency_type: str, description: str, checklist: List[str]) -> Tuple[str, str, str]:
    """
    Transparent rule-based classification.
    Returns: (suggested_responder_type, urgency_level, rule_reason)
    """
    desc_lower = description.lower()
    checklist_set = set([item.lower() for item in checklist])
    
    # 1. Fire Service Priority
    if (emergency_type == "Fire" or 
        "fire or smoke" in checklist_set or 
        any(w in desc_lower for w in ["fire", "smoke", "flames", "burning", "blaze", "gas leak", "explosion"])):
        
        urgency = "Critical" if ("person trapped" in checklist_set or "immediate danger" in checklist_set) else "High"
        return "Fire", urgency, "Classified as Fire Service based on fire/smoke hazard keywords and checklist."
    
    # 2. Medical / Ambulance Priority
    if (emergency_type == "Medical" or emergency_type == "Road Accident" or
        "injuries reported" in checklist_set or 
        "person unconscious" in checklist_set or
        any(w in desc_lower for w in ["unconscious", "bleeding", "heart attack", "stroke", "breathing", "injured", "fracture", "accident", "ambulance", "collapsed"])):
        
        urgency = "Critical" if ("person unconscious" in checklist_set or "immediate danger" in checklist_set or "severe" in desc_lower) else "High"
        return "Ambulance", urgency, "Classified as Ambulance based on medical indicators, injuries or accident context."
    
    # 3. Police / Personal Safety Priority
    if (emergency_type == "Crime/Personal Safety" or
        any(w in desc_lower for w in ["theft", "robbery", "assault", "violence", "threat", "harassment", "stalking", "weapon", "burglary", "attack", "police"])):
        
        urgency = "Critical" if ("immediate danger" in checklist_set or "weapon" in desc_lower) else "High"
        return "Police", urgency, "Classified as Police based on personal safety/crime keywords."
    
    # 4. Default based on selected category or general fallback
    if emergency_type == "Medical":
        return "Ambulance", "High", "Assigned Ambulance based on emergency category."
    elif emergency_type == "Fire":
        return "Fire", "High", "Assigned Fire Service based on emergency category."
    elif emergency_type == "Crime/Personal Safety":
        return "Police", "High", "Assigned Police based on emergency category."
    else:
        return "Ambulance", "Moderate", "Defaulted to Medical/Ambulance first response for general emergency assessment."

async def fetch_osrm_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> Dict[str, Any]:
    """
    Fetches real road network route from public OSRM.
    If network is offline or throttled, computes smooth synthetic waypoints.
    """
    distance_km = calculate_haversine_distance(start_lat, start_lng, end_lat, end_lng)
    est_duration_min = estimate_travel_time(distance_km)
    
    url = f"https://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    coords = route["geometry"]["coordinates"] # [[lng, lat], ...]
                    # Convert to [[lat, lng], ...] for Leaflet
                    leaflet_coords = [[c[1], c[0]] for c in coords]
                    route_dist_km = round(route.get("distance", distance_km * 1000) / 1000, 2)
                    route_dur_min = max(1, round(route.get("duration", est_duration_min * 60) / 60))
                    return {
                        "coordinates": leaflet_coords,
                        "distance_km": route_dist_km,
                        "duration_minutes": route_dur_min,
                        "source": "OSRM Live Routing Engine"
                    }
    except Exception:
        pass
    
    # Fallback synthetic waypoints
    num_steps = 10
    synthetic_coords = []
    for i in range(num_steps + 1):
        ratio = i / float(num_steps)
        # Add slight realistic road curvature
        curve_offset = math.sin(ratio * math.pi) * 0.0025
        lat = start_lat + (end_lat - start_lat) * ratio + curve_offset
        lng = start_lng + (end_lng - start_lng) * ratio + curve_offset * 0.5
        synthetic_coords.append([round(lat, 6), round(lng, 6)])
    
    return {
        "coordinates": synthetic_coords,
        "distance_km": distance_km,
        "duration_minutes": est_duration_min,
        "source": "Simulated Route Engine (Offline Fallback)"
    }

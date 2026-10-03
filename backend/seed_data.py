from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from database import engine, SessionLocal, Base
import models
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(models.User).first():
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding initial demo data...")
        
        # 1. Create Demo Users
        users = [
            models.User(
                email="citizen@demo.com",
                hashed_password=hash_password("password123"),
                full_name="Aarav Sharma (Demo Citizen)",
                phone="+91 98765 43210",
                role="citizen"
            ),
            models.User(
                email="ambulance@demo.com",
                hashed_password=hash_password("password123"),
                full_name="Capt. Rajesh Kumar (EMS Lead)",
                phone="+91 98765 43211",
                role="responder"
            ),
            models.User(
                email="police@demo.com",
                hashed_password=hash_password("password123"),
                full_name="Inspector Priya Singh (Patrol 04)",
                phone="+91 98765 43212",
                role="responder"
            ),
            models.User(
                email="fire@demo.com",
                hashed_password=hash_password("password123"),
                full_name="Officer Suresh Nair (Fire Unit 9)",
                phone="+91 98765 43213",
                role="responder"
            ),
            models.User(
                email="admin@demo.com",
                hashed_password=hash_password("password123"),
                full_name="Emergency Operations Center Admin",
                phone="+91 98765 43299",
                role="admin"
            )
        ]
        
        for u in users:
            db.add(u)
        db.commit()
        for u in users:
            db.refresh(u)
            
        # 2. Create Responder Profiles with simulated locations
        # Base coords centered around Bengaluru CBD (MG Road / Cubbon Park area: 12.9716, 77.5946)
        responders = [
            models.ResponderProfile(
                user_id=users[1].id,  # ambulance
                service_type="Ambulance",
                is_available=True,
                latitude=12.9760,
                longitude=77.6010,
                vehicle_number="KA-01-AM-1082",
                badge_number="EMS-409",
                organization_name="Victoria Memorial Emergency Fleet (Simulated)"
            ),
            models.ResponderProfile(
                user_id=users[2].id,  # police
                service_type="Police",
                is_available=True,
                latitude=12.9785,
                longitude=77.5910,
                vehicle_number="KA-01-POL-55",
                badge_number="POL-201",
                organization_name="Central City Police Station (Simulated)"
            ),
            models.ResponderProfile(
                user_id=users[3].id,  # fire
                service_type="Fire",
                is_available=True,
                latitude=12.9640,
                longitude=77.5850,
                vehicle_number="KA-01-FIRE-09",
                badge_number="FT-303",
                organization_name="MG Road Fire & Rescue Tender (Simulated)"
            )
        ]
        for r in responders:
            db.add(r)
        db.commit()
        for r in responders:
            db.refresh(r)

        # 3. Create Demo Verified Emergency Contacts (Offline-ready)
        contacts = [
            models.EmergencyContact(
                service_type="General",
                name="112 National Emergency Response Helpline",
                phone="112",
                address="Unified National Emergency Coordination Center",
                latitude=12.9716,
                longitude=77.5946,
                area="All India / Pan City",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Ambulance",
                name="108 Central Emergency Medical Services",
                phone="108",
                address="City Central Hospital Ambulance Depot",
                latitude=12.9650,
                longitude=77.5750,
                area="Central District",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Ambulance",
                name="Victoria Govt Hospital Trauma Center",
                phone="+91 80 2670 1150",
                address="Fort Road, near City Market, Bengaluru",
                latitude=12.9628,
                longitude=77.5752,
                area="South-Central",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Police",
                name="100 City Police Control Room",
                phone="100",
                address="Police Commissionerate Headquarters, Infantry Rd",
                latitude=12.9810,
                longitude=77.5990,
                area="CBD / Pan City",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Police",
                name="Cubbon Park Police Station",
                phone="+91 80 2294 2583",
                address="Kasturba Road, Bengaluru",
                latitude=12.9740,
                longitude=77.5920,
                area="Cubbon Park Area",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Fire",
                name="101 City Fire Control & Rescue",
                phone="101",
                address="Karnataka State Fire & Emergency Services HQ",
                latitude=12.9660,
                longitude=77.5870,
                area="Central District",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Disaster",
                name="Disaster Management Response Helpline",
                phone="1077",
                address="State Disaster Management Authority",
                latitude=12.9780,
                longitude=77.5910,
                area="Karnataka State",
                is_verified=True
            ),
            models.EmergencyContact(
                service_type="Police",
                name="1091 Women Safety Helpline",
                phone="1091",
                address="Special Women Protection Cell",
                latitude=12.9800,
                longitude=77.6020,
                area="City-wide",
                is_verified=True
            )
        ]
        for c in contacts:
            db.add(c)
        db.commit()

        # 4. Create sample initial incidents
        now = datetime.utcnow()
        inc1 = models.Incident(
            id="INC-2026-1049",
            citizen_id=users[0].id,
            citizen_name=users[0].full_name,
            citizen_phone=users[0].phone,
            emergency_type="Medical",
            suggested_responder_type="Ambulance",
            urgency_level="Critical",
            description="Elderly person collapsed near park bench, shallow breathing and unresponsive.",
            checklist=["Person unconscious", "Immediate danger"],
            latitude=12.9735,
            longitude=77.5985,
            address_text="Cubbon Park North Entrance, MG Road",
            status="Reported",
            created_at=now - timedelta(minutes=15)
        )
        db.add(inc1)
        db.commit()

        # Add timeline update
        db.add(models.IncidentUpdate(
            incident_id=inc1.id,
            status="Reported",
            note="Emergency incident submitted by citizen. Dispatched for responder discovery.",
            updated_by_name="System",
            timestamp=now - timedelta(minutes=15)
        ))
        db.commit()

        print("Demo database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

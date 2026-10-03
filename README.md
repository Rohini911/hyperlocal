# 🚨 Hyperlocal Emergency Response Platform
### Real-Time Incident Coordination, Dispatching & Navigation Platform (Web + Desktop + Mobile)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Production-000000?style=for-the-badge&logo=vercel)](https://hyperlocal-pi.vercel.app)
[![Render Cloud API](https://img.shields.io/badge/Render-Backend_Active-46E3B7?style=for-the-badge&logo=render)](https://hyperlocal-backend.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/priya7888/hyperlocal.git)
[![IIT Dossier](https://img.shields.io/badge/IIT_Dossier-PROJECT__PRESENTATION__IIT.md-FF334B?style=for-the-badge)](./PROJECT_PRESENTATION_IIT.md)

> 📘 **For Academic / Jury Evaluation**: Please refer to [`PROJECT_PRESENTATION_IIT.md`](./PROJECT_PRESENTATION_IIT.md) for the complete Mathematical Formulations, Architecture Diagrams, 2-Minute Jury Script, and Q&A Defense Sheet.

---

## 🎨 Visual Mockup Alignment (14-Screen Storyboard)

The application includes both a **14-Screen Mockup Showcase Mode** (reproducing the exact 14-screen storyboard grid and layout) and a **Live Interactive App Mode**:

1. **Screen 1: Login / Register** — Split layout with dark emergency branding on the left and login/register tabs on the right.
2. **Screen 2: Role Selection** — Dual choice cards for Citizen (blue Continue) and Responder (green Continue).
3. **Screen 3: Citizen Dashboard** — Dark navy sidebar, greeting "Hello, Priya!", 3 stat cards (Active, Past, Offline), big red "+ Report Emergency" button, Recent Incidents list, and quick access to 112 SOS.
4. **Screen 4: Report Emergency (Form)** — 5 emergency type tiles (Medical, Road Accident, Fire, Crime, Other), description box with voice input button, and danger checklist.
5. **Screen 5: Location Capture** — Leaflet / OpenStreetMap interactive picker with auto-detected GPS pin (Lat: 17.3850, Lng: 78.4867) and address input.
6. **Screen 6: Voice Input & Translation** — Audio waveform animation with native speech detection (Telugu) and English translation preview.
7. **Screen 7: Submit Confirmation** — Green checkmark, incident ID `INC-2025-001`, status chip `Reported`, and "View My Incident" action.
8. **Screen 8: Responder Dashboard** — Dark navy sidebar, nearby incident cards with distance/ETA, and Accept/Reject buttons.
9. **Screen 9: Route Navigation (Responder)** — Incident details, En Route chip, OSRM road route map, and "Start Navigation".
10. **Screen 10: Citizen Tracking View** — Vertical timeline (Reported, Assigned, Acknowledged, En Route, On Scene, Resolved), live moving responder map, and vehicle unit details.
11. **Screen 11: Emergency Contacts (Works Offline)** — Red 112 SOS banner, categorized services (Ambulance, Police, Fire) with direct click-to-call.
12. **Screen 12: Offline Report Storage** — Offline warning, IndexedDB cached report queue, and "Go Online to Sync" button.
13. **Screen 13: Resolved Incident** — Green checkmark, resolution timestamp (11:42 AM), and summary details.
14. **Screen 14: Admin Dashboard (Optional)** — Dark navy sidebar, KPI cards (Total, Ongoing, Resolved), and recent incidents dispatch table.

---

## 🚀 Quick Start (Single Command)

### 1. Install & Run Everything:
```bash
# In the root directory:
npm run dev
```
*Starts the Node.js + Socket.IO backend on `http://127.0.0.1:5000` and Vite React frontend on `http://127.0.0.1:5173`.*

### 2. Run Automated Test Suite:
```bash
# Run unit tests (classification, duplicate detection, ETA)
npm test
```

---

## 👥 Demo Accounts (One-Click Switcher Available in Top Bar)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@demo.com` | `123456` | Priya Sharma (Report emergencies & track live status) |
| **Responder** | `responder@demo.com` | `123456` | Ravi Responder / Paramedic Unit (Accept & navigate) |
| **Dispatcher / Admin** | `admin@demo.com` | `123456` | Chief Dispatcher (EOC fleet management & broadcast) |

---

## 🌟 Core Features & Workflows

1. **One-Tap Guest SOS & Citizen Reporting**:
   - Categories: Medical Emergency, Road Accident, Fire, Crime / Safety, Other.
   - GPS location capture with accuracy meter + interactive draggable Leaflet map pin + manual address fallback.
   - Multilingual Voice Input: converts speech in native regional languages to verified English before submission.
   - Danger Checklist (injuries reported, unconscious, trapped, vehicle accident, immediate danger).
2. **Duplicate Detection & Auto-Merge**:
   - Automatically detects incidents of the same emergency type within **200 meters** and **10 minutes**, merging them into the active parent incident to avoid dispatch congestion.
3. **Rule Engine Classification & Severity**:
   - Auto-triages severity (`Critical`, `Medium`, `Low`) based on hazard keywords and danger flags.
   - Suggests target response unit (`Ambulance`, `Police`, `Fire`, `Rescue`).
4. **Dynamic 30-Second Responder Dispatch Alert**:
   - Ranks available verified units by road ETA and straight-line distance.
   - Emits a real-time **30-second countdown alert** over Socket.IO to the best responder.
   - If declined or timed out (30s), rotates automatically to the next best unit.
5. **Live Turn-by-Turn Route Navigation & Live GPS Stream**:
   - Real-time OSRM calculated road navigation path on Leaflet map.
   - Live GPS position broadcast from responder to citizen & dispatch room.
   - Step-by-step status flow: `Reported` → `Assigned` → `En Route` → `On Scene` → `Resolved`.
6. **In-App Live Chat & Audio Call Simulation**:
   - Direct real-time chat between citizen and assigned responder over WebSockets.
7. **Offline Emergency Contacts & Report Sync**:
   - Locally cached directory for 112, 108, 100, 101, and hospitals with 1-click `tel:` dialer.
   - Offline incident draft queue with sync upon reconnection.
8. **⚡ 1-Click "Demo Mode" Simulator**:
   - Click **"⚡ Demo Mode"** in the top bar to auto-simulate a full incident lifecycle (Reported -> Assigned -> En Route -> On Scene -> Resolved) in 6 seconds for presentations.

---

## ⏱️ 3-Minute Demonstration Sequence

1. **Open Platform**: Visit `http://127.0.0.1:5173`.
2. **Toggle Modes**: Click **"14-Screen Mockup Showcase"** to view all 14 screens laid out matching the mockup sheet, or **"Live Interactive App"** to test live.
3. **Citizen Reporting Flow**:
   - Click *"+ Report Emergency"*.
   - Select *Road Accident*, check *"Injuries reported"* and *"Person unconscious"*.
   - Click *"Voice Input"* to show Telugu-to-English speech translation.
   - Click *"Next: Location"* and verify Leaflet GPS pin at SRKR Engineering College, Bhimavaram.
   - Click *"Submit Emergency Report"* to see Screen 7 confirmation with `INC-2025-001`.
4. **Responder Dispatch & Navigation**:
   - Switch role to **"Responder"** in the top bar.
   - View *Nearby Incidents* (Screen 8) and click *"Accept"*.
   - View *Route Navigation* (Screen 9) with distance, ETA, and OSRM turn-by-turn route.
   - Click *"Start Navigation"* or advance status: `En Route` → `On Scene` → `Mark Resolved`.
5. **Citizen Tracking View**:
   - Switch back to **"Citizen"** to observe live timeline progression (Reported -> Assigned -> Acknowledged -> En Route -> On Scene -> Resolved).
6. **Offline Directory & Admin EOC**:
   - Open *"Contacts"* to view the offline 112 SOS directory (Screen 11).
   - Switch role to **"Admin"** to view the EOC overview stats and recent incidents audit table (Screen 14).

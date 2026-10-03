// Offline Storage Manager for Contacts and Emergency Report Queue

const STORAGE_KEYS = {
  CONTACTS: "emergency_cached_contacts",
  OFFLINE_REPORTS: "emergency_offline_pending_reports",
  LAST_COORDS: "emergency_last_known_coords",
  USER_SESSION: "emergency_user_session"
};

export const offlineStorage = {
  // Save contacts for offline viewing
  saveContacts(contacts) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify({
        data: contacts,
        cachedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("Failed to cache contacts offline", e);
    }
  },

  // Get cached contacts
  getContacts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (!raw) return { data: [], cachedAt: null };
      return JSON.parse(raw);
    } catch (e) {
      return { data: [], cachedAt: null };
    }
  },

  // Store emergency report offline when disconnected
  saveOfflineReport(report) {
    try {
      const pending = this.getOfflineReports();
      const newReport = {
        ...report,
        offlineId: `OFFLINE-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        createdOfflineAt: new Date().toISOString(),
        synced: false
      };
      pending.unshift(newReport);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(pending));
      return newReport;
    } catch (e) {
      console.error("Failed to save offline report", e);
      return null;
    }
  },

  // Retrieve pending offline reports
  getOfflineReports() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_REPORTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  // Remove synced report
  removeOfflineReport(offlineId) {
    try {
      const pending = this.getOfflineReports().filter(r => r.offlineId !== offlineId);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(pending));
    } catch (e) {
      console.error(e);
    }
  },

  // Clear all synced
  clearOfflineReports() {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_REPORTS);
  },

  // Last known coordinates
  saveLastCoords(lat, lng) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_COORDS, JSON.stringify({ lat, lng, time: Date.now() }));
    } catch (e) {}
  },

  getLastCoords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_COORDS);
      return raw ? JSON.parse(raw) : { lat: 12.9716, lng: 77.5946 };
    } catch (e) {
      return { lat: 12.9716, lng: 77.5946 };
    }
  }
};

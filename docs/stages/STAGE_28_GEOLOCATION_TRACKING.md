# Stage 28: Geolocation & Site Tracking

**Статус:** ⏳ PLANNED | **Версия:** v2.8.0 | **Приоритет:** P3 | **Длительность:** 10 дней (2 недели)

## 📋 ОБЗОР

GPS tracking для workers, jobsite clock in/out, geofence alerts, site-based expense tagging, privacy controls.

**Цели:**
- GPS location tracking
- Automatic clock in/out
- Geofence setup
- Site-based expense tagging
- Privacy & consent management

**Бизнес-ценность:** +30% BUSINESS plan retention (accountability)

## 🎯 SCOPE

**Включено ✅:**
- GPS tracking (mobile only)
- Map view of team locations
- Geofence alerts
- Auto time logging on arrival
- Photo metadata (location tags)
- Privacy controls & consent

**Не включено ❌:**
- Route optimization
- Real-time tracking dashboard
- Historical movement playback

## 📊 ARCHITECTURE

### Mobile (React Native)

```typescript
// Location tracking service
class LocationService {
  async startTracking(projectId: string): Promise<void>
  async stopTracking(): Promise<void>
  async checkGeofence(projectId: string): Promise<boolean>
  async getCurrentLocation(): Promise<Coordinates>
}
```

### Database

```prisma
model ProjectGeofence {
  id String @id @default(uuid())
  projectId String @unique
  centerLat Float
  centerLng Float
  radiusMeters Int
  createdAt DateTime @default(now())
}

model LocationLog {
  id String @id @default(uuid())
  userId String
  projectId String?
  latitude Float
  longitude Float
  accuracy Float
  recordedAt DateTime @default(now())
}

model GeofenceEvent {
  id String @id @default(uuid())
  userId String
  projectId String
  eventType GeofenceEventType
  occurredAt DateTime @default(now())
}

enum GeofenceEventType {
  ENTERED
  EXITED
}
```

## 🔧 IMPLEMENTATION

**Week 1: GPS Tracking**
- Mobile location service
- Background tracking
- Geofence detection
- Map UI

**Week 2: Auto Clock & Privacy**
- Auto time logging
- Privacy controls
- Consent management
- Testing

## 📊 METRICS

- **LOC:** ~2,500
- **Battery impact:** < 5% per day
- **Location accuracy:** ±10 meters

## ✅ SUCCESS

- ✅ GPS tracking accurate
- ✅ Geofence events triggered correctly
- ✅ Auto clock-in works 95%+ of time
- ✅ Privacy controls respected
- ✅ Users consent to tracking

---

**Created:** 2025-12-23 | **Version:** 1.0

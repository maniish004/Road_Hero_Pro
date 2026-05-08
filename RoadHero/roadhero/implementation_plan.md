# RoadHero - On-Demand Roadside Assistance MVP Plan

## 1. Project Architecture
The application will follow a standard Client-Server architecture.

### **Frontend (Client)**
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Modern, Responsive, Glassmorphism touches)
- **Maps**: Mapbox GL JS (via `react-map-gl`) or Leaflet (if API key is an issue, but we will code for Mapbox)
- **State Management**: React Context or internal state for valid simplicity in MVP.
- **Communication**: Axios or Fetch API to talk to Backend.

### **Backend (Server)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas or Local) via Mongoose ODM.
- **API Style**: RESTful API.
- **Real-time**: Basic polling for MVP (or Socket.io if time permits, but User asked for "basic version" real-time connections, polling is safest for strict MVP, but Socket.io is better for "Requested -> Accepted" updates. We will aim for a Polling/Socket hybrid or just clean REST endpoints).

### **Database (MongoDB)**
We will use Geospatial Indexing (`2dsphere`) to find nearby mechanics.

## 2. Database Schema

### **Mechanic Model**
- `name`: String
- `phone`: String
- `serviceType`: String (e.g., "Towing", "Tire Change")
- `location`: GeoJSON Point `{ type: "Point", coordinates: [long, lat] }`
- `isAvailable`: Boolean

### **Request Model**
- `driverName`: String
- `driverPhone`: String
- `issue`: String
- `location`: GeoJSON Point
- `status`: Enum ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"]
- `assignedMechanic`: ObjectId (ref: Mechanic)

## 3. Location-Based Matching Logic
1. Driver submits request with `latitude, longitude`.
2. Backend receives request.
3. To find nearby mechanics: Use MongoDB `$near` or `$geoNear` operator on the `Mechanic` collection filtering by `isAvailable: true`.
4. Return list of mechanics or automatically notify (for MVP, we might show the driver's request on a "Mechanic Dashboard" that actively polls for open requests near them).

## 4. API Routes
- `POST /api/requests`: Create a new assistance request.
- `GET /api/requests/nearby`: (For Mechanics) Find pending requests near a location.
- `PATCH /api/requests/:id/accept`: Mechanic accepts a request.
- `POST /api/mechanics`: Register a mechanic.
- `GET /api/mechanics/nearby`: (For Drivers) See mechanics nearby (optional).

## 5. Folder Structure
```
/roadhero
  /backend
    /models
    /routes
    /config
    server.js
    package.json
  /frontend (Vite React)
    /src
      /components
      /pages
      /styles
      api.js
      App.jsx
    package.json
```

## 6. Implementation Steps
1. Setup Backend: Express + Mongoose connection.
2. Define Models with GeoJSON.
3. Create Routes for creating requests and fetching nearby data.
4. Setup Frontend: React + Map/Form UI.
5. Connect Front to Back.

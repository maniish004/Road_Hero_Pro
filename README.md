# RoadHero - MVP Roadside Assistance

## Prerequisites
- Node.js (v14+)
- MongoDB (Running locally on port 27017) OR a MongoDB Atlas URI.

## Setup Instructions

### 1. Database
Make sure your local MongoDB is running:
```bash
mongod
```
*If using MongoDB Atlas, create a `.env` file in `backend/` with `MONGO_URI=your_connection_string`.*

### 2. Backend Setup
Open a terminal in the root folder:
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup
Open a **new** terminal in the root folder:
```bash
cd frontend
npm install
npm run dev
```
The application will start on `http://localhost:5173`.

## How to Test
1. Open the Frontend URL.
2. Open two different browser windows (or incognito).
3. In Window A: Select **"I'm a Driver"**, fill the form and submit.
   - Note: Allow Location Access.
4. In Window B: Select **"I'm a Mechanic"**.
   - It will auto-register you as a mechanic at your current location.
   - You should see the Request from Window A appear on the list/map.
5. Click **"Accept"** in the Mechanic dashboard.
6. Watch the Driver's screen update to "ACCEPTED".

## Tech Stack
- **Frontend**: React, Vite, Leaflet (Maps), Glassmorphism styling.
- **Backend**: Node.js, Express, MongoDB (Geospatial Queries).

# Deployment Guide for RoadHero 🚀

## 🟢 Live Application
**Production URL:** [https://roadhero-app.onrender.com](https://roadhero-app.onrender.com)

---

This project is configured to be deployed as a single unit (Monolith) where the Node.js backend serves the built React frontend.

## 1. Prepare for Deployment
The project already contains a root-level `package.json` with a dedicated `build` script.

### Environment Variables
You MUST set the following environment variables in your deployment dashboard (e.g., Render, Railway):
- `NODE_ENV`: `production`
- `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas)
- `JWT_SECRET`: A long random string for securing login sessions
- `PORT`: 5000 (standard, usually provided by the host)

## 2. Deploying on Render (Recommended)
1. **New Web Service**: Connect your GitHub repository.
2. **Runtime**: Node
3. **Build Command**: `npm run build` (This runs the root build script which handles both frontend and backend)
4. **Start Command**: `npm start`
5. **Environment Variables**: Add the variables listed above.

## 3. Manual Build (Local Testing)
If you want to test the production build locally:
1. Run `npm run build` in the root folder.
2. Run `npm start` in the root folder.
3. Visit `http://localhost:5000`.

## 4. Key Changes Made for Deployment
- **Monolith Mode**: `backend/server.js` now serves static files from `frontend/dist` when `NODE_ENV=production`.
- **Dynamic API**: Frontend now automatically detects if it's in production and points to the relative `/api` path instead of `localhost:5000`.
- **Dynamic Sockets**: WebSocket connections now use `window.location.origin` in production.
- **Root Scripts**: Added a top-level `package.json` to automate the complex build process for hosting providers.

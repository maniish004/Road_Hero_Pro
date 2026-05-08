import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthContext from './context/AuthContext';
import MechanicLayout from './components/MechanicLayout';
import MechanicDashboardOverview from './pages/mechanic/Dashboard';
import MechanicAvailableJobs from './pages/mechanic/AvailableJobs';
import MechanicActiveJobs from './pages/mechanic/ActiveJobs';
import MechanicHistory from './pages/mechanic/History';
import MechanicSettings from './pages/mechanic/Settings';
import DriverLayout from './components/DriverLayout';
import DriverHomePage from './pages/driver/Home';
import DriverFriendHelp from './pages/driver/FriendHelp';
import DriverActivity from './pages/driver/Activity';
import DriverGarage from './pages/driver/Garage';
import DriverHistory from './pages/driver/History';
import DriverSettings from './pages/driver/Settings';

import Landing from './pages/Landing';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/driver" element={
        <ProtectedRoute allowedRole="driver">
          <DriverLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="home" />} />
        <Route path="home" element={<DriverHomePage />} />
        <Route path="friend" element={<DriverFriendHelp />} />
        <Route path="activity" element={<DriverActivity />} />
        <Route path="garage" element={<DriverGarage />} />
        <Route path="history" element={<DriverHistory />} />
        <Route path="settings" element={<DriverSettings />} />
      </Route>

      <Route path="/mechanic" element={
        <ProtectedRoute allowedRole="mechanic">
          <MechanicLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<MechanicDashboardOverview />} />
        <Route path="jobs" element={<MechanicAvailableJobs />} />
        <Route path="active" element={<MechanicActiveJobs />} />
        <Route path="history" element={<MechanicHistory />} />
        <Route path="settings" element={<MechanicSettings />} />
      </Route>
    </Routes>
  );
}

export default App;

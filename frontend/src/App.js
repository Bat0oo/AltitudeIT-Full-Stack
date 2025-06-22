import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserHome from './components/home/UserHome';
import AdminHome from './components/home/AdminHome';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
            
            
           <Route path="/" element={<Layout />} />
           <Route index element={<Navigate to="/home" replace />} />

           <Route 
              path="/user/home" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <UserHome />
                </ProtectedRoute>
              } 
            />
              <Route 
              path="/user/products" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <div className="dashboard-container">
                    <h1>Customer Products Page TODO</h1>
                    <p>TODO</p>
                  </div>
                </ProtectedRoute>
              } />
              <Route 
              path="/user/profile" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <div className="dashboard-container">
                    <h1>User Profile Page TODO</h1>
                    <p>TODO</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/home" 
              element={
                <ProtectedRoute requiredRole={2}>
                  <AdminHome />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="dashboard-container">
                    <h1>Admin Products Management TODO</h1>
                    <p>TODO</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="dashboard-container">
                    <h1>User Management TODO</h1>
                    <p>TODO</p>
                  </div>
                </ProtectedRoute>
              } 
            />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin/home" replace />;
  } else {
    return <Navigate to="/customer/home" replace />;
  }
};


export default App;

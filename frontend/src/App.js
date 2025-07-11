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
import UserProfile from './components/common/UserProfile'; 
import AdminUsers from './components/admin/AdminUsers';
import AdminProducts from './components/admin/AdminProducts';
import AdminAnalytics from './components/admin/AdminAnalytics';
import UserProducts from './components/user/UserProducts';

import './styles/global.css';
import { useEffect } from 'react';



function App() {
  useEffect(()=>{
    document.title="AltitudeIT Full Stack App"
  },[]) ;
  return (
    <AuthProvider>
      <Router>
        <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
            
            
           <Route path="/" element={<Layout />} />
           <Route index element={<Navigate to="/login" replace />} />

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
                  <UserProducts></UserProducts>
                </ProtectedRoute>
              } />
              <Route 
              path="/profile" 
              element={
               <ProtectedRoute>
                  <UserProfile />
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
                <ProtectedRoute requiredRole={2}>
                  <AdminProducts></AdminProducts>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole={2}>
                  <AdminUsers></AdminUsers>
                </ProtectedRoute>
              } 
            />
                       <Route 
           path="/admin/analytics"
           element={
            <ProtectedRoute requiredRole={2}>
              <AdminAnalytics></AdminAnalytics>
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
  
  if (user?.role === 2) {
    return <Navigate to="/admin/home" replace />;
  } else if (user?.role===1){
    return <Navigate to="/user/home" replace />;
  }else{
    return <Navigate to="/login" replace />;
  }
};


export default App;

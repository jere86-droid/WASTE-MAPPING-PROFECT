import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/auth/register', {
        name,
        email,
        password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      toast.success(data.message || 'Registration successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      toast.success('Login successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const { data } = await API.put('/auth/profile', updates);

      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await API.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
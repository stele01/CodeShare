import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import UserProfile from '../profile/UserProfile';
import ChangePassword from './ChangePassword';

const SettingsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [workspaces, setWorkspaces] = useState<{ updatedAt: string }[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/workspaces', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces for settings page', err);
      }
    };
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div 
          className={`opacity-0 ${animate ? 'animate-fadeIn' : ''}`}
          style={{ animationDuration: '0.8s', animationFillMode: 'forwards' }}
        >
          <UserProfile 
            user={user} 
            workspacesCount={workspaces.length} 
            lastActive={workspaces.length > 0 ? new Date(workspaces[0].updatedAt).toLocaleString() : ''} 
          />
        </div>
        <div 
          className={`opacity-0 ${animate ? 'animate-fadeIn' : ''}`}
          style={{ animationDuration: '0.8s', animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 
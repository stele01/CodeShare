import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Start animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to handle new project creation
  const handleCreateNewProject = () => {
    navigate('/editor');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // This will not render as we redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Details Card with Animation */}
        <div 
          className={`bg-white shadow overflow-hidden rounded-lg opacity-0 ${animate ? 'animate-fadeIn' : ''}`}
          style={{ 
            animationDuration: '0.8s',
            animationFillMode: 'forwards'
          }}
        >
          <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white">
            <h3 className="text-lg leading-6 font-medium">Profile</h3>
            <p className="mt-1 max-w-2xl text-sm">Personal details and preferences</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.id}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Recent Activity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">No recent activity</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Projects Card with Animation */}
        <div 
          className={`mt-10 bg-white shadow overflow-hidden rounded-lg opacity-0 ${animate ? 'animate-fadeIn' : ''}`}
          style={{ 
            animationDuration: '0.8s',
            animationDelay: '0.4s',
            animationFillMode: 'forwards'
          }}
        >
          <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white">
            <h3 className="text-lg leading-6 font-medium">Projects</h3>
            <p className="mt-1 max-w-2xl text-sm">Your CodeShare projects</p>
          </div>
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">You don't have any projects yet.</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={handleCreateNewProject}
            >
              Create New Project
            </button>
          </div>
        </div>
      </div>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation-name: fadeIn;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage; 
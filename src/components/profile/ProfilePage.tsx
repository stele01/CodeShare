import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';

interface Workspace {
  _id: string;
  title: string;
  language: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { openModal, showDeleteConfirmation } = useModal();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch user workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;
      
      setIsLoadingWorkspaces(true);
      setError(null);
      
      try {
        const response = await fetch('/api/workspaces', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        
        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError('Failed to load your projects. Please try again.');
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, user]);

  // Start animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to handle new project creation
  const handleCreateNewProject = () => {
    openModal('createProject');
  };
  
  // Function to open a project
  const handleOpenProject = (id: string) => {
    navigate(`/editor/${id}`);
  };

  // Function to handle deletion
  const handleDeleteWorkspace = async (id: string) => {
    // Find the workspace to get its title for the confirmation message
    const workspaceToDelete = workspaces.find(ws => ws._id === id);
    if (!workspaceToDelete) return;
    
    // Use custom confirmation dialog instead of window.confirm
    showDeleteConfirmation({
      title: 'Delete Project?',
      message: `Are you sure you want to delete "${workspaceToDelete.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        setDeletingId(id);
        
        try {
          const response = await fetch(`/api/workspaces/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete project');
          }
          
          // Remove the deleted workspace from state
          setWorkspaces(workspaces.filter(workspace => workspace._id !== id));
        } catch (err) {
          console.error('Error deleting workspace:', err);
          setError('Failed to delete project. Please try again.');
        } finally {
          setDeletingId(null);
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
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
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user._id}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Recent Activity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {workspaces.length > 0 ? `Last saved project: ${new Date(workspaces[0].updatedAt).toLocaleString()}` : 'No recent activity'}
                </dd>
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
          <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium">Projects</h3>
              <p className="mt-1 max-w-2xl text-sm">Your CodeShare projects</p>
            </div>
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
              onClick={handleCreateNewProject}
            >
              New Project
            </button>
          </div>
          
          {isLoadingWorkspaces ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading your projects...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : workspaces.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workspaces.map((workspace) => (
                    <tr key={workspace._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {workspace.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workspace.language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workspace.isPublic ? 'Public' : 'Private'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleOpenProject(workspace._id)}
                          className="text-blue-600 bg-blue-100 hover:border-blue-600 hover:text-blue-900 mr-4"
                        >
                          Open
                        </button>
                        <button 
                          onClick={() => handleDeleteWorkspace(workspace._id)}
                          disabled={deletingId === workspace._id}
                          className={`text-red-600 bg-red-100 hover:border-red-600 hover:text-red-900 ${deletingId === workspace._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {deletingId === workspace._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-4">You don't have any projects yet.</p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                onClick={handleCreateNewProject}
              >
                Create New Project
              </button>
            </div>
          )}
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
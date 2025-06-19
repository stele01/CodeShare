import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { handleCtrlClickNavigation } from '../../utils/navigation';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortColumn, setSortColumn] = useState<'title' | 'language' | 'visibility' | 'created'>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  
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

  // Get unique languages from workspaces
  const uniqueLanguages = Array.from(new Set(workspaces.map(ws => ws.language)));

  // Filtered workspaces based on search query and filters
  const filteredWorkspaces = workspaces.filter(ws => {
    // Search by title
    const matchesSearch = ws.title.toLowerCase().includes(searchQuery.toLowerCase());
    // Filter by language
    const matchesLanguage = languageFilter === 'all' || ws.language === languageFilter;
    // Filter by visibility
    const matchesVisibility = visibilityFilter === 'all' || (visibilityFilter === 'public' ? ws.isPublic : !ws.isPublic);
    // Filter by date
    const createdDate = new Date(ws.createdAt);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesFrom = fromDate ? createdDate >= fromDate : true;
    const matchesTo = toDate ? createdDate <= toDate : true;
    return matchesSearch && matchesLanguage && matchesVisibility && matchesFrom && matchesTo;
  });

  const handleSort = (column: 'title' | 'language' | 'visibility' | 'created') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortArrow = (column: string) => {
    if (sortColumn !== column) return <span className="ml-1 text-gray-400">▲▼</span>;
    return sortDirection === 'asc' ? (
      <span className="ml-1 text-blue-600">▲</span>
    ) : (
      <span className="ml-1 text-blue-600">▼</span>
    );
  };

  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    switch (sortColumn) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'language':
        aValue = a.language.toLowerCase();
        bValue = b.language.toLowerCase();
        break;
      case 'visibility':
        aValue = a.isPublic ? 1 : 0;
        bValue = b.isPublic ? 1 : 0;
        break;
      case 'created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    setSortColumn('created');
    setSortDirection('desc');
  }, []);

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
          <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium">Profile</h3>
              <p className="mt-1 max-w-2xl text-sm">Personal details and preferences</p>
            </div>
            <button
              className="text-white hover:text-blue-300 focus:outline-none"
              onClick={() => setProfileCollapsed((prev) => !prev)}
              aria-label={profileCollapsed ? 'Expand Profile' : 'Collapse Profile'}
              type="button"
            >
              {profileCollapsed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              )}
            </button>
          </div>
          <div className={`collapsible-content${profileCollapsed ? ' collapsed' : ''}`}> 
            {!profileCollapsed && (
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
            )}
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
              className="text-white hover:text-blue-300 focus:outline-none"
              onClick={() => setProjectsCollapsed((prev) => !prev)}
              aria-label={projectsCollapsed ? 'Expand Projects' : 'Collapse Projects'}
              type="button"
            >
              {projectsCollapsed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              )}
            </button>
          </div>
          <div className={`collapsible-content${projectsCollapsed ? ' collapsed' : ''}`}> 
            {!projectsCollapsed && (
              <>
                {/* Search and Filter controls */}
                <div className="px-4 py-2 bg-gray-50 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                  <input
                    type="text"
                    className="w-full md:w-1/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search projects by name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {/* Language Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm whitespace-nowrap">Language:</span>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={languageFilter}
                      onChange={e => setLanguageFilter(e.target.value)}
                    >
                      <option value="all">All Languages</option>
                      {uniqueLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  {/* Visibility Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm whitespace-nowrap">Visibility:</span>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={visibilityFilter}
                      onChange={e => setVisibilityFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  {/* Date From */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm whitespace-nowrap">Created from:</span>
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      placeholder="From"
                      max={dateTo || undefined}
                    />
                  </div>
                  {/* Date To */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm whitespace-nowrap">to:</span>
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      placeholder="To"
                      min={dateFrom || undefined}
                    />
                  </div>
                  {/* Clear All Filters Button */}
                  <button
                    className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm whitespace-nowrap"
                    onClick={() => {
                      setSearchQuery('');
                      setLanguageFilter('all');
                      setVisibilityFilter('all');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    type="button"
                  >
                    Clear All Filters
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
                ) : sortedWorkspaces.length > 0 ? (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('title')}>
                            Title {getSortArrow('title')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('language')}>
                            Language {getSortArrow('language')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('visibility')}>
                            Visibility {getSortArrow('visibility')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('created')}>
                            Created {getSortArrow('created')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedWorkspaces.map((workspace) => (
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
                                onClick={e => handleCtrlClickNavigation(e, `/editor/${workspace._id}`, navigate)}
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
                ) :
                  <div className="p-6 text-center text-gray-500">
                    <p className="mb-4">You don't have any projects yet.</p>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      onClick={handleCreateNewProject}
                    >
                      Create New Project
                    </button>
                  </div>
                }
              </>
            )}
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

        .collapsible-content {
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
          overflow: hidden;
          opacity: 1;
          max-height: 1000px;
        }
        .collapsible-content.collapsed {
          opacity: 0;
          max-height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage; 
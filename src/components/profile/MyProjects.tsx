import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { handleCtrlClickNavigation } from '../../utils/navigation';
import { useTranslation } from 'react-i18next';

interface Workspace {
  _id: string;
  title: string;
  language: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const MyProjects = () => {
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
  const { t } = useTranslation();
  
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

  // Function to handle double click on project row
  const handleRowDoubleClick = (workspaceId: string) => {
    navigate(`/editor/${workspaceId}`);
  };

  // Function to handle single click on project row (for visual feedback)
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    
    // Add visual feedback for click
    const row = e.currentTarget;
    row.classList.add('bg-gray-100');
    
    // Remove the class after animation
    setTimeout(() => {
      row.classList.remove('bg-gray-100');
    }, 150);
  };

  // Function to handle keyboard navigation
  const handleRowKeyDown = (e: React.KeyboardEvent, workspaceId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/editor/${workspaceId}`);
    }
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
          <p className="mt-4 text-lg text-gray-700">{t('profile.loading')}</p>
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
              <h3 className="text-lg leading-6 font-medium">{t('profile.projects')}</h3>
              <p className="mt-1 max-w-2xl text-sm">{t('profile.your_projects')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                onClick={handleCreateNewProject}
              >
                {t('profile.create_new_project')}
              </button>
            </div>
          </div>
          <div>
            <>
              {/* Search and Filter controls */}
              <div className="px-4 py-2 bg-gray-50 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <input
                  type="text"
                  className="w-full md:w-1/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder={t('profile.search_placeholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {/* Language Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm whitespace-nowrap">{t('profile.language')}</span>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={languageFilter}
                    onChange={e => setLanguageFilter(e.target.value)}
                  >
                    <option value="all">{t('profile.all_languages')}</option>
                    {uniqueLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                {/* Visibility Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm whitespace-nowrap">{t('profile.visibility')}</span>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={visibilityFilter}
                    onChange={e => setVisibilityFilter(e.target.value)}
                  >
                    <option value="all">{t('profile.all')}</option>
                    <option value="public">{t('profile.public')}</option>
                    <option value="private">{t('profile.private')}</option>
                  </select>
                </div>
                {/* Date From */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm whitespace-nowrap">{t('profile.created_from')}</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    placeholder={t('profile.from')}
                    max={dateTo || undefined}
                  />
                </div>
                {/* Date To */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm whitespace-nowrap">{t('profile.to')}</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    placeholder={t('profile.to')}
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
                  {t('profile.clear_filters')}
                </button>
              </div>
              {isLoadingWorkspaces ? (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">{t('profile.loading_projects')}</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">{error}</p>
                  <button 
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => window.location.reload()}
                  >
                    {t('profile.retry')}
                  </button>
                </div>
              ) : sortedWorkspaces.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('title')}>
                          {t('profile.title')} {getSortArrow('title')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('language')}>
                          {t('profile.language')} {getSortArrow('language')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('visibility')}>
                          {t('profile.visibility')} {getSortArrow('visibility')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('created')}>
                          {t('profile.created')} {getSortArrow('created')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('profile.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedWorkspaces.map((workspace) => (
                        <tr 
                          key={workspace._id} 
                          className="hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all duration-150 ease-in-out group"
                          onClick={(e) => handleRowClick(e)}
                          onDoubleClick={() => handleRowDoubleClick(workspace._id)}
                          onKeyDown={(e) => handleRowKeyDown(e, workspace._id)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${t('profile.open')} ${workspace.title}`}
                          title={t('profile.double_click_hint')}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {workspace.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {workspace.language}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {workspace.isPublic ? t('profile.public') : t('profile.private')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(workspace.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={e => {
                                e.stopPropagation(); // Prevent row click
                                handleCtrlClickNavigation(e, `/editor/${workspace._id}`, navigate);
                              }}
                              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2 transition-all duration-150 hover:scale-105"
                            >
                              {t('profile.open')}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleDeleteWorkspace(workspace._id);
                              }}
                              disabled={deletingId === workspace._id}
                              className={`px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 hover:scale-105 ${deletingId === workspace._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {deletingId === workspace._id ? t('profile.deleting') : t('profile.delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) :
                <div className="p-6 text-center text-gray-500">
                  <p className="mb-4">{t('profile.no_projects')}</p>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    onClick={handleCreateNewProject}
                  >
                    {t('profile.create_new_project')}
                  </button>
                </div>
              }
            </>
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

        /* Smooth transitions for table rows */
        tr {
          transition: all 0.15s ease-in-out;
        }

        tr:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Button hover effects */
        tr button {
          position: relative;
          z-index: 10;
        }

        tr button:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Focus state for keyboard navigation */
        tr:focus {
          outline: 2px solid #d1d5db; /* Tailwind gray-300 */
          outline-offset: -2px;
        }

        /* Forsiraj svetlo sivu boju na selektovanom redu */
        tr.bg-gray-100, tr.bg-gray-100:active {
          background-color: #f3f4f6 !important;
          box-shadow: none !important;
          transform: none !important;
        }

        /* Double-click hint styling */
        .double-click-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 0.5rem 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default MyProjects; 
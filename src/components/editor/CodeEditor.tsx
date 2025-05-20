import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import xml from 'highlight.js/lib/languages/xml'; // For HTML
import css from 'highlight.js/lib/languages/css';
import 'highlight.js/styles/atom-one-dark.css'; // Import a theme
import blurBg from '../../assets/bluredBackground.jpg';

// Register the languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);

// Custom CSS to force editor styling
const editorStyles = `
  #codeEditor, #codeEditor * {
    font-family: 'Fira Code', 'Fira Mono', monospace !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    outline: none !important;
    box-shadow: none !important;
  }
  
  #codeEditor textarea {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  #codeEditor pre {
    font-family: inherit !important;
    font-size: inherit !important;
    line-height: inherit !important;
    border: none !important;
    outline: none !important;
  }
    
    /* color of comments */
    .hljs-comment {
    color: #8f8f8f !important;
   }
  
  #codeEditor div {
    border: none !important;
    outline: none !important;
  }
  
  /* Remove any borders or outlines on focus/active states */
  #codeEditor *:focus, 
  #codeEditor *:active,
  #codeEditor textarea:focus,
  #codeEditor textarea:active {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
`;

// Add these props to the component definition
interface CodeEditorProps {
  sharedWorkspaceId?: string;
  isSharedView?: boolean;
}

const CodeEditor = ({ sharedWorkspaceId, isSharedView = false }: CodeEditorProps) => {
  const { id: paramWorkspaceId } = useParams();
  const workspaceId = sharedWorkspaceId || paramWorkspaceId;
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { openModal, showConfirmation } = useModal();
  const { setHasActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [code, setCode] = useState('// Start coding here...\n\n');
  const [language, setLanguage] = useState('javascript');
  const [access, setAccess] = useState('Public');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [title, setTitle] = useState('Untitled Project');
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const shareInputRef = useRef<HTMLInputElement>(null);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const codeRef = useRef(code);
  
  // Add this ref to track the current access level - helps with closures in async callbacks
  const accessRef = useRef('Public');
  
  // Keep the ref in sync with the state
  useEffect(() => {
    codeRef.current = code;
    accessRef.current = access;
  }, [code, access]);
  
  // Try to load code from localStorage on mount if we're not loading an existing workspace
  useEffect(() => {
    if (!workspaceId && !isSharedView && !isLoadingWorkspace) {
      const savedCode = localStorage.getItem('unsavedCode');
      const savedLanguage = localStorage.getItem('unsavedLanguage');
      const savedTitle = localStorage.getItem('unsavedTitle');
      
      if (savedCode) {
        setCode(savedCode);
      }
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      if (savedTitle) {
        setTitle(savedTitle);
      }
    }
  }, [workspaceId, isSharedView, isLoadingWorkspace]);
  
  // Memoize the save function to use in the effect
  const handleAutoSave = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      console.log('Auto-saving workspace...');
      
      // If in edit mode, update the existing workspace
      const url = isEditMode ? `/api/workspaces/${workspaceId}` : '/api/workspaces';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: title,
          code: codeRef.current,
          language: language,
          isPublic: accessRef.current === 'Public'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error auto-saving:', errorData);
        return;
      }
      
      const data = await response.json();
      
      // If creating new workspace, update URL to enable edit mode
      if (!isEditMode) {
        setHasActiveWorkspace(true);
        
        // If in shared view, stay there, otherwise navigate to normal editor URL
        if (!isSharedView) {
          navigate(`/editor/${data._id}`, { replace: true });
        }
        setIsEditMode(true);
        
        // Clear localStorage saved code after successful save of a new workspace
        localStorage.removeItem('unsavedCode');
        localStorage.removeItem('unsavedLanguage');
        localStorage.removeItem('unsavedTitle');
      }
      
      console.log('Auto-save successful');
      setLastSaved(Date.now());
    } catch (error) {
      console.error('Error auto-saving project:', error);
    }
  }, [isAuthenticated, isEditMode, workspaceId, title, language, accessRef, isSharedView, navigate, setHasActiveWorkspace]);
  
  // Setup autosave to localStorage (for all users) and to server (for authenticated users)
  useEffect(() => {
    if (isSharedView) return; // Don't autosave in shared view
    
    // Save to localStorage every 2 seconds when code changes
    const localSaveInterval = setInterval(() => {
      const currentCode = codeRef.current;
      if (currentCode) {
        localStorage.setItem('unsavedCode', currentCode);
        localStorage.setItem('unsavedLanguage', language);
        localStorage.setItem('unsavedTitle', title);
      }
    }, 2000);
    
    // Server autosave for authenticated users every 30 seconds
    const serverSaveInterval = setInterval(() => {
      if (isAuthenticated && workspaceId && (Date.now() - lastSaved > 30000)) {
        // Only save if code has changed since last save
        if (codeRef.current && !isSaving) {
          handleAutoSave();
        }
      }
    }, 30000);
    
    return () => {
      clearInterval(localSaveInterval);
      clearInterval(serverSaveInterval);
    };
  }, [isAuthenticated, workspaceId, language, title, isSharedView, isSaving, lastSaved, handleAutoSave]);
  
  // Handle state passed from the CreateProject component
  useEffect(() => {
    if (location.state) {
      const { projectName, language: projectLanguage, isNewProject } = location.state as { 
        projectName?: string;
        language?: string; 
        isNewProject?: boolean;
      };
      
      if (isNewProject) {
        if (projectName) setTitle(projectName);
        if (projectLanguage) setLanguage(projectLanguage);
        
        // Clear the state to prevent reapplying on refresh
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);
  
  // Set active workspace when component mounts with a workspaceId or state
  useEffect(() => {
    if (workspaceId || (location.state && location.state.isNewProject)) {
      setHasActiveWorkspace(true);
    }
  }, [workspaceId, location.state, setHasActiveWorkspace]);
  
  // Fetch workspace data if ID is provided
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;
      
      setIsLoadingWorkspace(true);
      try {
        // Get the current token
        const token = localStorage.getItem('token');
        
        console.log('Fetching workspace with ID:', workspaceId);
        console.log('Token available:', token ? 'Yes' : 'No');
        
        const response = await fetch(`/api/workspaces/${workspaceId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          // Skip cache to ensure fresh request
          cache: 'no-store'
        });
        
        console.log('Fetch response status:', response.status);
        
        // Handle specific error cases
        if (response.status === 403) {
          // Try to get error details
          const errorData = await response.json().catch(() => ({}));
          console.log('403 Error details:', errorData);
          
          if (errorData.isPrivate) {
            if (!isAuthenticated) {
              // User is not authenticated but trying to access a private workspace
              setSaveMessage('This workspace is private. Please log in to access it.');
              setTimeout(() => {
                openModal('login');
                navigate('/editor');
              }, 2000);
            } else {
              // User is authenticated but doesn't own this private workspace
              throw new Error('This workspace is private. Only the owner can access it.');
            }
          } else {
            throw new Error('You do not have permission to access this workspace.');
          }
          
          return; // Exit early
        } else if (!response.ok) {
          throw new Error('Failed to fetch workspace');
        }
        
        const data = await response.json();
        console.log('Workspace data loaded successfully');
        
        setCode(data.code);
        setLanguage(data.language);
        setAccess(data.isPublic ? 'Public' : 'Private');
        setTitle(data.title);
        setIsEditMode(true);
        
        // Clear any unsaved data in localStorage since we've loaded a workspace
        localStorage.removeItem('unsavedCode');
        localStorage.removeItem('unsavedLanguage');
        localStorage.removeItem('unsavedTitle');
      } catch (error: unknown) {
        console.error('Error loading workspace:', error);
        setSaveMessage(error instanceof Error ? error.message : 'Failed to load workspace. Redirecting to new editor...');
        
        // Only redirect if not in shared view
        if (!isSharedView) {
          setTimeout(() => {
            navigate('/editor');
          }, 3000);
        }
      } finally {
        setIsLoadingWorkspace(false);
      }
    };
    
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId, navigate, isAuthenticated, openModal, isSharedView]);
  
  // Inject custom CSS styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = editorStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Handle paste event to strip formatting
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    };
    
    const editorElement = document.getElementById('codeEditor');
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste);
    }
    
    return () => {
      if (editorElement) {
        editorElement.removeEventListener('paste', handlePaste);
      }
    };
  }, []);
  
  // Redirect if not authenticated
  useEffect(() => {
    // Remove redirect for non-authenticated users
    // Now everyone can use the editor
  }, [isAuthenticated, isLoading, navigate]);
  
  // Default starter code
  const getStarterCode = (): string => {
    return '// Start coding here...\n\n\n';
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Don't reset code when changing language
  };
  
  // Set initial starter code - only run once on mount and when not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setCode(getStarterCode());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // Highlight.js highlighting function
  const highlightCode = (code: string) => {
    if (!code) return '';
    try {
      return hljs.highlight(code, { language }).value;
    } catch (error) {
      return hljs.highlight(code, { language: 'plaintext' }).value;
    }
  };
  
  // Handle saving project
  const handleSave = async () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      console.log('Sending save request to /api/workspaces');
      
      // If in edit mode, update the existing workspace
      const url = isEditMode ? `/api/workspaces/${workspaceId}` : '/api/workspaces';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: title,
          code: code,
          language: language,
          isPublic: accessRef.current === 'Public'
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to save project');
      }
      
      const data = await response.json();
      console.log('Save successful:', data);
      
      // If creating new workspace, update URL to enable edit mode
      if (!isEditMode) {
        setHasActiveWorkspace(true);
        
        // If in shared view, stay there, otherwise navigate to normal editor URL
        if (!isSharedView) {
          navigate(`/editor/${data._id}`, { replace: true });
        }
        setIsEditMode(true);
        
        // Clear localStorage saved code after successful save of a new workspace
        localStorage.removeItem('unsavedCode');
        localStorage.removeItem('unsavedLanguage');
        localStorage.removeItem('unsavedTitle');
      }
      
      setLastSaved(Date.now());
      setSaveMessage('Project saved successfully!');
      
      // After 3 seconds, clear the save message
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving project:', error);
      setSaveMessage('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle sharing functionality
  const handleShare = async () => {
    // If in a private workspace, show a message
    if (accessRef.current === 'Private' && !isSharedView) {
      setSaveMessage('Private workspaces cannot be shared. Change to Public first.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    // If already in shared view, just show the current URL
    if (isSharedView) {
      const currentUrl = window.location.href;
      setShareUrl(currentUrl);
      setShowShareDialog(true);
      return;
    }
    
    if (!workspaceId) {
      setSaveMessage('Please save your workspace before sharing');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      setIsShareLoading(true);
      
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspaceId
        })
      });

      if (response.status === 403) {
        // Handle private workspace error
        const errorData = await response.json();
        if (errorData.isPrivate) {
          setSaveMessage('Private workspaces cannot be shared. Change to Public first.');
          setTimeout(() => setSaveMessage(''), 3000);
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      const shareLink = `${window.location.origin}/s/${data.shortCode}`;
      setShareUrl(shareLink);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Error sharing workspace:', error);
      setSaveMessage('Failed to create share link');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsShareLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select();
      document.execCommand('copy');
      setSaveMessage('Link copied to clipboard!');
      setTimeout(() => {
        setSaveMessage('');
        setShowShareDialog(false);
      }, 2000);
    }
  };
  
  // Add this helper function to handle redirecting to regular editor view
  const handleViewInEditor = () => {
    if (workspaceId) {
      navigate(`/editor/${workspaceId}`);
    }
  };
  
  // Handle access change (public/private)
  const handleAccessChange = async (newAccess: string) => {
    // Update the ref immediately
    accessRef.current = newAccess;
    
    // If we're editing an existing workspace, update it
    if (isEditMode && workspaceId) {
      // Only update if user is authenticated
      if (!isAuthenticated) {
        return;
      }
      
      try {
        const isPublic = newAccess === 'Public';
        
        // Show a confirmation dialog if making the workspace private
        if (!isPublic) {
          // When changing to private, immediately update the UI
          setAccess('Private');
          
          // Use custom confirmation dialog instead of window.confirm
          showConfirmation({
            title: 'Change to Private?',
            message: 'Making this workspace private will disable any existing share links. Only you will be able to access it.',
            onConfirm: async () => {
              try {
                const response = await fetch(`/api/workspaces/${workspaceId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    isPublic: false
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to update workspace privacy');
                }
                
                // Force UI update to ensure consistency
                setAccess('Private');
                
                setSaveMessage('Workspace is now private');
                setTimeout(() => setSaveMessage(''), 3000);
              } catch (error) {
                console.error('Error updating workspace privacy:', error);
                setSaveMessage('Failed to update workspace privacy');
                // Revert the UI change if the API call fails
                setAccess('Public');
                accessRef.current = 'Public';
                setTimeout(() => setSaveMessage(''), 3000);
              }
            },
            onCancel: () => {
              // User canceled, keep as public
              setAccess('Public');
              accessRef.current = 'Public';
            }
          });
          return; // Exit early as the actual change will happen in the onConfirm callback
        } else {
          // When changing to public, immediately update the UI
          setAccess('Public');
          
          // If making public (no confirmation needed), proceed with API call
          const response = await fetch(`/api/workspaces/${workspaceId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              isPublic: true
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update workspace privacy');
          }
          
          setSaveMessage('Workspace is now public');
          setTimeout(() => setSaveMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error updating workspace privacy:', error);
        setSaveMessage('Failed to update workspace privacy');
        setTimeout(() => setSaveMessage(''), 3000);
        // Revert the UI change
        if (accessRef.current === 'Public') {
          setAccess('Private');
        } else {
          setAccess('Public');
        }
      }
    } else {
      // Just update the local state if we're not in edit mode
      setAccess(newAccess);
    }
  };
  
  if (isLoading || isLoadingWorkspace) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12"
      style={{
        backgroundImage: `url(${blurBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Share this workspace</h3>
            <p className="mb-4">Anyone with this link can view this workspace:</p>
            <div className="flex">
              <input
                ref={shareInputRef}
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow border rounded-l p-2 bg-gray-50"
              />
              <button 
                onClick={handleCopyLink}
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input
                  type="text"
                  className="text-white text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-48 sm:w-64"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Project Title"
                  readOnly={isSharedView}
                />
                {isSharedView && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs text-white">
                    Shared View
                  </span>
                )}
              </div>
              <div className="flex space-x-2 items-center">
                {saveMessage && (
                  <span className={`text-sm mr-2 ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMessage}
                  </span>
                )}
                
                {isSharedView ? (
                  // For shared view
                  <button 
                    onClick={handleViewInEditor}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-sm"
                  >
                    View in Editor
                  </button>
                ) : (
                  // For normal view
                  <>
                    {isAuthenticated ? (
                      <button 
                        className={`${isSaving ? 'bg-gray-500' : 'bg-green-600 hover:border-green-600 hover:bg-green-700'} text-white px-4 py-1 rounded text-sm`}
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-amber-300 text-xs mr-2">
                          <button onClick={() => openModal('login')} className="underline text-amber-300">Login</button> or <button onClick={() => openModal('register')} className="underline text-amber-300">Register</button> to save your code
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Share button with conditional styling based on access */}
                <button 
                  className={`${
                    (access === 'Public' || (isSharedView && !isLoadingWorkspace)) 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-500 cursor-not-allowed'
                  } text-white px-4 py-1 rounded text-sm ${isShareLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleShare}
                  disabled={isShareLoading || (access === 'Private' && !isSharedView)}
                  title={access === 'Private' ? 'Private workspaces cannot be shared' : 'Share this workspace'}
                >
                  {isShareLoading ? 'Creating...' : 'Share'}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-300 text-sm mr-2">Language:</span>
                <select 
                  className={`bg-gray-700 text-white px-3 py-1 rounded text-sm ${isSharedView ? 'cursor-not-allowed' : ''}`}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isSharedView}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="php">PHP</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>
              
              {isAuthenticated && !isSharedView && (
                <>
                  <div className="flex items-center">
                    <span className="text-gray-300 text-sm mr-2">Access:</span>
                    <select 
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      value={access}
                      onChange={(e) => handleAccessChange(e.target.value)}
                    >
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-700 flex flex-col min-h-[600px]">
            <div className="flex-1">
              <Editor
                value={code}
                onValueChange={code => !isSharedView && setCode(code)}
                highlight={code => highlightCode(code)}
                padding={16}
                style={{
                  fontFamily: "'Fira code', 'Fira Mono', monospace",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#f7fafc',
                  width: '100%',
                  minHeight: '650px',
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none'
                }}
                textareaId="codeEditor"
                className="w-full focus:outline-none focus:ring-0 focus:border-0 active:outline-none active:ring-0 active:border-0"
                readOnly={isSharedView}
              />
            </div>
          </div>
                
          <div className="bg-gray-800 bg-opacity-90 px-4 py-3 flex justify-between text-gray-200 text-sm border-t-0 minHeight: '100%',">
            <div>
              Lines: {code.split('\n').length}
            </div>
            <div className="flex space-x-4">
              <div>Characters: {code.length}</div>
              <div>Language: {language}</div>
              {!isSharedView && (
                <div className="text-xs text-gray-400">
                  {!isAuthenticated ? 'Auto-saved to browser' : workspaceId ? 'Auto-saved' : 'Auto-saved to browser'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 
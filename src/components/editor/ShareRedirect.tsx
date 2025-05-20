import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import CodeEditor from './CodeEditor';

const ShareRedirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const { setHasActiveWorkspace } = useWorkspace();
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Link Error');
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const resolveShareLink = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the workspace ID from the short code
        const response = await fetch(`/api/share/${shortCode}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log('Share error response:', errorData);
          
          if (response.status === 404) {
            setErrorTitle('Invalid Link');
            setError('The shared link has expired or does not exist');
          } else if (response.status === 403) {
            // Handle private workspace specifically
            if (errorData.isPrivate) {
              setErrorTitle('Access Denied');
              setError('This workspace is private and can only be accessed by its owner.');
            } else {
              setError('This workspace is no longer publicly accessible');
            }
          } else {
            setError('Failed to load the shared workspace');
          }
          
          setShowErrorDialog(true);
          setIsLoading(false);
          
          // Redirect to homepage after a delay
          setTimeout(() => {
            navigate('/');
          }, 4000);
          
          return;
        }
        
        const data = await response.json();
        
        // Mark that we have an active workspace
        setHasActiveWorkspace(true);
        
        // Store the workspace ID instead of redirecting
        setWorkspaceId(data.workspaceId);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error resolving share link:', error);
        setError(error.message || 'Failed to load the shared workspace');
        setShowErrorDialog(true);
        setIsLoading(false);
        
        // Redirect to homepage after a delay for any error
        setTimeout(() => {
          navigate('/');
        }, 4000);
      }
    };
    
    resolveShareLink();
  }, [shortCode, setHasActiveWorkspace, navigate]);
  
  // Error dialog
  if (showErrorDialog) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl transform animate-fadeIn" 
             style={{ animationDuration: '0.3s' }}>
          <div className="mb-4">
            {errorTitle === 'Private Workspace' ? (
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m-3 5h2.5a2 2 0 100-4h-2.5" />
                </svg>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{errorTitle}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to homepage in a few seconds...</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home Now
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading shared workspace...</p>
        </div>
      </div>
    );
  }
  
  // If we have a workspace ID and are not loading, render the CodeEditor directly
  return workspaceId ? <CodeEditor sharedWorkspaceId={workspaceId} isSharedView={true} /> : null;
};

export default ShareRedirect; 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const { isAuthenticated } = useAuth();
  const { setHasActiveWorkspace } = useWorkspace();
  const [projectName, setProjectName] = useState('Untitled Project');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      if (isAuthenticated) {
        // Get the current token
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found but user is authenticated');
          if (!isPublic) {
            throw new Error('You must be logged in to create private projects');
          }
        }

        console.log('Creating workspace with settings:', {
          title: projectName,
          language,
          isPublic,
          authenticated: !!token
        });
        
        // Send API request to create project in the database
        const response = await fetch('/api/workspaces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            title: projectName,
            language,
            code: '// Start coding here...\n\n',
            isPublic
          })
        });
        
        console.log('Create workspace response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error creating workspace:', errorData);
          throw new Error(errorData.message || 'Failed to create project');
        }
        
        const data = await response.json();
        console.log('Workspace created successfully:', data._id);
        
        setHasActiveWorkspace(true);
        
        // Clear any potential old error messages
        setError('');
        
        // Close the modal
        closeModal();
        
        // Small delay to ensure token processing
        setTimeout(() => {
          navigate(`/editor/${data._id}`);
        }, 200);
      } else {
        // For non-authenticated users, just redirect to editor with parameters
        // Non-authenticated users can only create public workspaces
        setHasActiveWorkspace(true);
        closeModal();
        navigate('/editor', { 
          state: { 
            projectName, 
            language,
            isNewProject: true
          } 
        });
      }
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 sm:mx-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 bg-white hover:border-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-gray-700 text-sm font-bold mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="language" className="block text-gray-700 text-sm font-bold mb-2">
              Programming Language
            </label>
            <select 
              id="language"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
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
          
          {isAuthenticated && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Visibility
              </label>
              <div className="flex items-center">
                <input
                  id="public"
                  type="radio"
                  name="visibility"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  disabled={isLoading}
                />
                <label htmlFor="public" className="ml-2 block text-sm text-gray-700">
                  Public
                </label>
              </div>
              <div className="flex items-center mt-2">
                <input
                  id="private"
                  type="radio"
                  name="visibility"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  disabled={isLoading}
                />
                <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                  Private
                </label>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
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

const CodeEditor = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [code, setCode] = useState('// Start coding here...\n\n');
  const [language, setLanguage] = useState('javascript');
  const [access, setAccess] = useState('Public');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
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
  
  // Set initial starter code - only run once on mount
  useEffect(() => {
    setCode(getStarterCode());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run once on mount

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
      
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Untitled Project', // You could add a title input field
          code: code,
          language: language,
          isPublic: access === 'Public'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save project');
      }
      
      await response.json();
      
      setSaveMessage('Project saved successfully!');
      
      // Optional: Navigate to the saved project page
      // navigate(`/project/${data._id}`);
      
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
  
  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-white text-lg font-medium">CodeShare Editor</h1>
              <div className="flex space-x-2 items-center">
                {saveMessage && (
                  <span className={`text-sm mr-2 ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMessage}
                  </span>
                )}
                {isAuthenticated ? (
                  <button 
                    className={`${isSaving ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-1 rounded text-sm`}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                ) : (
                  <div className="flex items-center">
                    <span className="text-amber-300 text-xs mr-2">
                      <button onClick={() => openModal('login')} className="underline text-amber-300">Login</button> or <button onClick={() => openModal('register')} className="underline text-amber-300">Register</button> to save your code
                    </span>
                  </div>
                )}
                {(access === 'Public' || !isAuthenticated) && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">
                    Share
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-300 text-sm mr-2">Language:</span>
                <select 
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
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
                <>
                  <div className="flex items-center">
                    <span className="text-gray-300 text-sm mr-2">Access:</span>
                    <select 
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      value={access}
                      onChange={(e) => setAccess(e.target.value)}
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
                onValueChange={code => setCode(code)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 
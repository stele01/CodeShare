import { useState, useEffect } from 'react';

const Features = () => {
  const [animate, setAnimate] = useState(false);
  
  // Start animation when component is visible in viewport
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('features');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isVisible) {
          setAnimate(true);
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Check immediately in case features section is already visible
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 1,
      title: 'Real-time Collaboration',
      description: 'Multiple users can edit code simultaneously with instant updates for everyone.',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Syntax Highlighting',
      description: 'Support for multiple programming languages with beautiful syntax highlighting.',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Secure Sharing',
      description: 'Easily share your code snippets through secure links - perfect for quick collaboration',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Code Execution',
      description: 'Run your code directly in the browser to see results instantly - perfect for testing and learning',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div id="features" className="py-16 bg-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 
            className={`text-base font-semibold text-blue-600 tracking-wide uppercase opacity-0 ${
              animate ? 'animate-fadeInDown' : ''
            }`}
            style={{ 
              animationDuration: '0.8s',
              animationFillMode: 'forwards'
            }}
          >
            Features
          </h2>
          
          <p 
            className={`mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight opacity-0 ${
              animate ? 'animate-fadeInUp' : ''
            }`}
            style={{ 
              animationDuration: '0.8s',
              animationDelay: '0.2s',
              animationFillMode: 'forwards'
            }}
          >
            Everything you need for code sharing
          </p>
          
          <p 
            className={`max-w-xl mt-5 mx-auto text-xl text-gray-500 opacity-0 ${
              animate ? 'animate-fadeInUp' : ''
            }`}
            style={{ 
              animationDuration: '0.8s',
              animationDelay: '0.4s',
              animationFillMode: 'forwards'
            }}
          >
            Our platform provides all the tools you need to collaborate efficiently.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                className={`pt-6 opacity-0 ${animate ? 'animate-fadeInUp' : ''}`}
                style={{ 
                  animationDuration: '0.7s',
                  animationDelay: `${0.2 * index + 0.6}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full hover:shadow-md transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        {feature.icon}
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Include the same animations as in Hero.tsx */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInDown {
          animation-name: fadeInDown;
        }
        
        .animate-fadeInUp {
          animation-name: fadeInUp;
        }
      `}</style>
    </div>
  );
};

export default Features; 
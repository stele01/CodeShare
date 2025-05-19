import { useState, useRef, useEffect } from 'react';

type FAQItemProps = {
  question: string;
  answer: string;
  isLast: boolean;
  isOpen: boolean;
  toggleOpen: () => void;
};

const FAQItem = ({ question, answer, isLast, isOpen, toggleOpen }: FAQItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className={`${!isLast ? 'border-b border-gray-200' : ''}`}>
      <button
        className="flex justify-between items-center w-full py-4 px-4 text-left focus:outline-none bg-white hover:bg-gray-50"
        onClick={toggleOpen}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Answer Container with animation */}
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          maxHeight: isOpen ? contentRef.current ? `${contentRef.current.scrollHeight + 32}px` : '500px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        {/* Cloud-styled Answer */}
        <div 
          ref={contentRef}
          className="mx-4 my-4 bg-white rounded-lg shadow-lg border border-gray-100"
        >
          {/* Answer Content */}
          <div className="p-5">
            <p className="text-gray-600">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);
  
  // Start animation when component is visible in viewport
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('faq');
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
    // Check immediately in case FAQ section is already visible
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const faqItems = [
    {
      question: "What is CodeShare?",
      answer: "CodeShare is a platform that allows developers to write, save, and share code snippets with others. It supports multiple programming languages and provides syntax highlighting for better readability."
    },
    {
      question: "Do I need an account to use CodeShare?",
      answer: "You can use the code editor without an account, but you'll need to create an account to save your code snippets and access them later. Creating an account is free and only takes a minute."
    },
    {
      question: "Which programming languages are supported?",
      answer: "CodeShare currently supports JavaScript, Python, Java, C#, C++, PHP, HTML, and CSS. We're constantly working on adding support for more languages."
    },
    {
      question: "Can I collaborate with others on a code snippet?",
      answer: "Currently, CodeShare allows you to share your code snippets with others via a link. Real-time collaboration features are on our roadmap and will be available in future updates."
    },
    {
      question: "Is my code private?",
      answer: "You can choose whether your code snippets are public or private. Public snippets can be viewed by anyone with the link, while private snippets are only accessible to you."
    },
    {
      question: "Is CodeShare free to use?",
      answer: "Yes, CodeShare is completely free to use. We may introduce premium features in the future, but the core functionality will always remain free."
    }
  ];

  // Function to toggle FAQ item open/closed
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="bg-gray-50 py-16 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 
            className={`text-base font-semibold text-blue-600 tracking-wide uppercase opacity-0 ${
              animate ? 'animate-fadeInDown' : ''
            }`}
            style={{ 
              animationDuration: '0.8s',
              animationFillMode: 'forwards'
            }}
          >
            FAQ
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
            Frequently Asked Questions
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
            Find answers to common questions about CodeShare.
          </p>
        </div>
        
        <div 
          className={`max-w-3xl mx-auto opacity-0 ${animate ? 'animate-fadeInUp' : ''}`}
          style={{ 
            animationDuration: '0.8s',
            animationDelay: '0.6s',
            animationFillMode: 'forwards'
          }}
        >
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className={`opacity-0 ${animate ? 'animate-fadeInUp' : ''}`}
                style={{ 
                  animationDuration: '0.6s',
                  animationDelay: `${0.1 * index + 0.8}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <FAQItem
                  question={item.question}
                  answer={item.answer}
                  isLast={index === faqItems.length - 1}
                  isOpen={openIndex === index}
                  toggleOpen={() => toggleItem(index)}
                />
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

export default FAQ; 
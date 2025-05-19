import React, { ReactNode } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'none';

interface AnimateOnScrollProps {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  initiallyVisible?: boolean;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  type = 'fade-up',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = '',
  initiallyVisible = false,
}) => {
  const [ref, isVisible] = useScrollAnimation({
    threshold,
    triggerOnce: true,
  });

  // Initial animation styles - with enhanced distances for more dramatic effects
  const getInitialStyles = () => {
    switch (type) {
      case 'fade-up':
        return { opacity: 0, transform: 'translateY(50px)' };
      case 'fade-down':
        return { opacity: 0, transform: 'translateY(-50px)' };
      case 'fade-left':
        return { opacity: 0, transform: 'translateX(50px)' };
      case 'fade-right':
        return { opacity: 0, transform: 'translateX(-50px)' };
      case 'zoom-in':
        return { opacity: 0, transform: 'scale(0.8)' };
      case 'none':
        return {};
      default:
        return { opacity: 0, transform: 'translateY(50px)' };
    }
  };

  // Animated styles
  const getAnimatedStyles = () => {
    return { opacity: 1, transform: 'translate(0, 0) scale(1)' };
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        ...(isVisible || initiallyVisible ? getAnimatedStyles() : getInitialStyles()),
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionProperty: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll; 
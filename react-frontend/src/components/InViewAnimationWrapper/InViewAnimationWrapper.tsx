import React from 'react';
import { Box } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';

type AnimatableElement = React.ReactElement<{ animate?: boolean | undefined }>;

interface InViewAnimationWrapperProps {
  children: React.ReactNode;
}

/**
 * Custom wrapper to inject the animate={inViewport} prop to all direct children
 * that support it (e.g., TextAnimate components).
 */
export const InViewAnimationWrapper: React.FC<InViewAnimationWrapperProps> = ({ children }) => {
  const { ref, inViewport } = useInViewport(); 

  const renderChildrenWithAnimation = (child: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(child)) {
      const animatableChild = child as AnimatableElement;
      return React.cloneElement(animatableChild, { 
        animate: inViewport 
      });
    }
    
    // Return the child unchanged if it's not a React element
    return child;
  };

  const childrenWithAnimation = React.Children.map(children, renderChildrenWithAnimation);

  return (
    <Box ref={ref} mx="auto"> 
      {childrenWithAnimation}
    </Box>
  );
};
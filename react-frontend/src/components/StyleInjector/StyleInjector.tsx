import React, { useEffect } from 'react';

interface StyleInjectorProps {
  children: string; // The raw CSS string
  id?: string;
}

/**
 * A component to inject raw CSS into the document head.
 * This should only be used for MDX components where CSS cannot be globally included.
 */
export const StyleInjector: React.FC<StyleInjectorProps> = ({ children, id = 'mdx-custom-styles' }) => {
  useEffect(() => {
    let styleTag = document.getElementById(id) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.setAttribute('type', 'text/css');
      styleTag.setAttribute('id', id);
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = children; 
    
    // Cleanup (optional, since this style should persist)
    return () => { 
        // We'll let it persist to avoid flicker/re-injection on component remount
    };
  }, [children, id]);

  return null; // This component renders nothing
};
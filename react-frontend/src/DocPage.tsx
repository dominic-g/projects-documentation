import React, { useState, useEffect } from 'react';
import { Title, Text, ScrollArea, Center } from '@mantine/core'; 
import * as Mantine from '@mantine/core'; 
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { useMDXComponents as getMDXComponents } from '@mdx-js/react';
import { useMDXComponents as mdxComponentsHook } from '@/mdx-components.tsx';


export interface Section {
  type: 'normal' | 'separator';
  title: string;
  content: string;
  placement: 'top' | 'bottom';
}

export interface DocData {
  project_title: string;
  tagline_text: string;
  overview_text: string;
  logo_url: string;
  button_text: string;
  button_icon: string;
  button_link: string;
  dependencies: string;
  marquee_features: string[];
  footer_html: string;
  doc_sections: Section[]; 
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocPageProps {
  title: string;
  mdxContent: string;
  onTocChange: (toc: TocItem[]) => void;
}

const DocPage: React.FC<DocPageProps> = ({ title, mdxContent, onTocChange }) => {
  const [compiledMdx, setCompiledMdx] = useState<React.ReactElement | null>(null);
  
  // NOTE: You must use the components provided by the useMDXComponents *hook*.
  // It handles context. Let's combine components here cleanly:
  const providedComponents = mdxComponentsHook();
  
  // Combine all standard MDX and all Mantine components here for maximum reach in the render scope
  const components = {
    ...providedComponents, // Components from our injected list
    // You only need to add components to this object if they are directly
    // called as simple MDX tags AND were NOT defined in mdx-components.tsx.
    Button: Mantine.Button,
    Center: Mantine.Center,
    Text: Mantine.Text,
    Title: Mantine.Title,
    ScrollArea: Mantine.ScrollArea,
    // Add all others (Card, Stack, etc.) if they were NOT already defined.
    // However, if the components are in the mdx-components.tsx list, the custom 
    // export is sufficient.

  };

  useEffect(() => {
    // Hoisting check: Declare run/compile-related items OUTSIDE of try/catch if possible, 
    // or ensure all await operations are defined clearly.
    let isMounted = true;
    
    const compileAndRender = async () => {
      if (!mdxContent) return; // Prevent compile on empty data
      
      try {
        const compiled = await compile(mdxContent, {
          outputFormat: 'function-body',
          providerImportSource: '@mdx-js/react',
        });
        
        const { default: Content } = await run(compiled, {
          ...runtime,
          // components: components,
          useMDXComponents: getMDXComponents,
        });
        
        if (!isMounted) return;
        
        const newToc: TocItem[] = [];
        const headings = mdxContent.matchAll(/^(#{2,4})\s+(.+)/gm);
        for (const match of headings) {
          const level = match[1].length;
          const text = match[2];
          const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          newToc.push({ id: slug, text, level });
        }

        setCompiledMdx(<Content components={components} />);

        onTocChange(newToc);

      } catch (error) {
        if (!isMounted) return; // Cleanup check
        console.error('MDX run API Failed:', error);
        setCompiledMdx(
          <Text color="red">CRITICAL: MDX Run API Failed. Final execution error. Check console.</Text>
        );
      }
    };

    compileAndRender();
    return () => { isMounted = false };
  }, [mdxContent]); // Removed components and onTocChange from dependencies as they are functions

  if (!compiledMdx) {
    return (
      <Center h={200}>
        <Text>Loading content...</Text>
      </Center>
    );
  }
  // The rest of the return block is fine:
  return (
    <ScrollArea h="100%" style={{ padding: '0 32px' }}>
      <Title order={1} style={{ marginBottom: '20px' }}>
        {title}
      </Title>
      {compiledMdx}
    </ScrollArea>
  );
};

export default DocPage;
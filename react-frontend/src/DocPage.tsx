import React, { useState, useEffect } from 'react';
import { Text, ScrollArea, Center } from '@mantine/core'; 
import * as Mantine from '@mantine/core'; 
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { useMDXComponents as getMDXComponents } from '@mdx-js/react';
import { useMDXComponents as mdxComponentsHook } from '@/mdx-components.tsx';
import { FileTree } from "./components/FileTreeLabel/FileTree";


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

const DocPage: React.FC<DocPageProps> = ({ mdxContent, onTocChange }) => {
  const [compiledMdx, setCompiledMdx] = useState<React.ReactElement | null>(null);
  
  const providedComponents = mdxComponentsHook();
  
  const components = {
    ...providedComponents,
    Button: Mantine.Button,
    Center: Mantine.Center,
    Text: Mantine.Text,
    Title: Mantine.Title,
    ScrollArea: Mantine.ScrollArea,
    Callout: ({ children }: any) => (
      <Mantine.Box p="sm" bg="yellow.0" style={{ borderRadius: 4 }}>
        <Mantine.Text fw={700}>Note: </Mantine.Text>
        {children}
      </Mantine.Box>
    ),
    Steps: ({ children }: any) => (
      <Mantine.Box component="ol" ml="lg" style={{ listStyle: "auto" }}>
        {children}
      </Mantine.Box>
    ),
    FileTree,

  };

  useEffect(() => {
    let isMounted = true;
    
    const compileAndRender = async () => {
      if (!mdxContent) return;
      
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
        
        /*const newToc: TocItem[] = [];
        const headings = mdxContent.matchAll(/^(#{2,4})\s+(.+)/gm);
        for (const match of headings) {
          const level = match[1].length;
          const text = match[2];
          const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          newToc.push({ id: slug, text, level });
        }*/

        setCompiledMdx(<Content components={components} />);

        // onTocChange(newToc);

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
  }, [mdxContent]); 

  useEffect(() => {
    if (compiledMdx && mdxContent) {
      // console.log('--- TOC Scraper Running ---');
      const mainContentElement = document.querySelector('.mantine-AppShell-main'); 

      if (mainContentElement) {
        // console.log('Scraper found main content element.');
        const renderedHeadings = mainContentElement.querySelectorAll('h2, h3, h4'); 
        if (renderedHeadings.length === 0) {
          // console.warn('Scraper found 0 headings (H2, H3, H4) to build TOC.'); // Log 3a: Empty headings
        }
        const newToc: TocItem[] = Array.from(renderedHeadings).map(h => {
            const text = h.textContent || '';
            const slug = h.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            
            if (!h.id) h.setAttribute('id', slug);

            return {
                id: slug,
                text: text,
                level: parseInt(h.tagName.substring(1), 10)
            };
        }).filter(item => item.id);
        
        // console.log('TOC built and sent to App.tsx:', newToc); 
        
        onTocChange(newToc);
      }
    }
  }, [compiledMdx, onTocChange]);

  if (!compiledMdx) {
    return (
      <Center h={200}>
        <Text>Loading content...</Text>
      </Center>
    );
  }
  return (
    <ScrollArea h="100%" style={{ padding: '0 32px' }}>
      {compiledMdx}
    </ScrollArea>
  );
};


export default DocPage;
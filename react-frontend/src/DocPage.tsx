import React, { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
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
  // tagline_text: string;
  // overview_text: string;
  logo_url: string;
  // button_text: string;
  // button_icon: string;
  // button_link: string;
  // dependencies: string;
  // marquee_features: string[];
  // footer_html: string;
  doc_sections: Section[]; 
  welcome_mdx: string;
  show_welcome: boolean;
  footer_mdx: string;
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
  isWelcome?: boolean;
}

const DocPage: React.FC<DocPageProps> = ({ title, mdxContent, onTocChange }) => {
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
          remarkPlugins: [remarkGfm], 
        });
        
        const { default: Content } = await run(compiled, {
          ...runtime,
          // components: components,
          useMDXComponents: getMDXComponents,
        });
        
        if (!isMounted) return;
        

        setCompiledMdx(<Content components={components} />);

        // onTocChange(newToc);

      } catch (error) {
        if (!isMounted) return;
        



        const errorObj = error instanceof Error ? error : new Error('Unknown Parsing Error');
        const errorMessage = errorObj.message;
        // console.log("Error Outpit : ", error, errorObj);
        
        let errorLocation: { line: number, column: number } | null = null;
        const CONTEXT_LINES = 5; // Show 5 lines of context before the error

        let contextLines: string[] = [];


        const fullErrorString = String(error);
        
        // Regex to specifically find the '54:21:' pattern at the start of the string
        const match = fullErrorString.match(/^(\d+):(\d+):/);
        
        if (match) {
            errorLocation = {
                line: parseInt(match[1], 10),
                column: parseInt(match[2], 10)
            };
        }

        // console.log("Error msg matc
        if (errorLocation) {
            const mdxLines = mdxContent.split('\n');
            const errorLineIndex = errorLocation.line - 1; // 0-based index
            const startLineIndex = Math.max(0, errorLineIndex - CONTEXT_LINES);
            
            contextLines = mdxLines.slice(startLineIndex, errorLineIndex + 1);
        }


        console.groupCollapsed('🚨 CRITICAL MDX RENDER FAILURE');
        console.error('ERROR MESSAGE:', errorMessage);
        console.warn('SECTION TITLE:', title);
        if (errorLocation) {
            console.warn(`ERROR LOCATION: Line ${errorLocation.line}, Column ${errorLocation.column}`);
        }
        console.warn('RAW CONTENT (Source of Error):', mdxContent);
        console.groupEnd();
        
        const ErrorContextDisplay = () => {
            if (!errorLocation || contextLines.length === 0) return null;
            
            const errorLineNumber = errorLocation.line;
            const errorColumn = errorLocation.column;
            const errorLineContent = contextLines[contextLines.length - 1]; // The last line is the error line
            const displayStartLine = errorLineNumber - contextLines.length + 1;
            
            // --- Highlight the exact character ---
            const preError = errorLineContent.substring(0, errorColumn - 1);
            const errorChar = errorLineContent.charAt(errorColumn - 1);
            const postError = errorLineContent.substring(errorColumn);
            
            return (
                <Mantine.List.Item>
                    <Mantine.Text fw={700} mb={5}>Approximate Code Location (Line {errorLineNumber}):</Mantine.Text>
                    <Mantine.Code block style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', padding: 0 }}>
                        {contextLines.map((lineContent, index) => {
                            const currentLineNumber = displayStartLine + index;
                            const lineNumberText = `${currentLineNumber}:`.padStart(4, ' ');

                            if (currentLineNumber === errorLineNumber) {
                                return (
                                    <div key={index} style={{ color: 'red', backgroundColor: 'var(--mantine-color-red-9)', padding: '0 8px' }}>
                                        <Mantine.Text component="span" fw={700} c="var(--mantine-color-red-0)">{lineNumberText} </Mantine.Text>
                                        <Mantine.Text component="span" c="var(--mantine-color-red-0)" style={{ whiteSpace: 'pre' }}>
                                            {preError}
                                            <Mantine.Text component="span" c="var(--mantine-color-red-3)" bg="var(--mantine-color-red-0)">{errorChar}</Mantine.Text>
                                            {postError}
                                        </Mantine.Text>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} style={{ color: 'var(--mantine-color-code-text)', padding: '0 8px' }}>
                                        <Mantine.Text component="span" fw={700} c="var(--mantine-color-code-dimmed)">{lineNumberText} </Mantine.Text>
                                        <Mantine.Text component="span" style={{ whiteSpace: 'pre' }}>{lineContent}</Mantine.Text>
                                    </div>
                                );
                            }
                        })}
                    </Mantine.Code>
                </Mantine.List.Item>
            );
        };
        
        // 3. Set the final error message
        setCompiledMdx(
            <Mantine.Alert
                title={`MDX Syntax Error in: ${title}`} 
                color="red"
                mt="xl"
            >
                <Mantine.List>
                    <Mantine.List.Item>Error: **{errorMessage}**</Mantine.List.Item>
                    <ErrorContextDisplay />
                    <Mantine.List.Item>
                       **FOCUS:** The error points to a malformed JSX tag. Check for missing quotes or misplaced slashes near the highlighted position.
                    </Mantine.List.Item>
                </Mantine.List>
                
                <Mantine.Spoiler 
                    maxHeight={50} 
                    showLabel="Show Full Raw MDX Content" 
                    hideLabel="Hide Full Raw MDX Content"
                    mt="md"
                    style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}
                >
                    {mdxContent}
                </Mantine.Spoiler>
            </Mantine.Alert>
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
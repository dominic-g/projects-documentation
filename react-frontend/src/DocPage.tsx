import React, { useState, useEffect } from 'react';
import { useMDXComponents } from '@mdx-js/react';
import { Title, Text, ScrollArea, Center } from '@mantine/core'; 
import { compile } from '@mdx-js/mdx'; 
import * as runtime from 'react/jsx-runtime';


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
  
  const components = useMDXComponents(); 

  useEffect(() => {
    const compileAndRender = async () => {
      try {
        const code = String(await compile(mdxContent, { 
            outputFormat: 'function-body',
        }));
        
        const { default: Content } = await (new Function(...Object.keys(runtime), 'return ' + code))(
            ...Object.values(runtime)
        );

        const newToc: TocItem[] = [];
        const headings = mdxContent.matchAll(/^(#{2,4})\s+(.+)/gm); // H2, H3, H4
        
        for (const match of headings) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
            newToc.push({ id, text, level });
        }

        setCompiledMdx(<Content components={components} />);
        onTocChange(newToc); 

      } catch (error) {
        console.error('Error compiling MDX:', error);
        setCompiledMdx(<Text color="red">Error rendering documentation content.</Text>);
      }
    };
    
    compileAndRender();
  }, [mdxContent, components, onTocChange]);


    if (!compiledMdx) {
        return <Center h={200}><Text>Loading content...</Text></Center>;
    }

     return (
        <ScrollArea h="100%" style={{ padding: '0 32px' }}>
            <Title order={1} style={{ marginBottom: '20px' }}>{title}</Title>
            {compiledMdx}
        </ScrollArea>
    );
};

export default DocPage;
import React, { useState, useEffect, useCallback } from 'react';
import { MantineProvider, Loader, Center, AppShell, NavLink, Group, Text, TextInput, ActionIcon, ScrollArea, Title } from '@mantine/core';
import { IconChevronRight, IconSearch  } from '@tabler/icons-react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { theme } from './theme';
import { ColorSchemeControl } from './components/ColorSchemeControl/ColorSchemeControl';
import { Welcome } from './components/Welcome/Welcome';
import { Logo } from './components/Logo/Logo';
import DocPage from './DocPage';

// Define the shape of the data from the WordPress API
interface Section {
  type: 'normal' | 'separator';
  title: string;
  content: string; // MDX content
  placement: 'top' | 'bottom';
}

interface DocData {
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

const DEFAULT_DOC_ID = 1; 

// --- App Root Component ---
const AppRoot: React.FC = () => {
  const [data, setData] = useState<DocData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]); // **NEW TOC STATE**
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get the documentation post ID from the URL query parameter 'doc_id'
  const docId = searchParams.get('doc_id') || DEFAULT_DOC_ID; 

  const fetchDocumentation = useCallback(async () => {
    // NOTE: This URL assumes your WordPress REST API is accessible at /wp-json/wp/v2/
    const restApiBase = (window as any).PD_REST_BASE || '/wp-json/wp/v2/';
    const url = `${restApiBase}project-doc/${docId}`;
    
    try {
      const response = await axios.get(url);
      const docData = response.data.documentation_data as DocData;
      setData(docData);

      // Navigate to the first doc section by default
      if (docData.doc_sections.length > 0 && docData.doc_sections[0].type === 'normal' && location.pathname === '/') {
        navigate(`/docs/${docData.doc_sections[0].title.toLowerCase().replace(/\s/g, '-')}`);
      }
    } catch (error) {
      console.error('Error fetching documentation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [docId, navigate]);

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);

  if (isLoading) {
    return <Center h="100vh"><Loader size="xl" /></Center>;
  }

  if (!data) {
    return <Center h="100vh"><Text>Documentation not found or failed to load.</Text></Center>;
  }

  // Separate sections for navigation
  const normalSections = data.doc_sections.filter(s => s.type === 'normal');

  return (
    <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'md' }} 
        aside={{ width: 250, breakpoint: 'lg' }} 
        padding="md"
      >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
            {/* LEFT SIDE: Logo & Project Title */}
            <Group align="center" gap={4}>
                <Logo logoUrl={data.logo_url} /> 
                <Text size="lg" fw={800} c="blue">{data.project_title} {data.tagline_text}</Text>
            </Group>

            {/* RIGHT SIDE: Controls (Now fixed with correct imports) */}
            <Group>
                <TextInput
                    placeholder="Search documentation..."
                    leftSection={<ActionIcon variant="transparent" size="md"><IconSearch size={18} /></ActionIcon>}
                    size="sm"
                    radius="xl"
                    style={{ width: 200 }}
                    disabled 
                />
                <ColorSchemeControl />
                <iframe
                    src="https://github.com/sponsors/gfazioli/button"
                    title="Sponsor gfazioli"
                    height="32"
                    width="114"
                    style={{ border: 0, borderRadius: '6px' }}
                />
            </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* Left Sidebar: Section Navigation */}
        <ScrollArea h="100%" style={{ paddingRight: '10px' }}>
            {data.doc_sections.map((section, index) => {
                const path = `/docs/${section.title.toLowerCase().replace(/\s/g, '-')}`;
                if (section.type === 'separator') {
                    return <Text key={index} my="sm" fw={700} c="dimmed" tt="uppercase" fz="xs">{section.title}</Text>;
                }
                return (
                    <NavLink
                        key={index}
                        label={section.title}
                        component="a"
                        href={path}
                        onClick={(e) => { e.preventDefault(); navigate(path); }}
                        rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                        active={location.pathname.includes(path)}
                    />
                );
            })}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Aside p="md" hiddenFrom="lg">
        {/* Right Sidebar: Table of Contents (TOC) */}
        <ScrollArea h="100%">
          <Title order={4} mb="md">Table of Contents</Title>
          {toc.length === 0 && <Text c="dimmed">No headings found for this section.</Text>}
          {toc.map((item, index) => (
              <NavLink
                  key={index}
                  label={item.text}
                  href={`#${item.id}`}
                  pl={10 + (item.level - 2) * 15}
                  onClick={(e) => { 
                      e.preventDefault(); 
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
              />
          ))}
        </ScrollArea>
      </AppShell.Aside>

      <AppShell.Main>
        <Routes>
          {/* Default Welcome Route - Renders Welcome and navigates to first section */}
          <Route path="/" element={<Welcome 
            titleBase={data.project_title} 
            tagline={data.tagline_text} 
            overview={data.overview_text}
            buttonText={data.button_text}
            buttonLink={data.button_link}
            buttonIcon={data.button_icon}
            dependencies={data.dependencies}
            marqueeFeatures={data.marquee_features}
          />} />

          {/* Dynamic Documentation Routes */}
          {normalSections.map((section, index) => (
            <Route 
              key={index} 
              path={`/docs/${section.title.toLowerCase().replace(/\s/g, '-')}`} 
              element={<DocPage 
                          title={section.title} 
                          mdxContent={section.content} 
                          onTocChange={setToc} // **FIX: Pass the state setter to DocPage**
                      />} 
            />
          ))}

          <Route path="*" element={<Center><Text>404 - Page not found</Text></Center>} />
        </Routes>
      </AppShell.Main>
      
      <AppShell.Footer>
        <div dangerouslySetInnerHTML={{ __html: data.footer_html }} />
      </AppShell.Footer>
    </AppShell>
  );
};

// Wrapper with Router and Mantine Provider
const App: React.FC = () => (
  <MantineProvider theme={theme}>
    <Router basename={ (window as any).PD_BASE_PATH || '/' }>
        <AppRoot />
    </Router>
  </MantineProvider>
);

export default App;
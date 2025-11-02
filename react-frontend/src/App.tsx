import React, { useState, useEffect, useCallback } from 'react';
import { MantineProvider, Loader, Center, AppShell, NavLink, Group, Text, TextInput, ScrollArea, Title, Divider, Box, Popover } from '@mantine/core'; 
import { IconChevronRight, IconSearch  } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';
import axios from 'axios';
import { theme } from './theme';
import { ColorSchemeControl } from './components/ColorSchemeControl/ColorSchemeControl';
import { Welcome } from './components/Welcome/Welcome';
import { Logo } from './components/Logo/Logo';
// import DocPage from './DocPage'; 
// import DocPage, { DocData, Section } from './DocPage'; 
// import DocPage, { type DocData, type Section } from './DocPage';
import DocPage from './DocPage'; 
import type { DocData, Section } from './DocPage';

const MOCK_DOC_DATA = {
    project_title: "Mantine Next.js +",
    tagline_text: "Nextra template",
    overview_text: "MOCK: This starter Next.js project includes a minimal setup for server side rendering, if you want to learn more on Mantine + Next.js integration follow this guide. To get started edit page.tsx file.",
    logo_url: "",
    button_text: "Use template v2.3.1 (MOCK)",
    button_icon: "IconBrandGithub",
    button_link: "#mock-link",
    dependencies: "@gfazioli/mantine-marquee: ^2.6.1\n@mantine/core: 8.3.3", // Cleaned for simplicity
    footer_html: "MOCK: <a href='#'>Footer Link</a>",
    marquee_features: ["Mantine Marquee", "Mantine Reflection"],
    doc_sections: [{
        type: "normal",
        title: "Introduction (MOCK)",
        content: 
`# Introduction (MOCK)

Hello, world! Welcome to the Nextra + Mantine template.

Here is an explicit Mantine button for testing:

<Center><Button color="red">Test Button</Button></Center>

This template is from the MOCK data.`,
        placement: "top"
    },
    {
        type: "normal",
        title: "MDX Overview (MOCK)",
        content: "## Another Section \n\nSome **markdown** here.",
        placement: "bottom"
    },
    {
        type: "separator",
        title: "MOCK SEPARATOR",
        content: "",
        placement: "bottom"
    }],
    linked_post_id: "0"
};

export interface SearchItem {
    sec_title: string;
    url: string;
    excerpt_html: string;
}

// --- App Root Component ---
const AppRoot: React.FC = () => {
  const [data, setData] = useState<DocData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const config = (window as any).PD_GLOBAL_CONFIG;
  const isDevMode = import.meta.env.DEV;

  const urlParams = new URLSearchParams(window.location.search);
  // const docId = urlParams.get('doc_id') || config.docId; 
  const sectionParam = urlParams.get('section');
  const currentDocId = urlParams.get('doc_id') || config.docId; 
  
  const [currentSectionSlug, setCurrentSectionSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); 


  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // FIX: Declaration of missing state
  const [isSearching, setIsSearching] = useState(false);   // FIX: Declaration of missing state


  const fetchDocumentation = useCallback(async () => {
    const docId = currentDocId;
    if (isDevMode) {
      console.warn('🟡 Running in MOCK mode (npm run dev)');
      // Simulate the delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const mockDocData = MOCK_DOC_DATA.doc_sections; // To satisfy type checker
      
      // Find the correct default section title in mock data
      const firstSectionTitle = mockDocData.find(s => s.type === 'normal')?.title || null;

      setData(MOCK_DOC_DATA as DocData); 
      
      // Use 'section' param from URL, or default to first mock section
      const sectionSlug = sectionParam || firstSectionTitle?.toLowerCase().replace(/\s+/g, '-') || null;

      setCurrentSectionSlug(sectionSlug);
      setIsLoading(false);
      return;
    }
    const restApiBase = config.restBase; 
    const url = `${restApiBase}project-doc/${docId}`;
    
    try {
        const response = await axios.get(url);
        const docData = response.data.documentation_data as DocData;
        
        setData(docData);

        if (sectionParam) {
            setCurrentSectionSlug(sectionParam);
        } else {
            // Default to the first normal section if no section param exists
            const firstSection = docData.doc_sections.find((s: Section) => s.type === 'normal');
            if (firstSection) {
                // Set the slug but do NOT push state yet (will be done in initial useEffect)
                setCurrentSectionSlug(firstSection.title.toLowerCase().replace(/\s+/g, '-'));
            }
        }
    } catch (e: any) {
        setError("Failed to load documentation: " + e.message);
        console.error("Fetch Error:", e);
    } finally {
        setIsLoading(false);
    }
  }, [currentDocId, sectionParam, config, isDevMode]);


  const performSearch = useDebouncedCallback(
    // Debouncing ensures we don't call the API on every key stroke
    async (query: string) => {
        // console.log('2. Debounced Call Executed with Query:', query);
        if (query.length < 3) {
          // console.warn('   - Search Aborted: Query < 3 chars');
          setSearchResults([]);
          setIsSearchOpen(false);
          return;
        }
        // console.log(config);
        // console.log("current doc id ",currentDocId);
        const endpoint = config.searchEndpoint; 
        if (!endpoint || !currentDocId) return;
        // if (!endpoint || !currentDocId) {
        //     console.error('   - Search Aborted: Missing Endpoint or Doc ID!');
        //     return;
        // }

        setIsSearching(true);
        setIsSearchOpen(true);

        // console.log('3. Firing API Request to:', `${endpoint}?q=${encodeURIComponent(query)}&doc_id=${currentDocId}`);
        
        try {
          const url = `${endpoint}?q=${encodeURIComponent(query)}&doc_id=${currentDocId}`; 
          const response = await axios.get(url);
          // console.log('4. API Success:', response.data);
          setSearchResults(response.data as SearchItem[]);
        } catch (error) {
          console.error('Search API Failed:', error);
          setSearchResults([]);        
        } finally {
          setIsSearching(false);
        }
    }, 300 
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchTerm(query);
      // console.log('1. Input Change Detected:', query);
      performSearch(query);
  };
  const handleNavigate = (sectionTitle: string) => {
      const slug = sectionTitle.toLowerCase().replace(/\s+/g, '-');
      
      // Update state and URL
      setCurrentSectionSlug(slug);
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('section', slug);
      window.history.pushState({}, '', newUrl); // Use pushState to avoid full reload
  };


  const renderMainContent = () => {
      if (!data) return <Center><Text>Loading content...</Text></Center>;

      // **FIX 3: Handle the Welcome page as the default landing**
      if (currentSectionSlug === null || currentSectionSlug === undefined) {
          return <Welcome 
            titleBase={data.project_title} 
            tagline={data.tagline_text} 
            overview={data.overview_text}
            buttonText={data.button_text}
            buttonLink={data.button_link}
            buttonIcon={data.button_icon}
            dependencies={data.dependencies}
            marqueeFeatures={data.marquee_features}
          />;
      }

      const currentSection = data.doc_sections.find((s: Section) => 
          s.title.toLowerCase().replace(/\s+/g, '-') === currentSectionSlug
      );

      if (currentSection && currentSection.type === 'normal') {
          return <DocPage 
              title={currentSection.title} 
              mdxContent={currentSection.content} 
              onTocChange={setToc} 
          />;
      }

      return <Center><Text>Section not found or is a separator.</Text></Center>;
  };

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);
  
  useEffect(() => {
    if (data && !sectionParam && !isDevMode) {
      // If data is loaded and no 'section' param is in URL, push the first section to URL
      const firstSection = data.doc_sections.find(s => s.type === 'normal');
      // const firstSection = docData.doc_sections.find((s: Section) => s.type === 'normal');
      if (firstSection) {
        const slug = firstSection.title.toLowerCase().replace(/\s+/g, '-');
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('section', slug);
        window.history.pushState({}, '', newUrl);
      }
    }
    if (isDevMode && data && !sectionParam) {
         const firstSection = data.doc_sections.find(s => s.type === 'normal');
         // const firstSection = data.doc_sections.find((s: Section) => s.type === 'normal');
         if (firstSection) {
            setCurrentSectionSlug(firstSection.title.toLowerCase().replace(/\s+/g, '-'));
         }
    }
  }, [data, sectionParam, isDevMode]);


  if (isLoading) {
    return <Center h="100vh"><Loader size="xl" /></Center>;
  }

  if (error || !data) {
    return <Center h="100vh"><Text color="red">{error || 'Documentation not found.'}</Text></Center>;
  }


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

            {/* RIGHT SIDE: Controls */}
             <Group>
              <Group>

                <Popover
                    opened={isSearchOpen}
                    onChange={setIsSearchOpen}
                    position="bottom-end"
                    shadow="xl"
                    transitionProps={{ transition: 'pop', duration: 200 }}
                    offset={15}
                    withArrow
                    zIndex={99999}
                    withinPortal
                    trapFocus={false}
                    // closeOnBlur={false}
                >
                    <Popover.Target>
                        {/* THIS IS THE TEXT INPUT FIELD (The trigger) */}
                        <TextInput
                            placeholder="Search documentation..."
                            leftSection={<IconSearch size={18} />}
                            size="sm"
                            radius="xl"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => searchTerm.length >= 3 && setIsSearchOpen(true)}
                            style={{ width: 280 }} 
                        />
                    </Popover.Target>
                    
                    <Popover.Dropdown p={0} w={{ base: '90vw', sm: 350, lg: 500 }}>
                        <ScrollArea.Autosize mah={400} px="md" py="xs">
                            {/* Loading Spinner */}
                            {/*{isSearching && <Center p="xl"><Loader size="md" /></Center>}*/}
                            {isSearching && (
                                 <Box w={{ base: '90vw', sm: 350, lg: 500 }} maw="90vw" display="flex" style={{alignItems: 'center', justifyContent: 'center'}}>
                                     <Loader size="md" />
                                 </Box>
                            )}
                            {/* Rendering Results */}
                            {!isSearching && searchResults.length > 0 && searchResults.map((item, index) => (
                                <Box 
                                    key={index} 
                                    p="xs" 
                                    component="a"
                                    href={item.url}
                                    onClick={() => setIsSearchOpen(false)}
                                    style={{ 
                                        display: 'block', 
                                        borderBottom: index < searchResults.length - 1 ? '1px solid var(--mantine-color-gray-1)' : 'none', 
                                        cursor: 'pointer' 
                                    }}
                                     w={{ base: '90vw', sm: 350, lg: 500 }} maw="90vw" 
                                >
                                    <Text size="sm" c="blue.5" fw={700}>
                                        {item.sec_title}
                                    </Text>
                                    <Text fz="xs" c="dimmed" dangerouslySetInnerHTML={{ __html: item.excerpt_html }} />
                                </Box>
                            ))}

                            {/* No results message */}
                            {!isSearching && searchResults.length === 0 && searchTerm.length >= 3 && (
                                 <Center p="xl"  w={{ base: '90vw', sm: 350, lg: 500 }} maw="90vw" ><Text c="dimmed">No results for "{searchTerm}".</Text></Center>
                            )}
                            
                            {/* Default prompt/small instruction (optional) */}
                            {!isSearching && searchTerm.length < 3 && (
                                <Center p="sm"  w={{ base: '90vw', sm: 350, lg: 500 }} maw="90vw" ><Text fz="xs" c="dimmed">Type at least 3 characters to search.</Text></Center>
                            )}
                            
                        </ScrollArea.Autosize>
                    </Popover.Dropdown>
                </Popover>

                <ColorSchemeControl />
                
            </Group>
              
            </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* Left Sidebar: Section Navigation */}
        <ScrollArea h="100%" style={{ paddingRight: '10px' }}>
            {data.doc_sections.map((section: Section, index: number) => {
                const slug = section.title.toLowerCase().replace(/\s+/g, '-');
                const path = `?doc_id=${currentDocId}&section=${slug}`;
                
                if (section.type === 'separator') {
                    // return <Text key={index} my="sm" fw={700} c="dimmed" tt="uppercase" fz="xs">{section.title}</Text>;
                    return <Divider key={index} my="md" labelPosition="center" />; 
                }
                return (
                    <NavLink
                        key={index}
                        label={section.title}
                        component="a"
                        href={path} 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            handleNavigate(section.title); 
                        }}
                        rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                        active={currentSectionSlug === slug}
                    />
                );
            })}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Aside p="md">
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
        {renderMainContent()}
      </AppShell.Main>
      
      <AppShell.Footer>
        <div dangerouslySetInnerHTML={{ __html: data.footer_html }} />
      </AppShell.Footer>
    </AppShell>
  );
};

const App: React.FC = () => (
  <MantineProvider theme={theme} defaultColorScheme="auto" >
    <AppRoot />
  </MantineProvider>
);

export default App;
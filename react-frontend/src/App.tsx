import React, { useState, useEffect, useCallback } from 'react';
import { MantineProvider, Loader, Center, AppShell, NavLink, Group, Flex, Text, TextInput, ScrollArea, Title, Divider, Box, Popover, ActionIcon } from '@mantine/core'; 
import { IconChevronRight, IconSearch, IconBook, IconMenu2, IconHome  } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';
import axios from 'axios';
import { theme } from './theme';
import { ColorSchemeControl } from './components/ColorSchemeControl/ColorSchemeControl';
import { Welcome } from './components/Welcome/Welcome';
import { NotFound404 } from './components/NotFound404/NotFound404';
import { Logo } from './components/Logo/Logo';
// import DocPage from './DocPage'; 
// import DocPage, { DocData, Section } from './DocPage'; 
// import DocPage, { type DocData, type Section } from './DocPage';
import DocPage from './DocPage'; 
import type { DocData, Section } from './DocPage';
// import { useMantineTheme, type MantineStyleProp } from '@mantine/core';
// import DominicLogo from '@dominic_n/react-dominic-logo-animation'


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

  // const urlParams = new URLSearchParams(window.location.search); 
  // const sectionParam = urlParams.get('section');
  // const currentDocId = urlParams.get('doc_id') || config.docId; 
  
  const pathParts = window.location.pathname.split('/').filter(p => p); 
  const currentDocId = pathParts.find(p => !isNaN(Number(p))) || null; 
  const sectionSlugFromPath = currentDocId && pathParts.length > pathParts.indexOf(currentDocId) + 1 ? 
                              pathParts[pathParts.indexOf(currentDocId) + 1] : null;
  const sectionParam = sectionSlugFromPath;

  const docViewerSlugIndex = pathParts.findIndex(p => p === 'docs-viewer');
  const docBaseUrl = window.location.pathname.substring(0, window.location.pathname.indexOf(pathParts[docViewerSlugIndex])) 
                     + pathParts[docViewerSlugIndex] + '/';
  const currentDocBaseUrl = docBaseUrl + currentDocId + '/';


  const defaultSectionSlug = data?.doc_sections?.find(s => s.type === 'normal')?.title
    .toLowerCase().replace(/\s+/g, '-') || '';

  const numericalDocId = Number(currentDocId) || 0; 

  const [currentSectionSlug, setCurrentSectionSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); 


  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [isSearching, setIsSearching] = useState(false);  

  const [navOpened, setNavOpened] = useState(false);
  const [asideOpened, setAsideOpened] = useState(false);



  const fetchDocumentation = useCallback(async () => {
    // const docId = currentDocId;
    const docId = numericalDocId;
    if (docId === 0) {
        setError("Could not find a Project Documentation ID. Please create one.");
        setIsLoading(false);
        return;
    }
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
            setCurrentSectionSlug(null); 
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
      const prettyPath = currentDocBaseUrl + slug;
      setCurrentSectionSlug(slug);
      
      window.history.pushState({}, '', prettyPath); 
  };



  const renderMainContent = () => {
      if (!data) return <Center><Text>Loading content...</Text></Center>;

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
  
  if (isLoading) {
    return <Center h="100vh"><Loader size="xl" /></Center>;
  }

  if (error || !data) {
    if (numericalDocId === 0 || error) { 
        return <NotFound404 homeUrl={config.homeUrl} />;
    }
    return <Center h="100vh"><Text color="red">{error || 'Documentation not found.'}</Text></Center>;
  }

  const isWelcomePage = currentSectionSlug === null || currentSectionSlug === undefined;


  const isNavCollapsed = !isWelcomePage ? { mobile: !navOpened, desktop: false } : { mobile: true, desktop: true };
  const isAsideCollapsed = !isWelcomePage ? { mobile: !asideOpened, desktop: false } : { mobile: true, desktop: true };

  return (
    <AppShell
        header={{ height: { base: 120, sm: 60 } }}
        padding={isWelcomePage ? 0 : "md"}
        navbar={{ 
            width: isWelcomePage ? 0 : 300, 
            breakpoint: 'lg',
            collapsed: isNavCollapsed
        }} 
        aside={{ 
            width: isWelcomePage ? 0 : 250, 
            breakpoint: 'lg', 
            collapsed: isAsideCollapsed
        }} 
        maw="100vw"
        footer= {{ height: 60}}
        style={{ transition: 'all 0.3s', position: 'relative', overflowX: 'hidden'}}
      >
      <AppShell.Header >
        <Flex 
            h="100%" 
            px="md" 
            wrap="nowrap"
            justify={{ base: 'space-around', sm: 'space-between' }}
            direction={{ base: 'column', sm: 'row' }}
        >
            {/* LEFT SIDE: Logo & Project Title */}
            <Group 
                align="center" 
                gap="xs" 
                style={{ 
                    flexShrink: 1, 
                    flexWrap: "nowrap", 
                    overflow: "hidden"
                }}
                w={{ base: '100%', sm: '35%', md: '50%' }}

            >
                {/*<Logo logoUrl={data.logo_url} homeUrl = {currentDocBaseUrl} /> */}
                <Logo logoUrl={data.logo_url}/> 
                <Text 
                    size="lg" 
                    fw={800} 
                    c="blue"
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                    // visibleFrom="sm" //hidden from 767 and below visible to 768p x and up
                >
                    {data.project_title}
                </Text>
                {/*<DominicLogo />*/}

                {(numericalDocId > 0) && (!isWelcomePage) && (
                    <ActionIcon 
                        onClick={() => setNavOpened((o) => !o)} 
                        variant="default"
                        size="md"
                        style={{
                            marginLeft: 'auto',
                            ['@media (min-width: 1200px)']: { display: 'none' } 
                        }}
                        hiddenFrom="lg" //hidden from screen 1200px and abv
                    >
                        <IconMenu2 size={18} />
                    </ActionIcon>
                )}
                {(numericalDocId > 0) && (!isWelcomePage) && (
                    <ActionIcon 
                        onClick={() => setAsideOpened((o) => !o)} 
                        variant="default"
                        size="md"
                        style={{

                            ['@media (min-width: 1200px)']: { display: 'none' } 
                        }}
                        hiddenFrom="lg" //hidden from screen 1200px and abv
                    >
                        <IconChevronRight size={18} />
                    </ActionIcon>
                )}
            </Group>

            {/* RIGHT SIDE: Controls */}
             <Group
                w={{ base: '100%', sm: '65%', md: '50%' }} 
             >
                <Flex
                    style={{
                         flexShrink: 0,
                         flexGrow: 1,
                         // justifyContent: 'flex-end',
                         overflow: 'hidden',
                         whiteSpace: 'nowrap',
                         flexWrap: "nowrap",
                         // gap: 10,
                     }}
                     justify={{ base: 'space-around', sm: 'flex-end' }}
                     gap={{ base: '5px', sm: '10px' }}
                >
                    <NavLink 
                        component="a" 
                        href={currentDocBaseUrl} 
                        label={
                            <Group gap={5} style={{ whiteSpace: 'nowrap', alignItems: 'normal' }}>
                                <IconHome size={18} />
                                <Box visibleFrom="lg"> 
                                    <Text component="span" size="sm">Home</Text>
                                </Box>
                            </Group>
                        }
                        p={4}
                        c="blue.4"
                        fw={600}
                        style={{ width: 'auto'}}
                    />

                    {(numericalDocId > 0) && (
                        <NavLink 
                            component="a" 
                            href={currentDocBaseUrl + defaultSectionSlug} 
                            label={
                                <Group gap={5} style={{ whiteSpace: 'nowrap', alignItems: 'normal' }}>
                                    <IconBook size={18} />
                                    <Box visibleFrom="lg"> 
                                        <Text component="span" size="sm">Documentation</Text>
                                    </Box>
                                </Group>
                            }
                            p={4}
                            c="blue.4"
                            fw={600}
                            style={{ width: 'auto'}}
                        />
                    )}

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
                            <TextInput
                                placeholder="Search documentation..."
                                leftSection={<IconSearch size={18} />}
                                size="sm"
                                radius="xl"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => searchTerm.length >= 3 && setIsSearchOpen(true)}
                                // style={{ width: 280 }} 
                                w={{ base: '60%', md: '80%' }}
                                maw={280} 
                            />
                        </Popover.Target>
                        
                        <Popover.Dropdown p={0} w={{ base: '90vw', sm: 350, lg: 500 }}>
                            <ScrollArea.Autosize mah={400} px="md" py="xs">
                                {/* Loading Spinner */}
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
                
                </Flex>
              
            </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar 
        p={isWelcomePage ? 0 : "md"} 
        w={{ base: isWelcomePage ? 0 : '75%', sm: 300 }}
        maw={isWelcomePage ? 0 : 300}
        mah={{ base: isWelcomePage ? 0 : "calc(100dvh - var(--app-shell-header-offset, 0rem))", lg: isWelcomePage ? 0 : "calc(100% - var(--mantine-header-height, 60px) - var(--mantine-footer-height, 60px))"}}
        h={{ base: isWelcomePage ? 0 : "100%", lg: isWelcomePage ? 0 : "100%"}}
        style={{ transition: 'all 0.3s ease', borderRight: isWelcomePage ? 'none' : undefined, position: 'absolute' }}
      >
        {/* Left Sidebar: Section Navigation */}
        {/*{(numericalDocId > 0) && (!isWelcomePage) && (
            <Box 
                pos="absolute"
                top={10}
                right={10}
                style={{
                    zIndex: 100, 
                    transition: 'opacity 0.2s ease', 
                    ['@media (min-width: 1200px)']: { display: 'none !important' } 
                }}
                hiddenFrom="lg" //hidden from screen 1200px and abv
            >
                <ActionIcon 
                    onClick={() => setNavOpened(false)} 
                    variant="transparent"
                    size="md"
                    radius="xl"
                    style={{
                        backgroundColor: 'rgba(250,250,250,0.9)',
                        border: '1px solid rgba(30,30,30,0.5)',
                    }}
                >
                    <IconX size={20} />
                </ActionIcon>
            </Box>
        )}*/}
        <ScrollArea h="100%" style={{ paddingRight: '10px' }}>
            {data.doc_sections.map((section: Section, index: number) => {
                // const slug = section.title.toLowerCase().replace(/\s+/g, '-');
                // const path = `?doc_id=${currentDocId}&section=${slug}`;
                // const path = `${currentDocId}/${slug}`;
                const slug = section.title.toLowerCase().replace(/\s+/g, '-');
                const path = currentDocBaseUrl + slug; 
                
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

      <AppShell.Aside 
        p={isWelcomePage ? 0 : "md"} 
        w={{ base: isWelcomePage ? 0 : '60%', sm: 300 }}
        maw={isWelcomePage ? 0 : 300}
        mah={{ base: isWelcomePage ? 0 : "calc(100dvh - var(--app-shell-header-offset, 0rem))", lg: isWelcomePage ? 0 : "calc(100% - var(--mantine-header-height, 60px) - var(--mantine-footer-height, 60px))"}}
        h={{ base: isWelcomePage ? 0 : "100%", lg: isWelcomePage ? 0 : "100%"}}
        // collapsed={!isWelcomePage ? { mobile: !navOpened, desktop: false } : undefined}
        style={{ transition: 'all 0.3s ease', borderRight: isWelcomePage ? 'none' : undefined, position: 'absolute' }}
      >

        {/*{(numericalDocId > 0) && (!isWelcomePage) && (
            <Box 
                pos="absolute"
                top={10}
                left={10}
                style={{
                    zIndex: 100, 
                    transition: 'opacity 0.2s ease', 
                    ['@media (min-width: 1200px)']: { display: 'none !important' } 
                }}
                hiddenFrom="lg" //hidden from screen 1200px and abv

            >
                <ActionIcon 
                    onClick={() => setAsideOpened(false)} 
                    variant="transparent"
                    size="md"
                    radius="xl"
                    style={{
                        backgroundColor: 'rgba(250,250,250,0.9)',
                        border: '1px solid rgba(30,30,30,0.5)',
                    }}
                >
                    <IconX size={20} />
                </ActionIcon>
            </Box>
        )}*/}
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

      <AppShell.Main 
        pb="md"
        mih={{ base: "calc(100dvh - var(--mantine-header-height, 120px) - var(--mantine-footer-height, 60px))", sm: "calc(100dvh - var(--mantine-header-height, 60px) - var(--mantine-footer-height, 60px))"}}
      >
        {/*{renderMainContent()}*/}
        <Box 
            px={{base: 0, md: isWelcomePage ? 0 : 'md'}}
            maw={isWelcomePage ? '100vw' : 'auto'}
            // h={isWelcomePage ? 'calc(100vh - var(--mantine-header-height, 60px) - var(--mantine-footer-height, 0px))' : 'auto'}

            style={{ 
                display: 'block', 
                paddingTop: isWelcomePage ? 0 : 'md',
            }}
        > 
             {renderMainContent()}
        </Box>
      </AppShell.Main>
      
      <AppShell.Footer p="md" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: "nowrap", overflow: "hidden"}}>
        <div style={{textAlign: 'center'}} dangerouslySetInnerHTML={{ __html: data.footer_html }} />
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
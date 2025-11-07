import React, { useId } from 'react';
import { useMDXComponents as getMDXComponents } from '@mdx-js/react';
import iconListJson from '../../utils/tabler-icons.json';
// import { IconExternalLink } from '@tabler/icons-react';
import { getIconComponent } from './utils/getIconComponent';
import { Carousel } from '@mantine/carousel';


import { Marquee } from '@gfazioli/mantine-marquee';
import { TextAnimate } from '@gfazioli/mantine-text-animate';


import {
  AspectRatio, Image, 
  Anchor, Button, Code,
  ActionIcon, 
  Text, Title, Divider, Table, Paper,
  Center, Box, Stack, List, Grid, Flex, SimpleGrid, Space, Container, Group,
  Alert, Notification, Progress, RingProgress, SemiCircleProgress,
  HoverCard, Overlay, Popover, Tooltip, 
  Accordion, Avatar, BackgroundImage, Badge, Card, ColorSwatch, Indicator, Kbd, NumberFormatter, Spoiler, ThemeIcon, Timeline,
  Blockquote, Highlight, Mark, 
  ScrollArea, Transition, VisuallyHidden, 
} from '@mantine/core'; //import 48 comp items

import{
  AreaChart, BarChart, LineChart, CompositeChart, DonutChart, PieChart, FunnelChart, RadarChart, ScatterChart, BubbleChart, RadialBarChart, 
  Sparkline, Heatmap,
} from '@mantine/charts'; //imported 13 comp items

import { FileTreeLabel } from './components/FileTreeLabel/FileTreeLabel';
//Total 65 imported comp
// import { MarqueeFeatures, TypewriterComponent, AnimatedTextComponent, ActionButton } from './components/Content/Content'; 

const bold = (props: any) => <Text component="span" {...props} fw="900" />;
const italic = (props: any) => <Text component="span" {...props} fs="italic" />;
const strike = (props: any) => <Text component="span" {...props} td="line-through" />;
const anchor = (props: any) => <Anchor {...props} />;

const defaultMantineComponents = {
  code: (props: any) => ( <Code {...props} /> ),
  br: (props: any) => ( <Divider {...props} color="transparent" /> ),
  hr: (props: any) => ( <Divider {...props} /> ),
  strong: bold, b: bold,
  em: italic, i: italic,
  del: strike, s: strike, strike: strike,
  ul: (props: any) => <List {...props} />,
  li: (props: any) => <List.Item {...props} />,
  ol: (props: any) => <List type="ordered" {...props} />,
  // details: ({ children, open, ...props }) => {
  //   const [summary, ...rest] = React.Children.toArray(children);

  details: ({ children, open, ...props }: { children: React.ReactNode, open?: boolean, [key: string]: any }) => {
    const [summary, ...rest] = React.Children.toArray(children) as [React.ReactNode, ...React.ReactNode[]];
    const id = useId();
    return (
      <Accordion
        defaultValue={open ? id : undefined}
        {...props}
      >
        <Accordion.Item value={id}>
          <Accordion.Control>{summary}</Accordion.Control>
          <Accordion.Panel>{rest}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  },
  pre: (props: any) => ( 
    <Box component="pre" 
      p={{base: '0.8rem 0', md: 'sm'}}
      m={{base: '2rem 0', md: '2rem 1rem'}}
      style={{ 
        borderRadius: 'var(--mantine-radius-md)',
        backgroundColor: 'var(--code-bg, var(--mantine-color-dark-6))',
      }} 
      {...props} 
    />
  ),
  Image: (props: any) => <Image {...props} />, 
  Carousel: (props: any) => (
      <Box my="xl" style={{ maxWidth: '100%' }}>
          <Carousel loop withIndicators {...props} /> 
      </Box>
  ),
  table: (props: any) => {
    return (
        <Box 
            mt = '1.2em'
            style={{ 
                border: '1px solid', 
                borderRadius: 'var(--mantine-radius-md)',
                overflow: 'hidden', 
            }}
        >
            <Table 
                 striped 
                 withRowBorders={false} 
                 withColumnBorders={true} 
                 style={{ 
                     tableLayout: 'auto',
                     width: '100%', 
                 }}
                 {...props} 
             />
         </Box>
    );
  },
  thead: (props: any) => <Table.Thead {...props} />,
  tbody: (props: any) => <Table.Tbody {...props} />,
  tr: (props: any) => <Table.Tr {...props} />,
  th: (props: any) => <Table.Th style={{ fontWeight: 'bold' }} {...props} />,
  td: (props: any) => <Table.Td {...props} />,
  AspectRatio:  (props: any) => <AspectRatio {...props} />,
  // iframe:  (props: any) => <iframe {...props} />,
  Center:  (props: any) => <Center {...props} />,
  Anchor:  anchor, a: anchor,
  Box:  (props: any) => <Box {...props} />,
  Code:  (props: any) => <Code {...props} />,
  Button:  (props: any) => <Button {...props} />,
  Text:  (props: any) => <Text {...props} />,
  Title:  (props: any) => <Title {...props} />,
  Divider:  (props: any) => <Divider {...props} />,
  Paper:  (props: any) => <Paper {...props} />,
  Stack:  (props: any) => <Stack {...props} />,
  Grid:  (props: any) => <Grid {...props} />,
  Group:  (props: any) => <Group {...props} />,
  Container:  (props: any) => <Container {...props} />,
  Flex:  (props: any) => <Flex {...props} />,
  SimpleGrid:  (props: any) => <SimpleGrid {...props} />,
  Space:  (props: any) => <Space {...props} />,
  ActionIcon:  (props: any) => <ActionIcon {...props} />,
  Alert:  (props: any) => <Alert {...props} />,
  Notification:  (props: any) => <Notification {...props} />,
  Progress:  (props: any) => <Progress {...props} />,
  RingProgress:  (props: any) => <RingProgress {...props} />,
  SemiCircleProgress:  (props: any) => <SemiCircleProgress {...props} />,
  HoverCard:  (props: any) => <HoverCard {...props} />,
  Overlay:  (props: any) => <Overlay {...props} />,
  Popover:  (props: any) => <Popover {...props} />,
  Tooltip:  (props: any) => <Tooltip {...props} />,
  Accordion:  (props: any) => <Accordion {...props} />,
  Avatar:  (props: any) => <Avatar {...props} />,
  BackgroundImage:  (props: any) => <BackgroundImage {...props} />,
  Badge:  (props: any) => <Badge {...props} />,
  Card:  (props: any) => <Card {...props} />,
  ColorSwatch:  (props: any) => <ColorSwatch {...props} />,
  Indicator:  (props: any) => <Indicator {...props} />,
  Kbd:  (props: any) => <Kbd {...props} />,
  NumberFormatter:  (props: any) => <NumberFormatter {...props} />,
  Spoiler:  (props: any) => <Spoiler {...props} />,
  ThemeIcon:  (props: any) => <ThemeIcon {...props} />,
  Timeline:  (props: any) => <Timeline {...props} />,
  Blockquote:  (props: any) => <Blockquote {...props} />,
  Highlight:  (props: any) => <Highlight {...props} />,
  List:  (props: any) => <List {...props} />,
  Mark:  (props: any) => <Mark {...props} />,
  ScrollArea:  (props: any) => <ScrollArea {...props} />,
  Transition:  (props: any) => <Transition {...props} />,
  VisuallyHidden:  (props: any) => <VisuallyHidden {...props} />,
  AreaChart:  (props: any) => <AreaChart {...props} />,
  BarChart:  (props: any) => <BarChart {...props} />,
  LineChart:  (props: any) => <LineChart {...props} />,
  CompositeChart:  (props: any) => <CompositeChart {...props} />,
  DonutChart:  (props: any) => <DonutChart {...props} />,
  PieChart:  (props: any) => <PieChart {...props} />,
  FunnelChart:  (props: any) => <FunnelChart {...props} />,
  RadarChart:  (props: any) => <RadarChart {...props} />,
  ScatterChart:  (props: any) => <ScatterChart {...props} />,
  BubbleChart:  (props: any) => <BubbleChart {...props} />,
  RadialBarChart:  (props: any) => <RadialBarChart {...props} />,
  Sparkline:  (props: any) => <Sparkline {...props} />,
  Heatmap:  (props: any) => <Heatmap {...props} />,
  Marquee:  (props: any) => <Marquee {...props} />,
  TextAnimate:  (props: any) => <TextAnimate {...props} />,

  FileTreeLabel: FileTreeLabel,

};

const EXPOSED_ICONS = (() => {
    try {
        // const iconListJson = require('../../utils/tabler-icons.json');
        const icons: { [key: string]: any } = {};

        iconListJson.forEach((name: string) => {
            const IconComponent = getIconComponent(name);
            if (IconComponent) {
                icons[name] = IconComponent; 
            }
        });
        return icons;
    } catch {
        console.error("Failed to load full icon list for MDX runtime.");
        return {};
    }
})();


export const useMDXComponents = (components: any = {}) => {
    const baseComponents = getMDXComponents(components);
    
    return {
        ...baseComponents,
        ...EXPOSED_ICONS, 
        ...defaultMantineComponents, 
        ...components,
    };
};
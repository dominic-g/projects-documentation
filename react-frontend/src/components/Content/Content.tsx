// import React, { useState } from "react";
import type { ReactNode } from "react";
// import { useMantineTheme, useComputedColorScheme } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Marquee } from '@gfazioli/mantine-marquee';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import { Button, Box, Paper, Divider, Stack, Title, Text, Center, Anchor } from '@mantine/core'; 
// import { IconExternalLink, IconAlignLeft, IconAlignCenter, IconAlignRight } from '@tabler/icons-react'; 
import * as TablerIcons from '@tabler/icons-react';
import { getIconComponent } from '@/utils/getIconComponent'; // Utility for dynamic icons


// --- UTILITIES & TYPE CHECKING (Move to a shared utils file eventually) ---
type MantineSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AlignType = 'left' | 'center' | 'right';
type DisplayType = 'block' | 'inline';
export const ButtonDisplay: readonly DisplayType[] = ['block', 'inline'] as const;
type MarqueeItem = {
    text: string;
    href?: string;
    target?: string;
    size?: string;
    icon?: string;
    color?: string;
    bg?: string;
};

const validateEnum = (val: any, allowedValues: readonly string[], fallback: string): string => {
    if (typeof val !== 'string') return fallback;
    const lowerVal = val.toLowerCase();
    return allowedValues.includes(lowerVal) ? lowerVal : fallback;
};

const MantineSizes: readonly MantineSize[] = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const MarqueeTargets = ['_blank', '_self', '_parent', '_top'] as const;
const MantineAlignments: readonly AlignType[] = ['left', 'center', 'right'] as const;
const TextAnimateAnimate = ['in', 'out', 'in-out'] as const;
const TextAnimateBy = ['character', 'word', 'line'] as const;


const useJsonProps = <T extends any>(dataString: string | undefined): T[] => {
    if (!dataString) return [];
    try {
        const cleanedString = dataString.trim();
        // Check for common quotes surrounding the prop (if copied from terminal or saved aggressively)
        if (cleanedString.startsWith('{') || cleanedString.startsWith('[')) {
             const parsed = JSON.parse(cleanedString);
             return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        // Fallback for debugging issues in user-provided content.
        console.warn('JSON parsing error in Content component prop:', e);
        return [];
    }
    return [];
}


// ========================================================
// 1. Marquee Features Component
// Usage in MDX: <MarqueeFeatures title="Title" data='[{ "text": "Feature", "size": "xl" }]'/>
// ========================================================
interface MarqueeFeaturesProps {
    title?: string;
    data: string; // The RAW JSON string
}

export const MarqueeFeatures = ({ title, data }: MarqueeFeaturesProps) => {
  const items = useJsonProps<MarqueeItem>(data);
  const theme = useMantineTheme();
  
  if (items.length === 0) return null;
  
  return (
    <>
      <Divider my="md" />
      <Stack align="center" my={32} style={{ maxWidth: '100%' }}>
        {title && <Title order={2} ta="center">{title}</Title>}

        <Marquee fadeEdges pauseOnHover>
          {items.map((item, index) => {
              if (!item.text) return null;
              
              const safeSize = validateEnum(item.size, MantineSizes, 'lg') as MantineSize;
              const IconComp = getIconComponent(item.icon || '');
              
              const ButtonIcon = IconComp ? <IconComp size={safeSize === 'xs' ? 14 : 18} /> : undefined;

              return (
                <Button
                  key={index}
                  size={safeSize}
                  component="a" 
                  href={item.href || '#'}
                  target={validateEnum(item.target, MarqueeTargets as unknown as string[], '_blank')}
                  leftSection={ButtonIcon}
                  variant="filled" // Ensure background color is honored
                  
                  // Style logic for color overrides (simple Mantine default fallback)
                  style={{
                    backgroundColor: item.bg || undefined, 
                    color: item.color || undefined,
                    pointerEvents: item.href && item.href !== '#' ? 'auto' : 'none', // Set to none if link is missing
                    marginLeft: theme.spacing.xs,
                    marginRight: theme.spacing.xs,
                  }}

                >
                  {item.text}
                </Button>
              );
            })}
        </Marquee>
      </Stack>
    </>
  );
};


// ========================================================
// 2. Typewriter Component (Was DependenciesMarquee)
// Usage in MDX: <Typewriter title="Title" data='[{ "text": "Line 1" }, { "text": "Line 2" }]'/>
// ========================================================
interface TypewriterItem {
    text: string; // mandatory
}

interface TypewriterProps {
    title?: string;
    data: string; // RAW JSON string
    delay?: number | string;
    loop?: boolean | string;
    color?: string;
    bg?: string;
}

export const TypewriterComponent = ({ title, data, delay, loop, color, bg }: TypewriterProps) => {
    const items = useJsonProps<TypewriterItem>(data);
    const finalLines = items.map(i => i.text).filter(t => t); // Get only the text lines
    
    // Convert string/boolean props to correct JS type (default logic is the component's)
    const delayNum = Number(delay) || 100;
    const loopBool = (loop === 'true' || loop === true) ? true : false;
    
    if (finalLines.length === 0) return null;

    return (
        <Stack align="center" my={32}>
            {title && <Title order={2} ta="center">{title}</Title>}
            <Paper shadow="xl" p="md" mih={300} maw={750} bg={bg || "dark.9"} mx="auto" radius="md">
                <TextAnimate.Typewriter
                    inherit
                    fz="xs" // Default size fz={11} becomes fz="xs"
                    c={color || "green.5"} // Default color
                    ff="monospace"
                    multiline
                    delay={delayNum}
                    loop={loopBool}
                    value={finalLines} // Lines without the leading title/label
                />
            </Paper>
        </Stack>
    );
};


// ========================================================
// 3. Animated Text (Inline Element)
// Usage in MDX: <AnimatedText align="left" variant="gradient" gradient="pink,yellow">Text to Animate</AnimatedText>
// ========================================================
interface AnimatedTextProps {
    children: ReactNode; // Text inside the tag
    align?: AlignType | string; // align
    variant?: 'gradient' | 'text' | 'inherit';
    animate?: 'in' | 'out' | 'in-out';
    by?: 'character' | 'word' | 'line';
    duration?: number | string;
    gradient?: string; // comma separated string: "from,to"
    fz?: string; // Mantine Font Size string: "xs" to "xl"
    segmentDelay?: number | string;
}

export const AnimatedTextComponent = ({ 
    children, align, variant, animate, by, duration, gradient, fz, segmentDelay 
}: AnimatedTextProps) => {

    const finalAlign = validateEnum(align, MantineAlignments, 'center') as AlignType;
    const gradientColors = (gradient || "pink,yellow").split(',').map(c => c.trim());
    
    return (
        <Center style={{ justifyContent: `flex-${finalAlign}` }}>
            <TextAnimate
                animate={validateEnum(animate, TextAnimateAnimate, 'in') as 'in'}
                by={validateEnum(by, TextAnimateBy, 'character') as 'character'}
                inherit
                variant={variant as 'gradient' || 'gradient'}
                component="span" // Always a span
                segmentDelay={Number(segmentDelay) || 0.2}
                duration={Number(duration) || 2}
                animation="scale"
                animateProps={{
                    scaleAmount: 3,
                }}
                gradient={{ from: gradientColors[0], to: gradientColors[1] || gradientColors[0] }}
                fz={fz || '0.75em'} // Default size
            >
              {children}
            </TextAnimate>
        </Center>
    );
};


// ========================================================
// 4. Centered Button (Block-level structure)
// Usage in MDX: <ActionBtn text="Go" link="url" icon="IconName" />
// ========================================================
interface ActionButtonProps {
    text: string;
    link?: string;
    icon?: string;
    size?: string; // xs, sm, lg
    align?: string; // left, center, right
    display?: string;
    // Add other styling/props based on Mantine Button docs if necessary
}

export const ActionButton = ({ text, link, icon, size, align, display }: ActionButtonProps) => {
    
    if (!text) return null;

    const safeSize = validateEnum(size, MantineSizes, 'lg') as MantineSize;
    const IconComp = getIconComponent(icon || ''); // Icon on the left

    const finalAlign = validateEnum(align, MantineAlignments, 'center') as AlignType;
    
    // Set icon and final pointer logic
    const FinalIcon = IconComp ? <IconComp size={20} /> : undefined;
    const finalLink = link || '#';
    const isClickable = finalLink !== '#';

    const finalDisplay = validateEnum(display, ButtonDisplay as unknown as string[], 'inline');

    return (
      <Center style={{ justifyContent: `flex-${finalAlign}` }} mt="xl" mx="auto">
        <Button
          href={finalLink}
          component={isClickable ? 'a' : 'button'} // Correct tag
          rightSection={<TablerIcons.IconExternalLink size={20} />} // Always has the external link icon
          leftSection={FinalIcon}
          variant="outline"
          px={32}
          radius="xl" // '256' maps to Mantine's largest preset 'xl' or use specific size.
          size={safeSize}

          style={{
             pointerEvents: isClickable ? 'auto' : 'none',
             cursor: isClickable ? 'pointer' : 'default',
             width: finalDisplay === 'block' ? '100%' : 'auto', 
          }}
        >
          {text}
        </Button>
      </Center>
    );
};



export { Marquee, TextAnimate, Button, Box, Paper, Divider, Stack, Title, Text, Center, Anchor };
import * as TablerIcons from '@tabler/icons-react'; // Needs ALL Icons you provided in JSON file
// import type { DefaultMantineColor, MantineSize } from '@mantine/core';
import type {  MantineSize } from '@mantine/core';


// --- UTILITIES TO CHECK VALUES ---
export const safeNumber = (val: any, fallback: number) => {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

export const validateEnum = (val: any, allowedValues: readonly string[], fallback: string): string => {
  if (typeof val !== 'string') return fallback;
  const lowerVal = val.toLowerCase();
  return allowedValues.includes(lowerVal) ? lowerVal : fallback;
};

export const getColor = (val: any, theme: any, colorScheme: 'light' | 'dark', isBg = false) => {
    // Basic fallback logic:
    if (!val || typeof val !== 'string') {
        return isBg ? (colorScheme === 'dark' ? '#000' : '#FFF') : (colorScheme === 'dark' ? '#FFF' : '#000');
    }
    return theme.colors[val] ? theme.colors[val][colorScheme === 'dark' ? 5 : 5] : val; 
}


// --- BASE PARSER FOR BASE64/JSON ---
export const parseBase64Json = <T extends any>(base64String: string | undefined): T[] => {
    if (!base64String) return [];
    try {
        const jsonString = atob(base64String); // Base64 Decode (JavaScript native)
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Error parsing Base64 JSON config:', e);
        return [];
    }
};

// --- VALIDATION ENUMS ---
export const MantineSizes: readonly MantineSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
export const MarqueeTargets = ['_blank', '_self', '_parent', '_top'] as const;
export const TextAnimateAnimate = ['in', 'out', 'in-out'] as const;
export const TextAnimateBy = ['character', 'word', 'line'] as const;

export const getSafeIcon = (iconName: string, fallbackIcon: React.FC) => {
    const IconComponent = (TablerIcons as any)[iconName];
    return IconComponent || fallbackIcon;
};

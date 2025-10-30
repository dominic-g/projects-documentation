import { useMDXComponents as getMDXComponents } from '@mdx-js/react';

import {
  Anchor,
  Button,
  Center,
  Code,
  Text,
  Title,
  Divider,
  Paper,
  Stack,
  List,
  Grid,
  Group,
} from '@mantine/core';

import { FileTreeLabel } from './components/FileTreeLabel/FileTreeLabel'; // Ensure path is correct


const defaultMantineComponents = {
  // Overrides for standard HTML elements to use Mantine versions
  p: (props: any) => <Text size="md" {...props} />,
  h1: (props: any) => <Title order={1} {...props} />,
  h2: (props: any) => <Title order={2} {...props} />,
  h3: (props: any) => <Title order={3} {...props} />,
  h4: (props: any) => <Title order={4} {...props} />,
  
  // Custom components (e.g., FileTreeLabel usage)
  FileTreeLabel: FileTreeLabel,

  // Mantine Component Mappings (Required for MDX to find components like <Button>)
  Button: Button,
  Center: Center,
  Code: Code,
  Text: Text,
  Title: Title,
  Divider: Divider,
  Paper: Paper,
  Stack: Stack,
  List: List,
  Grid: Grid,
  Group: Group,
  Anchor: Anchor,
};


export const useMDXComponents = (components: any = {}) => {
    const baseComponents = getMDXComponents(components);
    
    return {
        ...baseComponents,
        ...defaultMantineComponents, // Inject the Mantine and custom components
        ...components, // Finally, use any user-defined components passed in (highest precedence)
    };
};
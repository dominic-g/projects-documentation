import { IconBrandMantine } from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';

export function Logo({ logoUrl }: { logoUrl?: string }) {
  const theme = useMantineTheme();

  if (logoUrl) {
    return <img src={logoUrl} alt="Project Logo" style={{ height: '48px', width: 'auto' }} />;
  }
  
  return <IconBrandMantine size={48} color={theme.colors.blue[5]} />;
}

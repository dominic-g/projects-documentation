// import { IconBrandMantine } from '@tabler/icons-react';
import { useMantineTheme, NavLink } from '@mantine/core';
import DominicLogo from '@dominic_n/react-dominic-logo-animation'

// export function Logo({ logoUrl, homeUrl }: { logoUrl?: string, homeUrl?: string  }) {
export function Logo({ logoUrl }: { logoUrl?: string  }) {
  const theme = useMantineTheme();

  if (logoUrl) {
    return <img src={logoUrl} alt="Project Logo" style={{ height: '48px', width: 'auto' }} />;
  }
  
  // const link = homeUrl || 'https://dominicn.dev/';
  const link = 'https://dominicn.dev/';

  return <NavLink 
          component="a" 
          href={link} 
          target="_blank"
          label={
              <DominicLogo />
          }
          p={4}
          c="blue.4"
          fw={600}
          style={{ width: '180px', maxWidth: '75%'}}
          color={theme.colors.blue[5]}
      />
  // return <IconBrandMantine size={48} color={theme.colors.blue[5]} />;
}

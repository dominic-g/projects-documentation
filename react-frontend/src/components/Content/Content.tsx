import { Marquee } from '@gfazioli/mantine-marquee';
import { Button, Divider, Stack, Title } from '@mantine/core';

interface ContentProps {
  marqueeFeatures: string[];
}

export const Content = ({ marqueeFeatures }: ContentProps) => {
  return (
    <>
      <Divider my="md" />
      <Stack align="center" my={32} maw={{base: '95vw', lg: 900, xl: 1200}}>
        <Title order={2} ta="center">
          Features
        </Title>

        <Marquee fadeEdges pauseOnHover>
          {marqueeFeatures.map((feature, index) => (
            <Button
              key={index}
              size="xl"
              component="a" 
              href="#"
              target="_blank"
              style={{ pointerEvents: "none" }} 
            >
              {feature}
            </Button>
          ))}
        </Marquee>
      </Stack>
    </>
  );
};

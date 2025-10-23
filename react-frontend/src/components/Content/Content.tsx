import { Marquee } from '@gfazioli/mantine-marquee';
import { Button, Divider, Stack, Title } from '@mantine/core';

interface ContentProps {
  marqueeFeatures: string[];
}

export const Content = ({ marqueeFeatures }: ContentProps) => {
  return (
    <>
      <Divider my="md" />
      <Stack align="center" my={32}>
        <Title order={2} ta="center">
          Features
        </Title>

        <Marquee fadeEdges pauseOnHover>
          {marqueeFeatures.map((feature, index) => (
            <Button
              key={index}
              size="xl"
              // The original component had hardcoded links; for a WP-driven app,
              // we just render the feature name. If links are needed, you'd add a link meta field.
              // For now, let's treat them as static buttons.
              component="a" 
              href="#" // Placeholder link
              target="_blank"
            >
              {feature}
            </Button>
          ))}
        </Marquee>

        {/* <TextAnimate.Typewriter
          multiline
          value={[
            'Hello, World! Mantine Typewriter component',
            'That was a long time ago',
            'But it was fun',
          ]}
        /> */}
      </Stack>
    </>
  );
};

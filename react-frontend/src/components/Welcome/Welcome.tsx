'use client';

import { TextAnimate } from '@gfazioli/mantine-text-animate';
import { IconExternalLink } from '@tabler/icons-react';
import { getIconComponent } from '@/utils/getIconComponent';
import { Button, Center, Paper, Text, Title } from '@mantine/core';
import { Content } from '../Content/Content';
import classes from './Welcome.module.css';



interface WelcomeProps {
    titleBase: string;
    tagline: string;
    overview: string;
    buttonText: string;
    buttonLink: string;
    buttonIcon: string;
    dependencies: string;
    marqueeFeatures: string[];
}

export function Welcome({ titleBase, tagline, overview, buttonText, buttonLink, buttonIcon, dependencies, marqueeFeatures }: WelcomeProps) {
    
  const dependencyLines = dependencies.split('\n').filter(line => line.trim() !== '');
  const finalDependencyLines = ['Dependencies :', ...dependencyLines];
  

  const IconComponent = getIconComponent(buttonIcon);
  const FinalIcon = IconComponent || IconExternalLink; 
  return (
    <>
      <Title maw="90vw" mx="auto" className={classes.title} ta="center" 
          id="depedenciesAnimate" fs={{base: '3em', md: '5em'}} pt="1.2em">
        {titleBase}
        <TextAnimate
          animate="in"
          by="character"
          inherit
          variant="gradient"
          component="span"
          segmentDelay={0.2}
          loop={true}
          duration={2}
          animation="scale"
          animateProps={{
            scaleAmount: 3,
          }}
          gradient={{ from: 'pink', to: 'yellow' }}
          style={{ fontSize: '0.75em'}}
        >
          {tagline}
        </TextAnimate>
      </Title>

      <Text c="dimmed" ta="center" size="xl" maw={580} mx="auto" mt="sm">
        {overview}
      </Text>

      <Center>
        <Button
          href={buttonLink}
          component="a"
          rightSection={<IconExternalLink />}
          leftSection={<FinalIcon />}
          variant="outline"
          px={32}
          radius={256}
          size="lg"
          mx="auto"
          mt="xl"
        >
          {buttonText}
        </Button>
      </Center>

      <Paper shadow="xl" p={8} mih={300} maw={750} my={32} bg="dark.9" mx="auto" radius={8}>
        <TextAnimate.Typewriter
          inherit
          fz={11}
          c="green.5"
          ff="monospace"
          multiline
          delay={100}
          loop={false}
          value={finalDependencyLines}
        />
      </Paper>
      <Center>
      <Content marqueeFeatures={marqueeFeatures}/> 
      </Center>
      <Center pb="4em" >

      </Center>
    </>
  );
}

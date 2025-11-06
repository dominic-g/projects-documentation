import React, { useState } from "react";
import type { ReactNode, ReactElement } from "react";
import { Box, Text, useMantineTheme, useComputedColorScheme } from "@mantine/core";
import { IconFolder, IconFolderOpen, IconFile, IconChevronRight, IconChevronDown } from "@tabler/icons-react";


const FileTreeBase = ({ children }: any) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Box
      p={{base: '0.8rem 0', md: 'sm'}}
      m={{base: '2rem 0', md: '2rem 1rem'}}
      style={{
        backgroundColor: isDark ? "rgb(61, 63, 66)" : "rgb(158, 158, 162)",
        borderLeft: `1.2em solid ${isDark ? theme.colors.gray[5] : theme.colors.dark[5]}`,
        borderRadius: 6,
        fontFamily: "monospace",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {children}
    </Box>
  );
};


const LabelTag = ({
  text,
  color,
  bg,
}: {
  text: string;
  color?: string;
  bg?: string;
}) => (
  <Box
    component="span"
    style={{
      backgroundColor: bg || "#20d236",
      color: color || "#2d2c2c",
      padding: "0 0.5rem",
      display: "inline-block",
      borderRadius: "5px",
      marginLeft: "0.5rem",
      fontSize: "80%",
      fontWeight: 600,
      fontStyle: 'italic',
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = "0 0 6px rgba(0,0,0,0.2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {text}
  </Box>
);

interface ChildElementProps {
  label?: boolean;
  name?: string;
  color?: string;
  bg?: string;
  children?: ReactNode;
}

const FileTreeFolder = ({
  name,
  color,
  bg,
  children,
  label = false,
}: {
  name: string;
  color?: string;
  bg?: string;
  children?: ReactNode;
  label?: boolean;
}) => {
  const [open, setOpen] = useState(true);

  if (label) {
    return <LabelTag text={name} color={color} bg={bg} />;
  }

  const hasChildren = !!children;
  const childrenArray = React.Children.toArray(children) as ReactElement<ChildElementProps>[];

  const labelChildren = childrenArray.filter((child) => child.props?.label);
  const normalChildren = childrenArray.filter((child) => !child.props?.label);

  return (
    <Box ml={{base: "4px", md: "md"}} style={{ fontWeight: "bold", margin: "4px 0" }}>
      <Box
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          cursor: hasChildren ? "pointer" : "default",
          userSelect: "none",
          transition: "background-color 0.2s ease",
          padding: "0.15rem 0.25rem",
          borderRadius: "4px",
          flexWrap: "wrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {hasChildren && (
          <>
            {open ? (
              <IconChevronDown size={14} stroke={1.7} />
            ) : (
              <IconChevronRight size={14} stroke={1.7} />
            )}
          </>
        )}
        {open ? (
          <IconFolderOpen size={16} stroke={1.7} style={{width: "1.2em", height: "1.2em",}} />
        ) : (
          <IconFolder size={16} stroke={1.7} style={{width: "1.2em", height: "1.2em",}} />
        )}
        <Text component="span">{name}</Text>

        {labelChildren.length > 0 && (
          <Box style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {labelChildren.map((child, i) => (
              <Box key={i} style={{ display: "inline-block" }}>
                {child}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {hasChildren && open && (
        <Box ml="md">
          {normalChildren}
        </Box>
      )}
    </Box>
  );
};



const FileTreeFile = ({ name, children }: { name: string | React.ReactNode; children?: React.ReactNode }) => (
  <Box
    ml="xl"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.35rem",
      marginBottom: "4px",
    }}
  >
    <IconFile size={14} stroke={1.7}  style={{width: "1.2em", height: "1.2em",}}/>
    <Text component="span" style={{ fontStyle: "italic" }}>
      {name}
    </Text>
    {children}
  </Box>
);

export const FileTree = Object.assign(FileTreeBase, {
  Folder: FileTreeFolder,
  File: FileTreeFile,
});

// import * as Mantine from "@mantine/core";
import { Box, useMantineTheme, useComputedColorScheme } from "@mantine/core";



const FileTreeBase = ({ children }: any) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme(); // "light" or "dark"
  const isDark = colorScheme === "dark";

  return (
    <Box
      p="sm"
      style={{
        backgroundColor: isDark
          ? "rgb(61, 63, 66)"
          : "rgb(158, 158, 162)",
        borderLeft: `1.2em solid ${
          isDark ? theme.colors.gray[5] : theme.colors.dark[5]
        }`,
        borderRadius: 6,
        fontFamily: "monospace",
        margin: "2rem 1rem",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {children}
    </Box>
  );
};

const FileTreeFolder = ({ name, children, ...rest }: any) => (
  <Box ml="md" style={{ fontWeight: "bold", margin: 4 }} {...rest}>
    📁 {name}
    <div style={{ marginLeft: "1rem" }}>{children}</div>
  </Box>
);

const FileTreeFile = ({ name, ...rest }: any) => (
  <Box ml="xl" style={{ fontStyle: "italic", marginBottom: 4 }} {...rest}>
    📄 {name}
  </Box>
);

export const FileTree = Object.assign(FileTreeBase, {
  Folder: FileTreeFolder,
  File: FileTreeFile,
});

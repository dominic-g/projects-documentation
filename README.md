# Project Documentation

A plugin to create and display modern, interactive documentation for projects using a React/Mantine frontend and WordPress as a headless CMS.

## Description

The **Project Documentation** plugin transforms your WordPress installation into a powerful documentation engine. By leveraging a WordPress Custom Post Type (CPT) for data management and a dedicated **React/Vite frontend** for display, it offers a seamless, fast, and modern user experience.

### Key Strengths:

*   **Modern UI with Mantine:** Documentation is rendered using the powerful Mantine UI library, providing a clean, responsive, and professional look with built-in dark/light mode switching.
*   **MDX Support:** Write your documentation using **MDX (Markdown + JSX)**, allowing you to seamlessly embed interactive React components (like buttons, charts, and custom layouts) directly within your standard Markdown.
*   **Headless Architecture:** Your WordPress content lives safely in the backend while a fast, single-page application (SPA) handles the public-facing viewer, enhancing performance and UX.
*   **Flexible Linking:** Easily link documentation to any existing Post or Custom Post Type in WordPress.
*   **Single-Document Search:** Includes a dedicated REST API endpoint for fast, per-document search capabilities directly within the React application.

## Installation 

1.  Upload the `projects-documentation` folder to the `/wp-content/plugins/` directory, or install the plugin through the WordPress plugins screen directly.
2.  Activate the plugin through the 'Plugins' screen in WordPress.
3.  **Post-Activation Setup (Crucial):**
    *   The plugin automatically creates a page named **`docs-viewer`** (`/docs-viewer/`) with the necessary shortcode.
    *   **Go to Settings -> Permalinks and click 'Save Changes'** to flush the rewrite rules. This ensures the clean URLs (e.g., `/docs-viewer/12/introduction`) work correctly.
4.  A new menu item **"Project Docs"** will appear in your WordPress admin sidebar.

## Usage 

### 1. Creating Documentation

1.  Navigate to **Project Docs -> Add New Project Doc**.
2.  Set the **Title** (this is the name of your project).
3.  Use the **Documentation Sections (MDX)** metabox to add your documentation content.
    *   Choose `Normal (MDX Content)` for content sections.
    *   Choose `Separator (Navigation Divider)` for menu breaks.
4.  In the sidebar **Link to Parent Post**, search for and select the Post, Page, or CPT you want to link this documentation to.
5.  Publish the Project Doc.

### 2. Frontend Shortcodes

The plugin provides two primary shortcodes:

| Shortcode | Purpose | Example |
| :--- | :--- | :--- |
| **`[project_doc_viewer]`** | **Required once** on the `/docs-viewer` page to initialize the React application container. | `[project_doc_viewer]` |
| **`[project_doc_link]`** | Displays a link to the attached documentation for a specific post. | `[project_doc_link text="View Docs" post_id="123"]` |

**Best Practice for Link Shortcode:**
Use `[project_doc_link]` inside the WordPress Loop of the Post, Page, or CPT that you *linked* to the Project Doc in step 4 above.

```php
// Example theme code (inside the loop for Post ID 123)
echo do_shortcode( '[project_doc_link post_id="' . get_the_ID() . '" text="Read Project Docs"]' ); 
```

### 3. Theme Integration Function

For theme developers who need a direct URL without relying on the shortcode execution, use the global function:

`pd_get_linked_documentation_url( $post_id )`

This function is defined in the plugin and is safe to call from your theme.

**Usage Example in `functions.php` or a Theme Template:**

```php
<?php
// Check if the plugin is active AND provides the function
if ( function_exists( 'pd_get_linked_documentation_url' ) ) {
    
    // Get the documentation link for the current post in the loop
    $doc_link = pd_get_linked_documentation_url( get_the_ID() );

    if ( $doc_link ) {
        // Output a custom button or link using the returned URL
        echo '<a href="' . esc_url( $doc_link ) . '" class="my-theme-doc-button">';
        echo 'Go to Documentation Viewer';
        echo '</a>';
    }
}
?>
```

## MDX and Mantine Component Guide

The core strength of this plugin is its **MDX** support, allowing you to use a vast array of Mantine components directly in your documentation.

### Basic Mantine Component Usage:

The following components (and many more) are globally exposed and can be used with standard JSX syntax within your content sections:

| Component | Description | Example MDX |
| :--- | :--- | :--- |
| `<Title>` / `<Text>` | Typography components. | `<Title order={2}>Chapter Heading</Title>` |
| `<Button>` | Standard Mantine button. | `<Button color="grape" size="lg">Get Started</Button>` |
| `<Center>` / `<Box>` | Layout containers. | `<Center><Button>Centered Button</Button></Center>` |
| `<List>` / `<List.Item>` | Replacement for standard `<ul>`/`<li>`. | `<List type="ordered">...</List>` |
| `<FileTree>` | Renders an interactive file structure. | `<FileTree><FileTree.Folder name="src">...</FileTree.Folder></FileTree>` |
| `<TextAnimate>` | For eye-catching animated text effects. | `<TextAnimate animate="in" by="word" variant="gradient">WOW</TextAnimate>` |
| `<AreaChart>` | For simple data visualization (requires chart data props). | `<AreaChart data={...} />` |

**Example of combining Markdown and Mantine JSX:**

```markdown
This is my initial markdown introduction.

## Getting Setup

<Center mt="xl">
  <Button 
    component="a" 
    href="https://github.com/my-project" 
    target="_blank" 
    size="xl"
  >
    View on GitHub
  </Button>
</Center>

To continue, check the code block below:

```bash
npm install
`` 
```
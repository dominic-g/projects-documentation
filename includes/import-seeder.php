<?php
/**
 * Project Documentation Seeder Script
 *
 * NOTE: This script is intended to be run ONCE manually by visiting its URL,
 * then IMMEDIATELY DELETED for security.
 *
 * To run: Access the file directly in your browser:
 * http://YOUR-WORDPRESS-SITE/wp-content/plugins/projects-documentation/import-seeder.php
 */

// Load WordPress environment
require_once( $_SERVER['DOCUMENT_ROOT'] . '/dummy/wp-load.php' );

// Security Check
if ( ! current_user_can( 'administrator' ) ) {
	wp_die( 'You do not have permission to run this script.' );
}

// Check if the CPT exists
if ( ! post_type_exists( 'project-doc' ) ) {
	wp_die( 'Custom Post Type "project-doc" does not exist. Please activate the plugin first.' );
}

// --- DEFINE PROJECT DATA (ACCURATE from your codebase) ---

// From components/Welcome/Welcome.tsx & package.json
$project_name       = 'Mantine Next.js + Nextra Template';
$project_title_base = 'Mantine Next.js +';
$tagline_text       = 'Nextra template';
$overview_text      = "This starter Next.js project includes a minimal setup for server side rendering, if you want to learn more on Mantine + Next.js integration follow this guide. To get started edit page.tsx file.";
$button_text        = 'Use template v2.3.1'; // From package.json version
$button_link        = 'https://github.com/gfazioli/next-app-nextra-template';
$button_icon        = 'IconBrandGithub';

// Dependencies from package.json
$dependencies = [
    '@gfazioli/mantine-marquee: ^2.6.1',
    '@gfazioli/mantine-text-animate: ^2.3.1',
    '@mantine/core: 8.3.3',
    '@mantine/hooks: 8.3.3',
    '@mdx-js/loader: ^3.1.1',
    '@mdx-js/react: ^3.1.1',
    '@next/bundle-analyzer: ^15.5.4',
    '@tabler/icons-react: ^3.35.0',
    'next: 15.5.4',
    'nextra: 4.6.0',
    'nextra-theme-docs: 4.6.0',
    'react: 19.2.0',
    'react-dom: 19.2.0',
    'swr: ^2.3.6',
];

// Marquee Features from components/Content/Content.tsx
$marquee_features = [
    'Mantine Marquee',
    'Mantine Reflection',
    'Mantine Split Pane',
    'Mantine Spinner',
    'Mantine Parallax',
];

// Footer text from components/MantineNavBar/MantineNavBar.tsx and general links
$footer_html = '
    <p>
        <strong>The Next Mantine Docs Builder</strong> | 
        <a href="https://discord.com/invite/wbH82zuWMN" target="_blank">Discord</a> | 
        <a href="https://github.com/gfazioli/next-app-nextra-template" target="_blank">GitHub Project</a>
    </p>
    <p>
        <a href="https://github.com/sponsors/gfazioli?o=esb" target="_blank">Sponsor gfazioli</a>
    </p>
';

// --- DEFINE DOCUMENTATION SECTIONS (ACCURATE from your content/*.mdx) ---
$doc_sections = [
	// content/index.mdx (Introduction)
	[
		'type'      => 'normal',
		'title'     => 'Introduction',
		'placement' => 'top',
		'content'   => "# Introduction\n\nHello, world! Welcome to the Nextra + Mantine template.\n\nThis is a starter template for [Next.js](https://nextjs.org/) app router + [Mantine](https://mantine.dev/) + [Nextra](https://nextra.site/) documentation site.\n\n## Features\n\nThis template comes with the following features:\n- [PostCSS](https://postcss.org/) with [mantine-postcss-preset](https://mantine.dev/styles/postcss-preset)\n- [TypeScript](https://www.typescriptlang.org/)\n- [Storybook](https://storybook.js.org/)\n- [Jest](https://jestjs.io/) setup with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)\n- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)\n- Provides API example in /api/version",
	],
    // content/markdown.mdx (Markdown MDX overview)
	[
		'type'      => 'normal',
		'title'     => 'Markdown MDX overview',
		'placement' => 'bottom',
		'content'   => "# Markdown MDX overview\n\n`nextra-theme-docs` and `nextra-theme-blog` support replacing GitHub alert syntax with `<Callout>` component for `.md`/`.mdx` files.\n\n## Example\n\n> [!NOTE]\n> Useful information that users should know, even when skimming content.\n\n> [!TIP]\n> Helpful advice for doing things better or more easily.",
	],
    // content/mantine.mdx (Mantine)
	[
		'type'      => 'normal',
		'title'     => 'Mantine',
		'placement' => 'bottom',
		'content'   => "# Mantine\n\nOf course, you can use the [Mantine](https://mantine.dev/) components in your Nextra documentation site. Here is an example of how to use the [Button](https://mantine.dev/core/button/) component:\n\n<Center my={32}><Button>Hello Mantine</Button></Center>\n\n## Third-party components\n\nYou can use any third-party components in your Nextra documentation site.",
	],
    // content/api.mdx (API) - Renamed from API to General Info, as we removed the GitHub/Upstash APIs
	[
		'type'      => 'normal',
		'title'     => 'API & Integrations (Placeholder)',
		'placement' => 'bottom',
		'content'   => "# API & Integrations\n\nThis section would historically contain the GitHub and Pagefind API documentation. Since those were removed, this is a placeholder for new project-specific integrations.",
	],
    // Separators (Based on content/_meta.ts)
    [
		'type'      => 'separator',
		'title'     => 'SECTION DIVIDER',
		'placement' => 'bottom',
		'content'   => '',
	],
];


// --- 2. CREATE POST ---
$post_args = array(
	'post_title'   => $project_name,
	'post_type'    => 'project-doc',
	'post_status'  => 'publish',
	'post_author'  => get_current_user_id(),
);

$new_post_id = wp_insert_post( $post_args, true );

if ( is_wp_error( $new_post_id ) ) {
	wp_die( 'Error creating post: ' . $new_post_id->get_error_message() );
}


// --- 3. SAVE CUSTOM FIELDS ---

// Welcome Fields
update_post_meta( $new_post_id, 'pd_project_title', $project_title_base );
update_post_meta( $new_post_id, 'pd_tagline_text', $tagline_text );
update_post_meta( $new_post_id, 'pd_overview_text', $overview_text );
update_post_meta( $new_post_id, 'pd_button_text', $button_text );
update_post_meta( $new_post_id, 'pd_button_link', $button_link );
update_post_meta( $new_post_id, 'pd_button_icon', $button_icon );
update_post_meta( $new_post_id, 'pd_dependencies', implode("\n", $dependencies) ); // Save as newline-separated string

// Footer
update_post_meta( $new_post_id, 'pd_footer_html', $footer_html );

// Marquee Features (Save to post meta AND global option)
update_post_meta( $new_post_id, 'pd_marquee_features', $marquee_features );
$global_features = get_option( 'pd_global_features', array() );
$new_global_features = array_unique( array_merge( $global_features, $marquee_features ) );
update_option( 'pd_global_features', $new_global_features );

// Documentation Sections
update_post_meta( $new_post_id, 'pd_doc_sections', $doc_sections );


echo '<h1>SUCCESS!</h1>';
echo '<p>One "Project Documentation" post has been created and populated with data from your old Nextra app.</p>';
echo '<p>Post ID: <strong>' . $new_post_id . '</strong></p>';
echo '<p>View the post in admin: <a href="' . esc_url( get_edit_post_link( $new_post_id ) ) . '">Edit Project Doc</a></p>';
echo '<p style="color: red; font-weight: bold;">SECURITY WARNING: DELETE THIS FILE IMMEDIATELY: <code>projects-documentation/import-seeder.php</code></p>';

// Script stops here
exit;
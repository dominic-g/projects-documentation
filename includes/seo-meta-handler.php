<?php
/**
 * SEO Meta Handler for Project Documentation Viewer.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Disables metadata output from Yoast SEO and Rank Math on the docs-viewer page.
 * Uses a high action priority (0) to run early before most plugin meta tags are registered.
 */
function pd_disable_conflicting_seo_output() {
    if ( ! is_page( 'docs-viewer' ) ) {
        return;
    }

    // --- Yoast SEO suppression  ---
    if ( defined( 'WPSEO_VERSION' ) ) {
        // Disables ALL OpenGraph and Twitter meta presenters.
        add_filter( 'wpseo_frontend_presenter_classes', function( $presenters ) {
            return [];
        }, 1, 1 );

        // Remove canonical, description, and title tags 
        add_filter( 'wpseo_canonical', '__return_false', 1 );
        add_filter( 'wpseo_metadesc', '__return_false', 1 );
        add_filter( 'wpseo_title', '__return_false', 1 );
        
        // Optionally disable JSON-LD schema
        add_filter( 'wpseo_json_ld_output', '__return_false', 1 );
    }


    // --- Rank Math suppression (Uses reliable remove_all_actions pattern) ---
    if ( defined( 'RANK_MATH_VERSION' ) ) {
        // Stop all OG and Twitter output by removing their actions from rank_math/head
        add_action( 'rank_math/head', function() {
            remove_all_actions( 'rank_math/opengraph/facebook' );
            remove_all_actions( 'rank_math/opengraph/twitter' );
        }, 1 );
        
        // Stop meta title / description / canonical filters
        add_filter( 'rank_math/frontend/title', '__return_false', 1 );
        add_filter( 'rank_math/frontend/description', '__return_false', 1 );
        add_filter( 'rank_math/frontend/canonical', '__return_false', 1 );
    }

    if ( defined( 'AIOSEO_VERSION' ) ) {
        add_filter( 'aioseo_should_run', function( $bool, $context ) {
            if ( $context === 'frontend' ) {
                return false;
            }
            return $bool;
        }, 1, 2 );

        add_filter( 'aioseo_html_page_title', '__return_false', 1 );
        add_filter( 'aioseo_meta_description', '__return_false', 1 );
        add_filter( 'aioseo_canonical_url', '__return_false', 1 );
        
        add_filter( 'aioseo_should_add_schema_markup', '__return_false', 1 );
    }


    /**
     * SEOPress
     */
    if ( defined( 'SEOPRESS_VERSION' ) || function_exists( 'seopress_init' ) ) {

        // Disable OG & Twitter meta
        add_filter( 'seopress_social_og', '__return_false', 1 );
        add_filter( 'seopress_social_twitter_card', '__return_false', 1 );

        // Remove core meta tags
        add_filter( 'seopress_titles_title', '__return_false', 1 );
        add_filter( 'seopress_titles_desc', '__return_false', 1 );
        add_filter( 'seopress_titles_canonical', '__return_false', 1 );

        // Disable JSON-LD schema
        add_filter( 'seopress_schemas_enabled', '__return_false', 1 );
    }

    /**
     * The SEO Framework (TSF)
     */
    if ( defined( 'THE_SEO_FRAMEWORK_VERSION' ) ) {

        // Disable meta tag generation entirely for this request
        add_filter( 'the_seo_framework_ld_json', '__return_empty_array', 1 );
        add_filter( 'the_seo_framework_generate_title', '__return_false', 1 );
        add_filter( 'the_seo_framework_generate_description', '__return_false', 1 );
        add_filter( 'the_seo_framework_rel_canonical_output', '__return_false', 1 );

        // Remove OpenGraph + Twitter card generation
        add_filter( 'the_seo_framework_enable_opengraph', '__return_false', 1 );
        add_filter( 'the_seo_framework_enable_twitter', '__return_false', 1 );
    }
}

add_action( 'wp', 'pd_disable_conflicting_seo_output', 0 ); 


add_action( 'wp', 'pd_disable_conflicting_seo_output' );
/**
 * Utility function to find the first heading (H1-H6) in MDX/Markdown content.
 * 
 * @param string $content The MDX content.
 * @return string|null The text of the first heading, or null.
 */
function pd_get_first_heading( $content ) {
    // Regex to find the first #, ##, ###, ####, #####, ###### followed by a space
    if ( preg_match('/^(#+)\s+(.+)/m', $content, $matches) ) {
        return trim( $matches[2] );
    }
    // Fallback for JSX Title tags like <Title order={2}>Text</Title>
    if ( preg_match('/<Title\s+[^>]*>([^<]+)<\/Title>/i', $content, $matches) ) {
        return trim( $matches[1] );
    }
    return null;
}

/**
 * Utility function to get the first image URL from MDX content.
 * 
 * @param string $content The MDX content.
 * @return string|null The image URL, or null.
 */
function pd_get_first_image_url( $content ) {
    // Markdown Image: ![alt](url)
    if ( preg_match('/\!?\[[^\]]*\]\(([^)]+)\)/i', $content, $matches) ) {
        return esc_url_raw( $matches[1] );
    }
    // JSX Image: <Image src="url" ...>
    if ( preg_match('/<Image\s+src=["\']([^"\']+)["\'][^>]*>/i', $content, $matches) ) {
        return esc_url_raw( $matches[1] );
    }
    return null;
}

/**
 * Utility function to strip MDX/Markdown/JSX and clip content for description.
 * 
 * @param string $content The content to process.
 * @param int $length The maximum length for the description.
 * @return string The clipped, clean description.
 */
function pd_clip_description( $content, $length = 160 ) {
    // Remove Markdown headings, links, bold/italic markers, and JSX/HTML tags
    $content = preg_replace('/<[^>]+>|[{}\[\]\(\)]|^\s*#+\s*|[\*_`]/m', ' ', $content);
    // Normalize whitespace
    $content = trim( preg_replace('/\s+/', ' ', $content) );
    
    // Clip the text
    return wp_trim_words( $content, 55, '...' ); // 55 words ~= 160 chars
}

/**
 * Utility function to find keywords from an MDX comment block.
 * 
 * Though i have seen like keyword meta is not effective anymore we still have incuded it
 * 
 * @param string $content The MDX content.
 * @return string|null The comma-separated list of keywords, or null.
 */
function pd_get_keywords_from_content( $content ) {
    // Regex to find: <!-- keywords: ... --> or <!-- keywords: ... -->
    if ( preg_match( '/<!--\s*keywords:\s*([^>]+)\s*-->/i', $content, $matches ) ) {
        // Strip whitespace and clean up the captured group
        $keywords = trim( $matches[1] );
        $keywords = strip_tags( $keywords );
        return sanitize_text_field( $keywords );
    }
    return null;
}

/**
 * Generates the basic WebPage Schema with a clipped ItemList of documentation sections.
 * 
 * @param WP_Post $post The Project Doc post object.
 * @param string $title The SEO title.
 * @param string $description The SEO description.
 * @param string $image_url The SEO image URL.
 * @param string $url The current page URL.
 * @return array The structured data array.
 */
function pd_generate_webpage_schema( $post, $title, $description, $image_url, $url ) {
    $sections = get_post_meta( $post->ID, 'pd_doc_sections', true );
    $sections = is_array( $sections ) ? $sections : array();
    
    // Get the base viewer URL
    $viewer_page = get_page_by_path( 'docs-viewer' ); 
    $base_viewer_url = $viewer_page ? trailingslashit( get_permalink( $viewer_page->ID ) ) . $post->ID . '/' : $url;
    
    $schema = array(
        '@context'    => 'https://schema.org',
        '@type'       => 'WebPage',
        'headline'    => $title,
        'description' => $description,
        'url'         => $url,
        'image'       => array(
            '@type' => 'ImageObject',
            'url'   => $image_url,
        ),
        'publisher'   => array(
            '@type' => 'Organization',
            'name'  => get_bloginfo( 'name' ),
        ),
    );

    $list_items = [];
    $item_count = 0;
    $max_items = 6;
    
    // Build the ItemList from documentation sections
    foreach ( $sections as $section ) {
        if ( $section['type'] !== 'normal' || empty( $section['title'] ) || $item_count >= $max_items ) {
            continue;
        }

        $section_slug = sanitize_title( $section['title'] );
        $section_url = $base_viewer_url . $section_slug . '/';

        $list_items[] = array(
            '@type'    => 'ListItem',
            'position' => $item_count + 1,
            'item'     => array(
                '@type' => 'WebPage',
                'url'   => esc_url( $section_url ),
                'name'  => $section['title'],
            ),
        );
        $item_count++;
    }

    if ( ! empty( $list_items ) ) {
        $schema['mainEntity'] = array(
            '@type'        => 'ItemList',
            'itemListElement' => $list_items,
        );
    }
    
    return apply_filters( 'pd_webpage_schema', $schema );
}



/**
 * Overrides the WordPress document title with the SEO title we generated.
 */
function pd_override_document_title( $parts ) {
    // Only run on the docs-viewer page template and if we have a valid doc ID
    if ( ! is_page( 'docs-viewer' ) ) {
        return $parts;
    }
    
    $doc_id = get_query_var( 'pd_doc_id' );
    if ( ! $doc_id || get_post_type( $doc_id ) !== 'project-doc' ) {
        $doc_id = absint( get_option( 'pd_default_doc_id', 0 ) );
    }
    if ( $doc_id === 0 ) {
        return $parts;
    }
    
    $post = get_post( $doc_id );
    $sections = get_post_meta( $doc_id, 'pd_doc_sections', true );
    $show_welcome = get_post_meta( $doc_id, 'pd_show_welcome', true ) === '1';
    $welcome_mdx = get_post_meta( $doc_id, 'pd_welcome_mdx', true );
    $sections = is_array( $sections ) ? $sections : array();
    
    // Determine primary content to get heading
    $primary_content = '';
    $current_section_title = '';
    if ( $show_welcome && ! empty( $welcome_mdx ) ) {
        $primary_content = wp_unslash( $welcome_mdx );
        $current_section_title = 'Welcome';
    } elseif ( ! empty( $sections ) ) {
        $first_normal_section = array_filter( $sections, function($s) { return $s['type'] === 'normal'; } );
        if ( ! empty( $first_normal_section ) ) {
            $first_section = reset( $first_normal_section );
            $primary_content = wp_unslash( $first_section['content'] );
            $current_section_title = $first_section['title'];
        }
    }
    
    if ( empty( $primary_content ) ) {
        return $parts;
    }
    
    // Construct the desired SEO title
    $site_name = get_bloginfo( 'name' );
    $project_title = $post->post_title;
    $seo_title_base = $project_title . ' Documentation'; // Start with the CPT title

    // Override with first heading if available
    $heading = pd_get_first_heading( $primary_content );
    if ( $heading && $current_section_title !== 'Welcome' ) {
        $seo_title_base = $heading . ' - ' . $project_title . ' Docs';
    }
    
    // Override ALL title parts
    $parts['title'] = $seo_title_base;
    $parts['site'] = $site_name; // Keep site name separate for standard format
    
    return $parts;
}

add_filter( 'document_title_parts', 'pd_override_document_title', 20 ); // we Used priority 20 to run after Yoast/RankMath

/**
 * Injects the necessary SEO meta tags into the document head.
 */
function pd_inject_seo_meta_tags() {
    // Only run on the docs-viewer page template
    if ( ! is_page( 'docs-viewer' ) ) {
        return;
    }
    
    // Get the target doc ID from the URL (rewrite rule)
    $doc_id = get_query_var( 'pd_doc_id' );
    if ( ! $doc_id || get_post_type( $doc_id ) !== 'project-doc' ) {
        // Fallback or use a default
        $doc_id = absint( get_option( 'pd_default_doc_id', 0 ) );
    }
    
    // If no valid ID, let standard WP SEO handle the page
    if ( $doc_id === 0 ) {
        return;
    }
    
    // Retrieve CPT data
    $post = get_post( $doc_id );
    $sections = get_post_meta( $doc_id, 'pd_doc_sections', true );
    $show_welcome = get_post_meta( $doc_id, 'pd_show_welcome', true ) === '1';
    $welcome_mdx = get_post_meta( $doc_id, 'pd_welcome_mdx', true );

    $sections = is_array( $sections ) ? $sections : array();

    // Determine primary content for SEO
    $primary_content = '';
    $current_section_title = '';
    
    if ( $show_welcome && ! empty( $welcome_mdx ) ) {
        $primary_content = wp_unslash( $welcome_mdx );
        $current_section_title = 'Welcome';
    } elseif ( ! empty( $sections ) ) {
        // Use the first normal section
        $first_normal_section = array_filter( $sections, function($s) { return $s['type'] === 'normal'; } );
        if ( ! empty( $first_normal_section ) ) {
            $first_section = reset( $first_normal_section );
            $primary_content = wp_unslash( $first_section['content'] );
            $current_section_title = $first_section['title'];
        }
    }
    
    if ( empty( $primary_content ) ) {
        return;
    }

    $site_name = get_bloginfo( 'name' );
    $project_title = $post->post_title;
    
    $seo_title_base = $project_title . ' Documentation | ' . $site_name;
    $seo_description = pd_clip_description( $primary_content );
    $current_url = get_permalink();
    $seo_image = pd_get_first_image_url( $primary_content ) ?: PD_ASSETS_URL . 'img/ogplaceholder.png';
    $seo_keywords = pd_get_keywords_from_content( $primary_content );
    
    // Override title with first heading if available
    $heading = pd_get_first_heading( $primary_content );
    if ( $heading && $current_section_title !== 'Welcome' ) {
        $seo_title_base = $heading . ' - ' . $project_title . ' Docs | ' . $site_name;
    }

    echo "\n<!-- Project Documentation SEO Meta -->\n";
    
    // Standard Meta Title (should override <title> tag)
    // echo '<title>' . esc_html( $seo_title_base ) . '</title>' . "\n";
    
    // Standard Meta Description
    echo '<meta name="description" content="' . esc_attr( $seo_description ) . '">' . "\n";

    // Keywords Meta Tag (Only if found)
    if ( ! empty( $seo_keywords ) ) {
        echo '<meta name="keywords" content="' . esc_attr( $seo_keywords ) . '">' . "\n";
    }
    
    // Open Graph (Facebook/LinkedIn)
    echo '<meta property="og:title" content="' . esc_attr( $seo_title_base ) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr( $seo_description ) . '">' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:url" content="' . esc_url( get_permalink() ) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url( $seo_image ) . '">' . "\n";
    
    // Twitter Card
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr( $seo_title_base ) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr( $seo_description ) . '">' . "\n";
    echo '<meta name="twitter:image" content="' . esc_url( $seo_image ) . '">' . "\n";

    // --- SCHEMA MARKUP (LD+JSON) ---
    $schema_data = pd_generate_webpage_schema( $post, $seo_title_base, $seo_description, $seo_image, $current_url );
    
    if ( ! empty( $schema_data ) ) {
        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode( $schema_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT );
        echo "\n" . '</script>' . "\n";
    }
    echo "<!-- End Project Documentation SEO Meta -->\n";
}

add_action( 'wp_head', 'pd_inject_seo_meta_tags', 1 );
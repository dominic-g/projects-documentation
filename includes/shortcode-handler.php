<?php
/**
 * Shortcode Handler for Projects Documentation Plugin.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the shortcode.
 */
function pd_register_shortcode() {
    add_shortcode( 'project_doc_link', 'pd_documentation_link_handler' ); 
    
    add_shortcode( 'project_doc_viewer', 'pd_documentation_viewer_handler' );
}


/**
 * Shortcode callback function for the link.
 * Usage: [project_doc_link post_id="X" text="Docs"]
 */
function pd_documentation_link_handler( $atts ) {
	$atts = shortcode_atts(
		array(
			'post_id' => get_the_ID(), 
			'text'    => 'View Documentation',
			'class'   => 'pd-doc-link',
		),
		$atts,
		'project_doc_link'
	);

	$parent_post_id = absint( $atts['post_id'] );
	if ( ! $parent_post_id ) {
		return ''; 
	}

	$doc_post = null; 
	$doc_post_query = new WP_Query( array(
		'post_type'      => 'project-doc',
		'post_status'    => 'publish',
		'posts_per_page' => 1,
		'meta_key'       => 'pd_linked_post_id',
		'meta_value'     => $parent_post_id,
	) );

	if ( $doc_post_query->have_posts() ) {
		$doc_post = $doc_post_query->posts[0];
	}

	wp_reset_postdata();

	if ( ! $doc_post ) {
		return ''; 
	}

	$viewer_page = get_page_by_path( 'docs-viewer' ); 

	if ( ! $viewer_page ) {
	    return '<!-- Error: Docs Viewer Page not found. -->';
	}

	// // Construct the final link URL: /docs-viewer/?doc_id=123
	// $link_url = add_query_arg( array(
	// 	'doc_id' => $doc_post->ID,
	// ), get_permalink( $viewer_page->ID ) );

	$link_slug = '';
	$viewer_url = get_permalink( $viewer_page->ID );
	$has_slash = trailingslashit($viewer_url) === $viewer_url;
	$link_url = $viewer_url . $doc_post->ID . (empty($link_slug) ? '/' : '/' . $link_slug . '/');
	
	return sprintf(
		'<a href="%s" class="%s">%s</a>',
		esc_url( $link_url ),
		esc_attr( $atts['class'] ),
		esc_html( $atts['text'] )
	);
}

/**
 * Shortcode callback function for the React app container.
 * Usage: [project_doc_viewer]
 */
function pd_documentation_viewer_handler() {
    return '<div id="root"></div>';
}
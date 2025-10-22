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
    add_shortcode( 'project_doc', 'pd_documentation_shortcode_handler' );
}

/**
 * Shortcode to display documentation link for a given post.
 * Usage: [project_doc post_id="X"]
 * X is the ID of the parent post (e.g., a "Product" CPT).
 */
function pd_documentation_shortcode_handler( $atts ) {
	$atts = shortcode_atts(
		array(
			'post_id' => get_the_ID(), 
			'text'    => 'View Documentation',
			'class'   => 'pd-doc-link',
		),
		$atts,
		'project_doc'
	);

	$parent_post_id = absint( $atts['post_id'] );
	if ( ! $parent_post_id ) {
		return ''; 
	}

	$doc_post_query = new WP_Query( array(
		'post_type'      => 'project-doc',
		'post_status'    => 'publish',
		'posts_per_page' => 1,
		'meta_key'       => 'pd_linked_post_id',
		'meta_value'     => $parent_post_id,
	) );

	if ( ! $doc_post_query->have_posts() ) {
		return ''; 
	}

	$doc_post = $doc_post_query->posts[0];
	wp_reset_postdata();

	$base_url = home_url( '/docs-viewer/' );

	
	$link_url = add_query_arg( array(
		'doc_id' => $doc_post->ID,
	), $base_url );

	
	return sprintf(
		'<a href="%s" class="%s">%s</a>',
		esc_url( $link_url ),
		esc_attr( $atts['class'] ),
		esc_html( $atts['text'] )
	);
}
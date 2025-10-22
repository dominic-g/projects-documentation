<?php
/**
 * REST API Functions for Projects Documentation Plugin.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the REST API fields for the project documentation.
 */
function pd_register_rest_fields() {
	// We will register fields on the 'project-doc' CPT
	register_rest_field(
		'project-doc',
		'documentation_data', 
		array(
			'get_callback' => 'pd_get_documentation_data',
			'schema'       => null,
		)
	);
}

/**
 * REST API Callback: Gathers all custom fields for the project documentation.
 *
 * @param array $object The post object.
 * @return array All custom field data.
 */
function pd_get_documentation_data( $object ) {
	$post_id = $object['id'];

	// Get Logo URL from Featured Image
	$logo_id = get_post_thumbnail_id( $post_id );
	$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : '';

	// 1. Core Welcome Page Fields
	$data = array(
		'project_title' => get_post_meta( $post_id, 'pd_project_title', true ),
		'tagline_text'  => get_post_meta( $post_id, 'pd_tagline_text', true ),
		'overview_text' => get_post_meta( $post_id, 'pd_overview_text', true ),
		'logo_url'      => $logo_url,
		'button_text'   => get_post_meta( $post_id, 'pd_button_text', true ),
		'button_icon'   => get_post_meta( $post_id, 'pd_button_icon', true ),
		'button_link'   => get_post_meta( $post_id, 'pd_button_link', true ),
		'dependencies'  => get_post_meta( $post_id, 'pd_dependencies', true ),
		'footer_html'   => get_post_meta( $post_id, 'pd_footer_html', true ),
	);

	// 2. Marquee/Features
	$features = get_post_meta( $post_id, 'pd_marquee_features', true );
	$data['marquee_features'] = is_array( $features ) ? $features : array();

	// 3. Documentation Sections
	$sections = get_post_meta( $post_id, 'pd_doc_sections', true );
	$data['doc_sections'] = is_array( $sections ) ? $sections : array();

	// 4. Linked Post ID (Not directly used by React but useful for context)
	$data['linked_post_id'] = get_post_meta( $post_id, 'pd_linked_post_id', true );

	return $data;
}
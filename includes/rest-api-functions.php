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

	$features = get_post_meta( $post_id, 'pd_marquee_features', true );
	$data['marquee_features'] = is_array( $features ) ? $features : array();

	$sections = get_post_meta( $post_id, 'pd_doc_sections', true );
	$data['doc_sections'] = is_array( $sections ) ? $sections : array();

	$data['linked_post_id'] = get_post_meta( $post_id, 'pd_linked_post_id', true );

	return $data;
}



/**
 * Utility function to create an excerpt showing context around the first match.
 *
 * @param string $text The full documentation section content.
 * @param string $query The search query.
 * @return string A snippet of text (approx 50-70 characters) centered around the match.
 */
function pd_create_search_snippet( $text, $query ) {
    $text = strip_tags( $text );
    $query = strtolower( $query );
    $snippet_length = 80;
    
    // Find the first occurrence of the query string
    $match_pos = stripos( $text, $query );
    
    if ( $match_pos === false ) {
        // Fallback: return simple trimmed excerpt (shouldn't happen with our logic, but safe)
        return wp_trim_words( $text, 15 ) . '...';
    }

    // Determine the start position
    $start_pos = $match_pos - ($snippet_length / 2);
    if ( $start_pos < 0 ) {
        $start_pos = 0;
    }
    
    // Ensure the snippet ends on the content boundary
    $snippet = substr( $text, $start_pos, $snippet_length + strlen($query) );
    
    // Add ellipses
    $before = $start_pos > 0 ? '...' : '';
    $after = ( $start_pos + $snippet_length + strlen($query) ) < strlen($text) ? '...' : '';

    $highlighted_snippet = $before . $snippet . $after;
    
    // Simple non-regex highlighting: Replace only the first instance of query
    $highlighted_snippet = str_replace( 
        substr( $text, $match_pos, strlen($query) ), // Find original casing of the term
        '<span style="background-color: #ff0; color: #000;">' . substr( $text, $match_pos, strlen($query) ) . '</span>',
        $highlighted_snippet
    );

    return wp_kses_post( $highlighted_snippet );
}

/**
 * Register custom search endpoint restricted by doc_id.
 */
function pd_register_search_route() {
    register_rest_route( 'pd/v1', '/search-doc', array( 
        'methods'             => 'GET',
        'callback'            => 'pd_single_doc_search_callback',
        'permission_callback' => '__return_true',
        'args'                => array(
            'q' => array( 
                'validate_callback' => function($param, $request, $key) {
                    return is_string( $param ) && strlen( $param ) > 0;
                },
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'doc_id' => array( 
                'validate_callback' => function( $param, $request, $key ) {
                    return is_numeric( $param );
                },
                'required'          => true,
                'sanitize_callback' => 'absint',
            ),
        ),
    ) );
}
add_action( 'rest_api_init', 'pd_register_search_route' );


/**
 * Single document search: Searches only one 'project-doc' CPT sections for a query.
 * The endpoint path will be: /wp-json/pd/v1/search-doc?q=searchterm&doc_id=123
 */
function pd_single_doc_search_callback( $request ) {
    $search_query = strtolower( $request->get_param( 'q' ) );
    $doc_id = $request->get_param( 'doc_id' );
    $results = array();

    if ( strlen( $search_query ) < 3 || ! get_post_type( $doc_id ) === 'project-doc' ) {
        return new WP_REST_Response( array(), 200 );
    }

    $doc_post = get_post( $doc_id );
    $sections = get_post_meta( $doc_id, 'pd_doc_sections', true );
    $base_url = get_permalink( $doc_id );
    
    $viewer_page = get_page_by_path( 'docs-viewer' );
    $base_url = $viewer_page ? get_permalink( $viewer_page->ID ) : get_permalink( $doc_id );


    if ( is_array( $sections ) && ! empty( $doc_post ) ) {
        foreach ( $sections as $section ) {
            if ( 'normal' === $section['type'] && ! empty( $section['content'] ) ) {
                $content_lower = strtolower( $section['content'] );

                if ( str_contains( $content_lower, $search_query ) ) {
                    
                    $section_slug = sanitize_title( $section['title'] );
                    $result_url = add_query_arg( array(
                        'doc_id'  => $doc_post->ID,
                        'section' => $section_slug,
                    ), $base_url );

                    $excerpt_html = pd_create_search_snippet( $section['content'], $search_query );


                    $results[] = array(
                        'sec_title'  => $section['title'],
                        'url'        => esc_url_raw( str_replace( '&amp;', '&', $result_url ) ),
                        'excerpt_html' => $excerpt_html, 
                    );
                }
            }
        }
    }

    return new WP_REST_Response( $results, 200 );
}


\add_filter( 'pd_global_config', 'pd_add_rest_url_to_config', 10, 1 );
function pd_add_rest_url_to_config( $config ) {
    $config['searchEndpoint'] = rest_url( 'pd/v1/search-doc' );
    return $config;
}

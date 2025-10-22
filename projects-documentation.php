<?php
/**
 * Plugin Name:       Project Documentation
 * Plugin URI:        https://dominicn.dev/
 * Description:       A plugin to create and display documentation for projects.
 * Version:           1.0.0
 * Author:            Dominic_N
 * Author URI:        https://dominicn.dev/
 * License:           GPL-3.0+
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       projects-documentation-plugin
 * Domain Path:       /languages
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define the plugin directory path
define( 'PD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Autoload the necessary classes.
 */
require_once PD_PLUGIN_DIR . 'includes/class-documentation-cpt.php';

/**
 * Initialization function.
 */
function projects_documentation_init() {
    new Projects_Documentation_CPT();
}

add_action( 'plugins_loaded', 'projects_documentation_init' );

/**
 * Register the REST API fields for the project documentation.
 */
function pd_register_rest_fields() {
    register_rest_field(
        'project-doc',
        'documentation_data',
        array(
            'get_callback' => 'pd_get_documentation_data',
            'schema'       => null,
        )
    );
}
add_action( 'rest_api_init', 'pd_register_rest_fields' );

/**
 * REST API Callback: Gathers all custom fields for the project documentation.
 *
 * @param array $object The post object.
 * @return array All custom field data.
 */
function pd_get_documentation_data( $object ) {
    $post_id = $object['id'];

    // Core Welcome Page Fields
    $data = array(
        'project_title' => get_post_meta( $post_id, 'pd_project_title', true ),
        'tagline_text'  => get_post_meta( $post_id, 'pd_tagline_text', true ),
        'overview_text' => get_post_meta( $post_id, 'pd_overview_text', true ),
        'logo_url'      => get_post_meta( $post_id, 'pd_logo_url', true ),
        'button_text'   => get_post_meta( $post_id, 'pd_button_text', true ),
        'button_icon'   => get_post_meta( $post_id, 'pd_button_icon', true ),
        'button_link'   => get_post_meta( $post_id, 'pd_button_link', true ),
        'dependencies'  => get_post_meta( $post_id, 'pd_dependencies', true ),
        'footer_html'   => get_post_meta( $post_id, 'pd_footer_html', true ),
    );

    // Marquee/Features (Select2 data) - stored as a serialized array
    $features = get_post_meta( $post_id, 'pd_marquee_features', true );
    $data['marquee_features'] = is_array( $features ) ? $features : array();

    // Documentation Sections (Main content) - stored as a serialized array
    $sections = get_post_meta( $post_id, 'pd_doc_sections', true );
    $data['doc_sections'] = is_array( $sections ) ? $sections : array();

    return $data;
}
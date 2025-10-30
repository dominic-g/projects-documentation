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
 * Text Domain:       pd-textdomain
 * Domain Path:       /languages
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define the plugin directory path
define( 'PD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

define( 'PD_ASSETS_DIR', plugin_dir_path( __FILE__ ) . 'assets/dist/' );
define( 'PD_ASSETS_URL', plugin_dir_url( __FILE__ ) . 'assets/dist/' ); 

/**
 * Autoload the necessary classes.
 */
require_once PD_PLUGIN_DIR . 'includes/class-documentation-cpt.php';
require_once PD_PLUGIN_DIR . 'includes/rest-api-functions.php';
require_once PD_PLUGIN_DIR . 'includes/shortcode-handler.php';
require_once PD_PLUGIN_DIR . 'includes/enqueue_scripts-handler.php';


/**
 * Core Initialization Class to tie everything together.
 */
class Projects_Documentation {

    public function __construct() {
        new Projects_Documentation_CPT();

        add_action( 'rest_api_init', 'pd_register_rest_fields' );

        add_action( 'init', 'pd_register_shortcode' );

        add_action( 'wp_enqueue_scripts',  'pd_enqueue_frontend_app'  );

        add_filter( 'page_template', 'set_documentation_template' ); 
    }
}

/**
 * Initialization function.
 */
function projects_documentation_init() {
    new Projects_Documentation();
}

add_action( 'plugins_loaded', 'projects_documentation_init' );






/**
 * Runs on plugin activation.
 * Registers CPT then flushes rules.
 */
function pd_plugin_activate() {
    require_once PD_PLUGIN_DIR . 'includes/class-documentation-cpt.php';
    $cpt_instance = new Projects_Documentation_CPT();
    $cpt_instance->register_cpt(); 

    if ( ! get_page_by_path( 'docs-viewer' ) ) {
        $viewer_page_id = wp_insert_post( array(
            'post_title'    => 'Project Documentation Viewer',
            'post_content'  => '[project_doc_viewer]',
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_name'     => 'docs-viewer',
        ));
        
        if ( ! is_wp_error( $viewer_page_id ) ) {
            update_post_meta( $viewer_page_id, '_wp_page_template', 'default' ); 
        }
    }
    flush_rewrite_rules();
}

/**
 * Runs on plugin deactivation.
 * Flushes rules to clean up CPT endpoints.
 */
function pd_plugin_deactivate() {
    flush_rewrite_rules();
}

// Register the hooks
register_activation_hook( __FILE__, 'pd_plugin_activate' );
register_deactivation_hook( __FILE__, 'pd_plugin_deactivate' );
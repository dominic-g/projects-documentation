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

/**
 * Autoload the necessary classes.
 */
require_once PD_PLUGIN_DIR . 'includes/class-documentation-cpt.php';
require_once PD_PLUGIN_DIR . 'includes/rest-api-functions.php';
require_once PD_PLUGIN_DIR . 'includes/shortcode-handler.php';




/**
 * Core Initialization Class to tie everything together.
 */
class Projects_Documentation {

    public function __construct() {
        new Projects_Documentation_CPT();

        add_action( 'rest_api_init', 'pd_register_rest_fields' );

        add_action( 'init', 'pd_register_shortcode' );
    }
}

/**
 * Initialization function.
 */
function projects_documentation_init() {
    new Projects_Documentation();
}

add_action( 'plugins_loaded', 'projects_documentation_init' );

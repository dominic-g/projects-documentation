<?php
/**
 * Enqueueing the necessaly scripts and styles.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}



/**
 * Enqueue the built React/Vite assets ONLY on the page that uses the shortcode.
 */
function pd_enqueue_frontend_app() {
    global $post;
    $queried_id = get_queried_object_id();

    if ( is_page( 'docs-viewer' ) || is_page( $queried_id ) ) {

        $content = get_post_field( 'post_content', $queried_id );

        if ( has_shortcode( $content, 'project_doc_viewer' ) ) {
            
            $doc_id = isset( $_GET['doc_id'] ) ? absint( $_GET['doc_id'] ) : 0;
            $handle = 'pd-doc-app_bundle';


            
            wp_enqueue_style( 'pd-doc-styles', PD_ASSETS_URL . 'react-frontend.css', array(), filemtime(PD_ASSETS_DIR . 'react-frontend.css') );

            wp_enqueue_script( $handle, PD_ASSETS_URL . 'doc-bundle.js', array( 'wp-element', 'react' ), filemtime(PD_ASSETS_DIR . 'doc-bundle.js'), true );

            $rest_search_url = rest_url( 'pd/v1/search-doc' );

            wp_localize_script( $handle, 'PD_GLOBAL_CONFIG', array(
                'docId' => $doc_id, 
                'restBase' => trailingslashit( home_url( '/wp-json/wp/v2/' ) ),
                'basePath' => trailingslashit( get_permalink( $queried_id ) ),
                'searchEndpoint' => esc_url_raw( $rest_search_url ),
            ));

            $mount_script = "
                (function() {
                    const rootElement = document.getElementById('root');
                    const config = window.PD_GLOBAL_CONFIG; // Now guaranteed to be available
                    let attempts = 0;

                    const checkAndMount = () => {
                        if (window.ProjectDocumentationApp && typeof window.ProjectDocumentationApp.renderApp === 'function') {
                            // console.log('🟢 ProjectDocumentationApp found. Mounting app.');
                            window.ProjectDocumentationApp.renderApp(rootElement, config);
                            clearInterval(mountInterval);
                            return;
                        }
                        if (++attempts >= 100) { 
                            // console.error('🔴 Final Mounting Error: ProjectDocumentationApp never attached to window.');
                            clearInterval(mountInterval);
                        }
                    };

                    const mountInterval = setInterval(checkAndMount, 50);
                })();
            ";
            
            wp_add_inline_script( $handle, $mount_script );
        }
    }
}


/**
 * Dequeues all scripts and styles except those explicitly needed for the React app.
 * This ensures a conflict-free, isolated environment for the SPA.
 */
function pd_dequeue_all_but_ours() {
    // Only run this extreme cleanup on the docs-viewer page
    if ( ! is_page( 'docs-viewer' ) ) {
        return;
    }

    global $wp_styles, $wp_scripts;
    
    // all handles that MUST NOT be dequeued
    $keep_styles = array( 
        'pd-doc-styles',
        'admin-bar',
    );
    $keep_scripts = array( 
        'pd-doc-app_bundle', 
        'jquery',            
        'react',             
        'wp-element',        
        'wp-polyfill'        
    );

    // Dequeue Styles
    foreach ( $wp_styles->queue as $handle ) {
        if ( ! in_array( $handle, $keep_styles ) ) {
            wp_dequeue_style( $handle );
        }
    }

    // Dequeue Scripts
    foreach ( $wp_scripts->queue as $handle ) {
        if ( ! in_array( $handle, $keep_scripts ) ) {
            wp_dequeue_script( $handle );
        }
    }
}

// uses high priority (9999) to run AFTER all other enqueues
add_action( 'wp_enqueue_scripts', 'pd_dequeue_all_but_ours', 9999 );



function set_documentation_template( $template ) {
    global $post;

    if ( $post && ( $post->post_name === 'docs-viewer' || has_shortcode( $post->post_content, 'project_doc_viewer' ) ) ) {
        $template_file = PD_PLUGIN_DIR . 'template-docs-viewer.php';
        if ( file_exists( $template_file ) ) {
            return $template_file; // Force use of our minimal template
        }
    }
    return $template;
}


<?php
/**
 * Custom functions for Project Documentation Viewer.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Filter the default 'project-doc' labels, specifically renaming the Featured Image.
 *
 * @param array $labels The post type labels.
 * @return array The modified labels.
 */
function pd_rename_featured_image_label( $labels ) {
    $labels->featured_image = __( 'Project Logo', 'pd-textdomain' );
    $labels->set_featured_image = __( 'Set Project Logo', 'pd-textdomain' );
    $labels->remove_featured_image = __( 'Remove Project Logo', 'pd-textdomain' );
    $labels->use_featured_image = __( 'Use as Project Logo', 'pd-textdomain' );
    $labels->view_item = __( 'View Project Doc', 'pd-textdomain' );

    return $labels;
}
add_filter( 'post_type_labels_project-doc', 'pd_rename_featured_image_label' );


<?php
/*
 * Template Name: Project Documentation Viewer (React)
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <?php 
        // This is the only output in the body, which executes your shortcode:
        echo do_shortcode( '[project_doc_viewer]' ); 
    ?>
    <?php wp_footer(); ?>
</body>
</html>
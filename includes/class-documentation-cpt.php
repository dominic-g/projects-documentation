<?php
/**
 * Manages the Projects Documentation Custom Post Type and its metaboxes.
 */
class Projects_Documentation_CPT {

	public function __construct() {
		add_action( 'init', array( $this, 'register_cpt' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
		add_action( 'save_post', array( $this, 'save_meta_boxes' ) );

		// Enqueue scripts for the admin (especially for dynamic/repeater fields)
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );

		add_action( 'wp_ajax_pd_add_global_feature', array( $this, 'ajax_add_global_feature' ) );

		add_action( 'wp_ajax_pd_search_parent_posts', array( $this, 'ajax_search_parent_posts' ) );


	}

	/**
	 * Register the 'project-doc' Custom Post Type.
	 */
	public function register_cpt() {
		$labels = array(
			'name'          => _x( 'Project Docs', 'Post type general name', 'pd-textdomain' ),
			'singular_name' => _x( 'Project Doc', 'Post type singular name', 'pd-textdomain' ),
			'menu_name'     => __( 'Project Docs', 'pd-textdomain' ),
			'all_items'     => __( 'All Project Docs', 'pd-textdomain' ),
			'add_new_item'  => __( 'Add New Project Doc', 'pd-textdomain' ),
			'add_new'       => __( 'Add New', 'pd-textdomain' ),
		);
		$args   = array(
			'labels'              => $labels,
			'public'              => true,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_icon'           => 'dashicons-book',
			'query_var'           => true,
			'rewrite'             => array( 'slug' => 'project-doc' ),
			'capability_type'     => 'post',
			'has_archive'         => false,
			'hierarchical'        => false,
			'menu_position'       => 20,
			'supports'            => array( 'title', 'thumbnail'),
			'show_in_rest'        => true,
		);
		register_post_type( 'project-doc', $args );
	}

	/**
	 * Add all custom meta boxes.
	 */
	public function add_meta_boxes() {
		add_meta_box( 'pd_welcome_page', __( 'Welcome Page Settings', 'pd-textdomain' ), array( $this, 'render_welcome_box' ), 'project-doc', 'normal', 'high' );
		add_meta_box( 'pd_content_sections', __( 'Documentation Sections (MDX)', 'pd-textdomain' ), array( $this, 'render_sections_box' ), 'project-doc', 'normal', 'high' );
		add_meta_box( 'pd_footer_settings', __( 'Footer HTML Content', 'pd-textdomain' ), array( $this, 'render_footer_box' ), 'project-doc', 'normal', 'high' );
		add_meta_box( 'pd_link_post', __( 'Link to Parent Post', 'pd-textdomain' ), array( $this, 'render_link_post_box' ), 'project-doc', 'side', 'high' );
	}

	private function get_tabler_icons_list() {
	    $file_path = PD_PLUGIN_DIR . 'utils/tabler-icons.json';

	    if ( ! file_exists( $file_path ) ) {
	        return [];
	    }

	    $json_content = file_get_contents( $file_path );
	    $icons = json_decode( $json_content, true );

	    return is_array( $icons ) ? $icons : [];
	}

	/**
	 * Render the Welcome Page Settings meta box.
	 */
	public function render_welcome_box( $post ) {
		wp_nonce_field( 'pd_save_welcome_meta', 'pd_welcome_nonce' );

		// 1. Title
		$project_title = get_post_meta( $post->ID, 'pd_project_title', true );
		echo '<p><strong>Project Title</strong></p>';
		echo '<input type="text" name="pd_project_title" value="' . esc_attr( $project_title ) . '" style="width:100%;" />';

		// 2. Tagline
		$tagline_text = get_post_meta( $post->ID, 'pd_tagline_text', true );
		echo '<p><strong>Tagline Text</strong></p>';
		echo '<input type="text" name="pd_tagline_text" value="' . esc_attr( $tagline_text ) . '" style="width:100%;" />';

		// 3. Overview Text
		$overview_text = get_post_meta( $post->ID, 'pd_overview_text', true );
		echo '<p><strong>Overview Text</strong></p>';
		echo '<textarea name="pd_overview_text" rows="4" style="width:100%;">' . esc_textarea( $overview_text ) . '</textarea>';

		// 5. Button
		$button_text = get_post_meta( $post->ID, 'pd_button_text', true );
		$button_icon = get_post_meta( $post->ID, 'pd_button_icon', true );
		$button_link = get_post_meta( $post->ID, 'pd_button_link', true );
		echo '<p><strong>Button Text</strong></p><input type="text" name="pd_button_text" value="' . esc_attr( $button_text ) . '" />';
		// echo '<p><strong>Button Icon (e.g., "IconBrandGithub")</strong></p><input type="text" name="pd_button_icon" value="' . esc_attr( $button_icon ) . '" />';
		echo '<p><strong>Button Icon</strong></p>';
		echo '<select name="pd_button_icon" id="pd-button-icon-select" style="width:100%;">';
		echo '<option value="">' . __( '-- Select Icon --', 'pd-textdomain' ) . '</option>';
		
		$icons_list = $this->get_tabler_icons_list();
		foreach ( $icons_list as $icon ) {
			$selected = selected( $button_icon, $icon, false );
			echo '<option value="' . esc_attr( $icon ) . '" ' . $selected . '>' . esc_html( $icon ) . '</option>';
		}
		
		echo '</select>';
		echo '<p class="description">Icon name from Tabler Icons (must be supported in the React code).</p>';
		echo '<p><strong>Button Link</strong></p><input type="url" name="pd_button_link" value="' . esc_attr( $button_link ) . '" style="width:100%;" />';

		// 6. Dependencies Textarea (for animation)
		$dependencies = get_post_meta( $post->ID, 'pd_dependencies', true );
		echo '<p><strong>Dependencies Text (New line for each animated entry)</strong></p>';
		echo '<textarea name="pd_dependencies" rows="6" style="width:100%;">' . esc_textarea( $dependencies ) . '</textarea>';

		// 7. Marquee Features (Select2 with Tagging)
		$current_features = get_post_meta( $post->ID, 'pd_marquee_features', true );
		$current_features = is_array( $current_features ) ? $current_features : array();
		$global_features = get_option( 'pd_global_features', array() ); // Get all available features

		echo '<p><strong>Marquee Features</strong></p>';
		echo '<select name="pd_marquee_features[]" id="pd-marquee-features-select" multiple="multiple" style="width:100%;">';

		// Output ALL global features as options, and check if selected for this project
		$all_features_unique = array_unique( array_merge( $global_features, $current_features ) );

		foreach ( $all_features_unique as $feature ) {
			$selected = in_array( $feature, $current_features ) ? 'selected="selected"' : '';
			echo '<option value="' . esc_attr( $feature ) . '" ' . $selected . '>' . esc_html( $feature ) . '</option>';
		}

		echo '</select>';
		echo '<button type="button" class="button button-secondary" id="pd-add-feature-button" style="margin-top: 5px;">';
		echo '<span class="dashicons dashicons-plus" style="line-height: 150%;"></span> Add New Global Feature';
		echo '</button>';
		echo '<p class="description">Select features from the list above. Use the button to add a new feature globally.</p>';
	}

	/**
	 * Render the Footer HTML Content meta box.
	 */
	public function render_footer_box( $post ) {
		wp_nonce_field( 'pd_save_footer_meta', 'pd_footer_nonce' );

		$footer_html = get_post_meta( $post->ID, 'pd_footer_html', true );
		echo '<p><strong>Footer Content (Supports full HTML/Anchors)</strong></p>';
		wp_editor( $footer_html, 'pd_footer_html_editor', array( 'textarea_name' => 'pd_footer_html', 'textarea_rows' => 10 ) );
	}

	/**
	 * Render the Documentation Sections meta box (The most complex part).
	 */
	public function render_sections_box( $post ) {
		wp_nonce_field( 'pd_save_sections_meta', 'pd_sections_nonce' );
		$sections = get_post_meta( $post->ID, 'pd_doc_sections', true );
		$sections = is_array( $sections ) ? $sections : array();
		?>
		<div id="pd-doc-sections-repeater">
			<ul id="sections-list" class="widefat sortable">
				<?php
				// Output existing sections
				if ( ! empty( $sections ) ) {
					foreach ( $sections as $key => $section ) {
						$this->render_single_section_item( $key, $section );
					}
				}
				?>
			</ul>
			<button type="button" class="button button-primary" id="add-section-button">
				<?php _e( 'Add New Section', 'pd-textdomain' ); ?>
			</button>
			<p class="description">Click "Add New Section" to create a Documentation Section. Titles will be used for navigation. Content should be in MDX format.</p>
		</div>

		<?php
		// Hidden template for new sections (cloned by JavaScript)
		$this->render_single_section_item( 'PD_REPEATER_INDEX', array(
			'type'      => 'normal',
			'title'     => '',
			'content'   => '',
			'placement' => 'bottom',
		), true );

	}

	/**
	 * Render the Link to Parent Post meta box (in the sidebar).
	 */
	public function render_link_post_box( $post ) {
		wp_nonce_field( 'pd_save_link_meta', 'pd_link_nonce' );

		$linked_post_id = get_post_meta( $post->ID, 'pd_linked_post_id', true );
		$linked_post = $linked_post_id ? get_post( $linked_post_id ) : null;
		$current_post_type = $linked_post ? get_post_type_object( $linked_post->post_type ) : null;

		echo '<p><label for="pd_linked_post_id"><strong>' . __( 'Select Post to Attach To', 'pd-textdomain' ) . '</strong></label></p>';
		echo '<select id="pd_linked_post_id" name="pd_linked_post_id" style="width:100%;">';
		
		// Default empty option
		echo '<option value="">' . __( '— None —', 'pd-textdomain' ) . '</option>';

		// If a post is already linked, display it as the selected option
		if ( $linked_post ) {
			$post_type_label = $current_post_type ? '(' . $current_post_type->labels->singular_name . ')' : '';
			echo '<option value="' . esc_attr( $linked_post_id ) . '" selected="selected">' . 
				esc_html( $linked_post->post_title ) . ' ' . esc_html( $post_type_label ) . 
				'</option>';
		}
		
		echo '</select>';
		echo '<p class="description">' . __( 'Attach this documentation to a specific public post/CPT. The shortcode will check this link.', 'pd-textdomain' ) . '</p>';
	}

	/**
	 * AJAX handler to add a new feature to the global list.
	 */
	public function ajax_add_global_feature() {
		// Security check
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( 'Permission denied.' );
		}
		if ( ! isset( $_POST['pd_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pd_nonce'] ) ), 'pd_add_feature_nonce' ) ) {
			wp_send_json_error( 'Security check failed.' );
		}

		$feature = isset( $_POST['feature'] ) ? sanitize_text_field( wp_unslash( $_POST['feature'] ) ) : '';
		if ( empty( $feature ) ) {
			wp_send_json_error( 'Feature text cannot be empty.' );
		}

		$global_features = get_option( 'pd_global_features', array() );

		if ( in_array( $feature, $global_features ) ) {
			wp_send_json_error( 'Feature already exists.' );
		}

		$global_features[] = $feature;
		update_option( 'pd_global_features', array_unique( $global_features ) );

		wp_send_json_success( 'Feature added.' );
	}


	/**
	 * AJAX handler for Select2 to search for all public posts/CPTs (excluding project-doc).
	 */
	public function ajax_search_parent_posts() {
		// Security check
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json( array() );
		}
		if ( ! isset( $_GET['pd_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['pd_nonce'] ) ), 'pd_search_posts_nonce' ) ) {
			wp_send_json( array() );
		}

		$search_term = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$posts_to_exclude = array( 'project-doc', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset' ); // Exclude documentation CPT

		$args = array(
			's'                   => $search_term,
			'post_type'           => get_post_types( array( 'public' => true ) ),
			'post_status'         => 'publish',
			'posts_per_page'      => 50,
			'exclude'             => array( get_the_ID() ), // Exclude the current documentation post
			'post_type__not_in'   => $posts_to_exclude,
			'suppress_filters'    => true
		);

		$posts = get_posts( $args );
		$results = array();

		if ( $posts ) {
			foreach ( $posts as $post ) {
				$post_type_obj = get_post_type_object( $post->post_type );
				$results[] = array(
					'id'   => $post->ID,
					'text' => $post->post_title . ' (' . $post_type_obj->labels->singular_name . ')',
				);
			}
		}

		wp_send_json( $results );
	}

	/**
	 * Renders a single section item for the repeater.
	 */
	private function render_single_section_item( $index, $section_data, $is_template = false ) {
		$display = $is_template ? 'none' : 'block';
		$class = $is_template ? 'pd-section-template' : 'pd-section-item postbox';
		$style = "display:{$display}; margin-top: 10px; padding: 0;";
		$is_normal = ( 'normal' === $section_data['type'] );
		$toggle_class = $is_template ? 'closed' : '';
		?>
		<li class="<?php echo esc_attr( $class ); ?>" data-index="<?php echo esc_attr( $index ); ?>" style="<?php echo esc_attr( $style ); ?>">
			<div class="inside" style="padding: 10px;">
				<div class="hndle" style="cursor: pointer; padding: 10px; border-bottom: 1px solid #eee;">
					<span>
						<?php echo esc_html( $section_data['title'] ? $section_data['title'] : '(Untitled Section)' ); ?>
						<span style="font-style: italic; color: #888;"> (Type: <?php echo esc_html( $section_data['type'] ); ?>)</span>
					</span>
					<div class="handle-actions">
						<button type="button" class="button button-secondary pd-delete-section" title="Delete">
							<span class="dashicons dashicons-trash"></span>
						</button>
						<button type="button" class="button button-secondary toggle-indicator" title="Toggle">
							<span class="dashicons dashicons-arrow-up"></span>
						</button>
					</div>
				</div>
				<div class="pd-section-fields" style="padding: 10px; display: <?php echo $is_template ? 'block' : 'none'; ?>">
				<!-- <div class="pd-section-fields" style="padding: 10px; display: <?php echo $is_template ? 'block' : 'block'; ?>"> -->
					<p>
						<label>Section Title:</label>
						<input type="text" name="pd_doc_sections[<?php echo esc_attr( $index ); ?>][title]" value="<?php echo esc_attr( $section_data['title'] ); ?>" class="pd-section-title-input" style="width:100%;" />
					</p>

					<p>
						<label>Section Type:</label>
						<select name="pd_doc_sections[<?php echo esc_attr( $index ); ?>][type]" class="pd-section-type-select">
							<option value="normal" <?php selected( $section_data['type'], 'normal' ); ?>>Normal (MDX Content)</option>
							<option value="separator" <?php selected( $section_data['type'], 'separator' ); ?>>Separator (Navigation Divider)</option>
						</select>
					</p>
					
					<p>
						<label>Navigation Placement:</label>
						<select name="pd_doc_sections[<?php echo esc_attr( $index ); ?>][placement]">
							<option value="bottom" <?php selected( $section_data['placement'], 'bottom' ); ?>>After Existing Sections</option>
							<option value="top" <?php selected( $section_data['placement'], 'top' ); ?>>Before Existing Sections</option>
						</select>
					</p>

					<div class="pd-mdx-content-area" style="display: <?php echo $is_normal ? 'block' : 'none'; ?>;">
						<p><label>MDX Content:</label></p>
						<textarea name="pd_doc_sections[<?php echo esc_attr( $index ); ?>][content]" rows="10" style="width:100%; font-family: monospace;" placeholder="MDX Markdown content here..."><?php echo esc_textarea( $section_data['content'] ); ?></textarea>
					</div>
				</div>
			</div>
		</li>
		<?php
	}

	/**
	 * Enqueue admin scripts for dynamic field functionality.
	 */
	public function admin_scripts( $hook ) {
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}
		global $post;
		if ( 'project-doc' !== $post->post_type ) {
			return;
		}

		$plugin_url = plugin_dir_url( dirname( __FILE__ ) );
		wp_enqueue_style( 'select2', $plugin_url . 'assets/css/select2.min.css', array(), '4.0.13' );
		wp_enqueue_script( 'select2', $plugin_url . 'assets/js/select2.min.js', array( 'jquery' ), '4.0.13', true );
		
		wp_enqueue_script( 'jquery-ui-sortable' );
		
		wp_enqueue_media();

		$js = '
			jQuery(document).ready(function($) {
				var repeaterList = $("#sections-list");
				var newIndex = repeaterList.children().length;

				// --- SELECT2 MARQUEE FEATURES LOGIC (UPDATED FOR EXPLICIT TAGGING) ---
				$("#pd-marquee-features-select").select2({
					placeholder: "Select existing features...",
					allowClear: true,
					width: "100%",
				});

				$("#pd_linked_post_id").select2({
					placeholder: "Search for a Post or Page...",
					allowClear: true,
					ajax: {
						url: ajaxurl,
						dataType: \'json\',
						delay: 250,
						data: function (params) {
							return {
								q: params.term,
								action: \'pd_search_parent_posts\', 
								pd_nonce: "' . wp_create_nonce( 'pd_search_posts_nonce' ) . '"
							};
						},
						processResults: function(data) {
							return {
								results: data
							};
						},
						cache: true
					},
					minimumInputLength: 1 
				});

				$("#pd-button-icon-select").select2({
				    placeholder: "Select an Icon...",
				    allowClear: true,
				    width: "100%",
				});


				// Function to add a new feature (used by the new button)
				function addNewGlobalFeature(featureText) {
					if (!featureText) return;

					$.ajax({
						url: ajaxurl, // Standard WP AJAX URL
						type: "POST",
						data: {
							action: "pd_add_global_feature",
							feature: featureText,
							pd_nonce: "' . wp_create_nonce( 'pd_add_feature_nonce' ) . '", // Security nonce
						},
						success: function(response) {
							if (response.success) {
								var newOption = new Option(featureText, featureText, true, true);
								$("#pd-marquee-features-select").append(newOption).trigger("change");
								
								$("#new-feature-input").val("");
								alert("Feature \'" + featureText + "\' added globally and selected for this project.");

							} else {
								alert("Error adding feature: " + response.data);
							}
						},
						error: function() {
							alert("An unknown error occurred while adding the feature.");
						}
					});
				}

				// Handle "Add New Feature" button click
				$("#pd-add-feature-button").on("click", function(e) {
					e.preventDefault();
					var featureText = prompt("Enter the name of the new feature:");
					if (featureText) {
						addNewGlobalFeature(featureText.trim());
					}
				});
				
				
				// Make sections sortable


				repeaterList.sortable({


					handle: ".hndle",


					items: ".pd-section-item"


				});




				// Add New Section


				$("#add-section-button").on("click", function() {


					var template = $(".pd-section-template");


					var newSection = template.clone(true);


					


					newSection.removeClass("pd-section-template").addClass("pd-section-item").attr("style", "margin-top: 10px; padding: 0;");


					


					// Replace placeholder index with a unique one


					var html = newSection.html().replace(/PD_REPEATER_INDEX/g, newIndex);


					newSection.html(html);


					newSection.attr("data-index", newIndex);





					// Set initial state


					newSection.find(".pd-section-fields").show();


					newSection.find(".hndle span:first").text("New Untitled Section (Type: normal)");





					// Append and increment index


					repeaterList.append(newSection);


					newIndex++;

				});


				// Delete Section


				repeaterList.on("click", ".pd-delete-section", function(e) {


					e.preventDefault();


					if (confirm("Are you sure you want to delete this section?")) {


						$(this).closest(".pd-section-item").remove();


					}


				});


				// Toggle Section (Accordion functionality)


				repeaterList.on("click", ".hndle", function(e) {


					// Ignore clicks on buttons


					if ($(e.target).hasClass("button-secondary") || $(e.target).hasClass("dashicons")) {


						return;


					}


					var item = $(this).closest(".pd-section-item");


					item.find(".pd-section-fields").slideToggle(200);


				});





				// Update title in header


				repeaterList.on("change keyup", ".pd-section-title-input", function() {


					var title = $(this).val();


					var type = $(this).closest(".pd-section-item").find(".pd-section-type-select").val();


					$(this).closest(".pd-section-item").find(".hndle span:first").html(title + \' <span style="font-style: italic; color: #888;"> (Type: \' + type + \')</span>\');


				});





				// Toggle MDX content area based on type


				repeaterList.on("change", ".pd-section-type-select", function() {


					var item = $(this).closest(".pd-section-item");


					var type = $(this).val();


					item.find(".pd-mdx-content-area").toggle(type === "normal");


					// Update title display


					var title = item.find(".pd-section-title-input").val();


					item.find(".hndle span:first").html(title + \' <span style="font-style: italic; color: #888;"> (Type: \' + type + \')</span>\');

				});
			});
		';
		wp_add_inline_script( 'select2', $js, 'after' );
		
		$css = '
			.pd-section-item .hndle { display: flex; justify-content: space-between; align-items: center; }
			.pd-section-item .handle-actions { display: flex; gap: 5px; }
			.pd-section-template { display: none !important; }
		';
		wp_add_inline_style( 'wp-admin', $css );
	}

	/**
	 * Save all custom meta box data.
	 */
	public function save_meta_boxes( $post_id ) {
		// Nonce check for welcome box
		if ( ! isset( $_POST['pd_welcome_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pd_welcome_nonce'] ) ), 'pd_save_welcome_meta' ) ) {
			return $post_id;
		}

		// Nonce check for sections box
		if ( ! isset( $_POST['pd_sections_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pd_sections_nonce'] ) ), 'pd_save_sections_meta' ) ) {
			return $post_id;
		}

		if ( ! isset( $_POST['pd_link_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pd_link_nonce'] ) ), 'pd_save_link_meta' ) ) {
			return $post_id;
		}
		
		// Check for user capability and autosave
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $post_id;
		}

		$fields_to_save = array( 'pd_project_title', 'pd_tagline_text', 'pd_overview_text', 'pd_logo_url', 'pd_button_text', 'pd_button_icon', 'pd_button_link', 'pd_dependencies' );
		foreach ( $fields_to_save as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
			}
		}

		// Marquee Features (Selct2)
		if ( isset( $_POST['pd_marquee_features'] ) && is_array( $_POST['pd_marquee_features'] ) ) {
			$features_array = array_map( 'sanitize_text_field', wp_unslash( $_POST['pd_marquee_features'] ) );
			$features_array = array_filter( $features_array );
			
			update_post_meta( $post_id, 'pd_marquee_features', $features_array );

		} else {
			delete_post_meta( $post_id, 'pd_marquee_features' );
		}


		if ( isset( $_POST['pd_linked_post_id'] ) ) {
			update_post_meta( $post_id, 'pd_linked_post_id', absint( wp_unslash( $_POST['pd_linked_post_id'] ) ) );
		} else {
			delete_post_meta( $post_id, 'pd_linked_post_id' );
		}

		// --- SAVE FOOTER FIELD ---
		if ( isset( $_POST['pd_footer_html'] ) ) {
			// Using wp_kses_post to allow standard HTML/anchors
			update_post_meta( $post_id, 'pd_footer_html', wp_kses_post( wp_unslash( $_POST['pd_footer_html'] ) ) );
		}

		// --- SAVE DOCUMENTATION SECTIONS (The Repeater) ---
		if ( isset( $_POST['pd_doc_sections'] ) && is_array( $_POST['pd_doc_sections'] ) ) {
			$new_sections = array();
			$sections = wp_unslash( $_POST['pd_doc_sections'] );

			foreach ( $sections as $section ) {
				$new_sections[] = array(
					'type'      => sanitize_text_field( $section['type'] ),
					'title'     => sanitize_text_field( $section['title'] ),
					// Preserve MDX content with basic kses filter (allows some tags, but not script)
					'content'   => ( 'normal' === $section['type'] ) ? wp_kses_post( $section['content'] ) : '',
					'placement' => sanitize_text_field( $section['placement'] ),
				);
			}

			// Save the final, cleaned array
			update_post_meta( $post_id, 'pd_doc_sections', $new_sections );
		} else {
			// If no sections are submitted (e.g., all deleted)
			delete_post_meta( $post_id, 'pd_doc_sections' );
		}

		return $post_id;
	}
}
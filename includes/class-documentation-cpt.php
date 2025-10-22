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
			'query_var'           => true,
			'rewrite'             => array( 'slug' => 'project-doc' ),
			'capability_type'     => 'post',
			'has_archive'         => false,
			'hierarchical'        => false,
			'menu_position'       => 20,
			'supports'            => array( 'title' ), // Only title is needed for the project name
			'show_in_rest'        => true, // Essential for REST API access
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
	}

	/**
	 * Render the Welcome Page Settings meta box.
	 */
	public function render_welcome_box( $post ) {
		wp_nonce_field( 'pd_save_welcome_meta', 'pd_welcome_nonce' );

		// 1. Title
		$project_title = get_post_meta( $post->ID, 'pd_project_title', true );
		echo '<p><strong>Project Title (Replaces "Mantine Next.js +")</strong></p>';
		echo '<input type="text" name="pd_project_title" value="' . esc_attr( $project_title ) . '" style="width:100%;" />';

		// 2. Tagline
		$tagline_text = get_post_meta( $post->ID, 'pd_tagline_text', true );
		echo '<p><strong>Tagline Text (Replaces "Nextra template")</strong></p>';
		echo '<input type="text" name="pd_tagline_text" value="' . esc_attr( $tagline_text ) . '" style="width:100%;" />';

		// 3. Overview Text
		$overview_text = get_post_meta( $post->ID, 'pd_overview_text', true );
		echo '<p><strong>Overview Text</strong></p>';
		echo '<textarea name="pd_overview_text" rows="4" style="width:100%;">' . esc_textarea( $overview_text ) . '</textarea>';

		// 4. Logo (Simple URL/Attachment ID for now, advanced image upload later)
		$logo_url = get_post_meta( $post->ID, 'pd_logo_url', true );
		echo '<p><strong>Logo URL/Attachment ID (Leave blank for default)</strong></p>';
		echo '<input type="text" name="pd_logo_url" value="' . esc_attr( $logo_url ) . '" style="width:100%;" />';

		// 5. Button
		$button_text = get_post_meta( $post->ID, 'pd_button_text', true );
		$button_icon = get_post_meta( $post->ID, 'pd_button_icon', true );
		$button_link = get_post_meta( $post->ID, 'pd_button_link', true );
		echo '<p><strong>Button Text</strong></p><input type="text" name="pd_button_text" value="' . esc_attr( $button_text ) . '" />';
		echo '<p><strong>Button Icon (e.g., "IconBrandGithub")</strong></p><input type="text" name="pd_button_icon" value="' . esc_attr( $button_icon ) . '" />';
		echo '<p><strong>Button Link</strong></p><input type="url" name="pd_button_link" value="' . esc_attr( $button_link ) . '" style="width:100%;" />';

		// 6. Dependencies Textarea (for animation)
		$dependencies = get_post_meta( $post->ID, 'pd_dependencies', true );
		echo '<p><strong>Dependencies Text (New line for each animated entry)</strong></p>';
		echo '<textarea name="pd_dependencies" rows="6" style="width:100%;">' . esc_textarea( $dependencies ) . '</textarea>';

		// 7. Marquee Features (Simple list for now, setting up for Select2 logic)
		$features = get_post_meta( $post->ID, 'pd_marquee_features', true );
		$features = is_array( $features ) ? $features : array();
		echo '<p><strong>Marquee Features (Comma-separated for now)</strong></p>';
		echo '<input type="text" name="pd_marquee_features_simple" value="' . esc_attr( implode( ', ', $features ) ) . '" style="width:100%;" placeholder="Feature 1, Feature 2, Feature 3" />';
		echo '<p class="description">Note: Full Select2 dynamic creation will require custom JS/CSS enqueuing, which is complex for this step.</p>';
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

		// Enqueue the necessary jQuery UI for sorting
		wp_enqueue_script( 'jquery-ui-sortable' );

		// Your custom repeater JS (simplified for the scope of this answer)
		$js = '
			jQuery(document).ready(function($) {
				var repeaterList = $("#sections-list");
				var newIndex = repeaterList.children().length;

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
		wp_add_inline_script( 'jquery-ui-sortable', $js );
		
		// Basic CSS for repeater
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
		
		// Check for user capability and autosave
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $post_id;
		}

		// --- SAVE WELCOME FIELDS ---
		$fields_to_save = array( 'pd_project_title', 'pd_tagline_text', 'pd_overview_text', 'pd_logo_url', 'pd_button_text', 'pd_button_icon', 'pd_button_link', 'pd_dependencies' );
		foreach ( $fields_to_save as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
			}
		}

		// Marquee Features (Simple comma-separated for now)
		if ( isset( $_POST['pd_marquee_features_simple'] ) ) {
			$features_string = sanitize_text_field( wp_unslash( $_POST['pd_marquee_features_simple'] ) );
			$features_array = array_map( 'trim', explode( ',', $features_string ) );
			$features_array = array_filter( $features_array ); // Remove empty
			update_post_meta( $post_id, 'pd_marquee_features', $features_array );
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
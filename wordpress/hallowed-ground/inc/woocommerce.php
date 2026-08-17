<?php
/**
 * WooCommerce: tours as products.
 *
 * @package HallowedGround
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'woocommerce_product_settings',
	function ( $settings ) {
		return $settings;
	}
);

add_filter(
	'woocommerce_show_page_title',
	function () {
		return true;
	}
);

add_filter(
	'woocommerce_page_title',
	function ( $title ) {
		if ( is_shop() ) {
			return __( 'Gettysburg battlefield tours', 'hallowed-ground' );
		}
		return $title;
	}
);

add_action(
	'woocommerce_before_shop_loop',
	function () {
		echo '<p>' . esc_html__( 'Licensed-guide walking, bus, hike, lantern, and private tours. Adult, child (6–12), and senior (65+) rates are selected on each tour.', 'hallowed-ground' ) . '</p>';
	},
	15
);

add_action(
	'woocommerce_product_options_general_product_data',
	function () {
		echo '<div class="options_group">';
		woocommerce_wp_text_input(
			array(
				'id'          => '_hg_duration',
				'label'       => __( 'Duration', 'hallowed-ground' ),
				'placeholder' => '2 hours',
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'          => '_hg_group_size',
				'label'       => __( 'Max group size', 'hallowed-ground' ),
				'type'        => 'number',
			)
		);
		woocommerce_wp_select(
			array(
				'id'      => '_hg_difficulty',
				'label'   => __( 'Difficulty', 'hallowed-ground' ),
				'options' => array(
					'easy'       => __( 'Easy', 'hallowed-ground' ),
					'moderate'   => __( 'Moderate', 'hallowed-ground' ),
					'strenuous'  => __( 'Strenuous', 'hallowed-ground' ),
				),
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'          => '_hg_meeting',
				'label'       => __( 'Meeting point', 'hallowed-ground' ),
				'placeholder' => '271 Baltimore Street',
			)
		);
		echo '</div>';
	}
);

add_action(
	'woocommerce_process_product_meta',
	function ( $post_id ) {
		$fields = array( '_hg_duration', '_hg_group_size', '_hg_difficulty', '_hg_meeting' );
		foreach ( $fields as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
			}
		}
	}
);

add_action(
	'woocommerce_single_product_summary',
	function () {
		global $product;
		if ( ! $product ) {
			return;
		}
		$id         = $product->get_id();
		$duration   = get_post_meta( $id, '_hg_duration', true );
		$group      = get_post_meta( $id, '_hg_group_size', true );
		$difficulty = get_post_meta( $id, '_hg_difficulty', true );
		$meeting    = get_post_meta( $id, '_hg_meeting', true );
		echo '<ul class="tour-meta" style="list-style:none;display:flex;flex-wrap:wrap;gap:0.4rem;margin:1rem 0;">';
		if ( $duration ) {
			echo '<li class="chip">' . esc_html( $duration ) . '</li>';
		}
		if ( $group ) {
			echo '<li class="chip">' . esc_html( sprintf( __( 'Up to %s guests', 'hallowed-ground' ), $group ) ) . '</li>';
		}
		if ( $difficulty ) {
			echo '<li class="chip">' . esc_html( ucfirst( $difficulty ) ) . '</li>';
		}
		if ( $meeting ) {
			echo '<li class="chip">' . esc_html( $meeting ) . '</li>';
		}
		echo '</ul>';
	},
	6
);

add_filter(
	'woocommerce_add_to_cart_redirect',
	function ( $url ) {
		if ( isset( $_REQUEST['add-to-cart'] ) ) {
			return wc_get_checkout_url();
		}
		return $url;
	}
);

add_filter( 'loop_shop_per_page', function () { return 12; } );

add_action(
	'init',
	function () {
		add_rewrite_endpoint( 'tour-date', EP_PERMALINK | EP_PAGES );
	}
);

add_action(
	'woocommerce_before_add_to_cart_button',
	function () {
		echo '<p class="group-note">' . esc_html__( 'Choose Adult, Child, or Senior, then a quantity. Pair with WooCommerce Bookings or a date plugin for live departures; this theme stores tickets as variable products.', 'hallowed-ground' ) . '</p>';
		woocommerce_form_field(
			'hg_preferred_date',
			array(
				'type'        => 'date',
				'label'       => __( 'Preferred date (guest note)', 'hallowed-ground' ),
				'required'    => false,
				'class'       => array( 'form-row-wide' ),
			)
		);
	}
);

add_filter(
	'woocommerce_add_cart_item_data',
	function ( $cart_item_data, $product_id ) {
		if ( ! empty( $_POST['hg_preferred_date'] ) ) {
			$cart_item_data['hg_preferred_date'] = sanitize_text_field( wp_unslash( $_POST['hg_preferred_date'] ) );
		}
		return $cart_item_data;
	},
	10,
	2
);

add_filter(
	'woocommerce_get_item_data',
	function ( $item_data, $cart_item ) {
		if ( ! empty( $cart_item['hg_preferred_date'] ) ) {
			$item_data[] = array(
				'name'  => __( 'Preferred date', 'hallowed-ground' ),
				'value' => $cart_item['hg_preferred_date'],
			);
		}
		return $item_data;
	},
	10,
	2
);

add_action(
	'woocommerce_checkout_create_order_line_item',
	function ( $item, $cart_item_key, $values ) {
		if ( ! empty( $values['hg_preferred_date'] ) ) {
			$item->add_meta_data( __( 'Preferred date', 'hallowed-ground' ), $values['hg_preferred_date'] );
		}
	},
	10,
	3
);

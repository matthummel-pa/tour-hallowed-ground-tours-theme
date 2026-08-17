<?php
/**
 * Seed five Gettysburg tour products on first activation.
 *
 * @package HallowedGround
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_switch_theme',
	function () {
		if ( get_option( 'hallowed_ground_tours_seeded' ) ) {
			return;
		}
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		hallowed_ground_seed_tours();
		update_option( 'hallowed_ground_tours_seeded', 1 );
	}
);

add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) || ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		if ( get_option( 'hallowed_ground_tours_seeded' ) ) {
			return;
		}
		$url = wp_nonce_url( admin_url( 'edit.php?post_type=product&hg_seed_tours=1' ), 'hg_seed_tours' );
		echo '<div class="notice notice-info"><p>';
		echo esc_html__( 'Hallowed Ground can create the five Gettysburg tour products and a gift certificate.', 'hallowed-ground' );
		echo ' <a href="' . esc_url( $url ) . '">' . esc_html__( 'Seed demo tours', 'hallowed-ground' ) . '</a>';
		echo '</p></div>';
	}
);

add_action(
	'admin_init',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		if ( isset( $_GET['hg_seed_tours'] ) && check_admin_referer( 'hg_seed_tours' ) ) {
			hallowed_ground_seed_tours();
			update_option( 'hallowed_ground_tours_seeded', 1 );
			wp_safe_redirect( admin_url( 'edit.php?post_type=product&hg_seeded=1' ) );
			exit;
		}
	}
);

/**
 * Create variable tour products if they do not already exist.
 */
function hallowed_ground_seed_tours() {
	if ( ! function_exists( 'wc_get_product_id_by_sku' ) ) {
		return;
	}

	$attr_name = 'Ticket type';
	$tours     = array(
		array(
			'sku'         => 'hg-highlights',
			'title'       => 'Battlefield Highlights Walking Tour',
			'content'     => 'A guided walk across Cemetery Ridge and McPherson Ridge covering the turning points of all three days of the battle.',
			'duration'    => '2 hours',
			'group'       => 15,
			'difficulty'  => 'moderate',
			'meeting'     => '271 Baltimore Street, Gettysburg, PA',
			'prices'      => array( 'Adult' => 38, 'Child' => 19, 'Senior' => 34 ),
		),
		array(
			'sku'         => 'hg-bus',
			'title'       => "Pickett's Charge Deluxe Bus Tour",
			'content'     => 'A narrated motorcoach loop of the full Gettysburg battlefield with two guided stops, including the High Water Mark. ADA-accessible.',
			'duration'    => '3.5 hours',
			'group'       => 24,
			'difficulty'  => 'easy',
			'meeting'     => '271 Baltimore Street, Gettysburg, PA',
			'prices'      => array( 'Adult' => 65, 'Child' => 32, 'Senior' => 58 ),
		),
		array(
			'sku'         => 'hg-hike',
			'title'       => "Little Round Top & Devil's Den Hike",
			'content'     => "A rugged hike to the most fought-over high ground of Day Two, with time to explore the boulders of Devil's Den.",
			'duration'    => '2.5 hours',
			'group'       => 12,
			'difficulty'  => 'strenuous',
			'meeting'     => '271 Baltimore Street, Gettysburg, PA',
			'prices'      => array( 'Adult' => 44, 'Child' => 24, 'Senior' => 40 ),
		),
		array(
			'sku'         => 'hg-lantern',
			'title'       => 'Ghosts of Gettysburg Lantern Walk',
			'content'     => 'An after-dark walking tour through downtown Gettysburg pairing real wartime accounts with candlelit storytelling.',
			'duration'    => '90 minutes',
			'group'       => 20,
			'difficulty'  => 'easy',
			'meeting'     => 'Lincoln Square flagpole, Gettysburg, PA',
			'prices'      => array( 'Adult' => 28, 'Child' => 16, 'Senior' => 26 ),
		),
		array(
			'sku'         => 'hg-private',
			'title'       => 'Sunrise Private Battlefield Experience',
			'content'     => 'A private, small-group dawn tour with a senior guide, customized to your interests — for up to six guests.',
			'duration'    => '3 hours',
			'group'       => 6,
			'difficulty'  => 'moderate',
			'meeting'     => '271 Baltimore Street, Gettysburg, PA',
			'prices'      => array( 'Adult' => 89, 'Child' => 55, 'Senior' => 82 ),
		),
		array(
			'sku'         => 'hg-gift-50',
			'title'       => '$50 Tour Gift Certificate',
			'content'     => 'A store credit toward any Hallowed Ground public tour. Demo product.',
			'duration'    => '',
			'group'       => '',
			'difficulty'  => 'easy',
			'meeting'     => '',
			'simple'      => 50,
		),
	);

	foreach ( $tours as $tour ) {
		$existing = wc_get_product_id_by_sku( $tour['sku'] );
		if ( $existing ) {
			continue;
		}

		if ( ! empty( $tour['simple'] ) ) {
			$product = new WC_Product_Simple();
			$product->set_name( $tour['title'] );
			$product->set_sku( $tour['sku'] );
			$product->set_regular_price( (string) $tour['simple'] );
			$product->set_description( $tour['content'] );
			$product->set_short_description( $tour['content'] );
			$product->set_catalog_visibility( 'visible' );
			$product->set_status( 'publish' );
			$product->set_virtual( true );
			$product->set_sold_individually( false );
			$pid = $product->save();
			update_post_meta( $pid, '_hg_duration', $tour['duration'] );
			continue;
		}

		$product = new WC_Product_Variable();
		$product->set_name( $tour['title'] );
		$product->set_sku( $tour['sku'] );
		$product->set_description( $tour['content'] );
		$product->set_short_description( $tour['content'] );
		$product->set_catalog_visibility( 'visible' );
		$product->set_status( 'publish' );
		$product->set_virtual( true );
		$pid = $product->save();

		$attribute = new WC_Product_Attribute();
		$attribute->set_name( $attr_name );
		$attribute->set_options( array_keys( $tour['prices'] ) );
		$attribute->set_visible( true );
		$attribute->set_variation( true );
		$product->set_attributes( array( $attribute ) );
		$product->save();

		foreach ( $tour['prices'] as $label => $price ) {
			$variation = new WC_Product_Variation();
			$variation->set_parent_id( $pid );
			$variation->set_regular_price( (string) $price );
			$variation->set_virtual( true );
			$variation->set_attributes( array( sanitize_title( $attr_name ) => $label ) );
			$variation->save();
		}

		update_post_meta( $pid, '_hg_duration', $tour['duration'] );
		update_post_meta( $pid, '_hg_group_size', (string) $tour['group'] );
		update_post_meta( $pid, '_hg_difficulty', $tour['difficulty'] );
		update_post_meta( $pid, '_hg_meeting', $tour['meeting'] );
	}

	$shop_id = wc_get_page_id( 'shop' );
	if ( $shop_id ) {
		wp_update_post(
			array(
				'ID'         => $shop_id,
				'post_title' => __( 'Tours', 'hallowed-ground' ),
			)
		);
	}
}

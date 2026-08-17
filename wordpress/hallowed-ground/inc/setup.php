<?php
/**
 * Theme setup, menus, assets.
 *
 * @package HallowedGround
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_setup_theme',
	function () {
		load_theme_textdomain( 'hallowed-ground', HALLOWED_GROUND_DIR . '/languages' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'align-wide' );
		add_theme_support( 'custom-logo', array( 'height' => 68, 'width' => 68, 'flex-width' => true, 'flex-height' => true ) );
		add_theme_support(
			'woocommerce',
			array(
				'thumbnail_image_width' => 640,
				'single_image_width'    => 1200,
				'product_grid'          => array(
					'default_rows'    => 3,
					'min_rows'        => 1,
					'max_rows'        => 8,
					'default_columns' => 3,
					'min_columns'     => 1,
					'max_columns'     => 4,
				),
			)
		);
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );

		register_nav_menus(
			array(
				'primary' => __( 'Primary', 'hallowed-ground' ),
				'footer'  => __( 'Footer', 'hallowed-ground' ),
			)
		);
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style(
			'hallowed-ground-fonts',
			'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;700&display=swap',
			array(),
			null
		);
		wp_enqueue_style( 'hallowed-ground', HALLOWED_GROUND_URI . '/assets/css/theme.css', array( 'hallowed-ground-fonts' ), HALLOWED_GROUND_VERSION );
		wp_enqueue_script( 'hallowed-ground', HALLOWED_GROUND_URI . '/assets/js/theme.js', array(), HALLOWED_GROUND_VERSION, true );
	}
);

add_filter(
	'wp_resource_hints',
	function ( $urls, $relation ) {
		if ( 'preconnect' === $relation ) {
			$urls[] = array(
				'href'        => 'https://fonts.gstatic.com',
				'crossorigin' => 'anonymous',
			);
		}
		return $urls;
	},
	10,
	2
);

add_action(
	'wp_head',
	function () {
		echo '<meta name="theme-color" content="#0f1c29">' . "\n";
		echo '<meta name="geo.region" content="US-PA">' . "\n";
		echo '<meta name="geo.placename" content="Gettysburg, Pennsylvania">' . "\n";
		echo '<meta name="geo.position" content="39.828;-77.231">' . "\n";
		echo '<link rel="icon" href="' . esc_url( HALLOWED_GROUND_URI . '/assets/favicon.svg' ) . '" type="image/svg+xml">' . "\n";
	},
	1
);

function hallowed_ground_phone() {
	return '(717) 555-0271';
}

function hallowed_ground_phone_href() {
	return '+17175550271';
}

function hallowed_ground_address() {
	return '271 Baltimore Street, Gettysburg, PA 17325';
}

function hallowed_ground_fallback_menu() {
	$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/tours/' );
	echo '<ul>';
	echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'hallowed-ground' ) . '</a></li>';
	echo '<li><a href="' . esc_url( $shop ) . '">' . esc_html__( 'Tours', 'hallowed-ground' ) . '</a></li>';
	echo '<li><a href="' . esc_url( home_url( '/guides/' ) ) . '">' . esc_html__( 'Our Guides', 'hallowed-ground' ) . '</a></li>';
	echo '<li><a href="' . esc_url( home_url( '/area/' ) ) . '">' . esc_html__( 'The Area', 'hallowed-ground' ) . '</a></li>';
	echo '<li><a href="' . esc_url( home_url( '/contact/' ) ) . '">' . esc_html__( 'Contact', 'hallowed-ground' ) . '</a></li>';
	echo '</ul>';
}

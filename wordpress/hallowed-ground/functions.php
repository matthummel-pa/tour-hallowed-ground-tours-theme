<?php
/**
 * Hallowed Ground theme bootstrap.
 *
 * @package HallowedGround
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'HALLOWED_GROUND_VERSION', '1.0.0' );
define( 'HALLOWED_GROUND_DIR', get_template_directory() );
define( 'HALLOWED_GROUND_URI', get_template_directory_uri() );

require_once HALLOWED_GROUND_DIR . '/inc/setup.php';
require_once HALLOWED_GROUND_DIR . '/inc/schema.php';
require_once HALLOWED_GROUND_DIR . '/inc/woocommerce.php';
require_once HALLOWED_GROUND_DIR . '/inc/demo-tours.php';

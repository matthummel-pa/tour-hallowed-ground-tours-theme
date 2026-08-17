<?php
/**
 * LocalBusiness / TravelAgency JSON-LD.
 *
 * @package HallowedGround
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'wp_head',
	function () {
		$data = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'TravelAgency',
			'@id'             => home_url( '/#business' ),
			'name'            => get_bloginfo( 'name' ),
			'url'             => home_url( '/' ),
			'description'     => get_bloginfo( 'description' ),
			'telephone'       => '+17175550271',
			'email'           => 'tours@hallowedground.test',
			'priceRange'      => '$$',
			'currenciesAccepted' => 'USD',
			'paymentAccepted' => 'Cash, Credit Card',
			'hasMap'          => 'https://www.openstreetmap.org/?mlat=39.828&mlon=-77.231#map=17/39.828/-77.231',
			'address'         => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => '271 Baltimore Street',
				'addressLocality' => 'Gettysburg',
				'addressRegion'   => 'PA',
				'postalCode'      => '17325',
				'addressCountry'  => 'US',
			),
			'geo'             => array(
				'@type'     => 'GeoCoordinates',
				'latitude'  => 39.828,
				'longitude' => -77.231,
			),
			'areaServed'      => array(
				array( '@type' => 'City', 'name' => 'Gettysburg, Pennsylvania' ),
				array( '@type' => 'AdministrativeArea', 'name' => 'Adams County, Pennsylvania' ),
			),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
	},
	20
);

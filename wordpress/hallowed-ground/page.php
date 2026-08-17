<?php
/**
 * Page template.
 *
 * @package HallowedGround
 */

get_header();
while ( have_posts() ) {
	the_post();
	echo '<nav class="breadcrumb" aria-label="Breadcrumb"><div class="wrap"><ol><li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'hallowed-ground' ) . '</a></li><li class="sep" aria-hidden="true">/</li><li aria-current="page">';
	the_title();
	echo '</li></ol></div></nav>';
	echo '<section class="page-intro"><div class="wrap">';
	the_title( '<h1>', '</h1>' );
	echo '</div></section>';
	echo '<section class="section"><div class="wrap prose">';
	the_content();
	echo '</div></section>';
}
get_footer();

<?php
/**
 * Default index.
 *
 * @package HallowedGround
 */

get_header();
if ( have_posts() ) {
	while ( have_posts() ) {
		the_post();
		echo '<section class="section"><div class="wrap prose">';
		the_title( '<h1>', '</h1>' );
		the_content();
		echo '</div></section>';
	}
} else {
	echo '<section class="section"><div class="wrap"><h1>' . esc_html__( 'Nothing found', 'hallowed-ground' ) . '</h1></div></section>';
}
get_footer();

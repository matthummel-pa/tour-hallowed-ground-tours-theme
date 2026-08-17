<?php
/**
 * 404.
 *
 * @package HallowedGround
 */

get_header();
$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>
<section class="page-intro">
  <div class="wrap">
    <h1><?php esc_html_e( 'That page is not on this site', 'hallowed-ground' ); ?></h1>
    <p><?php esc_html_e( 'Try the tour catalog or contact guest services in Gettysburg.', 'hallowed-ground' ); ?></p>
    <p><a class="btn btn-primary" href="<?php echo esc_url( $shop ); ?>"><?php esc_html_e( 'See Gettysburg tours', 'hallowed-ground' ); ?></a></p>
  </div>
</section>
<?php
get_footer();

<?php
/**
 * Front page — Gettysburg tour home.
 *
 * @package HallowedGround
 */

get_header();
$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>
<section class="hero" id="top">
  <div class="hero-media">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Pennsylvania_-_Gettysburg_-_NARA_-_68148252_%28cropped%29.jpg/1280px-Pennsylvania_-_Gettysburg_-_NARA_-_68148252_%28cropped%29.jpg" width="1280" height="853" decoding="async" fetchpriority="high" alt="<?php esc_attr_e( 'Historic cannon and monument on the Gettysburg battlefield at sunrise', 'hallowed-ground' ); ?>">
  </div>
  <div class="wrap hero-content">
    <span class="hero-badge"><?php esc_html_e( 'Licensed Battlefield Guides · Guiding in Gettysburg Since 2011', 'hallowed-ground' ); ?></span>
    <h1 class="hero-title"><?php esc_html_e( 'Walk the ground where', 'hallowed-ground' ); ?> <em><?php esc_html_e( 'history turned.', 'hallowed-ground' ); ?></em></h1>
    <p class="hero-lede"><?php esc_html_e( 'Small-group walking, bus, and evening lantern tours of the Gettysburg battlefield in Gettysburg, PA — led by Licensed Battlefield Guides.', 'hallowed-ground' ); ?></p>
    <div class="hero-ctas">
      <a href="<?php echo esc_url( $shop ); ?>" class="btn btn-primary"><?php esc_html_e( 'Book a Tour', 'hallowed-ground' ); ?></a>
      <a href="<?php echo esc_url( $shop ); ?>" class="btn btn-outline" style="color:#fff;"><?php esc_html_e( 'See All Tours', 'hallowed-ground' ); ?></a>
    </div>
  </div>
</section>
<div class="info-strip">
  <div class="wrap">
    <div class="info-item"><?php echo esc_html( hallowed_ground_address() ); ?></div>
    <div class="info-item"><?php esc_html_e( 'Tours depart daily, rain or shine', 'hallowed-ground' ); ?></div>
    <div class="info-item"><?php echo esc_html( hallowed_ground_phone() ); ?></div>
  </div>
</div>
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow"><?php esc_html_e( 'Choose Your Tour', 'hallowed-ground' ); ?></span>
      <h2><?php esc_html_e( 'Five ways to walk the field.', 'hallowed-ground' ); ?></h2>
    </div>
    <?php
    if ( function_exists( 'woocommerce_product_loop' ) ) {
      echo do_shortcode( '[products limit="5" columns="3" visibility="visible"]' );
    }
    ?>
  </div>
</section>
<?php
while ( have_posts() ) {
	the_post();
	the_content();
}
get_footer();

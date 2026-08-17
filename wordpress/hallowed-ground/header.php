<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a href="#main" class="skip-link"><?php esc_html_e( 'Skip to main content', 'hallowed-ground' ); ?></a>
<header class="site-header">
  <div class="wrap header-inner">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand">
      <?php if ( has_custom_logo() ) { the_custom_logo(); } else { ?>
      <svg class="brand-mark" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M2 26L10 12L15 19L20 9L32 26H2Z" fill="currentColor" opacity="0.9"/><circle cx="26" cy="7" r="3" fill="currentColor"/></svg>
      <span class="brand-text">
        <span class="brand-name">Hallowed Ground</span>
        <span class="brand-sub">Battlefield Tours</span>
      </span>
      <?php } ?>
    </a>
    <nav class="main-nav" aria-label="<?php esc_attr_e( 'Primary', 'hallowed-ground' ); ?>">
      <?php
      wp_nav_menu(
        array(
          'theme_location' => 'primary',
          'container'      => false,
          'fallback_cb'    => 'hallowed_ground_fallback_menu',
        )
      );
      ?>
    </nav>
    <div class="header-actions">
      <a href="tel:<?php echo esc_attr( hallowed_ground_phone_href() ); ?>" class="btn btn-ghost btn-sm" style="color:#fff;"><?php echo esc_html( hallowed_ground_phone() ); ?></a>
      <?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?>
      <a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-primary btn-sm"><?php esc_html_e( 'Book a Tour', 'hallowed-ground' ); ?>
        <?php
        if ( function_exists( 'WC' ) && WC()->cart ) {
          $count = WC()->cart->get_cart_contents_count();
          if ( $count ) {
            echo '<span class="cart-count">' . esc_html( (string) $count ) . '</span>';
          }
        }
        ?>
      </a>
      <?php endif; ?>
      <button type="button" class="hamburger" id="hamburgerBtn" aria-expanded="false" aria-controls="mobileNav" aria-label="<?php esc_attr_e( 'Open menu', 'hallowed-ground' ); ?>">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<nav class="mobile-nav" id="mobileNav" aria-label="<?php esc_attr_e( 'Mobile', 'hallowed-ground' ); ?>" aria-hidden="true">
  <?php
  wp_nav_menu(
    array(
      'theme_location' => 'primary',
      'container'      => false,
      'fallback_cb'    => 'hallowed_ground_fallback_menu',
    )
  );
  ?>
  <a href="tel:<?php echo esc_attr( hallowed_ground_phone_href() ); ?>" class="btn btn-outline btn-block" style="color:#fff;"><?php echo esc_html( sprintf( __( 'Call %s', 'hallowed-ground' ), hallowed_ground_phone() ) ); ?></a>
</nav>
<main id="main">

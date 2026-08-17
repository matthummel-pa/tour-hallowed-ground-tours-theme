</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand" style="color:#fff;">
          <span class="brand-text"><span class="brand-name">Hallowed Ground</span><span class="brand-sub">Battlefield Tours</span></span>
        </a>
        <p><?php esc_html_e( 'Licensed-guide battlefield tours in Gettysburg, PA. Walking, bus, and evening lantern experiences for individuals, families, and groups.', 'hallowed-ground' ); ?></p>
      </div>
      <div>
        <h4><?php esc_html_e( 'Explore', 'hallowed-ground' ); ?></h4>
        <?php
        wp_nav_menu(
          array(
            'theme_location' => 'footer',
            'container'      => false,
            'fallback_cb'    => 'hallowed_ground_fallback_menu',
          )
        );
        ?>
      </div>
      <div>
        <h4><?php esc_html_e( 'Hours', 'hallowed-ground' ); ?></h4>
        <ul class="footer-hours">
          <li><b style="color:#fff;"><?php esc_html_e( 'Apr–Nov', 'hallowed-ground' ); ?></b></li>
          <li><?php esc_html_e( 'Mon–Sun, 8:00 AM–6:00 PM', 'hallowed-ground' ); ?></li>
          <li style="margin-top:0.5rem;"><b style="color:#fff;"><?php esc_html_e( 'Dec–Mar', 'hallowed-ground' ); ?></b></li>
          <li><?php esc_html_e( 'Thu–Sun, 9:00 AM–4:00 PM', 'hallowed-ground' ); ?></li>
          <li class="hours-live" data-hours-live></li>
        </ul>
      </div>
      <div>
        <h4><?php esc_html_e( 'Contact', 'hallowed-ground' ); ?></h4>
        <ul>
          <li>Hallowed Ground Battlefield Tours</li>
          <li><?php echo esc_html( hallowed_ground_address() ); ?></li>
          <li><a href="tel:<?php echo esc_attr( hallowed_ground_phone_href() ); ?>"><?php echo esc_html( hallowed_ground_phone() ); ?></a></li>
          <li><a href="mailto:tours@hallowedground.test">tours@hallowedground.test</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-service"><?php esc_html_e( 'Proudly serving Gettysburg and the surrounding Adams County communities of Biglerville, Littlestown, New Oxford, McSherrystown, Fairfield, Cashtown, and Hanover.', 'hallowed-ground' ); ?></p>
    <div class="footer-bottom">
      <span>&copy; <?php echo esc_html( (string) gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></span>
      <span><?php esc_html_e( 'Design concept by Ridges & Valleys Studio.', 'hallowed-ground' ); ?></span>
    </div>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>

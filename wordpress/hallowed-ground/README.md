<?php
/**
 * Install the Hallowed Ground WooCommerce theme
 *
 * 1. Copy `wordpress/hallowed-ground/` into `wp-content/themes/hallowed-ground/`.
 * 2. Install and activate WooCommerce.
 * 3. Appearance → Themes → activate **Hallowed Ground**.
 * 4. WooCommerce will run its setup wizard. Set shop page title to Tours if it is not already.
 * 5. On first activation the theme seeds five variable tour products (Adult / Child / Senior) plus a $50 gift certificate.
 *    To re-seed: visit `wp-admin/edit.php?post_type=product&hg_seed_tours=1` while logged in as a shop manager after adding `&_wpnonce=` from a custom link — or create products by hand using the Duration / Group size / Difficulty / Meeting point fields.
 *
 * Recommended plugins (not bundled):
 * - WooCommerce Bookings or a slot plugin for live departure inventory
 * - Stripe / Square for live payments
 *
 * Pages to create and assign in Appearance → Menus: Home, Tours (shop), Guides, The Area, Contact, Groups, Gift certificates, Accessibility.
 *
 * The static HTML demo at the repo root remains the GitHub Pages live concept. This theme is the WordPress / WooCommerce build of the same brand.
 */

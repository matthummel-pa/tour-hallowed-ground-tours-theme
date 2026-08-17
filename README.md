# Hallowed Ground Battlefield Tours

Self-initiated concept website by [Ridges & Valleys Studio](https://ridgesandvalleys.com) for a Gettysburg / Adams County business.

**Live demo:** https://matthummel-pa.github.io/tour-hallowed-ground-tours-theme/

This repo is the source of truth for the working HTML demo. Push to `main` and GitHub Pages republishes the live site from the branch root.

## Develop

1. Edit the HTML / CSS / JS in this repo (same files as the live demo).
2. Open `index.html` locally, or serve the folder with any static server.
3. Commit and push to `main`. GitHub Pages serves `/` from `main`.

## First-time Pages setup

If the live URL 404s after the first push: **Settings → Pages → Deploy from a branch → `main` / (root)**.

## WooCommerce WordPress theme

The folder `wordpress/hallowed-ground/` is a installable theme. Copy it to `wp-content/themes/hallowed-ground/`, activate WooCommerce, then activate the theme. See `wordpress/hallowed-ground/README.md`.

Tours are WooCommerce variable products (Adult / Child / Senior) with duration, group size, difficulty, and meeting-point fields. A preferred-date note is stored on the order. Pair with WooCommerce Bookings for live seat inventory.

## Source

Copied from `web/app/themes/ridgesandvalleys-theme/concept/tour-hallowed-ground-tours/` in [matthummel-pa/ridgesandvalleys](https://github.com/matthummel-pa/ridgesandvalleys). Future updates belong here, not in the marketing site repo.

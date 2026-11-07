# ODDWRLD storefront

Plain HTML / CSS / JS. No build step, no dependencies. Open `index.html` to preview locally, or upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, cPanel, GitHub Pages).

## Edit these first (js/data.js)
- `whatsapp` — your number with country code, digits only (orders are sent here)
- `email`, `instagram`, `tiktok`
- `newsletterEndpoint` — optional Formspree/Mailchimp URL for sign-ups
- `products` — name, price, `was` (old price, shows a sale badge), sizes, images

## Files
- `index.html` home · `shop.html` all products + filters · `product.html` product page · `cart.html` bag + order form · `info.html` help pages
- `css/styles.css` all styling (colours are CSS variables at the top)
- `js/main.js` header/footer, carousels, filters, bag, order message
- `assets/img/` optimised photos (WebP) and the logo (transparent PNG)

## Adding a product
1. Put the image in `assets/img/` (4:5 works best, ~1000 × 1250).
2. Copy one block in `products` in `js/data.js` and change it.

## How ordering works
Customers fill the bag form and the order opens in WhatsApp (or email) as a ready-made message. No payment is taken on the site. To add card payments later, connect Paystack or Flutterwave on `cart.html`.

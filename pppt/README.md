# Pulse Performance PT demo sites

Four designs for the same gym website. `index.html` in this folder shows all four side by side. Each design is its own folder:

| Folder | Look |
|---|---|
| `formal-light/` | White, serif headings, restrained red. Reads like a clinic. |
| `formal-dark/` | Charcoal boutique studio. Numbered sections, sticky labels, a sideways photo strip. |
| `gym-dark/` | Black and red, full-width "PULSE" with the heartbeat carved through it, scrolling ticker. Matt's favourite so far. |
| `gym-light/` | Poster style. Thick borders, hard shadows, yellow and red blocks. |

Plain HTML, CSS and JavaScript, no build step. The fonts are self-hosted OFL files in `shared/fonts/`. The only code that runs on a server is the enquiry form's Cloudflare Worker (see below). Payments never touch this site: memberships go through myPTHub and merch through Shopify, and both handle their own checkout and security.

## Changing the words

All text, prices, class times, links and contact details live in `shared/content.js`. Every design renders from that one file, so an edit there shows up in all four. Anything in `[square brackets]` is a placeholder.

The shop links point at `merch.shopUrl`. Set it to the Shopify store address when there is one. The "Sign up through myPTHub" link is `memberships.signup`.

## Pricing

Prices come from Matt's price list and live in `memberships` in `content.js`. Each price is an array with one value per session length (30, 45 and 60 minutes). The page works out everything else: the price per session, the saving against a casual session, and the per-session price of a 10-session pack. Change a weekly price and all of those follow.

The 30 / 45 / 60 toggle switches every price on the page at once. The default length is `defaultDuration`.

Two cells in the price list don't agree with each other. At 4× weekly, $280 (45 min) and $360 (60 min) a week work out to $70 and $90 a session, but the "what clients actually pay" table says $67.50 and $85, which would mean $270 and $340 a week. The site uses the weekly prices. Check with Matt which is right.

## Enquiry form

Every call-to-action leads to one form in the contact section. A plan's button also fills in the "Interested in" field and the session length before the page scrolls down. No email address appears anywhere on the site.

The form posts to `/api/enquiry`, which is a Cloudflare Worker in `cloudflare/enquiry-worker/`. The Worker checks a Turnstile token and a honeypot field, then emails the enquiry to the studio through Cloudflare Email Routing, with the enquirer's address as Reply-To. It's a Worker rather than a Pages Function because Pages Functions can't use the `send_email` binding.

The form only sends on the hosts listed in `contact.form.liveHosts`. Everywhere else, including this github.io demo and localhost, it says it's a demo and sends nothing.

To switch it on:

1. In Cloudflare, enable Email Routing on the domain and verify the inbox the enquiries should go to as a destination address.
2. Create a Turnstile widget for the domain. Put its site key in `contact.form.turnstileSiteKey` (it's public).
3. From `cloudflare/enquiry-worker/`, run `npx wrangler deploy`, then `npx wrangler secret put` for `ENQUIRY_TO` (the verified inbox), `ENQUIRY_FROM` (a sender address on the domain) and `TURNSTILE_SECRET`. The addresses stay in Cloudflare, not in this repo.

Cloudflare says sending to a verified address in your own account is free on every plan.

## Email on the domain

Email Routing only receives: it forwards an address on the domain to an existing inbox. Replying *as* the domain needs something that can send. Two ways to get there:

- **Google Workspace.** A real mailbox on the domain in the Gmail interface Matt already uses. Sending and receiving just work, and SPF and DKIM are set up for you. It costs a monthly fee per user. The domain's MX records point at Google, so Email Routing can't run alongside it, and the enquiry Worker would then need Cloudflare's paid sending (Workers Paid plan) instead of free sending to a verified address.
- **Keep the free Gmail.** Email Routing forwards the domain address to Gmail, and Gmail's "Send mail as" sends replies from the domain address through an SMTP relay. Add the relay to the domain's SPF record and publish its DKIM key, or replies land in spam. It costs little or nothing, but there are more moving parts. Cloudflare's own Email Service has SMTP, but it's in beta, needs Workers Paid, and is aimed at automated email rather than a person's replies.

## Going live on Cloudflare Pages

The live site will be on Cloudflare Pages at the custom domain, with SSL handled by Cloudflare. Before that:

- Pick one design and move it to the site root. Right now each design sits in its own folder and loads `../shared/`.
- Remove the demo bar (`variants` in `content.js`) and the other designs.
- Decide how the gallery gets its file list. The GitHub API lookup works on any host as long as the repo is public. Otherwise, a one-line Pages build command can write `gallery/manifest.json`, which the loader already reads.
- Move the site into its own repo. It lives in Aaron's personal site repo for now.

## Photos

Put images in `gallery/` and they appear in every design. Nothing else needs editing.

- Files sort by name, so a number prefix sets the order: `01-squat-rack.jpg`, `02-class.jpg`.
- The caption comes from the file name. `03-sled-push.jpg` shows as "Sled push".
- A file whose name starts with `hero` (for example `hero-floor.jpg`) becomes the big background photo at the top of the page instead of going in the gallery.
- The `.svg` files in there now are placeholders. Delete them once real photos arrive.
- Resize photos to around 1600px on the long side before adding them. A phone photo straight off the camera is several megabytes.

A static host can't list a folder, so the page finds the files itself. On GitHub Pages it asks the GitHub API for the contents of `pppt/gallery` (60 requests an hour per visitor, cached per tab). On the local dev server (`python3 -m http.server`) it reads the directory listing. If both fail, it falls back to a `gallery/manifest.json` holding an array of file names, if one exists.

If the site moves to another repo or host, update `gallery.github` in `content.js`.

## The demo bar

The pill in the bottom-left corner switches between designs and keeps your place on the page. The × hides it for the rest of the browser session. Once a design is chosen, delete the `variants` block from `content.js` and the bar disappears for good.

## Scan report builder and example

`scan-report-builder/` is a copy of the Evolt report builder from the `pulse-performance-pt` repo. Nothing on the site links to it and it carries a `noindex` tag, so only people given the URL will find it. It is not private, because the repo is public. Client data never leaves the browser, so all the URL exposes is the tool itself.

This is a copy, not a link. Fixes made in `pulse-performance-pt` need copying over again (`index.html`, `app.js`, `import.js`, `styles.css`, `logo.png`), keeping the `noindex` tag and `?v=` strings in `index.html`.

`examples/example-scan-report.pdf` is the builder's made-up client (Jordan Ellis) printed to PDF. The Evolt service in every design links to it through `sample` in `content.js`. To regenerate it, open `scan-report-builder/#example` in Chrome and save as PDF. Never use a real client's report here.

## Cache-buster

The design pages and `index.html` load their CSS and JS with `?v=20260930b`. The builder is on `?v=20260930a`. After changing anything, bump the string in every page that loads the changed file, so the CDN doesn't serve a mix of old and new files.

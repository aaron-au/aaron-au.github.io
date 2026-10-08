# Pulse Performance PT demo sites

**This is the example site Matt reviews and tweaks.** Design changes happen here until a design is locked in. The live site, the enquiry Worker and the Cloudflare Terraform are in `pppt/site` and `pppt/infrastructure` on git.realee.org.

Four designs for the same gym website. `index.html` in this folder shows all four side by side. Each design is its own folder:

| Folder | Look |
|---|---|
| `formal-light/` | White, serif headings, restrained red. Reads like a clinic. |
| `formal-dark/` | Charcoal boutique studio. Numbered sections, sticky labels, a sideways photo strip. |
| `gym-dark/` | Black and red, full-width "PULSE" with the heartbeat carved through it, scrolling ticker. Matt's favourite so far. |
| `gym-light/` | Poster style. Thick borders, hard shadows, yellow and red blocks. |

Plain HTML, CSS and JavaScript, no build step. The fonts are self-hosted OFL files in `shared/fonts/`. The only code that runs on a server is the enquiry form's Cloudflare Worker (see below). Payments never touch this site. Memberships, session packs and merch are all sold through Matt's myPTHub store, which handles its own checkout and security.

The site is about personal training, so there's no class timetable. Small group training is still listed as a service.

## Changing the words

All text, prices, links and contact details live in `shared/content.js`. Every design renders from that one file, so an edit there shows up in all four. Anything in `[square brackets]` is a placeholder.

## myPTHub products

Every myPTHub product has a public page, for example https://pulseperformancept.mypthub.net/p/239353 for ten 60-minute sessions. The site links straight to those pages. The product number is the last part of the address, and it goes in `content.js`:

- `products` on each membership plan, and `payg.products.casual` and `payg.products.pack`, take one number per session length: `[30 min, 45 min, 60 min]`.
- `payg.products.scan` and each merch item's `product` take a single number.
- `null` means there's no product yet. That "Buy online" link hides itself, and a merch tile links to the store home (`store.home`) instead.

All 12 weekly memberships and the three 10-packs have numbers. Casual sessions, the on-demand scan, the online plans and merch don't have products in myPTHub yet. When Matt adds or changes a product, update its number here. That should happen about once a year.

myPTHub has no copy-link button. To find a product's number, open https://pulseperformancept.mypthub.net/p/ (it works logged out), click the package, and take the number from the address bar.

Buying online sits alongside the enquiry form rather than replacing it. The main button on each plan still opens the form, and "Or sign up online" appears under it once that plan has product numbers.

## Opening special

`special` in `content.js` is 10% off a weekly membership for as long as it runs. The discount ends if the membership is cancelled or paused for 3 months or more. It shows from `start` to `end` inclusive, going by the visitor's own date. The end date is a placeholder until Matt sets one.

While it's on:

- A banner sits above the plans, and each plan shows its price after the discount.
- A card slides into the bottom-right corner once the visitor scrolls past the first screen. It hides while the prices or the contact form are on screen. Once the visitor closes it or clicks through, it doesn't come back until the next special.
- The form's "Interested in" list gets an "Opening special" option, which the special's buttons fill in.

To preview it outside its dates, add `?special=on` to a page's address. `?special=off` hides it. The dates live in the page's JavaScript, so anyone determined can read them. That's fine for a promotion.

Whoever handles the signup applies the discount in myPTHub. The website only advertises it.

A full-screen popup was the other option. I went with the corner card because it doesn't block the page, only shows once, and moves out of the way on its own.

## Pricing

Prices come from Matt's price list and live in `memberships` in `content.js`. Each price is an array with one value per session length (30, 45 and 60 minutes). The page works out everything else: the price per session, the saving against a casual session, and the per-session price of a 10-session pack. Change a weekly price and all of those follow.

The 30 / 45 / 60 toggle switches every price on the page at once. The default length is `defaultDuration`.

Each extra weekly session takes $5 off every session at 45 and 60 minutes, and $2.50 at 30. Matt's list had 4× weekly at $280 and $360, which priced a session the same as 3× weekly and broke that pattern. The site uses $260 and $340 ($65 and $85 a session) instead. Aaron made that call, and Matt still needs to confirm it.

A plan with `featured: true` gets the loudest card ("Most popular", 2× weekly). `value: true` gets a quieter outlined treatment ("Best value", 4× weekly). The badge text is `badge`.

## In person or online

Matt's business has two sides: in-person PT at the studio, and online coaching anywhere in Australia. A switch labelled "In person | Online" sits in the hero and again at the top of the pricing. It swaps the hero line, the services list and the pricing. In-person is the default. The site remembers the visitor's choice, and a link ending `?loc=online` opens on the online side.

Everything for the online side is in `online` in `content.js`:

- **Monthly plans** come first. Online Coaching ($149) is the recommended plan, and Complete Online Coaching ($199) is training plus nutrition. They run month to month.
- **One-off options** come second: a $119 personalised program and a $55 30-minute consultation.
- Each item takes a myPTHub `product` number. With one, its button goes straight to that product page; without, it opens the enquiry form.
- To add a plan or one-off later (football programs, over-40s strength and so on), add an entry to the list. Every design picks it up.

Each service in `services` has a `where` of `"in-person"` or `"online"`, which decides which side lists it.

The opening special applies to in-person memberships only, so its banner and corner card don't appear on the online side.

Nutrition is worded "where appropriate" and online coaching promises support "within business hours", following Matt's notes on scope.

## Enquiry form

Every call-to-action leads to one form in the contact section. A plan's button also fills in the "Interested in" field and the session length before the page scrolls down. No email address appears anywhere on the site.

The form posts to `/api/enquiry`, which is a Cloudflare Worker in the `pppt/site` repo (`worker/`). The Worker checks a Turnstile token and a honeypot field, then emails the enquiry to the studio through Cloudflare Email Routing, with the enquirer's address as Reply-To. It's a Worker rather than a Pages Function because Pages Functions can't use the `send_email` binding.

The form only sends on the hosts listed in `contact.form.liveHosts`. Everywhere else, including this github.io demo and localhost, it says it's a demo and sends nothing.

The site repo's README covers switching it on.

## Email on the domain

Email Routing only receives: it forwards an address on the domain to an existing inbox. Replying *as* the domain needs something that can send. Two ways to get there:

- **Google Workspace.** A real mailbox on the domain in the Gmail interface Matt already uses. Sending and receiving just work, and SPF and DKIM are set up for you. It costs a monthly fee per user. The domain's MX records point at Google, so Email Routing can't run alongside it, and the enquiry Worker would then need Cloudflare's paid sending (Workers Paid plan) instead of free sending to a verified address.
- **Keep the free Gmail.** Email Routing forwards the domain address to Gmail, and Gmail's "Send mail as" sends replies from the domain address through an SMTP relay. Add the relay to the domain's SPF record and publish its DKIM key, or replies land in spam. It costs little or nothing, but there are more moving parts. Cloudflare's own Email Service has SMTP, but it's in beta, needs Workers Paid, and is aimed at automated email rather than a person's replies.

## Going live on Cloudflare Pages

The domain shows a coming-soon page from the site repo until a design is chosen. Before the full site replaces it:

- Pick one design and move it to the site root. Right now each design sits in its own folder and loads `../shared/`.
- Remove the demo bar (`variants` in `content.js`) and the other designs.
- Decide how the gallery gets its file list. The GitHub API lookup works on any host as long as the repo is public. Otherwise, a one-line Pages build command can write `gallery/manifest.json`, which the loader already reads.

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

The design pages and `index.html` load their CSS and JS with `?v=20261009a`. The builder is on `?v=20260930a`. After changing anything, bump the string in every page that loads the changed file, so the CDN doesn't serve a mix of old and new files.

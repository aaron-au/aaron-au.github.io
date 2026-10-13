/* Everything the four Goulding's Gardening demos say. Edit here and every design
   follows. Anything in [square brackets] is a placeholder to confirm. */

window.GG = {
  brand: {
    // From the Facebook page: "Goulding's Gardening provides garden
    // maintenance and small landscaping ... located in Melbourne".
    name: "Goulding's",
    trade: "Gardening",
    area: "Melbourne",
    tagline: "Tidy yards, built to last.",
    blurb: "Garden maintenance and small landscaping across Melbourne. We keep yards looking sharp, and turn tired, overgrown ones into gardens you'll actually use.",
  },

  contact: {
    phone: "[0400 000 000]",
    facebook: "https://www.facebook.com/[gouldings]",
    instagram: null,
    hours: "[Mon–Sat, 7am–5pm]",
    // The quote form is a demo: it shows a thank-you and sends nothing.
    // Its "What do you need?" list is the service names plus this.
    other: "Something else",
  },

  // Short, specific claims. Swap for whatever's true.
  promises: [
    { title: "Free on-site quotes", text: "We come out, measure up and give you a fixed written price." },
    { title: "[Fully insured]", text: "[Public liability cover on every job.]" },
    { title: "Left spotless", text: "Green waste gone, paths blown down, nothing left behind." },
  ],

  services: [
    { name: "Garden maintenance", text: "Regular visits to mow, edge, weed, prune and tidy, so the yard never gets away from you.", photo: "photos/04-lawn-and-path.jpg" },
    { name: "Garden makeovers", text: "Beds cleared, edged and rebuilt with rock, fresh mulch and plants that suit the spot.", photo: "photos/pairs/01-native-garden-bed-after.jpg" },
    { name: "Lawns & turf", text: "Ground levelled and prepared, then roll-on turf or synthetic grass laid flat and tight.", photo: "photos/06-new-lawn.jpg" },
    { name: "Hedges & topiary", text: "Hedges squared up and shrubs shaped, from a quick tidy to a hard cut-back.", photo: "photos/02-topiary-ball.jpg" },
    { name: "Paths, steps & edging", text: "Side passages and slopes turned into gravel paths, stepping stones and sleeper steps, with edging that keeps lines crisp.", photo: "photos/pairs/05-sleeper-steps-after.jpg" },
    { name: "Yard clean-ups", text: "Overgrown yards cut back and cleared, with all the green waste taken away.", photo: "photos/pairs/02-overgrown-side-path-after.jpg" },
  ],

  steps: [
    { title: "Get in touch", text: "Call, message on Facebook or fill in the form with a rough idea of the job." },
    { title: "Free quote", text: "We visit, talk it through and send a fixed written price." },
    { title: "We do the work", text: "On the day we said, with the crew and gear the job needs." },
    { title: "Walk-through", text: "We check it over with you and leave the place tidier than we found it." },
  ],

  // Before and after shots, best first. Made by tools/prepare-photos.py.
  pairs: [
    { slug: "01-native-garden-bed", title: "Garden bed rebuild", text: "Tired bed cleared, rock border reset, fresh mulch and natives." },
    { slug: "02-overgrown-side-path", title: "Overgrown side path", text: "Cut back to the brick so the path is usable again." },
    { slug: "03-synthetic-lawn", title: "Synthetic lawn", text: "Patchy grass swapped for synthetic turf and stepping pavers." },
    { slug: "04-side-passage", title: "Side passage", text: "Sleeper edging, gravel and stepping stones down a muddy strip." },
    { slug: "05-sleeper-steps", title: "Sleeper steps", text: "A slippery slope rebuilt as solid timber steps and a stone path." },
    { slug: "06-hedge-trim", title: "Hedge trim", text: "A shaggy hedge squared back into shape." },
    { slug: "07-new-build-lawn", title: "New build lawn", text: "Bare dirt levelled and laid with roll-on turf." },
    { slug: "08-backyard-refresh", title: "Backyard refresh", text: "New turf, stepping stones and a feature tree." },
    { slug: "09-courtyard-turf", title: "Courtyard turf", text: "A weedy strip turned into a neat synthetic courtyard." },
    { slug: "10-raised-bed-courtyard", title: "Courtyard clean-up", text: "Overgrown planter and pavers cleared back." },
    { slug: "11-garden-bed-clear", title: "Garden bed clear-out", text: "Overgrowth removed and the bed edged in stone." },
    { slug: "12-rock-border-bed", title: "Rock border bed", text: "Rocks reset, mulched and replanted." },
  ],

  // Finished jobs. The first is the hero photo in most designs.
  photos: [
    { src: "photos/01-backyard-finished.jpg", caption: "Backyard with gravel border and natives" },
    { src: "photos/02-topiary-ball.jpg", caption: "Topiary shaped" },
    { src: "photos/03-front-yard.jpg", caption: "Front yard, new lawn and beds" },
    { src: "photos/04-lawn-and-path.jpg", caption: "Lawn edged along the path" },
    { src: "photos/05-hedge-line.jpg", caption: "Hedge squared up" },
    { src: "photos/06-new-lawn.jpg", caption: "New lawn down a side yard" },
    { src: "photos/07-turf-going-down.jpg", caption: "Turf going down" },
    { src: "photos/08-side-gate.jpg", caption: "Side gate planting" },
    { src: "photos/09-front-lawn.jpg", caption: "Front lawn" },
    { src: "photos/10-street-frontage.jpg", caption: "Street frontage" },
  ],

  // The demo switcher bar. Delete once a design is chosen.
  variants: [
    { id: "clean", label: "Clean" },
    { id: "professional", label: "Professional" },
    { id: "fun", label: "Fun" },
    { id: "bold", label: "Bold" },
  ],
};

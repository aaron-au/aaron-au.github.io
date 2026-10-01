/* Pulse Performance PT — the one content file every demo site renders from.
   Edit words, prices and links here; all four layouts pick them up.
   Anything in [square brackets] is a placeholder waiting on real details. */

window.PPPT = {
  brand: {
    name: "Pulse Performance PT",
    short: "PPPT",
    tagline: ["Performance", "Strength", "Results"],
    logo: "../shared/logo.png",
  },

  hero: {
    kicker: "1:1 personal training · Evolt 360 body scans",
    headline: "Train with purpose.",
    headlineGym: "Find your pulse.",
    sub: "Coaching built around your numbers, not guesswork. We scan, we plan, we train, and we measure again.",
    primary: { label: "Book a free consult", href: "#contact" },
    secondary: { label: "See memberships", href: "#memberships" },
    // Swapped in when the visitor picks "Online".
    online: {
      kicker: "Online coaching · anywhere in Australia",
      sub: "Personalised programming, professional coaching and accountability, wherever you train.",
    },
  },

  /* In person | Online switch. It changes the hero line, the services and
     the pricing. The choice is remembered, and ?loc=online in a link opens
     the site on the online side. */
  locations: {
    default: "in-person",
    options: [
      { id: "in-person", label: "In person" },
      { id: "online", label: "Online" },
    ],
  },

  stats: [
    { value: "1:1", label: "Coaching that knows your name" },
    { value: "360°", label: "Evolt body composition scans" },
    { value: "12 wk", label: "Scan and review cycle, included for members" },
    { value: "30–60", label: "Minute sessions to suit your week" },
  ],

  about: {
    heading: "Coaching that measures what matters",
    body: [
      "Pulse Performance PT is a personal training studio for people who want results they can see on paper as well as in the mirror.",
      "Every member starts with an Evolt 360 body scan. We use it to set honest targets, build a program around them, and check back every 12 weeks, so progress is something we can show you rather than something we hope for.",
    ],
    coach: {
      name: "[Coach name]",
      role: "Founder & head coach",
      bio: "[A few lines about the coach: qualifications, years coaching, what they love to train and why they started Pulse.]",
      credentials: ["Cert IV in Fitness", "[Accreditation]", "[Speciality]"],
    },
  },

  /* `where` is the location a service shows under: "in-person", "online",
     or leave it out for both. Personal training leads; group sits last. */
  services: [
    {
      id: "pt",
      where: "in-person",
      name: "Personal Training",
      short: "30, 45 or 60 minutes",
      blurb: "One coach, one plan, your goals. Programs written for you and adjusted every session.",
      points: ["Weekly memberships", "10-session packs", "Casual sessions"],
    },
    {
      id: "scan",
      where: "in-person",
      name: "Evolt 360 Body Scans",
      short: "In-depth analysis",
      blurb: "Muscle, fat, visceral fat and metabolism in under a minute, with a coach's written report.",
      points: ["Included every 12 weeks for members", "$30 on demand", "Progress comparisons"],
      // A made-up client's report, so visitors can see what they'd get.
      sample: { label: "See an example report", href: "../examples/example-scan-report.pdf" },
    },
    {
      id: "group",
      where: "in-person",
      name: "Small Group Training",
      short: "Max 5 per class",
      blurb: "The energy of a class with the attention of a coach. Strength and conditioning in groups of five or fewer.",
      points: ["Five people at most", "Scaled for every level", "Ask us about times"],
    },
    {
      id: "online",
      where: "online",
      name: "Online Coaching",
      short: "Programming and a coach",
      blurb: "Your program is designed around your goals, experience, equipment and schedule. Your coach tracks your progress and adjusts your training as you go.",
      points: ["Program in the My PT Hub app", "Weekly check-ins", "Monthly video call"],
    },
    {
      id: "complete",
      where: "online",
      name: "Complete Online Coaching",
      short: "Training and nutrition",
      blurb: "Online coaching with nutrition built in: practical targets and accountability that fit your training and lifestyle.",
      points: ["Calorie & protein targets", "Meal structure guidance", "Weekly accountability"],
    },
    {
      id: "one-off",
      where: "online",
      name: "One-off Program or Consult",
      short: "No membership",
      blurb: "A personalised program to run yourself, or a single 30-minute call for technique, programming or goals.",
      points: ["$119 personalised program", "$55 consultation", "Upgrade any time"],
    },
  ],

  process: [
    { step: "Consult", text: "A free chat about your goals, history and injuries. No pressure, no hard sell." },
    { step: "Scan", text: "An Evolt 360 scan gives us your baseline: muscle, fat, visceral fat and metabolism." },
    { step: "Train", text: "One-on-one sessions built around your numbers, 30, 45 or 60 minutes at a time." },
    { step: "Re-scan", text: "Every 12 weeks we scan again and review what's working." },
  ],

  /* Pricing from Matt's price list. Every price array follows `durations`.
     Per-session prices and savings are worked out from these, not typed.
     Each extra weekly session takes $5 off every session at 45 and 60 min
     ($2.50 at 30 min). The list had 4× weekly at $280/$360, which broke
     that pattern, so it's $260/$340 here. `featured` gets the loudest
     card and `value` gets the "best value" treatment. */
  memberships: {
    heading: "Weekly PT memberships",
    tagline: "Train more. Save more. Get better results.",
    note: "12-week minimum commitment, paid by automatic weekly debit. After the first 12 weeks it continues on a rolling basis.",
    durations: [30, 45, 60],     // minutes
    defaultDuration: 1,          // index into durations: 45 minutes
    includes: "Evolt 360 scan every 12 weeks included",
    // Memberships are bought and managed in myPTHub; the site only links out.
    signup: { label: "Sign up through myPTHub", href: "https://pulseperformancept.mypthub.net/" }, // [check this is the right landing page]
    /* `products` are myPTHub product page numbers, one per session length
       (see `store` below). null means there's no product for that length
       yet, and the "buy online" link hides itself. */
    plans: [
      { name: "Consistency", perWeek: 1, prices: [55, 80, 100], products: [null, null, null], cta: "Start 1× weekly" },
      { name: "Progress", perWeek: 2, prices: [105, 150, 190], products: [null, null, null], cta: "Start 2× weekly", featured: true, badge: "Most popular" },
      { name: "Transformation", perWeek: 3, prices: [150, 210, 270], products: [null, null, null], cta: "Start 3× weekly" },
      { name: "Performance", perWeek: 4, prices: [190, 260, 340], products: [null, null, null], cta: "Start 4× weekly", value: true, badge: "Best value" },
    ],
    // Pay as you go: the secondary option, no commitment.
    payg: {
      heading: "Pay as you go",
      blurb: "No commitment. Book a single session or buy a pack of ten.",
      casual: [65, 90, 110],
      pack: [550, 800, 1000],     // 10 sessions
      scan: 30,                   // Evolt 360 scan on demand
      products: {
        casual: [null, null, null],
        pack: [null, null, 239353], // 10 × 60 min is live; Matt still has to add the rest
        scan: null,
      },
    },
  },

  /* Online coaching, shown when the visitor picks "Online". Monthly plans
     come first; one-offs are the secondary option. A `product` number sends
     the button to that myPTHub product; until then it opens the enquiry
     form. Add more plans or one-offs to these lists as Matt launches them. */
  online: {
    kicker: "Online coaching · anywhere in Australia",
    heading: ["Professional coaching.", "Wherever you train."],
    intro: [
      "Pulse Online Coaching gives you personalised programming, professional coaching and accountability wherever you train.",
      "Whether you're training at home, in a commercial gym or for your sport, your program is designed around your goals, experience, equipment and schedule. Your coach monitors your progress, supports you along the way and adjusts your training as you develop.",
    ],
    plans: [
      {
        name: "Online Coaching",
        price: 149,
        per: "month",
        featured: true,
        badge: "Recommended",
        blurb: "Everything you need for ongoing remote coaching.",
        includes: [
          "Personalised training program",
          "My PT Hub app with exercise demonstrations",
          "Weekly check-ins",
          "Progress tracking",
          "Ongoing coach support",
          "Program adjustments and a monthly review",
          "1 × 30-minute video call a month",
          "General healthy eating guidance",
        ],
        cta: "Start online coaching",
        product: null,
      },
      {
        name: "Complete Online Coaching",
        price: 199,
        per: "month",
        blurb: "Training and nutrition coaching together.",
        includes: [
          "Everything in Online Coaching",
          "Nutrition coaching and accountability",
          "Calorie and protein targets where appropriate",
          "Guidance on meal structure and everyday food",
          "Nutrition adjustments as you progress",
          "Evolt scan data used where available",
        ],
        cta: "Start complete coaching",
        product: null,
      },
    ],
    note: "Monthly plans renew each month until you cancel. Messages are answered within business hours. Video calls are booked ahead, and unused calls don't carry over to the next month.",
    oneOffs: {
      heading: "One-off options",
      blurb: "No membership. Upgrade to coaching whenever you're ready.",
      items: [
        {
          name: "Personalised Training Program",
          price: 119,
          unit: "one-off",
          blurb: "A program built for your goals, equipment and schedule, delivered in the My PT Hub app with a 30-minute walkthrough call. No ongoing coaching.",
          cta: "Get your program",
          product: null,
        },
        {
          name: "Online Consultation",
          price: 55,
          unit: "30 minutes",
          blurb: "One video call for technique, a program review, training advice, goal setting or a progress check.",
          cta: "Book a consultation",
          product: null,
        },
      ],
    },
    suits: ["General fitness", "Strength", "Muscle building", "Fat loss", "Sports and football off-season", "Home or commercial gym training"],
  },

  /* Matt's myPTHub storefront. Every product has its own public page at
     `product` + number, which handles payment. Product numbers change
     rarely, so they're typed in here rather than looked up. */
  store: {
    home: "https://pulseperformancept.mypthub.net/", // [check this is the right landing page]
    product: "https://pulseperformancept.mypthub.net/p/",
    buyLabel: "Buy online",
  },

  /* Opening special. Shows from `start` to `end` inclusive, by the
     visitor's own date. Add ?special=on or ?special=off to a page's
     address to preview it either way. {end} in the text becomes the
     end date, e.g. "31 December". */
  special: {
    start: "2026-10-01",
    end: "2026-12-31", // [Matt to set]
    percent: 10,
    title: "Opening special",
    headline: "10% off your membership. For life.",
    terms: "For weekly memberships started by {end}. The 10% stays for as long as you're a member, and ends if your membership is cancelled or paused for 3 months or more.",
    cta: "Claim 10% off",
  },

  testimonials: [
    { quote: "The scans changed everything for me. I stopped chasing the scale and started watching my muscle go up and my waist come down.", name: "[Member]", detail: "Progress member" },
    { quote: "Having a coach watch every rep means my form is finally right. I've never lifted this well.", name: "[Member]", detail: "Consistency member" },
    { quote: "I came in with a bad back and no confidence. Six months later I'm deadlifting.", name: "[Member]", detail: "Transformation member" },
  ],

  merch: {
    heading: "Wear the pulse",
    blurb: "Training gear and supplements from the Pulse store.",
    shopLabel: "Visit the store",
    // Sold through myPTHub too. `product` is its page number; without one
    // the tile links to the store's home page.
    products: [
      { name: "Pulse Tee", price: "$45", tag: "Apparel", product: null },
      { name: "Performance Hoodie", price: "$89", tag: "Apparel", product: null },
      { name: "Pulse Shaker", price: "$20", tag: "Gear", product: null },
      { name: "Training Cap", price: "$35", tag: "Apparel", product: null },
    ],
  },

  faq: [
    { q: "I'm new to training. Is this for me?", a: "Yes. Every program starts from where you are, and the first session is mostly about getting to know how you move." },
    { q: "What is an Evolt 360 scan?", a: "A bioelectrical impedance scan that measures muscle, fat, visceral fat, water and metabolic rate in about 60 seconds. You stand on it barefoot and hold two handles." },
    { q: "Is there a contract?", a: "In-person weekly memberships have a 12-week minimum, paid by automatic weekly debit, then continue on a rolling basis. Online coaching is month to month. If you'd rather not commit, book casual sessions, a 10-session pack, or a one-off online program or consultation." },
    { q: "Can I just get a scan?", a: "Yes. An Evolt 360 scan with a written coach's report is $30 on demand. Members get one every 12 weeks included." },
    { q: "I'm not local. Can you still coach me?", a: "Yes. Online coaching works anywhere in Australia. Your program lives in the My PT Hub app, and you check in with your coach every week." },
  ],

  contact: {
    heading: "Start with a free consult",
    blurb: "Tell us what you're working towards and we'll show you how we'd get you there.",
    /* The enquiry form posts to a Cloudflare Worker
       (worker/ in the pppt/site repo), which emails it on via Email Routing.
       It only goes live on `liveHosts`; anywhere else (the github.io demo,
       localhost) it runs in demo mode and sends nothing. */
    form: {
      action: "/api/enquiry",
      // The Worker is routed on the custom domain only, not *.pages.dev.
      liveHosts: ["pulseperformancept.com.au"],
      turnstileSiteKey: "", // [Cloudflare Turnstile site key; public, safe to commit]
      submit: "Send enquiry",
      sent: "Thanks. We'll be in touch soon.",
      failed: "That didn't send. Please try again, or message us on Instagram.",
      demo: "Demo only: this form isn't connected yet, so nothing was sent.",
    },
    address: ["[Street address]", "[Suburb STATE 0000]"],
    phone: "[0400 000 000]",
    hours: [
      ["Mon–Fri", "5:00am – 8:00pm"],
      ["Sat", "6:30am – 12:00pm"],
      ["Sun", "Member access only"],
    ],
    social: [
      { label: "Instagram", href: "#" },
      { label: "Facebook", href: "#" },
    ],
  },

  /* Photos: drop images into pppt/gallery/. Files named hero-* become hero
     backgrounds; everything else goes in the gallery, sorted by file name.
     A name like "03-sled-push.jpg" gets the caption "Sled push". */
  gallery: {
    folder: "../gallery/",
    github: { repo: "aaron-au/aaron-au.github.io", branch: "main", path: "pppt/gallery" },
  },

  /* The demo switcher bar. Delete this block (or the switcher script tag) to
     hide it once a design is chosen. */
  variants: [
    { id: "formal-light", label: "Formal · Light" },
    { id: "formal-dark", label: "Formal · Dark" },
    { id: "gym-dark", label: "Gym · Dark" },
    { id: "gym-light", label: "Gym · Light" },
  ],
};

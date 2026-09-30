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

  // Personal training leads; group training sits last.
  services: [
    {
      id: "pt",
      name: "Personal Training",
      short: "30, 45 or 60 minutes",
      blurb: "One coach, one plan, your goals. Programs written for you and adjusted every session.",
      points: ["Weekly memberships", "10-session packs", "Casual sessions"],
    },
    {
      id: "scan",
      name: "Evolt 360 Body Scans",
      short: "In-depth analysis",
      blurb: "Muscle, fat, visceral fat and metabolism in under a minute, with a coach's written report.",
      points: ["Included every 12 weeks for members", "$30 on demand", "Progress comparisons"],
      // A made-up client's report, so visitors can see what they'd get.
      sample: { label: "See an example report", href: "../examples/example-scan-report.pdf" },
    },
    {
      id: "online",
      name: "Online Coaching",
      short: "30-minute Zoom calls",
      blurb: "Coaching wherever you train. A 30-minute video call to review your training and plan what's next, with written feedback after every call.",
      points: ["30-minute Zoom call", "Written feedback after the call", "$45 a call"], // [price is a guess]
    },
    {
      id: "nutrition",
      name: "Nutrition Coaching",
      short: "30-minute Zoom calls",
      blurb: "Practical advice on eating for your training, built on the numbers from your scan. A 30-minute video call, then written feedback with your targets.",
      points: ["Calorie & protein targets", "Written feedback after the call", "$45 a call"], // [price is a guess]
    },
    {
      id: "group",
      name: "Small Group Training",
      short: "Max 5 per class",
      blurb: "The energy of a class with the attention of a coach. Strength and conditioning in groups of five or fewer.",
      points: ["Five people at most", "Scaled for every level", "Morning & evening times"],
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
    signup: { label: "Sign up through myPTHub", href: "https://example.com/mypthub" }, // [real myPTHub link]
    plans: [
      { name: "Consistency", perWeek: 1, prices: [55, 80, 100], cta: "Start 1× weekly" },
      { name: "Progress", perWeek: 2, prices: [105, 150, 190], cta: "Start 2× weekly", featured: true, badge: "Most popular" },
      { name: "Transformation", perWeek: 3, prices: [150, 210, 270], cta: "Start 3× weekly" },
      { name: "Performance", perWeek: 4, prices: [190, 260, 340], cta: "Start 4× weekly", value: true, badge: "Best value" },
    ],
    // Pay as you go: the secondary option, no commitment.
    payg: {
      heading: "Pay as you go",
      blurb: "No commitment. Book a single session or buy a pack of ten.",
      casual: [65, 90, 110],
      pack: [550, 800, 1000],     // 10 sessions
      scan: 30,                   // Evolt 360 scan on demand
    },
  },

  timetable: {
    note: "Sample timetable",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    // [time, class, days it runs (indexes into days)]
    rows: [
      ["5:30am", "Strength", [0, 2, 4]],
      ["5:30am", "Conditioning", [1, 3]],
      ["6:30am", "Strength & Conditioning", [0, 1, 2, 3, 4]],
      ["7:00am", "Saturday Sweat", [5]],
      ["9:30am", "Mobility & Core", [1, 3]],
      ["5:30pm", "Strength", [0, 1, 2, 3]],
      ["6:30pm", "Conditioning", [0, 2]],
    ],
  },

  testimonials: [
    { quote: "The scans changed everything for me. I stopped chasing the scale and started watching my muscle go up and my waist come down.", name: "[Member]", detail: "Progress member" },
    { quote: "Having a coach watch every rep means my form is finally right. I've never lifted this well.", name: "[Member]", detail: "Consistency member" },
    { quote: "I came in with a bad back and no confidence. Six months later I'm deadlifting.", name: "[Member]", detail: "Transformation member" },
  ],

  merch: {
    heading: "Wear the pulse",
    blurb: "Training gear and supplements from the Pulse store.",
    shopUrl: "https://example.myshopify.com", // [swap for the real Shopify store]
    shopLabel: "Visit the store",
    products: [
      { name: "Pulse Tee", price: "$45", tag: "Apparel" },
      { name: "Performance Hoodie", price: "$89", tag: "Apparel" },
      { name: "Pulse Shaker", price: "$20", tag: "Gear" },
      { name: "Training Cap", price: "$35", tag: "Apparel" },
    ],
  },

  faq: [
    { q: "I'm new to training. Is this for me?", a: "Yes. Every program starts from where you are, and the first session is mostly about getting to know how you move." },
    { q: "What is an Evolt 360 scan?", a: "A bioelectrical impedance scan that measures muscle, fat, visceral fat, water and metabolic rate in about 60 seconds. You stand on it barefoot and hold two handles." },
    { q: "Is there a contract?", a: "Weekly memberships have a 12-week minimum, paid by automatic weekly debit, then continue on a rolling basis. If you'd rather not commit, book casual sessions or a 10-session pack." },
    { q: "Can I just get a scan?", a: "Yes. An Evolt 360 scan with a written coach's report is $30 on demand. Members get one every 12 weeks included." },
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

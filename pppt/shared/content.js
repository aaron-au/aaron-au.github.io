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
    kicker: "Personal training · Small group · Body scans",
    headline: "Train with purpose.",
    headlineGym: "Find your pulse.",
    sub: "Coaching built around your numbers, not guesswork. We scan, we plan, we train, and we measure again.",
    primary: { label: "Book a free consult", href: "#contact" },
    secondary: { label: "See memberships", href: "#memberships" },
  },

  stats: [
    { value: "1:1", label: "Coaching that knows your name" },
    { value: "360°", label: "Evolt body composition scans" },
    { value: "6 wk", label: "Re-scan and review cycle" },
    { value: "7 days", label: "Member access" },
  ],

  about: {
    heading: "Coaching that measures what matters",
    body: [
      "Pulse Performance PT is a personal training studio for people who want results they can see on paper as well as in the mirror.",
      "Every member starts with an Evolt 360 body scan. We use it to set honest targets, build a program around them, and check back every six weeks, so progress is something we can show you rather than something we hope for.",
    ],
    coach: {
      name: "[Coach name]",
      role: "Founder & head coach",
      bio: "[A few lines about the coach: qualifications, years coaching, what they love to train and why they started Pulse.]",
      credentials: ["Cert IV in Fitness", "[Accreditation]", "[Speciality]"],
    },
  },

  services: [
    {
      id: "pt",
      name: "Personal Training",
      short: "1:1 sessions",
      blurb: "One coach, one plan, your goals. Programs written for you and adjusted every session.",
      points: ["Individual program", "Technique coaching", "Progress tracking"],
    },
    {
      id: "group",
      name: "Small Group Training",
      short: "Max 8 per class",
      blurb: "The energy of a class with the attention of a coach. Strength and conditioning in small groups.",
      points: ["Capped class sizes", "Scaled for every level", "Morning & evening times"],
    },
    {
      id: "scan",
      name: "Evolt 360 Body Scans",
      short: "In-depth analysis",
      blurb: "Muscle, fat, visceral fat and metabolism in under a minute, with a coach's written report.",
      points: ["Branded PDF report", "Progress comparisons", "Available to non-members"],
      // A made-up client's report, so visitors can see what they'd get.
      sample: { label: "See an example report", href: "../examples/example-scan-report.pdf" },
    },
    {
      id: "online",
      name: "Online Coaching",
      short: "Train anywhere",
      blurb: "Your program in your pocket, with weekly check-ins and form reviews from your coach.",
      points: ["App-based program", "Weekly check-ins", "Video form feedback"],
    },
    {
      id: "nutrition",
      name: "Nutrition Coaching",
      short: "Habits, not diets",
      blurb: "Practical guidance on eating for your training, built on the numbers from your scan.",
      points: ["Calorie & protein targets", "Habit coaching", "No meal-plan crash diets"],
    },
  ],

  process: [
    { step: "Consult", text: "A free chat about your goals, history and injuries. No pressure, no hard sell." },
    { step: "Scan", text: "An Evolt 360 scan gives us your baseline: muscle, fat, visceral fat and metabolism." },
    { step: "Train", text: "A program built around your numbers, coached in person, in a group or online." },
    { step: "Re-scan", text: "Every six weeks we scan again and review what's working." },
  ],

  memberships: {
    note: "Sample pricing. Weekly direct debit, no lock-in contracts.",
    plans: [
      {
        name: "Group",
        price: 39,
        per: "week",
        blurb: "Unlimited small group training.",
        features: ["Unlimited group classes", "Evolt scan every 12 weeks", "Member app access"],
        cta: "Join Group",
      },
      {
        name: "Hybrid",
        price: 79,
        per: "week",
        featured: true,
        badge: "Most popular",
        blurb: "Group training plus a weekly 1:1 session.",
        features: ["Unlimited group classes", "1 × PT session per week", "Evolt scan every 6 weeks", "Nutrition check-ins"],
        cta: "Join Hybrid",
      },
      {
        name: "Performance",
        price: 129,
        per: "week",
        blurb: "Full personal coaching for serious goals.",
        features: ["2 × PT sessions per week", "Unlimited group classes", "Evolt scan every 6 weeks", "Full nutrition coaching"],
        cta: "Join Performance",
      },
    ],
    extras: [
      { name: "Casual group class", price: "$25" },
      { name: "Single PT session", price: "$85" },
      { name: "Evolt scan + report (non-member)", price: "$59" },
      { name: "Online coaching", price: "$45 / wk" },
    ],
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
    { quote: "The scans changed everything for me. I stopped chasing the scale and started watching my muscle go up and my waist come down.", name: "[Member]", detail: "Hybrid member" },
    { quote: "Small groups mean the coach actually corrects your form. I've never lifted this well.", name: "[Member]", detail: "Group member" },
    { quote: "I came in with a bad back and no confidence. Six months later I'm deadlifting.", name: "[Member]", detail: "Performance member" },
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
    { q: "Is there a lock-in contract?", a: "No. Memberships are weekly and you can pause or cancel with seven days' notice." },
    { q: "Can I just get a scan?", a: "Yes. Scans are available to non-members and come with a written coach's report." },
  ],

  contact: {
    heading: "Start with a free consult",
    blurb: "Tell us what you're working towards and we'll show you how we'd get you there.",
    bookingUrl: "#", // [booking system link]
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

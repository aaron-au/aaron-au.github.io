/* Blog index. Posts are conversations: in the .md file, a line starting with
   "@handle " begins a new chat message from that handle; following lines
   continue the message until the next "@handle " line. Markdown works inside
   messages (including code fences).

   To publish a post:
   1. Create posts/YYYY-MM-DD-your-slug.md written as a conversation
   2. Add an entry here (slug = filename without .md)
   tags drive the topic rail (left edge); pinned floats a post to the top. */
window.BLOG_INDEX = [
  {
    slug: "2026-07-17-hello-world",
    title: "So I built a fake operating system",
    date: "2026-07-17",
    summary: "Why this site looks like macOS.",
    tags: ["meta"],
    pinned: true,
  },
  {
    slug: "2026-07-05-boomi-gateway-auth-header",
    title: "Boomi bug: the Gateway eats your auth header",
    date: "2026-07-05",
    summary: "API Gateway → runtime, and what arrives isn't what was sent.",
    tags: ["boomi"],
  },
  {
    slug: "2026-06-18-netsuite-concurrency",
    title: "NetSuite connector: the dropdown that fixes everything",
    date: "2026-06-18",
    summary: "Concurrency is per connection per JVM — and the default is 1.",
    tags: ["boomi", "netsuite"],
  },
  // ---- SHIFT: building a streaming iPaaS in Go, in order ----
  {
    slug: "2026-07-19-shift-review",
    title: "SHIFT #1 — The review that killed the prototype",
    date: "2026-07-19",
    summary: "5.5k LOC, zero tests, zero commits. Verdict: keep the schema, start clean.",
    tags: ["shift", "go"],
  },
  // ---- Platform Diaries: an Azure/Kubernetes rebuild, in order ----
  {
    slug: "2026-07-13-platform-gets-a-tailnet",
    title: "Platform Diaries #12 — Season finale: the platform grows a tailnet",
    date: "2026-07-13",
    summary: "Five months, three repos, one state file. Where the rebuild landed.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-06-27-rsync-exit-24",
    title: "Platform Diaries #11 — rsync exit code 24 is a success now",
    date: "2026-06-27",
    summary: "Live storage migrations, fsGroup boss fights, and vanished files.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-06-24-split-brain-fence",
    title: "Platform Diaries #10 — The split-brain fence",
    date: "2026-06-24",
    summary: "DR week: why my failover script is imperative and I'm not sorry.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-05-28-boomi-vs-rfc1918",
    title: "Platform Diaries #9 — The day Boomi went internet-only",
    date: "2026-05-28",
    summary: "One NetworkPolicy blocked every private network. All of them.",
    tags: ["azure", "kubernetes", "boomi"],
  },
  {
    slug: "2026-05-23-csi-to-eso",
    title: "Platform Diaries #8 — Secrets, twice",
    date: "2026-05-23",
    summary: "CSI to External Secrets Operator, with byte-for-byte paranoia.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-05-07-the-522",
    title: "Platform Diaries #7 — The 522 and the load-bearing asterisk",
    date: "2026-05-07",
    summary: "AKS Direct Server Return vs one well-intentioned NSG rule.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-04-14-moving-state",
    title: "Platform Diaries #6 — terraform state mv, with customers aboard",
    date: "2026-04-14",
    summary: "Eleven state files become one. The goal is maximum boredom.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-04-07-the-acr-auth-week",
    title: "Platform Diaries #5 — The ACR auth week ('credeitnal' stays)",
    date: "2026-04-07",
    summary: "OCI mirroring is worth it. The toll booth is one week of your life.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-03-19-coredns-vs-aks",
    title: "Platform Diaries #4 — CoreDNS vs managed Kubernetes",
    date: "2026-03-19",
    summary: "AKS manages CoreDNS. You cope. A per-customer DNS story.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-03-05-wazuh-26-hours",
    title: "Platform Diaries #3 — Wazuh: an obituary (26 hours)",
    date: "2026-03-05",
    summary: "Kill experiments while they're cheap. Falco by dinnertime.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-02-22-day-zero",
    title: "Platform Diaries #2 — Day zero: three repos and a thesis",
    date: "2026-02-22",
    summary: "App-of-apps, sync waves, and a bet on cluster labels.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-02-09-why-rebuild",
    title: "Platform Diaries #1 — Eleven state files of doom",
    date: "2026-02-09",
    summary: "The v2 confession: Octopus, envsubst, and an empty folder called ArgoCD.",
    tags: ["azure", "kubernetes"],
  },
  {
    slug: "2026-06-28-home-automation-regret",
    title: "My house has a dependency graph now",
    date: "2026-06-28",
    summary: "Home automation: the hobby that automates nothing.",
    tags: ["home automation"],
  },
  // ---- The Temporary Integration (2015–2020): annual check-ins ----
  {
    slug: "2020-09-10-an-obituary-probably",
    title: "The Temporary Integration — an obituary (probably)",
    date: "2020-09-10",
    summary: "5-day life expectancy. 5+ years served. Reportedly decommissioned.",
    tags: ["php"],
  },
  {
    slug: "2019-03-16-still-running-year-four",
    title: "The Temporary Integration — year four: The Script abides",
    date: "2019-03-16",
    summary: "\"Hi, you don't know me, but apparently you wrote The Script.\"",
    tags: ["php"],
  },
  {
    slug: "2018-03-16-still-running-year-three",
    title: "The Temporary Integration — year three: it survived a server migration",
    date: "2018-03-16",
    summary: "\"It's important and it runs at night.\"",
    tags: ["php"],
  },
  {
    slug: "2017-03-16-still-running-year-two",
    title: "The Temporary Integration — year two: there was a workshop",
    date: "2017-03-16",
    summary: "Not legacy code. Heritage code.",
    tags: ["php"],
  },
  {
    slug: "2016-03-16-still-running-year-one",
    title: "The Temporary Integration — year one: it outlived my employment",
    date: "2016-03-16",
    summary: "The lighthouse keeps itself. That was always the deal.",
    tags: ["php"],
  },
  {
    slug: "2015-03-16-the-temporary-integration",
    title: "The Temporary Integration — five days, tops",
    date: "2015-03-16",
    summary: "PHP + WinSCP + IIS + a deadline. What could last?",
    tags: ["php"],
  },
];

/* Grounds: calm and premium. Charcoal, moss and off-white, Unbounded
   headings, lime kept for accents. Two motifs from the logo: mowing-stripe
   panels and the ribbon, drawn as a sweeping SVG curve. */

// The logo's ribbon: three parallel strands fading from lime to clear.
const ribbon = (id, cls, d) => `
<svg class="ribbon ${cls}" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C7EA46" stop-opacity="0"/>
      <stop offset=".35" stop-color="#C7EA46" stop-opacity=".9"/>
      <stop offset=".7" stop-color="#E4F5A6" stop-opacity=".55"/>
      <stop offset="1" stop-color="#C7EA46" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="34" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="10" stroke-linecap="round" transform="translate(0 46)" opacity=".7"/>
  <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="3" stroke-linecap="round" transform="translate(0 74)" opacity=".5"/>
</svg>`;

JAG.boot({
  variant: "grounds",
  render: (G, { html, raw, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    const pad = (n) => String(n).padStart(2, "0");
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top" aria-label="${B.full}, home"><img src="${src("logo/mark-dark.png")}" alt=""></a>
    <nav data-nav aria-label="Main">
      <a href="#services">Services</a><a href="#work">Our work</a><a href="#process">Process</a><a href="#gallery">Gallery</a><a href="#contact" class="nav-cta">Free quote</a>
    </nav>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap hero-in">
      <div class="hero-copy">
        <img class="hero-logo reveal" src="${src("logo/logo-dark.png")}" alt="${B.full}">
        <h1 class="reveal reveal-d1">${B.tagline}</h1>
        <p class="lede reveal reveal-d2">${B.blurb}</p>
        <div class="cta-row reveal reveal-d3">
          <a class="btn" href="#contact">Book a free quote</a>
          <a class="btn btn-ghost" href="#work">See the work</a>
        </div>
      </div>
      <figure class="hero-photo reveal reveal-d2">
        <img src="${src(G.photos[0].src)}" alt="${G.photos[0].caption}">
        <figcaption><span class="dot"></span>${B.area} · ${C.hours}</figcaption>
      </figure>
    </div>
    ${raw(ribbon("rib-a", "ribbon-hero", "M-60 520 C 260 420, 420 300, 720 330 S 1180 520, 1500 260"))}
  </section>

  <section id="services" class="services light">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">What we do</p>
        <h2>Looked after properly, from the lawn to the last edge.</h2>
      </div>
      <ul class="svc" role="list">${G.services.map((s, i) => html`
        <li class="reveal reveal-d${i % 3}">
          <div class="svc-img"><img src="${src(s.photo)}" alt="" loading="lazy"></div>
          <div class="svc-body">
            <span class="n">${pad(i + 1)}</span>
            <h3>${s.name}</h3>
            <p>${s.text}</p>
            <a href="#contact" data-enquire="${s.name}">Ask about this <span aria-hidden="true">→</span></a>
          </div>
        </li>`)}
      </ul>
    </div>
  </section>

  <section id="work" class="work">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Before and after</p>
        <h2>The difference a visit makes.</h2>
      </div>
      <div class="work-in reveal">
        <div class="work-stage" data-stage>${compare(G.pairs[0], { start: 50 })}</div>
        <div class="work-side">
          <p class="work-hint">Drag the handle to compare. Pick another job below.</p>
          <ol class="jobs" role="list">${G.pairs.slice(0, 6).map((p, i) => html`
            <li><button type="button" data-pair="${i}" ${raw(i === 0 ? 'aria-current="true"' : "")}>
              <span class="jn">${pad(i + 1)}</span>
              <span><strong>${p.title}</strong><small>${p.text}</small></span>
            </button></li>`)}
          </ol>
        </div>
      </div>
    </div>
  </section>

  <section class="promise-wrap light">
    ${raw(ribbon("rib-b", "ribbon-promise", "M-80 120 C 300 40, 560 260, 860 200 S 1260 20, 1520 140"))}
    <div class="wrap">
      <div class="promises stripes reveal">
        ${G.promises.map((p) => html`<div><span class="tick" aria-hidden="true"></span><h3>${p.title}</h3><p>${p.text}</p></div>`)}
      </div>
    </div>
  </section>

  <section id="process" class="process light">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">How it works</p>
        <h2>Four simple steps.</h2>
      </div>
      <ol class="steps" role="list">${G.steps.map((s, i) => html`
        <li class="reveal reveal-d${i % 4}"><span class="sn">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}
      </ol>
    </div>
  </section>

  <section id="gallery" class="gallery">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Finished jobs</p>
        <h2>Recent work around ${B.area}.</h2>
      </div>
      <div class="grid">${G.photos.map((p, n) => html`<button type="button" class="reveal" data-photo="${n}" aria-label="View: ${p.caption}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></button>`)}</div>
    </div>
  </section>

  <section id="contact" class="contact">
    ${raw(ribbon("rib-c", "ribbon-contact", "M-60 80 C 240 200, 520 40, 820 120 S 1240 320, 1500 180"))}
    <div class="wrap contact-in">
      <div class="contact-copy reveal">
        <p class="eyebrow">Free quote</p>
        <h2>Let's talk about your yard.</h2>
        <p>Tell us a little about the job and we'll arrange a time to come out, measure up and give you a fixed written price.</p>
        <dl class="details">
          <div><dt>Phone</dt><dd><a href="tel:${phone()}">${C.phone}</a></dd></div>
          <div><dt>Hours</dt><dd>${C.hours}</dd></div>
          <div><dt>Area</dt><dd>${B.area}</dd></div>
          <div><dt>Facebook</dt><dd><a href="${C.facebook}" target="_blank" rel="noopener">Send us a message ↗</a></dd></div>
        </dl>
      </div>
      <div class="form-card reveal reveal-d1">${quoteForm({ button: "btn" })}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo/logo-dark.png")}" alt="${B.full}">
    <p>Landscaping and garden maintenance across ${B.area}.</p>
    <p class="copy">© <span data-year></span> ${B.full}</p>
  </div>
</footer>`;
  },
  afterRender: () => {
    const { $, $$, pairs, setPair } = JAG;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pair]");
      if (!b) return;
      setPair($("[data-stage] .ba"), pairs[+b.dataset.pair]);
      $$("[data-pair]").forEach((x) => x.removeAttribute("aria-current"));
      b.setAttribute("aria-current", "true");
    });
  },
});

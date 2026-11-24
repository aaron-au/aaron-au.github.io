/* Daylight: bright and clean. Off-white surfaces, Poppins, the logo on a
   black header bar and footer, lime used as a highlighter. */

JAG.boot({
  variant: "daylight",
  render: (G, { html, raw, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    // Simple line icons for the three promises, in order.
    const icons = [
      '<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M10 20v-6h4v6"/>',
      '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
      '<path d="M5 12l4.5 4.5L19 7"/>',
    ];
    const icon = (i) => raw(`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[i % icons.length]}</svg>`);
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top" aria-label="${B.full}, home"><img src="${src("logo/mark-dark.png")}" alt=""><span>${B.trade}</span></a>
    <nav data-nav aria-label="Main">
      <a href="#services">Services</a><a href="#work">Our work</a><a href="#how">How it works</a><a href="#contact">Contact</a>
    </nav>
    <a class="btn btn-sm call" href="tel:${phone()}">${C.phone}</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap hero-in">
      <div class="hero-copy">
        <p class="eyebrow reveal">${B.full} · ${B.area}</p>
        <h1 class="reveal reveal-d1">Sharp yards. <mark>Built to last.</mark></h1>
        <p class="lede reveal reveal-d2">${B.blurb}</p>
        <div class="cta reveal reveal-d3">
          <a class="btn" href="#contact">Get a free quote</a>
          <a class="link" href="#work">See before &amp; afters →</a>
        </div>
      </div>
      <figure class="hero-photo reveal reveal-d1">
        <img src="${src(G.photos[0].src)}" alt="${G.photos[0].caption}">
        <figcaption><span class="dot"></span>${G.photos[0].caption}</figcaption>
      </figure>
    </div>
  </section>

  <section class="promises" aria-label="Why JAG">
    <div class="wrap grid">${G.promises.map((p, i) => html`<div class="promise reveal reveal-d${i}">
      <span class="ico">${icon(i)}</span>
      <div><h3>${p.title}</h3><p>${p.text}</p></div></div>`)}</div>
  </section>

  <section id="services" class="services">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">Services</p><h2>What we <mark>look after</mark></h2></div>
      <ul class="cards" role="list">${G.services.map((s, i) => html`<li class="card reveal reveal-d${i % 3}">
        <img src="${src(s.photo)}" alt="" loading="lazy">
        <div class="card-body">
          <h3>${s.name}</h3>
          <p>${s.text}</p>
          <a href="#contact" data-enquire="${s.name}">Ask about this <span aria-hidden="true">→</span></a>
        </div></li>`)}</ul>
    </div>
  </section>

  <section id="work" class="work">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">Before &amp; after</p><h2>Drag to see <mark>the difference</mark></h2></div>
      <div class="pairs">${G.pairs.slice(0, 6).map((p, i) => html`<figure class="pair reveal reveal-d${i % 3}">
        ${compare(p)}
        <figcaption><h3>${p.title}</h3><p>${p.text}</p></figcaption></figure>`)}</div>
    </div>
  </section>

  <section id="how" class="how">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">How it works</p><h2>Four steps, <mark>no surprises</mark></h2></div>
      <ol class="steps" role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}">
        <span class="num">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery" aria-labelledby="gallery-h">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">Gallery</p><h2 id="gallery-h">Finished <mark>jobs</mark></h2></div>
      <div class="shots">${G.photos.map((p, n) => html`<button type="button" data-photo="${n}" aria-label="View: ${p.caption}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="wrap contact-in">
      <div class="contact-copy reveal">
        <p class="eyebrow">Contact</p>
        <h2>Let's get your yard <mark>sorted</mark></h2>
        <p>Tell us a little about the job and we'll call back to book a free on-site quote.</p>
        <dl>
          <div><dt>Phone</dt><dd><a href="tel:${phone()}">${C.phone}</a></dd></div>
          <div><dt>Hours</dt><dd>${C.hours}</dd></div>
          <div><dt>Area</dt><dd>${B.area}</dd></div>
          <div><dt>Facebook</dt><dd><a href="${C.facebook}" target="_blank" rel="noopener">Message us ↗</a></dd></div>
        </dl>
      </div>
      <div class="form-card reveal reveal-d1">${quoteForm()}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo/logo-dark.png")}" alt="${B.full}">
    <nav aria-label="Footer">
      <a href="#services">Services</a><a href="#work">Our work</a><a href="#how">How it works</a><a href="#contact">Contact</a>
    </nav>
    <div class="foot-contact">
      <a href="tel:${phone()}">${C.phone}</a>
      <p>${C.hours} · ${B.area}</p>
    </div>
  </div>
  <div class="wrap foot-base"><p>© <span data-year></span> ${B.full}</p></div>
</footer>`;
  },
});

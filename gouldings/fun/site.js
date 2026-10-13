/* Fun: rounded everything, warm cream, leaf green and sunshine. Before
   and afters are tap-to-flip cards. Section edges are smooth waves. */

GG.boot({
  variant: "fun",
  render: (G, { html, raw, src, phone, flip, quoteForm }) => {
    const B = G.brand, C = G.contact;
    // A gentle wave edge between sections. fill = the colour of the next section.
    const wave = (cls, flipX = false) => raw(`<svg class="wave ${cls}" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"${flipX ? ' style="transform:scaleX(-1)"' : ""}>
      <path d="M0 48 C 240 8, 480 8, 720 40 S 1200 80, 1440 30 V80 H0 Z"/></svg>`);
    const leaf = raw(`<svg class="leaf" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15Zm0 0 7-7"/></svg>`);
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top"><img src="${src("logo-olive.png")}" alt=""><span>${B.name}</span></a>
    <nav data-nav aria-label="Main">
      <a href="#makeovers">Makeovers</a><a href="#services">What we do</a><a href="#how">How it works</a><a href="#contact">Say hi</a>
    </nav>
    <a class="btn btn-sun btn-sm" href="#contact">Free quote</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero wrap">
    <div class="hero-copy">
      <p class="pill reveal">${leaf} Gardening across ${B.area}</p>
      <h1 class="reveal reveal-d1">Your yard, only <span class="u">better<svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 14 C 50 4, 120 4, 197 10"/></svg></span>.</h1>
      <p class="lede reveal reveal-d2">${B.blurb}</p>
      <div class="actions reveal reveal-d3">
        <a class="btn" href="#contact">Get a free quote</a>
        <a class="btn btn-ghost" href="tel:${phone()}">Call ${C.phone}</a>
      </div>
    </div>
    <div class="hero-art reveal reveal-d2" aria-hidden="true">
      <img class="p1" src="${src("photos/pairs/02-overgrown-side-path-before.jpg")}" alt="">
      <img class="p2" src="${src("photos/pairs/02-overgrown-side-path-after.jpg")}" alt="">
      <span class="sticker s1">Before</span>
      <span class="sticker s2">After!</span>
      <svg class="arrow" viewBox="0 0 120 80"><path d="M8 20 C 40 0, 90 10, 104 54"/><path d="M90 46 L104 58 L112 40"/></svg>
    </div>
  </section>

  <ul class="promises wrap" role="list">${G.promises.map((p, i) => html`<li class="reveal reveal-d${i}"><strong>${p.title}</strong><span>${p.text}</span></li>`)}</ul>

  <section id="makeovers" class="makeovers">
    ${wave("w-top")}
    <div class="band">
      <div class="wrap">
        <div class="head reveal"><h2>Tap a yard to see the magic</h2><p>Every one of these is a real job. Tap (or click) a photo to flip between before and after.</p></div>
        <div class="flips">${G.pairs.map((p, i) => html`<article class="reveal reveal-d${i % 3}" style="--tilt:${[-1.5, 1, -0.5, 1.5, -1, 0.5][i % 6]}deg">
          ${flip(p)}<h3>${p.title}</h3><p>${p.text}</p></article>`)}</div>
      </div>
    </div>
    ${wave("w-bot", true)}
  </section>

  <section id="services" class="services wrap">
    <div class="head reveal"><h2>Stuff we're good at</h2></div>
    <div class="tiles">${G.services.map((s, i) => html`<article class="tile t${i % 3} reveal reveal-d${i % 3}">
      <img src="${src(s.photo)}" alt="" loading="lazy">
      <h3>${s.name}</h3><p>${s.text}</p>
      <a href="#contact" data-enquire="${s.name}">Ask us about it</a></article>`)}</div>
  </section>

  <section id="how" class="how wrap">
    <div class="head reveal"><h2>Easy as 1, 2, 3, 4</h2></div>
    <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span class="num">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
  </section>

  <section class="strip" aria-label="Finished jobs">
    <div class="wrap head reveal"><h2>Fresh off the tools</h2></div>
    <div class="scroller">${G.photos.map((p, n) => html`<button data-photo="${n}" style="--tilt:${n % 2 ? 1.5 : -1.5}deg"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
  </section>

  <section id="contact" class="contact wrap">
    <div class="card reveal">
      <div class="contact-copy">
        <h2>Let's make your yard the nice one on the street.</h2>
        <p>Tell us what you've got and what you'd love. We'll pop round for a free look and a fixed quote.</p>
        <ul role="list">
          <li><span>Call</span><a href="tel:${phone()}">${C.phone}</a></li>
          <li><span>Hours</span>${C.hours}</li>
          <li><span>Facebook</span><a href="${C.facebook}" target="_blank" rel="noopener">Message us ↗</a></li>
        </ul>
      </div>
      ${quoteForm({ button: "btn btn-sun" })}
    </div>
  </section>
</main>

<footer class="foot wrap">
  <img src="${src("logo-olive.png")}" alt="">
  <p>© <span data-year></span> ${B.name} ${B.trade} · Made with dirt under the nails.</p>
</footer>`;
  },
});

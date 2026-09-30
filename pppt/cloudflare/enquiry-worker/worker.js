/* Receives the website's enquiry form and emails it to the studio.
   Runs as a Cloudflare Worker on /api/enquiry, alongside the static Pages
   site. Pages Functions can't use the send_email binding, hence a Worker.

   Settings (set with `wrangler secret put <NAME>`, never committed):
     ENQUIRY_TO        verified Email Routing destination (the studio inbox)
     ENQUIRY_FROM      sender on the domain, e.g. website@<domain>
     TURNSTILE_SECRET  Turnstile secret key; if unset, the check is skipped
*/

const MAX = { name: 100, phone: 40, email: 200, interest: 100, length: 40, message: 3000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reply = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});

// One line, no control characters: keeps user input out of mail headers.
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return reply(405, { ok: false, error: "method" });

    // Only accept posts from the site itself.
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) return reply(403, { ok: false, error: "origin" });

    let form;
    try { form = await request.formData(); } catch { return reply(400, { ok: false, error: "body" }); }

    // Honeypot: people never see this field, bots fill it. Pretend it worked.
    if (form.get("_gotcha")) return reply(200, { ok: true });

    if (env.TURNSTILE_SECRET) {
      const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: form.get("cf-turnstile-response") || "",
          remoteip: request.headers.get("cf-connecting-ip") || "",
        }),
      }).then((r) => r.json()).catch(() => ({ success: false }));
      if (!check.success) return reply(400, { ok: false, error: "captcha" });
    }

    const f = Object.fromEntries(Object.keys(MAX).map((k) => [k, clean(form.get(k), MAX[k])]));
    // The message keeps its line breaks; it only goes in the body.
    f.message = String(form.get("message") ?? "").slice(0, MAX.message).trim();
    if (!f.name || !EMAIL_RE.test(f.email)) return reply(400, { ok: false, error: "fields" });

    const text = [
      `Name:        ${f.name}`,
      `Email:       ${f.email}`,
      `Phone:       ${f.phone || "-"}`,
      `Interested:  ${f.interest || "-"}`,
      `Length:      ${f.length || "-"}`,
      "",
      f.message || "(no message)",
      "",
      "Sent from the website enquiry form. Reply to this email to answer them directly.",
    ].join("\n");

    try {
      await env.EMAIL.send({
        to: env.ENQUIRY_TO,
        from: env.ENQUIRY_FROM,
        replyTo: f.email,
        subject: `Website enquiry: ${f.interest || "General"} (${f.name})`,
        text,
      });
    } catch (err) {
      console.error("send failed", err);
      return reply(502, { ok: false, error: "send" });
    }
    return reply(200, { ok: true });
  },
};

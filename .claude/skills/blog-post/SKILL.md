---
name: blog-post
description: Write and publish a blog post (conversation-format markdown + index entry). Use when adding, editing, or drafting a post for the site's chat-style blog.
---

# Adding a blog post

Posts render as chat conversations in the Blog app.

## Steps

1. **Write** `posts/YYYY-MM-DD-slug.md`. A line starting with `@handle `
   begins a message from that handle; following lines continue it until the
   next `@handle` line. Markdown incl. code fences works inside messages.
   `@aaron` gets the site avatar; other handles get deterministic colours.
   Read an existing post first to match the voice (e.g. the Boomi ones for
   technical posts, Platform Diaries for work stories).
2. **Index**: add an entry to `posts/index.js` — `slug` (filename minus
   `.md`), `title`, `date`, `summary`, `tags` (drive the topic rail; reuse
   existing tags where sensible), optional `pinned: true`.
3. **Anonymise (hard rule 6)**: work posts must contain no employer,
   customer, or product-of-employer names — sector descriptors only — and no
   email addresses. Grep the new file before committing.
4. **Cache-buster**: `posts/index.js` is versioned — bump `?v=` in
   `index.html` (see the `deploy` skill).
5. **Verify**: deep links must work — `#blog/<tag>` and
   `#blog/post/<slug>` (hyphens stand in for spaces in tags). Conversations
   open scrolled to TOP by design.

Timestamps shown on messages are fake-but-stable (derived from slug hash) —
don't try to make them real. Visitor comments are local-only by design.

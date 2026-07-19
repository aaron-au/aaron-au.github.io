---
name: deploy
description: Ship changes to GitHub Pages — cache-buster bump, sensitivity sweep, commit, push, CDN verification. Use whenever committing or pushing this site, or when asked to "deploy", "ship", or "push".
---

# Deploy checklist

Run these in order. Steps 1–2 are the two mistakes that have actually
bitten this project; don't skip them because the change "is tiny".

## 1. Cache-buster (hard rule 1)

If any local JS/CSS changed (`js/`, `css/`, `posts/index.js`), bump the
shared version string in `index.html`:

```sh
git diff --name-only HEAD | grep -qE '^(js|css)/|^posts/index\.js' && echo "BUMP NEEDED"
grep -o 'v=[0-9a-z]*' index.html | sort -u   # current value — must be exactly ONE
```

Find-and-replace the whole `?v=YYYYMMDDx` token (date + letter suffix,
increment the letter for same-day changes). All script/link tags share one
value — after the edit, the `sort -u` above must still print a single token.
A pre-commit hook (`.githooks/pre-commit`) backstops this; if it fires,
bump rather than `--no-verify`.

`vendor/` files are not versioned — leave them alone.

## 2. Sensitivity sweep (hard rule 6)

For any new/changed prose (posts, résumé, blog, HTML copy):

- No employer/customer/product names — sector descriptors only ("a national
  technology consultancy"). Re-read the diff for proper nouns.
- No email addresses anywhere: `git diff HEAD | grep -iE '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]'`
  must return nothing (Contact is LinkedIn + GitHub only).

## 3. Verify in a browser first

Invoke the `verify` skill — never push an unverified UI change.

## 4. Commit and push

- `git config user.email` must be the GitHub noreply address
  (`*@users.noreply.github.com`) — if not, stop and say so.
- Commit, then `git push origin main`. The remote already uses the
  `github-personal` SSH alias; if auth fails, do NOT switch keys — the
  default key is a different GitHub account.

## 5. Confirm the deploy landed

GitHub Pages CDN caches ~10 min. Check with a cache-defeating query:

```sh
curl -s "https://aaron-au.github.io/?fresh=$RANDOM" | grep -o 'v=[0-9a-z]*' | sort -u
```

Repeat until it shows the new version string. Do not add a CNAME file —
DNS for aaronlees.id.au isn't ready (it would break the github.io URL).

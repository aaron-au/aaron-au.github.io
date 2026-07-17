@aaron Season finale. Today the platform grew a tailnet — and the feature fought back for ten straight commits.
@RouterGoBrrr what's the tailnet for
@aaron Support access. Customer AKS API servers are private, as they should be. But "private" and "the platform team can help you at 2am" are in tension. A Tailscale exit-node pod inside the management cluster gives engineers a clean, audited path to customer control planes without punching permanent holes anywhere.
@sre_disaster ten commits though
@aaron A gauntlet of small indignities: provider lock-file hashes for the wrong architecture, OIDC federated credentials, importing a pre-existing Key Vault secret, and my favourite — the auth key description contained *parentheses*, which something in the chain silently hated. Ten fixes, one day, all boring, all real.
@k8s_karen so where does the whole thing stand now, five months in?
@aaron Numbers first: three repos born in one February week, a couple of thousand commits, one author for most of it. Every customer cluster running from **one set of ApplicationSets** selected by cluster labels — onboarding a customer is an API call that becomes a PR that becomes a cluster. No hand-forked YAML anywhere.
@aaron A request pipeline where the reviewed Terraform plan is checksummed, so what a human approved is *exactly* what gets applied. Secrets in Key Vault synced by ESO. Kyverno, Falco and Trivy watching everything — deliberately in audit mode all these months, with the enforce switch-over prepped this very week.
@yaml_wrangler audit-then-enforce is the responsible-adult version of security
@aaron You run the policies silent, tune out the false positives against real workloads, and only then let them block. Enforce-day should be an anticlimax. That's next season's opener, presumably.
@pipes_and_dreams looking back at the empty ArgoCD folder from february —
@aaron The folder kept its promise. v2 taught us what the platform needed to be; v3 is just v2 with the lessons applied and the Octopus given a respectful burial at sea.
@sre_disaster and the eleven state files?
@aaron One. It's one file now. Some victories you frame; this one I just open occasionally, look at, and close again, like a photo of a war you won.

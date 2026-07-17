@aaron DR week. The problem that ate June: how do you guarantee that a disaster-recovery region never runs at the same time as production?
@sre_disaster the dreaded split-brain
@aaron Two regions both convinced they're the real one, both running the same integration runtimes, both processing the same messages. For an integration platform that's not an outage — that's *duplicate financial transactions*. An outage would be kinder.
@k8s_karen so what's the fence?
@aaron Layers. The DR workloads sit at replicas-zero at rest. NSG guards on top. And the piece I'm proudest of: an **active-region init gate** — an init container on the Boomi runtime that checks whether its region is actually the active one, and simply refuses to let the pod start if it isn't. Even if everything above it fails and both regions scale up, the pods themselves won't come up in the passive region.
@yaml_wrangler defence in depth where the last layer is the workload telling itself no
@aaron The failover also got rewritten this week, and here's the uncomfortable part: the first version was GitOps-driven, and we replaced it with an **imperative** script. Commit: "imperative failover/failback (no Git/Argo)."
@k8s_karen the GitOps guy wrote an imperative failover?? 
@aaron The GitOps guy learned that when a region is on fire, you do not want your recovery path to depend on a git commit propagating through a sync loop. Reconciliation is for steady state. Failover is a break-glass procedure — it should be a script you can run with shaking hands.
@sre_disaster any other scars from that week
@aaron The test-run fixes tell the story: health-check loops that false-failed under `set -e` the moment pods became ready, scale-up counts sourced from the wrong environment's config… every one found in drills, not disasters. That's the entire point of drills.
@pipes_and_dreams "a script you can run with shaking hands" is the best definition of DR tooling I've heard
@aaron Design for the worst day, not the demo.

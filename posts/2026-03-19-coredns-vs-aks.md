@aaron Today's discovery: AKS managed CoreDNS will let you *add* DNS config, but it will not let you globally override the default upstream DNS servers. That's the managed part of managed Kubernetes: they manage it, you cope.
@RouterGoBrrr why do you even need to override upstream DNS
@aaron Customers. Their Boomi runtimes talk to on-prem systems through VPNs, and on-prem hostnames only resolve against *their* DNS servers. Every customer cluster needs different conditional resolution.
@yaml_wrangler so what did the workaround end up being
@aaron A custom CoreDNS config generated per customer, plus a post-sync hook that restarts CoreDNS after Argo applies it — because the config loads at startup and nothing rereads it for you.
@k8s_karen a restart hook feels illegal in gitops
@aaron It's GitOps with an asterisk. The desired state is in git; the hook just persuades the running pods to notice. I've made my peace with it.
@aaron The bigger pattern here: this was the month of finding out where AKS's edges are. The same weeks produced VPN IKE policy tuning, dead-peer-detection timers, and the discovery that some cert-manager versions just don't propagate global tolerations.
@sre_disaster "finding the edges" is a nice way to say "filing the platform down with your face"
@aaron The face heals. The generator script is forever.
@pipes_and_dreams does the per-customer DNS config get hand-written?
@aaron Nothing gets hand-written. The customer request pipeline generates it from the same payload that builds their cluster. Hand-written per-customer YAML is how v2 happened, and we do not speak of v2.

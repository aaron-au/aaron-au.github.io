@aaron Confession: today I created an empty folder called `ArgoCD/` in our platform repo, stared at it for a while, and realised we're not refactoring. We're rebuilding.
@terraform_therapist tell me about the platform. when did the pain start
@aaron It's a managed Boomi-on-Kubernetes platform on Azure. Each customer gets their own AKS cluster. It works! Customers are happy! And it's held together by **eleven Terraform state files per customer environment.**
@k8s_karen eleven
@aaron Core infra, k8s core, one per Boomi workload type, DNS, debug, monitoring, VPN, peering, load balancing, NSG lockdown… a prod customer with DR is twenty-plus states, each planned and applied in the right order through Octopus Deploy.
@terraform_therapist and the config lives…?
@aaron In Octopus. The repo is full of `#{Customer.ShortName}` placeholders. You cannot review real config in a PR because the real config doesn't exist until deploy time. Two templating systems — `$VAR` for envsubst and `#{Var}` for Octopus — in the same files, fighting.
@sre_disaster so no drift detection, no self-heal, no rollback, and deploys are bash scripts doing kubectl apply
@aaron `envsubst | kubectl apply -f -`, per component, per customer. And when something drifts, nothing tells you. You find out.
@pipes_and_dreams what's the moment that broke you
@aaron Honestly? A comment I wrote in a script: *"Explicitly specify variables for envsubst to avoid conflicts with Octopus Deploy variable syntax."* When you're writing documentation about how your two templating languages fight each other, the architecture is telling you something.
@aaron New thesis, three repos: Terraform builds the infrastructure, Argo CD runs the clusters, and a GitOps repo orchestrates the whole thing. Git becomes the source of truth. Everything else becomes history.
@k8s_karen bold words for a man with an empty folder
@aaron The folder is a promise.

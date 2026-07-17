@aaron The scariest command in Terraform isn't destroy. It's `terraform state mv` on infrastructure that has paying customers on it.
@terraform_therapist this is the great state consolidation?
@aaron Eleven-plus state files per customer environment in v2, all merging into one flat state per customer-environment in v3. While everything keeps running. Nobody notices, or I've failed.
@k8s_karen how do you even approach that without a change freeze
@aaron Like surgery. Scripts, not hands. Pull each old state, `state mv` the resources into their new addresses, import anything that was never properly tracked, then run a plan and stare at it until it says **no changes**.
@aaron "No changes" is the whole game. A plan that wants to modify something means the state and reality disagree about a resource that is currently serving production traffic.
@terraform_therapist any casualties?
@aaron A weird historical scar survived on purpose: the state keys keep a `-v2` suffix from the old platform, because renaming a state file for aesthetics is how you turn a migration into an incident. The suffix is wrong and I love it. It's a fossil.
@sre_disaster what about the resources terraform never knew about
@aaron April 24th, commit: "Imported remaining resources… and other customers." Every platform has a drawer of resources someone clicked into existence. The migration was the excuse to finally inventory the drawer.
@pipes_and_dreams verdict?
@aaron Weeks of prep, migration scripts kept in the repo as evidence, and zero customer-visible events. The most boring possible outcome, achieved with maximum effort. That's infrastructure work in one sentence.

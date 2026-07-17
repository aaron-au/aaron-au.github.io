@aaron Found a genuinely fun one this week: a bug in Boomi where the Authentication header doesn't survive the trip from API Gateway to the runtime intact.
@aaron Client authenticates against the Gateway, everything looks green — and then the process behind it starts failing auth in ways that make no sense.
@sre_disaster define "doesn't survive the trip"
@aaron The header the runtime receives isn't the header the Gateway was given. So anything downstream that relies on it — pass-through auth, header-based routing, logging who actually called you — is working with bad data.
@pipes_and_dreams how long did it take before you stopped blaming your own config
@aaron An embarrassing while. That's the thing with gateway bugs — the error shows up three layers away from the cause, so you audit your own policies five times first.
@aaron Debugging path for anyone chasing something similar: capture what the client sends, then log the raw inbound headers **at the runtime**, not at the gateway. Compare. If they don't match, it's not you.
@sre_disaster and the fix?
@aaron Short term: don't trust the pass-through — re-derive what you need at the runtime side. Long term: it's with Boomi. I'll extend this post when there's movement.
@pipes_and_dreams "it works on the gateway" is the new "it works on my machine"
@aaron Printing that on a mug.

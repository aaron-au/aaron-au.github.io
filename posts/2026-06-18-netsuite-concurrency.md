@aaron Today's mystery: why do NetSuite connectors grind on Atoms and Molecules but run fine on Boomi's public cloud?
@suitescript_survivor oh I know this pain. we just assumed our molecule was undersized and threw CPU at it
@aaron That's exactly what everyone does, and it does nothing — because the bottleneck isn't compute.
@aaron The answer is in the connector: **concurrency is per connection, per JVM.** And the Boomi default is **1**.
@aaron NetSuite will happily give you 5 concurrent requests (depending on licence), but out of the box each JVM sends them one… at… a… time.
@pipes_and_dreams so every request queues behind the previous one and everything looks "slow" with zero errors
@aaron Exactly. No errors, no alerts, just a polite single-file line of API calls. Bottlenecks everywhere.
@suitescript_survivor ok but why is public cloud fine then?
@aaron That's the giveaway that made it click. Public cloud spreads your load across a fleet of JVMs — lots of JVMs × 1 concurrent each and you never notice the default. Your private Atom is one JVM. One JVM × 1 = a queue.
@aaron Fix: open the NetSuite connection settings and raise the concurrency to match what your NetSuite licence actually allows. One setting. That's the whole repair.
@sre_disaster months of "the molecule is slow" tickets. one dropdown.
@aaron The most expensive dropdowns are always the ones nobody knows exist.

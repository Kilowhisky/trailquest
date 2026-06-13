/**
 * AI-pre-generated quest copy (mocked game layer, decision D-010 / D-008).
 *
 * The narrative and prompts are fictional, but every PLACE NAME is real: Klondike
 * Bluffs, Baby Steps, EKG, Jurassic, and Tower Arch are genuine OSM/BLM names for
 * this trail system north of Moab. Generation prompts are documented in
 * docs/AI_USAGE.md. Photo prompts are anchored to real nearby features (D-012).
 */

export const briefingParagraphs: string[] = [
  "Welcome to the Klondike Bluffs, ranger. North of Moab the BLM singletrack winds up through slickrock and sand toward the western edge of Arches National Park — and that boundary is exactly where today's run gets interesting.",
  'Discover and check in at five waypoints along the Klondike Bluffs system — Jurassic, Baby Steps, EKG, and the rim trail above them. Checkpoints stay hidden until you get close, so explore: drag or click your marker to move, and a faint "?" resolves into a real waypoint once you cross its discovery radius.',
  'Stay access-aware. The trails you ride are open BLM land, but Tower Arch sits just over the line inside Arches — a national park where this kind of game has no business sending you. Walk up to the boundary if you like; you will not be checking in there.',
  'There is a cache hidden off-route, too. Finish clean, grab the photos, find the cache, and sign the posterboard on your way out.',
]

export const geocacheHint =
  'Rumor among Klondike regulars: a small cache is stashed off the main line between Baby Steps and the rim, within a stone’s throw of the trail. Wander the search circle to sniff it out.'

/** Per-checkpoint mocked copy. Photo prompts reference real, nearby named features. */
export const checkpointCopy: Record<string, { photoPrompt?: string; hint?: string }> = {
  'cp-jurassic': {
    hint: 'Where the Jurassic trail meets the loop — a low-key start on packed ground.',
  },
  'cp-babysteps': {
    hint: 'The mellow Baby Steps run; ease in before the rim climb.',
  },
  'cp-ekg': {
    hint: 'A high saddle on EKG with the Klondike Bluffs fins laid out around you.',
    photoPrompt: 'Frame the Klondike Bluffs fins from the EKG saddle.',
  },
  'cp-rim': {
    hint: 'The rim above the bluffs — the best vantage toward the park.',
    photoPrompt: 'Catch Tower Arch on the Arches skyline from the rim.',
  },
  'cp-tower-approach': {
    hint: 'As close to Tower Arch as the game will take you — the boundary is right there.',
    photoPrompt: 'Shoot the approach to Tower Arch, with the Arches line in frame.',
  },
  'wp-tower-arch': {
    hint: 'Tower Arch — inside Arches National Park (NPS). Check-in is blocked; this one is look, don’t touch.',
  },
}

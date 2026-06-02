# SECTOR ZERO — Card Art Generation Prompts
*Nano banana image generation prompts for all 90 unique card illustrations*
*Model: google/gemini-2.5-flash-image via OpenRouter*

---

## Card Frame Overlay Spec

The card art is a standalone illustration that fills the card face interior. The HTML/CSS renders the frame, edge values, name bar, tier badge, and ability tag on top of the art as an overlay. The generated image itself should contain NO text, NO numbers, NO UI elements.

### Card Face Dimensions
- Aspect ratio: **3:4 portrait** (e.g. 300×400px or 600×800px)
- Art fills 100% of the card face — no border built into the image
- Subject should occupy **80–90% of the frame**
- Dark space atmosphere fills the remainder

### HTML Card Frame Structure (rendered over art)
```
┌─[TIER BADGE top-right]────────────────────┐
│                                           │
│         [N EDGE VALUE — top center]       │
│                                           │
│  [W]     [RACE ART FILLS HERE]      [E]  │
│                                           │
│         [S EDGE VALUE — bottom center]    │
│                                           │
│  [POWER — large center]                   │
│  [CARD NAME — small below power]          │
│  [ABILITY TAG — bottom]                   │
└───────────────────────────────────────────┘
```
- Frame border color = race accent color
- Frame glow = race accent color at 20% opacity
- Edge values, power, and name all render in race accent color
- Background of card body = dark gradient (#090914 to #0d0d1e)

---

## Master Art Style Constants

Apply these to EVERY prompt across all 10 races:

```
Style anchors (append to every prompt):
cinematic sci-fi card illustration, dark void space background, painterly with hard-edge rendering,
subject occupies 80-90% of frame, dramatic volumetric lighting, no text, no UI elements, no humans.
```

Each race overrides: **palette, subject type, atmosphere, lighting style, and DO NOT list.**

---

## Race 1 — THE CRYSTALLIS

**Race Palette**: Icy blue-white (#a8d8ff), silver, prismatic internal glow, cold hard starlight
**Atmosphere**: Dark crystalline void, sharp geometric shadows, prismatic light refractions
**Style anchors**: Hard-edge geometric forms, perfect symmetry, faceted surfaces, cold metallic light, no organic curves
**DO NOT include**: Warm colors, organic shapes, haze, fog, humanoids, fire, rounded forms

---

**CRYSTAL CRADLE** · Crystallis / World
A living moon entirely encrusted in towering quartz lattice formations glowing from within, perfect crystalline geometry covering every surface, viewed from low orbit showing the curved horizon; icy blue-white and silver palette with prismatic internal white light pulsing through the crystal network, cold hard starlight casting razor shadows across faceted geometry. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 85% of frame. DO NOT: warm colors, organic shapes, haze, humanoids, fire.

---

**PRISM MOON** · Crystallis / World
A small shattered moon reassembling itself into a perfect geometric sphere of interlocking crystal plates, fragments of crystal hovering in concentric rings around the core, each fragment catching and refracting starlight into prismatic beams; silver and icy blue palette with blinding white prismatic scatter, cold precise lighting. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 85% of frame. DO NOT: warm tones, organic matter, clouds, humanoids.

---

**LATTICE ANCHOR** · Crystallis / World
A vast flat crystalline structure anchored in space, perfectly square lattice of interlocking geometric crystal beams extending in all four cardinal directions like a space station grown from a single seed crystal; silver with deep blue internal light, every intersection node glowing white, viewed from directly in front at slight perspective angle. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 85% of frame. DO NOT: curves, organic material, warm light, humanoids.

---

**REFRACTION ARRAY** · Crystallis / Fleet
A formation of three crystalline warships flying in perfect triangular formation, each ship a long geometric prism with faceted hull panels deflecting incoming light, trailing prismatic rainbow scatter in their wake; cold white-blue hull color with silver edge highlights, prismatic light scattering behind them. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 80% of frame. DO NOT: organic hull shapes, warm colors, humanoids, exhaust trails.

---

**SHARD FORMATION** · Crystallis / Fleet
A wide angular warship built like a flying crystal shard, faceted flat hull panels reflecting starlight like a mirror, a single brilliant blue-white internal reactor visible through the transparent crystal forward hull; silver and icy blue palette, extremely hard geometric angles, no curves anywhere. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 80% of frame. DO NOT: rounded hull, organic forms, warm tones, fire or heat.

---

**PRISMATIC WING** · Crystallis / Fleet
A crystalline fighter with enormous swept-back wing panels each faceted like a gemstone, the wingspan wider than the fuselage is long, refracting starlight into twelve distinct beams; pale blue and white with silver structural lines, dramatic cold sidelight. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 80% of frame. DO NOT: engines with fire, organic curves, warm palette, humanoids.

---

**SHARD LANCE** · Crystallis / Fighter
A single razor-sharp crystalline fighter, extremely elongated and narrow — almost a flying spike — with a forward geometry that tapers to a single atomic point, viewed from the side showing its terrifying profile; silver-white with a blue forward glow like a contained energy tip, motion blur behind it. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 80% of frame. DO NOT: rounded shapes, warm colors, fire, humanoids.

---

**CRYSTAL SEEKER** · Crystallis / Fighter
A crystalline scout fighter with an oversized eastern-facing wing array designed like a directional antenna array of sharp crystal rods, the right side of the ship dramatically larger than the left as if built to strike in one direction; icy white-blue asymmetric silhouette with prismatic edge glow. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject 80% of frame. DO NOT: symmetric design, warm tones, organic forms, humanoids.

---

**THE MONOLITH** · Crystallis / Dreadnaught
An impossibly massive crystal dreadnaught — a perfect geometric rectangular monolith the size of a small moon, its every surface covered in interlocking lattice detail, surrounded by smaller crystal escort formations that seem to grow from its hull; deep shadow on one face, blinding cold white light on the other, creating maximum contrast; silver-blue-white palette, overwhelming scale communicated by tiny star reflections. Cinematic sci-fi card illustration, dark void background, painterly hard-edge rendering, subject fills frame edge to edge. DO NOT: organic shapes, warm palette, rounded forms, humanoids, fire.

---

## Race 2 — THE MYCOS DRIFT

**Race Palette**: Bioluminescent purple-green (#9dcf6e), deep violet void, amber spore glow, glowing filament networks
**Atmosphere**: Dark organic space filled with drifting spore clouds and glowing hyphal threads
**Style anchors**: Organic flowing forms, bioluminescent glow, filament networks, spore clusters, mold-bloom textures
**DO NOT include**: Hard geometric shapes, metallic surfaces, mechanical components, clean lines, crystals

---

**BLOOM PLANET** · Mycos / Bloom World
A planet entirely blanketed in living fungal mycelium visible from orbit, the surface covered in vast bioluminescent bloom networks pulsing with green-purple light, enormous fruiting bodies rising from the continents like mountain ranges; deep violet atmosphere with amber-green bioluminescent light from below, spore clouds forming thin rings around the equator. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 85% of frame. DO NOT: rock surfaces, metallic structures, geometric shapes, cold blue tones.

---

**SPORE CRADLE** · Mycos / Bloom World
A dense sphere of compacted spore material — a world-seed — suspended in space, trailing long bioluminescent filament tendrils in all directions like a dandelion the size of a moon, softly glowing amber and green from within; deep purple void background, the tendrils catching the faint light of distant stars. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 85% of frame. DO NOT: hard edges, mechanical parts, cold blue palette, crystals.

---

**MYCEL ANCHOR** · Mycos / Bloom World
A thick knot of interwoven fungal root structures anchored in space, resembling an enormous neural ganglion of glowing hyphal threads connecting to four radiating networks extending off-frame in cardinal directions; bioluminescent green-white threads on a deep purple-black void, the center node pulsing amber. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 85% of frame. DO NOT: metallic components, geometric structure, cold light, mechanical design.

---

**TENDRIL SHIP** · Mycos / Tendril Mass
An organic ship grown from living fungal material — a cluster of thick mycelium stalks bound together like a bundle of roots, with bioluminescent spore sacs along its body, trailing a glowing amber-green spore cloud in its wake; the hull is literally made of living material with visible growth patterns and surface texture of bark-like mycelium. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 80% of frame. DO NOT: metal plating, hard angles, mechanical engines, cold palette.

---

**HYPHAL CLUSTER** · Mycos / Tendril Mass
A mid-sized fungal fleet vessel formed from an enormous dense mycelium ball with hyphal threads extending in all directions like antenna-roots, moving through space by releasing directional spore jets; bioluminescent green-purple with amber spore jets at the rear, glowing thread network visible through semi-translucent body. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 80% of frame. DO NOT: metallic hull, geometric ship profile, cold tones, mechanical components.

---

**BLOOM CARRIER** · Mycos / Tendril Mass
A broad flat fungal vessel shaped like a massive gill-underside of a mushroom cap, its surface covered in spore-releasing pore structures, slowly dispersing a dense green spore cloud that billows ahead of it; deep purple-violet ship body with bioluminescent green spore cloud, amber pulse-light from the center. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 80% of frame. DO NOT: hard metal, geometric hull, cold blue, mechanical design.

---

**SPORE CLOUD** · Mycos / Spore Burst
A fast-moving concentrated spore projectile — a dense glowing sphere of compressed corrosive spores hurtling through space, trailing a dispersing amber-green cloud behind it, smaller satellite spore clusters orbiting the main mass; bright amber-green corrosive glow at the leading edge, dark void. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 80% of frame. DO NOT: mechanical casing, hard geometry, cold tones, metallic surface.

---

**CORDYCEPS LANCE** · Mycos / Spore Burst
A narrow aggressive fungal fighter shaped like a single massive cordyceps mushroom growing at speed — the stalk body forms the fuselage, the cap at the front is a spore-burst delivery system; bioluminescent amber-orange spore cap at the forward tip, dark green stalk body, spore exhaust trailing behind. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject 80% of frame. DO NOT: metal hull, geometric design, cold blue, mechanical engines.

---

**THE FRUITING BODY** · Mycos / Fruiting Body
An enormous dreadnaught-scale fungal growth that defies the concept of a ship — a vast fruiting body the size of a small moon, with dozens of enormous mushroom caps extending from a central trunk structure, each cap releasing cascading spore clouds; bioluminescent purple-green glow from every surface, amber spore rivers flowing off the cap edges, dark void filled with its spore field. Cinematic sci-fi card illustration, dark void background, painterly organic rendering, subject fills frame edge to edge. DO NOT: mechanical parts, geometric shapes, metallic surfaces, cold blue, clean lines.

---

## Race 3 — THE VEIL

**Race Palette**: Warm gold-white (#fff5a0), spectral interference bands, pale light halos, waveform patterns
**Atmosphere**: Near-invisible presence, light diffraction, interference patterns, barely-there forms
**Style anchors**: Light-based abstract forms, waveform visualization, spectral banding, translucency, interference fringes
**DO NOT include**: Solid physical forms, mechanical structures, dark organic matter, heavy shadows, opaque surfaces

---

**RESONANCE NODE** · The Veil / Node
A point in space where two light beams cross and create a visible interference pattern — the node appears as a complex geometric light-web, concentric rings of constructive and destructive interference radiating outward like a ripple frozen in time; warm gold-white palette with spectral color banding at interference edges, deep black space behind. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 85% of frame. DO NOT: solid physical objects, mechanical structures, dark matter, opaque surfaces.

---

**FOCAL POINT** · The Veil / Node
A singular point of extreme light concentration — barely visible as a location but betrayed by the intense lens-flare halo surrounding it, eight beams radiating outward from a near-invisible center, the edges of each beam showing spectral color decomposition; gold-white with warm spectral rainbow at beam edges, darkness surrounding. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 85% of frame. DO NOT: solid hulls, mechanical parts, organic matter, cold palette.

---

**LIGHT ANCHOR** · The Veil / Node
An anchor-point in space visible only as a standing wave pattern — a three-dimensional interference grid of gold-white light threads stretched between four invisible anchor points, the grid pulsing slowly like a breathing membrane; warm white with subtle spectral iridescence where threads cross, deep black void. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 85% of frame. DO NOT: solid forms, metal, organic matter, hard shadows.

---

**PHASE ARRAY** · The Veil / Array
A formation of light-entity warships visible only as seven overlapping lens-halo forms flying in close formation, each ship a teardrop of coherent light with interference rings radiating outward, the formation creating a complex interlocking interference pattern; warm gold palette with white-hot centers, spectral banding at halo edges. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 80% of frame. DO NOT: solid hulls, metal, organic forms, cold tones, hard edges.

---

**INTERFERENCE FIELD** · The Veil / Array
A cloaking interference pattern — a large region of space where two opposing waveforms have created a near-perfect null zone, visible only as a subtle shimmer and the faint ghost-outline of something large hiding within it; mostly dark with barely-visible gold light shimmer, the edges of the hidden form catching and bending light like a heat mirage. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 80% of frame. DO NOT: visible solid ship, hard outlines, mechanical parts.

---

**HARMONIC LENS** · The Veil / Array
A lens-shaped region of coherent light — a Veil command vessel that appears as a perfect ellipse of focused light, its interior showing a complex ordered wave pattern like a diffraction grating, the forward tip focusing all light into a single directed beam; warm gold-white with sharp focused beam extending forward, standing wave pattern clearly visible inside the lens form. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 80% of frame. DO NOT: solid physical structure, metal, organic matter, cold palette.

---

**COHERENCE SPIKE** · The Veil / Spike
An aggressive Veil fighter — a single laser-narrow coherent light spike of extreme intensity, nearly just a line of gold-white light but visible for its extreme brightness and the spectral banding at its leading point; almost entirely vertical in composition, the forward tip burning white-hot and fading to warm gold behind, speed-lines of light trailing. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 80% of frame. DO NOT: solid physical object, mechanical casing, organic forms.

---

**REFRACTED BLADE** · The Veil / Spike
A Veil fighter oriented horizontally — a blade of coherent light with extreme width and minimal height, the entire form a flat prism that splits light into a spectral fan visible at its trailing edge; intense warm white center fading through gold to rainbow spectral decomposition at the far edges, almost invisible to enemies approaching from the front. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject 80% of frame. DO NOT: solid hull, opaque surfaces, mechanical parts, cold palette.

---

**THE CONVERGENCE** · The Veil / Convergence
All of The Veil's light converging into a single impossible point — dozens of beams from off-frame converging to a central node of blinding white intensity, the point surrounded by concentric spectral interference rings growing to fill the frame; pure blinding white at center fading through gold to spectral rainbow rings at the outer edge, the convergence point itself too bright to look at directly. Cinematic sci-fi card illustration, dark void background, painterly translucent rendering, subject fills entire frame. DO NOT: solid form, mechanical structure, organic matter, cold tones.

---

## Race 4 — THE ENTROPY CULT

**Race Palette**: Oxidized amber-brown (#c4723a), corroded copper-green, rust red, smoldering ember glow
**Atmosphere**: Beautiful decay, magnificent ruins, ancient corroded magnificence, slow-burning embers
**Style anchors**: Oxidized metal textures, corrosion patina, crumbling grandeur, ember glow from within, aged surface detail
**DO NOT include**: Clean shiny metal, pristine surfaces, cold blue tones, new construction, crystal or crystal-adjacent

---

**DYING STAR** · Entropy Cult / Dying Star
A star mid-collapse — a red giant in its final centuries, its outer layers expanding and fragmenting into long orange-red filaments that trail away from the shrinking core, the surface boiling with massive convection cells visible from the outside; deep amber-orange palette with ember-red core glow, dark rust-red atmosphere, gorgeous and terminal. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: bright clean light, blue tones, pristine surfaces, cold palette.

---

**RUST ANCHOR** · Entropy Cult / Dying Star
A once-magnificent space station now completely consumed by corrosion — its original geometric form barely visible beneath centuries of oxidized patina, vast copper-green and rust-red corrosion blooms covering every surface, still somehow functional; amber ember glow from interior windows showing it still operates despite total surface decay; warm amber-brown palette with copper-green corrosion highlights. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: clean metal, new construction, cold blue, crystal.

---

**ENTROPY GATE** · Entropy Cult / Dying Star
An ancient gate structure — once a jump gate or portal — now half-collapsed, its ring partially broken and drifting apart in slow motion, the inside still showing a faint amber portal glow through the decay, oxidized hull panels peeling away in layers of rust; warm amber-brown with copper-green corrosion and ember glow at the center remnant. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: intact pristine structure, cold light, clean lines, new metal.

---

**RUST ARMADA** · Entropy Cult / Rust Armada
A fleet of ancient corroded warships flying in formation despite their decay — their hulls entirely consumed by beautiful amber-brown rust patina with copper-green corrosion columns, yet flying with absolute purpose; ember glow from their still-functioning engines the only light in an otherwise dark amber-rust palette. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: clean hulls, new metal, cold blue, pristine surfaces.

---

**OXIDIZED FLEET** · Entropy Cult / Rust Armada
A single large Entropy warship, its hull a stunning tapestry of decay — layers of oxidization building up over millennia into a geological-thick patina of copper green, amber brown, and deep rust red, the hull almost entirely consumed yet the ship moving; massive and slow, trailing flakes of oxidized hull behind it; warm palette saturated with earth tones of rust. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: new metal, clean hull, cold colors, crystal.

---

**COLLAPSE ENGINE** · Entropy Cult / Rust Armada
An Entropy weapon vessel shaped around a controlled collapse — a ship whose forward section is actively imploding inward toward a gravity point, the hull crumpling beautifully in slow motion, amber light pouring out of the structural fractures; rust-brown hull peeling back to reveal ember-orange interior light, the collapse itself depicted as the weapon. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: intact uniform hull, clean surfaces, cold blue, crystal.

---

**DECAY SEEKER** · Entropy Cult / Decay Seeker
A fast narrow Entropy fighter shaped like a corroded spike — an aerodynamic form beneath its total rust coverage, the forward tip still relatively intact but trailing corrosion flakes behind it, the tip glowing amber from the speed of its passage; rust-brown and oxidized copper palette, ember trail behind, fast and purposeful despite its decay. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: clean metal, new construction, cold tones, pristine surfaces.

---

**ENTROPY BLADE** · Entropy Cult / Decay Seeker
An Entropy fighter shaped like a long corroded blade — horizontal orientation, extremely narrow top-to-bottom, its oxidized edge catching amber light along the dorsal line, the ventral side in deep shadow of corroded brown-black; beautiful side-lit portrait of decay-as-weapon, the blade edge still sharp beneath its corrosion. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: clean shiny blade, new metal, cold light, crystal forms.

---

**THE FINAL MASS** · Entropy Cult / Final Mass
A dreadnaught that appears to BE a black hole wearing a ship's silhouette — an enormous mass of collapsed matter surrounded by an accretion disk of rust-red debris spiraling inward, the ship's hull visible only as the outermost ring of this debris field; deep darkness at center with amber-rust accretion glow, utterly massive scale communicated by the debris ranging from ship-sized to moon-sized. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject fills frame. DO NOT: bright clean light, cold blue, clean metal, pristine structure.

---

## Race 5 — THE BROOD SOVEREIGN

**Race Palette**: Acid green-yellow (#88cc44), deep chitinous black, bioluminescent yellow-green accents
**Atmosphere**: Organic biomechanical horror, chitin and bone, nesting architecture, swarm density
**Style anchors**: Insectoid anatomy, chitinous exoskeleton textures, compound eyes, biomechanical fusion, swarm density
**DO NOT include**: Clean metal plating, geometric structures, warm amber, light or translucent forms, human-readable design

---

**HIVE NODE** · Brood Sovereign / Hive Node
A planetary surface entirely covered in vast geometric hive architecture — hexagonal cell structures built from chitinous secretion covering every continent, massive spire-towers reaching into the atmosphere, viewed from low orbit; deep black-green chitinous surface with acid yellow-green bioluminescent grid lines running between cells, the planet visibly alive and growing. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: metal construction, warm tones, clean surfaces, crystal, individual insects visible.

---

**QUEEN CRADLE** · Brood Sovereign / Hive Node
The birthing chamber of the Brood Sovereign — a colossal egg-shaped structure the size of a moon, its surface covered in layers of chitinous exoskeleton plates like overlapping scales, interior bioluminescent yellow-green light visible through translucent patches in the shell; deep black-green carapace with acid yellow glow from within, surrounded by smaller attendant structures. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: metal hull, geometric shape, warm light, crystal.

---

**BROOD ANCHOR** · Brood Sovereign / Hive Node
A massive chitinous anchor structure in space — a tangle of enormous organic tubes and struts made from hardened Brood secretion, connecting multiple hive-nodes like a space station grown rather than built; acid green bioluminescent light pulsing through the tube network, deep black carapace surface with yellow-green edge highlights. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: metal plating, geometric design, warm light, clean surfaces.

---

**WARRIOR CLUSTER** · Brood Sovereign / Warrior Cluster
A formation of hundreds of Brood soldier-ships flying in perfect synchronized formation — each ship a single warrior-organism, their individual forms suggesting insects but fused at the joints to form a larger super-organism shape; acid green-yellow bioluminescent markings across their black chitinous hulls, the formation creating an intimidating silhouette. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: metal ships, individual spacing, warm palette, geometric formation.

---

**SOLDIER MASS** · Brood Sovereign / Warrior Cluster
A single large Brood warship grown from fused soldier bodies — a biomechanical vessel whose hull is literally composed of thousands of armored Brood forms merged together, their individual limbs and carapace plates becoming hull panels and weapons; deep black-green biomechanical surface with yellow-green bioluminescent lines running between the fused bodies. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: clean hull, metal plating, geometric design, warm colors.

---

**BIOMECH FLEET** · Brood Sovereign / Warrior Cluster
Three Brood capital ships in close formation, each vessel shaped like an enormous flat-bodied insect — wide chitinous dorsal shell, multiple articulated hull-limbs extending laterally, compound visual-sensor arrays along the forward edge; deep black carapace with acid yellow-green bioluminescent crew-glow from ventral surface, flying in echelon formation. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: metal hull, geometric design, warm palette, clean surfaces.

---

**SKIMMER** · Brood Sovereign / Skimmer
A Brood fast-attack organism — a single long narrow insectoid fighter, its body like a dragonfly but in black chitinous armor plating, extremely fast-looking silhouette with swept compound wings locked back in a speed posture; acid yellow-green bioluminescent engine-glands at its rear thorax, forward claws extended, motion blur behind it. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: metal aircraft, warm tones, geometric design, clean surfaces.

---

**VOID SKIMMER** · Brood Sovereign / Skimmer
An ambush-specialist Brood organism — broader and flatter than the standard Skimmer, adapted for concealment with a dorsal surface that absorbs light and a ventral surface covered in active bioluminescent camouflage patterns; mostly dark and hard to see, with acid green bioluminescent patterns suddenly visible as it activates for attack, caught in the moment of ambush reveal. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: bright visible profile, metal, geometric design, warm tones.

---

**THE SOVEREIGN** · Brood Sovereign / Sovereign
The Queen herself — an enormous insectoid entity the size of a dreadnaught, her body an evolved architectural form of layered chitinous plates covering a massive biomechanical thorax and abdomen, attended by swarms of smaller warriors visible as a seething halo around her; deep black carapace with acid green-yellow bioluminescent throne-markings, her compound eyes the most intensely illuminated feature — multiple and vast; overwhelming sense of biological authority. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject fills frame. DO NOT: humanoid form, metal armor, warm palette, geometric design.

---

## Race 6 — THE VOID HUNTERS

**Race Palette**: Deep void-black, ultra-violet (#9b59b6), barely-visible dark silhouettes, light-absorption negative
**Atmosphere**: Near-total darkness, barely-there forms, light bending around invisible mass, negative space as subject
**Style anchors**: Silhouettes with minimal detail, forms defined by what they occlude rather than what they emit, dark matter aesthetic
**DO NOT include**: Bioluminescence, warm tones, detailed surface texture, visible mechanical components, bright colors

---

**SHADOW ANCHOR** · Void Hunters / Shadow Anchor
A mass of dark matter anchored in space — visible only as the absence of stars behind it, a roughly spherical void surrounded by subtly bent light that betrays its presence, the edges barely delineated by the faint violet shimmer of gravitational lensing; almost entirely black with ultra-violet edge-glow the only indicator of its boundary. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: warm tones, bioluminescence, visible surface texture, bright colors, detailed form.

---

**DARK MASS** · Void Hunters / Shadow Anchor
Two dark matter masses orbiting each other in tight binary formation — each a near-perfect absence of light, their gravitational interaction creating a spiral pattern of lensed starlight between them; deep black with ultra-violet gravitational lensing spiral visible between the two masses, the rest of the image nearly completely dark. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: visible surface detail, warm light, bioluminescence, detailed form.

---

**VOID GATE** · Void Hunters / Shadow Anchor
A Void Hunter portal structure — an aperture of pure darkness in the shape of an angular geometric void, visible only by the ring of ultra-violet lensed starlight bending around its edge, stars visible through it but distorted; almost entirely black composition with narrow violet ring being the main visual element, extreme minimalism. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 85% of frame. DO NOT: visible structural detail, warm tones, bioluminescence, complex surface.

---

**DARK RUNNER** · Void Hunters / Dark Runner
A Void Hunter warship visible only as a dark silhouette passing in front of a star field — its form suggested but not detailed, the edges barely visible where its hull bends light slightly, the forward section a sharp angular predator's profile; ultra-violet edge shimmer the only visible detail, the ship itself more absence than presence; fast movement implied by a slight elongation distortion. Cinematic sci-fi card illustration, dark starfield background with visible stars, painterly rendering, subject 80% of frame. DO NOT: warm colors, surface detail, bioluminescence, bright elements.

---

**NULL FLEET** · Void Hunters / Dark Runner
A formation of four Void Hunter vessels visible only as four dark cutouts passing in front of the Milky Way core — perfectly angular predator shapes, barely distinguishable from the void around them except for their precise geometric silhouettes; deep black forms against a slightly lighter star-dense background, ultra-violet edge shimmer at hull boundaries only. Cinematic sci-fi card illustration, star-field background, painterly rendering, subject 80% of frame. DO NOT: visible hull details, warm palette, bioluminescence, complex texture.

---

**ABSENCE WING** · Void Hunters / Dark Runner
A Void Hunter flanking vessel, its defining feature an enormous swept wing that extends sideways — visible as a wide black arc that blocks light, the wing tips showing subtle ultra-violet gravitational distortion where they interact with background light; aggressively horizontal composition, the wing spanning the full frame width. Cinematic sci-fi card illustration, star-field background, painterly rendering, subject 80% of frame. DO NOT: visible surface detail, warm palette, bioluminescence, complex markings.

---

**NULL BLADE** · Void Hunters / Null Blade
A Void Hunter attack fighter — an extremely narrow dark spike that appears almost two-dimensional in silhouette, moving directly toward the viewer from a forward-facing perspective, the tip barely glowing ultra-violet from the energy of its extreme velocity; almost completely black with a single ultra-violet forward glow the only feature, terrifying in its minimalism. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject 80% of frame. DO NOT: visible structural detail, warm light, bioluminescence, complex surface.

---

**VOID SPLINTER** · Void Hunters / Null Blade
A Void Hunter horizontal attack craft — a flat razor-thin silhouette seen from the side, its body so narrow it barely registers as an object rather than a line; ultra-violet trailing wake the only visible evidence of its passage, the craft itself almost pure black edge-on; extreme horizontal composition. Cinematic sci-fi card illustration, star-field background, painterly rendering, subject 80% of frame. DO NOT: warm colors, visible detail, bioluminescence, rounded forms.

---

**THE HUNGER** · Void Hunters / The Hunger
The apex Void Hunter dreadnaught — a dark mass so large it fills the frame as pure absence, the starfield behind it completely occluded, its form defined only by an ultra-violet gravitational lensing ring that traces its colossal silhouette; in the center of the composition a region so completely dark it seems to absorb light from the image itself — the edge defined by the violet ring is the only visual content. Cinematic sci-fi card illustration, dark void background, painterly rendering, subject fills entire frame. DO NOT: warm tones, surface detail, bioluminescence, visible structure, bright elements.

---

## Race 7 — THE GAS NOMADS

**Race Palette**: Electric gold-yellow (#ffd700), deep orange plasma, electric blue lightning, aurora green accents
**Atmosphere**: Swirling gas giant storms, ionized plasma, hurricane eye structures, atmospheric electric discharge
**Style anchors**: Atmospheric turbulence, storm bands, lightning discharge, plasma glow, no solid surfaces
**DO NOT include**: Hard mechanical shapes, solid hull plating, organic forms, cold blue as a primary tone, rock or crystal

---

**STORM PLANET** · Gas Nomads / Storm Planet
A gas giant viewed from close orbit — its surface a swirling system of horizontal storm bands in deep orange and gold, a massive hurricane eye visible in the northern hemisphere with electric lightning visible within it, the atmosphere glowing with ionized plasma energy; gold-orange primary palette with electric yellow-white lightning, deep purple gas bands at the poles. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 85% of frame. DO NOT: solid surface, metallic structures, rock, cold blue as primary.

---

**STORM CRADLE** · Gas Nomads / Storm Planet
A smaller gas world mid-formation — a sphere of pure swirling ionized gas not yet compressed into stable bands, crackling with constant lightning discharge across its entire surface, more electric storm than planet; gold-yellow palette dominated by electric discharge, the cloud interior lit from within by its own lightning, no stable features yet. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 85% of frame. DO NOT: solid ground, metallic parts, cold colors, rock.

---

**PLASMA ANCHOR** · Gas Nomads / Storm Planet
A sustained plasma storm formation used as a territorial anchor — a self-sustaining hurricane structure that has persisted without a planetary surface, a tornado of ionized gas with a stable eye at its center, anchored in space by its own magnetic field; brilliant gold-orange plasma whirl with electric blue lightning along its edges, the eye at center a perfect calm dark-violet circle. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 85% of frame. DO NOT: solid hull, rocky surface, mechanical structure, cold blue primary.

---

**TEMPEST WING** · Gas Nomads / Tempest Wing
A Gas Nomad fleet vessel that IS a contained atmospheric storm — a wing-shaped region of directed plasma storm, its form maintained by magnetic containment fields visible as faint blue lines, the interior a roiling gold-orange plasma tornado; the wing form suggested by the storm's shape, electric yellow discharge along the leading edge. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 80% of frame. DO NOT: solid hull, metal plating, hard edges, cold blue primary, rock or crystal.

---

**ARC FORMATION** · Gas Nomads / Tempest Wing
Three Gas Nomad vessel-storms flying in arcing formation, each a coherent plasma storm entity leaving a trail of electric discharge, their combined magnetic fields creating massive aurora-like light curtains between them; gold-orange central plasma with electric yellow and aurora green magnetic field displays, deep dark void background. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 80% of frame. DO NOT: solid hulls, metal, hard mechanical forms, cold primary colors.

---

**STORM FLEET** · Gas Nomads / Tempest Wing
A large Gas Nomad capital vessel — a broad atmospheric formation shaped like a storm system's overview, a full hurricane structure but directed and moving with purpose, its eye glowing gold-white with concentrated plasma, surrounded by high-speed rotation bands; warm gold-orange hurricane overhead view with electric discharge highlights. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 80% of frame. DO NOT: solid hull, metal, hard angles, cold blue primary.

---

**ARC NODE** · Gas Nomads / Arc Node
A Gas Nomad fast attack entity — a single bolt of directed plasma discharge given persistent form, resembling a sustained lightning bolt that has achieved self-locomotion, its front tip the brightest point and its body fading from electric yellow-white through gold to faint orange at the trailing end; intense electric energy, high velocity implied. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 80% of frame. DO NOT: solid body, metallic hull, organic form, cold blue primary.

---

**LIGHTNING SHARD** · Gas Nomads / Arc Node
An isolated Gas Nomad fighter — a single plasma entity shaped like a classical lightning bolt but vast in scale, the main discharge channel surrounded by secondary branching arcs, the bright point at its leading tip; predominantly electric gold-yellow with white-hot core, deep void surrounding, horizontal orientation with leading tip to the right. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject 80% of frame. DO NOT: solid casing, metallic body, organic forms, cold primary palette.

---

**THE GREAT STORM** · Gas Nomads / Great Storm
A gas giant that has BECOME a weapon — a planet-scale storm system that has evolved beyond weather into directed atmospheric warfare, a vast hurricane from which multiple directed plasma jets extend in cardinal directions, the entire planet's atmosphere now a single unified storm-organism; overwhelming gold-orange atmospheric expanse with electric blue-yellow discharge everywhere, dwarfing any other object in the composition. Cinematic sci-fi card illustration, dark void background, painterly atmospheric rendering, subject fills frame completely. DO NOT: solid ground, metallic structure, organic matter, cold blue as primary, visible mechanical components.

---

## Race 8 — THE LITHOS

**Race Palette**: Deep stone gray-brown (#a0896a), ancient ochre, carved rune amber glow, geological strata
**Atmosphere**: Immovable geological deep time, ancient carved stone floating in void, slow power
**Style anchors**: Stone and rock textures, geological strata banding, rune carvings glowing faintly, asteroid-scale rock forms
**DO NOT include**: Metal plating, organic matter, plasma or energy, light translucency, anything recently made

---

**ANCIENT CORE** · Lithos / Ancient Core
A perfect sphere of ancient stone floating in void — its surface layered in perfectly visible geological strata rings of different rock types, billions of years of compression visible as concentric bands of ochre, gray, and deep brown; dim starlight illuminating the textured surface from one side, ancient beyond comprehension; no atmosphere, no features — just pure ancient rock. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 85% of frame. DO NOT: metal, organic matter, energy effects, modern construction, atmospheric haze.

---

**STONE CRADLE** · Lithos / Ancient Core
An ancient natural formation of two enormous rock masses that have been orbiting each other for so long they have settled into a stable touching configuration, their surfaces showing billions of years of tidal stress marks and geological deformation; deep stone gray with ochre mineral striations, viewed at slight angle showing both the touching point and the depth of each mass. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 85% of frame. DO NOT: metallic surface, organic shapes, energy, manufactured appearance.

---

**BEDROCK ANCHOR** · Lithos / Ancient Core
A flat slab of impossibly ancient bedrock floating in space — its top and bottom faces showing geological strata banding, the edges showing the vertical cross-section of a world's deep crust, faintly glowing amber rune-carvings just visible on one face; ochre and deep gray palette with amber rune glow, viewed from a slight angle showing both the face and edge. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 85% of frame. DO NOT: metal, organic matter, energy effects, manufactured appearance.

---

**DRIFTING MASS** · Lithos / Drifting Mass
A shaped asteroid that has been slowly carved by geological processes over eons into a form suggesting intentionality without any evidence of tool use — a smooth-worn ovoid of dense stone with deep impact craters and geological striations giving it character; ochre-gray stone with dark shadow on one half, amber rune markings barely visible on the facing side. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 80% of frame. DO NOT: metal hull, organic forms, energy effects, modern tools marks.

---

**CARVED STONE** · Lithos / Drifting Mass
An enormous stone vessel that appears to have been shaped over geological time — not carved by tools but slowly worn by forces beyond comprehension into a flat wedge form suggesting a ship profile, its entire surface covered in natural geological striations that accidentally resemble carved design; deep gray-brown rock with amber mineral glow along major striations, ancient beyond measurement. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 80% of frame. DO NOT: obvious tool marks, metal, organic forms, energy, new-looking material.

---

**TECTONIC FLEET** · Lithos / Drifting Mass
Three massive stone asteroids flying in slow deliberate formation, each a different shape suggesting different geological origins, their surfaces showing the deep age of the Lithos people in every pore and crack; the middle one slightly larger, all three showing amber rune glow at their surfaces — slow but absolutely unstoppable. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 80% of frame. DO NOT: metal hulls, organic shapes, plasma energy, modern manufactured appearance.

---

**STONE SHARD** · Lithos / Stone Shard
A long narrow fragment of dense stone moving at speed — a natural spall-shaped projectile the size of a city block, moving nose-first with its sharpened geological fracture face at the leading edge; deep gray rock with sharp straight fracture lines along its profile, ochre strata visible on its flanks, no decoration or markings — pure geological weaponry. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 80% of frame. DO NOT: metal coating, organic forms, energy effects, manufactured appearance.

---

**RUNE SPLINTER** · Lithos / Stone Shard
A stone fighter shaped like an elongated geological core sample — narrow and cylindrical with clearly visible strata rings along its length, horizontal composition, amber rune markings covering its surface and glowing faintly, the leading face a flat-cut fresh fracture surface; horizontal stone cylinder with amber rune glow, deep gray-brown rock. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject 80% of frame. DO NOT: metal surface, organic matter, plasma effects, modern construction.

---

**THE UNMOVED** · Lithos / The Unmoved
A dreadnaught-scale geological body that has never moved — a perfect sphere of the densest ancient rock in the galaxy, its surface entirely covered in hand-laid rune carvings that glow amber, placed there over billions of years by the Lithos in a slow ritual of marking, the rune network now covering every square meter of surface; deep gray-black rock almost entirely covered in glowing amber rune-script, overwhelming in scale; nothing has ever moved it, nothing ever will. Cinematic sci-fi card illustration, dark void background, painterly geological rendering, subject fills frame completely. DO NOT: metal, organic matter, plasma energy, modern manufacturing, cold blue tones.

---

## Race 9 — THE QUANTUM THREAD

**Race Palette**: Probability pink (#ff69b4), shifting cyan-teal, multiple-exposure ghost layers, uncertainty shimmer
**Atmosphere**: Multiple simultaneous possibilities overlaid, superposition visual language, probability clouds, shifting undefined edges
**Style anchors**: Multiple-exposure photography aesthetic, probability cloud forms, ghost-layer overlaps, undefined edges, simultaneous states
**DO NOT include**: Crisp defined edges, solid opaque forms, uniform color fields, certain or resolved appearances

---

**PROBABILITY LOCUS** · Quantum Thread / Probability Locus
A world that exists in three places simultaneously — three ghost-images of a planet overlapping in the same space at slightly different offsets, each a different color temperature suggesting alternate timelines (pink, cyan, gold), where they overlap creating white uncertainty zones; edges of each planet version soft and undefined, the "real" location unknown. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 85% of frame. DO NOT: single solid planet, hard defined edges, uniform appearance, resolved form.

---

**QUANTUM CRADLE** · Quantum Thread / Probability Locus
A star system frozen in superposition — multiple ghost versions of the same solar system overlapping, orbital rings existing as probability distributions rather than lines, planet positions shown as fuzzy probability smears rather than fixed locations; pink and cyan dominant with gold accent at probability peaks, soft undefined forms throughout. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 85% of frame. DO NOT: crisp defined paths, solid planets, hard edges, resolved positions.

---

**SUPERPOSITION ANCHOR** · Quantum Thread / Probability Locus
A Quantum Thread anchor point visible as a complex overlapping set of wavefunction interference patterns in 3D space — concentric probability shells of pink, cyan, and white suggesting a fixed position that cannot quite be determined; the form is beautiful but unresolvable, most probable location hinted at by the convergence of multiple interference rings. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 85% of frame. DO NOT: resolved solid form, hard edges, uniform field, certain appearance.

---

**WAVEFORM CLUSTER** · Quantum Thread / Waveform
A fleet of Quantum Thread vessels visible as a probability distribution of ship-shapes — showing perhaps seven overlapping ghost-ships at various positions, each appearing with different opacity suggesting different probability of being "here"; pink dominant with cyan and gold overlap zones, soft multiple-exposure aesthetic. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 80% of frame. DO NOT: solid defined ships, hard edges, single definite position, resolved appearance.

---

**INTERFERENCE PATTERN** · Quantum Thread / Waveform
A complex 3D quantum interference pattern filling the frame — two wavefunction systems interacting to produce a beautiful standing wave structure visible as alternating bands of constructive interference (bright pink-white) and destructive interference (dark gaps), the whole pattern slowly shifting; mathematical beauty, no physical object — just the wave interaction made visible. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 80% of frame. DO NOT: physical solid objects, hard edges, warm amber tones, resolved form.

---

**QUANTUM FLEET** · Quantum Thread / Waveform
A Quantum Thread capital ship caught in the moment of wavefunction collapse — multiple overlapping ghost-images rapidly converging from probability cloud toward a single resolved form, the final few frames of superposition still visible as fading pink-cyan ghost layers; the nearly-resolved form at center is sleek and threatening, surrounded by fading probability echoes. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 80% of frame. DO NOT: fully resolved solid form, hot warm colors, hard mechanical edges.

---

**COLLAPSED STATE** · Quantum Thread / Collapsed State
A Quantum Thread fighter in the moment after wavefunction collapse — it has JUST resolved from probability into solid reality, still surrounded by the fading pink-cyan probability echoes of its former superposition, but now a hard-edged form visible at center with crisp definition; the contrast between the definite center form and the fading probability halos is the visual subject. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 80% of frame. DO NOT: fully resolved with no echoes, completely collapsed, warm amber, no remaining ghost layers.

---

**PROBABILITY SPIKE** · Quantum Thread / Collapsed State
A Quantum Thread attack fighter visible as a directional probability spike — where most of the ship's wavefunction is spread in a wide probability cloud behind it, the forward momentum vector has collapsed into a hard fast spike of resolved matter; pink probability cloud body fading to a single cyan-white hard tip, like a photon turning into a particle at the moment of observation. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject 80% of frame. DO NOT: fully solid form, hard edges throughout, warm tones, no probability haze.

---

**THE OBSERVER** · Quantum Thread / The Observer
A Quantum Thread dreadnaught that resolves all around it — a vast form that appears perfectly defined and certain at center but whose effect on surrounding space is to force probability clouds nearby to partially collapse; the ship itself is visible and hard-edged (rare for the Quantum Thread), but radiating outward from it the space shows distorted probability waves as local quantum state is disrupted; pink-cyan shifting form at center, probability distortion waves radiating outward. Cinematic sci-fi card illustration, dark void background, painterly multiple-exposure rendering, subject fills frame. DO NOT: fully resolved space around it, warm amber tones, uniform background, hard-edged probability field.

---

## Race 10 — THE CHOIR

**Race Palette**: Silver-white (#c8c8ff), oscilloscope green, frequency spectrum gradients, resonance white
**Atmosphere**: Pure sound visualization — waveforms, frequency charts, oscilloscope readings, resonance patterns — NO physical objects
**Style anchors**: Oscilloscope waveform visualization, spectral frequency analysis charts, sound pressure maps, resonance standing waves
**DO NOT include**: Physical objects of any kind, ships, planets, organic matter, mechanical structures, humanoids — ONLY waveform and frequency visualizations

---

**RESONANT** · The Choir / Resonant
A simple pure waveform filling the frame — a single sustained frequency visualized as a clean sine wave, oscilloscope style, silver-white on deep black background, the wave amplitude and frequency suggesting a specific musical note; the wave is the entire subject, perfect and simple and full of latent potential; subtle frequency spectrum bar visible at the bottom edge. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject fills 80% of frame. DO NOT: physical objects, ships, organic matter, warm colors, complex layering.

---

**HARMONIC NODE** · The Choir / Resonant
A harmonic node visualization — the point where a standing wave's two opposing waveforms intersect and cancel creating a node, rendered as an oscilloscope image of two waves meeting at a bright central point, the meeting point radiating subtle resonance rings outward; silver-white waves on black with oscilloscope green at the crossing node point, the geometry of sound interference made visual. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject 85% of frame. DO NOT: physical objects, ships, warm colors, organic forms.

---

**CHORD ANCHOR** · The Choir / Resonant
A complex chord waveform — multiple simultaneous frequency waves overlaid on a single oscilloscope display, each in a slightly different shade of silver-white, their constructive interference peaks creating bright standing wave patterns; the combined waveform more complex and powerful than any individual frequency, a stable anchor chord. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject 85% of frame. DO NOT: physical objects, warm tones, simple single wave, organic matter.

---

**WAVE FORMATION** · The Choir / Wave Formation
A high-amplitude resonance wave in formation — four parallel waveforms traveling together in phase lock, their synchronization creating a combined wavefront of enormous amplitude, visualized as an oscilloscope display showing four silver waves perfectly aligned and amplifying each other; the combined amplitude peak shown in white at the point of maximum constructive interference. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject 80% of frame. DO NOT: physical objects, ships, warm tones, organic matter, dissonant frequencies.

---

**HARMONIC FLEET** · The Choir / Wave Formation
A spectral frequency analysis display showing a complex resonance signature — multiple frequency peaks across a visible spectrum, rendered as a 3D spectrogram with time on one axis and frequency on another, amplitude shown as height; the frequency peaks form an aggressive predatory pattern suggesting coordinated harmonics; silver-white dominant with oscilloscope green frequency peaks. Cinematic sci-fi card illustration, black background, precise spectrogram rendering, subject 80% of frame. DO NOT: physical objects, ships, warm colors, organic forms, simple single wave.

---

**RESONANCE ARRAY** · The Choir / Wave Formation
A 2D resonance array visualization — a Chladni pattern of standing waves in a 2D medium, showing the geometric shapes that emerge when surface resonance reveals its nodal lines; the pattern is a complex but ordered geometric figure made of silver-white nodal lines on black, with oscilloscope-green anti-nodal regions of maximum amplitude. Cinematic sci-fi card illustration, black background, precise resonance pattern rendering, subject 80% of frame. DO NOT: physical objects, ships, organic matter, warm colors.

---

**FREQUENCY SHARD** · The Choir / Frequency Shard
A high-frequency waveform displayed as a single sharp oscilloscope trace — an extremely high-frequency sine wave with very tight wave cycles, the line bright white, the amplitude high and the frequency near the limit of the display; aggressive and fast, the wave line vibrating with intensity, frequency spectrum bar at bottom showing the extreme register; pure technical beauty of a dangerous frequency. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject 80% of frame. DO NOT: physical objects, low-frequency gentle waves, warm colors, organic forms.

---

**DISSONANT BLADE** · The Choir / Frequency Shard
An oscilloscope display showing two slightly out-of-phase waves creating destructive interference — the two waves clearly visible as separate silver lines, their interaction point showing the characteristic beating pattern of near-destructive interference; the interference pattern creates a visual "blade" shape where the destructive zone cuts through the display; oscilloscope green beats pattern at the interference zone, silver waves on black. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject 80% of frame. DO NOT: physical objects, ships, warm colors, fully resolved waves, organic forms.

---

**THE DISSONANCE** · The Choir / Dissonance
A catastrophic resonance overload visualization — all possible frequencies simultaneously present, their combined waveform creating a dense wall of interference that approaches pure white noise at center but with visible harmonic structure in the outer regions; the center of the image is a blinding white overload zone, radiating outward through oscilloscope-green frequency chaos to silver-white organized waves at the edges; the visual equivalent of every frequency played at once at maximum amplitude. Cinematic sci-fi card illustration, black background, precise waveform rendering, subject fills entire frame. DO NOT: physical objects, organized single frequency, warm colors, organic matter, empty space.

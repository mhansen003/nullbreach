"""
GALACTIC ZERO — 9-Race Card Art Generator
Generates 10 cards per race × 9 races = 90 total images
Model: google/gemini-2.5-flash-image via OpenRouter
"""
import requests, base64, os, time, shutil
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
CARDS_DIR = Path("C:/GitHub/nullbreach/assets/cards")
DESKTOP_DIR = Path("C:/Users/Mark Hansen/Desktop/new-race-cards")

# Shared style constants
SHARED_STYLE = (
    "cinematic sci-fi card game illustration, portrait orientation fills frame edge-to-edge, "
    "no letterboxing, no empty space, no text, no numbers, no UI elements, no borders, no frames, "
    "painterly hard-edge rendering with dramatic volumetric lighting, "
    "dark void space background, subject occupies 85–95% of frame"
)

RACES = [
    {
        "id": "crystallis",
        "name": "Crystallis",
        "palette": "light blue (#a8d8f0) and white, crystal-clear facets, refractive prismatic light",
        "theme": "silicon lattice crystalline beings — geometric crystal structures, hexagonal lattice networks, prismatic light refraction, silicon-based life forms",
        "do_not": "DO NOT include: organic forms, flesh, fungal shapes, dark colors, warm tones, rust, or plasma",
        "cards": [
            ("t1_a", "A small silicon crystal scout — a geometric cluster of translucent hexagonal crystal shards floating in formation, small enough to fit in a hand, edges refracting prismatic blue-white light; light-blue crystalline body with white inner glow, hovering just above a lattice-field surface; basic unit, simple silhouette"),
            ("t1_b", "A crystalline lattice drone — a flat hexagonal plate of interlocked silicon crystals, its surface tessellating with blue light patterns, sharp geometric edges; minimal but precise form, light blue refractive surface with white-hot center node, trailing crystalline dust"),
            ("t1_c", "A silicon shard fighter — three large crystal spikes fused at the base in a tripod formation, each spike faceted and translucent blue-white, pointed tips crackling with stored light energy; rotating slowly in void, basic crystalline unit"),
            ("t2_a", "A mid-tier crystallis warrior construct — a tall angular silicon golem made of stacked hexagonal crystal plates, each plate independently hovering with blue light between the gaps, limbs formed from blade-like crystal shards; light blue and white crystalline body, prismatic light scattering off faceted surfaces"),
            ("t2_b", "A crystallis prism-ship — a vessel grown from a single enormous crystal lattice formation, its facets acting as both hull and weapons, refracting focused light-beams from its internal core; transparent blue-white crystalline form with brilliant white light-core visible within"),
            ("t2_c", "A crystallis lattice-web formation — multiple crystal strands extending from a central node in a web pattern, each strand made of linked hexagonal silicon crystals, blue light traveling along the network; three-dimensional geometric structure filling the frame"),
            ("t3_a", "An elite crystallis resonance construct — a towering angular humanoid shape formed from massive crystal slabs, its body composed of seven crystal-plate layers each slightly offset and glowing with internal blue light, a crystalline crown of razor spikes above its head; overwhelming geometric presence, light-blue and white palette"),
            ("t3_b", "A crystallis siege crystal — an enormous floating weapon-form, a single massive silicon crystal the size of a warship, its interior lit from within by a concentrated white-hot light-core, outer facets projecting blue-white cutting beams in all directions; imposing single-crystal form"),
            ("t4", "THE CRYSTALLIS LATTICE SOVEREIGN — the faction dreadnaught flagship, an impossibly vast crystalline megastructure filling the entire frame edge-to-edge; a cathedral of interlocking hexagonal silicon lattices growing outward from a blazing white central core, each arm of the lattice branching into sub-lattices and smaller crystals; blue-white prismatic light refracting off thousands of crystal facets, scale communicated by tiny crystal-shard escort ships visible at the edges; overwhelming geometric complexity and luminous crystalline beauty"),
            ("extra", "A crystallis memory-shard archive — a cluster of ancient memory crystals, each one containing encoded light-data visible as blue-white pattern-light frozen within the crystal matrix; irregularly shaped but perfectly faceted, some crystals showing age-fractures with prismatic light leaking out"),
        ]
    },
    {
        "id": "mycos",
        "name": "Mycos",
        "palette": "organic purple (#7b3fa0) and bioluminescent green (#39d978), spore-glow accent",
        "theme": "fungal intelligence — spore networks, mycelium tendrils, mushroom cap structures, organic growth patterns, decomposition energy",
        "do_not": "DO NOT include: metallic surfaces, geometric crystal shapes, hard angles, silicon, or clean technology",
        "cards": [
            ("t1_a", "A small mycos spore-runner — a single ambulatory mushroom-organism, its cap wide and flat with bioluminescent green spots on the underside releasing spores, four root-tendril legs moving it through void; purple cap with green bioluminescent underside glow, leaving a trail of drifting green spores"),
            ("t1_b", "A mycos drift-cluster — a floating ball of tangled mycelium threads, purple-black organic mass studded with small glowing green spore-pods, tendrils extending outward in all directions sensing the environment; amorphous organic form, no hard edges"),
            ("t1_c", "A mycos bloom scout — a single organism with an oversized mushroom cap that acts as a natural radar dish, thin mycelium stalk below it, bioluminescent green rim lighting along the cap's edge; purple stalked body with bright green cap-rim, spores drifting upward"),
            ("t2_a", "A mycos tendril-hunter — a mid-sized fungal organism with multiple thick mycelium limbs extending forward like grasping fingers, a central purple mass-body from which the tendrils grow, bioluminescent green veins running through each tendril; unsettling organic motion, reaching form"),
            ("t2_b", "A mycos spore-cannon platform — a thick stump-like fungal structure with a massive cap redirected into a forward-facing spore-launch funnel, green bioluminescent spore mass visible inside; purple organic body, the funnel-cap glowing bright green from within with spore energy"),
            ("t2_c", "A mycos network node — a central purple fungal body with thin mycelium strands extending outward in all directions, connecting to smaller satellite fungi; the network pulsing with green bioluminescent signals traveling along the mycelium threads; organic neural network form"),
            ("t3_a", "An elite mycos elder-growth — a massive ancient fungal entity, its body a layered stack of enormous mushroom caps in decreasing size, purple-black with age-spots of vivid bioluminescent green; the caps releasing clouds of green spores that drift in intelligent patterns around it; ancient and imposing organic presence"),
            ("t3_b", "A mycos spore-storm warship — a vessel grown from interlocked fungal organisms, its hull entirely composed of fused mushroom caps and mycelium mass, the entire surface releasing coordinated green bioluminescent spore clouds that form a defensive aura; organic ship-form, no mechanical parts"),
            ("t4", "THE MYCOS OVERMIND — the faction dreadnaught, a continent-sized fungal megaorganism that dwarfs every other entity in the frame; a mountainous central fruiting body topped with multiple enormous mushroom caps, from which cascade thousands of mycelium tendrils extending hundreds of kilometers; the entire mass glowing with intense bioluminescent green from within, visible purple-black organic mass beneath; smaller mycos organisms visible at the edges showing the true scale; overwhelming organic life-energy"),
            ("extra", "A mycos spore-nexus artifact — a perfectly spherical purple fungal object about the size of a moon, its entire surface covered in geometric spore-release pores glowing intense green, each pore releasing a focused beam of green spore-energy; beautiful in its alien regularity"),
        ]
    },
    {
        "id": "veil",
        "name": "Veil",
        "palette": "gold (#f0c040) and white energy, translucent and luminous, barely-there forms",
        "theme": "light entities — nearly invisible translucent beings, golden energy fields, white photon constructs, luminous presence",
        "do_not": "DO NOT include: solid opaque surfaces, metallic plating, organic flesh, dark colors, hard mechanical components",
        "cards": [
            ("t1_a", "A small veil presence — a barely-visible translucent entity, its form suggested by a faint humanoid outline of golden-white light, edges dissolving into the surrounding void; gold light-outline with white inner luminance, more light than matter"),
            ("t1_b", "A veil light-mote — a floating sphere of concentrated golden-white energy, translucent with a brilliant white hot-core visible within, surrounded by thin rings of dispersed light-energy; simple but luminous, small basic unit"),
            ("t1_c", "A veil shimmer-scout — a flat disc of translucent golden energy, its surface showing light interference patterns like soap-bubble iridescence in gold and white; hovering, barely visible, edges fading into nothing"),
            ("t2_a", "A veil beam-weaver — a mid-sized luminous entity whose body is a complex weave of golden light strands crossing and recrossing, the whole structure in constant gentle motion, translucent form suggesting a tall robed figure made of light; gold and white luminous filaments"),
            ("t2_b", "A veil photon-lance — an elongated translucent weapon-form, a spear of concentrated golden-white light energy, its core brilliant white and its outer edges fading to gold then invisible; weapon of pure light, no physical matter visible"),
            ("t2_c", "A veil mirror-field — a broad flat formation of interlocked veil entities, each one translucent gold, together forming a vast reflective barrier of light-energy; the formation showing phase-interference patterns at the intersections of their fields"),
            ("t3_a", "An elite veil radiance — a tall imposing luminous entity, its form fully humanoid but composed entirely of cascading golden-white light, each movement leaving trails of gold light that linger; crown of intense white brilliance above its head, arms extended, overwhelming luminous presence"),
            ("t3_b", "A veil photon-fortress — a large cubic structure built from layered planes of translucent golden energy, each layer visible through the one above it, the whole structure lit from within by a white core; geometric but made entirely of light"),
            ("t4", "THE VEIL LUMINARCH — the faction dreadnaught flagship, a being of such concentrated light-energy that it illuminates everything in the frame; an enormous luminous entity whose body fills the entire frame, form suggested by the arrangement of its golden-white energy rather than any solid surface; at its heart a white-hot singularity of pure light, from which golden radiance cascades outward in every direction, creating light-interference patterns across the frame; smaller veil entities visible at edges as mere motes compared to this blazing presence; the very concept of solid matter made irrelevant"),
            ("extra", "A veil resonance archive — a cluster of floating golden orbs connected by thin lines of white light, each orb containing a different encoded light-pattern, the whole cluster rotating slowly like a luminous orrery; ancient and beautiful"),
        ]
    },
    {
        "id": "entropy",
        "name": "Entropy",
        "palette": "orange-rust (#c45a0a) and corroded bronze, decay brown, oxidized metal surfaces",
        "theme": "decay worshippers — corroded technology, rust and oxidation, broken machines repurposed, entropy as religion, beautiful decay",
        "do_not": "DO NOT include: pristine clean metal, crystal clarity, bioluminescent organic forms, translucent entities, or orderly geometry",
        "cards": [
            ("t1_a", "A small entropy scavenger-drone — a battered repurposed robot chassis heavily corroded, orange rust eating through its armor plating, held together with improvised wire and crude welds; rust-orange body with patches of bare corroded bronze, one eye-sensor brighter than the other"),
            ("t1_b", "An entropy rust-walker — a bipedal machine heavily degraded by intentional entropy, its leg-joints wrapped in crumbling insulation, body panels showing advanced corrosion patterns treated as sacred markings; orange-brown oxidized surfaces with hints of the original metal beneath"),
            ("t1_c", "An entropy scrap-bomb — a crudely assembled sphere of salvaged metal fragments held together magnetically, its surface layered with different generations of rusted plating, small oxidation spores visible on the surface; chaotic assemblage of corroded parts"),
            ("t2_a", "A mid-tier entropy corrosion-knight — a large humanoid war-machine whose armor plating has been deliberately exposed to entropy fields until beautifully corroded, the rust forming complex fractal patterns treated as sacred scripture; orange-rust surface with deep corrosion channels revealing bronze beneath"),
            ("t2_b", "An entropy decay-cruiser — a warship whose hull has been allowed to corrode for centuries, beautiful orange-rust patterns covering every surface, structural supports visible where hull panels have rotted away and been replaced with makeshift struts; chaotic but still fearsome"),
            ("t2_c", "An entropy collapse-engine — a large spherical device surrounded by a field of decaying matter; everything near it corroding faster, rust particles floating in a cloud around it; the central device itself heavily oxidized, orange-rust surface with cracks leaking entropy energy"),
            ("t3_a", "An elite entropy lord — a massive war-machine whose body has been exposed to so much entropy that it has transcended corrosion into a new form; rust-patterns have crystallized into something almost beautiful, ancient and dark orange-brown, with internal systems still burning through cracks in the corroded hull"),
            ("t3_b", "An entropy siege-breaker — an enormous corroded artillery platform, its barrel a repurposed industrial pipe heavily oxidized, mounted on a chassis of layered rusted hull plates; the weapon glowing orange-hot from within despite (because of) its decay"),
            ("t4", "THE ENTROPY COLLAPSE ENGINE — the faction dreadnaught flagship, a vessel so massive and so deliberately decayed that it looks like a drifting ruin yet remains the most powerful weapon in the galaxy; fills the entire frame edge-to-edge; a centuries-old dreadnaught hull covered in orange-rust corrosion so beautiful it has become art, structural holes patched with scavenged pieces from dozens of other ship types, entropy fields visibly emanating from its hull and corroding space itself around it; smaller ships visible at the edges showing its colossal scale; awe-inspiring beautiful decay"),
            ("extra", "An entropy relic-shrine — a floating cluster of corroded artifacts from dozens of civilizations, all joined together in a sacred arrangement; ancient weapons, machinery, and structures all at various stages of beautiful rust and oxidation, the whole cluster glowing faintly orange from entropy energy within"),
        ]
    },
    {
        "id": "void",
        "name": "Void",
        "palette": "pure black (#000000) with vivid purple void energy (#8b00ff), minimal light except purple glow",
        "theme": "dark matter predators — void between dimensions, pure darkness with purple dimensional energy, absence of light as weapon",
        "do_not": "DO NOT include: bright colors, warm tones, organic flesh, crystal clarity, rust, or visible solid surfaces (void forms should be mostly black)",
        "cards": [
            ("t1_a", "A small void predator — a black shape barely distinguishable from the surrounding void, its presence revealed only by purple void-energy outlining its predatory silhouette; sleek black form with purple dimensional-rift light tracing its edges, hunting posture"),
            ("t1_b", "A void tendril — a single black tendril reaching from a dimensional rift, purple light framing the rift opening, the tendril itself pure black against the void; simple but menacing emergence form"),
            ("t1_c", "A void slip-shade — a small flat black form that appears to fold through space, its two-dimensional silhouette showing no depth, the edges crackling with purple void energy; basic unit, unsettling flatness"),
            ("t2_a", "A mid-tier void hunter — a large predatory void-entity, black manta-ray shape with purple dimensional-rift markings along its wings, trailing purple void energy as it moves; clearly a predator, swooping black form against a slightly-lit void"),
            ("t2_b", "A void rift-cruiser — a vessel that exists partially in normal space, its hull visible as a black angular wedge shape, but its lower half dissolving into a purple-edged dimensional rift from which it partially emerges; half-in, half-out of reality"),
            ("t2_c", "A void swarm — a formation of hundreds of small void predators moving in a dense school, their individual forms barely visible as black shapes but the collective mass creating a flowing predatory pattern with purple void-energy leaking from between them"),
            ("t3_a", "An elite void apex-predator — a massive black entity whose exact form is difficult to perceive, its body composed of overlapping dimensional fold-surfaces with purple void energy in the gaps, enormous in scale; the kind of entity that makes other predators flee"),
            ("t3_b", "A void rift-gate — a large dimensional tear held open by void energy, framed by a massive black void-construct, the tear itself showing purple void-dimension within; a weapon as much as a doorway"),
            ("t4", "THE VOID ABYSSAL — the faction dreadnaught flagship and the largest void predator to exist; fills the entire frame edge-to-edge; a black entity of such mass that it bends space around it, its exact shape impossible to determine as its edges fold through multiple dimensions simultaneously; the only light in the frame is the intense purple void-energy that marks its dimensional boundaries and the glow of smaller void-predators visible at the very edges, giving scale to this incomprehensible darkness; an absence rather than a presence, consuming the frame itself"),
            ("extra", "A void rift-anchor — a permanent dimensional tear held open with void-energy technology, purple light framing the rift edges which show pure void-dimension within; floating artifacts of black void-material orbit it slowly"),
        ]
    },
    {
        "id": "gas",
        "name": "Gas",
        "palette": "electric yellow (#ffe000) and gold (#ffa000), plasma lightning, storm energy",
        "theme": "plasma storm beings — living lightning entities, gas giant inhabitants, electrical storm consciousness, plasma weather systems",
        "do_not": "DO NOT include: solid metal surfaces, organic flesh, crystal structures, decay, darkness, or void energy (purple)",
        "cards": [
            ("t1_a", "A small gas plasma-spark — a living bolt of electrical energy in roughly humanoid form, body composed of crackling yellow-gold plasma with lightning branching off its limbs; small and quick-looking, yellow-gold electric light filling the frame"),
            ("t1_b", "A gas storm-mote — a spinning vortex of electric plasma, yellow and gold lightning spiraling around a bright electrical core; a basic plasma-storm entity, pure energy form"),
            ("t1_c", "A gas thunder-scout — a flattened plasma cloud in the shape of a wide disc, yellow electrical storms visible across its surface, lightning discharging from its edges; living weather system at small scale"),
            ("t2_a", "A mid-tier gas lightning-strider — a tall plasma-being whose form is a vertical column of yellow-gold electricity, branching lightning arcing from its upper body, a bright plasma core at its center; imposing electrical presence, mid-scale power"),
            ("t2_b", "A gas storm-warship — a ship made from condensed plasma, its hull a crackling mass of electrical energy shaped into a vessel form, constant lightning discharging along its entire surface; yellow-gold plasma hull with brilliant white lightning"),
            ("t2_c", "A gas electromagnetic pulse-battery — a formation of plasma-beings arranged in a line, each one discharging synchronized lightning bolts that join into a single massive electrical beam; coordinated electrical warfare, yellow-gold lightning beam"),
            ("t3_a", "An elite gas tempest-lord — a massive plasma entity, its form an enormous crackling electrical storm shaped like an ancient titan, lightning in patterns suggesting a face and body; gold and yellow plasma with white-hot lightning strikes, fills frame with electrical energy"),
            ("t3_b", "A gas mega-storm — a vast plasma weather formation shaped as a weapon, a self-sustaining electrical hurricane with a brilliant eye at its center; yellow-gold outer lightning walls with blinding white eye, enormous scale"),
            ("t4", "THE GAS STORM ETERNAL — the faction dreadnaught flagship, a living plasma hurricane the size of a gas giant; fills the entire frame edge-to-edge; a self-sustaining electrical superstorm of impossible scale, its outer walls crackling yellow-gold lightning visible as distinct storm-bands, each band alone larger than a planet; the eye of the storm is blinding white plasma, and within it smaller plasma entities orbit as attendants; scale communicated by tiny plasma-ships at the frame's edges; overwhelming electrical magnificence"),
            ("extra", "A gas plasma nexus — a nexus-point where multiple electrical storm-currents intersect, creating a stable ball of intensely bright yellow-gold plasma at the center with lightning radiating outward in all directions in perfect symmetry; beautiful and dangerous"),
        ]
    },
    {
        "id": "lithos",
        "name": "Lithos",
        "palette": "brown (#8b5a2b) and amber (#d4800a), ancient stone, geological time, earth tones",
        "theme": "geological ancients — beings of living stone and rock, tectonic plate constructs, planetary crust entities, geological time made sentient",
        "do_not": "DO NOT include: metallic surfaces, plasma energy, fungal forms, translucent entities, electricity, or modern technology",
        "cards": [
            ("t1_a", "A small lithos stone-walker — a compact humanoid figure made from rough-cut brown stone blocks, its joints filled with amber magma-glow, simple but massive in proportion for its size; ancient geological construction, basic stone unit"),
            ("t1_b", "A lithos pebble-swarm — a dense cluster of small animated stones moving together as a collective, each stone tumbling and grinding against others, amber lava-glow visible in the cracks between them; collective small-stone unit"),
            ("t1_c", "A lithos shard-thrower — a roughly spherical stone entity that launches spinning rock projectiles, its body cracked and showing amber interior heat, surface covered in geological layer patterns; basic attack unit"),
            ("t2_a", "A mid-tier lithos golem — a large stone giant with a body made of stacked geological strata layers, each layer a different rock type; brown sandstone base, brown limestone mid-body, brown granite upper torso; amber light glowing from its eyes and chest cavity"),
            ("t2_b", "A lithos tectonic-plate ship — a vessel carved from a floating continent fragment, its hull the exposed face of geological strata, amber magma visible along thrust-vents carved into the rock; a flying island of living stone"),
            ("t2_c", "A lithos monolith formation — three enormous standing stone formations arranged in a triangle, each one carved with ancient geometric patterns that glow amber; Stonehenge-like but at spaceship scale, floating in void"),
            ("t3_a", "An elite lithos elder-titan — a colossal stone entity whose body is formed from a small mountain of geological material, tectonic plates making up its torso, mountain peaks forming its shoulders; amber magma flowing through the cracks of its stone body like blood; ancient beyond measure"),
            ("t3_b", "A lithos geological warship — an enormous boulder-shaped vessel, its surface showing billions of years of geological time in its strata layers, amber magma vents providing thrust and weapons; a weaponized asteroid of living stone"),
            ("t4", "THE LITHOS WORLD-STONE — the faction dreadnaught flagship, a living planet-fragment the size of a small moon; fills the entire frame edge-to-edge; a massive irregular stone body showing exposed geological cross-section with brown/amber strata layers visible at its cracked surface, amber magma rivers flowing between tectonic plate segments, enormous stone-golem faces emerging from the surface showing this is a conscious entity; tiny stone-walker units visible at the edges giving scale to this geological behemoth; ancient and overwhelming geological presence"),
            ("extra", "A lithos strata-archive — a floating exposed cliff face of geological strata layers, each layer containing fossilized patterns of ancient civilizations, amber veins running through the rock; an ancient record written in stone"),
        ]
    },
    {
        "id": "quantum",
        "name": "Quantum",
        "palette": "rainbow spectrum (red-orange-yellow-green-blue-violet) with hot pink (#ff00ff) quantum highlights",
        "theme": "superposition entities — beings existing in multiple states simultaneously, probability clouds, quantum uncertainty, rainbow interference patterns",
        "do_not": "DO NOT include: solid single-color forms (quantum entities must show multiple simultaneous states), organic flesh, rust, stone, or darkness",
        "cards": [
            ("t1_a", "A small quantum scout in superposition — the same entity appearing simultaneously in three slightly offset positions, each copy a different rainbow hue (red, green, blue), the copies semi-transparent and overlapping; probability cloud at small scale"),
            ("t1_b", "A quantum probability-mote — a small sphere that exists in multiple states simultaneously, its surface showing probability distributions as rainbow wave patterns, pink quantum-highlight at the highest-probability position; small basic quantum unit"),
            ("t1_c", "A quantum uncertainty-dart — a small fast-moving entity that exists as a probability smear, its exact position uncertain, visible as a rainbow streak with pink hot-spots at possible positions; speed and uncertainty made visible"),
            ("t2_a", "A mid-tier quantum observer — a humanoid entity whose body exists in visible superposition, each arm reaching through multiple probability states creating a fan of translucent rainbow arms; pink highlights at the most-probable position; unsettling beautiful quantum form"),
            ("t2_b", "A quantum phase-ship — a vessel that quantum tunnels through space, leaving a rainbow probability wake, the ship itself visible as multiple semi-transparent versions at slightly different positions; pink-highlighted actual position surrounded by ghost-images"),
            ("t2_c", "A quantum entanglement web — two quantum entities connected by a visible rainbow probability string between them, each entity partially transparent and showing multiple positions; their states mirror each other in real-time"),
            ("t3_a", "An elite quantum collapse-engine — a large entity whose presence forces quantum probability to collapse around it, creating rainbow shockwaves of collapsing probability; the entity at center is pink-highlighted solid form surrounded by cascading rainbow uncertainty"),
            ("t3_b", "A quantum superposition fleet — one ship that exists as a fleet of twenty semi-transparent probability-ships all in different positions, the whole probability cloud filling the frame; pink highlight on the highest-probability position"),
            ("t4", "THE QUANTUM PROBABILITY SOVEREIGN — the faction dreadnaught flagship, an entity so massive and quantum-entangled that it exists as a probability distribution across the entire frame; fills frame edge-to-edge; the sovereign appears simultaneously as thousands of semi-transparent overlapping versions of itself, each at a different probability position, creating an intricate rainbow interference pattern across the full image; at the center where probability is highest, a hot-pink singularity blazes; the quantum interference pattern between all the probability-selves is extraordinarily beautiful, like a multidimensional diffraction grating; overwhelming superposition beauty"),
            ("extra", "A quantum paradox crystal — an artifact that forces a visible quantum paradox, two mutually exclusive states existing simultaneously in one object; shows both its destroyed and intact states overlapping in rainbow-pink superposition; beautiful impossibility"),
        ]
    },
    {
        "id": "choir",
        "name": "Choir",
        "palette": "resonant blue (#1a6db5) and white acoustic waves, vibration patterns, standing wave formations",
        "theme": "resonant frequency beings — entities made of organized sound and vibration, visible standing waves, acoustic weapon systems, harmonic resonance consciousness",
        "do_not": "DO NOT include: solid opaque metal hulls, organic flesh, crystal geometry, decay, darkness, plasma, or stone",
        "cards": [
            ("t1_a", "A small choir resonance-node — a small entity whose body is a visible standing wave pattern, blue and white acoustic waves forming a roughly spherical shape; the wave patterns creating a face-like interference pattern at the front; small harmonic unit"),
            ("t1_b", "A choir vibration-scout — a flat disc of organized acoustic energy, visible as concentric blue-white wave rings emanating from a central resonance point; simple harmonic form, vibration visible as standing waves"),
            ("t1_c", "A choir sound-dart — a narrow elongated torpedo of focused acoustic energy, blue-white sonic waves compressed into a linear spike; basic attack unit of pure harmonic force"),
            ("t2_a", "A mid-tier choir harmonic-warrior — a humanoid form made from organized standing sound waves, blue and white acoustic patterns forming its body, arms extended in a conducting gesture as it shapes sound into weapon-form; beautiful wave-pattern body"),
            ("t2_b", "A choir resonance-warship — a vessel whose hull is an organized acoustic array, covered in concentric wave-emitter rings; the entire ship visibly vibrating with blue-white standing waves, its weapons sonic harmonics converging to a focal point ahead"),
            ("t2_c", "A choir harmonic-choir formation — nine choir entities arranged in a perfect 3x3 grid, their individual resonance fields interfering constructively to create a massive amplified harmonic pattern between them; cooperative acoustic warfare"),
            ("t3_a", "An elite choir conductor-prime — a massive choir entity whose body has organized into an enormous standing wave formation suggesting a classical musical conductor, arms extended, the space around it filled with blue-white harmonic resonance patterns; imposing acoustic presence"),
            ("t3_b", "A choir sonic-siege engine — a large acoustic weapon platform, an array of wave-focusing horns arranged concentrically, each horn made from organized acoustic energy, the combined beam visible as a white-hot harmonic convergence point; beautiful and terrible"),
            ("t4", "THE CHOIR GRAND RESONANCE — the faction dreadnaught flagship, a being that exists as a standing wave across all of space; fills the entire frame edge-to-edge; an immense pattern of acoustic interference — the Grand Resonance exists as the interference pattern between its own harmonics, visible as an incredibly complex blue-white standing wave formation that fills the frame with beauty; at the center where all harmonics converge, a blinding white resonance point; smaller choir entities visible at the edges, their wave-patterns tiny compared to the vast harmonic architecture of the Grand Resonance; overwhelming acoustic beauty"),
            ("extra", "A choir resonance archive — a floating acoustic archive, visible as a sphere of organized standing waves in concentric layers, each layer encoding ancient harmonic knowledge; blue-white wave patterns of extraordinary complexity and beauty"),
        ]
    },
]

def generate_card(race_id, card_id, prompt, palette, do_not):
    out_dir = CARDS_DIR / race_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{card_id}.png"

    desktop_dir = DESKTOP_DIR / race_id
    desktop_dir.mkdir(parents=True, exist_ok=True)
    desktop_out = desktop_dir / f"{card_id}.png"

    if out.exists():
        print(f"  SKIP {card_id}")
        if not desktop_out.exists():
            shutil.copy2(out, desktop_out)
        return True, 0

    full_prompt = (
        f"{prompt} "
        f"COLOR PALETTE: {palette}. "
        f"{do_not}. "
        f"{SHARED_STYLE}."
    )

    print(f"  [{card_id}]...", end=" ", flush=True)
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://zero.demo.pub",
                "X-Title": "Galactic Zero"
            },
            json={
                "model": "google/gemini-2.5-flash-image",
                "messages": [{"role": "user", "content": full_prompt}]
            },
            timeout=120
        )
        if r.status_code != 200:
            print(f"FAIL {r.status_code}: {r.text[:100]}")
            return False, 0

        data = r.json()
        images = data.get("choices", [{}])[0].get("message", {}).get("images", [])
        if not images:
            # Try content field
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"NO IMAGE (content len={len(str(content))})")
            return False, 0

        url = images[0]["image_url"]["url"]
        img_bytes = base64.b64decode(url.split(",", 1)[1])
        out.write_bytes(img_bytes)
        shutil.copy2(out, desktop_out)
        size_kb = out.stat().st_size // 1024
        print(f"OK ({size_kb}KB)")
        return True, out.stat().st_size
    except Exception as e:
        print(f"ERROR: {e}")
        return False, 0

def main():
    print(f"GALACTIC ZERO — 9-Race Card Art Generator")
    print(f"Output: {CARDS_DIR}")
    print(f"Desktop copy: {DESKTOP_DIR}")
    print(f"Total: {sum(len(r['cards']) for r in RACES)} images across {len(RACES)} races\n")

    DESKTOP_DIR.mkdir(parents=True, exist_ok=True)

    grand_total_ok = 0
    grand_total_bytes = 0

    for race in RACES:
        print(f"\n{'='*60}")
        print(f"RACE: {race['name']} ({race['id']}) — {len(race['cards'])} cards")
        print(f"{'='*60}")

        race_ok = 0
        race_bytes = 0

        for i, (card_id, prompt) in enumerate(race["cards"]):
            ok, size = generate_card(
                race["id"], card_id, prompt,
                race["palette"], race["do_not"]
            )
            if ok:
                race_ok += 1
                race_bytes += size
            if i < len(race["cards"]) - 1:
                time.sleep(3)

        grand_total_ok += race_ok
        grand_total_bytes += race_bytes
        print(f"\n  {race['name']}: {race_ok}/{len(race['cards'])} cards, {race_bytes//1024}KB total")

    print(f"\n{'='*60}")
    print(f"COMPLETE: {grand_total_ok} images, {grand_total_bytes//1024//1024}MB total")
    print(f"Cards dir: {CARDS_DIR}")
    print(f"Desktop:   {DESKTOP_DIR}")

if __name__ == "__main__":
    main()

"""
GALACTIC ZERO — Civilization Voice Generator
Generates MP3 intro narration for each race via ElevenLabs TTS
Voice ID: YPtbPhafrxFTDAeaPP4w
"""
import requests, os, time
from pathlib import Path

API_KEY  = os.environ.get("ELEVEN_API_KEY", "")
VOICE_ID = "YPtbPhafrxFTDAeaPP4w"
OUT_DIR  = Path("C:/GitHub/nullbreach/assets/voices")
OUT_DIR.mkdir(parents=True, exist_ok=True)

INTROS = [
  {"id": "terran",    "text": "Humanity's unified colonial federation. Forty colony worlds, one military doctrine. No alien mystique, no ancient wisdom. They fight with discipline, numbers, and the one advantage no alien race shares: they understand each other."},
  {"id": "crystallis","text": "Silicon lattice beings grown from asteroid fields. Not manufactured, but crystallized over geological time. What appears to be a ship is a mobile extension of their homeworld lattice, indistinguishable from the structure it grew from."},
  {"id": "mycos",     "text": "A distributed mycorrhizal intelligence spanning solar systems. No central mind, only network. The Drift does not make decisions. It grows. Every spore carries the full consciousness of the whole, deployed from an organism larger than most star systems."},
  {"id": "veil",      "text": "Beings of coherent light who never fully solidify. Visible only when two waveforms cross, and only for a moment. What other races perceive as a Veil ship is a briefly stable interference pattern. Strike it, and it becomes somewhere else."},
  {"id": "entropy",   "text": "Ancient beings who reached the inevitable philosophical conclusion long ago: heat death is not a tragedy, but a destination. Their technology is designed not to preserve, but to accelerate. Every weapon is entropy made purposeful. Every ship, a slow-motion collapse."},
  {"id": "brood",     "text": "Insectoid hive-mind where the Sovereign, always singular, always enormous, is the central consciousness. Ships are colonies of living bodies fused into hull shapes. The Sovereign herself is the dreadnaught: a mobile throne that makes everything around her lethal."},
  {"id": "void",      "text": "From the intergalactic void. The true dark between galaxy clusters where no star has ever formed. Defined entirely by absence. Void Hunter ships absorb light, visible only by what they occlude. Their technology is predatory at the fundamental level: find the strongest thing, and destroy its strength first."},
  {"id": "gas",       "text": "Evolved in the upper atmospheres of gas giants. Beings of ionized plasma held together by magnetic will. Ships are literally contained storms: self-sustaining atmospheric systems directed by a collective plasma consciousness. The dreadnaught is a weaponized planetary hurricane."},
  {"id": "lithos",    "text": "Near-immortal beings thinking in geological time. A fast decision takes a decade. Ships are asteroids shaped over millions of years by forces the Lithos will into specific geometries. They do not build. They wait for matter to become what they already decided it would be."},
  {"id": "quantum",   "text": "Beings that exist in superposition. Multiple states simultaneously, until observed. Their ships are probability clouds. When you look directly at a Quantum Thread vessel, you have already changed what it was. They operate on the principle that the unobserved state contains more power than the resolved one."},
  {"id": "choir",     "text": "No visible form. No detectable mass. The Choir is pure resonant frequency, sound traveling through space at impossible scales. They perceive through vibration, communicate through harmonic modulation, and attack by finding the resonant frequency of whatever they want destroyed."},
]

def generate(item):
    out = OUT_DIR / f"{item['id']}.mp3"
    if out.exists():
        print(f"  SKIP: {item['id']}")
        return True
    print(f"  [{item['id']}]...", end=" ", flush=True)
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        json={
            "text": item["text"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.45,
                "similarity_boost": 0.80,
                "style": 0.15,
                "use_speaker_boost": True
            }
        },
        timeout=60
    )
    if r.status_code == 200:
        out.write_bytes(r.content)
        print(f"OK ({len(r.content)//1024}KB)")
        return True
    print(f"FAIL {r.status_code}: {r.text[:120]}")
    return False

if __name__ == "__main__":
    print(f"Generating {len(INTROS)} civilization voice intros...")
    ok = 0
    for i, item in enumerate(INTROS):
        print(f"[{i+1}/{len(INTROS)}]", end=" ")
        if generate(item): ok += 1
        if i < len(INTROS)-1: time.sleep(0.5)
    print(f"\nDone: {ok}/{len(INTROS)} — saved to {OUT_DIR}")

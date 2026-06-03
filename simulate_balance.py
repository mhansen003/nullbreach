"""
GALACTIC ZERO — Balance Simulator
Runs 10 games per ordered faction pair (11x10 = 110 pairs x 10 = 1100 games total)
AI has N/S edges flipped. Uses greedy heuristic as specified.
"""

import random
import math
import copy
import json

# ─── DECK DEFINITIONS ─────────────────────────────────────────────────────────
BROOD_CARDS = [
  {'id':'br_t1a','name':'HIVE NODE','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'br_t1b','name':'HIVE NODE','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'br_t1c','name':'HIVE NODE','tier':'I','edges':{'n':5,'s':2,'e':4,'w':4},'power':1},
  {'id':'br_t1d','name':'QUEEN CRADLE','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'br_t1e','name':'BROOD ANCHOR','tier':'I','edges':{'n':4,'s':5,'e':4,'w':3},'power':2},
  {'id':'br_t2a','name':'WARRIOR CLUSTER','tier':'II','edges':{'n':7,'s':3,'e':5,'w':6},'power':3},
  {'id':'br_t2b','name':'SOLDIER MASS','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'br_t2c','name':'BIOMECH FLEET','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'br_t3a','name':'SKIMMER','tier':'III','edges':{'n':8,'s':3,'e':5,'w':5},'power':3},
  {'id':'br_t3b','name':'VOID SKIMMER','tier':'III','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'br_t3c','name':'LARVAE STRIKE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':2},
  {'id':'br_t4','name':'THE SOVEREIGN','tier':'IV','edges':{'n':8,'s':6,'e':7,'w':7},'power':4},
  {'id':'br_x1','name':'HIVE NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'br_x2','name':'SWARM WING','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':3},
  {'id':'br_x3','name':'HIVE LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':2},
]

CRYSTALLIS_CARDS = [
  {'id':'cr_t1a','name':'CRYSTAL SHARD','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'cr_t1b','name':'SHARD CLUSTER','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'cr_t1c','name':'SILICA NODE','tier':'I','edges':{'n':5,'s':2,'e':4,'w':4},'power':1},
  {'id':'cr_t1d','name':'LATTICE WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'cr_t1e','name':'CRYSTAL CORE','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'cr_t2a','name':'RESONANCE ARRAY','tier':'II','edges':{'n':6,'s':3,'e':5,'w':7},'power':2},
  {'id':'cr_t2b','name':'PRISM BATTERY','tier':'II','edges':{'n':7,'s':3,'e':4,'w':7},'power':2},
  {'id':'cr_t2c','name':'REFRACTION RING','tier':'II','edges':{'n':5,'s':3,'e':5,'w':8},'power':2},
  {'id':'cr_t3a','name':'PRISM LANCE','tier':'III','edges':{'n':7,'s':3,'e':5,'w':6},'power':3},
  {'id':'cr_t3b','name':'SHARD BLADE','tier':'III','edges':{'n':5,'s':3,'e':5,'w':8},'power':3},
  {'id':'cr_t3c','name':'FACET STRIKE','tier':'III','edges':{'n':5,'s':5,'e':5,'w':6},'power':3},
  {'id':'cr_t4','name':'THE LATTICE','tier':'IV','edges':{'n':7,'s':5,'e':7,'w':9},'power':4},
  {'id':'cr_x1','name':'SHARD SPIRE','tier':'I','edges':{'n':5,'s':5,'e':5,'w':6},'power':1},
  {'id':'cr_x2','name':'LENS BATTERY','tier':'II','edges':{'n':5,'s':3,'e':4,'w':9},'power':2},
  {'id':'cr_x3','name':'CRYSTAL LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

MYCOS_CARDS = [
  {'id':'my_t1a','name':'SPORE ANCHOR','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'my_t1b','name':'FUNGAL GROWTH','tier':'I','edges':{'n':5,'s':3,'e':4,'w':3},'power':1},
  {'id':'my_t1c','name':'BLOOM SEED','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'my_t1d','name':'MYCO WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'my_t1e','name':'HYPHAE RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'my_t2a','name':'MYCELIUM WEB','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':2},
  {'id':'my_t2b','name':'SPORE CLOUD','tier':'II','edges':{'n':6,'s':4,'e':6,'w':5},'power':2},
  {'id':'my_t2c','name':'TENDRIL SURGE','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'my_t3a','name':'BLOOM SURGE','tier':'III','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'my_t3b','name':'SPORE STRIKER','tier':'III','edges':{'n':5,'s':3,'e':8,'w':5},'power':3},
  {'id':'my_t3c','name':'MOLD LANCE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'my_t4','name':'THE MYCELORD','tier':'IV','edges':{'n':8,'s':6,'e':7,'w':7},'power':4},
  {'id':'my_x1','name':'FUNGAL NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'my_x2','name':'BLOOM BATTERY','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'my_x3','name':'SPORE BLADE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

VEIL_CARDS = [
  {'id':'vl_t1a','name':'LIGHT ANCHOR','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'vl_t1b','name':'PHASE NODE','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'vl_t1c','name':'SHIMMER POINT','tier':'I','edges':{'n':5,'s':2,'e':4,'w':4},'power':1},
  {'id':'vl_t1d','name':'VEIL WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'vl_t1e','name':'PHOTON RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'vl_t2a','name':'SHIMMER SCREEN','tier':'II','edges':{'n':7,'s':3,'e':5,'w':6},'power':2},
  {'id':'vl_t2b','name':'PHASE WING','tier':'II','edges':{'n':7,'s':3,'e':4,'w':7},'power':2},
  {'id':'vl_t2c','name':'CLOAK ARRAY','tier':'II','edges':{'n':5,'s':3,'e':4,'w':9},'power':2},
  {'id':'vl_t3a','name':'NULL LANCE','tier':'III','edges':{'n':7,'s':3,'e':5,'w':6},'power':3},
  {'id':'vl_t3b','name':'BLINK STRIKER','tier':'III','edges':{'n':5,'s':3,'e':4,'w':9},'power':3},
  {'id':'vl_t3c','name':'PHANTOM BLADE','tier':'III','edges':{'n':5,'s':5,'e':5,'w':6},'power':3},
  {'id':'vl_t4','name':'THE REFRACTION','tier':'IV','edges':{'n':7,'s':6,'e':7,'w':8},'power':4},
  {'id':'vl_x1','name':'GLIMMER NODE','tier':'I','edges':{'n':5,'s':5,'e':5,'w':6},'power':1},
  {'id':'vl_x2','name':'PHASE BATTERY','tier':'II','edges':{'n':5,'s':3,'e':4,'w':9},'power':2},
  {'id':'vl_x3','name':'GHOST LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

ENTROPY_CARDS = [
  {'id':'en_t1a','name':'RUST ANCHOR','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'en_t1b','name':'DECAY NODE','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'en_t1c','name':'CORRODE POINT','tier':'I','edges':{'n':5,'s':2,'e':4,'w':4},'power':1},
  {'id':'en_t1d','name':'ENTROPY WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'en_t1e','name':'DECAY RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'en_t2a','name':'CORRODE CLUSTER','tier':'II','edges':{'n':6,'s':3,'e':7,'w':5},'power':2},
  {'id':'en_t2b','name':'RUST SURGE','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':2},
  {'id':'en_t2c','name':'BLIGHT MASS','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'en_t3a','name':'DISSOLUTION LANCE','tier':'III','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'en_t3b','name':'DECAY STRIKER','tier':'III','edges':{'n':5,'s':3,'e':8,'w':5},'power':3},
  {'id':'en_t3c','name':'ENTROPY BLADE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'en_t4','name':'THE COLLAPSE','tier':'IV','edges':{'n':7,'s':6,'e':8,'w':7},'power':4},
  {'id':'en_x1','name':'RUST NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'en_x2','name':'BLIGHT BATTERY','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'en_x3','name':'DECAY LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

VOID_CARDS = [
  {'id':'vo_t1a','name':'NULL NODE','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'vo_t1b','name':'DARK SEED','tier':'I','edges':{'n':7,'s':2,'e':3,'w':3},'power':1},
  {'id':'vo_t1c','name':'VOID ANCHOR','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'vo_t1d','name':'EVENT WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'vo_t1e','name':'GRAVITY RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'vo_t2a','name':'DARK CLUSTER','tier':'II','edges':{'n':7,'s':3,'e':7,'w':4},'power':2},
  {'id':'vo_t2b','name':'VOID WING','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':2},
  {'id':'vo_t2c','name':'SHADOW MASS','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'vo_t3a','name':'SINGULARITY LANCE','tier':'III','edges':{'n':7,'s':3,'e':7,'w':4},'power':3},
  {'id':'vo_t3b','name':'VOID STRIKER','tier':'III','edges':{'n':5,'s':3,'e':9,'w':4},'power':3},
  {'id':'vo_t3c','name':'DARK LANCE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'vo_t4','name':'THE ABYSS','tier':'IV','edges':{'n':8,'s':6,'e':8,'w':6},'power':4},
  {'id':'vo_x1','name':'NULL SHARD','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'vo_x2','name':'SHADOW BATTERY','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'vo_x3','name':'VOID LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

GAS_CARDS = [
  {'id':'gs_t1a','name':'STORM CELL','tier':'I','edges':{'n':6,'s':3,'e':3,'w':3},'power':1},
  {'id':'gs_t1b','name':'PLASMA NODE','tier':'I','edges':{'n':6,'s':3,'e':3,'w':3},'power':1},
  {'id':'gs_t1c','name':'ION SEED','tier':'I','edges':{'n':5,'s':3,'e':4,'w':3},'power':1},
  {'id':'gs_t1d','name':'STORM WALL','tier':'I','edges':{'n':3,'s':7,'e':3,'w':3},'power':1},
  {'id':'gs_t1e','name':'PLASMA RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'gs_t2a','name':'PLASMA WING','tier':'II','edges':{'n':7,'s':4,'e':5,'w':5},'power':2},
  {'id':'gs_t2b','name':'ION SURGE','tier':'II','edges':{'n':6,'s':5,'e':5,'w':5},'power':2},
  {'id':'gs_t2c','name':'STORM MASS','tier':'II','edges':{'n':5,'s':4,'e':7,'w':5},'power':2},
  {'id':'gs_t3a','name':'TEMPEST LANCE','tier':'III','edges':{'n':7,'s':4,'e':5,'w':5},'power':3},
  {'id':'gs_t3b','name':'GALE STRIKER','tier':'III','edges':{'n':5,'s':4,'e':7,'w':5},'power':3},
  {'id':'gs_t3c','name':'PLASMA BLADE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'gs_t4','name':'THE MAELSTROM','tier':'IV','edges':{'n':7,'s':7,'e':7,'w':7},'power':4},
  {'id':'gs_x1','name':'ION NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'gs_x2','name':'STORM BATTERY','tier':'II','edges':{'n':5,'s':4,'e':7,'w':5},'power':2},
  {'id':'gs_x3','name':'GALE LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

LITHOS_CARDS = [
  {'id':'li_t1a','name':'STONE ANCHOR','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'li_t1b','name':'ROCK NODE','tier':'I','edges':{'n':5,'s':2,'e':3,'w':5},'power':1},
  {'id':'li_t1c','name':'BASALT POINT','tier':'I','edges':{'n':6,'s':2,'e':3,'w':4},'power':1},
  {'id':'li_t1d','name':'TECTONIC WALL','tier':'I','edges':{'n':3,'s':6,'e':3,'w':4},'power':1},
  {'id':'li_t1e','name':'GEODE RING','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':1},
  {'id':'li_t2a','name':'TECTONIC CLUSTER','tier':'II','edges':{'n':6,'s':3,'e':5,'w':7},'power':2},
  {'id':'li_t2b','name':'QUAKE SURGE','tier':'II','edges':{'n':7,'s':3,'e':4,'w':7},'power':2},
  {'id':'li_t2c','name':'BASALT MASS','tier':'II','edges':{'n':5,'s':3,'e':4,'w':9},'power':2},
  {'id':'li_t3a','name':'SEISMIC LANCE','tier':'III','edges':{'n':7,'s':3,'e':5,'w':6},'power':3},
  {'id':'li_t3b','name':'ROCK STRIKER','tier':'III','edges':{'n':5,'s':3,'e':4,'w':9},'power':3},
  {'id':'li_t3c','name':'GRAVEL BLADE','tier':'III','edges':{'n':5,'s':5,'e':4,'w':7},'power':3},
  {'id':'li_t4','name':'THE MONOLITH','tier':'IV','edges':{'n':7,'s':6,'e':6,'w':9},'power':4},
  {'id':'li_x1','name':'FLINT NODE','tier':'I','edges':{'n':5,'s':5,'e':5,'w':6},'power':1},
  {'id':'li_x2','name':'SLATE BATTERY','tier':'II','edges':{'n':5,'s':3,'e':4,'w':9},'power':2},
  {'id':'li_x3','name':'QUAKE LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

QUANTUM_CARDS = [
  {'id':'qu_t1a','name':'PROBABILITY NODE','tier':'I','edges':{'n':5,'s':3,'e':4,'w':3},'power':1},
  {'id':'qu_t1b','name':'SUPERPOSED SEED','tier':'I','edges':{'n':5,'s':3,'e':4,'w':3},'power':1},
  {'id':'qu_t1c','name':'QUBIT ANCHOR','tier':'I','edges':{'n':5,'s':3,'e':4,'w':3},'power':1},
  {'id':'qu_t1d','name':'ENTANGLE WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'qu_t1e','name':'SPIN RING','tier':'I','edges':{'n':4,'s':5,'e':4,'w':3},'power':1},
  {'id':'qu_t2a','name':'SUPERPOSED ARRAY','tier':'II','edges':{'n':6,'s':4,'e':6,'w':5},'power':2},
  {'id':'qu_t2b','name':'QUBIT WING','tier':'II','edges':{'n':6,'s':4,'e':5,'w':6},'power':2},
  {'id':'qu_t2c','name':'ENTANGLE MASS','tier':'II','edges':{'n':5,'s':4,'e':7,'w':5},'power':2},
  {'id':'qu_t3a','name':'WAVEFORM LANCE','tier':'III','edges':{'n':6,'s':4,'e':6,'w':5},'power':3},
  {'id':'qu_t3b','name':'COLLAPSE STRIKER','tier':'III','edges':{'n':5,'s':4,'e':7,'w':5},'power':3},
  {'id':'qu_t3c','name':'QUBIT BLADE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'qu_t4','name':'THE OBSERVER','tier':'IV','edges':{'n':7,'s':7,'e':7,'w':7},'power':4},
  {'id':'qu_x1','name':'SPIN NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'qu_x2','name':'QUBIT BATTERY','tier':'II','edges':{'n':5,'s':4,'e':7,'w':5},'power':2},
  {'id':'qu_x3','name':'COLLAPSE LANCE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

CHOIR_CARDS = [
  {'id':'ch_t1a','name':'HARMONIC NODE','tier':'I','edges':{'n':6,'s':2,'e':5,'w':3},'power':1},
  {'id':'ch_t1b','name':'RESONANCE SEED','tier':'I','edges':{'n':6,'s':2,'e':5,'w':3},'power':1},
  {'id':'ch_t1c','name':'SONIC ANCHOR','tier':'I','edges':{'n':5,'s':2,'e':5,'w':3},'power':1},
  {'id':'ch_t1d','name':'TONE WALL','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'ch_t1e','name':'CHOIR RING','tier':'I','edges':{'n':4,'s':4,'e':5,'w':3},'power':1},
  {'id':'ch_t2a','name':'RESONANCE CHOIR','tier':'II','edges':{'n':6,'s':3,'e':7,'w':5},'power':2},
  {'id':'ch_t2b','name':'HARMONIC SURGE','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':2},
  {'id':'ch_t2c','name':'SONIC MASS','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'ch_t3a','name':'SONIC LANCE','tier':'III','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'ch_t3b','name':'TONE STRIKER','tier':'III','edges':{'n':5,'s':3,'e':9,'w':4},'power':3},
  {'id':'ch_t3c','name':'DISCORD BLADE','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':3},
  {'id':'ch_t4','name':'THE CRESCENDO','tier':'IV','edges':{'n':7,'s':6,'e':9,'w':6},'power':4},
  {'id':'ch_x1','name':'TONE NODE','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'ch_x2','name':'CHORD BATTERY','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'ch_x3','name':'SONIC BLADE','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':3},
]

TERRAN_CARDS = [
  {'id':'ta_t1a','name':'COLONY WORLD A','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'ta_t1b','name':'COLONY WORLD B','tier':'I','edges':{'n':5,'s':2,'e':4,'w':4},'power':1},
  {'id':'ta_t1c','name':'COLONY WORLD C','tier':'I','edges':{'n':6,'s':2,'e':4,'w':3},'power':1},
  {'id':'ta_t1d','name':'FRONTIER POST','tier':'I','edges':{'n':3,'s':6,'e':4,'w':3},'power':1},
  {'id':'ta_t1e','name':'SUPPLY HUB','tier':'I','edges':{'n':4,'s':4,'e':4,'w':4},'power':2},
  {'id':'ta_t2a','name':'BATTLE GROUP','tier':'II','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'ta_t2b','name':'CARRIER WING','tier':'II','edges':{'n':7,'s':3,'e':5,'w':6},'power':3},
  {'id':'ta_t2c','name':'STRIKE FORCE','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'ta_t3a','name':'INTERCEPTOR','tier':'III','edges':{'n':7,'s':3,'e':6,'w':5},'power':3},
  {'id':'ta_t3b','name':'FAST RUNNER','tier':'III','edges':{'n':5,'s':3,'e':8,'w':5},'power':2},
  {'id':'ta_t3c','name':'FLANKER','tier':'III','edges':{'n':5,'s':5,'e':6,'w':5},'power':2},
  {'id':'ta_t4','name':'THE ACCORD','tier':'IV','edges':{'n':7,'s':6,'e':8,'w':7},'power':4},
  {'id':'ta_x1','name':'MINING COLONY','tier':'I','edges':{'n':5,'s':5,'e':6,'w':5},'power':1},
  {'id':'ta_x2','name':'GUNSHIP WING','tier':'II','edges':{'n':5,'s':3,'e':8,'w':5},'power':3},
  {'id':'ta_x3','name':'GHOST RUNNER','tier':'III','edges':{'n':3,'s':8,'e':5,'w':5},'power':2},
]

ALL_DECKS = {
  'terran': TERRAN_CARDS,
  'brood': BROOD_CARDS,
  'crystallis': CRYSTALLIS_CARDS,
  'mycos': MYCOS_CARDS,
  'veil': VEIL_CARDS,
  'entropy': ENTROPY_CARDS,
  'void': VOID_CARDS,
  'gas': GAS_CARDS,
  'lithos': LITHOS_CARDS,
  'quantum': QUANTUM_CARDS,
  'choir': CHOIR_CARDS,
}

FACTION_NAMES = {
  'terran': 'TERRAN ACCORD',
  'brood': 'BROOD SOVEREIGN',
  'crystallis': 'CRYSTALLIS',
  'mycos': 'MYCOS DRIFT',
  'veil': 'THE VEIL',
  'entropy': 'ENTROPY CULT',
  'void': 'VOID HUNTERS',
  'gas': 'GAS NOMADS',
  'lithos': 'LITHOS',
  'quantum': 'QUANTUM THREAD',
  'choir': 'THE CHOIR',
}

FACTION_COLORS = {
  'terran': '#7ab8e8',
  'brood': '#88cc44',
  'crystallis': '#a8d8ff',
  'mycos': '#9dcf6e',
  'veil': '#fff5a0',
  'entropy': '#c4723a',
  'void': '#9b59b6',
  'gas': '#ffd700',
  'lithos': '#a0896a',
  'quantum': '#ff69b4',
  'choir': '#c8c8ff',
}

# Direction mappings: when placed at (r,c), this card's edge fights neighbor's opposite edge
DIRS4 = [
  {'dr':-1,'dc':0,'myE':'n','theirE':'s'},  # north neighbor: my N vs their S
  {'dr':1,'dc':0,'myE':'s','theirE':'n'},   # south neighbor: my S vs their N
  {'dr':0,'dc':-1,'myE':'w','theirE':'e'},  # west neighbor: my W vs their E
  {'dr':0,'dc':1,'myE':'e','theirE':'w'},   # east neighbor: my E vs their W
]

def flip_ns(card):
    """Return a copy of card with N and S edges swapped (AI perspective attacks downward)."""
    c = copy.deepcopy(card)
    c['edges'] = {
        'n': card['edges']['s'],
        's': card['edges']['n'],
        'e': card['edges']['e'],
        'w': card['edges']['w'],
    }
    return c

def compute_battle_results(grid):
    """
    Compute battle wins/losses for each cell.
    Returns b[r][c] = {'hW':0,'hL':0,'vW':0,'vL':0}
    """
    b = [[{'hW':0,'hL':0,'vW':0,'vL':0} for _ in range(7)] for _ in range(5)]

    for r in range(5):
        for c in range(7):
            cell = grid[r][c]
            if cell is None:
                continue

            # H battle: this cell vs East neighbor
            if c < 6:
                east = grid[r][c+1]
                if east is not None and east['owner'] != cell['owner']:
                    me = cell['edges']['e']
                    them = east['edges']['w']
                    if me > them:
                        b[r][c]['hW'] += 1
                        b[r][c+1]['hL'] += 1
                    elif them > me:
                        b[r][c+1]['hW'] += 1
                        b[r][c]['hL'] += 1
                    else:
                        # tie: both get a loss
                        b[r][c]['hL'] += 1
                        b[r][c+1]['hL'] += 1

            # V battle: this cell vs South neighbor
            if r < 4:
                south = grid[r+1][c]
                if south is not None and south['owner'] != cell['owner']:
                    me = cell['edges']['s']
                    them = south['edges']['n']
                    if me > them:
                        b[r][c]['vW'] += 1
                        b[r+1][c]['vL'] += 1
                    elif them > me:
                        b[r+1][c]['vW'] += 1
                        b[r][c]['vL'] += 1
                    else:
                        b[r][c]['vL'] += 1
                        b[r+1][c]['vL'] += 1

    # Convert to h/v win/loss/none
    result = [[None]*7 for _ in range(5)]
    for r in range(5):
        for c in range(7):
            cell = grid[r][c]
            if cell is None:
                result[r][c] = None
                continue
            bb = b[r][c]
            # H: win if hW>0 and hL==0, none if no battles, else lose
            has_h_battle = (bb['hW'] + bb['hL']) > 0
            has_v_battle = (bb['vW'] + bb['vL']) > 0
            h = 'none'
            v = 'none'
            if has_h_battle:
                h = 'win' if (bb['hW'] > 0 and bb['hL'] == 0) else 'lose'
            if has_v_battle:
                v = 'win' if (bb['vW'] > 0 and bb['vL'] == 0) else 'lose'
            result[r][c] = {'h': h, 'v': v}

    return result

def compute_scores(grid):
    """Compute row/col power sums and VP delta using battle results."""
    battles = compute_battle_results(grid)

    rows = [{'p':0,'a':0} for _ in range(5)]
    cols = [{'p':0,'a':0} for _ in range(7)]

    for r in range(5):
        for c in range(7):
            cell = grid[r][c]
            if cell is None:
                continue
            bat = battles[r][c]
            if bat is None:
                continue
            counts_h = bat['h'] in ('win', 'none')
            counts_v = bat['v'] in ('win', 'none')
            power = cell['power']
            owner_key = cell['owner'][0]  # 'p' or 'a'
            if counts_h:
                rows[r][owner_key] += power
            if counts_v:
                cols[c][owner_key] += power

    row_results = []
    for row in rows:
        if row['p'] > row['a']:
            row_results.append('p')
        elif row['a'] > row['p']:
            row_results.append('a')
        else:
            row_results.append('tie')

    col_results = []
    for col in cols:
        if col['p'] > col['a']:
            col_results.append('p')
        elif col['a'] > col['p']:
            col_results.append('a')
        else:
            col_results.append('tie')

    # Delta VP: pure delta per row/col
    pVP = 0
    aVP = 0
    for row in rows:
        net = row['p'] - row['a']
        if net > 0:
            pVP += net
        elif net < 0:
            aVP += (-net)
    for col in cols:
        net = col['p'] - col['a']
        if net > 0:
            pVP += net
        elif net < 0:
            aVP += (-net)

    return {
        'rows': rows, 'cols': cols,
        'rowResults': row_results, 'colResults': col_results,
        'pVP': pVP, 'aVP': aVP
    }

def get_valid_placements(grid):
    """Get all empty cells."""
    return [(r, c) for r in range(5) for c in range(7) if grid[r][c] is None]

def greedy_move(grid, hand, owner):
    """
    Greedy heuristic from spec:
    score = card.power + 2*(row not owned by owner) + 2*(col not owned by owner)
          + sum(1 for adj enemy where my_edge > their_edge)
          + r*0.2 + (2.5-abs(2.5-c))*0.1 + random()*0.5

    owner: 'player' or 'ai'
    enemy: 'ai' if owner=='player' else 'player'
    """
    avail = [c for c in hand if not c.get('used', False)]
    if not avail:
        return None, -1, -1

    best_score = -float('inf')
    best_card = None
    best_r = -1
    best_c = -1

    enemy = 'ai' if owner == 'player' else 'player'
    owner_key = owner[0]  # 'p' or 'a'

    s = compute_scores(grid)

    placements = get_valid_placements(grid)
    if not placements:
        return None, -1, -1

    for card in avail:
        for (r, c) in placements:
            score = card['power']

            # +2 if row not owned by this player
            if s['rowResults'][r] != owner_key:
                score += 2
            # +2 if col not owned by this player
            if s['colResults'][c] != owner_key:
                score += 2

            # +1 for each adjacent enemy card where my edge beats their edge
            for d in DIRS4:
                nr, nc = r + d['dr'], c + d['dc']
                if 0 <= nr < 5 and 0 <= nc < 7 and grid[nr][nc] is not None:
                    neighbor = grid[nr][nc]
                    if neighbor['owner'] == enemy:
                        if card['edges'][d['myE']] > neighbor['edges'][d['theirE']]:
                            score += 1

            # Positional bias + noise
            score += r * 0.2 + (2.5 - abs(2.5 - c)) * 0.1 + random.random() * 0.5

            if score > best_score:
                best_score = score
                best_card = card
                best_r = r
                best_c = c

    return best_card, best_r, best_c

def simulate_game(player_faction, ai_faction, decks):
    """
    Simulate one game between player_faction (as player) and ai_faction (as AI).
    Returns 'player' or 'ai' winner based on VP.
    Player attacks upward (N edge faces enemy), AI attacks downward (N/S flipped).
    """
    tier_pow = {'I':1,'II':2,'III':3,'IV':4}

    # Build player hand (as-is)
    p_cards = []
    for c in decks[player_faction]:
        card = copy.deepcopy(c)
        card['power'] = tier_pow.get(card['tier'], card['power'])
        card['used'] = False
        p_cards.append(card)

    # Build AI hand (N/S flipped — AI attacks downward)
    a_cards = []
    for c in decks[ai_faction]:
        card = flip_ns(c)
        card['power'] = tier_pow.get(card['tier'], card['power'])
        card['used'] = False
        a_cards.append(card)

    # 5x7 grid, None = empty
    # Each placed cell: {'owner': 'player'/'ai', 'power': int, 'edges': {n,s,e,w}}
    grid = [[None]*7 for _ in range(5)]

    total_cards = len(p_cards) + len(a_cards)
    turn = 'player'

    for _ in range(total_cards):
        if not get_valid_placements(grid):
            break

        if turn == 'player':
            avail = [c for c in p_cards if not c['used']]
            if not avail:
                turn = 'ai'
                avail2 = [c for c in a_cards if not c['used']]
                if not avail2:
                    break
                card, r, c = greedy_move(grid, a_cards, 'ai')
                if card is None or r < 0:
                    break
                grid[r][c] = {'owner': 'ai', 'power': card['power'], 'edges': card['edges']}
                card['used'] = True
                turn = 'player'
                continue

            card, r, c = greedy_move(grid, p_cards, 'player')
            if card is None or r < 0:
                turn = 'ai'
                continue
            grid[r][c] = {'owner': 'player', 'power': card['power'], 'edges': card['edges']}
            card['used'] = True
            turn = 'ai'
        else:
            avail = [c for c in a_cards if not c['used']]
            if not avail:
                turn = 'player'
                avail2 = [c for c in p_cards if not p['used']]
                if not avail2:
                    break
                card, r, c = greedy_move(grid, p_cards, 'player')
                if card is None or r < 0:
                    break
                grid[r][c] = {'owner': 'player', 'power': card['power'], 'edges': card['edges']}
                card['used'] = True
                turn = 'ai'
                continue

            card, r, c = greedy_move(grid, a_cards, 'ai')
            if card is None or r < 0:
                turn = 'player'
                continue
            grid[r][c] = {'owner': 'ai', 'power': card['power'], 'edges': card['edges']}
            card['used'] = True
            turn = 'player'

    # Final score
    s = compute_scores(grid)
    if s['pVP'] > s['aVP']:
        return 'player'
    elif s['aVP'] > s['pVP']:
        return 'ai'
    else:
        # Tie-break: count cells
        p_cells = sum(1 for r in range(5) for c in range(7) if grid[r][c] and grid[r][c]['owner']=='player')
        a_cells = sum(1 for r in range(5) for c in range(7) if grid[r][c] and grid[r][c]['owner']=='ai')
        return 'player' if p_cells >= a_cells else 'ai'

def run_tournament(decks, games_per_pair=10):
    """
    Run all ordered faction pairs (A as player vs B as AI, and B as player vs A as AI).
    Returns:
      win_matrix[pf][af] = number of wins for pf as player vs af as AI
      game_matrix[pf][af] = number of games
    """
    factions = list(decks.keys())

    win_matrix = {f: {g: 0 for g in factions} for f in factions}
    game_matrix = {f: {g: 0 for g in factions} for f in factions}

    pair_count = 0
    for pf in factions:
        for af in factions:
            if pf == af:
                continue
            pair_count += 1
            wins = 0
            for _ in range(games_per_pair):
                result = simulate_game(pf, af, decks)
                if result == 'player':
                    wins += 1
            win_matrix[pf][af] = wins
            game_matrix[pf][af] = games_per_pair

    print(f"  Ran {pair_count} pairs x {games_per_pair} games = {pair_count * games_per_pair} total games")
    return win_matrix, game_matrix

def compute_faction_winrates(win_matrix, game_matrix, factions):
    """
    For each faction, compute its overall win rate considering BOTH roles:
    - As player vs each opponent
    - As AI vs each opponent (wins = total games - opponent's wins as player)
    """
    rates = {}
    for f in factions:
        total_wins = 0
        total_games = 0
        for other in factions:
            if other == f:
                continue
            # As player vs other (as AI)
            total_wins += win_matrix[f][other]
            total_games += game_matrix[f][other]
            # As AI vs other (as player): f wins = games played - other's wins
            total_wins += (game_matrix[other][f] - win_matrix[other][f])
            total_games += game_matrix[other][f]
        rates[f] = total_wins / total_games if total_games > 0 else 0.5
    return rates

def adjust_deck(deck_name, decks, direction, changes_log):
    """
    Make targeted edge adjustments (+1 or -1 on N edges of T2/T3 cards).
    direction: 'buff' (too weak) or 'nerf' (too strong)
    Adjust up to 3 T2/T3 cards.
    """
    deck = decks[deck_name]
    adjusted = 0
    for card in deck:
        if card['tier'] in ('II', 'III'):
            if direction == 'buff':
                if card['edges']['n'] < 9:
                    card['edges']['n'] = card['edges']['n'] + 1
                    adjusted += 1
                    changes_log.append(f"{deck_name}: {card['name']} N +1 -> {card['edges']['n']}")
                    if adjusted >= 3:
                        break
            elif direction == 'nerf':
                if card['edges']['n'] > 1:
                    card['edges']['n'] = card['edges']['n'] - 1
                    adjusted += 1
                    changes_log.append(f"{deck_name}: {card['name']} N -1 -> {card['edges']['n']}")
                    if adjusted >= 3:
                        break
    return adjusted > 0

def main():
    print("GALACTIC ZERO - Balance Simulator")
    print("=" * 50)

    current_decks = {k: copy.deepcopy(v) for k, v in ALL_DECKS.items()}
    factions = list(current_decks.keys())

    all_iterations = []
    all_changes = []

    # Iteration 0: baseline
    print("\nIteration 0 (baseline):")
    win_matrix, game_matrix = run_tournament(current_decks, games_per_pair=10)
    rates = compute_faction_winrates(win_matrix, game_matrix, factions)

    print("\nInitial win rates:")
    for f in sorted(factions, key=lambda x: rates[x]):
        pct = rates[f] * 100
        status = "OK" if 43 <= pct <= 58 else ("WEAK" if pct < 43 else "STRONG")
        print(f"  {FACTION_NAMES[f]:25s}: {pct:.1f}% [{status}]")

    all_iterations.append({
        'iter': 0,
        'win_matrix': copy.deepcopy(win_matrix),
        'game_matrix': copy.deepcopy(game_matrix),
        'rates': copy.deepcopy(rates),
        'changes': []
    })

    # Iterative balancing (up to 5 iterations)
    for iteration in range(1, 6):
        weak = [f for f in factions if rates[f]*100 < 43]
        strong = [f for f in factions if rates[f]*100 > 58]

        if not weak and not strong:
            print(f"\nAll factions in range after iteration {iteration-1}!")
            break

        print(f"\nIteration {iteration}:")
        if weak:
            print(f"  Too weak: {[FACTION_NAMES[f] for f in weak]}")
        if strong:
            print(f"  Too strong: {[FACTION_NAMES[f] for f in strong]}")

        iteration_changes = []
        any_changed = False

        for f in weak:
            if adjust_deck(f, current_decks, 'buff', iteration_changes):
                any_changed = True
        for f in strong:
            if adjust_deck(f, current_decks, 'nerf', iteration_changes):
                any_changed = True

        if not any_changed:
            print("  No changes possible (cards at limits)")
            break

        all_changes.extend([(iteration, c) for c in iteration_changes])
        print(f"  Changes made ({len(iteration_changes)}):")
        for c in iteration_changes:
            print(f"    - {c}")

        # Re-run
        win_matrix, game_matrix = run_tournament(current_decks, games_per_pair=10)
        rates = compute_faction_winrates(win_matrix, game_matrix, factions)

        print("\n  Updated win rates:")
        for f in sorted(factions, key=lambda x: rates[x]):
            pct = rates[f] * 100
            status = "OK" if 43 <= pct <= 58 else ("WEAK" if pct < 43 else "STRONG")
            print(f"    {FACTION_NAMES[f]:25s}: {pct:.1f}% [{status}]")

        all_iterations.append({
            'iter': iteration,
            'win_matrix': copy.deepcopy(win_matrix),
            'game_matrix': copy.deepcopy(game_matrix),
            'rates': copy.deepcopy(rates),
            'changes': iteration_changes
        })

    # Final results
    final_iter = all_iterations[-1]
    final_rates = final_iter['rates']
    final_win_matrix = final_iter['win_matrix']
    final_game_matrix = final_iter['game_matrix']

    # Std dev from 50%
    def std_from_50(r):
        return math.sqrt(sum((v*100-50)**2 for v in r.values()) / len(r))

    initial_std = std_from_50(all_iterations[0]['rates'])
    final_std = std_from_50(final_rates)

    print(f"\nBalance Score:")
    print(f"  Initial std dev from 50%: {initial_std:.2f}%")
    print(f"  Final std dev from 50%: {final_std:.2f}%")
    print(f"  Improvement: {initial_std - final_std:.2f}% points")

    # Build pct_matrix for report
    pct_matrix = {}
    for pf in factions:
        pct_matrix[pf] = {}
        for af in factions:
            if pf == af:
                pct_matrix[pf][af] = None
            else:
                games = final_game_matrix[pf][af]
                wins = final_win_matrix[pf][af]
                pct_matrix[pf][af] = round(wins / games * 100, 1) if games > 0 else 50.0

    # Save results
    output = {
        'final_rates': {k: round(v*100, 2) for k,v in final_rates.items()},
        'initial_rates': {k: round(v*100, 2) for k,v in all_iterations[0]['rates'].items()},
        'pct_matrix': pct_matrix,
        'factions': factions,
        'faction_names': FACTION_NAMES,
        'faction_colors': FACTION_COLORS,
        'all_changes': [(it, c) for it, c in all_changes],
        'initial_std': round(initial_std, 2),
        'final_std': round(final_std, 2),
        'num_iterations': len(all_iterations) - 1,
        'iterations_detail': [
            {'iter': it['iter'], 'changes': it['changes'],
             'rates': {k: round(v*100,2) for k,v in it['rates'].items()}}
            for it in all_iterations
        ],
    }

    with open('balance_results.json', 'w') as f:
        json.dump(output, f, indent=2)

    print("\nResults saved to balance_results.json")
    return output

if __name__ == '__main__':
    random.seed(42)
    result = main()

// Dinosaur data used throughout the app
export interface DinoData {
    id: string;
    name: string;
    emoji: string;
    habitat: "fossil" | "aquatic" | "jungle";
    color: string;
    bgGradient: string;
    period: string;
    diet: string;
    length: string;
    funFact: string;
    incomePerSec: number;
    unlockCost: number;
}

export const ALL_DINOS: DinoData[] = [
    // Fossil Habitat
    {
        id: "stego", name: "Stegosaurus", emoji: "🦕", habitat: "fossil",
        color: "#8D6E63", bgGradient: "linear-gradient(135deg, #D7CCC8, #BCAAA4)",
        period: "Jurassic", diet: "Herbivore", length: "9m",
        funFact: "Had a brain the size of a walnut!",
        incomePerSec: 1, unlockCost: 0,
    },
    {
        id: "triceratops", name: "Triceratops", emoji: "🦖", habitat: "fossil",
        color: "#A1887F", bgGradient: "linear-gradient(135deg, #EFEBE9, #D7CCC8)",
        period: "Cretaceous", diet: "Herbivore", length: "9m",
        funFact: "Had 3 horns and a large bony frill!",
        incomePerSec: 2, unlockCost: 50,
    },
    {
        id: "anky", name: "Ankylosaurus", emoji: "🐊", habitat: "fossil",
        color: "#795548", bgGradient: "linear-gradient(135deg, #D7CCC8, #A1887F)",
        period: "Cretaceous", diet: "Herbivore", length: "6.5m",
        funFact: "Covered in bony armor like a living tank!",
        incomePerSec: 3, unlockCost: 120,
    },
    {
        id: "allo", name: "Allosaurus", emoji: "🦖", habitat: "fossil",
        color: "#6D4C41", bgGradient: "linear-gradient(135deg, #BCAAA4, #8D6E63)",
        period: "Jurassic", diet: "Carnivore", length: "12m",
        funFact: "A top predator long before T-Rex!",
        incomePerSec: 4, unlockCost: 250,
    },
    // Aquatic Habitat
    {
        id: "mosasaur", name: "Mosasaurus", emoji: "🐋", habitat: "aquatic",
        color: "#2A9D8F", bgGradient: "linear-gradient(135deg, #B2DFDB, #80CBC4)",
        period: "Cretaceous", diet: "Carnivore", length: "17m",
        funFact: "Was a marine reptile, not actually a dinosaur!",
        incomePerSec: 5, unlockCost: 400,
    },
    {
        id: "plesio", name: "Plesiosaurus", emoji: "🐉", habitat: "aquatic",
        color: "#00897B", bgGradient: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
        period: "Jurassic", diet: "Carnivore", length: "3.5m",
        funFact: "Inspired the legend of the Loch Ness Monster!",
        incomePerSec: 6, unlockCost: 600,
    },
    {
        id: "ichthy", name: "Ichthyosaurus", emoji: "🐬", habitat: "aquatic",
        color: "#4DB6AC", bgGradient: "linear-gradient(135deg, #B2DFDB, #80CBC4)",
        period: "Jurassic", diet: "Carnivore", length: "2m",
        funFact: "Looked like a dolphin but lived millions of years before dolphins!",
        incomePerSec: 4, unlockCost: 350,
    },
    // Jungle Habitat
    {
        id: "trex", name: "T-Rex", emoji: "🦖", habitat: "jungle",
        color: "#3A7D44", bgGradient: "linear-gradient(135deg, #C8E6C9, #A5D6A7)",
        period: "Cretaceous", diet: "Carnivore", length: "12m",
        funFact: "Had one of the strongest bite forces in history!",
        incomePerSec: 10, unlockCost: 1000,
    },
    {
        id: "raptor", name: "Velociraptor", emoji: "🦅", habitat: "jungle",
        color: "#5DBB63", bgGradient: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
        period: "Cretaceous", diet: "Carnivore", length: "2m",
        funFact: "Was actually covered in feathers!",
        incomePerSec: 7, unlockCost: 700,
    },
    {
        id: "brachio", name: "Brachiosaurus", emoji: "🦕", habitat: "jungle",
        color: "#66BB6A", bgGradient: "linear-gradient(135deg, #C8E6C9, #81C784)",
        period: "Jurassic", diet: "Herbivore", length: "22m",
        funFact: "Could reach treetops 9 meters high!",
        incomePerSec: 8, unlockCost: 800,
    },
    {
        id: "parasaur", name: "Parasaurolophus", emoji: "🦎", habitat: "jungle",
        color: "#81C784", bgGradient: "linear-gradient(135deg, #E8F5E9, #A5D6A7)",
        period: "Cretaceous", diet: "Herbivore", length: "10m",
        funFact: "Used its crest like a trumpet to make sounds!",
        incomePerSec: 6, unlockCost: 500,
    },
];

export const HABITATS = [
    { id: "fossil", name: "Fossil Caves", emoji: "🦴", color: "#8D6E63", bg: "#EFEBE9" },
    { id: "aquatic", name: "Prehistoric Ocean", emoji: "🌊", color: "#2A9D8F", bg: "#E0F2F1" },
    { id: "jungle", name: "Dino Jungle", emoji: "🌿", color: "#3A7D44", bg: "#E8F5E9" },
] as const;

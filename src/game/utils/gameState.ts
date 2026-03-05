// Game state management with idle income support

export interface GameState {
    coins: number;
    xp: number;
    level: number;
    unlockedDinosaurs: string[];
    customNames: Record<string, string>;
    soundRecordings: Record<string, string>; // base64 audio
    lastActiveTime: number; // timestamp for idle income calc
}

const STORAGE_KEY = "dinoquest_state";

export function createDefaultState(): GameState {
    return {
        coins: 10,
        xp: 0,
        level: 1,
        unlockedDinosaurs: ["stego"], // Start with Stego unlocked
        customNames: {},
        soundRecordings: {},
        lastActiveTime: Date.now(),
    };
}

export function loadGameState(): GameState {
    if (typeof window === "undefined") return createDefaultState();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw) as GameState;
            return saved;
        }
    } catch (e) {
        console.error("Failed to load game state:", e);
    }
    return createDefaultState();
}

export function saveGameState(state: GameState): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastActiveTime: Date.now() }));
    } catch (e) {
        console.error("Failed to save game state:", e);
    }
}

export function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

export function addXP(state: GameState, amount: number): GameState {
    const newXP = state.xp + amount;
    const newState = {
        ...state,
        xp: newXP,
        level: calculateLevel(newXP),
    };
    saveGameState(newState);
    return newState;
}

export function addCoins(state: GameState, amount: number): GameState {
    const newState = { ...state, coins: state.coins + amount };
    saveGameState(newState);
    return newState;
}

export function spendCoins(state: GameState, amount: number): GameState | null {
    if (state.coins < amount) return null;
    const newState = { ...state, coins: state.coins - amount };
    saveGameState(newState);
    return newState;
}

export function unlockDino(state: GameState, dinoId: string): GameState {
    if (state.unlockedDinosaurs.includes(dinoId)) return state;
    const newState = {
        ...state,
        unlockedDinosaurs: [...state.unlockedDinosaurs, dinoId],
    };
    saveGameState(newState);
    return newState;
}

// Calculate idle income earned while away
export function calculateIdleIncome(state: GameState, incomeRates: Record<string, number>): number {
    const now = Date.now();
    const elapsed = (now - state.lastActiveTime) / 1000; // seconds
    const maxIdleSeconds = 3600; // Cap at 1 hour
    const seconds = Math.min(elapsed, maxIdleSeconds);

    let totalIncome = 0;
    for (const dinoId of state.unlockedDinosaurs) {
        if (state.soundRecordings[dinoId]) {
            // Only dinos with recordings generate income
            totalIncome += (incomeRates[dinoId] || 1) * seconds;
        }
    }
    return Math.floor(totalIncome);
}

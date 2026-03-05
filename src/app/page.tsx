"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ALL_DINOS, DinoData } from "@/game/data/dinosaurs";
import { GameState, loadGameState, saveGameState, addCoins, spendCoins, unlockDino, calculateIdleIncome } from "@/game/utils/gameState";
import DinoCard from "@/game/components/DinoCard";
import InfoCard from "@/game/components/InfoCard";
import RecordModal from "@/game/components/RecordModal";
import Quiz from "@/game/components/Quiz";

// Dynamically import Phaser to render the world
const PhaserGame = dynamic(() => import("@/game/components/PhaserGame"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#FFF8E7]" />
});

type GamePhase = "landing" | "playing" | "interacting" | "recording" | "quiz";

export default function MuseumPage() {
  const [phase, setPhase] = useState<GamePhase>("landing");
  const [gameState, setGameState] = useState<GameState | null>(null);

  const [activeDino, setActiveDino] = useState<DinoData | null>(null);
  const [idleEarned, setIdleEarned] = useState<number>(0);
  const [showIdlePopup, setShowIdlePopup] = useState(false);

  const incomeTickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const state = loadGameState();
    const incomeRates: Record<string, number> = {};
    ALL_DINOS.forEach(d => { incomeRates[d.id] = d.incomePerSec; });
    const earned = calculateIdleIncome(state, incomeRates);

    if (earned > 0) {
      const newState = addCoins(state, earned);
      setGameState(newState);
      setIdleEarned(earned);
      setShowIdlePopup(true);
    } else {
      setGameState(state);
    }

    // Listen to Phaser scene interactions
    const handleInteract = (e: any) => {
      const dino = e.detail as DinoData;
      setActiveDino(dino);
      setPhase("interacting");
    };

    window.addEventListener("dino_interact", handleInteract);
    return () => window.removeEventListener("dino_interact", handleInteract);
  }, []);

  // Real-time idle ticker
  useEffect(() => {
    if (!gameState || phase === "landing") return;
    incomeTickRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev) return prev;
        let income = 0;
        prev.unlockedDinosaurs.forEach(id => {
          if (prev.soundRecordings[id]) {
            income += ALL_DINOS.find(d => d.id === id)?.incomePerSec || 0;
          }
        });
        if (income > 0) {
          const newState = { ...prev, coins: prev.coins + income };
          saveGameState(newState);
          return newState;
        }
        return prev;
      });
    }, 1000);

    return () => { if (incomeTickRef.current) clearInterval(incomeTickRef.current); };
  }, [gameState?.unlockedDinosaurs.length, phase]);

  const closeInteraction = useCallback(() => {
    setActiveDino(null);
    setPhase("playing");
  }, []);

  const handleUnlock = useCallback((dino: DinoData) => {
    if (!gameState) return;
    const after = spendCoins(gameState, dino.unlockCost);
    if (!after) return;
    setGameState(unlockDino(after, dino.id));
  }, [gameState]);

  const handleSaveRecording = useCallback((dinoId: string, blob: Blob) => {
    if (!gameState) return;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newState = {
        ...gameState,
        soundRecordings: { ...gameState.soundRecordings, [dinoId]: base64 },
      };
      setGameState(newState);
      saveGameState(newState);

      // Dispatch event to Phaser to play it immediately
      window.dispatchEvent(new CustomEvent("dino_recorded_sound", { detail: { id: dinoId, base64 } }));

      setPhase("interacting");
    };
  }, [gameState]);

  const handlePlaySound = useCallback((dinoId: string) => {
    if (!gameState?.soundRecordings[dinoId]) return;
    new Audio(gameState.soundRecordings[dinoId]).play().catch(() => { });
  }, [gameState]);

  const totalIncomePerSec = gameState ? ALL_DINOS.reduce((sum, d) => {
    return (gameState.unlockedDinosaurs.includes(d.id) && gameState.soundRecordings[d.id])
      ? sum + d.incomePerSec : sum;
  }, 0) : 0;

  if (!gameState) return null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#FFF8E7]">

      {/* ─── LANDING SCREEN ─── */}
      {phase === "landing" && (
        <div className="absolute inset-0 z-50 bg-[#FFF8E7] flex flex-col items-center justify-center p-6 text-center animate-fadeSlideUp">
          <div className="flex gap-4 text-7xl mb-6 select-none animate-wiggle">
            <span>🦕</span><span>🦖</span><span>🐋</span>
          </div>
          <h1 className="font-fredoka text-5xl text-[#3A7D44] mb-3">DinoQuest Museum</h1>
          <p className="font-nunito text-lg text-[#8D6E63] max-w-sm mb-12">
            Explore the park, discover prehistoric creatures, and give them your own voice!
          </p>
          <button
            onClick={() => setPhase("playing")}
            className="bg-[#5DBB63] hover:bg-[#4CAF50] text-white px-10 py-4 rounded-[2rem] font-fredoka text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulseGlow"
          >
            Start Adventure
          </button>
        </div>
      )}

      {/* ─── PHASER GAME WORLD ─── */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === "landing" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <PhaserGame />
      </div>

      {/* ─── HUD (When Playing) ─── */}
      {phase !== "landing" && (
        <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10 flex justify-between">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-md pointer-events-auto border-2 border-white flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-xl">⭐</span>
              <span className="font-fredoka text-[#3A7D44] text-xl">Lvl {gameState.level}</span>
            </div>
            <div className="w-32 h-3 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5DBB63] to-[#81C784] transition-all duration-500"
                style={{ width: `${(gameState.xp % 500) / 5}%` }}
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-md pointer-events-auto border-2 border-white flex items-center gap-3">
            <span className="text-2xl">🪙</span>
            <div>
              <p className="font-fredoka text-[#F4A261] text-xl leading-none">{Math.floor(gameState.coins).toLocaleString()}</p>
              {totalIncomePerSec > 0 && <p className="font-nunito text-[11px] text-[#F4A261] font-bold mt-0.5">+{totalIncomePerSec}/s</p>}
            </div>
          </div>
        </div>
      )}

      {/* ─── INTERACTION MODALS ─── */}
      {phase === "interacting" && activeDino && (
        <div className="absolute inset-0 z-40" onClick={closeInteraction}>
          {!gameState.unlockedDinosaurs.includes(activeDino.id) ? (
            <InfoCard
              dinosaur={activeDino}
              onClose={closeInteraction}
              onStartQuiz={() => setPhase("quiz")}
              onStartRecording={() => setPhase("recording")}
            />
          ) : (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeSlideUp">
              <div className="max-w-xs w-full" onClick={e => e.stopPropagation()}>
                <DinoCard
                  dino={activeDino}
                  isUnlocked={true}
                  hasRecording={!!gameState.soundRecordings[activeDino.id]}
                  customName={gameState.customNames[activeDino.id]}
                  coins={gameState.coins}
                  onUnlock={() => { }}
                  onRecord={() => setPhase("recording")}
                  onPlaySound={() => handlePlaySound(activeDino.id)}
                  onRename={(n) => setGameState(s => ({ ...s!, customNames: { ...s!.customNames, [activeDino.id]: n } }))}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── QUIZ MODAL ─── */}
      {phase === "quiz" && activeDino && (
        <Quiz
          dinosaur={activeDino}
          onClose={() => setPhase("interacting")}
          onComplete={(xp) => {
            const newState = unlockDino(gameState, activeDino.id);
            const withXp = { ...newState, xp: newState.xp + xp };
            setGameState(withXp);
            saveGameState(withXp);
            setPhase("interacting");
          }}
        />
      )}

      {/* ─── RECORDING MODAL ─── */}
      {phase === "recording" && activeDino && (
        <RecordModal
          dinoName={gameState.customNames[activeDino.id] || activeDino.name}
          dinoEmoji={activeDino.emoji}
          onSave={(blob) => handleSaveRecording(activeDino.id, blob)}
          onClose={() => setPhase("interacting")}
        />
      )}

      {/* ─── IDLE INCOME POPUP ─── */}
      {showIdlePopup && phase === "playing" && idleEarned > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fadeSlideUp">
          <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-2 border-[#FFD700]/30 cursor-pointer" onClick={() => setShowIdlePopup(false)}>
            <span className="text-4xl animate-gentleBounce">👋</span>
            <div>
              <p className="font-fredoka text-[#3A7D44]">Welcome Back!</p>
              <p className="font-nunito text-sm">Your dinos earned <b>{idleEarned.toLocaleString()} 🪙</b> while you were away.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
          </div>
        </div>
      )}

    </main>
  );
}

"use client";

import { useState, useRef } from "react";
import { DinoData } from "../data/dinosaurs";

interface DinoCardProps {
    dino: DinoData;
    isUnlocked: boolean;
    hasRecording: boolean;
    customName?: string;
    coins: number;
    onRecord: () => void;
    onUnlock: () => void;
    onPlaySound: () => void;
    onRename: (name: string) => void;
}

export default function DinoCard({
    dino, isUnlocked, hasRecording, customName, coins, onRecord, onUnlock, onPlaySound, onRename,
}: DinoCardProps) {
    const [isNaming, setIsNaming] = useState(false);
    const [nameInput, setNameInput] = useState(customName || "");
    const [justPlayed, setJustPlayed] = useState(false);

    const displayName = customName || dino.name;

    const handlePlay = () => {
        onPlaySound();
        setJustPlayed(true);
        setTimeout(() => setJustPlayed(false), 600);
    };

    if (!isUnlocked) {
        // Locked card
        return (
            <div className="habitat-card relative rounded-3xl p-5 border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px] opacity-70">
                <div className="text-5xl mb-3 grayscale opacity-40">🔒</div>
                <p className="font-fredoka text-gray-400 text-sm">{dino.name}</p>
                <p className="font-nunito text-xs text-gray-300 mt-1">{dino.incomePerSec} 🪙/s</p>
                <button
                    onClick={onUnlock}
                    disabled={coins < dino.unlockCost}
                    className={`mt-3 px-4 py-2 rounded-2xl font-fredoka text-sm transition-all ${coins >= dino.unlockCost
                            ? "bg-[#FFD700] text-[#3E2723] hover:scale-105 active:scale-95 shadow-md"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Adopt · {dino.unlockCost} 🪙
                </button>
            </div>
        );
    }

    // Unlocked card
    return (
        <div
            className={`habitat-card relative rounded-3xl p-5 flex flex-col items-center min-h-[220px] border-2 overflow-hidden ${justPlayed ? 'animate-wiggle' : ''}`}
            style={{
                background: dino.bgGradient,
                borderColor: dino.color + "40",
            }}
        >
            {/* Income indicator */}
            {hasRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                    <span className="text-xs">🪙</span>
                    <span className="text-xs font-fredoka text-[#F4A261]">+{dino.incomePerSec}/s</span>
                </div>
            )}

            {/* Dinosaur emoji/avatar */}
            <div
                className={`text-6xl mb-2 select-none ${hasRecording ? 'animate-gentleBounce cursor-pointer' : ''}`}
                onClick={hasRecording ? handlePlay : undefined}
                style={{ filter: hasRecording ? "none" : "saturate(0.5)" }}
            >
                {dino.emoji}
            </div>

            {/* Name (tap to rename) */}
            {isNaming ? (
                <form
                    onSubmit={(e) => { e.preventDefault(); onRename(nameInput); setIsNaming(false); }}
                    className="flex gap-1"
                >
                    <input
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg text-sm bg-white/80 border border-gray-200 font-nunito text-center focus:outline-none focus:ring-2 focus:ring-[#5DBB63]"
                        maxLength={16}
                        autoFocus
                    />
                    <button type="submit" className="text-sm">✓</button>
                </form>
            ) : (
                <p
                    className="font-fredoka text-base cursor-pointer hover:underline text-center"
                    onClick={() => setIsNaming(true)}
                    style={{ color: dino.color }}
                >
                    {displayName}
                </p>
            )}

            <p className="font-nunito text-[10px] text-gray-400 mt-0.5">{dino.period} · {dino.diet}</p>

            {/* Fun fact */}
            <p className="font-nunito text-xs text-gray-500 mt-2 text-center italic leading-snug line-clamp-2">
                &ldquo;{dino.funFact}&rdquo;
            </p>

            {/* Actions */}
            <div className="mt-auto pt-3 w-full flex gap-2 justify-center">
                {!hasRecording ? (
                    <button
                        onClick={onRecord}
                        className="flex items-center gap-1.5 bg-red-400 hover:bg-red-500 text-white px-4 py-2.5 rounded-2xl font-fredoka text-sm transition-all hover:scale-105 active:scale-95 shadow-md animate-pulseGlow"
                    >
                        🎤 Record Roar
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handlePlay}
                            className="flex items-center gap-1 bg-white/80 hover:bg-white text-gray-700 px-3 py-2 rounded-xl font-nunito text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            🔊 Play
                        </button>
                        <button
                            onClick={onRecord}
                            className="flex items-center gap-1 bg-white/80 hover:bg-white text-gray-700 px-3 py-2 rounded-xl font-nunito text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            🎤 Re-record
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

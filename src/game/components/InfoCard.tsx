"use client";

import { DinoInfo } from "./MuseumCanvas";

interface InfoCardProps {
    dinosaur: DinoInfo;
    onClose: () => void;
    onStartQuiz: () => void;
    onStartRecording: () => void;
}

export default function InfoCard({ dinosaur, onClose, onStartQuiz, onStartRecording }: InfoCardProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4" onClick={onClose}>
            <div
                className="bg-gradient-to-br from-[#f5f0e6] to-[#e8dcc5] rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden border border-white/40 scale-in-center"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${dinosaur.color}, ${dinosaur.color}99)` }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[5rem] drop-shadow-lg select-none" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>🦖</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-xl backdrop-blur-sm transition-all"
                    >✕</button>
                </div>

                {/* Content */}
                <div className="p-7">
                    <h2 className="text-3xl font-fredoka text-[#3A7D44] mb-1">{dinosaur.species}</h2>
                    <div className="flex gap-2 mb-5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: dinosaur.color + "22", color: dinosaur.color }}>{dinosaur.period}</span>
                        <span className="px-3 py-1 bg-[#F4A261]/15 text-[#F4A261] rounded-full text-xs font-bold uppercase tracking-wider">{dinosaur.diet}</span>
                        <span className="px-3 py-1 bg-[#7CC6FE]/15 text-[#2196F3] rounded-full text-xs font-bold uppercase tracking-wider">{dinosaur.length}</span>
                    </div>

                    <div className="bg-white/60 rounded-2xl p-4 mb-6 border border-white/50">
                        <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Fun Fact</p>
                        <p className="font-nunito text-gray-700 italic leading-relaxed">&ldquo;{dinosaur.funFact}&rdquo;</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onStartQuiz}
                            className="py-3.5 bg-[#3A7D44] text-white rounded-2xl font-fredoka text-base hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#3A7D44]/20"
                        >🧠 Take Quiz</button>
                        <button
                            onClick={onStartRecording}
                            className="py-3.5 bg-[#F4A261] text-white rounded-2xl font-fredoka text-base hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#F4A261]/20"
                        >🎤 Record Roar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

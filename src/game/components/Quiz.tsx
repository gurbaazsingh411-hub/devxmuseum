"use client";

import { useState } from "react";
import { DinoData } from "../data/dinosaurs";

interface QuizProps {
    dinosaur: DinoData;
    onComplete: (xpEarned: number) => void;
    onClose: () => void;
}

const QUIZ_DB: Record<string, { question: string; options: string[]; correct: number }> = {
    stego: { question: "Which period did the Stegosaurus live in?", options: ["Triassic", "Jurassic", "Cretaceous"], correct: 1 },
    trex: { question: "What was the T-Rex's primary diet?", options: ["Herbivore", "Carnivore", "Omnivore"], correct: 1 },
    triceratops: { question: "How many horns did a Triceratops have?", options: ["1", "2", "3"], correct: 2 },
    anky: { question: "What was the Ankylosaurus covered in?", options: ["Feathers", "Scales", "Bony Armor"], correct: 2 },
    mosasaur: { question: "Was the Mosasaurus actually a dinosaur?", options: ["Yes", "No, marine reptile", "No, a fish"], correct: 1 },
    plesio: { question: "What legend did the Plesiosaurus inspire?", options: ["Bigfoot", "Loch Ness Monster", "Kraken"], correct: 1 },
    ichthy: { question: "What modern animal did Ichthyosaurus resemble?", options: ["Shark", "Dolphin", "Whale"], correct: 1 },
    raptor: { question: "Were Velociraptors covered in feathers?", options: ["Yes!", "No, only scales", "Maybe half"], correct: 0 },
    brachio: { question: "How high could Brachiosaurus reach?", options: ["3 meters", "9 meters", "15 meters"], correct: 1 },
    parasaur: { question: "What did Parasaurolophus use its crest for?", options: ["Swimming", "Making sounds", "Fighting"], correct: 1 },
};

export default function Quiz({ dinosaur, onComplete, onClose }: QuizProps) {
    const quiz = QUIZ_DB[dinosaur.id] || {
        question: `What type of creature was the ${dinosaur.name}?`, options: ["Land", "Water", "Air"], correct: 0,
    };

    const [selected, setSelected] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswer = (index: number) => {
        if (isCorrect === true) return;
        setSelected(index);
        const correct = index === quiz.correct;
        setIsCorrect(correct);

        if (correct) {
            setTimeout(() => onComplete(30), 1200);
        } else {
            setTimeout(() => { setSelected(null); setIsCorrect(null); }, 1200);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in-center" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: dinosaur.color + "22" }}>🧠</div>
                    <h2 className="text-2xl font-fredoka text-[#3A7D44]">Quiz Time!</h2>
                </div>
                <p className="text-xs font-nunito text-gray-400 mb-5 ml-[3.25rem]">{dinosaur.name}</p>
                <p className="text-lg font-nunito mb-6 text-gray-700 leading-relaxed">{quiz.question}</p>

                <div className="grid gap-3">
                    {quiz.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={isCorrect === true}
                            className={`p-4 rounded-2xl text-left border-2 transition-all duration-300 font-nunito font-bold text-gray-700 ${selected === i
                                ? isCorrect
                                    ? "border-green-400 bg-green-50 scale-[1.02] shadow-md shadow-green-200/50"
                                    : "border-red-400 bg-red-50"
                                : "border-gray-100 hover:border-[#F4A261]/50 hover:bg-orange-50/50 bg-gray-50/80"
                                }`}
                        >{option}</button>
                    ))}
                </div>

                {isCorrect === true && (
                    <div className="mt-5 text-center">
                        <p className="text-xl font-fredoka text-green-500">✅ Correct!</p>
                        <p className="text-base font-nunito text-[#F4A261] font-bold mt-0.5">+30 XP</p>
                    </div>
                )}
                {isCorrect === false && (
                    <p className="mt-4 text-red-400 font-bold text-center font-nunito text-sm">Not quite! Try again...</p>
                )}

                <button onClick={onClose} className="mt-6 w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                    Close
                </button>
            </div>
        </div>
    );
}

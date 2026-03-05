"use client";

import { useState, useRef, useEffect } from "react";

interface RecordModalProps {
    dinoName: string;
    dinoEmoji: string;
    onSave: (audioBlob: Blob) => void;
    onClose: () => void;
}

export default function RecordModal({ dinoName, dinoEmoji, onSave, onClose }: RecordModalProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [blobRef, setBlobRef] = useState<Blob | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/ogg; codecs=opus" });
                setAudioUrl(URL.createObjectURL(blob));
                setBlobRef(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            // 3-2-1 countdown
            setCountdown(3);
            await new Promise(r => setTimeout(r, 600));
            setCountdown(2);
            await new Promise(r => setTimeout(r, 600));
            setCountdown(1);
            await new Promise(r => setTimeout(r, 600));
            setCountdown(null);

            mediaRecorder.start();
            setIsRecording(true);

            // Auto-stop after 5 seconds
            setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                    setIsRecording(false);
                }
            }, 5000);
        } catch {
            alert("🎤 Microphone access is needed to record a roar!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFF8E7] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-fadeSlideUp" onClick={e => e.stopPropagation()}>

                {/* Dino avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className={`text-7xl mb-2 select-none ${isRecording ? 'animate-wiggle' : ''}`}>{dinoEmoji}</div>
                    <h2 className="font-fredoka text-xl text-[#3A7D44]">Record a roar for</h2>
                    <p className="font-fredoka text-2xl text-[#3E2723]">{dinoName}!</p>
                </div>

                {/* Countdown */}
                {countdown !== null && (
                    <div className="text-center mb-4">
                        <span className="text-5xl font-fredoka text-[#F4A261] animate-popIn">{countdown}</span>
                    </div>
                )}

                {/* Recording state */}
                {countdown === null && (
                    <div className="flex flex-col items-center gap-4">
                        {!isRecording && !audioUrl && (
                            <button
                                onClick={startRecording}
                                className="w-24 h-24 rounded-full bg-red-400 hover:bg-red-500 text-white flex items-center justify-center text-4xl shadow-lg hover:scale-110 active:scale-95 transition-all animate-pulseGlow"
                            >
                                🎤
                            </button>
                        )}

                        {isRecording && (
                            <button
                                onClick={stopRecording}
                                className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl shadow-lg animate-recording"
                            >
                                ⏹️
                            </button>
                        )}

                        {isRecording && (
                            <p className="font-fredoka text-red-400 text-sm tracking-widest uppercase">Recording...</p>
                        )}

                        {audioUrl && !isRecording && (
                            <>
                                <audio src={audioUrl} controls className="w-full rounded-xl" />
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={startRecording}
                                        className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-fredoka text-sm hover:bg-gray-50 transition-all"
                                    >
                                        🔄 Retry
                                    </button>
                                    <button
                                        onClick={() => blobRef && onSave(blobRef)}
                                        className="flex-1 py-3 bg-[#5DBB63] text-white rounded-2xl font-fredoka text-sm hover:bg-[#4CAF50] transition-all shadow-md"
                                    >
                                        ✅ Use This!
                                    </button>
                                </div>
                            </>
                        )}

                        {!isRecording && !audioUrl && (
                            <p className="font-nunito text-xs text-gray-400 text-center">Tap the mic and make your best dinosaur roar! 🦖</p>
                        )}
                    </div>
                )}

                <button onClick={onClose} className="mt-6 w-full py-2 text-gray-300 font-bold text-sm hover:text-gray-500 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
}

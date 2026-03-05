"use client";

import { useState, useRef } from "react";

interface RoarRecorderProps {
    dinoId: string;
    onSave: (audioBlob: Blob) => void;
    onClose: () => void;
}

export default function RoarRecorder({ dinoId, onSave, onClose }: RoarRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access is required to record a roar!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks in the stream
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const saveRecording = () => {
        if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: "audio/ogg; codecs=opus" });
            onSave(blob);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[60] p-4">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
                <h2 className="text-3xl font-fredoka text-[#3A7D44] mb-8">Record Your Roar! 🎤</h2>

                <div className="mb-10 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-gray-100'
                        }`}>
                        <span className="text-5xl">{isRecording ? '⏹️' : '🎤'}</span>
                    </div>
                    {isRecording && <p className="mt-4 font-bold text-red-500 animate-bounce tracking-widest">RECORDING...</p>}
                </div>

                {audioUrl && !isRecording && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <audio src={audioUrl} controls className="w-full" />
                    </div>
                )}

                <div className="grid gap-4">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="py-4 bg-[#3A7D44] text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-[#2A5A31]"
                        >
                            Start Recording
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="py-4 bg-red-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-red-600"
                        >
                            Stop Recording
                        </button>
                    )}

                    {audioUrl && !isRecording && (
                        <button
                            onClick={saveRecording}
                            className="py-4 bg-[#F4A261] text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-[#E76F51]"
                        >
                            Save & Set as Roar
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="py-3 text-gray-400 font-bold hover:text-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

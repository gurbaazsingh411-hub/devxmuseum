"use client";

import { useEffect, useRef } from "react";

interface PhaserGameProps {
    onGameReady?: () => void;
}

export default function PhaserGame({ onGameReady }: PhaserGameProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        // Dynamically import Phaser and all scenes only on the client
        const initGame = async () => {
            const Phaser = await import("phaser");
            const { BootScene } = await import("../scenes/BootScene");
            const { PreloaderScene } = await import("../scenes/PreloaderScene");
            const { MuseumScene } = await import("../scenes/MuseumScene");

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 1024,
                height: 768,
                parent: containerRef.current!,
                backgroundColor: "#FFF8E7",
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false,
                    },
                },
                scene: [BootScene, PreloaderScene, MuseumScene],
            };

            gameRef.current = new Phaser.Game(config);
            onGameReady?.();
        };

        initGame();

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}

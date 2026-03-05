import * as Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloaderScene } from "./scenes/PreloaderScene";
import { MuseumScene } from "./scenes/MuseumScene";

export function getGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent: parent,
        width: 1024,
        height: 768,
        backgroundColor: "#FFF8E7", // Warm MyVoiceZoo background
        physics: {
            default: "arcade",
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false,
            },
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, PreloaderScene, MuseumScene],
    };
}

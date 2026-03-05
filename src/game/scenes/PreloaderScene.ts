import * as Phaser from "phaser";

export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super("PreloaderScene");
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Loading bar background
        const bg = this.add.graphics();
        bg.fillStyle(0xdcd0b8, 1);
        bg.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        // Progress bar
        const bar = this.add.graphics();

        this.load.on("progress", (value: number) => {
            bar.clear();
            bar.fillStyle(0x3a7d44, 1);
            bar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading Museum...", {
            fontFamily: "Fredoka, Arial",
            fontSize: "24px",
            color: "#3A7D44",
        }).setOrigin(0.5);

    }

    create() {
        this.scene.start("MuseumScene");
    }
}

import * as Phaser from "phaser";

export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Load any assets needed for the loading screen itself here
    }

    create() {
        this.scene.start("PreloaderScene");
    }
}

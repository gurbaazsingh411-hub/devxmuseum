import * as Phaser from "phaser";

export interface DinosaurData {
    id: string;
    species: string;
    zone: 'fossil' | 'aquatic' | 'park';
    levelRequired: number;
    period: string;
    diet: string;
    length: string;
    funFact: string;
}

export class Dinosaur extends Phaser.GameObjects.Container {
    public dinoData: DinosaurData;
    private sprite: Phaser.GameObjects.Sprite;
    private proximityRadius = 150;
    private isPlayerNear = false;

    constructor(scene: Phaser.Scene, x: number, y: number, data: DinosaurData) {
        super(scene, x, y);
        this.dinoData = data;

        // Sprite
        this.sprite = scene.add.sprite(0, 0, "dino-placeholder");
        this.sprite.setScale(1.5);
        this.add(this.sprite);

        // Name Tag
        const nameText = scene.add.text(0, -60, data.species, {
            fontSize: "20px",
            color: "#3A7D44",
            fontFamily: "Fredoka",
            backgroundColor: "#ffffffaa",
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        this.add(nameText);

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }

    update(player: Phaser.GameObjects.Sprite | Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < this.proximityRadius) {
            if (!this.isPlayerNear) {
                this.onPlayerEnterProximity();
            }
            this.isPlayerNear = true;
        } else {
            if (this.isPlayerNear) {
                this.onPlayerLeaveProximity();
            }
            this.isPlayerNear = false;
        }
    }

    private onPlayerEnterProximity() {
        this.sprite.setTint(0xffffff);
        // Standard CustomEvent for bridge to React
        window.dispatchEvent(new CustomEvent("dino_proximity_enter", { detail: this.dinoData }));
    }

    private onPlayerLeaveProximity() {
        this.sprite.clearTint();
        window.dispatchEvent(new CustomEvent("dino_proximity_exit", { detail: this.dinoData.id }));
    }
}

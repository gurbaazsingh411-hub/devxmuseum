import * as Phaser from "phaser";
import { ALL_DINOS, HABITATS } from "../data/dinosaurs";

export class MuseumScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: Record<string, Phaser.Input.Keyboard.Key>;
    private interactKey!: Phaser.Input.Keyboard.Key;

    private dinos: Phaser.GameObjects.Group;
    private nearbyDino: string | null = null;
    private interactionPrompt!: Phaser.GameObjects.Text;

    // Audio tracking
    private customAudio: Record<string, HTMLAudioElement> = {};
    private isPlaying: Record<string, boolean> = {};

    constructor() {
        super("MuseumScene");
        this.dinos = null!;
    }

    create() {
        // Setup world bounds
        this.physics.world.setBounds(0, 0, 3000, 2000);

        // Draw habitats
        this.drawHabitats();

        // Setup player
        this.player = this.physics.add.sprite(1500, 1000, "") as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        this.player.setCollideWorldBounds(true);

        // Placeholder player graphics (warm orange circle)
        const g = this.add.graphics();
        g.fillStyle(0xF4A261, 1);
        g.fillCircle(16, 16, 16);
        g.generateTexture('player_placeholder', 32, 32);
        g.destroy();
        this.player.setTexture('player_placeholder');

        // Setup camera
        this.cameras.main.setBounds(0, 0, 3000, 2000);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5); // Closer cozy feel

        // Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D') as Record<string, Phaser.Input.Keyboard.Key>;
            this.interactKey = this.input.keyboard.addKey('E');
        }

        // Setup Dinosaurs
        this.dinos = this.add.group();
        this.createDinosaurs();

        // Interaction Prompt
        this.interactionPrompt = this.add.text(0, 0, 'Press E to interact', {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '14px',
            color: '#3E2723',
            backgroundColor: '#FFF8E7',
            padding: { x: 8, y: 4 },
            stroke: '#FFF',
            strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(10).setVisible(false);

        // Listen for new recorded audio from React
        window.addEventListener("dino_recorded_sound", (e: any) => {
            const { id, base64 } = e.detail;
            const audio = new Audio(base64);
            audio.volume = 0; // Starts silent until approached
            audio.loop = true;
            this.customAudio[id] = audio;
        });

        // Load initially available audio
        const rawState = localStorage.getItem("dinoquest_state");
        if (rawState) {
            try {
                const state = JSON.parse(rawState);
                if (state.soundRecordings) {
                    Object.keys(state.soundRecordings).forEach(id => {
                        const audio = new Audio(state.soundRecordings[id]);
                        audio.volume = 0;
                        audio.loop = true;
                        this.customAudio[id] = audio;
                    });
                }
            } catch (e) { }
        }
    }

    private drawHabitats() {
        const hFossil = HABITATS.find(h => h.id === 'fossil')!;
        const hAquatic = HABITATS.find(h => h.id === 'aquatic')!;
        const hJungle = HABITATS.find(h => h.id === 'jungle')!;

        // Fossil Zone (Top Left)
        this.add.rectangle(750, 500, 1500, 1000, parseInt(hFossil.bg.substring(1), 16)).setOrigin(0.5);
        this.add.text(750, 100, `${hFossil.emoji} ${hFossil.name}`, { fontFamily: 'Fredoka', fontSize: '48px', color: hFossil.color }).setOrigin(0.5).setAlpha(0.2);

        // Aquatic Zone (Top Right)
        this.add.rectangle(2250, 500, 1500, 1000, parseInt(hAquatic.bg.substring(1), 16)).setOrigin(0.5);
        this.add.text(2250, 100, `${hAquatic.emoji} ${hAquatic.name}`, { fontFamily: 'Fredoka', fontSize: '48px', color: hAquatic.color }).setOrigin(0.5).setAlpha(0.2);

        // Jungle Zone (Bottom Full)
        this.add.rectangle(1500, 1500, 3000, 1000, parseInt(hJungle.bg.substring(1), 16)).setOrigin(0.5);
        this.add.text(1500, 1100, `${hJungle.emoji} ${hJungle.name}`, { fontFamily: 'Fredoka', fontSize: '48px', color: hJungle.color }).setOrigin(0.5).setAlpha(0.2);
    }

    private createDinosaurs() {
        const positions = {
            fossil: [{ x: 400, y: 400 }, { x: 1100, y: 300 }, { x: 800, y: 700 }, { x: 300, y: 800 }],
            aquatic: [{ x: 1900, y: 400 }, { x: 2600, y: 300 }, { x: 2300, y: 700 }],
            jungle: [{ x: 600, y: 1500 }, { x: 1500, y: 1400 }, { x: 2400, y: 1600 }, { x: 1500, y: 1800 }]
        };

        let fIdx = 0, aIdx = 0, jIdx = 0;

        ALL_DINOS.forEach(data => {
            let pos;
            if (data.habitat === 'fossil') pos = positions.fossil[fIdx++];
            else if (data.habitat === 'aquatic') pos = positions.aquatic[aIdx++];
            else pos = positions.jungle[jIdx++];

            if (!pos) return;

            const dino = this.add.container(pos.x, pos.y);
            (dino as any).dinoId = data.id;

            // Texture mapping
            let textureKey = "";
            if (data.id === "trex") textureKey = "dino-trex";
            else if (data.id === "stego") textureKey = "dino-stego";
            else if (data.id === "mosasaur") textureKey = "dino-aquatic";
            else if (data.id === "raptor") textureKey = "dino-raptor";

            const size = 120; // Larger for sprites
            const dropShadow = this.add.ellipse(0, 40, 80, 20, 0x000000, 0.15);

            let visual: Phaser.GameObjects.GameObject;

            if (textureKey) {
                const sprite = this.add.sprite(0, 0, textureKey);
                // Scale as needed (AI images are large)
                sprite.setDisplaySize(size, size);
                visual = sprite;
            } else {
                // Better placeholder for others
                const rect = this.add.rectangle(0, 0, 64, 64, parseInt(data.color.substring(1), 16), 1);
                rect.setStrokeStyle(3, 0xffffff);
                const emoji = this.add.text(0, 0, data.emoji, { fontSize: '32px' }).setOrigin(0.5);
                dino.add(emoji);
                visual = rect;
            }

            dino.addAt(dropShadow, 0);
            dino.addAt(visual, 1);
            this.dinos.add(dino);

            // Fun active animation
            this.tweens.add({
                targets: visual,
                y: -10,
                duration: 1000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    update() {
        this.handleMovement();
        this.handleProximityAndAudio();
    }

    private handleMovement() {
        if (!this.player || !this.player.body) return;

        const speed = 250;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx = speed;

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy = speed;

        // Normalize diagonal speed
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / length) * speed;
            vy = (vy / length) * speed;
        }

        this.player.setVelocity(vx, vy);
    }

    private handleProximityAndAudio() {
        if (!this.player || !this.dinos) return;

        let closestDino: any = null;
        let closestDist = Infinity;
        const INTERACT_RADIUS = 120;
        const AUDIO_RADIUS = 400;

        // Check distance to all dinos
        this.dinos.getChildren().forEach((child: any) => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);

            if (dist < closestDist) {
                closestDist = dist;
                closestDino = child;
            }

            // --- Spatial Audio Handling ---
            const id = child.dinoId;
            const audio = this.customAudio[id];

            // Only attempt audio if we actually have the recording
            if (audio) {
                if (dist < AUDIO_RADIUS) {
                    // Start playing if not currently playing
                    if (!this.isPlaying[id]) {
                        audio.play().catch(() => { });
                        this.isPlaying[id] = true;
                    }

                    // Falloff calculation:
                    // Inside INTERACT_RADIUS volume is 1.0 (max)
                    // Outside AUDIO_RADIUS volume is 0.0
                    // In between, scale linearly
                    if (dist <= INTERACT_RADIUS) {
                        audio.volume = 1.0;
                    } else {
                        const factor = 1 - ((dist - INTERACT_RADIUS) / (AUDIO_RADIUS - INTERACT_RADIUS));
                        audio.volume = Math.max(0, Math.min(1, factor));
                    }
                } else {
                    // Out of range, stop or pause
                    if (this.isPlaying[id]) {
                        audio.volume = 0;
                        audio.pause();
                        this.isPlaying[id] = false;
                    }
                }
            }
        });

        // --- Interaction Handling ---
        if (closestDino && closestDist < INTERACT_RADIUS) {
            this.interactionPrompt.setPosition(closestDino.x, closestDino.y - 50).setVisible(true);

            if (this.nearbyDino !== closestDino.dinoId) {
                this.nearbyDino = closestDino.dinoId;
            }

            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                // Freeze player and dispatch interaction event to React
                this.player.setVelocity(0, 0);
                const dinoData = ALL_DINOS.find(d => d.id === closestDino.dinoId);
                const event = new CustomEvent("dino_interact", { detail: dinoData });
                window.dispatchEvent(event);
            }
        } else {
            this.interactionPrompt.setVisible(false);
            if (this.nearbyDino) this.nearbyDino = null;
        }
    }
}

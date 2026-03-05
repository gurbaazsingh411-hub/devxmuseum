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

    // Mobile controls
    private joystickBase?: Phaser.GameObjects.Arc;
    private joystickThumb?: Phaser.GameObjects.Arc;
    private isMobile: boolean = false;
    private joystickActive: boolean = false;
    private joystickVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

    // Audio tracking
    private customAudio: Record<string, HTMLAudioElement> = {};
    private isPlaying: Record<string, boolean> = {};

    constructor() {
        super("MuseumScene");
        this.dinos = null!;
    }

    create() {
        // Detect mobile
        this.isMobile = !this.sys.game.device.os.desktop;

        // Setup world bounds
        this.physics.world.setBounds(0, 0, 3000, 2000);

        // Draw habitats
        this.drawHabitats();

        // Setup player
        this.player = this.physics.add.sprite(1500, 1000, "") as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(30);

        // Player graphics (warm orange circle with shadow)
        const playerShadow = this.add.ellipse(1500, 1016, 24, 10, 0x000000, 0.2);
        playerShadow.setDepth(29);
        (this.player as any).shadow = playerShadow;

        const g = this.add.graphics();
        g.fillStyle(0xF4A261, 1);
        g.fillCircle(16, 16, 16);
        g.generateTexture('player_placeholder', 32, 32);
        g.destroy();
        this.player.setTexture('player_placeholder');

        // Setup camera
        this.cameras.main.setBounds(0, 0, 3000, 2000);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(this.isMobile ? 1.0 : 1.5);

        // Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D') as Record<string, Phaser.Input.Keyboard.Key>;
            this.interactKey = this.input.keyboard.addKey('E');
        }

        // Mobile Controls
        this.createMobileControls();

        // Setup Dinosaurs
        this.dinos = this.add.group();
        this.createDinosaurs();

        // Interaction Prompt
        this.interactionPrompt = this.add.text(0, 0, '✨ Tap to Interact ✨', {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            color: '#3E2723',
            backgroundColor: '#FFF8E7',
            padding: { x: 12, y: 8 },
            stroke: '#F4A261',
            strokeThickness: 2
        }).setOrigin(0.5, 1).setDepth(200).setVisible(false);

        this.tweens.add({
            targets: this.interactionPrompt,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

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

        // --- Visual Enhancements ---
        this.createParticles();
        this.addDecorations();
        this.addVignette();

        // Listen for unlock events for effects
        window.addEventListener("dino_unlocked", () => {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.flash(500, 255, 255, 255, true);
                this.cameras.main.shake(300, 0.01);
            }
        });

        // Listen for mobile interaction button from React
        window.addEventListener("mobile_interact", () => {
            this.handleTouchInteraction();
        });
    }

    private addVignette() {
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 1);
        vignette.fillRect(0, 0, 3000, 2000);
        vignette.setScrollFactor(0);
        vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
        vignette.setAlpha(0.15); // Subtle cozy darkness
        vignette.setDepth(1000); // Top of everything
    }

    private createParticles() {
        if (!this.add.particles) return;

        // Fossil Dust (Fossil Zone: 0-1500w, 0-1000h)
        const dust = this.add.particles(0, 0, '', {
            frequency: 100,
            lifespan: 10000,
            speedY: { min: -5, max: 5 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.1, end: 0.2 },
            alpha: { start: 0.05, end: 0 },
            tint: 0xdcd0b8,
            emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1500, 1000) }
        } as any);
        dust.setDepth(1);

        // Bubbles (Aquatic Zone: 1500-3000w, 0-1000h)
        const bubbles = this.add.particles(0, 0, '', {
            frequency: 150,
            lifespan: 6000,
            speedY: { min: -30, max: -20 },
            scale: { start: 0.1, end: 0.3 },
            alpha: { start: 0.4, end: 0 },
            tint: 0xffffff,
            emitZone: { source: new Phaser.Geom.Rectangle(1500, 0, 1500, 1000) }
        } as any);
        bubbles.setDepth(1);

        // Leaves/Petals (Jungle Zone: 0-3000w, 1000-2000h)
        const leaves = this.add.particles(0, 0, '', {
            frequency: 200,
            lifespan: 8000,
            speedY: { min: 10, max: 30 },
            speedX: { min: -15, max: 15 },
            rotate: { min: 0, max: 360 },
            scale: { start: 0.1, end: 0.05 },
            alpha: { start: 0.3, end: 0 },
            tint: [0x5DBB63, 0x3A7D44, 0x81C784, 0xFFE082],
            emitZone: { source: new Phaser.Geom.Rectangle(0, 1100, 3000, 900) }
        } as any);
        leaves.setDepth(200); // Floating above
    }

    private addDecorations() {
        // Add Pillars to Fossil Zone
        const pillarCoords = [
            { x: 300, y: 300 }, { x: 1200, y: 300 },
            { x: 300, y: 700 }, { x: 1200, y: 700 },
            { x: 750, y: 350 }, { x: 750, y: 650 }
        ];

        pillarCoords.forEach(p => {
            this.add.image(p.x, p.y, "deco-pillar").setScale(0.5).setDepth(p.y / 10).setAlpha(0.9);
            this.add.ellipse(p.x, p.y + 70, 90, 30, 0x000000, 0.15).setDepth(p.y / 10 - 1); // Shadow
        });

        // Add Trees to Jungle Zone
        for (let i = 0; i < 24; i++) {
            const tx = Math.random() * 3000;
            const ty = 1100 + Math.random() * 850;
            const tree = this.add.image(tx, ty, "deco-tree").setScale(0.4 + Math.random() * 0.4).setDepth(ty / 10).setAlpha(1);
            this.add.ellipse(tx, ty + 120, 100, 40, 0x000000, 0.15).setDepth(ty / 10 - 1);
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

        // Keyboard Controls
        if (this.cursors && this.cursors.left.isDown || (this.wasdKeys && this.wasdKeys.A.isDown)) vx = -speed;
        else if (this.cursors && this.cursors.right.isDown || (this.wasdKeys && this.wasdKeys.D.isDown)) vx = speed;

        if (this.cursors && this.cursors.up.isDown || (this.wasdKeys && this.wasdKeys.W.isDown)) vy = -speed;
        else if (this.cursors && this.cursors.down.isDown || (this.wasdKeys && this.wasdKeys.S.isDown)) vy = speed;

        // Joystick Controls (Override if active)
        if (this.joystickActive) {
            vx = this.joystickVector.x * speed;
            vy = this.joystickVector.y * speed;
        }

        // Normalize diagonal speed (only for keyboard)
        if (!this.joystickActive && vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / length) * speed;
            vy = (vy / length) * speed;
        }

        this.player.setVelocity(vx, vy);

        // --- Visual Effects (Shadow & Bounce) ---
        const shadow = (this.player as any).shadow;
        if (shadow) {
            shadow.x = this.player.x;
            shadow.y = this.player.y + 16;

            if (vx !== 0 || vy !== 0) {
                // Subtle moving bounce
                const bounce = Math.abs(Math.sin(this.time.now / 100)) * 6;
                // We use displayOriginY to simulate a jump without changing the physics body Y
                this.player.displayOriginY = 16 + bounce;
                shadow.setScale(1 - (bounce / 30));
                shadow.setAlpha(0.2 - (bounce / 60));
            } else {
                this.player.displayOriginY = 16;
                shadow.setScale(1);
                shadow.setAlpha(0.2);
            }
        }
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
            this.interactionPrompt.setPosition(closestDino.x, closestDino.y - 100).setVisible(true);

            if (this.nearbyDino !== closestDino.dinoId) {
                this.nearbyDino = closestDino.dinoId;
            }

            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                this.handleTouchInteraction();
            }
        } else {
            this.interactionPrompt.setVisible(false);
            if (this.nearbyDino) this.nearbyDino = null;
        }
    }

    private createMobileControls() {
        const { width, height } = this.scale;

        // Joystick Base
        const baseX = 120;
        const baseY = height - 120;

        this.joystickBase = this.add.circle(baseX, baseY, 60, 0x000000, 0.15)
            .setScrollFactor(0)
            .setDepth(2000);

        this.joystickThumb = this.add.circle(baseX, baseY, 30, 0xF4A261, 0.6)
            .setScrollFactor(0)
            .setDepth(2001);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Left half for joystick
            if (pointer.x < width / 2 && pointer.y > height / 2) {
                this.joystickActive = true;
                this.joystickBase?.setPosition(pointer.x, pointer.y);
                this.joystickThumb?.setPosition(pointer.x, pointer.y);
            } else {
                // Tapping elsewhere (like interaction prompt)
                this.handleTouchInteraction();
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.joystickActive && this.joystickBase && this.joystickThumb) {
                const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
                const maxDist = 60;
                const angle = Phaser.Math.Angle.Between(this.joystickBase.x, this.joystickBase.y, pointer.x, pointer.y);

                const clampedDist = Math.min(dist, maxDist);
                this.joystickThumb.setPosition(
                    this.joystickBase.x + Math.cos(angle) * clampedDist,
                    this.joystickBase.y + Math.sin(angle) * clampedDist
                );

                this.joystickVector.set(
                    Math.cos(angle) * (clampedDist / maxDist),
                    Math.sin(angle) * (clampedDist / maxDist)
                );
            }
        });

        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickVector.set(0, 0);

            // Snap back
            const defaultX = 120;
            const defaultY = height - 120;
            this.joystickBase?.setPosition(defaultX, defaultY);
            this.joystickThumb?.setPosition(defaultX, defaultY);
        });
    }

    private handleTouchInteraction() {
        if (this.nearbyDino) {
            this.player.setVelocity(0, 0);
            const dinoData = ALL_DINOS.find(d => d.id === this.nearbyDino);
            const event = new CustomEvent("dino_interact", { detail: dinoData });
            window.dispatchEvent(event);
        }
    }
}

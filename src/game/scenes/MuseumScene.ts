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

        // Draw habitats & Ground Textures
        this.drawHabitats();
        this.drawGroundTextures();

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

        // Interaction Prompt (Glassmorphism style)
        this.interactionPrompt = this.add.text(0, 0, '✨ Tap to Interact ✨', {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '18px',
            color: '#3E2723',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: { x: 16, y: 10 },
            stroke: '#F4A261',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#000', blur: 10, fill: true }
        }).setOrigin(0.5, 1).setDepth(200).setVisible(false);

        this.tweens.add({
            targets: this.interactionPrompt,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add God Rays
        this.createGodRays();

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
        // Programmatic Pillars (Fossil Zone)
        const pillarCoords = [
            { x: 300, y: 300 }, { x: 1200, y: 300 },
            { x: 300, y: 700 }, { x: 1200, y: 700 },
            { x: 750, y: 350 }, { x: 750, y: 650 }
        ];

        pillarCoords.forEach(p => {
            const container = this.add.container(p.x, p.y);
            const g = this.add.graphics();

            // Column Shadow
            const shadow = this.add.ellipse(0, 75, 90, 30, 0x000000, 0.15);

            // Pillar Body
            g.fillStyle(0xF5F0E6, 1);
            g.fillRoundedRect(-20, -100, 40, 200, 5);
            g.fillStyle(0xE8DCC5, 1);
            g.fillRect(-30, -110, 60, 15); // Top cap
            g.fillRect(-30, 95, 60, 15);  // Base cap

            // Detail lines
            g.lineStyle(2, 0xD7CCC8, 0.5);
            g.lineBetween(-10, -90, -10, 90);
            g.lineBetween(10, -90, 10, 90);

            container.add([shadow, g]);
            container.setDepth(p.y / 10).setAlpha(0.9);
        });

        // Programmatic Trees (Jungle Zone)
        for (let i = 0; i < 30; i++) {
            const tx = Math.random() * 3000;
            const ty = 1100 + Math.random() * 850;
            const treeContainer = this.add.container(tx, ty);
            const g = this.add.graphics();

            // Trunk Shadow
            const shadow = this.add.ellipse(0, 65, 80, 25, 0x000000, 0.15);

            // Trunk (Detailed)
            g.fillStyle(0x5D4037, 1);
            g.fillRect(-8, 0, 16, 60);
            g.fillStyle(0x3E2723, 1);
            g.fillRect(-8, 0, 4, 60); // Bark detail

            // Foliage (Multi-layered)
            const treeColor = [0x3A7D44, 0x2E7D32, 0x1B5E20][Math.floor(Math.random() * 3)];
            const darker = Phaser.Display.Color.IntegerToColor(treeColor).darken(15).color;

            g.fillStyle(darker, 1);
            g.fillCircle(0, -10, 40);
            g.fillStyle(treeColor, 1);
            g.fillCircle(0, -10, 35);
            g.fillCircle(-25, 5, 25);
            g.fillCircle(25, 5, 25);
            g.fillCircle(0, -35, 25);

            // Highlights
            g.fillStyle(0xFFFFFF, 0.1);
            g.fillCircle(-5, -20, 15);

            treeContainer.add([shadow, g]);
            treeContainer.setDepth(ty / 10);
            treeContainer.setScale(0.8 + Math.random() * 0.5);

            // Subtle sway
            this.tweens.add({
                targets: treeContainer,
                angle: 1.5,
                duration: 2500 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
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

    private drawGroundTextures() {
        const g = this.add.graphics();
        g.setDepth(0);

        // Fossil Zone Pebbles
        g.fillStyle(0x8D6E63, 0.2);
        for (let i = 0; i < 200; i++) {
            g.fillCircle(Math.random() * 1500, Math.random() * 1000, 2 + Math.random() * 4);
        }

        // Aquatic Zone Ripples
        g.fillStyle(0xFFFFFF, 0.05);
        for (let i = 0; i < 60; i++) {
            const rx = 1500 + Math.random() * 1500;
            const ry = Math.random() * 1000;
            g.fillEllipse(rx, ry, 30 + Math.random() * 40, 5 + Math.random() * 5);
        }

        // Jungle Zone Grass Tufts
        g.lineStyle(2, 0x2E7D32, 0.3);
        for (let i = 0; i < 300; i++) {
            const gx = Math.random() * 3000;
            const gy = 1000 + Math.random() * 1000;
            g.beginPath();
            g.moveTo(gx, gy);
            g.lineTo(gx - 4, gy - 8);
            g.moveTo(gx, gy);
            g.lineTo(gx + 4, gy - 8);
            g.strokePath();
        }
    }

    private createGodRays() {
        for (let i = 0; i < 8; i++) {
            const ray = this.add.graphics();
            ray.fillStyle(0xFFFFFF, 0.03);
            const x = Math.random() * 3000;
            ray.fillTriangle(x, 0, x - 150, 2000, x + 150, 2000);
            ray.setDepth(500);

            this.tweens.add({
                targets: ray,
                alpha: 0.08,
                duration: 3000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: ray,
                x: '+=50',
                duration: 5000 + Math.random() * 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
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

            const dinoContainer = this.add.container(pos.x, pos.y);
            (dinoContainer as any).dinoId = data.id;

            const color = parseInt(data.color.substring(1), 16);
            const graphics = this.add.graphics();
            graphics.setDepth(1);

            // Draw based on type
            if (data.id === 'trex') this.drawTrex(graphics, color);
            else if (data.id === 'stego') this.drawStego(graphics, color);
            else if (data.id === 'mosasaur') this.drawMosasaur(graphics, color);
            else if (data.id === 'raptor') this.drawRaptor(graphics, color);
            else this.drawGenericDino(graphics, color);

            const dropShadow = this.add.ellipse(0, 45, 80, 20, 0x000000, 0.15);
            const emojiLabel = this.add.text(0, -70, data.emoji, { fontSize: '24px' }).setOrigin(0.5).setAlpha(0.5);

            dinoContainer.add([dropShadow, graphics, emojiLabel]);
            this.dinos.add(dinoContainer);

            // Active idle animation (Bounce)
            this.tweens.add({
                targets: graphics,
                y: -15,
                duration: 1200 + Math.random() * 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Breathing effect
            this.tweens.add({
                targets: graphics,
                scaleX: 1.05,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: dropShadow,
                scaleX: 0.7,
                alpha: 0.05,
                duration: 1200 + Math.random() * 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    private drawTrex(g: Phaser.GameObjects.Graphics, color: number) {
        const darker = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        const lighter = Phaser.Display.Color.IntegerToColor(color).brighten(20).color;

        // Tail
        g.fillStyle(darker, 1);
        g.fillTriangle(-30, 0, -85, 25, -30, 25);
        // Body
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 80, 60);
        g.fillStyle(lighter, 0.3); // Highlight
        g.fillEllipse(0, -10, 60, 30);
        // Head
        g.fillStyle(color, 1);
        g.fillEllipse(35, -35, 50, 40);
        g.fillStyle(darker, 1); // Jaw line
        g.fillRect(20, -25, 60, 5);
        // Underbelly
        g.fillStyle(0xFFFFFF, 0.2);
        g.fillEllipse(0, 15, 60, 20);
        // Legs
        g.fillStyle(darker, 1);
        g.fillRoundedRect(10, 20, 18, 32, 6);
        g.fillRoundedRect(-15, 20, 18, 32, 6);
        // Eye (Glow hint)
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(50, -40, 7);
        g.fillStyle(0xFF0000, 0.5);
        g.fillCircle(50, -40, 9); // Glow
        g.fillStyle(0x000000, 1);
        g.fillCircle(52, -40, 3);
        // Teeth
        g.fillStyle(0xFFFFFF, 1);
        for (let i = 0; i < 3; i++) g.fillTriangle(40 + i * 10, -20, 45 + i * 10, -12, 50 + i * 10, -20);
    }

    private drawStego(g: Phaser.GameObjects.Graphics, color: number) {
        const darker = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        const lighter = Phaser.Display.Color.IntegerToColor(color).brighten(20).color;

        // Body
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 95, 55);
        g.fillStyle(lighter, 0.2);
        g.fillEllipse(0, -10, 70, 25);
        // Plates (Layered)
        for (let i = -45; i <= 45; i += 22) {
            g.fillStyle(darker, 1);
            g.fillTriangle(i, -25, i - 20, -52, i + 20, -25);
            g.fillStyle(color, 1);
            g.fillTriangle(i, -25, i - 12, -45, i + 12, -25);
        }
        // Head
        g.fillStyle(color, 1);
        g.fillCircle(55, 15, 18);
        g.fillStyle(darker, 1);
        g.fillCircle(55, 15, 12);
        // Tail (Spiky)
        g.fillStyle(darker, 1);
        g.fillTriangle(-45, 5, -95, 15, -45, 15);
        g.fillTriangle(-85, 10, -105, 0, -85, 20); // Spikes
        // Underbelly
        g.fillStyle(0x000000, 0.1);
        g.fillEllipse(0, 20, 70, 10);
        // Legs
        g.fillStyle(darker, 1);
        g.fillRoundedRect(18, 18, 14, 28, 4);
        g.fillRoundedRect(-32, 18, 14, 28, 4);
    }

    private drawMosasaur(g: Phaser.GameObjects.Graphics, color: number) {
        const darker = Phaser.Display.Color.IntegerToColor(color).darken(25).color;
        const lighter = Phaser.Display.Color.IntegerToColor(color).brighten(30).color;

        // Fin reflections
        g.fillStyle(lighter, 0.3);
        g.fillEllipse(25, 25, 40, 20);
        // Body
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 120, 40);
        g.fillStyle(lighter, 0.4);
        g.fillEllipse(0, -10, 100, 15);
        // Flippers
        g.fillStyle(darker, 1);
        g.fillEllipse(25, 20, 35, 18);
        g.fillEllipse(-25, 20, 35, 18);
        // Tail fin
        g.fillTriangle(-55, 0, -95, -30, -90, 30);
        // Snout
        g.fillStyle(color, 1);
        g.fillTriangle(55, -12, 95, 0, 55, 12);
        // Eye
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(65, -6, 5);
        g.fillStyle(0x00BFFF, 0.4);
        g.fillCircle(65, -6, 8); // Water glow
    }

    private drawRaptor(g: Phaser.GameObjects.Graphics, color: number) {
        const darker = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        const lighter = Phaser.Display.Color.IntegerToColor(color).brighten(25).color;

        // Tail
        g.fillStyle(darker, 1);
        g.fillTriangle(-35, -12, -105, -28, -35, 12);
        // Body
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 75, 50);
        g.fillStyle(lighter, 0.3);
        g.fillEllipse(0, -15, 50, 20);
        // Head
        g.fillStyle(color, 1);
        g.fillEllipse(35, -28, 45, 28);
        // Eye
        g.fillStyle(0xFFD700, 1); // Yellow raptor eye
        g.fillCircle(52, -35, 5);
        g.fillStyle(0x000000, 1);
        g.fillCircle(54, -35, 2);
        // Legs (Strong)
        g.fillStyle(darker, 1);
        g.fillRoundedRect(8, 18, 16, 42, 6);
        g.fillRoundedRect(-24, 18, 16, 42, 6);
        // Claws
        g.fillStyle(0x000000, 1);
        g.fillTriangle(14, 55, 18, 65, 22, 55);
        g.fillTriangle(-18, 55, -14, 65, -10, 55);
    }

    private drawGenericDino(g: Phaser.GameObjects.Graphics, color: number) {
        g.fillStyle(color, 1);
        g.fillEllipse(0, 0, 80, 55);
        g.fillCircle(40, -25, 22);
        g.fillRoundedRect(12, 18, 14, 32, 5);
        g.fillRoundedRect(-26, 18, 14, 32, 5);
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
            this.interactionPrompt.setPosition(closestDino.x, closestDino.y - 120).setVisible(true);

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

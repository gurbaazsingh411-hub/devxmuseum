DinoQuest Museum
UI / Visual Design Document
1. Overall Visual Style
Core Style Direction

The game should feel like:

cartoon

friendly

museum themed

playful and educational

Design inspiration:

Pokémon overworld exploration

Animal Crossing environment design

Museum learning games

Theme park maps

The world should feel like a mini theme park inside a museum.

2. Camera Perspective

The game uses a Top-Down 2D Perspective.

Similar to:

Pokémon

Stardew Valley

Player view:

       Camera View

   ┌─────────────────┐
   │                 │
   │     Dinosaur    │
   │        🦖       │
   │                 │
   │      Player     │
   │        👤       │
   │                 │
   └─────────────────┘

The camera follows the player smoothly.

3. Art Style
Environment

soft rounded shapes

slightly exaggerated proportions

bright colors

simple textures

Example style:

Trees → rounded blobs
Buildings → simple blocks
Dinosaurs → cute cartoon

Dinosaurs should look approachable, not scary.

4. Color Palette

The UI should use a natural museum + park palette.

Primary Colors
Forest Green
#3A7D44
Museum Beige
#E8DCC5
Sky Blue
#7CC6FE
Dinosaur Orange
#F4A261
Secondary Colors
Fossil Brown
#8D6E63
Ocean Teal
#2A9D8F
Leaf Green
#5DBB63
5. Typography

Use rounded, playful fonts.

Suggested fonts:

Title font

Fredoka

Body font

Poppins

UI labels

Nunito

Text style should feel:

playful

readable

kid friendly

6. Player Character Design

The player character should be simple and customizable.

Basic look:

Explorer Hat
Backpack
Short explorer clothes

Color palette:

khaki

brown

green

Idle animation:

slight bounce

blinking

Walking animation:

simple 4 frame loop

7. Museum Entrance (Main Hub)

This is the starting area.

It should look like a grand museum hall.

Visual Elements

marble floor

dinosaur skeleton centerpiece

banners for zones

big glass ceiling

Layout example:

                GLASS ROOF

      Fossil Zone Door
            🦴
            │
Aquatic ─── Lobby ─── Dino Park
 Door                    Door
  🌊                      🌳

        Skeleton Display
           🦖
Interactive Objects

Entrance hall contains:

tutorial board

dinosaur statue

zone doors

level indicator

8. Fossil Zone Design

Theme:

Ancient excavation site inside museum.

Color Theme

brown

sandstone

dusty orange

Environment Elements

fossil displays

digging pits

bone fragments

skeleton mounts

excavation tools

Floor Design
Sand patches
Stone museum tiles
Digging grids
Fossil Puzzle Area
   ┌─────────────┐
   │             │
   │  Bone Grid  │
   │             │
   └─────────────┘

Players drag bones onto the skeleton.

Fossil Zone Dinosaurs

Examples:

Stegosaurus

Triceratops

Ankylosaurus

Allosaurus

These appear as skeleton displays first.

When unlocked:

They animate.

9. Aquatic Zone Design

Theme:

Indoor prehistoric ocean exhibit.

Atmosphere:

dim lighting

glowing water

aquarium tanks

Color Theme
Deep Blue
Teal
Sea Green
Environment Elements

giant aquarium glass walls

water reflections

coral props

submarine displays

Map Layout
     Aquarium Tunnel

   ┌─────────────┐
   │  Glass Tank │
   │  Mosasaur   │
   └─────────────┘

       Walkway
   ─────────────

Player walks through aquarium tunnels.

Dinosaurs swim around.

Aquatic Creatures

Examples:

Mosasaurus

Plesiosaurus

Dunkleosteus

Ichthyosaurus

Animations:

swimming loops

bubble particles

10. Dinosaur Park Design

Theme:

Outdoor prehistoric park.

This is the most vibrant zone.

Color Theme
Bright Green
Jungle Green
Sky Blue
Environment Elements

trees

rivers

rocks

wooden fences

dinosaur enclosures

Map Layout
      Trees
   🌳 🌳 🌳

   River
  ~~~~~~~

  Dinosaur Area
      🦖

Dinosaurs walk slowly around.

Dinosaurs Here

Examples:

T-Rex

Velociraptor

Brachiosaurus

Parasaurolophus

These are fully animated.

11. Dinosaur Interaction UI

When approaching a dinosaur:

     🦖

  ┌─────────────┐
  │   Rexy      │
  │  *ROAR*     │
  │             │
  │  INFO CARD  │
  └─────────────┘

Interaction options:

hear roar

view info

rename dinosaur

12. Dinosaur Info Card

Appears as a floating panel.

Design style:

rounded corners

fossil texture

Layout:

 ┌──────────────────┐
 │ Tyrannosaurus Rex│
 │                  │
 │ Period: Cretaceous
 │ Diet: Carnivore
 │ Length: 12m
 │                  │
 │ Fun Fact:        │
 │ Massive bite force
 │                  │
 │ [Close]          │
 └──────────────────┘
13. XP and Level UI

Top left corner HUD.

LEVEL 3
████████░░░░░
XP: 320

XP bar should animate when gaining XP.

Floating animation:

+50 XP
14. Puzzle UI

Puzzle screen overlays the game.

Example fossil puzzle:

 ┌─────────────────────┐
 │ Assemble Skeleton   │
 │                     │
 │  [Bone] [Bone]      │
 │   Drag pieces       │
 │                     │
 │ [Finish]            │
 └─────────────────────┘
15. Quiz UI

Design style:

simple

bright buttons

Example:

Which period did T-Rex live in?

[ Jurassic ]
[ Cretaceous ]
[ Triassic ]

Correct answer:

✅ Correct!
+30 XP
16. Mobile Controls

Bottom left:

Virtual Joystick

Bottom right:

Interact Button

Layout:

       Game

  ◯        ⬤
Joystick  Interact
17. Sound Recording UI

When unlocking a dinosaur:

 ┌──────────────────┐
 │ Record Dinosaur  │
 │                  │
 │  🎤 Start Record │
 │                  │
 │  [Stop]          │
 │                  │
 │ Save Roar        │
 └──────────────────┘
18. Map UI

Players can open the map.

Design:

     Museum Map

   🦴 Fossil Zone
   🌊 Aquatic Zone
   🌳 Dino Park

Shows current player location.

19. Animation Style

Animations should be:

smooth

exaggerated

playful

Examples:

Dinosaur idle:

breathing motion
tail sway
blinking

Roar animation:

head tilt
mouth open
sound
20. Particles

Small particles make the game feel alive.

Examples:

Fossil zone

dust particles

Aquatic zone

bubbles

Park

floating leaves
21. UI Animations

Buttons should:

bounce slightly

scale on hover

Popups should:

slide in

fade in

XP notifications:

pop + float upward
22. Loading Screen

Loading screen:

🦖 DinoQuest Museum

Loading Fossils...

Animated dinosaur walking.

23. Sound Design

Ambient sounds per zone.

Fossil zone

wind
museum echo

Aquatic zone

water bubbles
ocean ambience

Park

birds
wind
leaves
24. Accessibility

Important for kids.

Features:

large buttons

simple text

color contrast

easy navigation

25. UI Feel Summary

The experience should feel like:

Museum + Theme Park + Game

Not like:

Serious educational software
Important Advice

If you build this right, the environment design will matter more than the code. The map should feel alive and playful.
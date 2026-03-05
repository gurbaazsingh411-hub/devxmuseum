Product Requirement Document (PRD)
Product Name

DinoQuest Museum

Product Type

Educational 2D web exploration game

Platform

Web browser (Desktop + Mobile)

Core Concept

DinoQuest Museum is a 2D cartoon-style exploration game where users roam through a virtual dinosaur museum divided into different themed zones.

Players explore the museum, interact with exhibits, complete small puzzles, read educational cards, and answer simple quiz questions about dinosaurs.

By completing activities, players earn XP and levels, which unlock new dinosaurs.

When a dinosaur is unlocked, the player can:

Name the dinosaur

Record a custom roar sound

Hear the custom sound when approaching the dinosaur in the museum.

The experience combines learning, exploration, and gamification in a simple game-like environment.

Target Audience

Primary:

Students (ages 8–16)

Secondary:

Museum visitors

Casual learners interested in dinosaurs

Core Game Structure

The game takes place in a museum world divided into zones.

Zones

1️⃣ Fossil Zone

Focus:

Dinosaur skeletons

Paleontology

Fossil discovery

Activities:

Fossil puzzles

Skeleton assembly

Discovery quizzes

2️⃣ Aquatic Zone

Focus:

Marine prehistoric creatures

Examples:

Mosasaurus

Plesiosaurus

Dunkleosteus

Activities:

Ocean exploration

Marine quizzes

Size comparison puzzles

3️⃣ Dinosaur Park

Focus:

Living dinosaurs

Examples:

T-Rex

Velociraptor

Triceratops

Brachiosaurus

Activities:

Exploration

Interaction

Dinosaur customization

Total Dinosaurs

The game includes 30 dinosaurs.

Each dinosaur has:

species name

animated sprite

info card

unlock requirement

custom name (user input)

custom sound recording

Example dinosaur data structure:

Dinosaur
- id
- species
- zone
- level_required
- unlocked
- custom_name
- sound_recording
Gameplay Mechanics
Exploration

Players control a character that can walk around the museum map.

Movement controls:

Desktop

Arrow keys / WASD

Mobile

On-screen joystick

Players can interact with:

dinosaurs

puzzles

information cards

quiz stations

Core Gameplay Loop

Player enters museum

Explores zone

Interacts with exhibits

Completes puzzles or quizzes

Earns XP

Levels up

Unlocks dinosaurs

Customizes dinosaur

Continues exploration

XP System

Players earn XP for completing activities.

Example XP rewards:

Activity	XP
Reading article	20 XP
Answering quiz	30 XP
Completing puzzle	50 XP
Discovering dinosaur	80 XP
Level System

Players gain levels through XP.

Example progression:

Level 1 → Fossil Zone unlocked
Level 3 → Aquatic Zone unlocked
Level 5 → Dinosaur Park unlocked

Higher levels unlock rarer dinosaurs.

Dinosaur Unlock System

Each dinosaur unlocks after completing learning activities.

Example unlock path:

T-Rex

Requirements:

Read dinosaur info card

Complete skeleton puzzle

Answer 3 quiz questions

After completion:

Dinosaur Unlocked
Dinosaur Customization

When a dinosaur is unlocked, the player can customize it.

Customization features:

Name Dinosaur

User enters custom name.

Example:

T-Rex → "Rexy"
Record Dinosaur Sound

Player records sound using microphone.

Example:

User records: "RAWRRR"

When the player walks near the dinosaur:

Play recorded sound

If no recording exists, a default roar sound plays.

Dinosaur Interaction

When approaching a dinosaur:

dinosaur animation plays

custom roar sound triggers

information card appears

Information card example:

Tyrannosaurus Rex

Period: Late Cretaceous
Length: 12 meters
Diet: Carnivore

Fun Fact:
T-Rex had one of the strongest bite forces in history.
Puzzle System

The game includes small interactive puzzles.

Examples:

Fossil Assembly

Players drag fossil bones to complete a dinosaur skeleton.

Reward:
50 XP

Time Period Sorting

Players sort dinosaurs into:

Triassic

Jurassic

Cretaceous

Reward:
50 XP

Footprint Trail

Follow dinosaur footprints to find a hidden fossil.

Reward:
40 XP

Marine Size Puzzle

Arrange aquatic creatures by size.

Reward:
50 XP

Quiz System

Quiz stations appear throughout the museum.

Example questions:

Which period did T-Rex live in?

A) Jurassic
B) Cretaceous
C) Triassic

Correct answer gives XP.

Museum Map Layout

The museum contains separate zones connected through an entrance hall.

Map structure:

Entrance Hall

   |       |       |
Fossil  Aquatic  Dino Park
Zone     Zone     Zone

Entrance hall includes:

game tutorial

player level display

zone entrances

UI Design
Visual Style

cartoon style

bright colors

friendly design

educational tone

Inspired by:

Pokémon

Animal Crossing

museum learning games

UI Elements

Player HUD includes:

XP bar

current level

unlocked dinosaur count

Interaction UI:

speech bubbles

floating XP animations

popup info cards

Animation

All dinosaurs use animated 2D sprites.

Animations include:

idle animation

roar animation

walking animation (optional)

Sound System

Two sound types:

1️⃣ Default dinosaur roar
2️⃣ User recorded roar

When player enters proximity radius:

distance < threshold
→ play roar
Data Storage

The game saves data locally in the browser.

Technology:
LocalStorage or IndexedDB.

Stored data:

player_level
xp
unlocked_dinosaurs
custom_names
sound_recordings
completed_puzzles
quiz_scores

No user accounts required.

Mobile Support

Game must work on mobile browsers.

Controls include:

on-screen joystick

tap to interact

microphone permission for recording sounds

Technical Stack

Frontend

Next.js

Phaser.js (2D game engine)

TailwindCSS

Data Storage

LocalStorage / IndexedDB

Audio

Web Audio API

MediaRecorder API

Performance Requirements

Load time under 3 seconds

Smooth gameplay at 60 FPS

Mobile compatible

Works on modern browsers
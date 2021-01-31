# Charlotte et les 64 Miauleurs

## Introduction

Charlotte was walking back to her home.

That day, she decided to take a shortcut through the old industrial area.

It's a district with a lot of abandoned buildings, made mostly out of bricks, devoid of life.
... or so she thought.

She heard a lot of meowing inside an old factory. Cats kept calling her.
After a short passage through the pet store, She decided to enter the factory. Well-prepared.

It's time to feed those 64 cats!

But the old factories aren't exactly a safe place...

## Controls

- LEFT/RIGHT - Move Charlotte to the left or right.
- A - Charlotte will jump.

## Gameplay

Guide Charlotte through 10 levels in increasing difficulty!

Each level will features the following elements:

- Charlotte is your character. She'll appear out of a door.
- Meowing Cats are the one that should be visited.
  - Just touch them briefly with Charlotte to do so!
  - They'll purr and sleep after a few instants.
- The Cat Door is your exit to the next level.
  - It'll open when all the Cats are sleeping.
  - Just touch them after!
- Catnips are bonus items.
  - They're usually trickier to get.
  - There are 13 of them to retrieve.
  - They're worth a lot of points!
- Pits are bad things to fall into.
  - If you do, it'll reload the current level, so you'll have to redo it!

## Scoring

A timer is launched when you first move your character in Level 1.
When you're through the Level 10, you'll have a summary about your times, collected catnips - and the resulting score.

- The par-time is 4 minutes for the 10 levels.
- Each 2ms below the par-time is worth a point.
- Each collected catnip is worth 5000 points.
  - So you probably don't want to spend more than 10s getting a single catnip!

Falling in a pit will not reset the current level's timer!

## Important Notes

- The game will take a long time to compile in Pine2K.
  - 13s on my own device, we've seen 40s as well. It depends a lot on the SD card.
- On the Pine2K version it's designed to run for, it'll use 2040 bytes of PROGMEM.
  - Needless to say, chances are it might break in upcoming Pine2K updates.
- The game cannot be run after another game - some corruptions will ensue.
- Because of that, it cannot run itself again either, so the only way to exit it is to restart the Pokitto.

## Tech Notes & Tools

- FemtoIDE, Aseprite, Tiled were used to create this game.
- It was really challenging to pack that many features into 2K of compiled bytecode (PROGMEM).
- The whole code relies a lot on the weird pointer arithmetics that can be done in Pine2K.
- A lot of weird tricks were also used, on the basis that they would save 4, 8, 12, 16, 24 or more PROGMEM bytes.
  - Such as converting a `if (a && b)` into two if.
  - Or moving around the `var` declaration out of their loops because somehow it saves a bit.
  - The Character Entity is always at the end of the entities array, and it saved a lot of bytes to do so (a fixed pointer costs less than a pointer as parameter).
- The same animation structure was used wherever the entity was animated or not.
- The collision detection is based on the tile identifier - if it's above or equal to 20, it's colliding.

## Special Thanks

- FManga (https://github.com/felipemanga/FemtoIDE) for making Pine2K and FemtoIDE.
- Torbuntu (https://github.com/Torbuntu) for playtesting it.
- Jonne for the amazing device that is the Pokitto (https://pokitto.com - get this cute little device!).
- The Pokitto Community for their general support and enthusiasm.
- The Aseprite team. (https://www.aseprite.org/)
- The Tiled team. (https://www.mapeditor.org/)
- Anyone who contributed from faraway to the involved tools.

## References

- Github Repository - https://github.com/carbonacat/miaou-p2k

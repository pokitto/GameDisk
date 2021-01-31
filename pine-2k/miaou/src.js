if (!file("resources.res")) {
    exit();
}


//////////
// MAPS //
//////////

// struct Level
// {
//     STRING filename; // [0] - Name of the level's file.
//     int finishedTime; // [1] - Run Timestamp of the completion.
//     int collectedCatnip; // [2]
//     int availableCatnips; [3]
// };
const Level_SIZE = 4 * 4;

// List of Levels.
// This list is also sent to results.js and end.js.
const levels = [
    // "debug01.map", 0, 0, 0,
    // "debug02.map", 0, 0, 0,
    
    "level01.map", 0, 0, 0,
    "level02.map", 0, 0, 0,
    "level03.map", 0, 0, 0,
    "level04.map", 0, 0, 0,
    "level05.map", 0, 0, 0,
    
    "level06.map", 0, 0, 0,
    "level07.map", 0, 0, 0,
    "level08.map", 0, 0, 0,
    "level09.map", 0, 0, 0,
    "level10.map", 0, 0, 0,
    
    null, 0, 0, 0
];

var currentLevel = levels;


////////////////
// OBJECTIVES //
////////////////

var catsCount;
var sleepingCatsCount;
var beginTime = 0;


////////////////
// ANIMATIONS //
////////////////

// struct AnimationStep
// {
//     int untilTimer; // [0] - This steps is applied until timer reaches this value.
//     Bitmap spriteBitmap; // [1] - The bitmap to show. If null, the animation timer is reset.
// }
const AnimationStep_SIZE = 2*4;

const characterWalkAnimation =
[
    4, file("Character1:8", null),
    8, file("Character2:8", null),
    12, file("Character3:8", null),
    16, file("Character4:8", null),
    20, file("Character5:8", null),
    24, file("Character6:8", null),
    99999, null
];

const catIdleAnimation =
[
    8, file("Cat1:8", null),
    16, file("Cat2:8", null),
    24, file("Cat3:8", null),
    32, file("Cat4:8", null),
    99999, null
];

const catFallingAsleepAnimationEnd = 40;
const catFallingAsleepAnimation =
[
    8, file("Cat5:8", null),
    16, file("Cat6:8", null),
    24, file("Cat7:8", null),
    catFallingAsleepAnimationEnd, file("Cat8:8", null),
    99999, null
];

const catSleepingAnimation =
[
    8, file("Cat9:8", null),
    16, file("Cat10:8", null),
    24, file("Cat11:8", null),
    32, file("Cat12:8", null),
    40, file("Cat13:8", null),
    48, file("Cat14:8", null),
    56, file("Cat15:8", null),
    99999, null
];

const bubbleMiaouAnimation =
[
    4, file("BubbleMiaou1", null),
    8, file("BubbleMiaou2", null),
    12, file("BubbleMiaou3", null),
    99999, null
];

const bubbleRonronAnimation =
[
    4, file("BubbleRonron1", null),
    8, file("BubbleRonron2", null),
    12, file("BubbleRonron3", null),
    99999, null
];

const bubbleDeathAnimation =
[
    4, file("BubbleDeath1", null),
    8, file("BubbleDeath2", null),
    12, file("BubbleDeath3", null),
    99999, null
];

const doorClosedAnimation =
[
    1, file("Door1:8", null),
    99999, null
];

const catNipAnimation =
[
    1, file("CatNip:8", null),
    99999, null
];

const doorOpeningAnimationEnd = 8;
const doorOpeningAnimation =
[
    2, file("Door3:8", null),
    4, file("Door4:8", null),
    6, file("Door5:8", null),
    doorOpeningAnimationEnd, file("Door6:8", null),
    99999, null
];

const doorOpenAnimation =
[
    1, file("Door7:8", null),
    2, file("Door8:8", null),
    99999, null
];


/////////
// MAP //
/////////

const TILE_MC = 16;
const TILE_CAT = 17;
const TILE_DOOR = 18;
const TILE_TREASURE = 19;
const TILE_FREE_MAX = 20;

const emptyBGTile = file("MiaouTiles1:8", null);
const defaultBGTile = file("MiaouTiles2:8", null);
const closedToorBLTile = file("MiaouTiles11:8", null);

const mapTiles = [
    // 0-3
    emptyBGTile,
    defaultBGTile,
    file("MiaouTiles3:8", null),
    file("MiaouTiles4:8", null),
    
    // 4-7
    file("MiaouTiles5:8", null),
    file("MiaouTiles6:8", null),
    file("MiaouTiles7:8", null),
    file("MiaouTiles8:8", null),
    
    // 8-11
    file("MiaouTiles9:8", null),
    file("MiaouTiles10:8", null),
    closedToorBLTile,
    file("MiaouTiles12:8", null),
    
    // 12-15
    file("MiaouTiles13:8", null),
    file("MiaouTiles14:8", null),
    file("MiaouTiles15:8", null),
    file("MiaouTiles16:8", null),
    
    //16-19
    closedToorBLTile, // Main Character
    defaultBGTile, // Cat
    defaultBGTile, // Door
    defaultBGTile, // (Reserved)
    
    // 20-23
    emptyBGTile, // This is an invisible block tile.
    file("MiaouTiles22:8", null),
    file("MiaouTiles23:8", null),
    file("MiaouTiles24:8", null),
    
    // 24-27
    file("MiaouTiles25:8", null),
    file("MiaouTiles26:8", null),
    file("MiaouTiles27:8", null),
    file("MiaouTiles28:8", null),
    
    // 28-31
    file("MiaouTiles29:8", null),
    file("MiaouTiles30:8", null),
    file("MiaouTiles31:8", null),
    file("MiaouTiles32:8", null),
    
    // 32-35
    file("MiaouTiles33:8", null),
    file("MiaouTiles34:8", null),
    file("MiaouTiles35:8", null),
    file("MiaouTiles36:8", null),
    
    // 36-39
    file("MiaouTiles37:8", null),
    file("MiaouTiles38:8", null),
    file("MiaouTiles39:8", null),
    file("MiaouTiles40:8", null),
    
    // 40-43
    file("MiaouTiles41:8", null),
    file("MiaouTiles42:8", null),
    file("MiaouTiles43:8", null),
    file("MiaouTiles44:8", null)
];

const entityAnimationForTile = [
    // 0-3
    null,
    null,
    null,
    null,
    
    // 4-7
    null,
    null,
    null,
    null,
    
    // 8-11
    null,
    null,
    null,
    null,
    
    // 12-15
    null,
    null,
    null,
    null,
    
    //16-19
    characterWalkAnimation,
    catIdleAnimation,
    doorClosedAnimation,
    catNipAnimation,
    
    // 20-23
    null,
    null,
    null,
    null,
    
    // 24-27
    null,
    null,
    null,
    null,
    
    // 28-31
    null,
    null,
    null,
    null,
    
    // 32-35
    null,
    null,
    null,
    null,
    
    // 36-39
    null,
    null,
    null,
    null
];

const mapWidth = 28;
const mapHeight = 22;
const mapFullHeight = 26;
const mapPitY256 = 192 * 256;

const levelMapData = new Array(1 + (mapWidth * mapFullHeight + 3) / 4); // 4 (header) + 28*22
const levelMap = levelMapData + 4;

function loadMap()
{
    var levelName = currentLevel[0];
    
    if (levelName == null)
    {
        save("_run.tmp", levels);
        exec("results.js");
        return ;
    }
    
    var levelMapI = levelMap;
    
    file(levelName, levelMapData);
    catsCount = 0;
    sleepingCatsCount = 0;
    currentLevel[2] = 0;
    currentLevel[3] = 0;
    for (var i = 0; i < length(entitiesStart); i++)
        entitiesStart[i] = 0;
    
    for (var tileJ = 0; tileJ < mapHeight; tileJ++)
        for (var tileI = 0; tileI < mapWidth; tileI++, levelMapI++)
        {
            var tileIdentifier = peek(levelMapI);
            var entityUpdate = null;
            
            if (tileIdentifier == TILE_MC)
                entityUpdate = updateMainCharacter;
            if (tileIdentifier == TILE_CAT)
            {
                entityUpdate = updateCat;
                catsCount++;
            }
            if (tileIdentifier == TILE_DOOR)
                entityUpdate = updateDoor;
            if (tileIdentifier == TILE_TREASURE)
            {
                currentLevel[3]++;
                entityUpdate = updateTreasure;
            }
            
            // If we're using a null entityUpdate, it won't be adding any actual entity.
            // addEntity(entityUpdateForTile[tileIdentifier], (tileI * 8 + 3) * 256, (tileJ * 8 + 7) * 256, entityAnimation);
            addEntity(entityUpdate, (tileI << 3 + 7) << 8, (tileJ << 3 + 7) << 8, entityAnimationForTile[tileIdentifier]);
            tile(tileI, tileJ, mapTiles[tileIdentifier]);
        }
}


//////////////
// ENTITIES //
//////////////

// struct Entity
// {
//     function Update; // [0] - Function called at each frame.
//     int x256; // [1] - Center of the entity.
//     int y256; // [2] - Bottom of the entity.
//     int dx256; // [3] - Horizontal velocity.
//     int dy256; // [4] - Vertical velocity.
//     Animation animation; // [5] - Animation compound.
//     int animationTimer; // [6] - Timer for the animation.
//     bool mirror; // [7] - If true, the sprite will be mirrored.
//     Unknown reserved[4]; // [8-11] - For extended structures.
// }
// Note: To search for field call, search for ntity[0] for ntity.update, ntity[1] for ntity.x256, etc.
const Entity_FIELDS = 10;
const Entity_SIZE = Entity_FIELDS * 4;

const entitiesCapacity = 24;
const entitiesStart = Array(entitiesCapacity * Entity_FIELDS);
const entitiesEnd = entitiesStart + entitiesCapacity * Entity_SIZE;
const mcEntity = entitiesEnd - Entity_SIZE;
// Every entity got its distance to the MC calculated even if they're not using it - costs less PROGMEM that way.
var distanceToMC256 = 0;

function addEntity(update, x256, y256, entityAnimation)
{
    for (var i = 0; i < entitiesCapacity * Entity_FIELDS; i += Entity_FIELDS)
        if (entitiesStart[i] == null)
        {
            if (update == updateMainCharacter)
                i = entitiesCapacity * Entity_FIELDS - Entity_FIELDS;

            // We're asserting we always have enough free entities!
            for (var j = 0; j < Entity_FIELDS; j++)
                entitiesStart[i + j] = 0;
            entitiesStart[i] = update;
            entitiesStart[i + 1] = x256;
            entitiesStart[i + 2] = y256;
            entitiesStart[i + 5] = entityAnimation;
            break ;
        }
}

function renderEntity(entity)
{
    var animation = entity[5];
    var animationStep = animation;
    
    while (entity[6] >= animationStep[0])
        animationStep += AnimationStep_SIZE;
    
    var animationBitmap = animationStep[1];
        
    if (animationBitmap == null)
    {
        entity[6] = 0;
        animationBitmap = animation[1];
    }
    mirror(entity[7]);
    sprite(entity[1] >> 8 - 7, entity[2] >> 8 - 15, animationBitmap);
}


////////////////////
// MAIN CHARACTER //
////////////////////

// struct Player: Entity
// {
//     int jumpTimer; // [8] - Extra.
// }


// struct TestPoint
// {
//     int rx256; [0]
//     int ry256; [1]
// }

const characterTestPointsStart = [
    -3*256, 0*256,
    -3*256, -8*256,
    -3*256, -14*256,
    +3*256, 0*256,
    +3*256, -8*256,
    +3*256, -14*256
];

const MC_JUMP_ACCEL256 = -512;
const MC_JUMP_MAINTAINED_ACCEL256 = -32;
const MC_JUMP_MAX = 9;
const MC_GRAVITY_ACCEL256 = 32;
const MC_VERT_BRAKE256 = 256;

const MC_HORIZ_ACCEL256 = 32;
const MC_HORIZ_BRAKE256 = 240;
const MC_DEATH_DURATION = 30;

function mcIsColliding(movementX256, movementY256)
{
    var entityX256 = mcEntity[1] + movementX256;
    var entityY256 = mcEntity[2] + movementY256;
    
    for (var i = 0; i < length(characterTestPointsStart); i += 2)
    {
        var tileI = (entityX256 + characterTestPointsStart[i]) >> 11; // / (8 * 256)
        var tileJ = (entityY256 + characterTestPointsStart[i + 1]) >> 11; // / (8 * 256)
        var tileIndex = tileJ * mapWidth + tileI;
        
        if (peek(levelMap + tileIndex) >= TILE_FREE_MAX)
            return true;
    }
    return false;
}

// Assumes mcEntity == entity.
function updateMainCharacter()
{
    var entityDX256 = mcEntity[3];
    var entityDY256 = mcEntity[4];
    var entityJumpTimer = mcEntity[8];
    
    for (var frame = 0; frame < 2; frame++)
    {
        var accel256 = (pressed("RIGHT") - pressed("LEFT")) * MC_HORIZ_ACCEL256;
        
        if (accel256 != 0)
            mcEntity[7] = accel256 < 0;
        entityDX256 += accel256;
        if (abs(entityDX256) >= 32)
        {
            mcEntity[6]++;
            if (beginTime == 0)
                beginTime = time();
        }
    
        // gravity
        entityDY256 += MC_GRAVITY_ACCEL256;
        // Maintained jump.
        if (entityJumpTimer > 0)
        {
            entityJumpTimer--;
            if (pressed("A"))
                entityDY256 += MC_JUMP_MAINTAINED_ACCEL256;
        }
        
        if (mcIsColliding(entityDX256, 0))
            entityDX256 = 0;
        else
        {
            mcEntity[1] += entityDX256;
            entityDX256 = entityDX256 * MC_HORIZ_BRAKE256 / 256;
        }
        if (mcIsColliding(0, entityDY256))
        {
            entityDY256 = 0;
            // Cancels any jump maintenance.
            entityJumpTimer = 0;
        }
        else
        {
            mcEntity[2] += entityDY256;
            entityDY256 = entityDY256 * MC_VERT_BRAKE256 / 256;
        }
    
        // Jump ?
        // && costs more.
        if (mcIsColliding(0, 1*256))
        {
            if (entityDY256 >= 0)
            {
                if (pressed("A"))
                {
                    entityDY256 = MC_JUMP_ACCEL256;
                    entityJumpTimer = MC_JUMP_MAX;
                }
            }
        }
    }
    
    if (mcEntity[2] > mapPitY256)
    {
        mcEntity[0] = updateDeadMainCharacter;
        addTempDecoration(mcEntity, bubbleDeathAnimation);
        music("fall.raw");
    }
    mcEntity[3] = entityDX256;
    mcEntity[4] = entityDY256;
    mcEntity[8] = entityJumpTimer;
    
    if (mcEntity[9])
    {
        currentLevel[1] = time() - beginTime;
        currentLevel += Level_SIZE;
        loadMap();
    }
}

function updateDeadMainCharacter()
{
    mcEntity[8]++;
    if (mcEntity[8] > MC_DEATH_DURATION)
        loadMap();
}


//////////
// CATS //
//////////

// struct Cat: Entity
// {
//     int meowTimer; // [8] - Extra.
// }
const CAT_MC_DISTANCE256 = 8 * 256;
const CAT_MEOW_TIMER_MAX = 90;
const CAT_OFFSET_TO_MEOW = 16 * 256;

var entityMeowTimer = 0;

function updateCat(entity)
{
    var entityAnimation = entity[5];
    var entityAnimationTimer = entity[6];
    
    entityAnimationTimer++;
    
    // && costs more.
    if (entityAnimation == catIdleAnimation)
    {
        if (entityMeowTimer <= 0)
            if (!random(0, 8))
            {
                entityMeowTimer = CAT_MEOW_TIMER_MAX;
                music("miaou.raw");
                addTempDecoration(entity, bubbleMiaouAnimation);
            }
        if (distanceToMC256 <= CAT_MC_DISTANCE256)
        {
            entityAnimation = catFallingAsleepAnimation;
            entityAnimationTimer = 0;
        }
    }
    // && costs more.
    if (entityAnimation == catFallingAsleepAnimation)
    {
        if (entityAnimationTimer == catFallingAsleepAnimationEnd)
        {
            entityAnimation = catSleepingAnimation;
            sleepingCatsCount++;
            addTempDecoration(entity, bubbleRonronAnimation);
        }
    }
    
    entity[5] = entityAnimation;
    entity[6] = entityAnimationTimer;
}


///////////
// DOORS //
///////////

// struct Door: Entity
// {
// }
const DOOR_MC_DISTANCE256 = 8 * 256;

function updateDoor(entity)
{
    var entityAnimation = entity[5];
    var entityAnimationTimer = entity[6];
    
    entityAnimationTimer++;
    // && costs more.
    if (entityAnimation == doorClosedAnimation)
    {
        if (sleepingCatsCount == catsCount)
        {
            entityAnimation = doorOpeningAnimation;
            entityAnimationTimer = 0;
        }
    }
    // && costs more.
    if (entityAnimation == doorOpeningAnimation)
        if (entityAnimationTimer == doorOpeningAnimationEnd)
            entityAnimation = doorOpenAnimation;
    // Assigning it directly would save 4 bytes, but at the cost of not having multiple doors.
    // && costs more.
    if (entityAnimation == doorOpenAnimation)
        if (distanceToMC256 < DOOR_MC_DISTANCE256)
            mcEntity[9] = true; // Tells to go to the next level.
    entity[5] = entityAnimation;
    entity[6] = entityAnimationTimer;
}


/////////////////////
// TEMP DECORATION //
/////////////////////

// // A decoration that vanishes after a while.
// struct TempDecoration: Entity
// {
//     int deathTimer; // [8] - If less than 30, the deco will vanish.
// }

function updateTempDecoration(entity)
{
    entity[6]++;
    entity[8]--;
    if (entity[8] < -30)
        entity[0] = null;
}

function addTempDecoration(entity, animation)
{
    addEntity(updateTempDecoration, entity[1], entity[2] - CAT_OFFSET_TO_MEOW, animation);
}


//////////////
// TREASURE //
//////////////

// // A treasure that vanishes after being picked up by the MC
// struct Treasure: Entity
// {
// }
const TREASURE_MC_DISTANCE256 = 8 * 256;

function updateTreasure(entity)
{
    if (distanceToMC256 < TREASURE_MC_DISTANCE256)
    {
        entity[0] = null;
        currentLevel[2]++;
    }
}


///////////////////
// INIT / UPDATE //
///////////////////

color(0);
tileshift(0, 0);
loadMap();

function update()
{
    entityMeowTimer--;
    for (var entity = entitiesStart; entity != entitiesEnd; entity += Entity_SIZE)
        if (entity[0] != null)
        {
            distanceToMC256 = abs(entity[1] - mcEntity[1]) + abs(entity[2] - mcEntity[2]);
            entity[0](entity);
            renderEntity(entity);
        }
}
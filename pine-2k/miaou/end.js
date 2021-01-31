////////////
// LEVELS //
////////////

// struct Level
// {
//     STRING filename; // [0] - Name of the level's file.
//     int finishedTime; // [1] - Run Timestamp of the completion.
//     bool collectedCatnip; // [2] - If true, the Catnip was collected.
//     int reserved; [3] - ???
// };
const Level_SIZE = 4 * 4;

const levelsStart = file("_run.tmp", null);
const levelsEnd = levelsStart + length(levelsStart) * 4;

if (!file("resources.res")) {
    exit();
}


/////////////
// RESULTS //
/////////////

var collectedCatnips = 0;
var availableCatnips = 0;

for (var level = levelsStart, levelNumber = 1; level[0] != null; level += Level_SIZE, levelNumber++)
{
    collectedCatnips += level[2];
    availableCatnips += level[3];
}

var foundAllCatnips = collectedCatnips == availableCatnips;


/////////////
// SPRITES //
/////////////

// Otherwise the previous file might corrupt the CatGod.
const CatGod1Bitmap = file("CatGod1:8", null);
const CatGod2Bitmap = file("CatGod2:8", null);


////////////////
// ANIMATIONS //
////////////////

// struct Animation
// {
//     AnimationStep* steps;
// }
// struct AnimationStep
// {
//     int untilTimer; // [0] - This steps is applied until timer reaches this value.
//     Bitmap spriteBitmap; // [1] - The bitmap to show. If null, the animation timer is reset.
// }
const animationStepSize = 2 * 4;
const CharacterWalkAnimation =
[
    4, file("Character1:8", null),
    8, file("Character2:8", null),
    12, file("Character3:8", null),
    16, file("Character4:8", null),
    20, file("Character5:8", null),
    24, file("Character6:8", null),
    99999, null
];

const CatNipAnimation =
[
    1, file("CatNip:8", null),
    99999, null
];

const BubbleMiaouAnimation =
[
    4, file("BubbleMiaou1", null),
    8, file("BubbleMiaou2", null),
    12, file("BubbleMiaou3", null),
    99999, null
];

const ThreeDotsAnimation =
[
    4, file("ThreeDots1:8", null),
    8, file("ThreeDots2:8", null),
    12, file("ThreeDots3:8", null),
    99999, null
];

const EndAnimation =
[
    4, file("End1:8", null),
    8, file("End2:8", null),
    12, file("End3:8", null),
    99999, null
];


function renderAnimation(x256, y256, animation, animationTimer)
{
    var animation = animation;
    var animationStep = animation;
    
    while (animationTimer >= animationStep[0])
        animationStep += animationStepSize;
    
    var animationBitmap = animationStep[1];
        
    if (animationBitmap == null)
    {
        animationTimer = 0;
        animationBitmap = animation[1];
    }
    sprite(x256 >> 8 - 7, y256 >> 8 - 15, animationBitmap);
    return animationTimer;
}


/////////
// MAP //
/////////

const mapTiles = [
    // 0-3
    file("MiaouEndTiles1:8", null),
    file("MiaouEndTiles2:8", null),
    file("MiaouEndTiles3:8", null),
    file("MiaouEndTiles4:8", null),
    
    // 4-7
    file("MiaouEndTiles5:8", null),
    file("MiaouEndTiles6:8", null),
    file("MiaouEndTiles7:8", null),
    file("MiaouEndTiles8:8", null),
    
    // 8-11
    file("MiaouEndTiles9:8", null),
    file("MiaouEndTiles10:8", null),
    file("MiaouEndTiles11:8", null),
    file("MiaouEndTiles12:8", null)
];

const mapWidth = 28;
const mapHeight = 22;

const levelMapData = file("end.map", null);
const levelMap = levelMapData + 4;

function loadMap()
{
    var levelMapI = levelMap;
    
    for (var tileJ = 0; tileJ < mapHeight; tileJ++)
        for (var tileI = 0; tileI < mapWidth; tileI++, levelMapI++)
            tile(tileI, tileJ, mapTiles[peek(levelMapI)]);
}


////////////////
// CINEMATICS //
////////////////

var cinematicsTimer = 0;

function cinematicsUpdateStage1()
{
    if (mainCharacterX256 < MC_STAGE2X256)
    {
        mainCharacterX256 += MC_WALKSPEED;
        if (mainCharacterX256 >= MC_STAGE2X256)
        {
            mainCharacterX256 = MC_STAGE2X256;
            catnipsEnd = catnipsStart + min(catnipsCapacity, collectedCatnips) * Catnip_SIZE;
            cinematicsUpdate = cinematicsUpdateStage2;
        }
        mainCharacterAnimationTimer++;
    }
}

function cinematicsUpdateStage2()
{
    // Are all the catnips stable enough?
    for (var catnip = catnipsStart; catnip != catnipsEnd; catnip += Catnip_SIZE)
    {
        // If a catnip is too fast, or too high, we don't proceed.
        if ((abs(catnip[3]) > 128) || (catnip[2] > 1*256))
            return ;
    }
    if (foundAllCatnips)
        cinematicsUpdate = cinematicsUpdateStage3;
    else
        cinematicsUpdate = cinematicsUpdateStage3A;
}

function cinematicsUpdateStage3()
{
    catGodY256 = CATGOD_FINALY256 + (catGodY256 - CATGOD_FINALY256) * 31 / 32;
    if (abs(catGodY256 - CATGOD_FINALY256) < 256)
    {
        cinematicsTimer = 0;
        cinematicsUpdate = cinematicsUpdateStage4;
    }
}

function cinematicsUpdateStage4()
{
    cinematicsTimer++;
    if (cinematicsTimer > 30)
    {
        catGodBitmap = CatGod2Bitmap;
        cinematicsTimer = 0;
        cinematicsUpdate = cinematicsUpdateStage5;
    }
}

const THREEDOTS_X256 = 152 * 256;
const THREEDOTS_Y256 = 170 * 256;

function cinematicsUpdateStage3A()
{
    bubbleTimer = renderAnimation(THREEDOTS_X256, THREEDOTS_Y256, ThreeDotsAnimation, bubbleTimer + 1);
    cinematicsTimer++;
    if (cinematicsTimer > 30)
    {
        cinematicsTimer = 0;
        cinematicsUpdate = cinematicsUpdateStage4A;
    }
}

function cinematicsUpdateStage4A()
{
    mainCharacterMirrored = true;
    if (mainCharacterX256 > MC_INITIALX256)
    {
        mainCharacterX256 -= MC_WALKSPEED;
        if (mainCharacterX256 <= MC_INITIALX256)
        {
            mainCharacterX256 = MC_INITIALX256;
            cinematicsUpdate = cinematicsUpdateStage5;
        }
        mainCharacterAnimationTimer++;
    }
}

function cinematicsUpdateStage5()
{
    cinematicsTimer++;
    if (cinematicsTimer > 30)
    {
        // Clears the tilemap.
        color(0);
        for (var tileJ = 0; tileJ < mapHeight; tileJ++)
            for (var tileI = 0; tileI < mapWidth; tileI++)
                tile(tileI, tileJ, null);
        if (foundAllCatnips)
            cinematicsUpdate = cinematicsUpdateStage6;
        else
            cinematicsUpdate = cinematicsUpdateStage7;
        cinematicsTimer = 0;
        update2 = updateBlackScene;
    }
}

var bubbleTimer = 0;

const BUBBLE_X256 = 130 * 256;
const BUBBLE_Y256 = 39 * 256;

function cinematicsUpdateStage6()
{
    cinematicsTimer++;
    if (cinematicsTimer == 30)
        music("miaouslow.raw");
    if (cinematicsTimer >= 30)
    {
        io("SCALE", 2);
        bubbleTimer = renderAnimation(BUBBLE_X256, BUBBLE_Y256, BubbleMiaouAnimation, bubbleTimer + 1);
        io("SCALE", 1);
    }
    // At 60fps, it's roughly a bit more 2s.
    if (cinematicsTimer >= 130)
    {
        cinematicsUpdate = cinematicsUpdateStage7;
        cinematicsTimer = 0;
    }
}

const END_X256 = ((220 - 60) / 2 + 7) * 256;
const END_Y256 = ((176 - 25) / 2 + 15) * 256;

function cinematicsUpdateStage7()
{
    bubbleTimer = renderAnimation(END_X256, END_Y256, EndAnimation, bubbleTimer + 1);
}

var cinematicsUpdate = cinematicsUpdateStage1;


////////////////////
// MAIN CHARACTER //
////////////////////

const MC_INITIALX256 = -16 * 256;
const MC_Y256 = 165 * 256;
const MC_STAGE2X256 = 40 * 256;

const MC_WALKSPEED = 128;

var mainCharacterX256 = MC_INITIALX256;
var mainCharacterY256 = 165 * 256;
var mainCharacterAnimation = CharacterWalkAnimation;
var mainCharacterAnimationTimer = 0;
var mainCharacterMirrored = false;


function updateMainCharacter()
{
    mirror(mainCharacterMirrored);
    mainCharacterAnimationTimer = renderAnimation(mainCharacterX256, mainCharacterY256, mainCharacterAnimation, mainCharacterAnimationTimer);
    mirror(false);
}


/////////////
// CATNIPS //
/////////////

// struct CatNip
// {
//     int x256; // [0] - X on the screen *256.
//     int y256; // [1] - Y on the screen *256, for z256 = 0.
//     int z256; // [2] - Height of the catnip.
//     int dz256; // [3] - Altitude velocity of the catnip.
// }
const Catnip_SIZE = 4 * 4;
const catnipsStart = [
  61*256, 153*256, 351*256, 0,
  93*256, 155*256, 403*256, 0,
  73*256, 157*256, 282*256, 0,
  77*256, 159*256, 335*256, 0,
  83*256, 161*256, 240*256, 0,
  66*256, 163*256, 256*256, 0,
  98*256, 163*256, 392*256, 0,
  55*256, 165*256, 327*256, 0,
  73*256, 167*256, 210*256, 0,
  80*256, 169*256, 309*256, 0,
  91*256, 171*256, 403*256, 0,
  67*256, 174*256, 512*256, 0
];
var catnipsEnd = catnipsStart;
const catnipsCapacity = length(catnipsStart) / 4;
const CN_GRAVITY_ACCEL = -64;
const CN_BOUNCE_256 = 64;
const CN_BUMP_Z256MIN = 512;

function updateCatNips()
{
    for (var catnip = catnipsStart; catnip != catnipsEnd; catnip += Catnip_SIZE)
    {
        catnip[3] += CN_GRAVITY_ACCEL;
        catnip[2] += catnip[3];
        if (catnip[2] < 0)
        {
            catnip[2] = - catnip[2];
            if (catnip[3] < -CN_BUMP_Z256MIN)
                music("bump.raw");
            catnip[3] = -catnip[3] * CN_BOUNCE_256 / 256;
        }
        renderAnimation(catnip[0], catnip[1] - catnip[2], CatNipAnimation, 0);
    }
}


/////////////
// CAT GOD //
/////////////

const CATGOD_X256 = 130 * 256;
const CATGOD_INITIALY256 = 177 * 256;
const CATGOD_FINALY256 = 54 * 256;

var catGodX256 = CATGOD_X256;
var catGodY256 = CATGOD_INITIALY256;
var catGodBitmap = CatGod1Bitmap;

function updateCatGod()
{
    io("SCALE", 2);
    sprite(catGodX256 >> 8, catGodY256 >> 8, catGodBitmap);
    io("SCALE", 1);
}


///////////////////
// INIT & UPDATE //
///////////////////

color(0);
tileshift(0, 0);
loadMap();

var update2 = updateScene;

function updateScene()
{
    cinematicsUpdate();
    updateMainCharacter();
    updateCatGod();
    updateCatNips();
}

function updateBlackScene()
{
    cinematicsUpdate();
}

function update()
{
    update2();
}
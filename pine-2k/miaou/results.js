io("FORMAT", 0, 0);


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


////////////
// SCORES //
////////////

const SCORE_CATNIP_POINTS = 5000;
const SCORE_PAR_TIME_MS = 240000;
const SCORE_EXTRA_MS_DIVIDER = 2;

const TIMER_STEP_DURATION = 5;
var timer = 0;

var collectedCatnips = 0;
var availableCatnips = 0;
var score = 0;

function init()
{
    var cumulatedTime = 0;
    
    for (var level = levelsStart, levelNumber = 1; level[0] != null; level += Level_SIZE, levelNumber++)
    {
        collectedCatnips += level[2];
        availableCatnips += level[3];
        cumulatedTime = level[1];
    }
    score = collectedCatnips * SCORE_CATNIP_POINTS;
    if (cumulatedTime < SCORE_PAR_TIME_MS)
        score += (SCORE_PAR_TIME_MS - cumulatedTime) / SCORE_EXTRA_MS_DIVIDER;
    highscore(score);
}

io("FILLER", 1, "TEXT", "5x7");
cursor(0, 0);
color(7);
init();

function update()
{
    var cumulatedTime = 0
    var expectedTimer = TIMER_STEP_DURATION;
    
    if (timer == 0)
        print("You fed of all the cats!\n\n");
    
    expectedTimer += TIMER_STEP_DURATION;
    if (timer == 0)
        print("Times:\n");
    expectedTimer += TIMER_STEP_DURATION;
    for (var level = levelsStart, levelNumber = 1; level[0] != null; level += Level_SIZE, levelNumber++, expectedTimer += TIMER_STEP_DURATION)
    {
        if (timer == expectedTimer)
        {
            print("- #"); printNumber(levelNumber); print(": ");
            printNumber(level[1] - cumulatedTime);print("ms\n");
        }
        cumulatedTime = level[1];
    }
    expectedTimer += TIMER_STEP_DURATION;
    if (timer == expectedTimer)
    {
        print(" \nTOTAL: "); printNumber(cumulatedTime); print("ms");
    }
    expectedTimer += TIMER_STEP_DURATION;
    if ((collectedCatnips) && (timer == expectedTimer))
    {
        print(" \n   ... and "); printNumber(collectedCatnips); print("/"); printNumber(availableCatnips); print(" catnips!\n\n");
    }
    expectedTimer += TIMER_STEP_DURATION;
    if (timer == expectedTimer)
    {
        print("FINAL SCORE: "); printNumber(score); print(" \n\n");
    }
    
    expectedTimer += TIMER_STEP_DURATION;
    if (timer == expectedTimer)
        print("Press A to continue.\n");
    
    timer++;
    if ((justPressed("A")) && (timer >= expectedTimer))
        exec("preend.js");
}
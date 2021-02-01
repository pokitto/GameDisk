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

// An important end item.
var collectedCatnips = 0;
var availableCatnips = 0;

for (var level = levelsStart, levelNumber = 1; level[0] != null; level += Level_SIZE, levelNumber++)
{
    collectedCatnips += level[2];
    availableCatnips += level[3];
}

    
///////////
// TOOLS //
///////////

var timer = 0;

function clear()
{
    for (var i = 0; i < 30; i++)
        print(" \n");
    cursor(0, 0);
}


//////////////////
// STORY ENGINE //
//////////////////

var currentStep = steps;

function goToStep(step)
{
    currentStep = steps + step * 8 * 4;
    timer = 0;
}


////////////////////
// STEPS HANDLERS //
////////////////////

const stepsHandlers = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
]

// Infinite loop.
// - All parameters are ignored.
const STEP_HANDLER_INFINITE = 0;
function infiniteStepHandler(step)
{
}
stepsHandlers[STEP_HANDLER_INFINITE] = infiniteStepHandler;

// Progressive Text appears, waiting A press..
// - Parameter 1 is the next step index.
// - Parameters 2-7 are used as text, until the first null.
//   - If COMMAND_CLEAR appears as a text, the screen will be cleared instead.
const TEXT_CLEAR = "<clear>";
const STEP_HANDLER_TEXT_PRESS = 1;
const TIMER_STEP = 5;
function textPressStepHandler(step)
{
    var expectedTimer = 0;
    
    for (var paramI = 2; (paramI < 8) && (step[paramI] != null); paramI++, expectedTimer += TIMER_STEP)
        if (expectedTimer == timer)
            if (step[paramI] == TEXT_CLEAR)
                clear();
            else
                print(step[paramI]);
    if ((timer > expectedTimer) && (justPressed("A")))
        goToStep(step[1]);
    else
        timer++;
}
stepsHandlers[STEP_HANDLER_TEXT_PRESS] = textPressStepHandler;

// Progressive Text appears.
// - Parameter 1 is the next step index.
// - Parameters 2-7 are used as text, until the first null.
//   - If COMMAND_CLEAR appears as a text, the screen will be cleared instead.
const STEP_HANDLER_TEXT = 2;
function textStepHandler(step)
{
    var expectedTimer = 0;
    
    for (var paramI = 2; (paramI < 8) && (step[paramI] != null); paramI++, expectedTimer += TIMER_STEP)
        if (expectedTimer == timer)
            if (step[paramI] == TEXT_CLEAR)
                clear();
            else
                print(step[paramI]);
    if (timer > expectedTimer)
        goToStep(step[1]);
    else
        timer++;
}
stepsHandlers[STEP_HANDLER_TEXT] = textStepHandler;

// Button to branch.
// - Parameters are mapped to a button press (justPressed) each:
//   - RIGHT, DOWN, LEFT, UP, A, B, C
// - Each null or 0 parameter is ignored.
// - Otherwise, when pressing said button, it'll branch to the corresponding step.
const STEP_HANDLER_PRESS_TO_BRANCH = 3;
const branchButtons = [
    "RIGHT",
    "DOWN",
    "LEFT",
    "UP",
    "A",
    "B",
    "C"
];
function textPressToBranchHandler(step)
{
    for (var buttonI in branchButtons)
        if ((step[buttonI + 1] != null) && (justPressed(branchButtons[buttonI])))
        {
            goToStep(step[buttonI + 1]);
            return ;
        }
}
stepsHandlers[STEP_HANDLER_PRESS_TO_BRANCH] = textPressToBranchHandler;

const STEP_HANDLER_END_DIRECT = 4;
function endDirectHandler(step)
{
    exec("blueend.js");
}
stepsHandlers[STEP_HANDLER_END_DIRECT] = endDirectHandler;

const STEP_HANDLER_RED_END = 5;
function redEndDirectHandler(step)
{
    exec("end.js");
}
stepsHandlers[STEP_HANDLER_RED_END] = redEndDirectHandler;

// Progressive Text appears, but only with catnips.
const STEP_HANDLER_TEXT_IF_CATNIPS = 6;
function textIfCatnipsStepHandler(step)
{
    if (collectedCatnips == 0)
        goToStep(step[1]);
    else
        textStepHandler(step);
}
stepsHandlers[STEP_HANDLER_TEXT_IF_CATNIPS] = textIfCatnipsStepHandler;

// Progressive Text appears, but only with full catnips.
const STEP_HANDLER_TEXT_IF_ALLCATNIPS = 7;
function textIfAllCatnipsStepHandler(step)
{
    if (collectedCatnips != availableCatnips)
        goToStep(step[1]);
    else
        textStepHandler(step);
}
stepsHandlers[STEP_HANDLER_TEXT_IF_ALLCATNIPS] = textIfAllCatnipsStepHandler;

// Jumps to the step indicated:
// - param1 if all catnips,
// - param2 if a few catnips,
// - param3 if no catnips.
const STEP_HANDLER_IF_CATNIPS = 8;
function ifCatnipsHandler(step)
{
    if (collectedCatnips == availableCatnips)
        goToStep(step[1]);
    else if (collectedCatnips > 0)
        goToStep(step[2]);
    else
        goToStep(step[3]);
}
stepsHandlers[STEP_HANDLER_IF_CATNIPS] = ifCatnipsHandler;


///////////
// STORY //
///////////

const STEP_INITIAL = 0;

const STEP_ROOMCHOICE_INIT = STEP_INITIAL + 1;
const STEP_ROOMCHOICE_CATNIPS = STEP_ROOMCHOICE_INIT + 1;
const STEP_ROOMCHOICE_CHOICES = STEP_ROOMCHOICE_CATNIPS + 1;
const STEP_ROOMCHOICE_BRANCHES = STEP_ROOMCHOICE_CHOICES + 1;

const STEP_CHECKGREYDOOR = STEP_ROOMCHOICE_BRANCHES + 1;

const STEP_CHECKREDDOOR_INIT = STEP_CHECKGREYDOOR + 1;
const STEP_CHECKREDDOOR_BRANCHES = STEP_CHECKREDDOOR_INIT + 1;

const STEP_CHECKBLUEDOOR_INIT = STEP_CHECKREDDOOR_BRANCHES + 1;
const STEP_CHECKBLUEDOOR_BRANCHES = STEP_CHECKBLUEDOOR_INIT + 1;

const STEP_CHECKWINDOW = STEP_CHECKBLUEDOOR_BRANCHES + 1;

const STEP_BLUE_FORCE_CHECK = STEP_CHECKWINDOW + 1;
const STEP_BLUE_FORCE_LAST = STEP_BLUE_FORCE_CHECK + 1;

const STEP_BLUE_EXIT_INIT = STEP_BLUE_FORCE_LAST + 1;
const STEP_BLUE_EXIT_CATNIPS = STEP_BLUE_EXIT_INIT + 1;
const STEP_BLUE_EXIT_LAST = STEP_BLUE_EXIT_CATNIPS + 1;

const STEP_BLUE_END = STEP_BLUE_EXIT_LAST + 1;

const STEP_RED_EXIT_INIT = STEP_BLUE_END + 1;
const STEP_RED_EXIT_CATNIPS = STEP_RED_EXIT_INIT + 1;
const STEP_RED_EXIT_ALLCATNIPS = STEP_RED_EXIT_CATNIPS + 1;
const STEP_RED_EXIT_LAST = STEP_RED_EXIT_ALLCATNIPS + 1;

const STEP_RED_END = STEP_RED_EXIT_LAST + 1;

// A step consists of a handler (see STEP_HANDLER_*) and 7 parameters (not all them are used.)
const steps =
[
    // STEP_INITIAL
    STEP_HANDLER_TEXT_PRESS,
        STEP_ROOMCHOICE_INIT,
        "You do not hear any more meows;\n",
        "merely some faint howling.\n\n",
        "Having fed all these cats leaves you\nsatisfied.\n",
        " \n",
        "... but hungry as well.\n \n",
        " \n                      [A - Continue]",



    // STEP_ROOMCHOICE_INIT
    STEP_HANDLER_TEXT,
        STEP_ROOMCHOICE_CATNIPS,
        TEXT_CLEAR,
        "You are in the middle of a quite\ndark room.\n \n",
        null,
        null,
        null,
        null,
    // STEP_ROOMCHOICE_CATNIPS
    STEP_HANDLER_TEXT_IF_CATNIPS,
        STEP_ROOMCHOICE_CHOICES,
        "Your pocket is full of catnips.\n \n",
        null,
        null,
        null,
        null,
        null,
    // STEP_ROOMCHOICE_CHOICES
    STEP_HANDLER_TEXT,
        STEP_ROOMCHOICE_BRANCHES,
        "          [UP - Grey Door]\n",
        "[< - Red Door]       [> - Blue Door]\n",
        "          [DOWN - Window]\n",
        null,
        null,
        null,
    // STEP_ROOMCHOICE_BRANCHES
    STEP_HANDLER_PRESS_TO_BRANCH,
        STEP_CHECKBLUEDOOR_INIT, // RIGHT
        STEP_CHECKWINDOW, // DOWN
        STEP_CHECKREDDOOR_INIT, // LEFT
        STEP_CHECKGREYDOOR, // UP
        null, // A
        null, // B
        null, // C



    // STEP_CHECKGREYDOOR
    STEP_HANDLER_TEXT_PRESS,
        STEP_ROOMCHOICE_INIT,
        TEXT_CLEAR,
        "You're looking at the grey door.\n \n",
        "You came from there, but it won't\nbudge anymore.\n \n",
        "Anyway, coming here was quite\ndangerous.\n",
        "Unlike cats, you got only one live, after all.\n",
        " \n                          [A - Back]",



    // STEP_CHECKREDDOOR_INIT
    STEP_HANDLER_TEXT,
        STEP_CHECKREDDOOR_BRANCHES,
        TEXT_CLEAR,
        "You're looking at the red door.\n \n",
        "It is covered with intricate golden patterns and surrounded by a\npowerful aura.\n",
        " \n[A - Back]               [C - Enter]",
        null,
        null,
    // STEP_CHECKREDDOOR_BRANCHES
    STEP_HANDLER_PRESS_TO_BRANCH,
        null, // RIGHT
        null, // DOWN
        null, // LEFT
        null, // UP
        STEP_ROOMCHOICE_INIT, // A
        null, // B
        STEP_RED_EXIT_INIT, // C



    // STEP_CHECKBLUEDOOR_INIT
    STEP_HANDLER_TEXT,
        STEP_CHECKBLUEDOOR_BRANCHES,
        TEXT_CLEAR,
        "You're looking at the blue door.\n \n",
        "It is a very nice door, finely\ncrafted.\n\n",
        "You can hear the city bustling\nthrough it.\n",
        "It's probably the fastest way to go home.\n",
        " \n[A - Back]               [C - Enter]",
    // STEP_CHECKBLUEDOOR_BRANCHES
    STEP_HANDLER_PRESS_TO_BRANCH,
        null, // RIGHT
        null, // DOWN
        null, // LEFT
        null, // UP
        STEP_ROOMCHOICE_INIT, // A
        null, // B
        STEP_BLUE_FORCE_CHECK, // C



    // STEP_CHECKWINDOW
    STEP_HANDLER_TEXT_PRESS,
        STEP_ROOMCHOICE_INIT,
        TEXT_CLEAR,
        "You're checking the window.\n \n",
        "While the immediate neighborhood is quiet, you can see the city being\nlively far away.\n \n",
        "However, it is way too high to exit this way.\n",
        " \n                      [A - Continue]",
        null,


    // STEP_BLUE_FORCE_CHECK
    STEP_HANDLER_IF_CATNIPS,
        STEP_BLUE_FORCE_LAST, // All catnips
        STEP_BLUE_EXIT_INIT, // Some catnips
        STEP_BLUE_EXIT_INIT, // No catnips.
        null, 
        null, 
        null, 
        null,
    // STEP_BLUE_FORCE_LAST
    STEP_HANDLER_TEXT_PRESS,
        STEP_ROOMCHOICE_INIT,
        TEXT_CLEAR,
        "... But somehow, you cannot resolve yourself into opening that door.\n \n",
        "You cannot explain why, but you know\nyou still got some business left to\ndo here.\n",
        " \n                      [A - Continue]",
        null,
        null,
    
    // STEP_BLUE_EXIT_INIT
    STEP_HANDLER_TEXT,
        STEP_BLUE_EXIT_CATNIPS,
        TEXT_CLEAR,
        "You open the door.\n \n",
        "After a long walk, you're finally\nback at your home, enjoying a good\nmeal.\n",
        " ",
        " ",
        " ",
    // STEP_BLUE_EXIT_CATNIPS
    STEP_HANDLER_TEXT_IF_CATNIPS,
        STEP_BLUE_EXIT_LAST,
        " ",
        " ",
        " ",
        " ",
        " \n",
        "Though you're still wondering what\nyou're going to do with all these\ncatnips...\n",
    // STEP_BLUE_EXIT_LAST
    STEP_HANDLER_TEXT_PRESS,
        STEP_BLUE_END,
        " ",
        " ",
        " ",
        " ",
        " \n",
        " \n                      [A - Continue]",



    // STEP_BLUE_END
    STEP_HANDLER_END_DIRECT,
        null,
        null,
        null,
        null,
        null,
        null,
        null,



    // STEP_RED_EXIT_INIT
    STEP_HANDLER_TEXT,
        STEP_RED_EXIT_CATNIPS,
        TEXT_CLEAR,
        "You open the door.\n \n",
        "The room inside is huge, and quite\nweird.\nA large hole is present at the\nopposite.\n \n",
        "You approach the hole.\n \n",
        null,
        null,
    // STEP_RED_EXIT_CATNIPS
    STEP_HANDLER_TEXT_IF_CATNIPS,
        STEP_RED_EXIT_ALLCATNIPS,
        "The catnips in your pocket start\nvibrating.",
        " ",
        " ",
        " ",
        " \n",
        "... and suddenly it becomes empty!\n \n",
    // STEP_RED_EXIT_ALLCATNIPS
    STEP_HANDLER_TEXT_IF_ALLCATNIPS,
        STEP_RED_EXIT_LAST,
        " ",
        " ",
        " ",
        " ",
        " \n",
        "The ground is rumbling!\n \n",
    // STEP_RED_EXIT_LAST
    STEP_HANDLER_TEXT_PRESS,
        STEP_RED_END,
        " \n                      [A - Continue]",
        null,
        null,
        null,
        null,
        null,



    // STEP_RED_END
    STEP_HANDLER_RED_END,
        null,
        null,
        null,
        null,
        null,
        null,
        null,


    
    // (Last)
    STEP_HANDLER_INFINITE,
        null,
        null,
        null,
        null,
        null,
        null,
        null
];

if (length(steps) % 8 != 0)
{
    // Steps must contain a multiple of 8 items.
    console("mismatching steps!\n");
    while(true);
}


///////////////////
// INIT & UPDATE //
///////////////////

io("FORMAT", 0, 0);

io("FILLER", 1, "TEXT", "5x7");
cursor(0, 0);
color(7);

goToStep(STEP_INITIAL);

function update()
{
    var stepUpdate = stepsHandlers[currentStep[0]];
    
    stepUpdate();
}
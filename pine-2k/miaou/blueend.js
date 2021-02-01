if (!file("resources.res")) {
    exit();
}


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


////////////////
// CINEMATICS //
////////////////

var cinematicsTimer = 0;


const END_X256 = ((220 - 60) / 2 + 7) * 256;
const END_Y256 = ((176 - 25) / 2 + 15) * 256;

function cinematicsUpdateEnd()
{
    bubbleTimer = renderAnimation(END_X256, END_Y256, EndAnimation, bubbleTimer + 1);
}

var cinematicsUpdate = cinematicsUpdateEnd;


///////////////////
// INIT & UPDATE //
///////////////////

color(0);

function update()
{
    cinematicsUpdate();
}
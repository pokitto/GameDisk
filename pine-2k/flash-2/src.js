if( file("katakana.res", 0) != 1 ){
    console("Could not find resources!");
    exit();
}

const list = [
    "a","e","i","o","u","n",
    "ha","he","hi","ho",
    "ba","be","bi","bo","bu",
    "chi","fu",
    "ka","ke","ki","ko","ku",
    "ma","me","mi","mo","mu",
    "na","ne","ni","no","nu",
    "ra","re","ri","ro","ru",
    "sa","se","sha","shi","sho","shu","so","su",
    "ta","te","to","tsu",
    "wa","we","wo",
    "ya","yo","yu",
    "za","ze","zo","zu",
    "da","de","do",
    "ga","ge","gi","go","gu",
    "ja","ji","jo","ju",
    "pa","pe","pi","po","pu",
    "bya","byo","byu",
    "cha","cho","chu",
    "gya","gyo","gyu","hya","hyo","hyu",
    "kya","kyo","kyu","mya","myo","myu",
    "nya","nyo","nyu",
    "pya","pyo","pyu",
    "rya","ryo","ryu"
];

const UI = file("interface", 0);
const heart = builtin("sHeart");
const rightEmote = builtin("happyEmote");
const wrongEmote = builtin("dohEmote");
const boredEmote = builtin("boredEmote");
const words = [0,0,0,0];
var X;
var Y;
var stateTime = 0;
var level = 0;
var streak = 0;
var score = 0;
var maxStreak = 0;
var num = 0;
var img = null;
var state = nop;
var nextState = null;
var emote = rightEmote;
var lives = 3;
const spriteX = 80;
const spriteY = 16;
const waitColor = 223;
const rightColor = 7;
const wrongColor = 175;
var bgColor = 139;
var uiColor = 143;
var spriteColor = bgColor;
var targetColor = waitColor;

fill(bgColor);
color(10);
pick();

function nop(){}

function pick(){
    if((lives < 0) || !UI)
        exit();
    var newnum = random(0, level);
    if(newnum == num) newnum = random(0, level);
    num = newnum;
    img = file(list[num], img);
    for(var i in words){
        words[i] = random(0, level);
    }
    words[random(0, 4)] = num;
    targetColor = waitColor;
    state = tween;
    nextState = waitForInput;
    stateTime = 0;
}

function wrongFeedback(){
    if(stateTime == 0) stateTime = 60;
    else if(--stateTime == 0){
        targetColor = bgColor;
        nextState = pick;
        state = tween;
    }
    color(172);
    if(words[0] == num){
        cursor(25 + 2, 25 + 4);
        print(list[words[0]]);
    }
    if(words[1] == num){
        cursor(25 + 2, 73 + 4);
        print(list[words[1]]);
    }
    if(words[2] == num){
        cursor(5 + 2, 49 + 4);
        print(list[words[2]]);
    }
    if(words[3] == num){
        cursor(44 + 2, 49 + 4);
        print(list[words[3]]);
    }
}

function makeChoice(choice){
    if((choice != 4) && (words[choice] == num)){
        if(++level > length(list)) level = length(list) - 1;
        if(++streak > maxStreak){
            emote = rightEmote;
        }
        score += streak + 1;
        highscore(score);
        nextState = pick;
        state = tween;
        targetColor = bgColor;
        io("OVERDRIVE", 0);
        io("VOLUME", 128);
        io("DURATION", 100);
        sound(44);
    }else{
        io("OVERDRIVE", 1);
        io("VOLUME", 255);
        io("DURATION", 750);
        sound(20);
        --lives;
        level -= 4;
        if(level < 0) level = 0;
        streak = 0;
        targetColor = wrongColor;
        nextState = wrongFeedback;
        state = tween;
        stateTime = 0;
        emote = boredEmote;
    }
}

function waitForInput(){
    var choice = -1;
    if(stateTime == 0) stateTime = 60;
    else if(--stateTime == 0) choice = 4;
    if(justPressed("UP")){
        choice = 0;
    } else if(justPressed("DOWN")){
        choice = 1;
    } else if(justPressed("LEFT")){
        choice = 2;
    } else if(justPressed("RIGHT")){
        choice = 3;
    }
    if(justPressed("B")){
        uiColor = 78;
        bgColor = 75;
        level = length(list);
    }
    if(pressed("C"))
        exit();
    if(choice > -1){
        makeChoice(choice);
    } else {
        color(22);
        cursor(25 + 2, 25 + 4);
        print(list[words[0]]);
        cursor(25 + 2, 73 + 4);
        print(list[words[1]]);
        cursor(5 + 2, 49 + 4);
        print(list[words[2]]);
        cursor(44 + 2, 49 + 4);
        print(list[words[3]]);
    }
}

function tween(){
    var block = spriteColor >> 3;
    var lum = spriteColor & 7;
    var tblock = targetColor >> 3;
    var tlum = targetColor & 7;
    if(block != tblock){
        if(lum > 0) --spriteColor;
        else spriteColor = tblock << 3;
    } else {
        if(lum < tlum) ++spriteColor;
        else if(lum == tlum) state = nextState;
        else --spriteColor;
    }
}

function update(){
    color(uiColor - 7);
    sprite(0, 0, UI);

    if(emote == wrongEmote)
        color(91);
    else
        color(0);
    sprite(96, 146, emote);

    cursor(116, 148);
    color(22);
    printNumber(score);

    state();

    color(spriteColor - 7);
    sprite(spriteX, spriteY, img);

    color(0);
    for(var i = 0; i<lives; ++i){
        sprite(84 + (i * 8), 20, heart);
    }
}

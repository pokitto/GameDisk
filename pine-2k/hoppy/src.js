const hero = builtin("char12");
const energy = builtin("fireball");//builtin("char11");
const wep = builtin("sSword");
const tramp = builtin("shape6");
const tramp3 = builtin("shape8");
const house = builtin("building2");
const boon = builtin("char29");

const tree = builtin("tree1");
const grass = builtin("floor4");

const floor = builtin("floor3");

const cloud = builtin("char28");
const fire = builtin("fireball");

const trampY = 150;

const HERO_IDX = 2;
const BOON_IDX = 1;

var eng = 11, cooldown = 10, combo = 0, finalScore = 0;
var x = 20, y = 140, g = 4, vy = 0, vx = 0, tl = 70, tr = 142, bx = 100, by = 60, bs = 0, score = 0;
var dx = 0, dy = -16;

var jumping = false, start = false, attack = false, gameover = false, side = false;

function collide(){
    if(attack){
        dx = bx;
        dy = by;
        bx = random(30, 180);
        by = 0;
        score += 10 + (combo * 5);
        combo++;
    }
    vy = -8;
    vx = random(-4, 4);
}

function move(){
    //reset acceleration
    ay = 0;
    if(pressed("LEFT")){
        vx-=2;
        side = false;
    }
    if(pressed("RIGHT")){
        vx+=2;
        side = true;
    }

    if(jumping){
        if(vy == 0){
            vy = g;
        }
        if(vy < 0){
            vy++;
        }
    }
    
    if(vx > 0) {
        vx--;
    }
    if(vx < 0) {
        vx++;
    }
    
    if(x < 30){
        x = 30;
        vx = 0;
    }
    if(x > 180){
        x = 180;
        vx = 0;
    }
    
    y += vy;
    x += vx;
}

function updateBoon(){
    if(by < 40){
        by+=3;
    }
    if(bs == 0){
        bs = 2;
        bx += random(-2, 2);
        by += random(-2, 2);
    }
    if(bx < 30) {
        bx+=3;
    }
    if(bx > 180){
        bx-=3;
    }
    
    bs--;
    
    //dead boon
    if(dy > -16){
        dy--;
    }
}

function render(){
    fill(130);
    background(0);
    sprite(32, 140, tree);
    //Grass
    for(var i = 0; i < 14; i++){
        sprite(i*16, 154, grass);
        sprite(i*16, 160, grass);
    }
    
    io("COLLISION", HERO_IDX, 0);
    sprite(x, y, hero);
    if(pressed("A") && attack && start){
        if(side){
            sprite(x+12, y+4, wep);
        }else{
            mirror(true);
            sprite(x-4, y+4, wep);
            mirror(false);
        }
    }else{
        if(y > 130){
            if((x > tl) && (x < tr)){
                for(var i = 2; i < 4; i++){
                    color(248);
                    sprite(i * 8 + 80, trampY+4, tramp);
                    sprite(i * 8 + 98, trampY+4, tramp3);
                }
            }
        }
    }
    
    for(var i = 0; i < 6; i++){
        color(248);
        sprite(i * 8 + 80, trampY, tramp);
        sprite(i * 8 + 98, trampY, tramp3);
    }
    color(0);
    
    sprite(16, 140, house);
    
    //energy 
    for(var i = 0; i < 11; i++){
        sprite(0, 138-(i*16), floor);
    }
    
    color(48);
    for(var i = 0; i < eng; i++){
        sprite(0, 138-(i*14), energy);
    }
    color(0);
    
    for(var i = 0; i < combo; i++){
        sprite(4+i*16, 160, fire);
    }
    
    
    //boon
    io("COLLISION", BOON_IDX, HERO_IDX, collide);
    sprite(bx, by, boon);
    
    sprite(dx, dy, cloud);
    
    color(8);
    cursor(16, 0);
    print("Score:");
    
    cursor(16,12);
    printNumber(score);
    color(0);
}

function update(){
    if(pressed("C")){
        exit();
    }
    
    if(gameover){
        color(8);
        cursor(20, 70);
        print("Game Over");
        cursor(20, 80);
        print("Final score: ");
        printNumber(finalScore);
        cursor(20, 90);
        print("Press A to play again!");
        color(0);
        if(pressed("A")){
            jumping = false;
            x = 20;
            y = 140;
            vx = 0;
            vy = 0;
            eng = 11;
            gameover = false;
            start = false;
        }
        return;
    }
    
    if(!start){
        move();
        render();
        if(pressed("B")){
            console("Start");
            start = true;
            jumping = true;
            vy = -10;
        }
        // don't continue main loop until jumped first time
        return;
    }
    
    move();
    updateBoon();
    
    if(cooldown > 0){
        cooldown--;
    }else{
        attack = false;
    }
    
    if(justPressed("A") && !attack && cooldown == 0 && eng > 0){
        attack = true;
        cooldown = 10;
        eng--;
    }
    
    if(!pressed("A")){
        // if trampoline bottom, start jump
        if(y > 138) {
            if((x > tl) && (x < tr)){
                jumping = true;
                combo = 0;
                y = 100;
                // music("jump.raw");
                if(pressed("B") && eng > 0){
                    eng--;
                    //super jump
                    vy = -14;
                    if(x < (tl+40)){
                        vx = -8;
                    }
                    if(x > (tr-40)){
                        vx = 8;
                    }
                }else{
                    if(eng < 11){
                        eng++;
                    }
                    //jump normal
                    vy = -6;
                }
            }
        }
    }
    
    // reset score if fall below trampoline
    if(y > 140){
        highscore(score);
        finalScore = score;
        score = 0;
        gameover = true;
        start = false;
    }
    
    render();

}
if ( file("images.res", 0) != 1 ){
    console("Could not find resources!");
    exit();
}

var playerY1 = 150;
var score1 = 0;

var playerY2 = 150;
var score2 = 0;

var Chicken1Anim = 0;

// CHANGED
const CAR_IDX = 8;
const PLAYER1_IDX = 1;
const PLAYER2_IDX = 2;

const vCars = 4;//each car has 4 varialbes
const nCars = 12;
const cCars = vCars * nCars;// we have 12 cars and each car has 4 variables each (x, y, speed, type, show)
var tCars = Array( cCars );
//var carLength = [32, 32, 64];

//initialize cars

for(var carid = 0; carid < nCars; carid++) {
    
	var i = carid * vCars; //determine the starting index in array for target car
	var lane = carid / 2;
	var speed = random(2, 5);
	var offset = 0;

	if (carid % 2 == 1) { 
	    offset = 150; 
	    
	}
	else {
	    offset = 0;
	}

	if (carid < 6) {

        tCars[i] = 0 - offset;
		tCars[i+1] = 22 +(lane * 21);//set Car (cardid) Y coordinate - 22,43,64
		tCars[i+2] = -speed;//set Car (cardid) XSPEED
		
    }
    else {   
        
	    tCars[i] = 220 + offset;
	    tCars[i+1] = 92 + ((lane-3) * 21);//set Car (cardid) Y coordinate - 92,113,134
	    tCars[i+2] = speed;//set Car (cardid) XSPEED
    }
// console( tCars[i]);
	tCars[i+3] = random(1, 3); //show

}



var start = time()

const StreetBG = file("StreetBG", 0); 

const carImages =
    [
    file("FreewayCar2", 0), // Red car
    file("FreewayCar1", 0), // Green car
    file("FreewayCar3", 0)  // Truck
    ];

const playerOne = file("FreewayChicken_F1", 0);
const playerOneF2 = file("FreewayChicken_F2", 0);

const playerTwo = file("FreewayChicken2_F1", 0);
const playerTwoF2 = file("FreewayChicken2_F2", 0);

const Chicken1box = file("Chicken1box", 0);
const Chicken2box = file("Chicken2box", 0);


function reset() {

    start = time();
    
    playerY1 = 150;
    score1 = 0;
    
    playerY2 = 150;
    score2 = 0;

}

function waitForInput()
{
    // Player One Input
    if ((pressed("UP")) && (playerY1 > 0))          playerY1-=2;
    if ((pressed("DOWN")) && (playerY1 < 150))      playerY1+=2;
    
    // Player Two Input
    if ((pressed("A")) && (playerY2 > 0))           playerY2-=2;
    if ((pressed("B")) && (playerY2 < 150))         playerY2+=2;

    if (pressed("C"))                               exit();
    
}

// CHANGED
function collide(carIdx, playerIdx)
{
    if (playerIdx == 1) { music("pouletjade.raw"); playerY1 = 150}
    if (playerIdx == 2) { music("pouletpapa.raw"); playerY2 = 150}
}

function background()
{
 for( var x = 0; x < 220; x+=30 ) { sprite(x, 0, StreetBG); }
}

function scoreDisplay()
{
    color(7);
    cursor(15,5)
    print(score1);
    
    cursor(200,5)
    print(score2);
    color(0);  
}

function playerRender()
{
    io("COLLISION", PLAYER1_IDX, CAR_IDX, collide);
    sprite(50, playerY1 + 6, Chicken1box);
    Chicken1Anim++;

    if((Chicken1Anim/3)%2==0) {
        sprite(50, playerY1, playerOne);
    }
    else {
        sprite(50, playerY1, playerOneF2);
    }

    io("COLLISION", PLAYER2_IDX, CAR_IDX, collide);
    sprite(150, playerY2 + 6, Chicken2box);
        //Chicken1Anim++;
        if((Chicken1Anim/3)%2==0)
        sprite(150, playerY2, playerTwo);
    else
        sprite(150, playerY2, playerTwoF2);
        //sprite(150, playerY2, playerTwo);
}


function updateCars(){
    
	for( var carid = 0; carid < nCars; carid++ ) {
	    
		var i = carid * vCars;//determine the starting index in array for target car
		var offset = -4;

		if (carid % 2 == 0) {
		    offset = 4;
		}
		else {
		    offset = -4;
		}
		
		
		var otherCarX = tCars[i + offset];
		var x = tCars[i] + tCars[i+2];

		if (tCars[i+2] > 0) {//car is moving to the right

            if (x + 80 < otherCarX || otherCarX < x) {
        
        		tCars[i] = x; //move target cars x coordinate by the cars speed 
        		
        	}
        	else {
       
        		tCars[i] = otherCarX - 80;
        	    
        	}
        
        
            launchCar_Right(i, offset);
            
		} 
		
		if (tCars[i+2] < 0) { //car must be moving left

        	if (x - 80 > otherCarX || otherCarX > x) {
        
        		tCars[i] = x; //move target cars x coordinate by the cars speed 
        		
        	}
        	else {
        
        		tCars[i] = otherCarX + 80;
        	    
        	}
        
            launchCar_Left(i, offset);
            
		}
    	
	}
	
}

function launchCar_Right(i, offset) {
    
	if(tCars[i] > 220) {//car i x coordinate is greater than right edge of screen
	
		tCars[i] = tCars[i + offset] - 250;
		tCars[i+2] = random(2, 5);// set car speed to a random number between 2 and 4
		tCars[i+3] = random(1, 4);// set car type to a random number between 1 and 3

	}
	
}

function launchCar_Left(i, offset) {
    
    if(tCars[i] < -64){
        
        tCars[i] = tCars[i + offset] + 250;
        tCars[i+2] = -random(2, 5);// set car speed to a random number between 2 and 4 negative
        tCars[i+3] = random(1, 4);// set car type to a random number between 1 and 3
        
    }
    
}

function carRender() {
    
	for( var carid = 0; carid < nCars; carid++) {

		var i = carid * vCars;//determine the starting index in array for target car
		
		if(tCars[i+2]>0){//car is moving to the right
			mirror( false );
		}
		else {
			mirror( true );
		}
		
        io("COLLISION", CAR_IDX, 0); // CHANGED
	    var carType = tCars[i+3] - 1;
        sprite(tCars[i], tCars[i+1], carImages[carType]);

	}
	
}

function checkForPoint() {
    
    if (playerY1 <= 0) {
        score1 +=1;
        playerY1 = 150;
        playSound();
    }
    
    if (playerY2 <= 0) {
        score2 +=1;
        playerY2 = 150;
        playSound();
    }
    
}


function playSound() {
    io("VOLUME", 127);
    io("DURATION", 70);
    sound(random(44, 47));
}

function gameOver() {
    
    highscore(max(score1, score2))
    background();
    updateCars();
    carRender();
    color(7); 
    
    if (score1 > score2) {
        cursor(55,75);
        print("PLAYER 1 WINS!")

    }
    else if (score1 == score2) {
        cursor(45,75);
        print("IT'S A TIED GAME!")
    }
    else {
        cursor(55,75);
        print("PLAYER 2 WINS!")
    }

    cursor(15,95);
    print("B TO RESTART / C TO EXIT")
    color(0);
    
    if (timeSinceStart >=60) timeSinceStart = 60;
    if (pressed("C")) exit();
    if (justPressed("B")) reset();

}


function update() {
    
    var timeSinceStart = (time() - start) / 1000; 
    
    if(timeSinceStart >= 60) {
        gameOver();
    } 
    else {
        checkForPoint();
        waitForInput();
        background();
        updateCars();
        carRender();
        playerRender();
        color(175); cursor(105,5); print(60 - timeSinceStart); //color(0);
    }
    
    scoreDisplay();

} 
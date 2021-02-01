// Jump by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 20;
const minX = ( ( minTX + 2 ) << 8 ) + ( 8 << 5 ), maxX = ( ( maxTX - 2 ) << 8 ) - ( 8 << 5 );
const minY = ( ( minTY + 2 ) << 8 ) + ( 8 << 5 ), maxY = ( ( maxTY ) << 8 ) - ( 8 << 5 );
const rangeX = maxX - minX;
const rangeY = maxY - minY;
const boardWidth = maxTX - minTX;
const boardHeight = maxTY - minTY;
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const player = builtin("char1");
const bat = builtin("char15");
const wall = builtin("floor1");
const platform = builtin("sFireball");
const heart = builtin("sHeart");
const star = builtin("sStar");
const bgColor = ( 16 * 4 ) + 15; //129;
const playerColor = 7; //15;
const platformColor = 86;
const starColor = ( 16 * 4 ) + 15;


const cPlatform = 50 << 2;
var nPlatform;
var tPlatform = Array( cPlatform );

const cStar = 50 << 2;
var nStar;
var tStar = Array( cStar );

var dead;
var score;

var height;
var maxheight;
var bx, by, bvx, bvy;
const bay = 1 << 2;
const bvyjump = (-5) << 5;

reset();

/*
function sin_8(x){ // period 2 * PI * 256 ~= 1608 => output in [ -256 , 256 ]
    x = ( x % 1608 );
    //if( x < 0 ) {
    //    x += 1608;
    //}
    if( x > 1206 ) {
        x -= 1608;
    } else if( x > 402 ) {
        x = 804 - x;
    }
    var x2 = x * x;
    // sin(x) ~= x(60-7x^2)/(60+3x^2) for x in [ -PI/2, PI/2 ];
    return( ( x * ( ( 60 << 16 ) - ( 7 * x2 ) ) ) / ( ( 60 << 16 ) + ( 3 * x2 ) ) );
}
*/


function reset(){
    highscore( score );
    score = 0;
    
    tileshift( 0, 0 );
    fill( 250 - ( 3 << 3 ) );
    for( var ty = 0; ty < maxTY; ty++ ) {
        var y = maxTY - ty - 1;
        if( y > ( ty + 1 ) ) {
            y = ty;
        }
        var s = y % 2;
        var l = 7 - ( y / 2 );
        clr = ( 10 * ( s << 3 ) ) + ( 6 << 3 ) + l;

        for( var tx = 0; tx < maxTX; tx++ ) {
            tile( tx, ty, clr );
        }
    }
    
    var yPlatform = (-100) << 5;
    const dyPlatform = 80 << 5;
    for( var iPlatform = 0; iPlatform < cPlatform; iPlatform += 4 ) {
        var wmin = 5 - ( ( 2 * iPlatform ) / cPlatform );
        var wmax = 8 - ( ( 5 * iPlatform ) / cPlatform );
        var wPlatform = random( wmin, wmax );
        tPlatform[iPlatform] = random( 0, rangeX - ( wPlatform << 8 ) );
        tPlatform[iPlatform + 1] = yPlatform;
        var vPlatform = ( ( 3 << 5 ) * iPlatform ) / cPlatform;
        tPlatform[iPlatform + 2] = vPlatform; 
        tPlatform[iPlatform + 3] = wPlatform;
        yPlatform += dyPlatform;
    }
    nPlatform = cPlatform;

    var yStar = 32 << 5;
    const dyStar = 80 << 5;
    for( var iStar = 0; iStar < cStar; iStar += 4 ) {
        tStar[iStar] = random( 8 << 5, rangeX - ( 8 << 5 ) );
        tStar[iStar + 1] = yStar;
        yStar += dyStar;
    }
    nStar = cStar;

    bx = ( minX + maxX ) >> 1;
    by = 0;
    height = 0;
    maxheight = 0;
    
    bvx = 2 << 5;
    bvy = 0;
    dead = false;
}


function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}


function updatePlatform( iPlatform, ys ){
    var wPlatform = tPlatform[iPlatform + 3];
    var d = rangeX - ( wPlatform << 8 );
    var xPlatform = ( ( d << 1 ) + tPlatform[iPlatform] + tPlatform[iPlatform + 2] ) % ( d << 1 );
    tPlatform[iPlatform] = xPlatform;
    var yPlatform = minY - tPlatform[iPlatform + 1] + height;
    
    if( ( yPlatform >= minY - ( 16 << 5 ) ) && ( yPlatform <= maxY + ( 16 << 5 ) ) ) {
        if( xPlatform >= d ) {
            xPlatform = ( d << 1 ) - xPlatform;
        }
        var xp = ( minX + xPlatform ) >> 5;
        var yp = yPlatform >> 5;
        if( bvy >= 0 ) {
            var dy = ( ys >> 5 ) - yp;
            if( ( dy > -8 ) && ( dy < 4 ) ) {
                var dx = ( bx >> 5 ) - xp;
                if( ( dx > -4 ) && ( dx < ( ( wPlatform << 3 ) + 4 ) ) ) {
                    bvy = bvyjump;
                    //music( "boing.raw" );
                    music( "Jump4.raw" );
                }
            }
        }
        for( var i = 0; i < wPlatform; i++ ) {
            sprite( xp - 4, yp - 4, platform );
            xp += 8;
        }
    }
}

function updateStar( iStar, ys ){
    var yStar = minY - tStar[iStar + 1] + height;
    
    if( ( yStar >= minY - ( 16 << 5 ) ) && ( yStar <= maxY + ( 16 << 5 ) ) ) {
        var xp = ( minX + tStar[iStar] ) >> 5;
        var yp = yStar >> 5;
        sprite( xp - 4, yp - 4, star );
        
        if( test_collide( xp, yp, bx >> 5, ys >> 5, 12, 12 ) ) {
            tStar[iStar + 1] = (-200 ) << 5;
            score++;
            music( "Pickup_Coin3.raw" );
        }
    }
}




function update(){
    
    if( pressed( "C" ) ) {
        exit();
    }
    
    if( pressed( "LEFT" ) ) {
        bx -= bvx;
        if( bx < minX ){
            bx += maxX - minX;
        }
    }
    if( pressed( "RIGHT" ) ) {
        bx += bvx;
        if( bx > maxX ) {
            bx -= maxX - minX;
        }
    }

    bvy += bay;
    by -= bvy;
    var ys = minY - by + height;
    
    color( platformColor );
    for( var iPlatform = 0; iPlatform < nPlatform; iPlatform += 4 ) {
        updatePlatform( iPlatform, ys );
    }
    
    color( starColor );
    for( var iStar = 0; iStar < nStar; iStar += 4 ) {
        updateStar( iStar, ys );
    }

    color( playerColor );
    sprite( ( ( bx ) >> 5 ) - 8, ( ( ys ) >> 5 ) - 8, player );
    
    if( ys < minY ) {
        height = by;
    } else if( ys >= ( maxY + ( 8 << 5 ) ) ) {
        dead = true;
    }
    
    if( maxheight < height ) {
        maxheight = height;
    }

    // hud
    color( 47 );
    sprite( 50, 165, lvl );
    cursor( 70, 165 );
    printNumber( maxheight >> 12 );
    color( 47 );
    sprite( 120, 165, pts );
    cursor( 140, 165 );
    printNumber( score );
    
    if( dead ) {
        music( "Explosion3.raw" );
        reset();
    }
}


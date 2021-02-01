// Mini Basket by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minX = ( 64 << 16 ), maxX = ( 204 << 16 );
const minY = ( 64 << 16 ), maxY = ( 160 << 16 );
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const star = builtin("sStar");
const heart = builtin("sHeart");
const waypoint = builtin("sBtn");
const ball = builtin("rock");
const bgColor = 225;
const playerColor = 7;
const enemyColor = 40;
const ballColor = 40;
const circleColor = 80;
const waypointColor = 200;
const starColor = 79;


const bangmin = 256 << 16;
const bangmax = 512 << 16;
const bvang = 2 << 16;
const bpowmin = 2 << 13;
const bpowmax = 5 << 13;
const bvpow = 1 << 9;
const bay = 1 << 6;
const bremmax = ( 4 * 60 ) << 3;

const leftLimit = ( 32 << 16 );
const lowerLimit = ( 160 << 16 );
const hoopY = 58 << 16;
const tHoopX = [ ( 32 << 16 ), ( 50 << 16 ) ];

const bxini = maxX - ( 32 << 16 );
const byini = maxY - ( 32 << 16 );
const bangini = ( bangmin + bangmax ) >> 1;
const bpowini = ( bpowmin + bpowmax ) >> 1;

const timShootMax = 60;
const cBall = 32 << 3;
const radBall = 8;
const radBall2 = ( radBall << 4 ) * ( radBall << 4 ); // 24.8
var nBall;
var tBall = Array( cBall );
var timShoot = 0;

// [0] = x
// [1] = y
// [2] = vx
// [3] = vy
// [4] = rem it
// [5] = score on/off

var timer;
var score;
var combo;
var frame = 0;

var bx, by, bang, bpow, bspr;


var tSqrt = new Array( 1024 );


if( file("basket.res", 0) != 1 ){
    console("Could not find resources!");
    exit();
}

const tImg = [ file( "basket1", 0 ), file( "basket2", 0 ), file( "basket3", 0 ),
    file( "basket4", 0 ), file( "basket5", 0 ), file( "basket6", 0 ), file( "basket7", 0 ),
    file( "basket8", 0 ), file( "basket9", 0 ), file( "basket10", 0 ) ];


tileshift( 0, 0 );
fill( bgColor );

reset();


function reset(){
    var i, v;
    
    score = 0;
    combo = 1;
    
    nBall = 0;
    //timShoot = timShootMax;
    
    bx = bxini;
    by = byini;
    bang = bangini;
    bpow = bpowini;
    
    timer = time() + ( 60 * 1000 ); 

    for( i = 0; i < ( 1 << 14 ); i++ ) {
        v = i * i;
        poke( tSqrt + ( v >> 16 ), ( i >> 6 ) );
    }
}

/*
// Rect overlap test
function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}
*/

/*
// Circle overlap test
function test_collide2( x1, y1, x2, y2, rx, ry ){
    var dx = x2 - x1, dy = y2 - y1, d = rx + ry;
        return( ( ( dx * dx ) + ( dy * dy ) ) < ( d * d ) );
    }
    */
    
/*
function test_visible( x, y ){
    return( ( x >= minX ) && ( x <= maxX ) && ( y >= minY ) && ( y <= maxY ) );
}
*/

function updateBall( iBall ){
    var ptr, k, i;
    var ax, ay, dx, dy, ex, ey, e2, p, px, py;

    ptr = tBall + ( iBall << 2 );
    // [0] = x
    // [1] = y
    // [2] = vx
    // [3] = vy
    // [4] = rem it
    // [5] = score on/off

    var x = ptr[0];
    var y = ptr[1];
    var xl = x;
    var yl = y;
    var vx = ptr[2];
    var vy = ptr[3];
    var rem = ptr[4] - 1;
    var scoreon = ptr[5];

    if( rem <= 0 ) {
        //delete_ball( iBall );
        for( k = iBall + 8; k < nBall; k++ ) {
            tBall[k - 8] = tBall[k];
        }
        nBall -= 8;
        return( iBall );
    }

    x += vx;
    y += vy;
    vy += bay;
    
    for( ax of tHoopX ) {
        ay = hoopY;
        dx = ( ax - x ); // 16.16
        dy = ( ay - y );
        ex = dx >> 12; // 16.4
        ey = dy >> 12; // 16.4
        e2 = ( ex * ex ) + ( ey * ey ); // 16.8
        
        if( e2 <= radBall2 ) {
            i = e2 >> 3; // 16.5
            k = 256;
            if( i < ( 1024 << 2 ) ) {
                k = peek( tSqrt + i ); // 8.0
            }
            dx = dx / k; // 16.8
            dy = dy / k; // 16.8

            p = ( ( ( vx >> 8 ) * ( dx >> 2 ) ) + ( ( vy >> 8 ) * ( dy >> 2 ) ) ) >> 6;
            
            if( p > 0 ) {
                vx -= ( p * ( dx >> 6 ) );
                vy -= ( p * ( dy >> 6 ) );
            }
        }
    }
    
    if( ( scoreon > 0 ) && testx( xl ) && testx( x ) ) {
        if( yl < hoopY && y >= hoopY ) {
            score += combo;
            combo++;
            scoreon = 0;
        }
    }

    if( ( x <= leftLimit ) && ( vx < 0 ) ) {
        vx = - ( vx >> 1 );

    }
    if( ( y >= lowerLimit ) && ( vy > 0 ) ) {
        vy = - ( vy >> 1 );

        if( scoreon > 0 ) {
            combo = 1;
            scoreon = 0;
        }
    }

    ptr[0] = x;
    ptr[1] = y;
    ptr[2] = vx;
    ptr[3] = vy;
    ptr[4] = rem;
    ptr[5] = scoreon;
    
    return( iBall + 8 );
}

function testx( x ){
    return( ( x >= tHoopX[0] ) && ( x <= tHoopX[1] ) );
}


function shooting( x, y, vx, vy ){
    if( pressed( "A" ) ) {
    //if( nBall < cBall ) {
        ptr = tBall + ( nBall << 2 );
        // [0] = x
        // [1] = y
        // [2] = vx
        // [3] = vy
        // [4] = rem it
        // [5] = score on/off
        
        ptr[0] = x;
        ptr[1] = y;
        ptr[2] = vx;
        ptr[3] = vy;
        ptr[4] = bremmax;
        ptr[5] = 1;
        
        timShoot = timShootMax;
        bx = random( minX, maxX );
        by = random( minY, maxY );
        
        nBall += 8;
    //}
    } else {
        color( 0 );
        sprite( ( x >> 16 ) - radBall, ( y >> 16 ) - radBall, bspr );
        
        var m = ( frame << 2 ) & 63;
        for( iBall = 0; x >= 0 && x <= ( 220 << 16 ) && y < ( 176 << 16 ); iBall++ ) {
            if( ( iBall & 63 ) == m ) {
                color( waypointColor );
                sprite( ( x >> 16 ) - 4, ( y >> 16 ) - 4, waypoint );
            }
            x += vx;
            y += vy;
            vy += bay;
        }
    }
}

function update(){
    var it, iBall, ptr, k;

    frame++;
    timShoot--;
    bspr = tImg[ 5 + ( ( frame >> 2 ) & 3 ) ];
    
    color( 0 );
    for( x = 0; x < 220; x += 16 ) {
        sprite( x, 160, tImg[4] );
    }
    io( "SCALE", 2 );
    sprite( 0, 0, tImg[0] );
    for( y = 96; y < 144; y += 16 ) {
        sprite( 0, y, tImg[9] );
    }
    io( "SCALE", 1 );
    sprite( 28, 54, tImg[2] );
    
    //color( 0 );
    for( iBall = 0; iBall < nBall; iBall += 8 ) {
        ptr = tBall + ( iBall << 2 );
        // [0] = x
        // [1] = y
        // [2] = vx
        // [3] = vy
        // [4] = rem it
        // [5] = score on/off
        
        sprite( ( ptr[0] >> 16 ) - radBall, ( ptr[1] >> 16 ) - radBall, bspr );
    }


    if( timShoot <= 0 ) {
        shooting( bx, by, ( bpow * cos( bang >> 16 ) ) >> 8, ( ( -bpow ) * sin( bang >> 16 ) ) >> 8 );
    }
    
    color( 0 );
    sprite( 28, 54, tImg[3] );
    
    for( it = 0; it < 8; it++ ) {
        for( iBall = 0; iBall < nBall; ) {
            iBall = updateBall( iBall );
        }
    }
    
    if( pressed( "C" ) ) {
        exit();
    }
    
    if( pressed( "RIGHT" ) ) {
        bang -= bvang;
        if( bang < bangmin ){
            bang = bangmin;
        }
    }
    if( pressed( "LEFT" ) ) {
        bang += bvang;
        if( bang > bangmax ){
            bang = bangmax;
        }
    }
    if( pressed( "UP" ) ) {
        bpow += bvpow;
        if( bpow > bpowmax ){
            bpow = bpowmax;
        }
    }
    if( pressed( "DOWN" ) ) {
        bpow -= bvpow;
        if( bpow < bpowmin ){
            bpow = bpowmin;
        }
    }
    
    rem = timer - time();
    
    if( rem < 0 ) {
        highscore( score );
        reset();
    }
    
    // hud
    color( 47 );
    //cursor( 8, 165 );
    //print( "COMBO X" );
    //printNumber( combo );
    
    sprite( 100, 165, pts );
    cursor( 120, 165 );
    printNumber( score );

    cursor( 180, 165 );
    printNumber( rem / 1000 );
}


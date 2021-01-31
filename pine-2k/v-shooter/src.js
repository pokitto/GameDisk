// Vertical Scroll Shooter by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 21;
const minX = ( ( minTX + 2 ) << 8 ) + ( 8 << 5 ), maxX = ( ( maxTX - 2 ) << 8 ) - ( 8 << 5 );
const minY = ( ( minTY + 2 ) << 8 ) + ( 8 << 5 ), maxY = ( ( maxTY ) << 8 ) - ( 8 << 5 );
const boardWidth = maxTX - minTX;
const boardHeight = maxTY - minTY;
const pts = builtin("sPts");
const player = builtin("char1");
const enemy1 = builtin("char5");
const enemy2 = builtin("char15");
const wall = builtin("floor1");
const ground = builtin("floor3");
const star = builtin("sStar");
const weapon = builtin("weapon2");
const bgColor = ( 16 * 4 ) + 15; //129;
const playerColor = 15;
const enemy1Color = 15;
const enemy2Color = 15;
const starColor = ( 16 * 4 ) + 15;

var pos;
var vpos;
var vEnemy;
var posSwarm;
var dposSwarm;

const cWeapon = 3 << 2;
var nWeapon;
var tWeapon = Array( cWeapon );
const vWeapon = ( 2 << 5 );
const dWeapon = ( 32 << 5 );

const cEnemy = 50 << 3;
var nEnemy;
var tEnemy = Array( cEnemy );

var dead;
var score;
var bx, by, bvx, bvy;


reset();

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

/*
function add_weapon( x, y, v, d ){
    if( nWeapon < cWeapon ) {
        tWeapon[nWeapon] = x;
        tWeapon[nWeapon + 1] = y;
        tWeapon[nWeapon + 2] = v;
        tWeapon[nWeapon + 3] = d;
        nWeapon += 4;
    }
}

function delete_weapon( j ){
    if( nWeapon > 0 ) {
        for( var k = j + 4; k < nWeapon; k++ ) {
            tWeapon[k - 4] = tWeapon[k];
        }
        nWeapon -= 4;
    }
}


function add_enemy( x, y, a, w, p ){
    if( nEnemy < cEnemy ) {
        tEnemy[nEnemy] = x;
        tEnemy[nEnemy + 1] = y;
        tEnemy[nEnemy + 2] = a;
        tEnemy[nEnemy + 3] = w;
        tEnemy[nEnemy + 4] = p;
        nEnemy += 8;
    }
}

function delete_enemy( i ){
    if( nEnemy > 0 ) {
        for( var k = i + 8; k < nEnemy; k++ ) {
            tEnemy[k - 8] = tEnemy[k];
        }
        nEnemy -= 8;
    }
}

function add_swarm( n, y ){
    var a = ( random( 40, 90 ) << 5 );
    var x = ( random( minX, maxX - ( a << 1 ) ) ) + a;
    var p = random( 0, 1 << 5 );
    const w = 10;
    const v = 5;
    const dy = 24;
    for( var i = 0; i < n; i++ ) {
        //add_enemy( x, y, a, w, p );
        
        if( nEnemy < cEnemy ) {
            tEnemy[nEnemy] = x;
            tEnemy[nEnemy + 1] = y;
            tEnemy[nEnemy + 2] = a;
            tEnemy[nEnemy + 3] = w;
            tEnemy[nEnemy + 4] = p;
            nEnemy += 8;
        }
        
        y -= ( dy << 5 );
        p += v * dy;
    }
}
*/



function tilemap(t){
    tileshift( 0, 7 - ( t % 8 ) );
    var tx, ty, y;
    var oy = ( ( t >> 3 ) % 2 );
    //fill( bgColor );
    color( bgColor );
    for( ty = minTY; ty < ( maxTY + 2 ); ty += 2 ) {
        y = ty - oy;
        if( y < minTY ) {
            y = minTY;
        } else if( y >= maxTY ) {
            y = maxTY;
        }
        for( tx = minTX; tx < maxTX; tx += 2 ) {
            tile( tx, y, ground );
        }
    }
}


function reset(){
    highscore( score );
    score = 0;
    
    nWeapon = 0;
    nEnemy = 0;
    
    pos = 0;
    vpos = ( 1 << 5 );
    vEnemy = ( 1 << 4 );
    dposSwarm = ( 300 << 5 );
    posSwarm = 0;
    
    bx = ( minX + maxX ) >> 1;
    by = maxY - ( 32 << 5 );
    
    bvx = 2 << 5;
    bvy = bvx;
    dead = false;
}


function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}


function updateEnemy(i){
    var k;

    var y = tEnemy[i + 1];
    var x = tEnemy[i] + ( ( tEnemy[i + 2] * sin_8( tEnemy[i + 4] + ( tEnemy[i + 3] * ( y >> 5 ) ) ) ) >> 8 );
    sprite( ( x >> 5 ) - 8, ( y >> 5 ) - 8, enemy1 );
    
    if( test_collide( x, y, bx, by, ( 14 << 5 ), ( 14 << 5 ) ) ) {
        dead = true;
    }

    for( var j = 0; j < nWeapon; j += 4 ) {
        var wx = tWeapon[j];
        var wy = tWeapon[j + 1];
        var wd = tWeapon[j + 3];
        
        if( test_collide( x, y, wx, wy, ( 12 << 5 ), ( 6 << 5 ) ) ) {
            tWeapon[j + 3] = 0;
            y = ( maxY + ( 32 << 5 ) );
            score++;
        }
    }
    
    y += vpos + vEnemy;
    tEnemy[i + 1] = y;

    if( y >= ( maxY + ( 32 << 5 ) ) ) {
        //delete_enemy( i );
        if( nEnemy > 0 ) {
            for( k = i + 8; k < nEnemy; k++ ) {
                tEnemy[k - 8] = tEnemy[k];
            }
            nEnemy -= 8;
        }
        i -= 8;
    }
    return(i);
}

function update(){
    var i, j, k;
    color( enemy1Color );
    for( i = 0; i < nEnemy; i += 8 ) {
        i = updateEnemy(i);
    }
    
    for( j = 0; j < nWeapon; j += 4 ) {
        var wv = tWeapon[j + 2];
        tWeapon[j + 1] -= wv;
        tWeapon[j + 3] -= wv;
        sprite( ( tWeapon[j] >> 5 ) - 8, ( tWeapon[j + 1] >> 5 ) - 8, weapon );
        
        if( tWeapon[j + 3] <= 0 ) {
            //delete_weapon( j );
            if( nWeapon > 0 ) {
                for( k = j + 4; k < nWeapon; k++ ) {
                    tWeapon[k - 4] = tWeapon[k];
                }
                nWeapon -= 4;
            }
            j -= 4;
        }
    }
    
    if( pressed( "C" ) ) {
        exit();
    }
    
    if( pressed( "LEFT" ) ) {
        bx -= bvx;
        if( bx < minX ){
            bx = minX;
        }
    }
    if( pressed( "RIGHT" ) ) {
        bx += bvx;
        if( bx > maxX ) {
            bx = maxX;
        }
    }
    if( pressed( "UP" ) ) {
        by -= bvy;
        if( by < minY ){
            by = minY;
        }
    }
    if( pressed( "DOWN" ) ) {
        by += bvy;
        if( by > maxY ){
            by = maxY;
        }
    }
    if( justPressed( "A" ) ){
        //add_weapon( bx, by - ( 8 << 5 ), vWeapon, dWeapon );
        if( nWeapon < cWeapon ) {
            tWeapon[nWeapon] = bx;
            tWeapon[nWeapon + 1] = by - ( 8 << 5 );
            tWeapon[nWeapon + 2] = vWeapon;
            tWeapon[nWeapon + 3] = dWeapon;
            nWeapon += 4;
        }
    }
    
    color( playerColor );
    sprite( ( ( bx ) >> 5 ) - 8, ( ( by ) >> 5 ) - 8, player );
    
    tilemap( pos >> 5 );
    pos += vpos;
    if( pos >= posSwarm ) {
        //add_swarm( 5, -32 );
        const dy = -32;
        var a = ( random( 40, 90 ) << 5 );
        var x = ( random( minX, maxX - ( a << 1 ) ) ) + a;
        var y = -32;
        var p = random( 0, 1 << 5 );
        const w = 10;
        const v = 5;
        const dy = 20;
        for( i = 0; i < 16; i++ ) {
            //add_enemy( x, y, a, w, p );
            
            if( nEnemy < cEnemy ) {
                tEnemy[nEnemy] = x;
                tEnemy[nEnemy + 1] = y;
                tEnemy[nEnemy + 2] = a;
                tEnemy[nEnemy + 3] = w;
                tEnemy[nEnemy + 4] = p;
                nEnemy += 8;
            }
            
            y -= ( dy << 5 );
            p += v * dy;
        }
        dposSwarm -= (2 << 5); 
        posSwarm += dposSwarm;
    }
    
    // hud
    color( 47 );
    sprite( 100, 165, pts );
    cursor( 120, 165 );
    printNumber( score );
    
    if( dead ) {
        reset();
    }
}


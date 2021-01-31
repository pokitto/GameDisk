// Frog by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 20;
const minX = ( 8 << 16 ), maxX = ( 212 << 16 );
const minY = ( 8 << 16 ), maxY = ( 168 << 16 );
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
const waterColor = 226;
const roadColor = 1;
const groundColor = 129;
const playerColor = 7;
const platformColor = 86;
const starColor = ( 16 * 4 ) + 15;


if( file( "frog.res", 0 ) != 1 ){
    console( "Could not find resources!" );
    exit();
}

const tImgFrogV = [ file( "frog1", 0 ), file( "frog2", 0 ), file( "frog3", 0 ), file( "frog4", 0 ), file( "frog5", 0 ) ];
const tImgFrogH = [ file( "frog6", 0 ), file( "frog7", 0 ), file( "frog8", 0 ), file( "frog9", 0 ), file( "frog10", 0 ) ];
const tImgLog = [ file( "log1", 0 ), file( "log2", 0 ), file( "log3", 0 ) ];
const tImgCar = [ file( "car1", 0 ), file( "car2", 0 ) ];
const tImgSmoke = [ file( "smoke1", 0 ), file( "smoke2", 0 ) ];
const tImgDash = [ file( "dash1", 0 ), file( "dash2", 0 ) ];

const typLog = 0;
const typCar = 1;

const tSecLog1 = [ 0, 1,  1, 1,  1, 2,  0, 1,  1, 0,  2, 1 ];
const tSecLog2 = [ 1, 1,  2, 1,  1, 2,  1, 1,  0, 0,  2, 1 ];
const tSecLog3 = [ 2, 1,  1, 2,  0, 2,  2, 1,  2, 0,  1, 1 ];
const tSecLog4 = [ 0, 2,  2, 0,  2, 2,  1, 2,  1, 0,  0, 2 ];
const tSecCar1 = [ 1, 0,  2, 1,  0, 1,  1, 0,  2, 3,  1, 0 ];
const tSecCar2 = [ 2, 0,  3, 1,  0, 1,  2, 0,  3, 3,  2, 0 ];

const tTileColor = [
    groundColor, groundColor,
    waterColor, waterColor, 
    waterColor, waterColor,
    waterColor, waterColor,
    waterColor, waterColor,
    groundColor, groundColor,
    roadColor, roadColor,
    roadColor, roadColor,
    roadColor, roadColor,
    roadColor, roadColor,
    groundColor, groundColor
];

const tRowSec = [
    null,
    tSecLog1,
    tSecLog2,
    tSecLog3,
    tSecLog4,
    null,
    tSecCar1,
    tSecCar2,
    tSecCar2,
    tSecCar1,
    null
];

const tRowTyp = [
    null,
    typLog,
    typLog,
    typLog,
    typLog,
    null,
    typCar,
    typCar,
    typCar,
    typCar,
    null
];

const tDirX = [ 1, 0, -1, 0 ];
const tDirY = [ 0, -1, 0, 1 ];

const tDirMirror = [ false, false, true, false ];
const tDirFlip = [ false, false, false, true ];
const tDirSpr = [ tImgFrogH, tImgFrogV, tImgFrogH, tImgFrogV ];

const bremx = 5;
const bremy = 5;
const bvx = ( ( 16 << 16 ) / bremx );
const bvy = ( ( 16 << 16 ) / bremy );

const patternSize = 256;
var tPattern = Array( patternSize );
var tRow = Array( 16 << 3 );
var nRow;


// [0] = nPattern
// [1] = typRow
// [2] = xRow 16.16
// [3] = vxRow 16.16
// [4] = yRow 16.16
// [5] = tRowOffset
// [6] = ty

var dead;
var score = 0;
var level = 1;
var frame = 0;

var bx, by, bdir;
var brem = 0, brem0 = 0;




reset();


function reset(){
    var i, j, c, k, v, t, typ, sec;
    var ptrPattern;
    var ptrRow;
    var iRow, offset;
    
    tileshift( 0, 0 );
    for( i in tTileColor ) {
        c = tTileColor[i];
        for( j = 0; j < 28; j++ ) {
            tile( j, i, c );
        }
    }

    bx = ( minX + maxX ) >> 1;
    by = maxY;
    bdir = 1;
    dead = false;

    // [0] = nPattern
    // [1] = typRow
    // [2] = xRow 16.16
    // [3] = vxRow 16.16
    // [4] = yRow 16.16
    // [5] = tRowOffset
    // [6] = ty
        
    iRow = 0;
    offset = 0;
    ptrPattern = tPattern;
    ptrRow = tRow;
    var vx = ( 2 + level ) << 14;
    //var ty = 1;

    for( ty in tRowSec ) {
        sec = tRowSec[ ty ];
        typ = tRowTyp[ ty ];
        
        if( sec != null ) {
            i = 0;
            j = 0;
            ptrRow[2] = 0;
            ptrRow[3] = vx;
            ptrRow[1] = typ;
            ptrRow[5] = offset;
            ptrRow[6] = ty;
            vx = -vx;
            
            for( v of sec ) {
                poke( ptrPattern + i, j * ( v | ( 64 + 128 ) ) );
                i++;
                for( k = 0; k < v; k++ ) {
                    poke( ptrPattern + i, j * ( 128 ) );
                    i++;
                }
                j = 1 - j;
            }
            ptrRow[0] = i;
        
            iRow += 8;
            ptrPattern += i;
            ptrRow += 8 << 2;
            offset += i;
        }
    }
    nRow = iRow;
}

/*
function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}
*/

function test_collide_x( x1, x2, ex ){
    var dx = x2 - x1;
    return( ( dx > -ex ) && ( dx < ex ) );
}

function updateRowLog( xRow, nPattern, ptrPattern, ys, bplayer ) {
    var x = ( xRow >> 20 );
    for( var xs = -64 - ( ( xRow >> 16 ) & 15 ); xs < 220; xs += 16 ) {
        var v = peek( ptrPattern + x );
        if( ( v & 64 ) > 0 ) {
            sprite( xs, ys, tImgLog[ v & 63 ] );
        } else if( bplayer ) {
            if( ( v & 128 ) == 0 ) {
                if( test_collide_x( bx, ( xs + 8 ) << 16, ( 2 + 7 ) << 16 ) ) {
                    dead = true;
                }
            }
        }
        x = ( x + 1 ) % nPattern;
    }
}


function updateRowCar( xRow, nPattern, ptrPattern, ys, bplayer ) {
    var x = ( xRow >> 21 );
    var s = tImgCar[ ( frame >> 3 ) & 1 ];
    for( var xs = -64 - ( ( xRow >> 16 ) & 31 ); xs < 220; xs += 32 ) {
        var v = peek( ptrPattern + x );
        if( ( v & 128 ) > 0 ) {
            sprite( xs, ys, s );
            if( bplayer ) {
                if( test_collide_x( bx, ( xs + 16 ) << 16, ( 7 + 12 ) << 16 ) ) {
                    dead = true;
                }
            }
        }
        x = ( x + 1 ) % nPattern;
    }
}



function update(){

    frame++;

    if( brem <= 0 ) {
        if( pressed( "RIGHT" ) ) {
            music( "Jump14.raw" );
            bdir = 0;
            brem = bremx;
        }
        if( pressed( "UP" ) ) {
            music( "Jump10.raw" );
            bdir = 1;
            brem = bremy;
            score++;
        }
        if( pressed( "LEFT" ) ) {
            music( "Jump14.raw" );
            bdir = 2;
            brem = bremx;
        }
        if( pressed( "DOWN" ) ) {
            music( "Jump10.raw" );
            bdir = 3;
            brem = bremy;
            score--;
        }
        brem0 = brem + 1;
        
    } else {
        brem--;
        bx += bvx * tDirX[ bdir ];
        by += bvy * tDirY[ bdir ];
    }
    
    if( bx < minX ){
        bx = minX;
    }
    if( bx > maxX ) {
        bx = maxX;
    }
    if( by < minY ){
        by = minY;
    }
    if( by > maxY ) {
        by = maxY;
    }

    if( pressed( "C" ) ) {
        exit();
    }

    // [0] = nPattern
    // [1] = typRow
    // [2] = xRow 16.16
    // [3] = vxRow 16.16
    // [4] = yRow 16.16
    // [5] = tRowOffset
    // [6] = ty
    
    for( iRow = 0; iRow < nRow; iRow += 8 ) {
        var ptrRow = tRow + ( iRow << 2 );
        var ptrPattern = tPattern + ptrRow[5];
        var xRow = ptrRow[2];
        var ty = ptrRow[6];
        var nPattern = ptrRow[0];
        var vxRow = ptrRow[3];
        var ys = ty << 4;
        var n = 20;
        var bplayer = false;
        
        if( ( brem <= 0 ) && ( ( by >> 20 ) == ( ys >> 4 ) ) ) {
            bplayer = true;
        }
        
        if( ptrRow[1] == 0 ) {
            updateRowLog( xRow, nPattern, ptrPattern, ys, bplayer );
            if( bplayer ) {
                bx -= vxRow;
            }
        } else {
            n = 21;
            mirror( vxRow > 0 );
            updateRowCar( xRow, nPattern, ptrPattern, ys, bplayer );
            mirror( false );
        }
        n = ( nPattern << n );
        ptrRow[2] = ( xRow + vxRow + n ) % n;
    }
    
    flip( tDirFlip[ bdir ] );
    mirror( tDirMirror[ bdir ] );
    var spr = tDirSpr[ bdir ];
    spr = spr[ ( brem * 5 ) / brem0 ];
    color( 0 );
    sprite( ( ( bx ) >> 16 ) - 8, ( ( by ) >> 16 ) - 8, spr );
    flip( false );
    mirror( false );

    // hud
    color( 47 );
    sprite( 50, 4, lvl );
    cursor( 70, 4 );
    printNumber( level );
    color( 47 );
    sprite( 120, 4, pts );
    cursor( 140, 4 );
    printNumber( score );

    if( dead ) {
        //music( "Explosion3.raw" );
        music( "Hit_Hurt4.raw" );
        highscore( score );
        score = 0;
        level = 1;
        reset();
        
    } else {
        if( ( brem <= 0 ) && ( by <= ( 10 << 16 ) ) ) {
            music( "Pickup_Coin3.raw" );
            level++;
            reset();
        }
    }
}


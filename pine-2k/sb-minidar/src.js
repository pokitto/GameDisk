// Minidar by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 23;
const minX = ( ( minTX ) << 8 ), maxX = ( ( maxTX ) << 8 );
const minY = ( ( minTY ) << 8 ), maxY = ( ( maxTY ) << 8 );
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const player = builtin("char14");
const enemy = builtin("char6");
const enemy2 = builtin("char26");
const star = builtin("sStar");
const heart = builtin("sHeart");
const pellet = builtin("sBtn");
const tileOnColor = 189;
const tileOffColor = 194;
const bgColor = 225;
const playerColor = 7;
const enemyColor = 40;
const pelletColor = 200;
const starColor = 79;

const tDirX = [ 1, 0, -1, 0 ];
const tDirY = [ 0, -1, 0, 1 ];


const mapW = 26;
const mapH = 27;
const mapSize = mapW * mapH;
var tMap = Array( mapSize );

const tHeight = [ 5, 5, 4, 4, 5, 3,
    3, 4, 5, 9, 5,
    5, 5, 4, 3, 6, 3,
    3, 4, 5, 6, 3, 5,
    5, 5, 6, 7, 3, -1 ];

const cChar = 16 << 4;
var nChar;
var tChar = Array( cChar );
// [0] = x
// [1] = y
// [2] = dir
// [3] = dist
// [4] = v
// [5] = ndir
// [6] = xs
// [7] = ys

const vPlayer = 3 << 5;
const vEnemy = 2 << 5;

var dead;
var score;
var level = 1;
var frame = 0;

var tClr = new Array( 16 );
var tSqrt = new Array( 257 );

reset();


/*
// Linear interpolation
function lerp( a, b, c, d ){
    return( a + ( ( ( b - a ) * c ) / d ) );
}
*/





/*
function updateTilemap( dx, dy ){
    tileshift( dx & 7, dy & 7 );
    dx >>= 3;
    dy >>= 3;
    for( var ty = minTY; ty < maxTY; ty++ ) {
        for( var tx = minTX; tx < maxTX; tx++ ) {
            var v = bgColor;
            var x = tx + dx;
            var y = ty + dy;
            if( x >= 0 && x < mapW && y >= 0 && y < mapH ) {
                var w = tMap[ x + ( mapW * y ) ];
                if( w >= 64 ) {
                    v = tileOffColor; //pellet;
                } else if( w >= 32 ) {
                    v = tileOnColor;
                }
            }
            tile( tx, ty, v );
        }
    }
}
*/

function updateTilemap2( dx, dy ){
    tileshift( dx & 7, dy & 7 );
    dx >>= 3;
    dy >>= 3;
    
    var c1 = ( ( frame >> 5 ) & 31 );
    for( var i = 0; i < 8; i++ ) {
        var c2 = ( ( c1 << 3 ) | i );
        tClr[ 7 - i ] = c2;
        tClr[ 8 + i ] = c2;
    }
    
    var xc = mapW >> 1;
    var yc = mapH >> 1;
    
    for( var ty = minTY; ty < maxTY; ty++ ) {
        for( var tx = minTX; tx < maxTX; tx++ ) {
            var v = bgColor;
            var x = tx + dx;
            var y = ty + dy;
            if( x >= 0 && x < mapW && y >= 0 && y < mapH ) {
                var w = tMap[ x + ( mapW * y ) ];
                if( w >= 32 ) {
                    var ex = x - xc;
                    var ey = y - yc;
                    var d1 = tSqrt[ ( ex * ex + ey * ey ) >> 2 ] >> 10;
                    var d2 = ( frame >> 2 );
                    v = tClr[ ( 15 + d1 - d2 ) & 15 ];
                }
            }
            tile( tx, ty, v );
        }
    }
}

function aux( i, xt0, yt0 ){
    var i0 = xt0 + ( yt0 * mapW );
    var v0 = tMap[ i0 ];
    if( v0 >= 32 ) {
        var c0 = 0;
        for( var d = 0; d < 4; d++ ) {
            var e = ( 1 << d );
            var xt1 = xt0 + tDirX[d];
            var yt1 = yt0 + tDirY[d];
            if( xt1 >= 0 && xt1 < mapW && yt1 >= 0 && yt1 < mapH ) {
                var i1 = xt1 + ( yt1 * mapW );
                var v1 = tMap[ i1 ];
                if( v1 >= 32 ) {
                    v0 |= e;
                    c0++;
                    if( i > 0 ) {
                        if( ( v1 & e ) == 0 ) {
                            tMap[ i1 ] = ( v1 | 16 );
                        }
                    }
                }
            }
        }
        if( c0 > 1 ) {
            v0 |= 16;
        }
        tMap[ i0 ] = v0;
    }
}


function reset(){
    //highscore( score );
    //score = 0;
    var i, j;
    
    for( i = 0; i <= ( 1 << 16 ); i++ ) {
        var v = ( ( ( i >> 2 ) * ( i >> 2 ) ) >> 20 );
        tSqrt[ v ] = i;
    }
    
    dead = false;
    
    fill( bgColor );
    
    for( i = 0; i < mapSize; i++ ) {
        tMap[i] = 0;
    }
    
    var xt0 = 0;
    var yt0 = 0;
    var xt1 = ( mapW - 1 ) / 5;
    var yt1;
    for( i = 0; tHeight[i] > 0; i++ ) {
        var h = tHeight[i];
        yt1 = yt0 + h;
        for( j = xt0; j <= xt1; j++ ) {
            tMap[ j + ( yt0 * mapW ) ] = 96;
            tMap[ j + ( yt1 * mapW ) ] = 96;
        }
        for( j = yt0; j < yt1; j++ ) {
            tMap[ xt0 + ( j * mapW ) ] = 96;
            tMap[ xt1 + ( j * mapW ) ] = 96;
        }
        yt0 = yt1;
        if( yt0 >= mapH - 1 ) {
            j = xt1 - xt0;
            xt0 = xt1;
            xt1 += j;
            yt0 = 0;
        }
    }
    
    for( i = 0; i < 2; i++ ) {
        for( yt0 = 0; yt0 < mapH; yt0++ ) {
            for( xt0 = 0; xt0 < mapW; xt0++ ) {
                aux( i, xt0, yt0 );
            }
        }
    }
    
    //tileshift( 0, 0 );
    //fill( bgColor );

    /*
    save( "aux.map", tMap );
    exec( "minidar-1.js" );
    */
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

function test_visible( x, y ){
    return( ( x >= minX ) && ( x <= maxX ) && ( y >= minY ) && ( y <= maxY ) );
}


function updateChar(iChar){
    // [0] = x
    // [1] = y
    // [2] = dir
    // [3] = dist
    // [4] = v
    // [5] = ndir
    var i, k;

    var ptr = tChar + iChar;
    
    iChar += 16;
    
    return(iChar);
}

function update(){
    var iChar, k;
    var x, y, v;
    
    frame++;
    
    var dymax = ( mapH - maxTY + 3 ) << 3;
    var dy = frame % ( dymax << 1 );
    if( dy >= dymax ) {
        dy = ( dymax << 1 ) - dy;
    }
    
    var dx = -8;
    updateTilemap2( dx, dy - 8 );
    
    color( enemyColor );
    for( iChar = 16; iChar < nChar; ) {
        iChar = updateChar(iChar);
    }

    color( 1 );
    for( var i = 0; i < 2; i++ ) {
        cursor( 110 - ( 19 << 2 ) + i, 64 + i );
        print( "Minidar by SkyBerron");
        cursor( 110 - ( 21 << 2 ) + i, 96 + i );
        print( "Press any key to start");
        color( 47 );
    }
    
    if( pressed( "C" ) ) {
        exit();
    }
    
    if( justPressed( "A" ) ) {
        updateTilemap2( dx, dymax - 8 );
        save( "aux.map", tMap );
        exec( "minidar-1.js" );
    }
    
    // hud
    color( 47 );
    sprite( 50, 165, lvl );
    cursor( 70, 165 );
    printNumber( level );
    //color( 47 );
    sprite( 100, 165, pts );
    cursor( 120, 165 );
    printNumber( score );
    
    if( dead ) {
        reset();
    }
}


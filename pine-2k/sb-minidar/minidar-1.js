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
const tileOffColor = 194; //227;
const bgColor = 225;
const playerColor = 7;
const enemyColor = 40;
const pelletColor = 200;
const starColor = 79;

const tDirX = [ 1, 0, -1, 0 ];
const tDirY = [ 0, -1, 0, 1 ];

/*
const cRow = maxTY - 2;
var tRow = Array( cRow );
*/

const mapW = 26;
const mapH = 27;
const mapSize = mapW * mapH;
//var tMap = Array( mapSize );
var tMap = file( "aux.map", null );
/*
const tHeight = [ 5, 5, 4, 4, 5, 3,
    3, 4, 5, 9, 5,
    5, 5, 4, 3, 6, 3,
    3, 4, 5, 6, 3, 5,
    5, 5, 6, 7, 3, -1 ];
*/
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
var score = 0;
var level = 1;
//var frame = 0;


//tileshift( 0, 0 );
//fill( bgColor );

reset();


/*
// Linear interpolation
function lerp( a, b, c, d ){
    return( a + ( ( ( b - a ) * c ) / d ) );
}
*/

/*
function pelletCountRect( xfrom, yfrom, w, h ){
    var cnt = 0;
    for( var iy = yfrom; iy < yfrom + h; iy++ ) {
        for( var ix = xfrom; ix < xfrom + w; ix++ ) {
            cnt += ( tMap[ ix + ( iy * mapW ) ] >> 6 );
        }
    }
    return( cnt );
}
*/

function pelletCount(){
    var cnt = 0;
    for( var i = 0; i < mapSize; i++ ) {
        cnt += ( tMap[ i ] >> 6 );
    }
    return( cnt );
}

function resetMap(){
    for( var iy = 0; iy < mapH; iy++ ) {
        for( var ix = 0; ix < mapW; ix++ ) {
            var i = ix + ( iy * mapW );
            var v = tMap[i];
            tMap[i] |= ( v & 32 ) << 1;
        }
    }
}

/*
function randomDir( dir ){
    var v;
    if( dir >= 0 ) {
        v = ( dir + random( 1, 4 ) ) & 3;
    } else {
        v = random( 0, 4 );
    }
    return( v );
}
*/

function randomDir2( dir, mask ){
    var v = random( 0, 4 );
    var c = 4;
    while( ( c > 0 ) && ( v == dir || ( ( mask & ( 1 << v ) ) == 0 ) ) ) {
        v++;
        c--;
    }
    
    if( c == 0 ) {
        v = -1;
    }
    return( v );
}



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

function reset(){
    //highscore( score );
    //score = 0;
    
    dead = false;

    //tMap = file( "aux.map", 0 );
    resetMap();
    
    nChar = ( 2 + level ) << 4;
    for( var iChar = 0; iChar < nChar; iChar += 16 ) {
        // [0] = x
        // [1] = y
        // [2] = dir
        // [3] = dist
        // [4] = v
        // [5] = ndir
        // [6] = xs
        // [7] = ys
        var ptr = tChar + ( iChar << 2 );
        if( iChar == 0 ) {
            ptr[0] = 4 * 5;
            ptr[1] = mapH - 1;
            ptr[4] = vPlayer;
        } else {
            ptr[0] = 5 * ( ( ( iChar - 16 ) >> 4 ) % 6 );
            ptr[1] = 0;
            ptr[4] = vEnemy;
        }
        ptr[2] = -1;
        ptr[3] = 0;
        ptr[5] = -1;
        ptr[6] = ptr[0] << 3;
        ptr[7] = ptr[1] << 3;
    }
}

// Rect overlap test
function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}

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


function updateChar(iChar, dx, dy){
    // [0] = x
    // [1] = y
    // [2] = dir
    // [3] = dist
    // [4] = v
    // [5] = ndir
    // [6] = xs
    // [7] = ys

    var ptr = tChar + ( iChar << 2 );
    var char = enemy;
    
    var x = ptr[0];
    var y = ptr[1];
    var dir = ptr[2];
    var dist = ptr[3];
    var v = ptr[4];
    var ndir = ptr[5];
    
    if( iChar == 0 ) {
        color( playerColor );
        char = player;
        
        if( pressed( "LEFT" ) ) {
            ndir = 2;
        }
        if( pressed( "RIGHT" ) ) {
            ndir = 0;
        }
        if( pressed( "UP" ) ) {
            ndir = 1;
        }
        if( pressed( "DOWN" ) ) {
            ndir = 3;
        }
    } else {
        color( enemyColor );
    }
    
    var b = false;
    if( dir >= 0 ) {
        
        dist += v;
        if( dist >= ( 1 << 8 ) ) {
            
            dist -= ( 1 << 8 );
            x += tDirX[ dir ];
            y += tDirY[ dir ];
            b = true;
        }

    } else {
        b = true;
    }
    
    if( b ) {
        var i = x + ( y * mapW );
        var m = tMap[i];
        var m15 = m & 15;
        
        if( iChar == 0 ) {
            if( m >= 64 ) {
                score++;
                tMap[i] = m - 64;
            }
        } else {
            var opdir = ( dir + 2 ) & 3;
            if( dir < 0 ) {
                ndir = randomDir2( -1, m15 );
                
            } else if( ( m & ( 1 << dir ) ) == 0 ) {
                ndir = randomDir2( opdir, m15 );
                
            } else if( ( m & 32 ) > 0 ) {
                ndir = randomDir2( opdir, m15 );
            }
        }
    }
    
    if( b ) {    
        if( ( ndir >= 0 ) && ( ( m & ( 1 << ndir ) ) > 0 ) ) {
            dir = ndir;
            ndir = -1;
            
        } else if( ( dir >= 0 ) && ( ( m & ( 1 << dir ) ) > 0 ) ) {
            //ndir = -1;
            
        } else {
            dir = -1;
            ndir = -1;
            dist = 0;
        }
    }
    
    var xs = x << 3;
    var ys = y << 3;
    if( dir >= 0 ) {
        xs += ( dist * tDirX[ dir ] ) >> 5;
        ys += ( dist * tDirY[ dir ] ) >> 5;
    }
    sprite( xs - dx - 8, ys - dy - 8, char );

    if( iChar > 0 ) {
        if( test_collide( xs, ys, tChar[6], tChar[7], 14, 14 ) ) {
            dead = true;
        }
    }

    ptr[0] = x;
    ptr[1] = y;
    ptr[2] = dir;
    ptr[3] = dist;
    //ptr[4] = v;
    ptr[5] = ndir;
    ptr[6] = xs;
    ptr[7] = ys;

    iChar += 16;
    
    return(iChar);
}

function update(){
    var iChar, k;
    var x, y, v;
    
    const dymin = -8;
    const dymax = ( ( mapH - maxTY + 3 ) << 3 );
    var dy = tChar[7] - 88;
    if( dy < dymin ) {
        dy = dymin;
    }
    if( dy > dymax ) {
        dy = dymax;
    }
    
    updateTilemap( -8, dy );
    
    for( iChar = 0; iChar < nChar; ) {
        iChar = updateChar( iChar, -12, dy - 4 );
    }

    if( pressed( "C" ) ) {
        exit();
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
    
    //if( pelletCountRect( 0, 0, mapW, mapH ) == 0 ) {
    if( pelletCount() == 0 ) {
        level++;
        reset();
    }
    
    if( dead ) {
        //reset();
        highscore( score );
        /*
        color( 1 );
        for( var i = 0; i < 2; i++ ) {
            cursor( 110 - ( 9 << 2 ) + i, 84 + i );
            print( "GAME OVER" );
            color( 47 );
        }
        */
        
        cursor( 110 - ( 9 << 2 ), 84 );
        print( "GAME OVER" );
        
        exec( "src.js" );
    }
}


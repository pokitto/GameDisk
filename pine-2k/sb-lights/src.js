// Lights On by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 20;
const minX = ( ( minTX + 2 ) << 8 ) + ( 8 << 5 ), maxX = ( ( maxTX - 2 ) << 8 ) - ( 8 << 5 );
const minY = ( ( minTY + 2 ) << 8 ) + ( 8 << 5 ), maxY = ( ( maxTY ) << 8 ) - ( 8 << 5 );
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const heart = builtin("sHeart");
const star = builtin("sStar");
const bgColor = ( 16 * 4 ) + 15; //129;
const starColor = ( 16 * 4 ) + 15;

if( file("lights.res", 0) != 1 ){
    console("Could not find resources!");
    exit();
}

/*
const tLightOff = [ "light0", "light1", "light2", "light3", "light4",
    "light5", "light6", "light7", "light8", "light9", "light10",
    "light11", "light12", "light13", "light14", "light15" ];
 

const tLightOn = [ "light16", "light17", "light18", "light19", "light20",
    "light21", "light22", "light23", "light24", "light25", "light26",
    "light27", "light28", "light29", "light30", "light31" ];

const tSelect = [ "select0", "select1" ];
*/

const tLightImg = [ file( "light0", 0 ), file( "light1", 0 ), file( "light2", 0 ), file( "light3", 0 ), file( "light4", 0 ),
    file( "light5", 0 ), file( "light6", 0 ), file( "light7", 0 ), file( "light8", 0 ), file( "light9", 0 ), file( "light10", 0 ),
    file( "light11", 0 ), file( "light12", 0 ), file( "light13", 0 ), file( "light14", 0 ), file( "light15", 0 ),
    file( "light16", 0 ), file( "light17", 0 ), file( "light18", 0 ), file( "light19", 0 ), file( "light20", 0 ),
    file( "light21", 0 ), file( "light22", 0 ), file( "light23", 0 ), file( "light24", 0 ), file( "light25", 0 ), file( "light26", 0 ),
    file( "light27", 0 ), file( "light28", 0 ), file( "light29", 0 ), file( "light30", 0 ), file( "light31", 0 )
];

const tSelectImg = [ file( "select0", 0 ), file( "select1", 0 ) ];

const energyImg = file( "energy", 0 );
const batteryImg = file( "battery", 0 );

var score = 0;
var level = 1;
var startTime;
var remTime;
const maxTime = 120;

const mapS = 256;
var tMap = Array( mapS );
var tElem = Array( mapS );
var mapW, mapH, mapWW;
const cellOn = 16;
const cellValid = 32;
const cellMark = 64;
const cellSource = 128;
const maskCellOff = 255 - cellOn;

const tDirX = [ 1, 0, -1, 0 ];
const tDirY = [ 0, -1 , 0, 1 ];
var tDir = Array(4);

var bx, by;

reset();



function reset(){
    var i, dir;
    
    tileshift( 0, 0 );

    mapW = 7 + level;
    mapH = 7 + level;
    if( mapW > 10 ) {
        mapW = 10;
    }
    if( mapH > 9 ) {
        mapH = 9;
    }
    
    mapWW = mapW + 2;
    for( dir = 0; dir < 4; dir++ ) {
        tDir[dir] = tDirX[dir] + mapWW * tDirY[dir];
    }

    var xstart = 1 + ( mapW >> 1 );
    var ystart = 1 + ( mapH >> 1 );
    
    bx = xstart;
    by = ystart;
    
    build( xstart, ystart );

    startTime = time();
}

function build( xstart, ystart ){
    var i0, i1, v0, v1, dir, opdir;
    var x, y;
    var iElem, nElem;
    
    for( i0 = 0; i0 < mapS; i0++ ) {
        tMap[i0] = 0;
    }
    for( y = 1; y <= mapH; y++ ) {
        for( x = 1; x <= mapW; x++ ) {
            tMap[ x + y * mapWW ] = cellValid;
        }
    }
    i0 = xstart + ystart * mapWW;
    tMap[i0] |= ( cellMark | cellSource );
    tElem[0] = i0;
    nElem = 1;
    
    while( nElem > 0 ) {
        iElem = random( 0, nElem );
        i0 = tElem[iElem];
        for( dir = 0; dir < 4; dir++ ) {
            opdir = ( dir + 2 ) & 3;
            i1 = i0 + tDir[dir];
            v1 = tMap[i1];
            if( ( v1 & ( cellValid | cellMark ) ) == cellValid ) {
                tElem[nElem] = i1;
                nElem++;
                tMap[i1] = v1 | ( cellMark | ( 1 << opdir ) );
                tMap[i0] |= ( 1 << dir );
            }
        }
        nElem--;
        while( iElem < nElem ) {
            tElem[iElem] = tElem[iElem + 1];
            iElem++;
        }
    }

    for( y = 1; y <= mapH; y++ ) {
        for( x = 1; x <= mapW; x++ ) {
            i0 = x + y * mapWW;
            v0 = tMap[ i0 ];
            if( ( v0 & cellValid ) > 0 ) {
                v1 = ( v0 & 15 ) << random( 1, 4 );
                tMap[ i0 ] = ( v0 & 240 ) | ( ( v1 | ( v1 >> 4 ) ) & 15 );
            }
        }
    }

}

function energy(){
    var i0, i1, v0, v1, dir, opdir;
    var x, y;
    var iElem, nElem = 0;
    var nCell = 0;
    var nCellOn = 0;
    
    for( i0 = 0; i0 < mapS; i0++ ) {
        tMap[i0] &= maskCellOff;
    }
    
    for( y = 1; y <= mapH; y++ ) {
        for( x = 1; x <= mapW; x++ ) {
            i0 = x + y * mapWW;
            v0 = tMap[ i0 ];
            if( ( v0 & cellValid ) > 0 ) {
                nCell++;
                if( ( v0 & cellSource ) > 0 ) {
                    tMap[i0] = v0 | ( cellOn );
                    tElem[ nElem ] = i0;
                    nElem++;
                    nCellOn++;
                }
            }
        }
    }
    
    while( nElem > 0 ) {
        iElem = nElem - 1;
        i0 = tElem[iElem];
        v0 = tMap[i0];
        for( dir = 0; dir < 4; dir++ ) {
            if( ( v0 & ( 1 << dir ) ) > 0 ) {
                opdir = ( dir + 2 ) & 3;
                i1 = i0 + tDir[dir];
                v1 = tMap[i1];
                if( ( v1 & ( cellValid | cellOn | ( 1 << opdir ) ) ) == ( cellValid | ( 1 << opdir ) ) ) {
                    tElem[nElem] = i1;
                    nElem++;
                    tMap[i1] |= ( cellOn );
                    nCellOn++;
                }
            }
        }
        nElem--;
        while( iElem < nElem ) {
            tElem[iElem] = tElem[iElem + 1];
            iElem++;
        }
    }
    return( nCell == nCellOn );
}

function drawBoard(){
    var tx, ty;
    var x, y, v;
    var x0, y0;
    var s;

    /* TEST cells on/off
    for( i0 = 0; i0 < mapS; i0++ ) {
        tMap[i0] &= maskCellOff;
        //tMap[i0] |= cellOn;
    }
    */
    
    x0 = 1;
    y0 = 1;
    //fill( 0 );
    color( 0 );
    for( ty = minTY; ty < maxTY; ty += 2 ) {
        y = y0 + ( ( ty - minTY ) >> 1 );
        for( tx = minTX; tx < maxTX; tx += 2 ) {
            x = x0 + ( ( tx - minTX ) >> 1 );
            if( x >= 1 && x <= mapW && y >= 1 && y <= mapH ) {
                v = tMap[ x + y * mapWW ];
                
                if( ( v & cellValid ) > 0 ) {
                    //tile( tx, ty, tLightImg[ v & 31 ] );
                    var xs = tx << 3;
                    var ys = ty << 3;
                    sprite( xs, ys, tLightImg[ v & 31 ] );
                    if( ( v & cellSource ) > 0 ) {
                        sprite( xs + 4, ys + 4, energyImg );
                    }
                }
            }
        }
    }
}

function update(){
    
    var bxn = bx;
    var byn = by;
    
    if( pressed( "C" ) ) {
        exit();
    }
    
    if( justPressed( "LEFT" ) ) {
        bxn--;
    }
    if( justPressed( "RIGHT" ) ) {
        bxn++;
    }
    if( justPressed( "UP" ) ) {
        byn--;
    }
    if( justPressed( "DOWN" ) ) {
        byn++;
    }
    var i0 = bxn + byn * mapWW;
    var v0 = tMap[ i0 ];
    if( ( v0 & cellValid ) > 0 ) {
        bx = bxn;
        by = byn;
        if( justPressed( "A" ) ) {
            var v1 = ( v0 & 15 );
            tMap[ i0 ] = ( v0 & 240 ) | ( ( ( v1 << 3 ) | ( v1 >> 1 ) ) & 15 );
        }
    }

    remTime = maxTime - ( ( time() - startTime ) / 1000 );

    if( remTime < 0 ) {
        highscore( score );
        score = 0;
        level = 1;
        
        reset();
    }

    if( energy() ){
        score += remTime;
        level++;
        
        reset();
    }
    
    drawBoard();

    sprite( ( bx - 1 ) << 4, ( by - 1 ) << 4, tSelectImg[ remTime & 1 ] );

    // hud
    color( 47 );
    sprite( 50, 165, lvl );
    cursor( 70, 165 );
    printNumber( level );
    //sprite( 120, 165, pts );
    cursor( 140, 165 );
    printNumber( remTime );
}


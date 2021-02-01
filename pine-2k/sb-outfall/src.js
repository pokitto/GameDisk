// Outfall Trainer by SkyBerron <skyberron@gmail.com>
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 27;
const minTY = 0, maxTY = 21;
const minX = ( ( minTX + 2 ) << 8 ) + ( 8 << 5 ), maxX = ( ( maxTX - 2 ) << 8 ) - ( 8 << 5 );
const minY = ( ( minTY + 2 ) << 8 ) + ( 8 << 5 ), maxY = ( ( maxTY ) << 8 ) - ( 8 << 5 );
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const rock = builtin("rock");
const wall = builtin("floor1");
const btn = builtin("sBtn");
const bgColor = ( 17 << 3 ) + 2;
const wallColor = ( 17 << 3 ) + 7;

const tClr = [ 1, 6, ( 6 << 3 ) + 5, ( 31 << 3 ) + 7, ( 28 << 3 ) + 7, ( 12 << 3 ) + 7, ( 21 << 3 ) + 7, ( 18 << 3 ) + 7 ];
const shift = 1;
const step = ( 1 << shift );
const boardW = 7;
const boardWW = boardW + 2;
const boardH = 10;
const boardYY = 3;
const boardHH = boardH + boardYY;
const boardS = boardWW * ( boardHH + 1 );

const tDirX = [ 1, 0, -1, 0 ];
const tDirY = [ 0, -1 , 0, 1 ];
const tDir = [ 1, -boardWW, -1, boardWW ];

const tx0 = ( ( maxTX + minTX - ( boardW << shift ) ) >> 1 );
const ty0 = ( ( maxTY + minTY - ( boardH << shift ) ) >> 1 ) + 1;
const tx1 = tx0 + ( boardW << shift );
const ty1 = ty0 + ( boardH << shift );

const nBlock = 5;
const blockInvalid = 0;
const blockEmpty = 1;
const blockRock = 2;
const blockMin = 3;
const blockMax = blockMin + nBlock;

const pxini = 4;
const pyini = boardYY;
const prini = 1;

const cElem = 64;
var tElem = Array( cElem );

var tBoard = Array( boardS );

var dead;
var score;

var px, py, pr;
var tBlock = Array( 4 );

var level;

tileshift( 0, 0 );

reset();



function reset(){
    var i, v;
    var x, y;

    highscore( score );
    score = 0;
    
    level = 0;
    
    px = pxini;
    py = pyini;
    pr = prini;
    dead = false;

    for( i = 0; i < boardS; i++ ) {
        tBoard[i] = blockInvalid;
    }
    
    for( y = 0; y < boardHH; y++ ) {
        for( x = 1; x <= boardW; x++ ) {
            tBoard[ x + ( y * boardWW ) ] = blockEmpty;
        }
    }

    for( i = 0; i < 4; i++ ) {
        tBlock[i] = blockMin + i;
    }
}



function fillTile( x, y, w, h, v, c ){
    color( c );
    for( var iy = 0; iy < h; iy++ ) {
        for( var ix = 0; ix < w; ix++ ) {
            tile( x + ( ix << shift ), y + ( iy << shift ), v );
        }
    }
}



function drawBoard(){
    var v;
    var x, y, i;
    
    fill( bgColor );
    
    fillTile( tx0 - step, ty0, boardW + 2, boardH + 1, wall, wallColor );
    fillTile( tx0, ty0, boardW, boardH, wall, 6 );

    for( y = boardYY; y < boardHH; y++ ) {
        for( x = 1; x <= boardW; x++ ) {
            v = tBoard[ x + ( y * boardWW ) ];
            if( v > blockEmpty ) {
                color( tClr[ v ] );
                tile( tx0 + ( ( x - 1 ) << shift ), ty0 + ( ( y - boardYY ) << shift ), rock );
            }
        }
    }
    
    /* Show next
    x = tx1 + ( step << 1 );
    y = ty0;
    for( i = 2; i < 4; i++ ) {
        y += step;
        v = tBlock[i];
        color( tClr[ v ] );
        tile( x, y, rock );
    }
    */
}

function defrag(){
    var x, y, v;
    var i1, i2;
    var b = true;
    for( x = 1; x <= boardW; x++ ) {
        for( y = ( boardHH - 1 ); y > 0; y-- ) {
        //for( y = 1; y < boardHH; y++ ) {
            i1 = x + ( y * boardWW );
            i2 = i1 - boardWW;
            v = tBoard[ i2 ];
            if( ( tBoard[ i1 ] == blockEmpty ) && ( v > blockEmpty ) ) {
                tBoard[ i1 ] = v;
                tBoard[ i2 ] = blockEmpty;
                b = false;
            }
        }
    }
    return( b );
}

function auxDeleteGroups( v ){
    var nElem = 1;
    var nGroup = 0;
    var iElem;
    var i0, i1, v1, dir;
    for( iElem = 0; iElem < nElem; iElem++ ) {
        i0 = tElem[ iElem ];
        for( dir = 0; dir < 4; dir++ ) {
            i1 = i0 + tDir[dir];
            v1 = tBoard[ i1 ];
            if( v1 == v ) {
                tBoard[ i1 ] = ( v1 | 64 );
                tElem[nElem] = i1;
                nElem++;
            }
        }
    }
    if( nElem >= 4 ) {
        score += nElem;
        nGroup = 1;
        for( iElem = 0; iElem < nElem; iElem++ ) {
            i0 = tElem[iElem];
            tBoard[ i0 ] = blockEmpty;
            for( dir = 0; dir < 4; dir++ ) {
                var i1 = i0 + tDir[dir];
                if( tBoard[i1] == blockRock ) {
                    tBoard[i1] = blockEmpty;
                }
            }
        }
    }
    return( nGroup );
}

function deleteGroups(){
    var x, y, i, v;
    var iElem, nElem;
    var nGroup = 0;
    for( y = boardYY; y < boardHH; y++ ) {
        for( x = 1; x <= boardW; x++ ) {
            i = x + ( y * boardWW );
            v = tBoard[ i ];
            if( ( v > blockRock ) && ( v < 64 ) ) {
                tBoard[ i ] = ( v | 64 );
                tElem[0] = i;
                nGroup += auxDeleteGroups( v );
            }
        }
    }

    for( i = 0; i < boardS; i++ ) {
        tBoard[i] &= 63;
    }
    return( nGroup );
}


function update(){
    
    var v, c;
    var x, y, i;
    var i1, i2;

    // Defrag one step
    var b = defrag();
    
    // Delete groups of >= 4 connected blocks
    if( b ) {
        b = ( deleteGroups() <= 0 );
    }
    
    drawBoard();

    if( pressed( "C" ) ) {
        exit();
    }

    var pxn = px;
    var pyn = py;
    var prn = pr;

    if( justPressed( "LEFT" ) ) {
        pxn--;
    }
    if( justPressed( "RIGHT" ) ) {
        pxn++;
    }
    if( justPressed( "B" ) ) {
        prn = ( prn + 1 ) & 3;
    }
    if( justPressed( "A" ) ) {
        prn = ( prn + 3 ) & 3;
    }

    var pxn1 = pxn + tDirX[prn];
    var pyn1 = pyn + tDirY[prn];
    
    // Push left/right
    if( pxn1 <= 0 ) {
        pxn++;
        pxn1++;
    }
    if( pxn1 > boardW ) {
        pxn--;
        pxn1--;
    }
    
    if( b ) {
        i = pxini + ( boardYY * boardWW );
        if( tBoard[ i ] > blockEmpty ) {
            dead = true;
        }
        
        i1 = pxn + ( boardWW * ( pyn ) );
        i2 = pxn1 + ( boardWW * ( pyn1 ) );
        if( ( tBoard[ i1 ] == blockEmpty ) && ( tBoard[ i2 ] == blockEmpty ) ) {
            px = pxn;
            py = pyn;
            pr = prn;

            if( justPressed( "DOWN" ) ) {
                for( i = ( level >> 4 ); i > 0; i-- ) {
                    tBoard[ 1 + random( 0, boardW ) ] = blockRock;
                }
                tBoard[ i1 ] = tBlock[0];
                tBoard[ i2 ] = tBlock[1];
                for( i = 2; i < 4; i++ ) {
                    tBlock[i - 2] = tBlock[i];
                    tBlock[i] = random( blockMin, blockMax );
                }
                px = pxini;
                pr = prini;
                level++;
                b = false;
            }
        }
    }
    
    if( b ) {
        for( i = 1; i >= 0; i-- ) {
            v = tBlock[i];
            x = ( tx0 + ( ( px - 1 + ( i * tDirX[pr] ) ) << shift ) ) << 3;
            y = ( ty0 + ( ( py - boardYY + ( i * tDirY[pr] ) ) << shift ) ) << 3;
            color( tClr[ v ] );
            sprite( x, y, rock );
        }
        //color( 1 );
        //sprite( x + 4, y + 4, btn );
    }
    

    // hud
    color( 47 );
    //sprite( 186, 60, lvl );
    //cursor( 186, 80 );
    //printNumber( level >> 4 );
    sprite( 186, 120, pts );
    cursor( 186, 140 );
    printNumber( score );
    
    if( dead ) {
        reset();
    }
}


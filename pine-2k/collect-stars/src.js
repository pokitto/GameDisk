// Collect Stars by SkyBerron
// This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
// To view a copy of the license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

const minTX = 0, maxTX = 28;
const minTY = 0, maxTY = 20;
const minX = ( ( minTX + 2 ) << 8 ) + ( 8 << 5 ), maxX = ( ( maxTX - 2 ) << 8 ) - ( 8 << 5 );
const minY = ( ( minTY + 2 ) << 8 ) + ( 8 << 5 ), maxY = ( ( maxTY - 2 ) << 8 ) - ( 8 << 5 );
const boardWidth = maxTX - minTX;
const boardHeight = maxTY - minTY;
const pts = builtin("sPts");
const player = builtin("char1");
const enemy1 = builtin("char5");
const enemy2 = builtin("char15");
const wall = builtin("floor1");
const star = builtin("sStar");
const bgColor = 129;
const playerColor = 15;
const enemy1Color = 15;
const enemy2Color = 15;
const starColor = ( 16 * 4 ) + 15;

const cCol = 10;
const cRow = 6;
var tCol = new Array( cCol );
var tColPos = new Array( cCol );
var tColVel = new Array( cCol );
var tRow = new Array( cRow );
var tRowPos = new Array( cRow );
var tRowVel = new Array( cRow );
var nCol = 0;
var nRow = 0;

var dead;
var score = 0;
var bx, by, bvx, bvy;
var sx, sy;


tileshift( 0, 0 );
reset();

function reset(){
    highscore( score );
    score = 0;
    
    fill( bgColor );
    color( bgColor );
    var tx, ty;
    for( ty = 0; ty < boardHeight; ty += 2 ) {
        tx = 0;
        tile( tx + minTX, ty + minTY, wall );
        tx = boardWidth - 2;
        tile( tx + minTX, ty + minTY, wall );
    }
    for( tx = 0; tx < boardWidth; tx += 2 ) {
        ty = 0;
        tile( tx + minTX, ty + minTY, wall );
        ty = boardHeight - 2;
        tile( tx + minTX, ty + minTY, wall );
    }

    bx = ( minX + maxX ) >> 1;
    by = ( minY + maxY ) >> 1;
    
    bvx = 2 << 5;
    bvy = bvx;
    dead = false;

    var iCol, iRow;
    var iCol2, iRow2, aux;
    for( iCol = 0; iCol < cCol; iCol++ ) {
        tCol[iCol] = minX + ( ( iCol * ( maxX - minX ) ) / ( cCol - 1 ) );
        tColPos[iCol] = -( 16 << 5 );
        tColVel[iCol] = ( 1 << 5 );
    }
    for( iRow = 0; iRow < cRow; iRow++ ) {
        tRow[iRow] = minY + ( ( iRow * ( maxY - minY ) ) / ( cRow - 1 ) );
        tRowPos[iRow] = -( 16 << 5 );
        tRowVel[iRow] = ( 1 << 5 );
    }

    for( iCol = 0; iCol < cCol; iCol++ ) {
        iCol2 = random( 0, cCol );
        aux = tCol[iCol];
        tCol[iCol] = tCol[iCol2];
        tCol[iCol2] = aux;
    }
    for( iRow = 0; iRow < cRow; iRow++ ) {
        iRow2 = random( 0, cRow );
        aux = tRow[iRow];
        tRow[iRow] = tRow[iRow2];
        tRow[iRow2] = aux;
    }

    nCol = 0;
    nRow = 0;
    random_star();
}

function hud(){
    color( 47 );
    sprite( 100, 165, pts );
    cursor( 120, 165 );
    printNumber( score );
}

function random_star(){
    sx = random( minX, maxX );
    sy = random( minY, maxY );
}

function add_enemy(){
    if( nCol >= cCol ) {
        if( nRow < cRow ) {
            nRow++;
        }
    } else if( nRow >= cRow ) {
        if( nCol < cCol ) {
            nCol++;
        }
    } else if( nRow <= nCol ) {
        if( nRow < cRow ) {
            nRow++;
        }
    } else {
        if( nCol < cCol ) {
            nCol++;
        }
    }
}

function test_collide( x1, y1, x2, y2, ex, ey ){
    var dx = x2 - x1, dy = y2 - y1;
    return( ( dx > -ex ) && ( dx < ex ) && ( dy > -ey ) && ( dy < ey ) );
}


function update(){
    var x, y;
    var dx, dy;
    var vx, vy;
    var iCol, iRow;

    color( starColor );
    sprite( ( ( sx ) >> 5 ) - 4, ( ( sy ) >> 5 ) - 4, star );

    color( enemy1Color );
    for( iCol = 0; iCol < nCol; iCol++ ) {
        x = tCol[iCol];
        y = tColPos[iCol];
        vy = tColVel[iCol];
        y += vy;
        
        if( y < minY && vy < 0 ) {
            y = ( 2 * minY ) - y;
            vy = -vy;
        }
        if( y > maxY && vy > 0 ) {
            y = ( 2 * maxY ) - y;
            vy = -vy;
        }
        tColPos[iCol] = y;
        tColVel[iCol] = vy;
        sprite( ( ( x ) >> 5 ) - 8, ( ( y ) >> 5 ) - 8, enemy1 );
        if( test_collide( bx, by, x, y, ( 12 << 5 ), ( 14 << 5 ) ) ) {
            dead = true;
        }
    }
    
    color( enemy2Color );
    for( iRow = 0; iRow < nRow; iRow++ ) {
        y = tRow[iRow];
        x = tRowPos[iRow];
        vx = tRowVel[iRow];
        x += vx;
        
        if( x < minX && vx < 0 ) {
            x = ( 2 * minX ) - x;
            vx = -vx;
        }
        if( x > maxX && vx > 0 ) {
            x = ( 2 * maxX ) - x;
            vx = -vx;
        }
        tRowPos[iRow] = x;
        tRowVel[iRow] = vx;
        sprite( ( ( x ) >> 5 ) - 8, ( ( y ) >> 5 ) - 8, enemy2 );
        if( test_collide( bx, by, x, y, ( 12 << 5 ), ( 14 << 5 ) ) ) {
            dead = true;
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
    color( playerColor );
    sprite( ( ( bx ) >> 5 ) - 8, ( ( by ) >> 5 ) - 8, player );

    
    if( test_collide( bx, by, sx, sy, ( 12 << 5 ), ( 12 << 5 ) ) ) {
        score++;
        random_star();
        add_enemy();
    }
    
    hud();
    
    if( dead ) {
        reset();
    }
}


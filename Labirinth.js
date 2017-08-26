var labyrinth = ( function () {

    var labyrinth = {};

    var N = 1, S = 2, E = 4, W = 8;
    //# directions translated into bitnums

    Object.defineProperty( labyrinth, 'init', {
        value: function( sizeX, sizeY, cellWidth, cellHeight, svg, lineWidth, color ) {
            //init canvas
            this._svg = {};
            //get container
            this._svg = svg;
            this._svg.style.stroke = color;
            this._svg.style.strokeWidth = lineWidth + 'px';
            this._svg.style.width = sizeX * cellWidth + 2 + 'px';
            this._svg.style.height = sizeY * cellHeight + 2 + 'px';

            //init size of the labyrinth
            this._size = {};
            this._size.x = sizeX;
            this._size.y = sizeY;

            //init cellSize;
            this._cellSize = {};
            this._cellSize.x = cellWidth;
            this._cellSize.y = cellHeight;

            //# dictionary with directions translated to digging moves
            this._goDir = [];
            this._goDir[N] = {x:  0, y: -1};
            this._goDir[S] = {x:  0, y:  1};
            this._goDir[E] = {x:  1, y:  0};
            this._goDir[W] = {x: -1, y:  0};

            //init map
            this._map = [];
            this._cells = [];
            this.initMap();

            //init stack
            this._stack = [];

            //init path
            this._path = [];

            //init state
            this._state = 'init';

            return this;
        }
    });

    Object.defineProperty( labyrinth, 'initMap', {
        value: function() {
            //clear the svg
            this._svg.innerHTML = '';

            //init the cells array
            for (var i = 0; i < this.labSize.y; i += 1 ) {
                this._cells[i] = [];
                for (var j = 0; j < this.labSize.x; j += 1 ) {
                    this._cells[i][j] = {
                        N: this._svg.appendChild( document.createElementNS('http://www.w3.org/2000/svg', 'line')),
                        E: this._svg.appendChild( document.createElementNS('http://www.w3.org/2000/svg', 'line')),
                        S: this._svg.appendChild( document.createElementNS('http://www.w3.org/2000/svg', 'line')),
                        W: this._svg.appendChild( document.createElementNS('http://www.w3.org/2000/svg', 'line'))
                    };
                    this._cells[i][j].N.id = 'row=' + i + ',col=' + j + ',N';
                    this._cells[i][j].E.id = 'row=' + i + ',col=' + j + ',E';
                    this._cells[i][j].S.id = 'row=' + i + ',col=' + j + ',S';
                    this._cells[i][j].W.id = 'row=' + i + ',col=' + j + ',W';
                }
            }

            //fill the map with zeroes
            for (var i = 0; i < this.labSize.y * 2 + 1; i += 1 ) {
                this._map[i] = [];
                for (var j = 0; j < this.labSize.x * 2 + 1; j += 1 ) {
                    this._map[i][j] = 0;
                }
            }

            //# create the grid
            for ( var x = 0; x < this.labSize.x * 2 + 1; x += 1 ) {
                for (var y = 0; y < this.labSize.y + 1; y += 1) {
                    this._map[y * 2][x] = 1;
                }
            }
            for ( var y = 0; y < this.labSize.y * 2 + 1; y += 1 ) {
                for ( var x = 0; x < this.labSize.x + 1; x += 1 ) {
                    this._map[y][x * 2] = 1;
                }
            }
        }
    });

    Object.defineProperty( labyrinth, 'labSize', {
        enumerable: true,
        get: function() {
            return this._size;
        }
    });

    Object.defineProperty( labyrinth, 'state', {
        enumerable: true,
        get: function () {
            return this._state;
        },
        set: function( value ) {
            this._state = value;
        }
    })

    Object.defineProperty( labyrinth, 'map', {
        enumerable: true,
        get : function () {
            return this._map.slice();
        }
    });

    Object.defineProperty( labyrinth, 'drawLabyrinth', {
        enumerable: true,
        value: function( removeWalls ) {

            //draw all cells
            for (var x = 0; x < this.labSize.x; x += 1 ) {
                for (var y = 0; y < this.labSize.y; y += 1) {
                    this.drawCell( x, y, removeWalls );
                }
            }
        }
    });

    Object.defineProperty( labyrinth, 'generateMap', {
        enumerable: true,
        value: function( startX, startY ) {
            //clear the map
            this.initMap();

            this.path.push( {x: startX, y:startY });
            //start digging
            this.dig( startX, startY );
            //clear the visited markers
            for (var x = 0; x < this.labSize.x; x += 1 ) {
                for (var y = 0; y < this.labSize.y; y += 1) {
                    this._map[y * 2 + 1][x * 2 + 1] = 0;
                }
            }
        }
    });

    Object.defineProperty( labyrinth, 'drawCell', {
        value: function ( x ,y, removeWalls ) {

            //if removeWalls is false a full box will be drawn
            var cx = x * 2 + 1;
            var cy = y * 2 + 1;

            //North
            if ( ( this._map[ cy - 1 ][ cx ] == 1 ) || !removeWalls ) {
                this._cells[ y ][ x ].N.setAttribute( 'x1', '' + ( x * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].N.setAttribute( 'y1', '' + ( y * this._cellSize.y + 1 ) );
                this._cells[ y ][ x ].N.setAttribute( 'x2', '' + ( ( x + 1 ) * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].N.setAttribute( 'y2', '' + ( y * this._cellSize.y + 1 ) );
            }
            //East
            if ( ( this._map[ cy ][ cx  + 1 ] == 1 ) || !removeWalls ) {
                this._cells[ y ][ x ].E.setAttribute( 'x1', '' + ( ( x + 1 ) * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].E.setAttribute( 'y1', '' + ( y * this._cellSize.y + 1 ) );
                this._cells[ y ][ x ].E.setAttribute( 'x2', '' + ( ( x + 1 ) * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].E.setAttribute( 'y2', '' + ( ( y + 1 ) * this._cellSize.y + 1 ) );
            }
            //South
            if ( ( this._map[ cy + 1 ][ cx ] == 1 ) || !removeWalls ) {
                this._cells[ y ][ x ].S.setAttribute( 'x1', '' + ( ( x + 1 ) * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].S.setAttribute( 'y1', '' + ( ( y + 1 ) * this._cellSize.y + 1 ) );
                this._cells[ y ][ x ].S.setAttribute( 'x2', '' + ( x * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].S.setAttribute( 'y2', '' + ( ( y + 1 ) * this._cellSize.y + 1 ) );
            }
            //West
            if ( ( this._map[ cy ][ cx - 1 ] == 1 ) || !removeWalls ) {
                this._cells[ y ][ x ].W.setAttribute( 'x1', '' + ( x * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].W.setAttribute( 'y1', '' + ( ( y + 1 ) * this._cellSize.y + 1 ) );
                this._cells[ y ][ x ].W.setAttribute( 'x2', '' + ( x * this._cellSize.x + 1 ) );
                this._cells[ y ][ x ].W.setAttribute( 'y2', '' + ( y * this._cellSize.y + 1 ) );
            }
        }
    });

    Object.defineProperty( labyrinth, 'dig', {
        value: function ( x, y ) {
            function allVisited (lab){
                var cnt = lab.labSize.x * lab.labSize.y * 8;
                for ( var y = 0; y < lab.labSize.y; y += 1 ) {
                    for ( var x = 0; x < lab.labSize.x; x += 1 ) {
                        cnt -= lab._map[ y * 2 + 1 ][ x * 2 + 1 ];
                    }
                }
                return cnt == 0;
            }

            //Implementation of the Recursive backtrack algorythm found at
            //https://en.wikipedia.org/wiki/Maze_generation_algorithm

            //Make the initial cell the current cell and mark it as visited
            this._map[ y * 2 + 1 ][ x * 2 + 1] = 8;

            //If the current cell has any neighbours which have not been visited
            var neighbours = [];
            var dirs = [ N, E, S, W ];
            for (var d = 0; d < dirs.length; d += 1 ) {
                var newX = x + this._goDir[dirs[d]].x;
                var newY = y + this._goDir[dirs[d]].y;

                if ( ( 0 <= newX ) && ( newX < this.labSize.x ) &&
                    ( 0 <= newY ) && ( newY < this.labSize.y ) &&
                    ( this._map[ newY * 2 + 1 ][ newX * 2 + 1 ] == 0 )) {
                    neighbours.push( { x: newX , y: newY, d: this._goDir[dirs[d]] } )
                }
            }

            //While there are unvisited cells
            if (!allVisited( this )) {
                var next = {};
                if (neighbours.length) {
                    //Choose randomly one of the unvisited neighbours
                    next = neighbours[ Math.floor( Math.random() * neighbours.length ) ];
                    //Remove the wall between the current cell and the chosen cell
                    this._map[ y * 2 + 1 + next.d.y ][ x * 2 + 1 + next.d.x ] = 0;
                    //Push the current cell to the stack
                    this._stack.push( {x: x, y: y});
                    //record the path
                    this._path.push( { x: next.x, y: next.y } );
                    //Make the chosen cell the current cell
                    this.dig( next.x, next.y );
                } else {
                    //Else if stack is not empty
                    if (this._stack.length) {
                        //Pop a cell from the stack
                        next = this._stack.pop();
                        //record the path
                        this._path.push( next );
                        //Make it the current cell
                        this.dig( next.x, next.y );
                    }
                }
            }

            this._map[ y * 2 + 1 ][ x * 2 + 1] = 0;
        }
    });

    Object.defineProperty( labyrinth, 'path', {
        enumerable: true,
        get: function() {
            return this._path.slice().reverse();
        }
    });

    Object.defineProperty( labyrinth, 'getCoordinates', {
        enumerable: true,
        value: function ( x, y ) {
            var posX = Math.floor( ( x - 1 ) / this._cellSize.x );
            if (posX == this.labSize.x) {
                posX -= 1;
            }
            var posY = Math.floor( ( y - 1 ) / this._cellSize.y );
            if (posY == this.labSize.y) {
                posY -= 1;
            }
            return { x: posX,
                y: posY };
        }
    });

    Object.defineProperty( labyrinth, 'makeExitAt', {
        enumerable:true,
        value: function ( x, y ) {
            var cx = x * 2 + 1;
            var cy = y * 2 + 1;

            if ( x == 0 ) {
                this._map[cy][cx - 1] = 0;
                this._svg.removeChild( this._cells[y][x].W );
                return true;
            }
            if ( y == 0 ) {
                this._map[cy - 1][cx] = 0;
                this._svg.removeChild( this._cells[y][x].N );
                return true;
            }
            if ( x == this.labSize.x - 1 ) {
                this._map[cy][cx + 1] = 0;
                this._svg.removeChild( this._cells[y][x].E );
                return true;
            }
            if ( y == this.labSize.y - 1 ) {
                this._map[cy + 1][cx] = 0;
                this._svg.removeChild( this._cells[y][x].S );
                return true;
            }

            return false;
        }
    });

    return labyrinth;
}());

var solver = function(){
    var solver = {};

    Object.defineProperty( solver, 'init', {
        enumerable: true,
        value: function ( lab, startX, startY ) {

            //init map
            this._map = [];
            this._map = lab.map;

            this._lab = lab;

            //possible move directions
            this._dirs = [];
            this._dirs = [ { x:  0, y: -1 },
                { x:  1, y:  0 },
                { x:  0, y:  1 },
                { x: -1, y:  0 } ];

            //left-hand wall
            this._walls = [ { x: -1, y:  0 },
                { x:  0, y: -1 },
                { x:  1, y:  0 },
                { x:  0, y:  1 } ];

            //find initial direction
            for (var i = 0; i < 4; i += 1 ) {
                this._currentDir = i;
                if ( this._map[ startY * 2 + 1 + this._walls[ i ].y ][ startX * 2 + 1 + this._walls[ i ].x ] == 1 ) {
                    break;
                }
            }

            //init current position
            this._position = {};
            this._position = { x: startX, y: startY, dir : this._currentDir, type: 'start' };

            //init path
            this._path = [];
            this._path.push( { x: startX, y: startY, dir : this._currentDir, type: 'start' } );

            //init animationPath
            this._animationPath = [];

            while( this.move() ) {}
            this.calcPath();

            this._animFrame = 1;
            this._animPoints = '';

            return this;
        }
    });

    Object.defineProperty( solver, 'move', {
        value: function() {
            var cx = this._position.x * 2 + 1;
            var cy = this._position.y * 2 + 1;

            function copy( orig ) {
                var copy = {};
                copy.x = orig.x;
                copy.y = orig.y;
                copy.dir = orig.dir;
                copy.type = orig.type;
                return copy;
            }

            //if there is a wall to the left
            if ( this._map[ cy + this._walls[ this._currentDir ].y ][ cx + this._walls[ this._currentDir ].x ] == 1 ) {
                //if possible move forward
                if ( this._map[ cy + this._dirs[ this._currentDir ].y ][ cx + this._dirs[ this._currentDir ].x ] == 0 ) {
                    this._position = { x: this._position.x + this._dirs[ this._currentDir].x,
                        y: this._position.y + this._dirs[ this._currentDir].y,
                        dir: this._currentDir,
                        type: 'move'};
                    //record the path
                    this._path.push( copy( this._position ) );
                    //if not turn right
                } else {
                    this._currentDir += 1;
                    if ( this._currentDir > 3 ) {
                        this._currentDir = 0;
                    }
                    this._position.dir = this._currentDir;
                    this._position.type = 'turnRight';

                    //record the path
                    this._path.push( copy( this._position ) );
                }
                //if there is no wall to the left turn left and move forward
            } else {
                this._currentDir -= 1;
                if ( this._currentDir < 0 ) {
                    this._currentDir = 3;
                }
                this._position.dir = this._currentDir;
                this._position.type = 'turnLeft';
                //record the path
                this._path.push( copy( this._position ) );

                this._position = { x: this._position.x + this._dirs[ this._currentDir].x,
                    y: this._position.y + this._dirs[ this._currentDir].y,
                    dir: this._currentDir,
                    type: 'move' };

                //record the path
                this._path.push( copy( this._position ) );
            }

            //check if position is out of the labyrinth
            if ( this._position.x < 0 || this._position.x >= this._lab.labSize.x ||
                this._position.y < 0 || this._position.y >= this._lab.labSize.y ) {
                return false;
            } else {
                return true;
            }
        }
    });

    Object.defineProperty( solver, 'calcPath', {
        value: function () {
            //intit params
            var svg = this._lab._svg;
            var path = this._path.slice().reverse();
            var strPath = '';
            var size = this._lab._cellSize;
            var solverSize = size.x;
            if (size.y < size.x) {
                solverSize = size.y;
            }
            solverSize = Math.floor( solverSize / 4 );

            //calculate ellipse
            var rx = size.x / 4, ry = size.y / 4;
            var h = Math.pow( rx - ry, 2 ) / Math.pow( rx + ry, 2 );
            var length = Math.round( Math.PI * ( rx + ry ) * ( 1 + 3 * h / ( 10 + Math.sqrt( 4 - 3 * h ) ) ) );
            var da = 2 * Math.PI / length;
            var ellipse = [];
            for ( var a = da / 2; a < 2 * Math.PI; a += da ) {
                var deg = ( 360 - ( a * 180 / Math.PI ) + 90 ) % 360;
                ellipse.push( { x: Math.round( rx * Math.cos( a ) ),
                    y: Math.round( ry * Math.sin( a ) ),
                    a: deg  } );
            }


            var pos = path.pop();
            var px = Math.round( pos.x * size.x + size.x / 2 + 1 + this._walls[ pos.dir ].x * size.x / 4 );
            var py = Math.round( pos.y * size.y + size.y / 2 + 1 + this._walls[ pos.dir ].y * size.y / 4 );
            var pd = pos.dir;

            //draw solver
            var svgSolver = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
            svgSolver.setAttribute( 'stroke', '#444444' );
            svgSolver.setAttribute( 'stroke-width', '1' );
            svgSolver.setAttribute( 'fill', 'rgba(255,0,64,0.6)' );
            svgSolver.setAttribute( 'id', 'solver');
            var sqrt_3 = Math.sqrt( 3 );
            strPath = 'M' + 0 + ' ' + 0 +
                'L' + Math.round( solverSize / 2 ) + ' ' + Math.round( solverSize * sqrt_3 / 6 ) +
                'L' + 0 + ' ' + Math.round( 0 - solverSize * sqrt_3 / 3 ) +
                'L' + Math.round( - solverSize / 2 ) + ' ' + Math.round( solverSize * sqrt_3 / 6 ) +
                'Z';
            svgSolver.setAttribute( 'd', strPath );

            //move solver to init position
            svgSolver.setAttribute( 'transform', 'rotate( ' + ( 90 * pos.dir ) + ',' + px + ',' + py + ') ' +
                'translate( ' + px +', ' + py + ')' );


            //calculate the current position
            while ( pos = path.pop() ) {
                var cx = Math.round( pos.x * size.x + size.x / 2 + 1 + this._walls[ pos.dir ].x * size.x / 4 );
                var cy = Math.round( pos.y * size.y + size.y / 2 + 1 + this._walls[ pos.dir ].y * size.y / 4 );
                if ( ( path.length > 0 ) &&
                    ( path[ path.length - 1].type == 'turnLeft' ) ) {
                    cx -= Math.round( this._dirs[ pos.dir ].x * size.x / 2 );
                    cy -= Math.round( this._dirs[ pos.dir ].y * size.y / 2 );
                }
                if ( pos.type == 'turnLeft' ) {
                    cx += Math.round( this._dirs[ pos.dir ].x * size.x / 2 );
                    cy += Math.round( this._dirs[ pos.dir ].y * size.y / 2 );
                }
                var count = Math.abs(cx-px)>Math.abs(cy-py)?(cx-px):(cy-py);
                var dx = ( cx - px ) / count;
                var dy = ( cy - py ) / count;
                var d = count / Math.abs(count);
                if ( pos.type=='move' ) {
                    for (var cnt = 0; cnt != count; cnt += d) {
                        var x = Math.round( ( px + cnt * dx ) );
                        var y = Math.round( ( py + cnt * dy ) );
                        this._animationPath.push({
                            x: x, y: y,
                            rotate: '(' + ( 90 * pos.dir ) + ',' + x  + ',' + y + ')',
                            translate: '(' + x + ',' + y + ')'
                        });
                    }
                } else {
                    var shiftCoef = ( pos.type == 'turnLeft' ) ? 1 : -1;
                    var startAngle = ( 90 * ( pd + shiftCoef ) + 360 ) % 360;
                    var endAngle = 90 * pd;
                    if ( Math.abs( endAngle - startAngle ) > 90 ) {
                        endAngle = ( endAngle == 0 ) ? 360 : endAngle;
                        startAngle = ( startAngle == 0 ) ? 360 : startAngle;
                    }

                    //get the correct ellipse sector
                    var sector = [];
                    var maxAngle = ( startAngle >= endAngle ) ? startAngle : endAngle;
                    var minAngle = ( startAngle <  endAngle ) ? startAngle : endAngle;
                    for ( var i = 0; i < ellipse.length; i += 1 ) {
                        if ( minAngle < ellipse[i].a && ellipse[i].a < maxAngle ) {
                            sector.push( { x: ellipse[i].x,
                                y: ellipse[i].y,
                                a: ellipse[i].a } );
                        }
                    }

                    //adjust direction of rotation
                    if ( pos.type == 'turnRight' ) {
                        sector.reverse();
                    }

                    //shift it to the path position
                    for ( var i = 0; i < sector.length; i += 1 ) {
                        var x = px + sector[ i ].x + Math.round( shiftCoef * this._walls[pd].x * rx );
                        var y = py - sector[ i ].y + Math.round( shiftCoef * this._walls[pd].y * ry );
                        var a = sector[ i ].a - shiftCoef * 90 + 360; a %= 360;
                        this._animationPath.push({
                            x: x, y: y,
                            rotate: '(' + a + ',' + x  + ',' + y + ')',
                            translate: '(' + x + ',' + y + ')'
                        });
                    }
                }

                //store the position to enable calculation of the path for next move
                px = cx;
                py = cy;
                pd = pos.dir;
            }

            //create the path
            var pixelPath = document.createElementNS( 'http://www.w3.org/2000/svg', 'polyline' );
            pixelPath.setAttribute( 'stroke', 'rgba( 0, 0, 255, 0.7 )' );
            pixelPath.setAttribute( 'stroke-width', '1' );
            pixelPath.setAttribute( 'fill', 'none' );
            pixelPath.setAttribute( 'id', 'animationPath');
            pixelPath.setAttribute( 'points', '' );

            //add to svg and save
            svg.appendChild( pixelPath );
            this._pixelPath = pixelPath;
            svg.appendChild( svgSolver );
            this._svgSolver = svgSolver;
        }
    });

    Object.defineProperty( solver, 'animate', {
        enumerable: true,
        value: function ( clearFunc ) {

            var pos = this._animationPath[ this._animFrame ];
            this._svgSolver.setAttribute( 'transform', 'rotate' + pos.rotate +
                'translate' + pos.translate );
            this._animPoints += this._animationPath[ this._animFrame - 1 ].x + ' ' +
                this._animationPath[ this._animFrame - 1 ].y + ' ';
            this._pixelPath.setAttribute( 'points', this._animPoints );
            this._animFrame += 1;

            if (this._animFrame == this._animationPath.length) {
                clearFunc();
            }
        }
    });

    return solver;
}();

function btnClick () {
    var labX = document.getElementById( "labWidth" ).value;
    var labY = document.getElementById( "labHeight" ).value;
    var cellX = document.getElementById( "cellWidth").value;
    var cellY = document.getElementById( "cellHeight").value;
    document.getElementById('resultContainer').style.height = labY * cellY + 50 + 'px';

    document.getElementById('instructions').innerHTML = 'Click on the labyrinth to start digging.';

    document._labyrinth = labyrinth.init( labX | 0, labY | 0 , cellX | 0, cellY | 0,
        document.getElementById('labyrinthContainer'), 1, 'black');

    document.getElementById('resultContainer').style.display = 'block';
    document._labyrinth.drawLabyrinth( false );
    document.getElementById('paramsContainer').style.display = 'none';
}

function canvasClick(event) {
    var lab = document._labyrinth;
    var rect = document.getElementById('labyrinthContainer').getBoundingClientRect();

    switch (lab.state ) {

        case 'init':
        {
            var start = lab.getCoordinates(event.clientX - rect.left, event.clientY - rect.top);

            document.getElementById('instructions').innerHTML = 'Digging from position' +
                ' x: ' + start.x + ', y: ' + start.y;
            lab = labyrinth.init(lab.labSize.x | 0, lab.labSize.y | 0,
                lab._cellSize.x | 0, lab._cellSize.y | 0,
                document.getElementById('labyrinthContainer'), 1, 'black');

            lab.dig(start.x, start.y);

            var path = lab.path;
            var current;
            path.push({x: start.x, y: start.y})

            var animate = window.setInterval(function () {
                if (path.length > 0) {
                    current = path.pop();
                    lab.drawCell(current.x, current.y, true);
                } else {
                    clearFunc();
                }
            }, 1);

            var clearFunc = function () {
                window.clearInterval(animate);
                document.getElementById('instructions').innerHTML = 'Labyrinth ready. Click on an outer cell to create an exit.';
                lab.state = 'dug';
            }
            break;
        }
        case 'dug': {
            var exit = lab.getCoordinates(event.clientX - rect.left, event.clientY - rect.top);
            if ( lab.makeExitAt( exit.x, exit.y )) {
                document.getElementById('instructions').innerHTML = 'Click on any cell to start looking for the exit.';
                lab.state = 'ready';
            }
            break;
        }
        case 'ready': {
            var start = lab.getCoordinates(event.clientX - rect.left, event.clientY - rect.top);
            if ( !document._solver ) {
                document._solver = solver.init( lab, start.x, start.y );
            }
            document.getElementById('instructions').innerHTML = 'Starting at x: ' + start.x + ', y: ' + start.y + '. Looking for the exit.';

            var animate = window.setInterval(function () {
                    document._solver.animate( clearFunc )
                }
                , 5 );

            var clearFunc = function () {
                window.clearInterval(animate);
                document.getElementById('instructions').innerHTML = 'Exit found. Please refresh to reset!';
            };

            lab.state = 'solved';
            break;
        }
    }
}
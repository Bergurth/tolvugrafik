/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Vörpunarfylki búið til í JS og sent yfir til
//     hnútalitara, sem margfaldar (þ.e. varpar)
//
//    Hjálmtýr Hafsteinsson, febrúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var mpoints = [];
//var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var matrixLoc;

//colors
var colorA = vec4(0.0, 0.0, 0.0, 1.0);
var colorB = vec4(0.0, 0.0, 1.0, 1.0);

// buffers
var midpointsBuffer;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();
    midpoints();

    console.log(flatten(mpoints));
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    midpointsBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, midpointsBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mpoints), gl.DYNAMIC_DRAW );

    locColor = gl.getUniformLocation( program, "rcolor" );
    locPosition = gl.getAttribLocation( program, "vPosition" );
    matrixLoc = gl.getUniformLocation( program, "rotation" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    render();
}

function colorCube()
{
    quad();
    //quad(0,0,0,0);
    //quad( 1, 0, 3, 2 );
    //quad( 2, 3, 7, 6 );
    //quad( 3, 0, 4, 7 );
    //quad( 6, 5, 1, 2 );
    //quad( 4, 5, 6, 7 );
    //quad( 5, 4, 0, 1 );
}


function midpoints()
{
    var midpoints = [
	vec3( 0.0, 0.0, 0.0),
	vec3( -0.6, -0.6,  0.6 ),
        vec3( -0.5,  0.5,  0.6 ),
        vec3(  0.5,  0.8,  0.5 ),	
    ]
    for ( var i = 0; i < midpoints.length; ++i ) {

	mpoints.push( midpoints[i] );
    }

    console.log(mpoints);
    
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var v = vertices;
    
    var lines = [ v[0], v[1], v[1], v[2], v[2], v[3], v[3], v[0],
              v[4], v[5], v[5], v[6], v[6], v[7], v[7], v[4],
              v[0], v[4], v[1], v[5], v[2], v[6], v[3], v[7]
            ];

    
    for ( var i = 0; i < lines.length; ++i ) {
	points.push( lines[i] );
        }
    
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    gl.uniform4fv( locColor, flatten(colorA) );

    //gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    gl.drawArrays( gl.LINES, 0, NumVertices );

    
    // middle box
    mv = mult( mv, scalem( 0.33333, 0.33333, 0.33333 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // x side middle box
    mv2 = mult( mv, translate( 1.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // -x side middle box
    mv3 = mult( mv, translate( -1.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // y side middle box
    mv4 = mult( mv, translate( 0.0, 1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv4));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // -y side middle box
    mv5 = mult( mv, translate( 0.0, -1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv5));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    //--------------------------------------------------

    // x side middle box + y
    mv6 = mult( mv, translate( 1.0, 1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv6));
    gl.drawArrays( gl.LINES, 0, NumVertices );
    
    // x side middle box - y
    mv7 = mult( mv, translate( 1.0, -1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv7));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // -x side middle box + y
    mv8 = mult( mv, translate( -1.0, 1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv8));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // -x side middle box - y
    mv9 = mult( mv, translate( -1.0, -1.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv9));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    //--------------------------------------------------

    // z +
    mvz = mult( mv, translate( 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z -
    mvz = mult( mv, translate( 0.0, 0.0, -1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );
    
    // z +
    mvz = mult( mv2, translate( 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z -
    mvz = mult( mv2, translate( 0.0, 0.0, -1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z +
    mvz = mult( mv3, translate( 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z -
    mvz = mult( mv3, translate( 0.0, 0.0, -1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z +
    mvz = mult( mv4, translate( 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z -
    mvz = mult( mv4, translate( 0.0, 0.0, -1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    // z +
    mvz = mult( mv5, translate( 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );

    
    // z -
    mvz = mult( mv5, translate( 0.0, 0.0, -1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvz));
    gl.drawArrays( gl.LINES, 0, NumVertices );
    
    // middle box again
    mv = mult( mv, scalem( 0.13333, 0.13333, 0.13333 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.uniform4fv( locColor, flatten(colorB) );
    gl.drawArrays( gl.LINES, 0, NumVertices );
    

    // draw point
    /*
    gl.bindBuffer(gl.ARRAY_BUFFER, midpointsBuffer);
    gl.vertexAttribPointer( locPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorB) );
    //gl.bindBuffer(gl.ARRAY_BUFFER, midpointsBuffer);
    gl_PointSize = 10.0;
    
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(mpoints));
    gl.drawArrays( gl.POINTS, 0, 3 );
    */
    requestAnimFrame( render );
}


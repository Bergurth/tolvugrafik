/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hra�anum me� upp/ni�ur �rvum.
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// N�verandi sta�setning mi�ju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hra�i) fernings
var dX;
var dY;

// Kv�r�un � kassa
var box_scale = 1.0;

// Sv��i� er fr� -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// H�lf breidd/h�� ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega � mi�junni
var vertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);

var matrixLoc;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu � upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );
    matrixLoc = gl.getUniformLocation( program, "scale" );
    
    // Me�h�ndlun �rvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
	    
            case 38:	// upp �r
	        box_scale += 0.05;
	        console.log("scaling upp");
                break;
            case 40:	// ni�ur �r
	        box_scale -= 0.05;
	        console.log("scaling down");
                break;
            case 37:	// vinstri �r
                dX -= 0.025;
                break;
            case 39:	// h�gri �r
                dX += 0.025;
                break;
	    
        }
    } );

    render();
}


function render() {
    
    // L�t ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad * box_scale) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad * box_scale) dY = -dY;

    // Uppf�ra sta�setningu
    box[0] += dX;
    box[1] += dY;

    var mv = mat4();
    
    mv = mult(mv, translate(box[0], box[1], 0)); // move back
    mv = mult(mv, scalem(box_scale, box_scale, box_scale)); // scale
    mv = mult(mv, translate(-box[0], -box[1], 0)); // move to middle
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform2fv( locBox, flatten(box) );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    window.requestAnimFrame(render);
}

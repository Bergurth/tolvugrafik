/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á lyklaborðsatburðum til að hreyfa spaða
//
//    Hjálmtýr Hafsteinsson, janúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var jump = false;
var fall = false;
var bufferId;
var buffer_ground;
var gold_buffer;
var colorA = vec4(0.0, 0.0, 1.0, 1.0);
var colorB = vec4(0.0, 1.0, 0.0, 1.0);
var colorC = vec4(1.0, 1.0, 0.0, 1.0); // yellow

var xmove = 0.0;
var ymove = 0.0;


window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // triangle
    var marius_r = [
	vec2(0.0, 0.1),
	vec2(0.0, -0.1),
	vec2(0.1, 0.0),
	]

    var marius_l = [
	vec2(0.0, 0.1),
	vec2(0.0, -0.1),
	vec2(-0.1, 0.0),
	]

    var vertices = [
	vec2(0.0, 0.1),
	vec2(0.0, -0.1),
	vec2(0.1, 0.0),
    ];


    var ground_verts = [
	vec2(-2, -2),
	vec2(-2, -0.1),
	vec2(2, -2),
	vec2(-2, -0.1),
	vec2(2, -2),
	vec2(2, -0.1),
	]

    var gold_verts = [
	vec2(-0.025, 0.2),
	vec2(-0.025, 0.25),
	vec2(0.025, 0.2),
	vec2(-0.025, 0.25),
	vec2(0.025, 0.2), 
	vec2(0.025, 0.25),
    ]
    
    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    
    buffer_ground = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_ground );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ground_verts), gl.DYNAMIC_DRAW );
    

    buffer_gold = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_gold);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(gold_verts), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    var map = {}; // You could also use an array
    onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';
    /* insert conditional here */
    }

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
	//xmove = 0.0;
	//ymove = 0.0;
	if (map['32'] == true) {
	    if (jump == false) {
		jump = true;
		if (map['37'] == true && map['39'] != true) {xmove=-0.04;}
		if (map['39'] == true && map['37'] != true) {xmove=0.04;}

		setTimeout(function(){
		    // Code to be executed after timeout goes here
		    fall = true;
		}, 250);
		setTimeout(function(){
		    // Code to be executed after timeout goes here
		    jump = false;
		    fall = false;
		    // now the landing
		    //vertices[0][1] = -0.1;
		    //vertices[1][1] = 0.1;
		    //vertices[2][1] = -0.1;

		    vertices[0][1] = marius_r[0][1];
		    vertices[1][1] = marius_r[1][1];
		    vertices[2][1] = marius_r[2][1];

		    ymove = 0.0;
		}, 500);
	    }
	}
	if (jump == true && fall != true) {ymove=0.04;}
	if (jump == true && fall == true) {ymove=-0.04;}
	if (map['37'] == true && jump != true) {
	    xmove=-0.04;
	    vertices[2][0] = vertices[0][0] - 0.1;
	}
	if (map['39'] == true && jump != true) {
	    xmove=0.04;
	    vertices[2][0] = vertices[0][0] + 0.1;
	}

	
        for(i=0; i<3; i++) {
            vertices[i][0] += xmove;
	    vertices[i][1] += ymove;
        }
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );

    // Get location of shader variable vPosition                                 
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    locColor = gl.getUniformLocation( program, "rcolor" );

    
    render();

var intervalId = setInterval(function() {
    if (jump == true && fall != true){
	ymove = 0.04;
    } else if (jump == true && fall == true) {
	ymove = -0.04;
    }
    if (jump != true && map['37'] != true && map['39'] != true) {xmove=0.0;}
    for(i=0; i<3; i++) {
	vertices[i][1] += ymove;
	vertices[i][0] += xmove;
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    locColor = gl.getUniformLocation( program, "rcolor" );
    render();
    
}, 2);

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    // drawing ground
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_ground );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorB) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );

    // drawing gold
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_gold );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorC) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );

    
    // drawing mario    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorA) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimFrame(render);
}

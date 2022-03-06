/////////////////////////////////////////////////////////////////
//    Verkefni2 - TÖL203M - Bergur Þorgeirsson -2022
//     
//     Eco-cube
//
//    kennari: Hjálmtýr Hafsteinsson
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];

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
var colorA = vec4(0.0, 0.0, 0.0, 1.0); // black
var colorB = vec4(0.0, 0.0, 1.0, 1.0); // blue
var colorC = vec4(0.0, 1.0, 0.0, 1.0); // green
var colorD = vec4(1.0, 0.0, 0.0, 1.0); // red
var colorE = vec4(1.0, 1.0, 1.0, 1.0); // white

var animals = [
    [1,1,1,0,0,0],
    [0,0,0,0,0,0],
    [2,2,2,0,0,0],
    [1,0,0,1,0,0]
    ] // three position, and one sheep/wolf, eaten, time_since_eaten 

var nSheep = 55;
var nWolfs = 4;

var turnDuration = 1000; // 2000
var turn = 0;

var wolfTurns2hunger = 4;
var wolfSheep2Repr = 15;
var sheepTurns2Repr = 2;

var cubeSideLength = 5.0;
var grid_list = [];

var gridSize = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gridSize = Math.pow(cubeSideLength, 3);

    sheepNumberSlider = document.getElementById("sheepnumber");
    sheepNumberDisplay = document.getElementById("sheepnumberdisplay");
    wolfNumberSlider = document.getElementById("wolfnumber");
    wolfNumberDisplay = document.getElementById("wolfnumberdisplay");

    gridSizeSlider = document.getElementById("gridsize");
    gridSizeDisplay = document.getElementById("gridsizedisplay");
    gridSizeSlider.oninput = function() {
	console.log("grid size changing");
	cubeSideLength = this.value;
	gridSize = Math.pow(cubeSideLength, 3);
	//clearInterval(intervalId);
	gridSizeDisplay.innerHTML = cubeSideLength;
	grid_list = produce_grid_list(cubeSideLength);
	animals = [];
	random_animal_populate(nSheep,nWolfs);
	sheepNumberSlider.max = Math.pow(cubeSideLength, 3 ) -1;
	wolfNumberSlider.max = Math.pow(cubeSideLength, 3 ) -1;
    }

    
    turnDurationSlider = document.getElementById("turnduration");
    turnDurationDisplay = document.getElementById("turndurationdisplay");
    turnDurationSlider.oninput = function() {
	console.log("turnDuration changing");
	turnDuration = this.value;
	clearInterval(intervalId);
	intervalId = setInterval(do_turn, turnDuration);
	turnDurationDisplay.innerHTML = turnDuration;
    }
    sheepNumberSlider.oninput = function() {
	console.log("nSheep changing");
	nSheep = parseInt(this.value);

	if((nSheep + nWolfs) > gridSize){
	    nWolfs = gridSize - nSheep;
	}
	clearInterval(intervalId);
	random_animal_populate(nSheep,nWolfs);
	intervalId = setInterval(do_turn, turnDuration);
	sheepNumberDisplay.innerHTML = nSheep;
    }
    wolfNumberSlider.oninput = function() {
	console.log("nWolfs changing");
	nWolfs = parseInt(this.value);

	if((nSheep + nWolfs) > gridSize){
	    nSheep = gridSize - nWolfs;
	}
	clearInterval(intervalId);
	random_animal_populate(nSheep,nWolfs);
	intervalId = setInterval(do_turn, turnDuration);
	wolfNumberDisplay.innerHTML = nWolfs;
    }
    wolfHungerSlider = document.getElementById("wolfhunger");
    wolfHungerDisplay = document.getElementById("wolfhungerdisplay");
    wolfHungerSlider.oninput = function(){
	wolfTurns2hunger = parseInt(this.value);
	wolfHungerDisplay.innerHTML = this.value;
    }
    wolfReproductionSlider = document.getElementById("wolfrepr");
    wolfReproductionDisplay = document.getElementById("wolfrepdisplay");
    wolfReproductionSlider.oninput =  function(){
	console.log("changing wolf reproduction");
	wolfSheep2Repr = parseInt(this.value);
	wolfReproductionDisplay.innerHTML = this.value;
    }
    sheepReproductionSlider = document.getElementById("sheeprep");
    sheepReprDisplay = document.getElementById("sheeprepdisplay");
    sheepReproductionSlider.oninput = function(){
	sheepTurns2Repr = parseInt(this.value);
	sheepReprDisplay.innerHTML = this.value;
    }

    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    Cube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
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
    grid_list = produce_grid_list(cubeSideLength);
    random_animal_populate(nSheep,nWolfs);

    
    render();
}

function Cube() 
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

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

function arraySame(array1, array2, maxDepth){
    for(let i = 0; i < Math.min(array1.length, maxDepth); i++){
       if(array1[i] != array2[i]){
       return false;
       }
     }
    return true;
 }

function animal_in_same_place(animal1, animal2){
    return arraySame(animal1, animal2, 3);
}

function produce_grid_list(sidelength){
    // produces a series of base_sidelength_numbers
    // i.e. base 3 or ternary for sidelength 3 for example
    // codifying a the places in a cube of the same
    // sidelength
    l = [];
    for(i=0; i < Math.pow(sidelength, 3); i++){
	element = (i).toString(sidelength);
	if(element.length < 3){
	    element = '0'.repeat(3 - element.length) + element;
	}
	l.push(element)
    }
    return l;
}

function random_animal_populate(sheep, wolfs){
    grid_list = produce_grid_list(cubeSideLength);
    gridSize = Math.pow(cubeSideLength, 3);
    if((sheep + wolfs) > gridSize){
	console.log("to many animals");
	return 1;
    }
    animals = [];
    turn = 0;
    terns = grid_list.slice();
    for(i = 0; i < sheep; i++){
	place = terns.pop(Math.floor(Math.random() * terns.length));
	newsheep = place.split('').concat([0,0,0]) 
	animals.push(newsheep);
    }
    for(i = 0; i < wolfs; i++){
	place = terns.pop(Math.floor(Math.random() * terns.length));
	newwolf = place.split('').concat([1,0,0]);
	animals.push(newwolf);
    }
    return 0;
}

function reprodAnimalFrom(animal_index){
    animal = animals[animal_index]
    prev_place = animal.slice();
    xyz_choice = Math.floor(Math.random() * 3);
    if(animal[3] == 0){//Sheep
	placement = animal.slice();
	placement[xyz_choice] = get_prospect_placement_from(animal, xyz_choice);
	animals.push(placement);
	var animal_location_string_array_i = []
	for(let j = 0; j < animals.length; j++){
	    animal_location_string_array_i[j] = animals[j].slice(0,3).toString();
	}
	if(hasDuplicates(animal_location_string_array_i)){ // some kind of animal collision
	    animals.pop(); // sheep wont repr on other animal
	}
    }
    else {//wolf
	placement = animal.slice();
	placement[xyz_choice] = get_prospect_placement_from(animal, xyz_choice);
	// reset eaten and since eaten
	placement[4] = 0;
	placement[5] = 0;
	pushed_place = animals.push(placement);
	var animal_location_string_array_i = []
	for(let j = 0; j < animals.length; j++){
	    animal_location_string_array_i[j] = animals[j].slice(0,3).toString();
	}
	if(hasDuplicates(animal_location_string_array_i)){ // some kind of animal collision 
	    animal_location_string_array_i[pushed_place] = "current";
	    collider_location = animal_location_string_array_i.indexOf(animals[animal_index].slice(0,3).toString())
	    collider = animals[collider_location].slice();
	    if(collider[3] == 1) {
		// case 1 another wolf --> avoid collision
		//animals[i] = prev_place; // move taken back
		animals.pop();
	    }else{
		// case sheep, replace sheep
		animals.pop(collider_location);
	    }
	}
    }
    
}

function get_prospect_placement_from(animal , direction){
	plus_minus_choice = Math.floor(Math.random() * 2);
    var position_p = animal[direction];
	if(plus_minus_choice == 0){
	    position_p -= 1;
	}else {
	    position_p += 1;
	}

	if(position_p == -1){
	    position_p = cubeSideLength;
	}

    return (position_p % cubeSideLength);
}

function do_turn() {
    turn += 1;
    // move animals
    for( let i = 0; i < animals.length; i++){
	xyz_choice = Math.floor(Math.random() * 3);
	prev_place = animals[i].slice(); // in order to pass by value
	animals[i][xyz_choice] = get_prospect_placement_from(animals[i], xyz_choice);
	var animal_location_string_array = []
	for(let j = 0; j < animals.length; j++){
	    animal_location_string_array[j] = animals[j].slice(0,3).toString();
	}
	if(hasDuplicates(animal_location_string_array)){ // some kind of animal collision
	    if(animals[i][3] == 0 ){ // sheep avoids collision with sheep or wolf 
		animals[i] = prev_place; // move taken back
	    }
	    else if(animals[i][3] == 1){ // a wolf is colliding with something.
		animal_location_string_array[i] = "current";
		collider_location = animal_location_string_array.indexOf(animals[i].slice(0,3).toString())
		collider = animals[collider_location].slice();


		if(collider[3] == 1) {
		    // case 1 another wolf --> avoid collision
		    animals[i] = prev_place; // move taken back
		}
		else {
		    // case 2 sheep --> eat sheep
		    console.log("eating sheep");
		    wolf = animals[i]; // pass by ref
		    wolf[4] += 1; // wolf eat count +
		    wolf[5] = 0;  // wolf satiated

		    animals.splice(collider_location, 1); // removing sheep
		    continue
		}
	    }
	} // --- close of hasDuplicates
	if(animals[i][3] == 1){
	    animals[i][5] += 1; // hungering the wolf
	    if(animals[i][5] > wolfTurns2hunger ){
		console.log("A wolf starved");
		animals.pop(i);
		continue
	    }
	    if(animals[i][4] % wolfSheep2Repr == 0 && animals[i][4] != 0){
		reprodAnimalFrom(i); // reproduce wolf
	    } 
	}
	// reproduce sheep
	if(turn % sheepTurns2Repr == 0 && animals[i][3] == 0){
	    reprodAnimalFrom(i);
	}
    } // for loop
}


var intervalId = setInterval(do_turn, turnDuration);


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    draw_grid(mv);
    requestAnimFrame( render );

    
    // deal with animals
        for ( var i = 0; i < animals.length; ++i ) {
	    var animal_scale = cubeSideLength - 1;
	    translation = cubeSideLength - 1;
	    tr_extra = -(0.5 * Math.pow(cubeSideLength, 2.0) - 2 * cubeSideLength + 1.5);
	    mvs1 = mult(
		mv, scalem(
		    1.0 / (cubeSideLength * animal_scale),
		    1.0 / (cubeSideLength * animal_scale),
		    1.0 / (cubeSideLength * animal_scale))
	    );

	    mvs = mult(mvs1, translate(
		((parseInt(animals[i][0], cubeSideLength) - 1.0) * translation) + tr_extra,
		((parseInt(animals[i][1], cubeSideLength) - 1.0) * translation) + tr_extra,
		((parseInt(animals[i][2], cubeSideLength) - 1.0) * translation) + tr_extra
	    ))

	    gl.uniformMatrix4fv(matrixLoc, false, flatten(mvs));
	    if(animals[i][3] == 0){
		gl.uniform4fv( locColor, flatten(colorC) );
	    }else{
		gl.uniform4fv( locColor, flatten(colorD) );
	    }
	    gl.drawArrays( gl.LINES, 0, NumVertices );
    }
}

function draw_grid(mv){
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.uniform4fv( locColor, flatten(colorE) );
    gl.drawArrays( gl.LINES, 0, NumVertices );

    mvg1 = mult( mv, scalem( 1.0/cubeSideLength, 1.0/cubeSideLength, 1.0/cubeSideLength ) );

    var gtrans = (cubeSideLength - 1.0)/ 2.0;
    for(i=0;i < grid_list.length; i++){
	mv2 = mult( mvg1, translate( parseInt(grid_list[i][0], cubeSideLength) - gtrans, parseInt(grid_list[i][1], cubeSideLength) - gtrans, parseInt(grid_list[i][2], cubeSideLength) - gtrans ) );
	gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2));
	gl.drawArrays( gl.LINES, 0, NumVertices );
    }


}



var PAC_SPEED = 25;
var SKULL_SPEED = 15;
var X_DIRECTION = new THREE.Vector3(1, 0, 0);
var MINUS_X_DIRECTION = new THREE.Vector3(-1, 0, 0);
var Z_DIRECTION = new THREE.Vector3(0,0,1);
var MINUS_Z_DIRECTION = new THREE.Vector3(0,0,-1);
var Y_UP_DIRECTION = new THREE.Vector3(0,1,0);
var Y_DOWN_DIRECTION = new THREE.Vector3(0,-1,0);
var PACMAN_RAD = 4;

// Helpers
var TILE_HELPERS = false;
var PACMAN_HELPERS = false;
var ORIGIN_HELPERS = true;
var LIGHT_HELPERS = true;
var SKULL_HELPERS = true;

// dev related configs
var SKULLS_MOVE = true;
var SKULLS_VISIBLE = true;

// Ná í striga og skilgreina birti
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});

// Skilgreina myndavél og staðsetja hana
const camera = new THREE.PerspectiveCamera( 60, canvas.clientWidth/canvas.clientHeight, 0.2, 1000 );
camera.position.set(75, 75, 75);
//camera.lookAt(0,0,0);

// Bæta við músarstýringu
const controls = new THREE.OrbitControls( camera, canvas );

// Skilgreina sviðsnetið
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xAAAAAA );

const boxGeo = new THREE.BoxGeometry(10, 1, 10);

const loader = new THREE.TextureLoader();

// Hlöðum inn mynstrinu...
const texture = loader.load('resources/images/brick29.jpg');

const boxMaterial = new THREE.MeshBasicMaterial({map:texture});
const box = new THREE.Mesh(boxGeo, boxMaterial);

const axes = new THREE.AxesHelper( 15 );
if(TILE_HELPERS){
	box.add(axes);	
}

camera.lookAt(box);

//var maps;

// grid should be square
grid = map2; // see maps.js

middle_z = grid[0].length/2;
middle_x = grid.length/2;


function addmap(scene, grid, tile){ // tile is the obj to clone from
	var tilewidth = tile.geometry.parameters['width'];
	tiles = []
	var skulls = []
	for(let i = grid.length -1; i > -1; i--){
		for(let j = grid.length -1 ; j > -1; j--){
			if(grid[i][j] !== 'X'){
				tiles.push([i - middle_x, j - middle_z]);
			}
			if(grid[i][j] === 'P'){
				var pacman = add_pacman((i - middle_x) * tilewidth, (j - middle_z)* tilewidth);
			}
			if(grid[i][j] === 'S'){
				skulls.push(add_skull((i - middle_x) * tilewidth, (j - middle_z)* tilewidth));
			}
			
		}
	}
	for(let i = 0; i < tiles.length; i++){

		tile[i] = box.clone();
		tile[i].position.set(tiles[i][0] * tilewidth, 0, tiles[i][1] * tilewidth);
		scene.add(tile[i]);
	}

	return [pacman, tilewidth, skulls];
}

// pacman = addmap(scene, grid, box);
// let[pacman, skulls, ... ] = addmap(scene, grid, box);
let[pacman, tilewidth, skulls] = addmap(scene, grid, box);

var half_tile = Math.round(tilewidth / 2.0);

// utility functions
var grid_to_game = function (pos) {
	return (pos - middle_x) * tilewidth; 
}

var game_to_grid = function (pos) {
	return Math.round(pos/tilewidth) + middle_x;
}


var get_cell = function (grid, position){
	var x = Math.round(position['x']), 
	    z = Math.round(position['z']);
	return grid[game_to_grid(x)][game_to_grid(z)];

}

var inWall = function(grid, position){
        var cell = get_cell(grid, position);
        return cell === 'X';
    };

var distance = function (thing1, thing2) {
    var difference = new THREE.Vector3();

        difference.copy(thing1.position).sub(thing2.position);
        return difference.length();
    };


if(PACMAN_HELPERS){
	pacman.add(axes);	
}

// Ljósgjafinn er í miðri sólinni ( í (0, 0, 0) )
const light = new THREE.PointLight( 0xFFFFFF, 3 );
light.position.set( 100, 100, 100 );
scene.add(light)
const red_light = new THREE.PointLight(0xFF0000,3);
red_light.position.set(-100, 100, 100);
scene.add(red_light);

const blue_light = new THREE.PointLight(0x0000FF,3);
blue_light.position.set(100, 100, -100);
scene.add(blue_light);

const green_light = new THREE.PointLight(0x00FF00,3);
green_light.position.set(100, 100, -100);
scene.add(green_light);


const pointLightHelper = new THREE.PointLightHelper( light, 1 );

const pointLightHelper2 = new THREE.PointLightHelper( green_light, 1 );


if(LIGHT_HELPERS){
	scene.add( pointLightHelper );
	scene.add( pointLightHelper2 );	
}

// ARROW HELPER
var up = new THREE.ArrowHelper(
        // first argument is the direction
        new THREE.Vector3(0, 2, 0).normalize(),
        // second argument is the origin
        new THREE.Vector3(0, 0, 0),
        // length
        20.2,
        // color
        0x00ff00);

if(ORIGIN_HELPERS){
	scene.add(up);	
}

// ARROW HELPER 2
var pac_forward_vec = new THREE.Vector3(2, 0, 0).normalize()
var forward = new THREE.ArrowHelper(
        // first argument is the direction
        pac_forward_vec,
        // second argument is the origin
        new THREE.Vector3(0, 0, 0),
        // length
        20.2,
        // color
        0xff0000);

if(PACMAN_HELPERS){
	pacman.add(forward);
}
// pacman.add(pac_forward_vec);


// ARROW HELPER 3
var skull_forward_vec = new THREE.Vector3(2, 0, 0).normalize()
var skull_forward = new THREE.ArrowHelper(
        // first argument is the direction
        skull_forward_vec,
        // second argument is the origin
        new THREE.Vector3(0, 0, 0),
        // length
        20.2,
        // color
        0xff0000);

//pacman.add(forward);
//pacman.add(pac_forward_vec);



function add_pacman(x_position, z_position){
    const pac_obj = new THREE.Object3D();
    scene.add(pac_obj);

    // PAC-man
	const pac_geo = new THREE.SphereGeometry( 4, 32, 16, Math.PI, Math.PI * 11/6 );
	const pac_mat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	const pac = new THREE.Mesh( pac_geo, pac_mat );
	//pac.position.set(x_position,5,z_position);
	//pac.rotation.x = (Math.PI / 2);
	scene.add( pac );

	// inside PAC-man
	const black_pac_geo = new THREE.SphereGeometry( 3.80, 32, 16, Math.PI, Math.PI * 11/6 );
	const black_pac_mat = new THREE.MeshBasicMaterial( { color: 0x000000 ,side: THREE.DoubleSide } );
	const black_pac = new THREE.Mesh( black_pac_geo, black_pac_mat );
	//black_pac.position.set(x_position,5,z_position);
	//black_pac.rotation.x = (Math.PI / 2);
	scene.add( black_pac );

	//pac_obj.add(axes);

	pac_obj.add(pac);
	pac_obj.add(black_pac);
	pac_obj.position.set(x_position,5,z_position); // This works
	pac_obj.rotation.x = (Math.PI / 2);
	pac_obj.direction = new THREE.Vector3(2, 0, 0).normalize(); // not working yet
	// const arrowHelper = new THREE.ArrowHelper( pac_obj.direction, pac_obj, 50 );
	// scene.add( arrowHelper );

	return pac_obj;
}

function add_skull(x_position, z_position){
			const skull_obj = new THREE.Object3D();
			scene.add(skull_obj);
			skull_obj.position.set(x_position,2,z_position);
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.load('resources/models/skull/skull.mtl', (mtl) => {
              mtl.preload();
              const objLoader = new THREE.OBJLoader();
              objLoader.setMaterials(mtl);
              objLoader.load('resources/models/skull/skull.obj', (skull) => {

	            skull.rotation.x = Math.PI * -.5;
	            skull.scale['x'] = 0.3;
	            skull.scale['y'] = 0.3;
	            skull.scale['z'] = 0.3;
	            
	            skull_obj.isSkull = true;
	            skull.isSkull = true;
	            if(SKULLS_VISIBLE){
	           		scene.add(skull); 
	            	skull_obj.add(skull);
	            }

	            skull_obj.direction = new THREE.Vector3(0,0,2).normalize();

              });
            });
           if(SKULL_HELPERS){skull_obj.add(axes)};
           return skull_obj; 

}

var keys_pressed = function(){
        var keysPressed = {};

        document.body.addEventListener('keydown', function (event) {
            keysPressed[event.keyCode] = true;
            keysPressed[String.fromCharCode(event.keyCode)] = true;
        });
        document.body.addEventListener('keyup', function (event) {
            keysPressed[event.keyCode] = false;
            keysPressed[String.fromCharCode(event.keyCode)] = false;
        });

        return keysPressed;

}();

function update_pacman(delta){
	var _lookAt = new THREE.Vector3();
    pacman.up.copy(pacman.direction).applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2);
    pacman.lookAt(_lookAt.copy(pacman.position).add(Y_UP_DIRECTION));

    if(keys_pressed['87']){ // w

		//pacman.translateOnAxis(pac_forward_vec, PAC_SPEED * delta); // change to pac-direction
		pacman.translateOnAxis(pac_forward_vec, PAC_SPEED * delta);

		var correction_delta = PACMAN_RAD 

		var right = pacman.position.clone().addScaledVector(X_DIRECTION, correction_delta).round();
	    var left = pacman.position.clone().addScaledVector(MINUS_X_DIRECTION, correction_delta).round();
	    var bottom = pacman.position.clone().addScaledVector(Z_DIRECTION, correction_delta).round();
	    var top = pacman.position.clone().addScaledVector(MINUS_Z_DIRECTION, correction_delta).round();

	    if (inWall(grid, left)) {
	    	//console.log("hitting wall on left");
	        pacman.position.x = left.x + 0.5 + correction_delta
	    }
	    if (inWall(grid, right)) {
	    	//console.log("hitting wall on right");
	        pacman.position.x = right.x - 0.5 - correction_delta
	    }
	    if (inWall(grid, top)) {
	        pacman.position.z = top.z + 0.5 + correction_delta
	    }
	    if (inWall(grid, bottom)) {
	        pacman.position.z = bottom.z - 0.5 - correction_delta
	    }
	}
    if (keys_pressed['65']) { // a
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, Math.PI / 2 * delta);
    }
    if (keys_pressed['68']) { // d
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2 * delta);
    }

	// check for skull collision
	scene.children.forEach(function(object){

		if(object.isSkull === true){

			if(distance(pacman, object) < correction_delta){
				console.log("SKULL COLLISION")
				// pacman lose life + respawn if appropriate
			}

		}
	})


} // update_pacman

function update_skulls(delta){
	scene.children.forEach(function(object){
		if(object.isSkull === true){
			update_skull(object, delta);
		}
	})


} // update_skulls

function update_skull(skull, delta){
	var former_location = new THREE.Vector3();
	var new_location = new THREE.Vector3();
	var turn_left = new THREE.Vector3();
	var turn_right = new THREE.Vector3();

	var check_distance = half_tile + 0.5 ;
	var movement_options = []

	former_location.copy(skull.position).addScaledVector(skull.direction, 0.5).round();

	if(SKULLS_MOVE){
		skull.translateOnAxis(skull.direction,  SKULL_SPEED * delta);
	}

	new_location.copy(skull.position).addScaledVector(skull.direction, 0.5).round();



	if(game_to_grid(former_location['z']) !== game_to_grid(new_location['z']) ||
		game_to_grid(former_location['x']) !== game_to_grid(new_location['x'])){

        turn_left.copy(skull.direction).applyAxisAngle(Y_UP_DIRECTION, Math.PI / 2);
        turn_right.copy(skull.direction).applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2);

	 	var bad_forward = inWall(grid, new_location);
        var bad_left = inWall(grid, new_location.copy(skull.position).add(turn_left));
        var bad_right = inWall(grid, new_location.copy(skull.position).add(turn_right));

        if(! (bad_right && bad_left)){
        	// a turn can be made
        	movement_options = [];
        	if(!bad_forward){ movement_options.push(skull.direction)};
        	if(!bad_left){movement_options.push(turn_left)};
        	if(!bad_right){movement_options.push(turn_right)};

        }

	    if(movement_options.length === 0){
	    	throw new Error('Skull in trouble');
	    	skull.position.copy(former_location);
	    }
		var newDirection = movement_options[Math.floor(Math.random() * movement_options.length)];
	 	skull.direction.copy(newDirection);
	 	//skull.position.round().addScaledVector(skull.direction, delta);


	} // if Skull transitioning


	//skull.translateOnAxis(skull.direction,  SKULL_SPEED * delta);
}


var prevTime = window.performance.now();
// Hreyfifall
const animate = function () {
	var now = window.performance.now();
	var timeDelta = (now - prevTime) / 1000;
	prevTime = now;

	requestAnimationFrame( animate );
	//console.log(timeDelta);
	update_pacman(timeDelta);
	update_skulls(timeDelta);

    controls.update();
	renderer.render( scene, camera );
	//console.log(keys_pressed);
};

animate();
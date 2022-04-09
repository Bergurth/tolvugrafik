
var PAC_SPEED = 25;
var PAC_ROT_SPEED = 3;
var PAC_SPEED_MULTIPLIER = 1;
var SKULL_SPEED = 15;
var SKULL_SPEED_MULTIPLIER = 1;
var X_DIRECTION = new THREE.Vector3(1, 0, 0);
var MINUS_X_DIRECTION = new THREE.Vector3(-1, 0, 0);
var Z_DIRECTION = new THREE.Vector3(0,0,1);
var MINUS_Z_DIRECTION = new THREE.Vector3(0,0,-1);
var Y_UP_DIRECTION = new THREE.Vector3(0,1,0);
var Y_DOWN_DIRECTION = new THREE.Vector3(0,-1,0);
var PACMAN_RAD = 4;
var SKULL_RAD = 2;

// Helpers
var TILE_HELPERS = false;
var PACMAN_HELPERS = false;
var ORIGIN_HELPERS = true;
var LIGHT_HELPERS = true;
var SKULL_HELPERS = true;

// dev related configs
var SKULLS_MOVE = true;
var SKULLS_VISIBLE = true;

//var game_end_canvas = document.getElementById('game-end');

// Ná í striga og skilgreina birti
const canvas = document.querySelector('#c');
const end_canvas = document.querySelector('#endgame');
const pac_lives = document.querySelector('#paclives');
const pac_lives_label = document.querySelector('#pacliveslabel');
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
grid = map1.slice(); // see maps.js

middle_z = grid[0].length/2;
middle_x = grid.length/2;

pill_count = 0;
pills_eaten = 0;
var pacman_spawn_point;
var pacman_lives = 3;
pac_lives.innerHTML = pacman_lives;

var pacman_powerd_up = false;

// const gui = new dat.GUI();
// //gui.add(pacman_lives);


function addmap(scene, grid, tile){ // tile is the obj to clone from
	var tilewidth = tile.geometry.parameters['width'];
	tiles = []
	var skulls = []
	for(let i = grid.length -1; i > -1; i--){
		for(let j = grid.length -1 ; j > -1; j--){
			if(grid[i][j] !== 'X'){
				tiles.push([i - middle_x, j - middle_z]);
			}
			if(grid[i][j] == '.'){
				add_pill((i - middle_x) * tilewidth, (j - middle_z)* tilewidth);
				pill_count++;
			}
			if(grid[i][j] == 'O'){
				add_big_pill((i - middle_x) * tilewidth, (j - middle_z)* tilewidth);
				pill_count++;
			}
			if(grid[i][j] === 'P'){
				pacman_spawn_point = [i,j];
				//pacman_game_spawn_point = 
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
	console.log(pill_count);
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

// colors
var blue = 0x0000FF;
var red = 0xFF0000;
var white = 0xFFFFFF;
var green = 0x00FF00;

var lighting_color = white;


var lights = [];
// Ljósgjafinn er í miðri sólinni ( í (0, 0, 0) )
const light = new THREE.PointLight(lighting_color, 3 );
light.position.set( 100, 100, 100 );
scene.add(light)
const light_A = new THREE.PointLight(lighting_color,3);
light_A.position.set(-100, 100, 100);
scene.add(light_A);

const light_B = new THREE.PointLight(lighting_color,3);
light_B.position.set(100, 100, -100);
scene.add(light_B);

const light_C = new THREE.PointLight(lighting_color,3);
light_C.position.set(100, 100, -100);
scene.add(light_C);

console.dir(light_C);


const pointLightHelper = new THREE.PointLightHelper( light, 1 );

const pointLightHelper2 = new THREE.PointLightHelper( light_C, 1 );

lights.push([light, light_A, light_B, light_C]);

function end_game_win() {
    canvas.hidden = true;
    end_canvas.hidden = false;
    pac_lives.hidden = true;
    pac_lives_label.hidden = true;

    var ctx = end_canvas.getContext("2d");
    ctx.fillStyle = '#ff0000';
    ctx.font = '50px serif';
    ctx.fillText('WINNER !', 500, 300);
}


function end_game_lose() {
    canvas.hidden = true;
    end_canvas.hidden = false;
    pac_lives.hidden = true;
    pac_lives_label.hidden = true;

    var ctx = end_canvas.getContext("2d");
    ctx.fillStyle = '#ff0000';
    ctx.font = '50px serif';
    ctx.fillText('GAME OVER !', 500, 300);
}

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


function add_pill(x_position, z_position){
	const pill_obj = new THREE.Object3D();
	scene.add(pill_obj);

	pill_geo = new THREE.SphereGeometry( 0.5, 32, 16 );
	pill_mat = new THREE.MeshPhongMaterial({color: 0xffffff});
	pill = new THREE.Mesh(pill_geo, pill_mat);

	pill_obj.add(pill);
	pill_obj.isPill = true;
	pill_obj.position.set(x_position, 5, z_position);
}

function add_big_pill(x_position, z_position){
	const big_pill_obj = new THREE.Object3D();
	scene.add(big_pill_obj);

	big_pill_geo = new THREE.SphereGeometry( 1.5, 32, 16 );
	big_pill_mat = new THREE.MeshPhongMaterial({color: 0xffffff});
	big_pill = new THREE.Mesh(big_pill_geo, big_pill_mat);

	big_pill_obj.add(big_pill);
	big_pill_obj.isBigPill = true;
	big_pill_obj.position.set(x_position, 5, z_position);
}

function check_level_win(){
	console.log(pills_eaten);
	console.log(pill_count);
	if(pill_count != 0 && pills_eaten == pill_count){
		console.log("level complete");
		end_game_win();
	}
}


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

	const eye_geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
	const eye_mat = new THREE.MeshPhongMaterial({color: 0x000000});
	const eye_1 = new THREE.Mesh(eye_geo, eye_mat);
	//eye.position.set()
	const eye_2 = eye_1.clone();
	eye_1.position.set(2.4,2.4,2.4);
	eye_2.position.set(2.4,-2.4,2.4);
	pac_obj.add(eye_1);
	pac_obj.add(eye_2);

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

function update_pacman(delta, now){
	var _lookAt = new THREE.Vector3();
    pacman.up.copy(pacman.direction).applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2);
    pacman.lookAt(_lookAt.copy(pacman.position).add(Y_UP_DIRECTION));

    //power down pacman if rush over
    if (pacman_powerd_up && now - pacman.power_up_time > 10000) {
                power_down_pacman();
    }

    if(keys_pressed['87']){ // w

		//pacman.translateOnAxis(pac_forward_vec, PAC_SPEED * delta); // change to pac-direction
		pacman.translateOnAxis(pac_forward_vec, PAC_SPEED * delta * PAC_SPEED_MULTIPLIER);

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
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, Math.PI / 2 * PAC_ROT_SPEED * delta);
    }
    if (keys_pressed['68']) { // d
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2 * PAC_ROT_SPEED * delta);
    }

	// check for skull collision
	scene.children.forEach(function(object){

		if(object.isSkull === true){

			if(distance(pacman, object) < correction_delta + SKULL_RAD){
				console.log("SKULL COLLISION")
				// pacman lose life + respawn if appropriate
				if(pacman_powerd_up){ // eating skull
					scene.remove(object);
					return;
				}

				pacman_lives--;
				pac_lives.innerHTML = pacman_lives;
				if(pacman_lives <= 0){end_game_lose();};

				pacman.position.set(
					grid_to_game(pacman_spawn_point[0]),
					5,
					grid_to_game(pacman_spawn_point[1])
					);
				return;
			}

		}
		// pills
		if(object.isPill === true){

			if(distance(pacman, object) < correction_delta){
				console.log("Pill COLLISION")
				// disapear pill
				scene.remove(object);
				pills_eaten++;
				check_level_win();
				return;
				// effects if any
			}

		}
		// big pills
		if(object.isBigPill === true){

			if(distance(pacman, object) < correction_delta){
				console.log("Big Pill COLLISION")
				// disapear Big pill
				scene.remove(object);
				pills_eaten++;
				check_level_win();
				power_up_pacman();
				pacman.power_up_time = now;
				return;
				// effects
			}

		}	

	})


} // update_pacman

function power_up_pacman(){
	light_A.color.setHex(red);
	light.color.setHex(red);
	light_B.color.setHex(red);
	light_C.color.setHex(red);
	pacman_powerd_up = true;
	PAC_SPEED_MULTIPLIER = 1.5;
}

function power_down_pacman(){
	light_A.color.setHex(lighting_color);
	light.color.setHex(lighting_color);
	light_B.color.setHex(lighting_color);
	light_C.color.setHex(lighting_color);
	pacman_powerd_up = false;
	PAC_SPEED_MULTIPLIER = 1;
}

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
	update_pacman(timeDelta, now);
	update_skulls(timeDelta, now);

    controls.update();
	renderer.render( scene, camera );
	//console.log(keys_pressed);
};

animate();
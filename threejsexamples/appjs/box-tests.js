
var PAC_SPEED = 20;
var X_DIRECTION = new THREE.Vector3(1, 0, 0);
var Y_UP_DIRECTION = new THREE.Vector3(0,1,0);

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
//box.add(axes);
camera.lookAt(box);

	// grid should be square
grid = [  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XX....X.................S...XX',
		  'XX.XX.X.XX.XXXX.XXXX.XXXXXX.XX',
		  'XX.XX.X.XX.XXXX.XXXX.XXXXXX.XX',
		  'XX.XX.X.XX.X............XX..XX',
		  'XX....S......XXXXXXXXXX....XXX',
		  'XX.XXXXX.XXX.XXXXX......XX..XX',
		  'XX.XXXXX.XXX....XX.XXXX....XXX',
		  'XX.XXXXX...XXXX.XX.XXXX.XX.XXX',
		  'XX.......X..P...........XX.XXX',
		  'XXXXX.XXXX.XXXX.XXX.XXX.XX.XXX',
		  'XXX.....XX..XXX.XXX.XXX.XX.XXX',
		  'XX..XXX.XXX.....S....XX..X..XX',
		  'XX.XX.S...X.XXX.XX.XXXXX.XX.XX',
		  'XX.XX.X.XXX.XXX.XX...........X',
		  'XX.XX.X.XXX.XXX.XX.XXXXX.XXX.X',
		  'XX....X.....XXX..............X',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' ]

middle_z = grid[0].length/2;
middle_x = grid.length/2;


function addmap(scene, grid, tile){ // tile is the obj to clone from
	tilewidth = tile.geometry.parameters['width'];
	tiles = []
	for(let i = grid.length -1; i > -1; i--){
		for(let j = grid.length -1 ; j > -1; j--){
			if(grid[i][j] !== 'X'){
				tiles.push([i - middle_x, j - middle_z]);
			}
			if(grid[i][j] === 'P'){
				pacman = add_pacman((i - middle_x) * tilewidth, (j - middle_z)* tilewidth);
			}
			if(grid[i][j] === 'S'){
				add_skull((i - middle_x) * tilewidth, (j - middle_z)* tilewidth);
			}
			
		}
	}
	for(let i = 0; i < tiles.length; i++){

		tile[i] = box.clone();
		tile[i].position.set(tiles[i][0] * tilewidth, 0, tiles[i][1] * tilewidth);
		scene.add(tile[i]);
	}

	return pacman; // perhaps return array here of obj
}

pacman = addmap(scene, grid, box);
// let[pacman, skulls, ... ] = addmap(scene, grid, box);
//add_pacman(0,0);
pacman.add(axes);

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
scene.add( pointLightHelper );

const pointLightHelper2 = new THREE.PointLightHelper( green_light, 1 );
scene.add( pointLightHelper2 );

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
	pac_obj.direction = new THREE.Vector3(1, 0, 0); // not working yet
	// const arrowHelper = new THREE.ArrowHelper( pac_obj.direction, pac_obj, 50 );
	// scene.add( arrowHelper );

	return pac_obj;
}

function add_skull(x_position, z_position){
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.load('resources/models/skull/skull.mtl', (mtl) => {
              mtl.preload();
              const objLoader = new THREE.OBJLoader();
              objLoader.setMaterials(mtl);
              objLoader.load('resources/models/skull/skull.obj', (skull) => {
                skull.position.y = 2;
                skull.position.x = x_position;
                skull.position.z = z_position;
                skull.rotation.x = Math.PI * -.5;
                skull.scale['x'] = 0.3;
                skull.scale['y'] = 0.3;
                skull.scale['z'] = 0.3;
                scene.add(skull);
              });
            });

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
    //pacman.up.copy(pacman.direction).applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2);
    //pacman.lookAt(_lookAt.copy(pacman.position).add(Y_UP_DIRECTION));

    //console.log(pacman.direction); direction not changing
    // perhaps try completely different approach to turning obj, and changing direction
	if(keys_pressed['87']){ // w
		//console.log("w pressed")
		pacman.translateOnAxis(pacman.direction, PAC_SPEED * delta); // change to pac-direction
	}
    if (keys_pressed['65']) { // a
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, Math.PI / 2 * delta);
    }
    if (keys_pressed['68']) { // d
        pacman.direction.applyAxisAngle(Y_UP_DIRECTION, -Math.PI / 2 * delta);
    }

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

    controls.update();
	renderer.render( scene, camera );
	//console.log(keys_pressed);
};

animate();
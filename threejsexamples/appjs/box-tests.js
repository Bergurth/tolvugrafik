            // Ná í striga og skilgreina birti
           const canvas = document.querySelector('#c');
	       const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
            
            // Skilgreina myndavél og staðsetja hana
	       const camera = new THREE.PerspectiveCamera( 60, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 );
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
            box.add(axes);
            camera.lookAt(box);

            var map1 = [[0,0]

            
            			,[0,1],[1,1],[1,2],[1,3],[1,4],

            			[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],

            [-3,3],	[-2,3],[-1,3],[0,3],[2,3],[3,3],[4,3],[5,3],

            [1,0], [2,0], [3,0], [4,0], [5,0], [5,1], [5,2],

            [3,1], [3,2],

			[-3,5],[-2,5],[-1,5],[0,5],

			[-3,4],[-3,2],[-3,1],

			[-2,1],[-1,1],[0,1],

			[-3,0],

			[0,-1],[0,-2],[0,-3],[0,-4],
			
			[1,-4],[2,-4],[3,-4],[4,-4],[5,-4],

			[5,-3],[5,-2],[5,-1],

			[1,-2],[2,-2],[3,-2],[4,-2],

			[0,-2],[-1,-2],[-2,-2],[-3,-2],

			[-3,-1],

			[-3,-2],[-3,-3],[-3,-4],

			[-2,-4],[-1,-4]

            ]

            //console.dir(box);
            //console.log(box.geometry.parameters['width']);
            

            function addmap(scene, map, tile){ // tile is the obj to clone from
            	tilewidth = tile.geometry.parameters['width'];
            	tiles = []
            	for(let i = 0; i < map.length; i++){
            		tile[i] = box.clone();
            		tile[i].position.set(map[i][0] * tilewidth, 0, map[i][1] * tilewidth);
            		scene.add(tile[i]);
            	}
            }

            addmap(scene, map1, box);


            //scene.add(box);

            //box2 = box.clone();
            //box2.position.set(10,0,0);
            //scene.add(box2);






            // Ljósgjafinn er í miðri sólinni ( í (0, 0, 0) )
            const light = new THREE.PointLight( 0xFFFFFF, 3 );
            scene.add(light)


	        // Hreyfifall
			const animate = function ( time ) {
                //time *= 0.001;


				requestAnimationFrame( animate );

                controls.update();
				renderer.render( scene, camera );
			};

			animate();
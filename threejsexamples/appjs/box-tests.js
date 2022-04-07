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

            const pac_obj = new THREE.Object3D();
            scene.add(pac_obj);

            // PAC-man
			const pac_geo = new THREE.SphereGeometry( 4, 32, 16, Math.PI, Math.PI * 11/6 );
			const pac_mat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
			const pac = new THREE.Mesh( pac_geo, pac_mat );
			pac.position.set(0,5,0);
			pac.rotation.x = (Math.PI / 2);
			scene.add( pac );

			// inside PAC-man
			const black_pac_geo = new THREE.SphereGeometry( 3.98, 32, 16, Math.PI, Math.PI * 11/6 );
			const black_pac_mat = new THREE.MeshBasicMaterial( { color: 0x000000 ,side: THREE.DoubleSide } );
			const black_pac = new THREE.Mesh( black_pac_geo, black_pac_mat );
			black_pac.position.set(0,5,0);
			black_pac.rotation.x = (Math.PI / 2);
			scene.add( black_pac );


			pac_obj.add(pac);
			pac_obj.add(black_pac);

			// pac_obj.position.set(0,0,10); // This works 

            // Ljósgjafinn er í miðri sólinni ( í (0, 0, 0) )
            const light = new THREE.PointLight( 0xFFFFFF, 3 );
            light.position.set( 50, 50, 50 );
            scene.add(light)

            const pointLightHelper = new THREE.PointLightHelper( light, 1 );
			scene.add( pointLightHelper );


	        // Hreyfifall
			const animate = function ( time ) {
                //time *= 0.001;


				requestAnimationFrame( animate );

                controls.update();
				renderer.render( scene, camera );
			};

			animate();
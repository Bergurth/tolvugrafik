            // Ná í striga og skilgreina birti
           const canvas = document.querySelector('#c');
	       const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
            
            // Skilgreina myndavél og staðsetja hana
	       const camera = new THREE.PerspectiveCamera( 60, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 );
	       camera.position.set(0, 0, 30);

            // Bæta við músarstýringu
            const controls = new THREE.OrbitControls( camera, canvas );

            // Skilgreina sviðsnetið
	       const scene = new THREE.Scene();
            scene.background = new THREE.Color( 0x333333 );

            // Sólkerfið...
            
            // Rúmfræðin fyrir hnettina
            const sphereGeometry = new THREE.SphereGeometry( 1, 100, 100 );

            // Smíða sólkerfi
            const solarSystem = new THREE.Object3D();
            scene.add(solarSystem);

            // Bæta hnitakerfisásum við sólkerfið
            const axes = new THREE.AxesHelper( 15 );
            solarSystem.add(axes);

            // Smíða sólina og bæta í sólkerfið
            const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
            const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
            sunMesh.scale.set(6, 6, 6);
            solarSystem.add(sunMesh);

            // Sporbaugur jarðar er sérstakur hlutur í sólkerfinu
            const earthOrbit = new THREE.Object3D();
            solarSystem.add(earthOrbit);

            //-----
            const loader = new THREE.TextureLoader();

            // Hlöðum inn mynstrinu...
            const texture = loader.load('resources/images/earth_atmos_4096.jpg');

            // Notum nú bara einfalda áferð án ljósgjafa og tilgreinum mynstrið
            //const material = new THREE.MeshBasicMaterial({ map: texture });

            //----



            // Smíða jörðina og setja í sporbaug jarðar
            //const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244, map:texture});
            const earthMaterial = new THREE.MeshPhongMaterial({map:texture});
            const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
            earthMesh.position.x = 20;
            earthOrbit.add(earthMesh);

            // Sporbaugur tunglsins er sérstakur hlutur í sporbaug jarðar
            const moonOrbit = new THREE.Object3D();
            earthMesh.add(moonOrbit);

            // Smíða tunglið og setja í sporbaug tunglsins
            const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
            const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
            moonMesh.position.x = 2.5;
            moonMesh.scale.set(.3, .3, .3);
            moonOrbit.add(moonMesh);

            // Ljósgjafinn er í miðri sólinni ( í (0, 0, 0) )
            const light = new THREE.PointLight( 0xFFFFFF, 3 );
            scene.add(light);
            

            // Hreyfifall
			const animate = function ( time ) {
                time *= 0.001;

                earthOrbit.rotation.y = time / 5;
	            earthMesh.rotation.y = - time;
                moonOrbit.rotation.y = 6*time;

				requestAnimationFrame( animate );

                controls.update();
				renderer.render( scene, camera );
			};

			animate();

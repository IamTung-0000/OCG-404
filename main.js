let camera, scene, renderer;
let last_cameraPositionX;
let frontLight, leftLight, rightLight, topLight,ambientLight;
const defaultCameraPosition = new THREE.Vector3( 0.9413746101665292, 1.8353249151318962, 2.1510883355862758 );
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );

renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
const controls = new THREE.OrbitControls( camera, renderer.domElement );


init();
animate();
render();


function Light() {

    frontLight = new THREE.SpotLight( 0xffffff );
    frontLight.position.set( 0, 0, -600 );
    scene.add( frontLight );

    leftLight = new THREE.SpotLight( 0xffffff );
    leftLight.position.set( -600, 0, 0 );
    scene.add( leftLight );

    rightLight = new THREE.SpotLight( 0xffffff );
    rightLight.position.set( 600, 0, 0 );
    scene.add( rightLight );

    topLight = new THREE.SpotLight( 0xffffff );
    topLight.position.set( 0, 600, 200 );
    topLight.intensity = 3;
    scene.add( topLight );


    const front_helper = new THREE.SpotLightHelper( frontLight, 20 );
    scene.add( front_helper );

    // const left_helper = new THREE.SpotLightHelper( leftLight, 20 );
    // scene.add( left_helper );


    // const right_helper = new THREE.SpotLightHelper( rightLight, 20 );
    // scene.add( right_helper );

    // const top_helper = new THREE.SpotLightHelper( topLight, 20 );
    // scene.add( top_helper );


    ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

}

function onMouseMove( event ) {

	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.y );
    // console.log(mouse.x);
    // console.log(mouse.y);

}



function init() {
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera.position.set(defaultCameraPosition.x,defaultCameraPosition.y,defaultCameraPosition.z);

    scene = new THREE.Scene();

    const loader = new THREE.GLTFLoader().setPath( 'Models/' );
						loader.load( '404.gltf', function ( gltf ) {
							scene.add( gltf.scene );
                            console.log(gltf);
                            gltf.scene.position.y = -1;
							render();
						} );

    // renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // const controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );

    controls.update();

    document.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'resize', onWindowResize );


    Light();

}

function onWindowResize() {
    
    const width = window.innerWidth;
	const height = window.innerHeight;

    windowHalf.set( width / 2, height / 2 );

    camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
    render();
}


function animate() {

    target.x = ( 1 - mouse.x ) * 0.001;
    target.y = ( 1 - mouse.y ) * 0.001;
  

    controls.target.set( target.x, target.y, - 0.2 );

    // console.log(target.x);
    // console.log(target.y);

    // document.addEventListener("mouseleave", function(event){

    //     if(event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight))
    //     {
    //        console.log("I'm out");
    //        controls.target.set( 0, 0, - 0.2 );
    //     }
    //   });
    
    controls.update();

    requestAnimationFrame( animate );

    render();

}


function render() {

    if (camera.position.x != last_cameraPositionX) {
        console.log(camera.position);
        last_cameraPositionX = camera.position.x;
    }

    renderer.render( scene, camera );

}
let camera, scene, renderer;
let clock;
let last_cameraPositionX;
let frontLight, leftLight, rightLight, topLight,ambientLight, light;
const defaultCameraPosition = new THREE.Vector3( 0.766, 1.392, 1.603 );
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );

renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
const controls = new THREE.OrbitControls( camera, renderer.domElement );
let model;


init();
animate();
render();


function Light() {

    light = new THREE.PointLight(0xffffff);
    // We want it to be very close to our character
    light.position.set(-5,-2,3);
    light.intensity = 0.1;
    scene.add(light);

    const light_helper = new THREE.PointLightHelper( light, 1 );
    scene.add( light_helper );

    topLight = new THREE.SpotLight( 0x005BFF );
    topLight.position.set( 0, 600, 200 );
    topLight.intensity = 10;
    scene.add( topLight );

    // const top_helper = new THREE.SpotLightHelper( topLight, 20 );
    // scene.add( top_helper );



    // ambientLight = new THREE.AmbientLight( 0x005BFF );
    // ambientLight.intensity = 5;
    // scene.add( ambientLight );

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
                            model = gltf;
							scene.add( model.scene );
                            model.scene.position.y = -1;   
                            // console.log(model.scene);   

                            var uniforms = THREE.UniformsUtils.merge(
                                [THREE.UniformsLib['lights'],
                                {
                                    lightIntensity: {type: 'f', value: 1.0},
                                }
                                ]
                            )
                            console.log(uniforms)

                            var material = new THREE.ShaderMaterial({
                                uniforms: THREE.UniformsUtils.merge([
                                    THREE.UniformsLib['lights'],
                                    {
                                        lightIntensity: {type: 'f', value: 0.6},
                                        textureSampler: {type: 't', value: null},
                                        color1: {
                                            value: new THREE.Color(0x005BFF) //top
                                          },
                                          color2: {
                                            value: new THREE.Color(0x00000) //bottom
                                          }
                                    }
                                ]),

                                vertexShader: `
                                varying vec2 vUv;
                                varying vec3 vecPos;
                                varying vec3 vecNormal;
                                 
                                void main() {
                                  vUv = uv;
                                  // Since the light is in camera coordinates,
                                  // I'll need the vertex position in camera coords too
                                  vecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
                                  // That's NOT exacly how you should transform your
                                  // normals but this will work fine, since my model
                                  // matrix is pretty basic
                                  vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
                                  gl_Position = projectionMatrix *
                                                vec4(vecPos, 1.0);
                                }
                                `,
                                fragmentShader: `

                                uniform vec3 color1;
                                uniform vec3 color2;

                                
                                precision highp float;
 
                                varying vec2 vUv;
                                varying vec3 vecPos;
                                varying vec3 vecNormal;
                                 
                                uniform float lightIntensity;
                                uniform sampler2D textureSampler;
                                 
                                struct PointLight {
                                    vec3 color;
                                    vec3 position; // light position, in camera coordinates
                                    float distance; // used for attenuation purposes. Since
                                                    // we're writing our own shader, it can
                                                    // really be anything we want (as long as
                                                    // we assign it to our light in its
                                                    // "distance" field
                                  };
                                   
                                  uniform PointLight pointLights[NUM_POINT_LIGHTS];
                                   
                                  void main(void) {
                                    // Pretty basic lambertian lighting...
                                    vec4 addedLights = vec4(0.0,
                                                            0.0,
                                                            0.0,
                                                            1.0);
                                    for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
                                        vec3 lightDirection = normalize(vecPos
                                                              - pointLights[l].position);
                                        addedLights.rgb += clamp(dot(-lightDirection,
                                                                 vecNormal), 0.0, 1.0)
                                                           * pointLights[l].color
                                                           * lightIntensity;
                                    }
                                    // gl_FragColor = addedLights;
                                    vec4 gradient = vec4(mix(color1, color2, vUv.y), 1.0);
                                    gl_FragColor = gradient + (addedLights - 0.2);
                                  }
                                `,
                                lights: true

                              });      
                              
                              
                            model.scene.traverse( function(node) {
                                

                                if (node.isMesh){
                                    if (node.material.name == "side") {
                                        console.log(node.material.name);
                                        node.material = material;
                                    }
                                    
                                    // node.material = material;
                                    // node.blend = 0.4;
                                    // node.opacity = 0.5;
                                    // node.transparent = true;
                                    // console.log(node.opacity);
                                }
                            });

							render();
						} );
                                         

    // renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // const controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.enabled = false;
    controls.enableDamping = true;
    // controls.enableZoom = true;
    // controls.minDistance = 2;
    // controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );

    controls.update();

    document.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'resize', onWindowResize );

    clock = new THREE.Clock();

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

    // console.log(clock.getElapsedTime());
    if (model!= null ) {
        // console.log(model.scene.children[0]);
        model.scene.children[0].position.y = Math.sin(clock.getElapsedTime()*4)*0.05;
        model.scene.children[2].position.y = Math.sin((clock.getElapsedTime()*4)-1)*0.05;
        model.scene.children[1].position.y = Math.sin((clock.getElapsedTime()*4)-2)*0.05;
        
    }



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

    
    // if (camera.position.x != last_cameraPositionX) {
    //     console.log(camera.position);
    //     last_cameraPositionX = camera.position.x;
    // }

    renderer.render( scene, camera );

}
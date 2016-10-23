'use strict';
angular.module('myApp')

//Map controller
.controller('SpaceController', function($scope, $timeout, $http) {

  $scope.map;
  $scope.iss = {};
  $scope.tweets = [];
  var counter = 0;

  // Initialization  
  $scope.$on('$viewContentLoaded', function() {
    $scope.getIssLoc();  
    $scope.getTwitterFeeds();
  })

  var scene, camera, renderer;
  var geometry, material, mesh;

  (function () {

  var webglEl = document.getElementById('webgl');

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage(webglEl);
    return;
  }

  var width  = window.innerWidth,
    height = window.innerHeight;

  // Earth params
  var radius   = 0.5,
    segments = 32,
    rotation = 6;  

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(430, width / height, 0.01, 1000);
  camera.position.z = 1.5;
  camera.position.x = 0.7;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  scene.add(new THREE.AmbientLight(0x333333));

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,3,5);
  scene.add(light);

  var sphere = createSphere(radius, segments);
  sphere.rotation.y = rotation; 
  scene.add(sphere)


    var clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds)

  var stars = createStars(90, 64);
  scene.add(stars);

  // ISS
  var cyl_material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  var cyl_width = 0.01;
  var cyl_height = 0.02;
  // THREE.CylinderGeometry(bottomRadius, topRadius, height, segmentsRadius, segmentsHeight, openEnded )
  var cylGeometry = new THREE.CylinderGeometry(cyl_width, cyl_width, cyl_height, 20, 1, false);
  // translate the cylinder geometry so that the desired point within the geometry is now at the origin
  cylGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0.8, cyl_height/1, 0 ) );
  var cylinder = new THREE.Mesh(cylGeometry, cyl_material);

  scene.add( cylinder ); 

  var controls = new THREE.TrackballControls(camera);

  webglEl.appendChild(renderer.domElement);

  render();

  function render() {
    controls.update();
    sphere.rotation.y += 0.0005;
    clouds.rotation.y += 0.0005; 
    cylinder.rotation.x = 0.5*Math.PI;   
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
        bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
        bumpScale:   0.005,
        specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
        specular:    new THREE.Color('grey')                
      })
    );
  }

  function createClouds(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),     
      new THREE.MeshPhongMaterial({
        map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
        transparent: true
      })
    );    
  }

  function createStars(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments), 
      new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'), 
        side: THREE.BackSide
      })
    );
  }

}());

  // Get twitter data 
  $scope.getTwitterFeeds = function() {

    // Initiate a call to backend
    $http.get("/api")
      .then(function(feeds) {
        $scope.tweets = feeds.data.statuses
      })
      .catch(function(err) {
        console.log('error: ', err)
      })
  }

  // Get the location of ISS
  $scope.getIssLoc = function() {

    // Initiate a call to back end
    $http.get("/issLocation")
      .then(function(location) {
        $scope.iss.location = location.data.iss_position;
        
      })
      .catch(function(err) {
        console.log('error: ', err)
      })
  }

  // Run these periodically
  setInterval(function() {
    $scope.getIssLoc();
  }, 4000)

  setInterval(function() {
    $scope.getTwitterFeeds();
  }, 30000)
  
});
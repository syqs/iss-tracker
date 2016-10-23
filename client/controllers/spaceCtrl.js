'use strict';
angular.module('myApp')

//Map controller
.controller('SpaceController', function($scope, $timeout, $http, $mdToast) {

  $scope.map;
  $scope.iss = {};
  $scope.tweets = [];
  var counter = 0;

  // Initialization  
  $scope.$on('$viewContentLoaded', function() {
    $scope.getIssLoc(); 
    $scope.getTwitterFeeds();
    $timeout(function() {
      $scope.showSimpleToast();
    }, 2000)
  })

  $scope.showTweets = false;
  $scope.closeTweets = function(){
    console.log($scope.showTweets)
    $scope.showTweets = ($scope.showTweets) ? false : true;
  }
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
      });
  }

  // Run these periodically
  setInterval(function() {
    $scope.getIssLoc();
  }, 4000);

  setInterval(function() {
    $scope.getTwitterFeeds();
  }, 30000);

  // Toasts

  // Position:
  var last = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $scope.toastPosition = angular.extend({}, last);

  $scope.getToastPosition = function() {
    sanitizePosition();

    return Object.keys($scope.toastPosition)
      .filter(function(pos) {
        return $scope.toastPosition[pos];
      })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.toastPosition;

    if (current.bottom && last.top) current.top = false;
    if (current.top && last.bottom) current.bottom = false;
    if (current.right && last.left) current.left = false;
    if (current.left && last.right) current.right = false;

    last = angular.extend({}, current);
  }

  $scope.showSimpleToast = function() {
    var pinTo = $scope.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
      .textContent('Click and drag to look around')
      .position(pinTo)
      .hideDelay(3000)
    );
  };

  // Webgl shennanigans 
  var scene, camera, renderer;
  var geometry, material, mesh;

  (function() {

    var webglEl = document.getElementById('webgl');

    if (!Detector.webgl) {
      Detector.addGetWebGLMessage(webglEl);
      return;
    }

    var width = window.innerWidth,
      height = window.innerHeight;

    // Earth params
    var radius = 0.5,
      segments = 32,
      rotation = 6;

    var scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0x000000, 3500, 15000);
    scene.fog.color.setHSL(0.51, 0.4, 0.01);

    // lights
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.05);
    dirLight.position.set(0, -1, 0).normalize();
    scene.add(dirLight);
    dirLight.color.setHSL(0.1, 0.7, 0.5);

    // lens flares
    var textureLoader = new THREE.TextureLoader();
    var textureFlare0 = textureLoader.load("textures/lensflare/lensflare0.png");
    var textureFlare2 = textureLoader.load("textures/lensflare/lensflare2.png");
    var textureFlare3 = textureLoader.load("textures/lensflare/lensflare3.png");

    addLight(0.995, 0.5, 0.9, 2, 10, -15);

    function addLight(h, s, l, x, y, z) {
      var light = new THREE.PointLight(0xffffff, 1.5, 2000);
      light.color.setHSL(h, s, l);
      light.position.set(x, y, z);
      scene.add(light);
      var flareColor = new THREE.Color(0xffffff);
      flareColor.setHSL(h, s, l + 0.5);
      var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
      lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
      lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
      lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
      lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
      lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
      lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
      lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
      lensFlare.customUpdateCallback = lensFlareUpdateCallback;
      lensFlare.position.copy(light.position);
      scene.add(lensFlare);
    }

    function lensFlareUpdateCallback(object) {
      var f, fl = object.lensFlares.length;
      var flare;
      var vecX = -object.positionScreen.x * 2;
      var vecY = -object.positionScreen.y * 2;
      for (f = 0; f < fl; f++) {
        flare = object.lensFlares[f];
        flare.x = object.positionScreen.x + vecX * flare.distance;
        flare.y = object.positionScreen.y + vecY * flare.distance;
        flare.rotation = 0;
      }
      object.lensFlares[2].y += 0.025;
      object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
    }

    var camera = new THREE.PerspectiveCamera(430, width / height, 0.01, 1000);
    camera.position.z = 1.5;
    camera.position.x = 0.7;
    var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setClearColor( scene.fog.color );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(width, height);

    scene.add(new THREE.AmbientLight(0x333333));

    // var light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(5, 3, 5);
    // scene.add(light);

    var sphere = createSphere(radius, segments);
    sphere.rotation.y = rotation;
    scene.add(sphere)

    var clouds = createClouds(radius, segments);
    clouds.rotation.y = rotation;
    scene.add(clouds)

    var stars = createStars(90, 64);
    scene.add(stars);

    // ISS
    var cyl_material = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    var cyl_width = 0.01;
    var cyl_height = 0.02;

    // THREE.CylinderGeometry(bottomRadius, topRadius, height, segmentsRadius, segmentsHeight, openEnded )
    var cylGeometry = new THREE.CylinderGeometry(cyl_width, cyl_width, cyl_height, 20, 1, false);

    // translate the cylinder geometry so that the desired point within the geometry is now at the origin
    cylGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.8, 0.38, -0.52));
    var cylinder = new THREE.Mesh(cylGeometry, cyl_material);

    scene.add(cylinder);

    var controls = new THREE.TrackballControls(camera);


    webglEl.appendChild(renderer.domElement);

    render();

    function render() {
      controls.update();
      sphere.rotation.y -= 0.0003;
      sphere.rotation.x -= 0.00004;
      clouds.rotation.y -= 0.0003;
      cylinder.rotation.x += 0.00007 * Math.PI;
      cylinder.rotation.y += 0.00007 * Math.PI;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }

    function createSphere(radius, segments) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(radius, segments, segments),
        new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
          bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
          bumpScale: 0.005,
          specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
          specular: new THREE.Color('grey')
        })
      );
    }

    function createClouds(radius, segments) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(radius + 0.003, segments, segments),
        new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'),
          transparent: true
        })
      );
    }

    function createStars(radius, segments) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(radius, segments, segments),
        new THREE.MeshBasicMaterial({
          map: THREE.ImageUtils.loadTexture('images/sky.jpg'),
          side: THREE.BackSide
        })
      );
    }

  }());

});
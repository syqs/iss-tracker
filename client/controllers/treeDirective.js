'use strict';
angular.module('myApp')
.directive('diThreeJsViewer', function() {

    function createThreeJsCanvas(parentElement, object) {
        var width = 400;
        var height = 400;
        
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(35, width / height, 2.109, 213.014);
    
        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor( 0xffffff, 1);
    
        parentElement.append(renderer.domElement);
    
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 20;
        //camera.up = new THREE.Vector3(0, 0, 1);
    
        camera.lookAt(new THREE.Vector3(0.000, 0.000, 0.000)); // look at the center 
    
        
        var light = new THREE.PointLight(0x404040, 2);
        light.position.set(20, 20, 0);
        scene.add(light);
        light = new THREE.PointLight(0x404040, 2);
        light.position.set(20, 0, 20);
        scene.add(light);
        light = new THREE.PointLight(0x404040, 2);
        light.position.set(0, 20, 20);
        scene.add(light);

        light = new THREE.AmbientLight(0x404040);
        scene.add(light);


        // add object    
        scene.add(object);
    
        var render = function() {
            requestAnimationFrame(render);
    
            //model.rotation.y += 0.01;
    
            renderer.render(scene, camera);
        };
    
        render();        
    }

    function link(scope, element, attrs) {
    
        scope.$watch("threeJsObject", function(){
            
            if (scope.threeJsObject) {
              createThreeJsCanvas(element, scope.threeJsObject);
            }
            
        }, false);
    }

    return {
        restrict: 'E',
        scope: {
          threeJsObject: '='
        },
        link: link
    };
});
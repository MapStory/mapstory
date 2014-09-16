angular.module('storylayers', ['storylayers.directives','storylayers.services','storylayers.controllers','ui.bootstrap', 'ui-rangeSlider']);

angular.module('storylayers.directives', [])
    .directive('clickValue', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, element, attrs, ngModel) {
                $scope.$on(attrs.ngModel, function(event, args) {
                    console.log('The new thing: ' + args[0]);
                    event.stopPropagation();
                    ngModel.$setViewValue(args[0], event);
                    console.log(ngModel.$viewValue);
                    console.log(ngModel.$modelValue);
                });
            }
        }
    })
    .directive('hoverSet', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mouseover', function(event) {
                    console.log(element.attr('src'));
                    //console.log(attrs.param);
                    $scope.$emit(attrs.param,[element.attr('src')]);
                });
            }
        }
    })
    .directive('clickSet', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mousedown', function(event) {
                    //console.log(element.text());
                    //console.log(attrs.param);
                    $scope.$emit(attrs.param,[element.text()]);
                });
            }
        }
    })
    .directive('clickImg', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mousedown', function(event) {
                    console.log(element.attr('src'));
                    //console.log(attrs.param);
                    $scope.$emit(attrs.param,[element.attr('src')]);
                });
            }
        }
    })
    .directive('clickColor', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.on('mousedown', function(event) {
                    console.log(element.css('background-color'));
                    //console.log(attrs.param);
                    $scope.$emit(attrs.param,[element.css('background-color')]);
                });
            }
        }
    })
    .directive('noClose', function() {
        return {
            link: function($scope, $element) {
                $element.on('click', function($event) {
                    console.log("Dropdown should not close");
                    $event.stopPropagation();
                });
            }
        };
});

angular.module('storylayers.services', []).factory('drawSpace', function () {
    var canvas = document.getElementById('layerspace');
    if(!canvas) {return;}
    var context = canvas.getContext('2d');
    
    var layerStyles = [];
    
    context.fillStyle = 'Blue';
    context.strokeStyle = 'Black';
    context.setLineDash([5]);
    
    function drawCircle(point, size) {
        context.beginPath();
        context.arc(point.x, point.y, size/2, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
    }
    
    function drawSquare(point, size) {
        context.beginPath();
        context.rect(point.x - size / 2, point.y - size / 2, size, size);
        context.fill();
        context.stroke();
    }
    
    function drawTriangle(point, size) {
        context.beginPath();
        context.moveTo(point.x, point.y - 0.57735 * size);
        context.lineTo(point.x + size / 2, point.y + 0.288675 * size);
        context.lineTo(point.x - size / 2, point.y + 0.288675 * size);
        context.closePath();
        context.fill();
        context.stroke();
    }
    
    function changeStyle(layer) {
        context.fillStyle = layerStyles[layer].fill;
        context.strokeStyle = layerStyles[layer].stroke;
        context.globalAlpha = layerStyles[layer].alpha;
    }
    
    var drawSpace = {
        addLayerStyle: function(numLayers) {
            for(i = 0; i < numLayers; i++) {
                layerStyles.push({fill: 'Blue', stroke: 'Black', size: 1, symbol: 'Circle', alpha: 1});
            }
        },
        
        changeStyle: function (property, value, layer) {
            switch(property) {
                    case 'Fill':
                        layerStyles[layer].fill = value;
                        break;
                    case 'Alpha':
                        layerStyles[layer].alpha = value;
                        break;
                    case 'Symbol':
                        layerStyles[layer].symbol = value;
                        break;
                    case 'Size':
                        layerStyles[layer].size = value;
                        break;
            }
        },
        
        drawMultiPoint: function (coordinates, size, layer) {
            changeStyle(layer);
            
            for(i = 0; i < coordinates.length; i++) {
                switch(layerStyles[layer].symbol) {
                        case 'Circle':
                            drawCircle({x: coordinates[i][0], y: coordinates[i][1]}, 30 * layerStyles[layer].size);
                            break;
                        case 'Square':
                            drawSquare({x: coordinates[i][0], y: coordinates[i][1]}, 30 * layerStyles[layer].size);
                            break;
                        case 'Triangle':
                            drawTriangle({x: coordinates[i][0], y: coordinates[i][1]}, 30 * layerStyles[layer].size);
                            break;
                }
            }
        },
        
        drawMultiPolygon: function(coordinates, layer) {
            changeStyle(layer);
            
            var scale = 10;
            
            for(i = 0; i < coordinates.length; i++) {
                context.beginPath();
                context.moveTo(coordinates[i][0][0][0] * scale, coordinates[i][0][0][1] * scale);
                for(j = 1; j < coordinates[i][0].length; j++) {
                    context.lineTo(coordinates[i][0][j][0] * scale, coordinates[i][0][j][1] * scale);
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
        },
        
        drawMultiLine: function(coordinates, layer) {
            changeStyle(layer);
            
            var scale = 10;
            
            for(i = 0; i < coordinates.length; i++) {
                context.beginPath();
                context.moveTo(coordinates[i][0][0] * scale, coordinates[i][0][1] * scale);
                for(j = 1; j < coordinates[i].length; j++) {
                    context.lineTo(coordinates[i][j][0] * scale, coordinates[i][j][1] * scale);
                }
                context.stroke();
            }
        },
        
        clear: function () {
            context.clearRect(0,0,canvas.width,canvas.height);
        }
    };
    
    return drawSpace;
})
.factory('dataLoader', function($http) {
    var dataLoader = {
        load: function (filename) {
            return $http.get(filename);
        }
    };
    
    return dataLoader;
})
.factory('SLDgenerator', function() {
    /*
        process for generating SLDs from style objects:
        1. define a filter (optional?)
        2. define a rule - in the 'symbolizer' part, this is the where the style properties actually go
        3. define a style based on the previous rule/rules
        4. write the style with namedLayers --> name and userStyles. userStyles gets the array of previously defined styles
    */
    
    var SLDgenerator = {
        objToSLD: function() {
            var symbolHash = {'Polygon' : {
                fillColor: '#0000ff',
                strokeWidth: '5',
                strokeColor: '#ff0000'
            }};
            
            var rule = new OpenLayers.Rule({
                symbolizer: symbolHash
            });
            
            var s = new OpenLayers.Style("CoolStyle", {
                rules: [rule]
            });
            
            var format = new OpenLayers.Format.SLD();
            
            format.stringifyOutput = false;
            
            return format.write({
                namedLayers: [{
                    name: 'CoolLayer',
                    userStyles: [s]
                }]
            });
        }
    };
    
    return SLDgenerator;
})
.factory('styleModel', function() {
    var layerStyles = [];
    
    function addLayerStyle(layerName, geomType) {
        layerStyles.push(getLayerStyleTemplate(layerName, geomType));
    }
    
    function preProcessStyle(styleDescriptor) {
        styleDescriptor.fillOpacity = styleDescriptor.fillOpacity / 100;
        styleDescriptor.strokeOpacity = styleDescriptor.strokeOpacity / 100;
        styleDescriptor.fontOpacity = styleDescriptor.fontOpacity / 100;
    }
    
    var styleModel = {
        addLayers: function(layers) {
            var i = 0;
            
            for(i = 0; i < layers.length; i++) {
                addLayerStyle(layers[i].name, layers[i].geometry.type);
            }
        },
        
        updateStyle: function(property, value, layer) {
            layerStyles[layer].style[property] = value + '';
            console.log(layerStyles[0]);
            console.log(layerStyles[1]);
        },
        
        getLayerStyleTemplate: function(layerName, geomType) {
            return {
                    graphicName: 'Circle',
                    externalGraphic: remoteLink + 'style_editor/icons/' + 'circle-18.svg',
                    pointRadius: 10, 
                    fillColor: 'rgb(205, 92, 92)', 
                    fillOpacity: 54,
                    fillType: 'Solid',
                    strokeDashstyle: 'Solid',
                    strokeWidth: 10,
                    strokeColor: 'rgb(205, 92, 92)',
                    strokeOpacity: 54,
                    label: 'Choose',
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fontStyle: 'bold',
                    fontColor: 'rgb(0, 0, 0)',
                    fontWeight: '200',
                    fontOpacity: 100,
                    classify: {}
            };
        }
    };
    
    return styleModel;
});

angular.module('storylayers.controllers', ['storylayers.services'])
    .controller('drawCtrl', ['$scope', 'drawSpace', 'dataLoader', 'SLDgenerator','styleModel', function ($scope, drawSpace, dataLoader, SLDgenerator, styleModel) {
        
        var mockup = false;
        
        $scope.layers = [];
        
        $scope.beopen = false;
        
        dataLoader.load('https://dl.dropboxusercontent.com/u/63253018/TestData.json').success(function(data) {
            $scope.layers = data.layers;
            processLayers();
            drawLayers();
            //styleModel.addLayers($scope.layers);
        });
        
        dataLoader.load('https://dl.dropboxusercontent.com/u/63253018/styles.json').success(function(data) {
            $scope.presets = data;
        });
        
        $scope.colorList = [['indianred','Red'],['skyblue','Sky'],['yellowgreen','Lime'],['gold','Gold'],['plum','Lilac'],
                            ['salmon','Salmon'],['cornflowerblue','Cornflower'],['darkgray','Steel'],['lightgreen','Mint'],
                            ['darkseagreen','Sea'],['palevioletred','Plum'],['deepskyblue','Turquoise'],['tomato','Tomato'],
                            ['silver','Gainsboro'],['burlywood','Hazel'],['cornsilk','Cream'],['lavender','Lavender'],['olive','Olive'],
                            ['yellow','Lemon'],['steelblue','Navy']];
        
        var preImgList = ['circle-18.svg', 'square-18.svg', 'triangle-18.svg', 'heart-18.svg', 'star-18.svg', 
                          'marker-18.svg', 'park-18.svg', 'lodging-18.svg', 'monument-18.svg', 'airport-18.svg', 
                          'rail-18.svg', 'ferry-18.svg', 'harbor-18.svg', 'bicycle-18.svg', 'art-gallery-18.svg', 
                          'college-18.svg', 'library-18.svg', 'town-hall-18.svg', 'restaurant-18.svg', 'grocery-18.svg', 
                          'hospital-18.svg', 'industrial-18.svg', 'commercial-18.svg', 'water-18.svg', 'music-18.svg', 
                          'city-18.svg', 'car-18.svg', 'chemist-18.svg', 'village-18.svg', 'zoo-18.svg', 
                          'theatre-18.svg', 'danger-18.svg', 'camera-18.svg', 'farm-18.svg', 'shop-18.svg', 
                          'cafe-18.svg', 'police-18.svg', 'golf-18.svg', 'suitcase-18.svg'];
        
        var i = 0;
        
        for(i = 0; i < preImgList.length; i++) {
            preImgList[i] = remoteLink + 'style_editor/icons/' + preImgList[i];
        }
        
        $scope.imgList = preImgList;
        
        var slidePath = remoteLink + 'style_editor/slides/'
        
        var PTslides = [{image: slidePath + 'PTsimple.png', active: true},
                        {image: slidePath + 'PTchoropleth.png', active: false},
                        {image: slidePath + 'PTunique.png', active: false},
                        {image: slidePath + 'PTgraduated.png', active: false},
                        {image: slidePath + 'PTdensity.png', active: false}];
                        
        var LNslides = [{image: slidePath + 'LNsimple.png', active: true},
                        {image: slidePath + 'LNchoropleth.png', active: false}, 
                        {image: slidePath + 'LNunique.png', active: false},
                        {image: slidePath + 'LNweighted.png', active: false},
                        {image: slidePath + 'LNsymbols.png', active: false}];
        
        var PGslides = [{image: slidePath + 'PGsimple.png', active: true},
                        {image: slidePath + 'PGchoropleth.png', active: false},
                        {image: slidePath + 'PGunique.png', active: false},
                        {image: slidePath + 'PGgraduated.png', active: false}];
        
        var allSlides = {'MultiPoint': PTslides, 'MultiLineString': LNslides, 'MultiPolygon': PGslides};
                         
        
        $scope.updateStyle = function(property, value, layer) {
            console.log(property + ' : ' + value);
            drawSpace.changeStyle(property, value, layer);
            drawSpace.clear();
            styleModel.updateStyle(property,value,layer);
            drawLayers();
        };
        
        $scope.setIndex = function(num, index) {
            $scope.layers[num].activeSlide = index;
            console.log(index);
        };
        
        $scope.showPanel = function(panelName, layerGeom) {
            //console.log(layerGeom);
            switch(panelName) {
                case 'Symbol':
                    return layerGeom === 'MultiPoint';
                case 'Fill':
                    return layerGeom === 'MultiPolygon';
            }
        };
        
        $scope.updateShow = function(layerId) {
            $scope.layers[layerId].activeSlide = showComponent(layerId);
        };
        
        function drawLayers() {
            if(!mockup) {return;}
            
            var i = 0;
            
            for(i = 0; i < $scope.layers.length; i++) {
                switch($scope.layers[i].geometry.type) {
                        case 'MultiPoint':
                            drawSpace.drawMultiPoint($scope.layers[i].geometry.coordinates, 1, i);
                            break;
                        case 'MultiLineString':
                            drawSpace.drawMultiLine($scope.layers[i].geometry.coordinates, i);
                            console.log('DrawingLines')
                            break;
                        case 'MultiPolygon':
                            drawSpace.drawMultiPolygon($scope.layers[i].geometry.coordinates, i);
                            console.log('DrawingPolygons')
                            break;
                }
            }
        }
        
        function showComponent(layerId) {
            var i = 0;
            console.log(layerId);
            for(i = 0; i < $scope.layers[layerId].slides.length; i++) {
                if($scope.layers[layerId].slides[i].active) {
                    console.log(i);
                    return i;
                }
            }
            return 0;
        }
        
        function processLayers() {
            var i = 0;
            
            for(i = 0; i < $scope.layers.length; i++) {
                $scope.layers[i].id = i;
                $scope.layers[i].slides = JSON.parse(JSON.stringify(allSlides[$scope.layers[i].geometry.type].slice(0)));
                $scope.layers[i].open = (i === 0);
                $scope.layers[i].max = 54;
                $scope.layers[i].min = 10;
                $scope.layers[i].activeSlide = 0;
                $scope.layers[i].style = styleModel.getLayerStyleTemplate('Layer' + i, $scope.layers[i].geometry.type);
            }
            //drawSpace.addLayerStyle($scope.layers.length);
        }
    }]);
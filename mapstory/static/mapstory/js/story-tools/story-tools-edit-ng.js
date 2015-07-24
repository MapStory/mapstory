(function() {
    'use strict';

    var module = angular.module('storytools.edit.boxes.controllers', []);

    module.controller('boxesEditorController', ["$scope", "$timeout", "StoryBox", "StoryBoxLayerManager", "MapManager", function($scope, $timeout, StoryBox, StoryBoxLayerManager, MapManager) {
        var lastVersion = null;

        this.currentBox = {};
        this.editingBox = new StoryBox({});
        this.StoryBoxLayerManager = StoryBoxLayerManager;

        this.newStoryBox = function() {
            this.editingBox = {
                isNew : true
            };
            lastVersion = null;
        };
        this.deleteBox = function(box) {
            StoryBoxLayerManager.boxesChanged([box], 'delete');
        };

        this.acceptEdit = function() {

            var currentBox = this.currentBox;
            var changes = this.editingBox;
            if (currentBox instanceof StoryBox) {
                // existing storybox edit - update with copy containing changes
                currentBox.setProperties(changes);
                StoryBoxLayerManager.boxesChanged([currentBox], 'change');
            } else {
                // new storybox
                var storyBox = new StoryBox(changes);
                StoryBoxLayerManager.boxesChanged([storyBox], 'add');
            }
            this.currentBox = this.editingBox = lastVersion = null;
            reset();

        };
        this.cancelEdit = function() {
            if (lastVersion) {
                angular.copy(lastVersion, this.editingBox);
            }
            lastVersion = null;
            this.editingBox = null;
        };


         this.editStoryBox = function(box) {
            reset();
            // currentBox is provided or a new object (see saveStoryBox)
            this.currentBox = new StoryBox(box);
            lastVersion = angular.copy(box);
            this.editingCopy = new StoryBox(this.currentBox ? this.currentBox : {});
            if (box) {
                //getFeatures().push(pin);
                //var extent = pin.getGeometry().getExtent();
                //var center = ol.extent.getCenter(extent);
                //getMap().getView().setCenter(center);
                 this.editingBox = box;
            }



        };

        this.isEditing = function() {
            return this.currentBox instanceof StoryBox;
        };

        function reset() {
            //TODO clear
        }
    }]);

    module.controller('boxEditorController', ["$scope", function($scope) {
     $scope.$watch(function() {
            return $scope.boxesCtrl.editingBox;
        }, function(neu, old) {
            $scope.storyBox = neu;
        });
        function check_range() {
            var box = $scope.boxesCtrl.editingBox;
            var valid = true;
            if (box) {
                /*jshint eqnull:true */
                if (box.start_time != null && box.end_time != null) {
                    valid = box.start_time <= box.end_time;
                }
            }
           //$scope.editBox.boxForm.$setValidity('range', valid);
        }
        $scope.$watch('boxesCtrl.editingCopy.start_time', check_range);
        $scope.$watch('boxesCtrl.editingCopy.end_time', check_range);


        this.isFormValid = function() {
            return $scope.boxesCtrl.boxForm.$valid;
        };
        this.finish = function() {
            var result = $scope.storyBox;
            $scope.storyBox = null;
            return result;
        };
    }]);
})();

(function() {
    'use strict';
    var module = angular.module('storytools.edit.boxes.directives', [
        'storytools.edit.boxes.controllers','storytools.core.boxes'
    ]);

    module.directive('boxChooser', function() {
        return {
            restrict: 'E',
            require: '^boxesEditor',
            templateUrl: 'boxes/box-chooser.html',
            link: function(scope, element, attrs, ctrl) {

                    scope.editBox = function(box) {
                    ctrl.editStoryBox(box);
                    scope.$eval(atts.boxSelected, scope.$parent);
                };
            }
        };
    });

    module.directive('boxesEditor', function() {
        return {
            restrict: 'A',
            controller: 'boxesEditorController',
            controllerAs: 'boxesCtrl',
            link: function(scope, element, attrs, ctrl) {
                //var ctrl = scope.boxesCtrl;
                //ctrl.overlay = scope.$eval(atts.boxesOverlay);
                //if (ctrl.overlay === null) {
                  //  throw Error('boxesEditor needs boxesOverlay attribute');
                //}
            }
        };
    });

    module.directive('boxEditor', function() {
        return {
            restrict: 'E',
            controller: 'boxEditorController',
            controllerAs: 'boxCtrl',
            require: '^boxesEditor',
            templateUrl: 'boxes/box-editor.html',
            link: function(scope, element, attrs, ctrl) {
                scope.$watch(function() {
                    return ctrl.editingBox;
                }, function() {
                    scope.editBox = ctrl.editingBox;
                });
            }
        };
    });


    module.directive('boxBoundsEditor', ["$timeout", "$log", function($timeout, $log) {
        return {
            restrict: 'E',
            controller: 'boxEditorController',
            controllerAs: 'boxCtrl',
            templateUrl: 'boxes/bounds-editor.html',
            link: function(scope, element, attrs) {

                function coordinatesChanged() {
                    if (scope.editBox.minlon && scope.editBox.minlat && scope.editBox.maxlon && scope.editBox.maxlat) {

                        var extent = [scope.editBox.minlon, scope.editBox.minlat, scope.editBox.maxlon, scope.editBox.maxlat];
                        extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

                        map.getView().fitExtent(extent, map.getSize());
                    }

                    if(scope.editBox.zoom){
                        map.getView().setZoom(scope.editBox.zoom);
                    }
                }

                var el = element[0].querySelector('.box-bounds-map');

                var map = new ol.Map({target: el});
                map.setView(new ol.View({center: [0, 0], zoom: 4}));
                map.addLayer(new ol.layer.Tile({
                    source: new ol.source.MapQuest({layer: 'osm'})
                }));

                scope.updateCoordinates = function() {

                    $log.debug("The current center of the map is: " + map.getView().getCenter());

                    var extent = map.getView().calculateExtent(map.getSize());

                    extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:3857", "EPSG:4326"));

                    scope.editBox.minlon = extent[0];
                    scope.editBox.minlat = extent[1];
                    scope.editBox.maxlon = extent[2];
                    scope.editBox.maxlat = extent[3];
                    scope.editBox.zoom = map.getView().getZoom();
                    var center = map.getView().getCenter();
                    scope.editBox.center = center;

                    setTimeout(function(){map.updateSize();}, 1);

                };

                scope.$watch('boxBoundsEditorSelected', function(n) {
                    if (n) {

                        if(scope.storyBox.center){
                            map.setView(new ol.View({center: scope.storyBox.center, zoom: 4}));
                        }else{
                            map.setView(new ol.View({center: [0, 0], zoom: 4}));
                        }

                        scope.updateCoordinates();
                    }
                });

                scope.$watch('editBox', coordinatesChanged, true);
            }
        };
    }]);

    module.directive('boxContentsEditor', function() {
        return {
            require: '^boxEditor',
            restrict: 'E',
            templateUrl: 'boxes/contents-editor.html',
            link: function(scope, el, atts, ctrl) {

                scope.currentTime = new Date().toISOString();

                scope.$watch('storyBox', function(neu, old) {
                    if (neu != old) {
                        el[0].querySelector('input[name=title]').focus();
                    }
                });
            }
        };
    });

    module.directive('boxLayersEditor', function() {
        return {
            restrict: 'E',
            templateUrl: 'boxes/layers-editor.html'
        };
    });

})();

(function() {
    'use strict';

    angular.module('storytools.edit.boxes', [
        'storytools.edit.boxes.directives',
        'storytools.edit.boxes.controllers',
        'ui.bootstrap'
    ]);
})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.pins.controllers', []);

    module.controller('pinsEditorController', ["$scope", "$timeout", "StoryPin", "StoryPinLayerManager", "MapManager", function($scope, $timeout, StoryPin, StoryPinLayerManager, MapManager) {

        var drawingTools = {};
        var ctrl = this;

        this.currentPin = null;
        this.editingCopy = new StoryPin();
        this.StoryPinLayerManager = StoryPinLayerManager;
        this.deleteStoryPin = function(pin) {
            StoryPinLayerManager.pinsChanged([pin], 'delete');
        };
        this.saveStoryPin = function() {
            var currentPin = this.currentPin;
            var changes = this.editingCopy.getProperties();
            if (currentPin instanceof StoryPin) {
                // existing storypin edit - update with copy containing changes
                currentPin.setProperties(changes);
                StoryPinLayerManager.pinsChanged([currentPin], 'change');
            } else {
                // new storypin
                var storyPin = new StoryPin(changes);
                StoryPinLayerManager.pinsChanged([storyPin], 'add');
            }
            this.currentPin = this.editingCopy = null;
            reset();
        };
        this.editStoryPin = function(pin) {
            reset();
            // currentPin is provided or a new object (see saveStoryPin)
            this.currentPin = pin;
            this.editingCopy = new StoryPin(this.currentPin ? this.currentPin.getProperties() : {});
            if (pin && pin.getGeometry()) {
                getFeatures().push(pin);
                var extent = pin.getGeometry().getExtent();
                var center = ol.extent.getCenter(extent);
                getMap().getView().setCenter(center);
            }
        };
        this.deleteGeometry = function() {
            this.editingCopy.setGeometry(null);
            reset();
        };
        function getMap() {
            return MapManager.storyMap.getMap();
        }
        function getFeatures() {
            return MapManager.storyMap.overlay.getFeatures();
        }
        function disableTools() {
            for (var t in drawingTools) {
                drawingTools[t].setActive(false);
            }
        }
        function reset() {
            ctrl.activeDrawTool = null;
            getFeatures().clear();
        }
        function onDrawStart() {
            getFeatures().clear();
        }
        function onDrawEnd() {
            $timeout(function() {
                ctrl.activeDrawTool = null;
                var features = getFeatures();
                var geom = features.getLength() > 0 ? features.item(0).getGeometry() : null;
                ctrl.editingCopy.setGeometry(geom);
                // if there is a geom but in_map hasn't been set, do it
                if (geom && ctrl.editingCopy.in_map === null) {
                    ctrl.editingCopy.in_map = true;
                }
            });
        }
        function createOrActivateTool(type) {
            disableTools();
            if (!drawingTools[type]) {
                if (type == 'Modify') {
                    drawingTools[type] = new ol.interaction.Modify({
                        features: getFeatures()
                    });
                } else {
                    drawingTools[type] = new ol.interaction.Draw({
                        features: getFeatures(),
                        type: type
                    });
                    drawingTools[type].on('drawstart', onDrawStart);
                }
                getMap().addInteraction(drawingTools[type]);
                drawingTools[type].on('drawend', onDrawEnd);
            }
            drawingTools[type].setActive(true);
        }
        this.isEditing = function() {
            return this.currentPin instanceof StoryPin;
        };
        // because bootstrap-ui btn-radio wants to use ng-model, expose this
        // as a property to allow action on change
        Object.defineProperty(this, 'activeDrawTool', {
            get: function() {
                return this._activeDrawTool;
            },
            set: function(val) {
                this._activeDrawTool = val;
                if (angular.isString(val)) {
                    createOrActivateTool(val);
                } else {
                    disableTools();
                }
            }
        });
        $scope.$on('$destroy', function() {
            for (var t in drawingTools) {
                var tool = drawingTools[t];
                tool.setActive(false);
                getMap().removeInteraction(tool);
            }
        });
    }]);

    module.controller('pinEditorController', ["$scope", function($scope) {
        $scope.$watch(function() {
            return $scope.pinsCtrl.editingCopy;
        }, function(neu, old) {
            $scope.storyPin = neu;
        });
        function check_range() {
            var pin = $scope.pinsCtrl.editingCopy;
            var valid = true;
            if (pin) {
                /*jshint eqnull:true */
                if (pin.start_time != null && pin.end_time != null) {
                    valid = pin.start_time <= pin.end_time;
                }
            }
            $scope.pinForm.$setValidity('range', valid);
        }
        $scope.$watch('pinsCtrl.editingCopy.start_time', check_range);
        $scope.$watch('pinsCtrl.editingCopy.end_time', check_range);
        this.isFormValid = function() {
            return $scope.pinForm.$valid;
        };
        this.finish = function() {
            var result = $scope.storyPin;
            $scope.storyPin = null;
            return result;
        };
    }]);
})();

(function() {
    'use strict';
    var module = angular.module('storytools.edit.pins.directives', [
        'storytools.core.pins'
    ]);

    module.directive('pinsEditor', function() {
        return {
            restrict: 'A',
            controller: 'pinsEditorController',
            controllerAs: 'pinsCtrl',
            link: function(scope, el, atts) {
                var ctrl = scope.pinsCtrl;
                ctrl.overlay = scope.$eval(atts.pinsOverlay);
                if (ctrl.overlay === null) {
                    throw Error('pinsEditor needs pinsOverlay attribute');
                }
            }
        };
    });

    module.directive('pinChooser', function() {
        return {
            require: '^pinsEditor',
            restrict: 'E',
            templateUrl: 'pins/pin-chooser.html',
            link: function(scope, el, atts, ctrl) {
                // just wrap the ctrl call to allow the callback
                scope.editPin = function(pin) {
                    ctrl.editStoryPin(pin);
                    scope.$eval(atts.pinSelected, scope.$parent);
                };
            }
        };
    });

    module.directive('pinEditor', function() {
        return {
            require: '^pinsEditor',
            controller: 'pinEditorController',
            controllerAs: 'pinCtrl',
            restrict: 'A'
        };
    });

    module.directive('pinEditorForm', function() {
        return {
            require: '^pinEditor',
            restrict: 'E',
            templateUrl: 'pins/pin-editor-form.html',
            link: function(scope, el, atts, ctrl) {
                scope.point = {};
                function coordinatesChanged() {
                    if (scope.point.latitude && scope.point.longitude) {
                        var geom = new ol.geom.Point([
                            parseFloat(scope.point.longitude),
                            parseFloat(scope.point.latitude)
                        ]).transform('EPSG:4326', scope.map.map.getView().getProjection());
                        // @todo finish this - the geometry is not updated here
                    }
                }
                scope.showPointCoordinates = function() {
                    return scope.pinsCtrl.activeDrawTool === 'Point';
                };
                scope.$watch('storyPin', function(neu, old) {
                    if (neu != old) {
                        el[0].querySelector('input[name=title]').focus();
                    }
                });
                scope.$watch('point', coordinatesChanged, true);
            }
        };
    });
})();

(function() {
    'use strict';

    angular.module('storytools.edit.pins', [
        'storytools.edit.time.directives',
        'storytools.edit.pins.directives',
        'storytools.edit.pins.controllers',
        'ui.bootstrap'
    ]);
})();

(function() {
    'use strict';

    angular.module('storytools.edit.style', [
        'storytools.edit.style.services',
        'storytools.edit.style.directives',
        'storytools.edit.style.controllers',
        'storytools.edit.templates', // app level dependency
        'ui.bootstrap'
    ]);
})();


    
(function() {
    'use strict';

    var module = angular.module('storytools.edit.time.directives', []);

    module.directive('stDateTimeField', function() {
        return {
            restrict: 'E',
            templateUrl: 'time/date-time-field.html',
            scope: {
                dateTime: '=',
                currentTime: '='
            },
            link: function(scope, elem) {
                scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    scope.opened = true;
                };
            }
        };
    });

    module.directive('isoDateTime', ["$log", function($log) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModelCtrl) {
                ngModelCtrl.$formatters.push(function(modelValue) {
                    /*jshint eqnull:true */
                    var retval = modelValue != null ? new Date(modelValue).toISOString() : '';
                    return retval;
                });
                ngModelCtrl.$parsers.push(function(viewValue) {
                    var parsed =  Date.parse(viewValue);
                    var valid = !isNaN(parsed);
                    ngModelCtrl.$setValidity('dateTime', valid);
                    return valid ? parsed : null;
                });
                scope.setFromCurrentTime = function() {
                    if (scope.currentTime) {
                        ngModelCtrl.$modelValue = scope.currentTime;
                    } else {
                        $log.error('no current time provided!');
                    }
                };
            }
        };
    }]);
})();
(function() {
    'use strict';

    angular.module('storytools.edit.time', [
        'storytools.edit.time.directives',
        'storytools.edit.templates'
    ]);

})();
(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.controllers', []);

    module.controller('styleEditorController', 
        ["$scope", "stStyleTypes", "stStyleChoices", "stLayerClassificationService", "stStyleRuleBuilder", function($scope, stStyleTypes, stStyleChoices, stLayerClassificationService, stStyleRuleBuilder) {
            var styles = {};

            function promptClassChange() {
                // @todo should check for rule edits?
                if ($scope.activeStyle.rules.length > 0) {
                    return window.confirm('delete existing rules?');
                }
                return true;
            }

            function classify() {
                var activeStyle = $scope.activeStyle;
                stLayerClassificationService.classify(
                    $scope.layer,
                    activeStyle.classify.attribute,
                    activeStyle.classify.method,
                    activeStyle.classify.maxClasses).then(function(results) {
                        activeStyle.rules = results;
                        stStyleRuleBuilder.buildRuleStyles(activeStyle);
                });
            }

            function setLayer(layer) {
                $scope.layer = layer;
                $scope.styleTypes = stStyleTypes.getTypes(layer);
                if ($scope.styleTypes.length > 0) {
                    setActiveStyle($scope.styleTypes[0]);
                }
            }

            function setActiveStyle(styleType) {
                $scope.currentEditor = styleType;
                $scope.activeStyle = getStyle(styleType);
            }

            function getStyle(styleTyle) {
                var style;

                if (styleTyle.name in styles) {
                    style = styles[styleTyle.name];
                } else {
                    var styleType = $scope.styleTypes.filter(function(t) {
                        return t.name == styleTyle.name;
                    });
                    if (styleType.length === 0) {
                        throw 'invalid style type: ' + styleTyle.name;
                    }
                    style = stStyleTypes.createStyle(styleType[0]);
                }
                return style;
            }

            $scope.styleChoices = stStyleChoices;
            setLayer($scope.layer);

            $scope.setActiveStyle = setActiveStyle;

            $scope.$watch(function() {
                var active = $scope.styleTypes.filter(function(e) {
                    return e.active;
                });
                return active[0];
            }, function(currentSlide, previousSlide) {
                if (currentSlide && (currentSlide !== previousSlide)) {
                    setActiveStyle(currentSlide);
                }
            });

            $scope.$watch('layer',function(neu, old) {
                if (neu != old) {
                    setLayer(neu);
                }
            });

            $scope.changeClassifyProperty = function(prop, value) {
                if (false && !promptClassChange()) {
                    return;
                }
                if (prop) {
                    $scope.activeStyle.classify[prop] = value;
                }
                classify();
            };

            $scope.$watch('activeStyle', function(neu) {
                if ($scope.editorForm.$valid) {
                    var style = $scope.layer.get('style');
                    if (style && style.readOnly === true) {
                        delete style.readOnly;
                        $scope.activeStyle = style;
                    } else {
                        $scope.layer.set('style', $scope.activeStyle);
                    }
                    ($scope.onChange || angular.noop)($scope.layer);
                }
            }, true);

            $scope.$watch('editorForm.$valid', function() {
                ($scope.formChanged || angular.noop)($scope.editorForm);
            });
        }]);
})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.iconCommons', []);

    module.factory('iconCommons', ["$q", "stSvgIcon", "stRecentChoices", function($q, stSvgIcon, stRecentChoices) {
        return {
            defaults: function() {
                return $q.all(stRecentChoices.icons.recent.map(function(uri) {
                    return stSvgIcon.getImage(uri);
                }));
            }
        };
    }]);

    module.factory('iconCommonsSearch', ["$http", "$modal", "$injector", function($http, $modal, $injector) {
        var iconCommonsHost = $injector.has('iconCommonsHost') ?
            $injector.get('iconCommonsHost') : 'http://localhost:8000';
        function fixHrefs(stuff) {
            var toFix = stuff.icons || stuff;
            for (var i = 0, ii = toFix.length; i < ii; i++) {
                toFix[i].href = iconCommonsHost + toFix[i].href;
            }
            return stuff;
        }
        return {
            tagEndpoint: iconCommonsHost + '/icons/icon',
            search: function() {
                this.modal = $modal.open({
                    size: 'lg',
                    controller: 'iconCommonsController',
                    templateUrl: 'style/widgets/icon-commons-search.html'
                });
                return this.modal ? this.modal.result : null;
            },
            getCollections: function() {
                return $http.get(iconCommonsHost + '/icons/collections').success(function(data) {
                    return fixHrefs(data);
                });
            },
            getMore: function(collection) {
                var href = collection.href;
                if (href.indexOf(iconCommonsHost) !== 0) {
                    href = iconCommonsHost + href;
                }
                return $http.get(href, {
                    params: {
                        page: collection._nextPage
                    }
                }).success(function(data) {
                    return fixHrefs(data);
                });
            },
            getCollectionIcons: function(collection) {
                var params = {};
                if (collection._nextPage) {
                    params.page = collection._nextPage;
                }
                return $http.get(iconCommonsHost + collection.href, {
                    params: params
                }).success(function(data) {
                    return fixHrefs(data);
                });
            },
            getByTag: function(tag) {
                return $http.get(this.tagEndpoint, {
                    params: {
                        tag: tag
                    }
                }).success(function(data) {
                    return fixHrefs(data);
                });
            },
            getTags: function(q) {
                return $http.get(iconCommonsHost + '/icons/search/tags', {
                    params: {
                        query: q
                    }
                }).then(function(response) {
                    return response.data.tags;
                });
            }
        };
    }]);

    module.controller('iconCommonsController', ["$scope", "iconCommonsSearch", "stRecentChoices", function($scope, iconCommonsSearch, stRecentChoices) {
        var tagCollection = {
            href: iconCommonsSearch.tagEndpoint
        }, collection = {
        };
        function handleCollections(collection, response) {
            var icons = response.data.icons;
            if (collection._icons) {
                collection._icons = collection._icons.concat(icons);
            } else {
                collection._icons = icons;
            }
            collection._more = response.data.page < response.data.pages;
            collection._nextPage = response.data.page + 1;
            $scope.icons = collection;
        }
        $scope.loadMore = function() {
            iconCommonsSearch.getMore($scope.icons).then(function(data) {
                handleCollections($scope.icons, data);
            });
        };
        $scope.close = function() {
            stRecentChoices.icons.add($scope.selectedIcon.href);
            iconCommonsSearch.modal.close($scope.selectedIcon);
        };
        $scope.dismiss = function() {
            iconCommonsSearch.modal.dismiss();
        };
        $scope.tagSelect = function(tag) {
            tagCollection._icons = [];
            iconCommonsSearch.getByTag(tag).then(function(data) {
                handleCollections(tagCollection, data);
            });
        };
        $scope.viewCollections = function() {
            $scope.icons = collection;
        };
        $scope.viewTags = function() {
            $scope.icons = tagCollection;
        };
        $scope.collectionSelect = function(collection) {
            collection._icons = [];
            iconCommonsSearch.getCollectionIcons(collection).then(function(data) {
                handleCollections(collection, data);
            });
        };
        $scope.iconSelected = function(icon, done) {
            $scope.selectedIcon = icon;
            if (done) {
                $scope.close();
            }
        };
        $scope.selectedClass = function(icon) {
            return icon === $scope.selectedIcon ? 'active' : null;
        };
        $scope.getTags = iconCommonsSearch.getTags;
        iconCommonsSearch.getCollections().then(function(response) {
            $scope.collections = response.data.collections;
        });
    }]);
})();
(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.layerClassificationService', []);

    module.factory('stLayerClassificationService', ["$q", "$http", "$modal", "$sce", "$log", function($q, $http, $modal, $sce, $log) {
        return {
            classify: function(layer, attribute, method, numClasses) {
                if (!this.cache) {
                    this.cache = {};
                }
                var defer;
                if (attribute === null || method === null) {
                    defer = $q.defer();
                    defer.reject('Not enough info to perform WPS request.');
                    return defer.promise;
                }
                var key = layer.get('id') + '|' + attribute + '|' + method + '|' + numClasses;
                if (this.cache[key]) {
                    defer = $q.defer();
                    defer.resolve(this.cache[key]);
                    return defer.promise;
                }
                var xml, service = this;
                var wps = new storytools.edit.WPSClassify.WPSClassify();
                var url = layer.get('path') + 'wps';
                if (method === 'unique') {
                    xml = wps.getUniqueValues({
                        featureNS: layer.get('featureNS'),
                        typeName: layer.get('typeName'),
                        featurePrefix: layer.get('featurePrefix'),
                        attribute: attribute
                    }, true);
                    return $http({
                        url:  url,
                        method: "POST",
                        data: xml,
                        headers: {'Content-Type': 'application/xml'}
                    }).then(function(result) {
                        var results = [];
                        if (result.data && result.data.features) {
                            for (var i=0, ii=Math.min(result.data.features.length, numClasses); i<ii; ++i) {
                                var feature = result.data.features[i];
                                results.push({
                                    name: feature.properties.value,
                                    value: feature.properties.value
                                });
                            }
                        }
                        service.cache[key] = results;
                        return results;
                    });
                } else {
                    var wpsMethod;
                    if (method === 'Natural Breaks') {
                        wpsMethod = 'NATURAL_BREAKS';
                    } else if (method === 'Equal Interval') {
                        wpsMethod = 'EQUAL_INTERVAL';
                    } else if (method === 'Quantile') {
                        wpsMethod = 'QUANTILE';
                    }
                    // this should not happen since we only have methods in the UI that we support
                    if (wpsMethod !== undefined) {
                        xml = wps.classifyVector({
                            featureNS: layer.get('featureNS'),
                            typeName: layer.get('typeName'),
                            featurePrefix: layer.get('featurePrefix'),
                            attribute: attribute,
                            numClasses: numClasses,
                            method: wpsMethod
                        }, true);
                        return $http({
                            url: url,
                            method: "POST",
                            data: xml,
                            headers: {'Content-Type': 'application/xml'}
                        }).then(function(result) {
                            var response = wps.parseResult(result.data);
                            if (response.success === true) {
                                service.cache[key] = response.rules;
                                return response.rules;
                            } else {
                                $modal.open({
                                    templateUrl: '/lib/templates/core/error-dialog.html',
                                    controller: ["$scope", function($scope) {
                                        $scope.title = 'Error';
                                        $scope.msg = $sce.trustAsHtml(
                                            'An error occurred when communicating with the classification ' + 
                                            'service: <br/>' + response.msg);
                                    }]
                                });
                                $log.warn(response.msg);
                                return [];
                            }
                        });
                    }
                }
            }
        };
    }]);
})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.services', [
        'storytools.core.style',
        'storytools.edit.style.styleRuleBuilder',
        'storytools.edit.style.styleChoices',
        'storytools.edit.style.styleTypes',
        'storytools.edit.style.layerClassificationService',
        'storytools.edit.style.iconCommons'
    ]);

    // pull in these core edit services
    module.factory('WPSClassify', [storytools.edit.WPSClassify]);
    module.factory('SLDStyleConverter', [storytools.edit.SLDStyleConverter]);
    module.factory('WFSDescribeFeatureType', [storytools.edit.WFSDescribeFeatureType]);
    module.factory('StyleComplete', [storytools.edit.StyleComplete]);

})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.styleChoices', []);

    module.factory('stStyleChoices', function() {
        return {
            symbolizers: [
                'circle', 'square', 'triangle', 'star', 'cross', 'x'
            ],
            rotationUnits: [
                'degrees', 'radians'
            ],
            strokeStyle: [
                'solid', 'dashed', 'dotted'
            ],
            fontFamily: [
                'serif', 'sans-serif', 'cursive', 'monospace'
            ],
            colorRamps: [
                {
                    0: '#ff0000',
                    1: '#0000ff'
                },
                {
                    0: '#00ff00',
                    1: '#ffff00'
                }
            ],
            // @todo build these statically ahead of time using color-scheme-js
            colorPalettes: [
                {
                    name: 'colors 1',
                    vals: ["#ff9900", "#b36b00", "#ffe6bf", "#ffcc80",
                        "#00b366", "#007d48", "#bfffe4", "#80ffc9",
                        "#400099", "#2d006b", "#dabfff", "#b580ff"]
                },
                {
                    name: 'colors 2',
                    vals: ["#ff99aa", "#b36baa", "#aae6bf", "#aacc80",
                        "#00b366", "#007d48", "#bfaae4", "#80aac9",
                        "#40aa99", "#2daa6b", "#dabfaa", "#b580aa"]
                }
            ],
            classMethods: [
                'Natural Breaks',
                'Equal Interval',
                'Quantile'/*,
                'Geometric Interval',
                'Standard Deviation'*/
            ],
            getPalette: function(name) {
                var found = this.colorPalettes.filter(function(p) {
                    return p.name === name;
                });
                return found.length ? found[0] : null;
            }
        };
    });

    module.factory('stRecentChoices', function() {
        return {
            icons: new RecentChoices('icons', 24)
        };
    });

    function RecentChoices(name, max) {
        this._max = max;
        this._key = 'stRecentChoices-' + name;
        var saved = localStorage.getItem(this._key);
        this.recent = saved ? JSON.parse(saved) : [];
    }

    RecentChoices.prototype.clear = function() {
        this.recent = [];
        localStorage.setItem(this._key, JSON.stringify(this.recent));
    };

    RecentChoices.prototype.add = function(choice) {
        if (this.recent.indexOf(choice) === -1) {
            this.recent.push(choice);
            if (this.recent.length > this._max) {
                this.recent.shift();
            }
            localStorage.setItem(this._key, JSON.stringify(this.recent));
        }
    };

})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.styleRuleBuilder', [
        'storytools.edit.style.styleTypes',
        'storytools.edit.style.styleChoices'
    ]);

    module.factory('stStyleRuleBuilder', ["stStyleTypes", "stStyleChoices", function(stStyleTypes, stStyleChoices) {
        function hex(v) {
            return ('00' + v.toString(16)).slice(-2);
        }
        function colorRampValues(ramp, num) {
            if (num === 1) {
                return [ramp[0]];
            }
            var colors = [];
            var rampStops = Object.keys(ramp).filter(function(x) {
                return x.toString().charAt(0) != '$';
            });
            rampStops.sort();
            var ms = rampStops.map(function(k) {
                var val = ramp[k];
                return [parseInt('0x' + val.substr(1, 2)),
                    parseInt('0x' + val.substr(3, 2)),
                    parseInt('0x' + val.substr(5, 2))
                ];
            });
            var step = 1.0 / (num - 1);
            function getStops(val) {
                // @todo find stops
                return [rampStops[0], rampStops[1]];
            }

            // @todo hsv interpolation (yields brighter colors)?
            for (var i = 0; i < num; i++) {
                var val = i * step;
                var stops = getStops(val);
                var r = (val - stops[0]) / (stops[1] - stops[0]);
                var start = ms[stops[0]];
                var stop = ms[stops[1]];
                var red = Math.floor(start[0] + (stop[0] - start[0]) * r);
                var green = Math.floor(start[1] + (stop[1] - start[1]) * r);
                var blue = Math.floor(start[2] + (stop[2] - start[2]) * r);
                colors.push('#' + hex(red) + hex(green) + hex(blue));
            }
            return colors;
        }
        function buildRule(rule, context) {
            var type = context.styleType.rule;
            var ruleStyle = {};
            angular.forEach(type, function(copyRule, styleProp) {
                var target = {};
                angular.forEach(copyRule, function(copySource, copyDest) {
                    var val = null;
                    switch (copySource) {
                        case 'color':
                            if (context.colors) {
                                val = context.colors[context.index % context.colors.length];
                            }
                            break;
                        case 'range':
                            if (context.rangeStep) {
                                val = Math.round(context.rangeStep * context.index);
                            }
                            break;
                        default:
                            throw 'invalid copySource ' + copySource;
                    }
                    if (val !== null) {
                        target[copyDest] = val;
                    }
                });
                ruleStyle[styleProp] = target;
            });
            rule.style = ruleStyle;
        }

        return {
            _colorRampValues: colorRampValues,
            buildRuleStyles: function(style) {
                var colors;
                var rangeStep;
                if (style.classify) {
                    if (style.classify.colorRamp) {
                        colors = colorRampValues(style.classify.colorRamp, style.rules.length);
                    } else if (style.classify.colorPalette) {
                        var palette = stStyleChoices.getPalette(style.classify.colorPalette);
                        // @todo interpolate if needed?
                        colors = palette.vals;
                    }
                    if (style.classify.range) {
                        rangeStep = (style.classify.range.max - style.classify.range.min) / style.rules.length;
                    }
                }
                var context = {
                    colors: colors,
                    rangeStep: rangeStep,
                    style: style,
                    styleType: stStyleTypes.getStyleType(style.typeName)
                };
                style.rules.forEach(function(r, i) {
                    context.index = i;
                    buildRule(r, context);
                });
            }
        };
    }]);
})();

(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.styleTypes', []);

    var defaultSymbol = {
        size: 10,
        shape: 'circle',
        graphic: null,
        graphicType: null,
        fillColor: '#FF0000',
        fillOpacity: 100,
        rotationAttribute: null,
        rotationUnits: 'degrees'
    };

    var defaultStroke = {
        strokeColor: '#000000',
        strokeWidth: 1,
        strokeStyle: 'solid',
        strokeOpacity: 100
    };

    var defaultLabel = {
        attribute: null,
        fillColor: '#000000',
        fontFamily: 'Serif',
        fontSize: 10,
        fontStyle: 'normal',
        fontWeight: 'normal',
        placement: 'point'
    };

    var defaultUniqueClass = {
        method: 'unique',
        attribute: null,
        maxClasses: 5,
        colorRamp: null
    };

    var defaultBreaksClass = {
        method: null,
        attribute: null,
        maxClasses: 5,
        colorRamp: null
    };

    var defaultRangeClass = {
        method: null,
        attribute: null,
        maxClasses: 5,
        range: {
            min: 0,
            max: 16
        }
    };

    var types = [
        {
            name: 'simple point',
            displayName: 'Simple',
            prototype: {
                geomType: 'point'
            }
        },
        {
            name: 'unique point',
            displayName: 'Unique',
            prototype: {
                geomType: 'point',
                classify: defaultUniqueClass
            },
            rule: {
                symbol : {
                    fillColor: 'color'
                }
            }
        },
        {
            name: 'class point',
            displayName: 'Choropleth',
            prototype: {
                geomType: 'point',
                classify: defaultBreaksClass
            },
            rule: {
                symbol : {
                    fillColor: 'color'
                }
            }
        },
        {
            name: 'graduated point',
            displayName: 'Graduated',
            prototype: {
                geomType: 'point',
                classify: defaultRangeClass
            },
            rule: {
                symbol: {
                    size: 'range'
                }
            }
        },
        {
            name: 'heatmap',
            displayName: 'HeatMap',
            prototype: {
                geomType: 'point',
                radius: 8,
                opacity: 0.8
            }
        },
        {
            name: 'simple line',
            displayName: 'Simple',
            prototype: {
                geomType: 'line'
            }
        },
        {
            name: 'unique line',
            displayName: 'Unique',
            prototype: {
                geomType: 'line',
                classify: defaultUniqueClass
            },
            rule: {
                stroke : {
                    strokeColor: 'color'
                }
            }
        },
        {
            name: 'simple polygon',
            displayName: 'Simple',
            prototype: {
                geomType: 'polygon'
            }
        },
        {
            name: 'unique polygon',
            displayName: 'Unique',
            prototype: {
                geomType: 'polygon',
                classify: defaultUniqueClass
            },
            rule: {
                symbol : {
                    fillColor: 'color'
                }
            }
        },
        {
            name: 'class polygon',
            displayName: 'Choropleth',
            prototype: {
                geomType: 'polygon',
                classify: defaultBreaksClass
            },
            rule: {
                symbol : {
                    fillColor: 'color'
                }
            }
        }
    ];

    module.run(["$injector", function($injector) {
        if ($injector.has('stStyleDefaults')) {
            var defaults = $injector.get('stStyleDefaults');
            [defaultSymbol, defaultStroke].forEach(function(s) {
                Object.keys(s).forEach(function(k) {
                    if (k in defaults) {
                        s[k] = defaults[k];
                    }
                });
            });
        }
    }]);

    module.factory('stStyleTypes', function() {
        return {
            getTypes: function(storyLayer) {
                return angular.copy(types).filter(function(f) {
                    return f.prototype.geomType === storyLayer.get('geomType');
                });
            },
            getStyleType: function(typeName) {
                var match = types.filter(function(t) {
                    return t.name == typeName;
                });
                if (match.length >  1) {
                    throw 'duplicate type names!';
                }
                return match.length === 0 ? null : match[0];
            },
            createStyle: function(styleType) {
                var base = {
                    symbol: defaultSymbol,
                    stroke: defaultStroke,
                    label: defaultLabel,
                    typeName: styleType.name
                };
                var style = angular.extend({}, angular.copy(base), styleType.prototype);
                if ('classify' in style) {
                    style.rules = [];
                }
                return style;
            }
        };
    });
})();

(function() {
    'use strict';
    var module = angular.module('storytools.edit.style.directives', []);

    function editorDirective(name, templateUrl, property, linker) {
        module.directive(name, ['stStyleChoices', function(styleChoices) {
            return {
                restrict: 'E',
                scope: {
                    stModel: "=",
                    property: "@",
                    popover: "@popoverText",
                },
                templateUrl: 'style/widgets/' + templateUrl,
                link: function(scope, element, attrs) {
                    // @todo bleck - grabbing the layer from the parent
                    // should be replaced with something more explicit
                    scope.layer = scope.$parent.layer;
                    scope.$watch(function() {
                        return scope.$parent.layer;
                    }, function(neu) {
                        scope.layer = neu;
                    });
                    // endbleck
                    scope.model = scope.stModel[property || scope.property];
                    scope.styleChoices = styleChoices;
                    if (linker) {
                        linker(scope, element, attrs);
                    }
                }
            };
        }]);
    }

    module.directive('styleEditor', function() {
        return {
            restrict: 'E',
            templateUrl: 'style/style-editor.html',
            controller: 'styleEditorController',
            require: '?styleEditorController',
            scope: {
                layer : '=',
                onChange : '=',
                formChanged : '='
            }
        };
    });

    module.directive('attributeCombo', ["$log", function($log) {
        return {
            restrict: 'E',
            templateUrl: 'style/widgets/attribute-combo.html',
            scope: {
                layer: '=',
                model: "=stModel",
                onChange: "=?",
                css: "@css",
            },
            link: function(scope, element, attrs) {
                function readAttributes() {
                    var atts = [];
                    if (scope.layer) {
                        scope.layer.get('attributes').forEach(function(a) {
                            var include = true;
                            if (attrs.filter === 'nogeom') {
                                include = a.typeNS !== 'http://www.opengis.net/gml';
                            } else if (attrs.filter === 'number') {
                                include = a.type === 'integer' ||
                                    a.type === 'double' ||
                                    a.type === 'long';
                            } else if (attrs.filter === 'unique') {
                                include = a.type === 'integer' ||
                                    a.type === 'string' ||
                                    a.type === 'long';
                            } else if (attrs.filter) {
                                $log.warn('unknown filter', attrs.filter);
                            }
                            if (attrs.include) {
                                include = attrs.include.indexOf(a.type) >= 0;
                            }
                            if (include) {
                                atts.push(a.name);
                            }
                        });
                        atts.sort();
                        scope.attributes = atts;
                    } else {
                        scope.attributes = [];
                    }
                }
                // @todo is watch actually needed here (possibly the case if reusing the editor)
                scope.$watch('layer', function(neu, old) {
                    if (neu != old) {
                        readAttributes();
                    }
                });
                readAttributes();
                // default property to modify
                scope.property = attrs.property || 'attribute';
                // if not provided, the default behavior is to change the model
                if (!scope.onChange) {
                    scope.onChange = function(property, val) {
                        scope.model[property] = val;
                    };
                }
            }
        };
    }]);

    editorDirective('symbolEditor', 'symbol-editor.html', 'symbol', function(scope, el, attrs) {
        ['showGraphic', 'showRotation', 'hideColor'].forEach(function(opt) {
            scope[opt] = attrs[opt];
        });
        scope.getSymbolizerText = function(model) {
            return model.shape || model.graphic;
        };
        scope.getSymbolizerImage = function(name) {
            return '';
        };
    });
    editorDirective('strokeEditor', 'stroke-editor.html', 'stroke');
    editorDirective('numberEditor', 'number-editor.html', null, function(scope, el, attrs) {
        var defaults = {
            max: 30,
            min: 0,
            step: 1
        };
        Object.keys(defaults).forEach(function(e) {
            scope[e] = attrs[e] || defaults[e];
        });
        function wheel(ev) {
            var input = el.find('input');
            var min = Number(input.attr('min')) || 0;
            var max = Number(input.attr('max'));
            var step = Number(input.attr('step')) || 1;
            var val = scope.stModel[scope.property];
            var scroll = ev.detail || ev.wheelDelta;
            val = Math.min(max, val + (scroll > 0 ? -step: step));
            val = Math.max(min, val);
            scope.$apply(function() {
                scope.stModel[scope.property] = val;
            });
        }
        el[0].addEventListener('DOMMouseScroll', wheel, false ); // For FF and Opera
        el[0].addEventListener('mousewheel', wheel, false ); // For others
    });
    editorDirective('colorEditor', 'color-editor.html');
    editorDirective('labelEditor', 'label-editor.html', 'label', function(scope) {
        // @todo other options
        scope.styleModel = {
            bold : scope.model.fontWeight == 'bold',
            italic : scope.model.fontStyle == 'italic'
        };
        scope.styleModelChange = function() {
            scope.model.fontWeight = scope.styleModel.bold ? 'bold' : 'normal';
            scope.model.fontStyle = scope.styleModel.italic ? 'italic' : 'normal';
        };
    });

    // @todo break into pieces or make simpler
    // @todo doesn't watch iconCommons.defaults() - can become out of date
    module.directive('graphicEditor', ["stStyleChoices", "ol3MarkRenderer", "iconCommons", "iconCommonsSearch", "stSvgIcon", function(stStyleChoices, ol3MarkRenderer, iconCommons, iconCommonsSearch, stSvgIcon) {
        return {
            restrict: 'E',
            templateUrl: 'style/widgets/graphic-editor.html',
            scope: {
                symbol: '='
            },

            link: function(scope, element, attrs) {
                function canvas(symbol) {
                    var el = angular.element(ol3MarkRenderer(symbol, 24));
                    el.addClass('symbol-icon');
                    el.attr('mark', symbol); // for testing until we use data URI
                    return el;
                }
                function image(icon) {
                    var el = angular.element('<img>');
                    el.attr('src', icon.dataURI);
                    el.addClass('symbol-icon');
                    el.attr('graphic', icon.uri);
                    return el;
                }
                // update the element with the data-current-symbol attribute
                // to match the current symbol
                function current() {
                    var el = angular.element(element[0].querySelector('[data-current-symbol]'));
                    el.find('*').remove();
                    if (scope.symbol.shape) {
                        el.append(canvas(scope.symbol.shape));
                    } else if (scope.symbol.graphic) {
                        stSvgIcon.getImage(scope.symbol.graphic, '#000', '#fff').then(function(icon) {
                            el.append(image(icon));
                        });
                    }
                }
                var clicked = function() {
                    var el = angular.element(this);
                    if (el.attr('shape')) {
                        scope.symbol.shape = el.attr('shape');
                        scope.symbol.graphic = null;
                    } else if (el.attr('graphic')) {
                        scope.symbol.shape = null;
                        scope.symbol.graphic = el.attr('graphic');
                    }
                    current();
                };
                // this might be done another way but because we get canvas elements
                // back from ol3 styles, we build the dom manually
                var list = angular.element(element[0].getElementsByClassName('ol-marks'));
                stStyleChoices.symbolizers.forEach(function(s) {
                    var img = canvas(s);
                    img.attr('shape', s);
                    img.on('click', clicked);
                    list.append(img);
                });
                function updateRecent() {
                    list = angular.element(element[0].getElementsByClassName('recent-icons'));
                    list.html('');
                    iconCommons.defaults().then(function(icons) {
                        icons.forEach(function(icon, i) {
                            var img = image(icon);
                            img.on('click', clicked);
                            list.append(img);
                        });
                        // we're relying on this in the tests as a means of
                        // knowing when the recent icons loading has completed
                        scope.recent = icons;
                    });
                }
                // only in scope for triggering in tests
                scope._updateRecent = function() {
                    updateRecent();
                    current();
                };
                scope._updateRecent();
                scope.showIconCommons = function() {
                    iconCommonsSearch.search().then(function(selected) {
                        // since ol3 style creation is sync, preload icon before setting
                        stSvgIcon.getImageData(selected.href).then(function() {
                            scope.symbol.shape = null;
                            scope.symbol.graphic = selected.href;
                            scope._updateRecent();
                        });
                    });
                };
            }
        };
    }]);

    module.directive('classifyEditor', function() {
        return {
            restrict: 'E',
            templateUrl: 'style/widgets/classify-editor.html',
            scope: true,
            link: function(scope, element, attrs) {
                ['showMethod','showMaxClasses', 'showRange',
                    'showColorRamp','showColorPalette', 'attributeFilter'].forEach(function(opt) {
                    scope[opt] = attrs[opt];
                });
            }
        };
    });

    module.directive('colorRamp', function() {
        return {
            restrict: 'A',
            scope: {
                ramp: "=ramp"
            },
            link: function(scope, element, attrs) {
                function render() {
                    var ctx = element[0].getContext('2d');
                    var gradient = ctx.createLinearGradient(0, 0, attrs.width, 0);
                    Object.getOwnPropertyNames(scope.ramp).forEach(function(stop) {
                        stop = parseFloat(stop);
                        if (!isNaN(stop)) {
                            gradient.addColorStop(stop, scope.ramp[stop]);
                        }
                    });
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, attrs.width, attrs.height);
                }
                scope.$watch('ramp', render);
                render();
            }
        };
    });

    module.directive('colorField', function() {
        var regex = /(^#[0-9a-f]{6}$)|(^#[0-9a-f]{3}$)/i;
        function validColor(value) {
            // @todo support named colors?
            return regex.exec(value);
        }
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$parsers.push(function(viewValue) {
                    ctrl.$setValidity('color', validColor(viewValue));
                    return viewValue;
                });
                ctrl.$formatters.push(function(modelValue) {
                    // when loaded but also possible the picker widget modifies
                    ctrl.$setValidity('color', validColor(modelValue));
                    return modelValue;
                });
            }
        };
    });

    module.directive('noClose', function() {
        return {
            link: function($scope, $element) {
                $element.on('click', function($event) {
                    $event.stopPropagation();
                });
            }
        };
    });

    module.directive('styleTypeEditor', ["$compile", "$templateCache", function($compile, $templateCache) {
        return {
            restrict: "E",
            link: function(scope, element, attrs) {
                scope.$watch('currentEditor', function() {
                    var currentEditor = scope.currentEditor;
                    if (scope.currentEditor) {
                        var templateUrl = 'style/types/' + currentEditor.name.replace(' ', '-') + ".html";
                        element.html($templateCache.get(templateUrl));
                        $compile(element.contents())(scope);
                    } else {
                        element.html('');
                    }
                });
            }
        };
    }]);

    module.directive('rulesEditor', function() {
        return {
            restrict: 'E',
            templateUrl: 'style/rules-editor.html',
            link: function(scope, element, attrs) {
                scope.deleteRule = function(rule) {
                    scope.activeStyle.rules = scope.activeStyle.rules.filter(function(r) {
                        return r !== rule;
                    });
                };
            }
        };
    });
})();

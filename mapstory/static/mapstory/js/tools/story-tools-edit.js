!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.storytools||(o.storytools={})).edit=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.WPSClassify = require('./style/WPSClassify');
exports.SLDStyleConverter = require('./style/SLDStyleConverter');
exports.WFSDescribeFeatureType = require('./style/WFSDescribeFeatureType');
exports.StyleComplete = require('./style/StyleComplete');

},{"./style/SLDStyleConverter":2,"./style/StyleComplete":3,"./style/WFSDescribeFeatureType":4,"./style/WPSClassify":5}],2:[function(require,module,exports){
//'use strict';
exports.SLDStyleConverter = function() {
    return {
        generateStyle: function(style, layerName, asString) {
            var config = this.convertJSON(style, layerName);
            if (!this.context) {
                this.context = new owsjs.Jsonix.Context([owsjs.mappings.XLink_1_0, owsjs.mappings.Filter_1_0_0, owsjs.mappings.GML_2_1_2, owsjs.mappings.SLD_1_0_0], {
                    namespacePrefixes: {
                        'http://www.w3.org/1999/xlink': 'xlink',
                        'http://www.opengis.net/sld': 'sld',
                        'http://www.opengis.net/ogc': 'ogc'
                    }
                });
                this.marshaller = this.context.createMarshaller();
            }
            if (asString === true) {
                return this.marshaller.marshalString(config);
            } else {
                return this.marshaller.marshalDocument(config);
            }
        },
        createFill: function(style, styleRule) {
            return {
                cssParameter: [{
                    name: 'fill',
                    content: [(styleRule && styleRule.style.symbol.fillColor) ? styleRule.style.symbol.fillColor : style.symbol.fillColor]
                }, {
                    name: 'fill-opacity',
                    content: [String(styleRule ? (styleRule.style.symbol.fillOpacity || 100) / 100 : (style.symbol.fillOpacity || 100) / 100)]
                }]
            };
        },
        createStroke: function(style, styleRule) {
            var dashArray;
            if (style.stroke.strokeStyle === 'dashed') {
                dashArray = '5';
            } else if (style.stroke.strokeStyle ==='dotted') {
                dashArray = '1 2';
            }
            return {
                cssParameter: [{
                    name: 'stroke',
                    content: [(styleRule && styleRule.style.stroke.strokeColor) ? styleRule.style.stroke.strokeColor : style.stroke.strokeColor]
                }, {
                    name: 'stroke-width',
                    content: style.stroke.strokeWidth ? [String(style.stroke.strokeWidth)] : undefined
                }, {
                    name: 'stroke-opacity',
                    content: style.stroke.strokeOpacity ? [String(style.stroke.strokeOpacity / 100)] : undefined
                }, {
                    name: 'stroke-dasharray',
                    content: dashArray ? [dashArray] : undefined
                }]
            };
        },
        createPolygonSymbolizer: function(style, styleRule) {
            var fill = this.createFill(style, styleRule);
            var stroke = this.createStroke(style);
            var polygon = {
                name: {
                    localPart: 'PolygonSymbolizer',
                    namespaceURI: "http://www.opengis.net/sld"
                },
                value: {
                    fill: fill,
                    stroke: stroke
                }
            };
            return polygon;
        },
        createPointSymbolizer: function(style, styleRule) {
            var fill = this.createFill(style, styleRule); 
            var stroke = this.createStroke(style);
            var graphicOrMark;
            if (style.symbol && style.symbol.graphic) {
                var a = document.createElement("a");
                // @todo appending icon commons attributes should go elsewhere
                a.href = style.symbol.graphic + '?' +
                    'fill=' + encodeURIComponent((styleRule && styleRule.style.symbol.fillColor) ? styleRule.style.symbol.fillColor : style.symbol.fillColor) +
                    "&stroke=" + encodeURIComponent(style.stroke.strokeColor);
                graphicOrMark = [{
                        TYPE_NAME: "SLD_1_0_0.ExternalGraphic",
                        fill: fill,
                        stroke: stroke,
                        format: "image/svg+xml",
                        onlineResource: {
                            href: a.href
                        }
                    }];
            } else {
                graphicOrMark = [{
                        TYPE_NAME: "SLD_1_0_0.Mark",
                        fill: fill,
                        stroke: stroke,
                        wellKnownName: style.symbol && style.symbol.shape || 'circle'
                    }];
            }
            var opacity = 1;
            if (style.symbol && angular.isDefined(style.symbol.fillOpacity)) {
                opacity = Math.max(0.01, style.symbol.fillOpacity) / 100;
            }
            return {
                name: {
                    localPart: 'PointSymbolizer',
                    namespaceURI: "http://www.opengis.net/sld"
                },
                value: {
                    graphic: {
                        externalGraphicOrMark: graphicOrMark,
                        opacity: {
                            content: [String(opacity)]
                        },
                        size: {
                            content: [String(style.symbol && style.symbol.size || 10)]
                        },
                        rotation: style.symbol && style.symbol.rotationAttribute ? {
                            content: [style.symbol.rotationUnits === 'degrees' ? {
                                name: {
                                    localPart: "PropertyName",
                                    namespaceURI: "http://www.opengis.net/ogc"
                                },
                                value: {
                                    content: style.symbol.rotationAttribute
                                }
                            } : {
                                name: {
                                    localPart: "Div",
                                    namespaceURI: "http://www.opengis.net/ogc"
                                },
                                value: {
                                    expression: [{
                                        name: {
                                            localPart: "PropertyName",
                                            namespaceURI: "http://www.opengis.net/ogc"
                                        },
                                        value: {
                                            content: style.symbol.rotationAttribute
                                        }
                                    }, {
                                        name: {
                                            localPart: "Div",
                                            namespaceURI: "http://www.opengis.net/ogc"
                                        },
                                        value: {
                                            expression: [{
                                                name: {
                                                    localPart: "Function",
                                                    namespaceURI: "http://www.opengis.net/ogc"
                                                },
                                                value: {
                                                    name: "pi"
                                                }
                                            }, {
                                                name: {
                                                    localPart: "Literal",
                                                    namespaceURI: "http://www.opengis.net/ogc"
                                                },
                                                value: {
                                                    content: ["360"]
                                                }
                                            }]
                                        }
                                    }]
                                }
                            }]
                        } : undefined
                    }
                }
            };
        },
        createLineSymbolizer: function(style, styleRule) {
            return {
                name: {
                    localPart: 'LineSymbolizer',
                    namespaceURI: "http://www.opengis.net/sld"
                },
                value: {
                    stroke: this.createStroke(style, styleRule)
                }
            };
        },
        createTextSymbolizer: function(style) {
            var fontFamily;
            var styleFontFamily = style.label.fontFamily.toLowerCase();
            if (styleFontFamily === 'serif') {
                fontFamily  = 'Serif';
            } else if (styleFontFamily === 'sans-serif') {
                fontFamily = 'SansSerif';
            } else if (styleFontFamily === 'cursive') {
                fontFamily = 'Comic Sans MS';
            } else if (styleFontFamily === 'monospace') {
                fontFamily = 'Courier New';
            }
            return {
                name: {
                    localPart: 'TextSymbolizer',
                    namespaceURI: "http://www.opengis.net/sld"
                },
                value: {
                    fill: {
                        cssParameter: [{
                                name: 'fill',
                                content: [style.label.fillColor]
                            }]
                    },
                    halo: {
                        fill: {
                            cssParameter: [{
                                name: 'fill',
                                content: ['#FFFFFF']
                            }]
                        },
                        radius: {
                            content: ['1']
                        }
                    },
                    labelPlacement: {
                        linePlacement: {}
                    },
                    font: {
                        cssParameter: [{
                                name: 'font-family',
                                content: fontFamily ? [fontFamily]: undefined
                            }, {
                                name: 'font-size',
                                content: [String(style.label.fontSize)]
                            }, {
                                name: 'font-style',
                                content: [style.label.fontStyle]
                            }, {
                                name: 'font-weight',
                                content: [style.label.fontWeight]
                            }]
                    },
                    label: {
                        content: [{
                                name: {
                                    localPart: "PropertyName",
                                    namespaceURI: "http://www.opengis.net/ogc"
                                },
                                value: {
                                    content: style.label.attribute
                                }
                            }]
                    },
                    vendorOption: [{
                        name: 'maxDisplacement',
                        content: '40'
                    }, {
                        name: 'autoWrap',
                        content: '40'
                    }, {
                        name: 'spaceAround',
                        content: '0'
                    }, {
                        name: 'followLine',
                        content: 'false'
                    }, {
                        name: 'group',
                        content: 'yes'
                    }, {
                        name: 'goodnessOfFit',
                        content: '0.2'
                    }, {
                        name: 'conflictResolution',
                        content: 'true'
                    }]
                }
            };
        },
        convertJSON: function(style, layerName) {
            var result = {
                name: {
                    namespaceURI: 'http://www.opengis.net/sld',
                    localPart: 'StyledLayerDescriptor'
                }
            };
            result.value = {
                version: "1.0.0",
                namedLayerOrUserLayer: [{
                        TYPE_NAME: "SLD_1_0_0.NamedLayer",
                        name: layerName,
                        namedStyleOrUserStyle: [{
                                TYPE_NAME: "SLD_1_0_0.UserStyle",
                                featureTypeStyle: [{
                                        rule: []
                                    }]
                            }]
                    }]
            };
            var rule, ruleContainer = result.value.namedLayerOrUserLayer[0].namedStyleOrUserStyle[0].featureTypeStyle[0].rule;
            if (style.rules) {
                for (var i = 0, ii = style.rules.length; i < ii; ++i) {
                    var styleRule = style.rules[i];
                    var filter;
                    if (styleRule.value) {
                        filter = {
                            comparisonOps: {
                                name: {
                                    namespaceURI: "http://www.opengis.net/ogc",
                                    localPart: "PropertyIsEqualTo"
                                },
                                value: {
                                    expression: [{
                                            name: {
                                                namespaceURI: "http://www.opengis.net/ogc",
                                                localPart: "PropertyName"
                                            },
                                            value: {
                                                content: style.classify.attribute
                                            }
                                        }, {
                                            name: {
                                                namespaceURI: "http://www.opengis.net/ogc",
                                                localPart: "Literal"
                                            },
                                            value: {
                                                content: [String(styleRule.value)]
                                            }
                                        }]
                                }
                            }
                        };
                    } else if (styleRule.range) {
                        filter = {
                            comparisonOps: {
                                name: {
                                    namespaceURI: "http://www.opengis.net/ogc",
                                    localPart: "PropertyIsBetween"
                                },
                                value: {
                                    expression: {
                                        name: {
                                            namespaceURI: "http://www.opengis.net/ogc",
                                            localPart: "PropertyName"
                                        },
                                        value: {
                                            content: style.classify.attribute
                                        }
                                    },
                                    lowerBoundary: {
                                        expression: {
                                            name: {
                                                namespaceURI: "http://www.opengis.net/ogc",
                                                localPart: "Literal"
                                            },
                                            value: {
                                                content: [String(styleRule.range.min)]
                                            }
                                        }
                                    },
                                    upperBoundary: {
                                        expression: {
                                            name: {
                                                namespaceURI: "http://www.opengis.net/ogc",
                                                localPart: "Literal"
                                            },
                                            value: {
                                                content: [String(styleRule.range.max)]
                                            }
                                        }
                                    }
                                }
                            }
                        };
                    }
                    rule = {
                        filter: filter,
                        symbolizer: []
                    };
                    if (style.geomType === "point") {
                        rule.symbolizer.push(this.createPointSymbolizer(style, styleRule));
                    } else if (style.geomType === "line") {
                        rule.symbolizer.push(this.createLineSymbolizer(style, styleRule));
                    } else if (style.geomType === "polygon") {
                        rule.symbolizer.push(this.createPolygonSymbolizer(style, styleRule));
                    }
                    if (style.label && style.label.attribute !== null) {
                        rule.symbolizer.push(this.createTextSymbolizer(style));
                    }
                    ruleContainer.push(rule);
                }
            } else {
                // single rule, multiple symbolizers
                rule = {
                    symbolizer: []
                };
                ruleContainer.push(rule);
                if (style.geomType === 'point') {
                    rule.symbolizer.push(this.createPointSymbolizer(style));
                } else if (style.geomType === 'line') {
                    rule.symbolizer.push(this.createLineSymbolizer(style));
                } else if (style.geomType === 'polygon') {
                    rule.symbolizer.push(this.createPolygonSymbolizer(style));
                }
                if (style.label && style.label.attribute !== null) {
                    rule.symbolizer.push(this.createTextSymbolizer(style));
                }
            }
            return result;
        }
    };
};

},{}],3:[function(require,module,exports){
exports.StyleComplete = function() {
    return {
        isComplete: function(style) {
            if (style.classify) {
                if (style.classify.method === "unique") {
                    if (style.classify.attribute === null || style.classify.maxClasses === null || !style.classify.colorPalette) {
                        return false;
                    }
                } else if (style.classify.method === null || style.classify.attribute === null || style.classify.colorRamp === null || style.rules.length === 0) {
                    return false;
                }
            }
            return true;
        }
    };
};

},{}],4:[function(require,module,exports){
//'use strict';

exports.WFSDescribeFeatureType = function() {

    this.parseResult = function(xml) {
        if (!this.context) {
            this.context = new owsjs.Jsonix.Context([
                owsjs.mappings.XSD_1_0
            ]);
            this.unmarshaller = this.context.createUnmarshaller();
        }
        var schema = this.unmarshaller.unmarshalString(xml).value;
        var featureNS = schema.targetNamespace;
        var element = schema.complexType[0].complexContent.extension.sequence.element;
        var fields = [];
        var geometryType, timeAttr;
        for (var i=0, ii=element.length; i<ii; ++i) {
            var el = element[i];
            if (el.type.namespaceURI === 'http://www.opengis.net/gml') {
                var lp = el.type.localPart;
                if (lp.indexOf('Polygon') !== -1) {
                    geometryType = 'polygon';
                } else if (lp.indexOf('LineString') !== -1) {
                    geometryType = 'line';
                } else if (lp.indexOf('Point') !== -1) {
                    geometryType = 'point';
                }
            } else if (el.type.localPart === 'dateTime') {
                if (timeAttr === undefined) {
                    timeAttr = el.name;
                } else {
                    timeAttr = null;
                }
            }
            fields.push({name: el.name, type: el.type.localPart, typeNS: el.type.namespaceURI});
        }
        return {
            timeAttribute: timeAttr,
            featureNS: featureNS,
            geomType: geometryType,
            attributes: fields
        };
    };

};

},{}],5:[function(require,module,exports){
//'use strict';

exports.WPSClassify = function() {

    this.parseResult = function(xml) {
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var exceptions = doc.getElementsByTagNameNS('http://www.opengis.net/ows/1.1', 'ExceptionText');
        if (exceptions.length ===0) {
            var classes = doc.getElementsByTagName('Class');
            var rules = [];
            for (var i=0, ii=classes.length; i<ii; ++i) {
                var min = classes[i].getAttribute('lowerBound');
                var max = classes[i].getAttribute('upperBound');
                rules.push({
                    name: min + '-' + max,
                    range: {
                        min: min,
                        max: max
                    }
                });
            }
            return {
                success: true,
                rules: rules
            };
        } else {
            return {
                success: false,
                msg: exceptions[0].textContent
            };
        }
    };

    this.createContext = function() {
        this.context = new owsjs.Jsonix.Context([
            owsjs.mappings.XLink_1_0,
            owsjs.mappings.OWS_1_1_0,
            owsjs.mappings.Filter_1_1_0,
            owsjs.mappings.OWS_1_0_0,
            owsjs.mappings.SMIL_2_0,
            owsjs.mappings.SMIL_2_0_Language,
            owsjs.mappings.GML_3_1_1,
            owsjs.mappings.WFS_1_1_0,
            owsjs.mappings.WPS_1_0_0
        ], {
            namespacePrefixes: {
                'http://www.w3.org/1999/xlink': 'xlink',
                'http://www.opengis.net/wps/1.0.0': 'wps',
                'http://www.opengis.net/ows/1.1': 'ows',
                'http://www.opengis.net/wfs': 'wfs'
            }
        });
        this.marshaller = this.context.createMarshaller();
    };

    this.getUniqueValues = function(data, asString) {
        if (!this.context) {
            this.createContext();
        }
        var config = this.generateMainConfig('gs:Unique', "application/json", data);
        config.value.dataInputs.input.push({
            identifier: {
                value: 'attribute'
            },
            data: {
                literalData: {
                    value: data.attribute
                }
            }
        });
        if (asString === true) {
            return this.marshaller.marshalString(config);
        } else {
            return this.marshaller.marshalDocument(config);
        }
    };

    this.generateMainConfig = function(processId, mimeType, data) {
        return {
            name: {
                localPart: "Execute",
                namespaceURI: "http://www.opengis.net/wps/1.0.0"
            },
            value: {
                service: "WPS",
                version: "1.0.0",
                identifier: {
                    value: processId
                },
                responseForm: {
                    rawDataOutput: {
                        identifier: {
                            value: "results"
                        },
                        mimeType: mimeType
                    }
                },
                dataInputs: {
                    input: [{
                            identifier: {
                                value: 'features'
                            },
                            reference: {
                                method: 'POST',
                                mimeType: 'text/xml',
                                href: 'http://geoserver/wfs',
                                body: {
                                    content: [{
                                            name: {
                                                namespaceURI: "http://www.opengis.net/wfs",
                                                localPart: "GetFeature"
                                            },
                                            value: {
                                                outputFormat: "GML2",
                                                service: "WFS",
                                                version: "1.1.0",
                                                query: [{
                                                        typeName: [{ns: data.featureNS, lp: data.typeName.split(':')[1], p: data.featurePrefix}]
                                                    }]
                                            }
                                        }]
                                }
                            }
                        }
                    ]
                }
            }
        };
    };

    this.classifyVector = function(data, asString) {
        if (!this.context) {
            this.createContext();
        }
        var config = this.generateMainConfig('vec:FeatureClassStats', undefined, data);
        config.value.dataInputs.input.push({
            identifier: {
                value: 'attribute'
            },
            data: {
                literalData: {
                    value: data.attribute
                }
            }
        }, {
            identifier: {
                value: 'classes'
            },
            data: {
                literalData: {
                    value: String(data.numClasses)
                }
            }
        }, {
            identifier: {
                value: 'method'
            },
            data: {
                literalData: {
                    value: data.method
                }
            }
        }, {
            identifier: {
                value: 'stats'
            },
            data: {
                literalData: {
                    value: 'mean' /* TODO currently we need to send at least 1 stats input */
                }
            }
        });
        if (asString === true) {
            return this.marshaller.marshalString(config);
        } else {
            return this.marshaller.marshalDocument(config);
        }
    };
};

},{}]},{},[1])(1)
});
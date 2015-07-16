!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.owsjs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//'use strict';
exports.Jsonix = require('../../bower_components/jsonix/dist/Jsonix-all.js').Jsonix;
exports.mappings = {};
exports.mappings.XLink_1_0 = require('../../bower_components/w3c-schemas/scripts/lib/XLink_1_0.js').XLink_1_0;
exports.mappings.Filter_1_0_0 = require('../../bower_components/ogc-schemas/scripts/lib/Filter_1_0_0.js').Filter_1_0_0;
exports.mappings.GML_2_1_2 = require('../../bower_components/ogc-schemas/scripts/lib/GML_2_1_2.js').GML_2_1_2;
exports.mappings.SLD_1_0_0 = require('../../bower_components/ogc-schemas/scripts/lib/SLD_1_0_0.js').SLD_1_0_0;
exports.mappings.OWS_1_1_0 = require('../../bower_components/ogc-schemas/scripts/lib/OWS_1_1_0.js').OWS_1_1_0;
exports.mappings.Filter_1_1_0 = require('../../bower_components/ogc-schemas/scripts/lib/Filter_1_1_0.js').Filter_1_1_0;
exports.mappings.OWS_1_0_0 = require('../../bower_components/ogc-schemas/scripts/lib/OWS_1_0_0.js').OWS_1_0_0;
exports.mappings.SMIL_2_0 = require('../../bower_components/ogc-schemas/scripts/lib/SMIL_2_0.js').SMIL_2_0;
exports.mappings.SMIL_2_0_Language = require('../../bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language.js').SMIL_2_0_Language;
exports.mappings.GML_3_1_1 = require('../../bower_components/ogc-schemas/scripts/lib/GML_3_1_1.js').GML_3_1_1;
exports.mappings.WFS_1_1_0 = require('../../bower_components/ogc-schemas/scripts/lib/WFS_1_1_0.js').WFS_1_1_0;
exports.mappings.WPS_1_0_0 = require('../../bower_components/ogc-schemas/scripts/lib/WPS_1_0_0.js').WPS_1_0_0;
exports.mappings.XSD_1_0 = require('../../bower_components/w3c-schemas/scripts/lib/XSD_1_0.js').XSD_1_0;
exports.mappings.WMSC_1_1_1 = require('../../bower_components/ogc-schemas/scripts/lib/WMSC_1_1_1.js').WMSC_1_1_1;

// modify the JSONIX mapping to add the GeoServer specific VendorOption
exports.mappings.SLD_1_0_0.tis.push({
    ln: 'VendorOption',
    ps: [{
        n: 'name',
        an: {
            lp: 'name'
        },
            t: 'a'
        }, {
            n: 'content',
            t: 'v'
        }
    ]
});

for (var i=0, ii=exports.mappings.SLD_1_0_0.tis.length; i<ii; i++) {
    if (exports.mappings.SLD_1_0_0.tis[i].ln === 'TextSymbolizer') {
        exports.mappings.SLD_1_0_0.tis[i].ps.push({
            n: 'vendorOption',
            en: 'VendorOption',
            col: true,
            ti: '.VendorOption'
        });
    }
}
// end of modification

},{"../../bower_components/jsonix/dist/Jsonix-all.js":2,"../../bower_components/ogc-schemas/scripts/lib/Filter_1_0_0.js":3,"../../bower_components/ogc-schemas/scripts/lib/Filter_1_1_0.js":4,"../../bower_components/ogc-schemas/scripts/lib/GML_2_1_2.js":5,"../../bower_components/ogc-schemas/scripts/lib/GML_3_1_1.js":6,"../../bower_components/ogc-schemas/scripts/lib/OWS_1_0_0.js":7,"../../bower_components/ogc-schemas/scripts/lib/OWS_1_1_0.js":8,"../../bower_components/ogc-schemas/scripts/lib/SLD_1_0_0.js":9,"../../bower_components/ogc-schemas/scripts/lib/SMIL_2_0.js":10,"../../bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language.js":11,"../../bower_components/ogc-schemas/scripts/lib/WFS_1_1_0.js":12,"../../bower_components/ogc-schemas/scripts/lib/WMSC_1_1_1.js":13,"../../bower_components/ogc-schemas/scripts/lib/WPS_1_0_0.js":14,"../../bower_components/w3c-schemas/scripts/lib/XLink_1_0.js":15,"../../bower_components/w3c-schemas/scripts/lib/XSD_1_0.js":16}],2:[function(require,module,exports){
/*global window */
var _jsonix_factory = function(_jsonix_xmldom, _jsonix_xmlhttprequest, _jsonix_fs)
{
	// Complete Jsonix script is included below 
var Jsonix = {
	singleFile : true
};
Jsonix.Util = {};

Jsonix.Util.extend = function(destination, source) {
	var property, value, sourceIsEvt;
	destination = destination || {};
	if (source) {
		/*jslint forin: true */
		for (property in source) {
			value = source[property];
			if (value !== undefined) {
				destination[property] = value;
			}
		}

		/**
		 * IE doesn't include the toString property when iterating over an
		 * object's properties with the for(property in object) syntax.
		 * Explicitly check if the source has its own toString property.
		 */

		/*
		 * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
		 * prototype object" when calling hawOwnProperty if the source object is
		 * an instance of window.Event.
		 */

		// REWORK
		// Node.js
		sourceIsEvt = typeof window !== 'undefined' && window !== null && typeof window.Event === "function" && source instanceof window.Event;

		if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
			destination.toString = source.toString;
		}
	}
	return destination;
};
Jsonix.Class = function() {
	var Class = function() {
		this.initialize.apply(this, arguments);
	};
        var extended = {};
	var empty = function() {
	};
	var parent, initialize, Type;
	for (var i = 0, len = arguments.length; i < len; ++i) {
		Type = arguments[i];
		if (typeof Type == "function") {
			// make the class passed as the first argument the superclass
			if (i === 0 && len > 1) {
				initialize = Type.prototype.initialize;
				// replace the initialize method with an empty function,
				// because we do not want to create a real instance here
				Type.prototype.initialize = empty;
				// the line below makes sure that the new class has a
				// superclass
				extended = new Type();
				// restore the original initialize method
				if (initialize === undefined) {
					delete Type.prototype.initialize;
				} else {
					Type.prototype.initialize = initialize;
				}
			}
			// get the prototype of the superclass
			parent = Type.prototype;
		} else {
			// in this case we're extending with the prototype
			parent = Type;
		}
		Jsonix.Util.extend(extended, parent);
	}
	Class.prototype = extended;
	return Class;
};

Jsonix.XML = {
		XMLNS_NS : 'http://www.w3.org/2000/xmlns/',
		XMLNS_P : 'xmlns'
		
};


Jsonix.DOM = {
	createDocument : function() {
		// REWORK
		// Node.js
		if (typeof _jsonix_xmldom !== 'undefined')
		{
			return new (_jsonix_xmldom.DOMImplementation)().createDocument();
		} else if (typeof document !== 'undefined' && Jsonix.Util.Type.exists(document.implementation) && Jsonix.Util.Type.isFunction(document.implementation.createDocument)) {
			return document.implementation.createDocument('', '', null);
		} else if (typeof ActiveXObject !== 'undefined') {
			return new ActiveXObject('MSXML2.DOMDocument');
		} else {
			throw new Error('Error created the DOM document.');
		}
	},
	serialize : function(node) {
		Jsonix.Util.Ensure.ensureExists(node);
		// REWORK
		// Node.js
		if (typeof _jsonix_xmldom !== 'undefined')
		{
			return (new (_jsonix_xmldom).XMLSerializer()).serializeToString(node);
		} else if (Jsonix.Util.Type.exists(XMLSerializer)) {
			return (new XMLSerializer()).serializeToString(node);
		} else if (Jsonix.Util.Type.exists(node.xml)) {
			return node.xml;
		} else {
			throw new Error('Could not serialize the node, neither XMLSerializer nor the [xml] property were found.');
		}
	},
	parse : function(text) {
		Jsonix.Util.Ensure.ensureExists(text);
		if (typeof _jsonix_xmldom !== 'undefined')
		{
			return (new (_jsonix_xmldom).DOMParser()).parseFromString(text, 'application/xml');
		} else if (typeof DOMParser != 'undefined') {
			return (new DOMParser()).parseFromString(text, 'application/xml');
		} else if (typeof ActiveXObject != 'undefined') {
			var doc = Jsonix.DOM.createDocument('', '');
			doc.loadXML(text);
			return doc;
		} else {
			var url = 'data:text/xml;charset=utf-8,' + encodeURIComponent(text);
			var request = new XMLHttpRequest();
			request.open('GET', url, false);
			if (request.overrideMimeType) {
				request.overrideMimeType("text/xml");
			}
			request.send(null);
			return request.responseXML;
		}
	},
	load : function(url, callback, options) {

		var request = Jsonix.Request.INSTANCE;

		request.issue(
						url,
						function(transport) {
							var result;
							if (Jsonix.Util.Type.exists(transport.responseXML) && Jsonix.Util.Type.exists(transport.responseXML.documentElement)) {
								result = transport.responseXML;
							} else if (Jsonix.Util.Type.isString(transport.responseText)) {
								result = Jsonix.DOM.parse(transport.responseText);
							} else {
								throw new Error('Response does not have valid [responseXML] or [responseText].');
							}
							callback(result);

						}, function(transport) {
							throw new Error('Could not retrieve XML from URL [' + url	+ '].');

						}, options);
	},
	xlinkFixRequired : null,
	isXlinkFixRequired : function ()
	{
		if (Jsonix.DOM.xlinkFixRequired === null)
		{
			if (typeof navigator === 'undefined')
			{
				Jsonix.DOM.xlinkFixRequired = false;
			}
			else if (!!navigator.userAgent && (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)))
			{
				var doc = Jsonix.DOM.createDocument();
				var el = doc.createElement('test');
				el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'urn:test');
				doc.appendChild(el);
				var testString = Jsonix.DOM.serialize(doc);
				Jsonix.DOM.xlinkFixRequired = (testString.indexOf('xmlns:xlink') === -1);
			}
			else
			{
				Jsonix.DOM.xlinkFixRequired = false;
			}
		}
		return Jsonix.DOM.xlinkFixRequired;
	}
};
Jsonix.Request = Jsonix
		.Class({
			// REWORK
			factories : [ function() {
				return new XMLHttpRequest();
			}, function() {
				return new ActiveXObject('Msxml2.XMLHTTP');
			}, function() {
				return new ActiveXObject("Msxml2.XMLHTTP.6.0");
			}, function() {
				return new ActiveXObject("Msxml2.XMLHTTP.3.0");
			}, function() {
				return new ActiveXObject('Microsoft.XMLHTTP');
			}, function() {
				// Node.js
				if (typeof _jsonix_xmlhttprequest !== 'undefined')
				{
					var XMLHttpRequest = _jsonix_xmlhttprequest.XMLHttpRequest;
					return new XMLHttpRequest();
				}
				else
				{
					return null;
				}
			}],
			initialize : function() {
			},
			issue : function(url, onSuccess, onFailure, options) {
				Jsonix.Util.Ensure.ensureString(url);
				if (Jsonix.Util.Type.exists(onSuccess)) {
					Jsonix.Util.Ensure.ensureFunction(onSuccess);
				} else {
					onSuccess = function() {
					};
				}
				if (Jsonix.Util.Type.exists(onFailure)) {
					Jsonix.Util.Ensure.ensureFunction(onFailure);
				} else {
					onFailure = function() {
					};
				}
				if (Jsonix.Util.Type.exists(options)) {
					Jsonix.Util.Ensure.ensureObject(options);
				} else {
					options = {};
				}

				var transport = this.createTransport();

				var method = Jsonix.Util.Type.isString(options.method) ? options.method
						: 'GET';
				var async = Jsonix.Util.Type.isBoolean(options.async) ? options.async
						: true;
				var proxy = Jsonix.Util.Type.isString(options.proxy) ? options.proxy
						: Jsonix.Request.PROXY;

				var user = Jsonix.Util.Type.isString(options.user) ? options.user
						: null;
				var password = Jsonix.Util.Type.isString(options.password) ? options.password
						: null;

				if (Jsonix.Util.Type.isString(proxy) && (url.indexOf("http") === 0)) {
					url = proxy + encodeURIComponent(url);
				}

				if (Jsonix.Util.Type.isString(user)) {
					transport.open(method, url, async, user, password);
				} else {
					transport.open(method, url, async);
				}

				if (Jsonix.Util.Type.isObject(options.headers)) {

					for ( var header in options.headers) {
						if (options.headers.hasOwnProperty(header)) {
							transport.setRequestHeader(header,
									options.headers[header]);
						}
					}
				}

				var data = Jsonix.Util.Type.exists(options.data) ? options.data
						: null;
				if (!async) {
					transport.send(data);
					this.handleTransport(transport, onSuccess, onFailure);
				} else {
					var that = this;
					if (typeof window !== 'undefined') {

						transport.onreadystatechange = function() {
							that.handleTransport(transport, onSuccess,
									onFailure);
						};

						window.setTimeout(function() {
							transport.send(data);
						}, 0);
					} else {

						transport.onreadystatechange = function() {
							that.handleTransport(transport, onSuccess, onFailure);
						};
						console.log('Sending.');
						transport.send(data);
					}
				}
				return transport;

			},
			handleTransport : function(transport, onSuccess, onFailure) {
				if (transport.readyState == 4) {
					if (!transport.status || (transport.status >= 200 && transport.status < 300)) {
						onSuccess(transport);
					}
					if (transport.status && (transport.status < 200 || transport.status >= 300)) {
						onFailure(transport);
					}
				}
			},
			createTransport : function() {
				for ( var index = 0, length = this.factories.length; index < length; index++) {
					try {
						var transport = this.factories[index]();
						if (transport !== null) {
							return transport;
						}
					} catch (e) {
						// TODO log
					}
				}
				throw new Error('Could not create XML HTTP transport.');
			},
			CLASS_NAME : 'Jsonix.Request'
		});
Jsonix.Request.INSTANCE = new Jsonix.Request();
Jsonix.Request.PROXY = null;
Jsonix.Schema = {};
Jsonix.Model = {};
Jsonix.Util.Type = {
	exists : function(value) {
		return (typeof value !== 'undefined' && value !== null);
	},
	isString : function(value) {
		return typeof value === 'string';
	},
	isBoolean : function(value) {
		return typeof value === 'boolean';
	},
	isObject : function(value) {
		return typeof value === 'object';
	},
	isFunction : function(value) {
		return typeof value === 'function';
	},
	isNumber : function(value) {
		return (typeof value === 'number') && !isNaN(value);
	},
	isNumberOrNaN : function(value) {
		return (value === +value) || (Object.prototype.toString.call(value) === '[object Number]');
	},
	isNaN : function(value) {
		return Jsonix.Util.Type.isNumberOrNaN(value) && isNaN(value);
	},
	isArray : function(value) {
		// return value instanceof Array;
		return !!(value && value.concat && value.unshift && !value.callee);
	},
	isDate : function(value) {
		return !!(value && value.getTimezoneOffset && value.setUTCFullYear);
	},
	isRegExp : function(value) {
		return !!(value && value.test && value.exec && (value.ignoreCase || value.ignoreCase === false));
	},
	isEqual : function(a, b, report) {
		var doReport = Jsonix.Util.Type.isFunction(report);
		// TODO rework
		var _range = function(start, stop, step) {
			var args = slice.call(arguments);
			var solo = args.length <= 1;
			var start_ = solo ? 0 : args[0];
			var stop_ = solo ? args[0] : args[1];
			var step_ = args[2] || 1;
			var len = Math.max(Math.ceil((stop_ - start_) / step_), 0);
			var idx = 0;
			var range = new Array(len);
			while (idx < len) {
				range[idx++] = start_;
				start_ += step_;
			}
			return range;
		};

		var _keys = Object.keys || function(obj) {
			if (Jsonix.Util.Type.isArray(obj)) {
				return _range(0, obj.length);
			}
			var keys = [];
			for ( var key in obj) {
				if (obj.hasOwnProperty(key)) {
					keys[keys.length] = key;
				}
			}
			return keys;
		};

		// Check object identity.
		if (a === b) {
			return true;
		}

		// Check if both are NaNs
		if (Jsonix.Util.Type.isNaN(a) && Jsonix.Util.Type.isNaN(b)) {
			return true;
		}
		// Different types?
		var atype = typeof a;
		var btype = typeof b;
		if (atype != btype) {
			if (doReport) {
				report('Types differ [' + atype + '], [' + btype + '].');
			}
			return false;
		}
		// Basic equality test (watch out for coercions).
		if (a == b) {
			return true;
		}
		// One is falsy and the other truthy.
		if ((!a && b) || (a && !b)) {
			if (doReport) {
				report('One is falsy, the other is truthy.');
			}
			return false;
		}
		// Check dates' integer values.
		if (Jsonix.Util.Type.isDate(a) && Jsonix.Util.Type.isDate(b)) {
			return a.getTime() === b.getTime();
		}
		// Both are NaN?
		if (Jsonix.Util.Type.isNaN(a) && Jsonix.Util.Type.isNaN(b)) {
			return false;
		}
		// Compare regular expressions.
		if (Jsonix.Util.Type.isRegExp(a) && Jsonix.Util.Type.isRegExp(b)) {
			return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
		}
		// If a is not an object by this point, we can't handle it.
		if (atype !== 'object') {
			return false;
		}
		// Check for different array lengths before comparing contents.
		if (a.length && (a.length !== b.length)) {
			if (doReport) {
					report('Lengths differ.');
					report('A.length=' + a.length);
					report('B.length=' + b.length);
			}
			return false;
		}
		// Nothing else worked, deep compare the contents.
		var aKeys = _keys(a);
		var bKeys = _keys(b);
		// Different object sizes?
		if (aKeys.length != bKeys.length) {
			if (doReport) {
				report('Different number of properties [' + aKeys.length + '], [' + bKeys.length + '].');
			}
			for ( var andex = 0; andex < aKeys.length; andex++) {
				if (doReport) {
					report('A [' + aKeys[andex] + ']=' + a[aKeys[andex]]);
				}
			}
			for ( var bndex = 0; bndex < bKeys.length; bndex++) {
				if (doReport) {
					report('B [' + bKeys[bndex] + ']=' + b[bKeys[bndex]]);
				}
			}
			return false;
		}
		// Recursive comparison of contents.
		for (var kndex = 0; kndex < aKeys.length; kndex++) {
			var key = aKeys[kndex];
			if (!(key in b) || !Jsonix.Util.Type.isEqual(a[key], b[key], report)) {
				if (doReport) {
					report('One of the properties differ.');
					report('Key: [' + key + '].');
					report('Left: [' + a[key] + '].');
					report('Right: [' + b[key] + '].');
				}
				return false;
			}
		}
		return true;
	},
	cloneObject : function (source, target)
	{
		target = target || {};
		for (var p in source)
		{
			if (source.hasOwnProperty(p))
			{
				target[p] = source[p];
			}
		}
		return target;
	}
};
Jsonix.Util.NumberUtils = {
	isInteger : function(value) {
		return Jsonix.Util.Type.isNumber(value) && ((value % 1) === 0);
	}
};
Jsonix.Util.StringUtils = {
	trim : (!!String.prototype.trim) ?
	function(str) {
		Jsonix.Util.Ensure.ensureString(str);
		return str.trim();
	} :
	function(str) {
		Jsonix.Util.Ensure.ensureString(str);
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	/* isEmpty : function(str) {
		var wcm = Jsonix.Util.StringUtils.whitespaceCharactersMap;
		for (var index = 0; index < str.length; index++)
		{
			if (!wcm[str[index]])
			{
				return false;
			}
		}
		return true;
	}, */
	isEmpty : function(str) {
		var length = str.length;
		if (!length) {
			return true;
		}
		for (var index = 0; index < length; index++)
		{
			var c = str[index];
			if (c === ' ')
			{
				// skip
			}
			else if (c > '\u000D' && c < '\u0085')
			{
				return false;
			}
			else if (c < '\u00A0')
			{
				if (c < '\u0009')
				{
					return false;
				}
				else if (c > '\u0085')
				{
					return false;
				}
			}
			else if (c > '\u00A0')
			{
				if (c < '\u2028')
				{
					if (c < '\u180E')
					{
						if (c < '\u1680')
						{
							return false;
						}
						else if(c > '\u1680')
						{
							return false;
						}
					}
					else if (c > '\u180E')
					{
						if (c < '\u2000')
						{
							return false;
						}
						else if (c > '\u200A')
						{
							return false;
						}
					}
				}
				else if (c > '\u2029')
				{
					if (c < '\u205F')
					{
						if (c < '\u202F')
						{
							return false;
						}
						else if (c > '\u202F')
						{
							return false;
						}
					}
					else if (c > '\u205F')
					{
						if (c < '\u3000')
						{
							return false;
						}
						else if (c > '\u3000')
						{
							return false;
						}
					}
				}
			}
		}
		return true;
	},
	isNotBlank : function(str) {
		return Jsonix.Util.Type.isString(str) && !Jsonix.Util.StringUtils.isEmpty(str);
	},
	whitespaceCharacters: '\u0009\u000A\u000B\u000C\u000D \u0085\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000',
	whitespaceCharactersMap: {
		'\u0009' : true,
		'\u000A' : true,
		'\u000B' : true,
		'\u000C' : true,
		'\u000D' : true,
		' ' : true,
		'\u0085' : true,
		'\u00A0' : true,
		'\u1680' : true,
		'\u180E' : true,
		'\u2000' : true,
		'\u2001' : true,
		'\u2002' : true,
		'\u2003' : true,
		'\u2004' : true,
		'\u2005' : true,
		'\u2006' : true,
		'\u2007' : true,
		'\u2008' : true,
		'\u2009' : true,
		'\u200A' : true,
		'\u2028' : true,
		'\u2029' : true,
		'\u202F' : true,
		'\u205F' : true,
		'\u3000' : true
	},
	splitBySeparatorChars : function(str, separatorChars) {
		Jsonix.Util.Ensure.ensureString(str);
		Jsonix.Util.Ensure.ensureString(separatorChars);
		var len = str.length;
		if (len === 0) {
			return [];
		}
		if (separatorChars.length === 1)
		{
			return str.split(separatorChars);
		}
		else
		{
			var list = [];
			var sizePlus1 = 1;
			var i = 0;
			var start = 0;
			var match = false;
			var lastMatch = false;
			var max = -1;
			var preserveAllTokens = false;
			// standard case
				while (i < len) {
						if (separatorChars.indexOf(str.charAt(i)) >= 0) {
								if (match || preserveAllTokens) {
										lastMatch = true;
										if (sizePlus1++ == max) {
												i = len;
												lastMatch = false;
										}
										list.push(str.substring(start, i));
										match = false;
								}
								start = ++i;
								continue;
						}
						lastMatch = false;
						match = true;
						i++;
				}
				if (match || (preserveAllTokens && lastMatch)) {
					list.push(str.substring(start, i));
			}
			return list;
		}
	}
};
Jsonix.Util.Ensure = {
	ensureBoolean : function(value) {
		if (!Jsonix.Util.Type.isBoolean(value)) {
			throw new Error('Argument [' + value + '] must be a boolean.');
		}
	},
	ensureString : function(value) {
		if (!Jsonix.Util.Type.isString(value)) {
			throw new Error('Argument [' + value + '] must be a string.');
		}
	},
	ensureNumber : function(value) {
		if (!Jsonix.Util.Type.isNumber(value)) {
			throw new Error('Argument [' + value + '] must be a number.');
		}
	},
	ensureNumberOrNaN : function(value) {
		if (!Jsonix.Util.Type.isNumberOrNaN(value)) {
			throw new Error('Argument [' + value + '] must be a number or NaN.');
		}
	},
	ensureInteger : function(value) {
		if (!Jsonix.Util.Type.isNumber(value)) {
			throw new Error('Argument must be an integer, but it is not a number.');
		} else if (!Jsonix.Util.NumberUtils.isInteger(value)) {
			throw new Error('Argument [' + value + '] must be an integer.');
		}
	},
	ensureDate : function(value) {
		if (!(value instanceof Date)) {
			throw new Error('Argument [' + value + '] must be a date.');
		}
	},
	ensureObject : function(value) {
		if (!Jsonix.Util.Type.isObject(value)) {
			throw new Error('Argument [' + value + '] must be an object.');
		}
	},
	ensureArray : function(value) {
		if (!Jsonix.Util.Type.isArray(value)) {
			throw new Error('Argument [' + value + '] must be an array.');
		}
	},
	ensureFunction : function(value) {
		if (!Jsonix.Util.Type.isFunction(value)) {
			throw new Error('Argument [' + value + '] must be a function.');
		}
	},
	ensureExists : function(value) {
		if (!Jsonix.Util.Type.exists(value)) {
			throw new Error('Argument [' + value + '] does not exist.');
		}
	}
};
Jsonix.XML.QName = Jsonix.Class({
	key : null,
	namespaceURI : null,
	localPart : null,
	prefix : null,
	string : null,
	initialize : function(one, two, three) {
		var namespaceURI;
		var localPart;
		var prefix;
		var key;
		var string;

		if (!Jsonix.Util.Type.exists(two)) {
			namespaceURI = '';
			localPart = one;
			prefix = '';
		} else if (!Jsonix.Util.Type.exists(three)) {
			namespaceURI = Jsonix.Util.Type.exists(one) ? one : '';
			localPart = two;
			var colonPosition = two.indexOf(':');
			if (colonPosition > 0 && colonPosition < two.length) {
				prefix = two.substring(0, colonPosition);
				localPart = two.substring(colonPosition + 1);
			} else {
				prefix = '';
				localPart = two;
			}
		} else {
			namespaceURI = Jsonix.Util.Type.exists(one) ? one : '';
			localPart = two;
			prefix = Jsonix.Util.Type.exists(three) ? three : '';
		}
		this.namespaceURI = namespaceURI;
		this.localPart = localPart;
		this.prefix = prefix;

		this.key = (namespaceURI !== '' ? ('{' + namespaceURI + '}') : '') + localPart;
		this.string = (namespaceURI !== '' ? ('{' + namespaceURI + '}') : '') + (prefix !== '' ? (prefix + ':') : '') + localPart;
	},
	toString : function() {
		return this.string;
	},
	clone : function() {
		return new Jsonix.XML.QName(this.namespaceURI, this.localPart, this.prefix);
	},
	equals : function(that) {
		if (!that) {
			return false;
		} else {
			return (this.namespaceURI == that.namespaceURI) && (this.localPart == that.localPart);
		}

	},
	CLASS_NAME : "Jsonix.XML.QName"
});
Jsonix.XML.QName.fromString = function(qNameAsString) {
	var leftBracket = qNameAsString.indexOf('{');
	var rightBracket = qNameAsString.lastIndexOf('}');
	var namespaceURI;
	var prefixedName;
	if ((leftBracket === 0) && (rightBracket > 0) && (rightBracket < qNameAsString.length)) {
		namespaceURI = qNameAsString.substring(1, rightBracket);
		prefixedName = qNameAsString.substring(rightBracket + 1);
	} else {
		namespaceURI = '';
		prefixedName = qNameAsString;
	}
	var colonPosition = prefixedName.indexOf(':');
	var prefix;
	var localPart;
	if (colonPosition > 0 && colonPosition < prefixedName.length) {
		prefix = prefixedName.substring(0, colonPosition);
		localPart = prefixedName.substring(colonPosition + 1);
	} else {
		prefix = '';
		localPart = prefixedName;
	}
	return new Jsonix.XML.QName(namespaceURI, localPart, prefix);
};
Jsonix.XML.QName.fromObject = function(object) {
	Jsonix.Util.Ensure.ensureObject(object);
	if (object instanceof Jsonix.XML.QName || (Jsonix.Util.Type.isString(object.CLASS_NAME) && object.CLASS_NAME === 'Jsonix.XML.QName')) {
		return object;
	}
	var localPart = object.localPart||object.lp||null;
	Jsonix.Util.Ensure.ensureString(localPart);
	var namespaceURI = object.namespaceURI||object.ns||'';
	var prefix = object.prefix||object.p||'';
	return new Jsonix.XML.QName(namespaceURI, localPart, prefix);
};
Jsonix.XML.QName.key = function(namespaceURI, localPart) {
	Jsonix.Util.Ensure.ensureString(localPart);
	if (namespaceURI) {
		var colonPosition = localPart.indexOf(':');
		if (colonPosition > 0 && colonPosition < localPart.length) {
			localName = localPart.substring(colonPosition + 1);
		} else {
			localName = localPart;
		}
		return '{' + namespaceURI + '}' + localName;
	} else {
		return localPart;
	}
};
Jsonix.XML.Calendar = Jsonix.Class({
	year : NaN,
	month : NaN,
	day : NaN,
	hour : NaN,
	minute : NaN,
	second : NaN,
	fractionalSecond : NaN,
	timezone : NaN,
	initialize : function(data) {
		Jsonix.Util.Ensure.ensureObject(data);
		// Year
		if (Jsonix.Util.Type.exists(data.year)) {
			Jsonix.Util.Ensure.ensureInteger(data.year);
			if (data.year >= -9999 && data.year <= 9999) {
				this.year = data.year;
			} else {
				throw new Error('Invalid year [' + data.year + '].');
			}

		} else {
			this.year = NaN;
		}
		// Month
		if (Jsonix.Util.Type.exists(data.month)) {
			Jsonix.Util.Ensure.ensureInteger(data.month);
			if (data.month >= 1 && data.month <= 12) {
				this.month = data.month;
			} else {
				throw new Error('Invalid month [' + data.month + '].');
			}

		} else {
			this.month = NaN;
		}
		// Day
		if (Jsonix.Util.Type.exists(data.day)) {
			Jsonix.Util.Ensure.ensureInteger(data.day);
			if (data.day >= 1 && data.day <= 31) {
				this.day = data.day;
			} else {
				throw new Error('Invalid day [' + data.day + '].');
			}

		} else {
			this.day = NaN;
		}
		// Hour
		if (Jsonix.Util.Type.exists(data.hour)) {
			Jsonix.Util.Ensure.ensureInteger(data.hour);
			if (data.hour >= 0 && data.hour <= 23) {
				this.hour = data.hour;
			} else {
				throw new Error('Invalid hour [' + data.hour + '].');
			}

		} else {
			this.hour = NaN;
		}
		// Minute
		if (Jsonix.Util.Type.exists(data.minute)) {
			Jsonix.Util.Ensure.ensureInteger(data.minute);
			if (data.minute >= 0 && data.minute <= 59) {
				this.minute = data.minute;
			} else {
				throw new Error('Invalid minute [' + data.minute + '].');
			}

		} else {
			this.minute = NaN;
		}
		// Second
		if (Jsonix.Util.Type.exists(data.second)) {
			Jsonix.Util.Ensure.ensureInteger(data.second);
			if (data.second >= 0 && data.second <= 59) {
				this.second = data.second;
			} else {
				throw new Error('Invalid second [' + data.second + '].');
			}

		} else {
			this.second = NaN;
		}
		// Fractional second
		if (Jsonix.Util.Type.exists(data.fractionalSecond)) {
			Jsonix.Util.Ensure.ensureNumber(data.fractionalSecond);
			if (data.fractionalSecond >= 0 && data.fractionalSecond < 1) {
				this.fractionalSecond = data.fractionalSecond;
			} else {
				throw new Error('Invalid fractional second [' + data.fractionalSecond + '].');
			}

		} else {
			this.fractionalSecond = NaN;
		}
		// Timezone
		if (Jsonix.Util.Type.exists(data.timezone)) {
			if (Jsonix.Util.Type.isNaN(data.timezone)) {
				this.timezone = NaN;
			} else {
				Jsonix.Util.Ensure.ensureInteger(data.timezone);
				if (data.timezone >= -1440 && data.timezone < 1440) {
					this.timezone = data.timezone;
				} else {
					throw new Error('Invalid timezone [' + data.timezone + '].');
				}
			}
		} else {
			this.timezone = NaN;
		}
	},
	CLASS_NAME : "Jsonix.XML.Calendar"
});
Jsonix.XML.Calendar.fromObject = function(object) {
	Jsonix.Util.Ensure.ensureObject(object);
	if (Jsonix.Util.Type.isString(object.CLASS_NAME) && object.CLASS_NAME === 'Jsonix.XML.Calendar') {
		return object;
	}
	return new Jsonix.XML.Calendar(object);
};
Jsonix.XML.Input = Jsonix.Class({
	root : null,
	node : null,
	attributes : null,
	eventType : null,
	pns : null,
	initialize : function(node) {
		Jsonix.Util.Ensure.ensureExists(node);
		this.root = node;
		var rootPnsItem =
		{
			'' : ''
		};
		rootPnsItem[Jsonix.XML.XMLNS_P] = Jsonix.XML.XMLNS_NS;
		this.pns = [rootPnsItem];
	},
	hasNext : function() {
		// No current node, we've not started yet
		if (this.node === null) {
			return true;
		} else if (this.node === this.root) {
			var nodeType = this.node.nodeType;
			// Root node is document, last event type is END_DOCUMENT
			if (nodeType === 9 && this.eventType === 8) {
				return false;
			}
			// Root node is element, last event type is END_ELEMENT
			else if (nodeType === 1 && this.eventType === 2) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	},
	next : function() {
		if (this.eventType === null) {
			return this.enter(this.root);
		}
		// START_DOCUMENT
		if (this.eventType === 7) {
			var documentElement = this.node.documentElement;
			if (documentElement) {
				return this.enter(documentElement);
			} else {
				return this.leave(this.node);
			}
		} else if (this.eventType === 1) {
			var firstChild = this.node.firstChild;
			if (firstChild) {
				return this.enter(firstChild);
			} else {
				return this.leave(this.node);
			}
		} else if (this.eventType === 2) {
			var nextSibling = this.node.nextSibling;
			if (nextSibling) {
				return this.enter(nextSibling);
			} else {
				return this.leave(this.node);
			}
		} else {
			return this.leave(this.node);
		}
	},
	enter : function(node) {
		var nodeType = node.nodeType;
		this.node = node;
		this.attributes = null;
		// Document node
		if (nodeType === 1) {
			// START_ELEMENT
			this.eventType = 1;
			this.pushNS(node);
			return this.eventType;
		} else if (nodeType === 2) {
			// ATTRIBUTE
			this.eventType = 10;
			return this.eventType;
		} else if (nodeType === 3) {
			var nodeValue = node.nodeValue;
			if (Jsonix.Util.StringUtils.isEmpty(nodeValue)) {
				// SPACE
				this.eventType = 6;
			} else {
				// CHARACTERS
				this.eventType = 4;
			}
			return this.eventType;
		} else if (nodeType === 4) {
			// CDATA
			this.eventType = 12;
			return this.eventType;
		} else if (nodeType === 5) {
			// ENTITY_REFERENCE_NODE = 5
			// ENTITY_REFERENCE
			this.eventType = 9;
			return this.eventType;
		} else if (nodeType === 6) {
			// ENTITY_DECLARATION
			this.eventType = 15;
			return this.eventType;
		} else if (nodeType === 7) {
			// PROCESSING_INSTRUCTION
			this.eventType = 3;
			return this.eventType;
		} else if (nodeType === 8) {
			// COMMENT
			this.eventType = 5;
			return this.eventType;
		} else if (nodeType === 9) {
			// START_DOCUMENT
			this.eventType = 7;
			return this.eventType;
		} else if (nodeType === 10) {
			// DTD
			this.eventType = 12;
			return this.eventType;
		} else if (nodeType === 12) {
			// NOTATION_DECLARATION
			this.eventType = 14;
			return this.eventType;
		} else {
			// DOCUMENT_FRAGMENT_NODE = 11
			throw new Error("Node type [" + nodeType + '] is not supported.');
		}
	},
	leave : function(node) {
		if (node.nodeType === 9) {
			if (this.eventType == 8) {
				throw new Error("Invalid state.");
			} else {
				this.node = node;
				this.attributes = null;
				// END_ELEMENT
				this.eventType = 8;
				return this.eventType;
			}
		} else if (node.nodeType === 1) {
			if (this.eventType == 2) {
				var nextSibling = node.nextSibling;
				if (nextSibling) {
					return this.enter(nextSibling);
				}
			} else {
				this.node = node;
				this.attributes = null;
				// END_ELEMENT
				this.eventType = 2;
				this.popNS();
				return this.eventType;
			}
		}

		var nextSibling1 = node.nextSibling;
		if (nextSibling1) {
			return this.enter(nextSibling1);
		} else {
			var parentNode = node.parentNode;
			this.node = parentNode;
			this.attributes = null;
			if (parentNode.nodeType === 9) {
				this.eventType = 8;
			} else {
				this.eventType = 2;
			}
			return this.eventType;
		}
	},
	getName : function() {
		var node = this.node;
		if (Jsonix.Util.Type.isString(node.nodeName)) {
			if (Jsonix.Util.Type.isString(node.namespaceURI)) {
				return new Jsonix.XML.QName(node.namespaceURI, node.nodeName);
			} else {
				return new Jsonix.XML.QName(node.nodeName);
			}
		} else {
			return null;
		}
	},
	getNameKey : function() {
		var node = this.node;
		if (Jsonix.Util.Type.isString(node.nodeName)) {
			return Jsonix.XML.QName.key(node.namespaceURI, node.nodeName);
		} else {
			return null;
		}
	},
	getText : function() {
		return this.node.nodeValue;
	},
	nextTag : function() {
		var et = this.next();
		// TODO isWhiteSpace
		while (et === 7 || et === 4 || et === 12 || et === 6 || et === 3 || et === 5) {
			et = this.next();
		}
		if (et !== 1 && et !== 2) {
			// TODO location
			throw new Error('Expected start or end tag.');
		}
		return et;
	},
	skipElement : function() {
		if (this.eventType !== Jsonix.XML.Input.START_ELEMENT) {
			throw new Error("Parser must be on START_ELEMENT to skip element.");
		}
		var numberOfOpenTags = 1;
		var et;
		do {
			et = this.nextTag();
		    numberOfOpenTags += (et === Jsonix.XML.Input.START_ELEMENT) ? 1 : -1;
		  } while (numberOfOpenTags > 0);
		return et;
	},	
	getElementText : function() {
		if (this.eventType != 1) {
			throw new Error("Parser must be on START_ELEMENT to read next text.");
		}
		var et = this.next();
		var content = '';
		while (et !== 2) {
			if (et === 4 || et === 12 || et === 6 || et === 9) {
				content = content + this.getText();
			} else if (et === 3 || et === 5) {
				// Skip PI or comment
			} else if (et === 8) {
				// End document
				throw new Error("Unexpected end of document when reading element text content.");
			} else if (et === 1) {
				// End element
				// TODO location
				throw new Error("Element text content may not contain START_ELEMENT.");
			} else {
				// TODO location
				throw new Error("Unexpected event type [" + et + "].");
			}
			et = this.next();
		}
		return content;
	},
	getAttributeCount : function() {
		var attributes;
		if (this.attributes) {
			attributes = this.attributes;
		} else if (this.eventType === 1) {
			attributes = this.node.attributes;
			this.attributes = attributes;
		} else if (this.eventType === 10) {
			attributes = this.node.parentNode.attributes;
			this.attributes = attributes;
		} else {
			throw new Error("Number of attributes can only be retrieved for START_ELEMENT or ATTRIBUTE.");
		}
		return attributes.length;
	},
	getAttributeName : function(index) {
		var attributes;
		if (this.attributes) {
			attributes = this.attributes;
		} else if (this.eventType === 1) {
			attributes = this.node.attributes;
			this.attributes = attributes;
		} else if (this.eventType === 10) {
			attributes = this.node.parentNode.attributes;
			this.attributes = attributes;
		} else {
			throw new Error("Attribute name can only be retrieved for START_ELEMENT or ATTRIBUTE.");
		}
		if (index < 0 || index >= attributes.length) {
			throw new Error("Invalid attribute index [" + index + "].");
		}
		var attribute = attributes[index];
		
		
		if (Jsonix.Util.Type.isString(attribute.namespaceURI)) {
			return new Jsonix.XML.QName(attribute.namespaceURI, attribute.nodeName);
		} else {
			return new Jsonix.XML.QName(attribute.nodeName);
		}
	},
	getAttributeNameKey : function(index) {
		var attributes;
		if (this.attributes) {
			attributes = this.attributes;
		} else if (this.eventType === 1) {
			attributes = this.node.attributes;
			this.attributes = attributes;
		} else if (this.eventType === 10) {
			attributes = this.node.parentNode.attributes;
			this.attributes = attributes;
		} else {
			throw new Error("Attribute name key can only be retrieved for START_ELEMENT or ATTRIBUTE.");
		}
		if (index < 0 || index >= attributes.length) {
			throw new Error("Invalid attribute index [" + index + "].");
		}
		var attribute = attributes[index];

		return Jsonix.XML.QName.key(attribute.namespaceURI, attribute.nodeName);
	},
	getAttributeValue : function(index) {
		var attributes;
		if (this.attributes)
		{
			attributes = this.attributes;
		} else if (this.eventType === 1) {
			attributes = this.node.attributes;
			this.attributes = attributes;
		} else if (this.eventType === 10) {
			attributes = this.node.parentNode.attributes;
			this.attributes = attributes;
		} else {
			throw new Error("Attribute value can only be retrieved for START_ELEMENT or ATTRIBUTE.");
		}
		if (index < 0 || index >= attributes.length) {
			throw new Error("Invalid attribute index [" + index + "].");
		}
		var attribute = attributes[index];
		return attribute.value;
	},
	getElement : function() {
		if (this.eventType === 1 || this.eventType === 2) {
			// Go to the END_ELEMENT
			this.eventType = 2;
			return this.node;
		} else {
			throw new Error("Parser must be on START_ELEMENT or END_ELEMENT to return current element.");
		}
	},
	pushNS : function (node) {
		var pindex = this.pns.length - 1;
		var parentPnsItem = this.pns[pindex];
		var pnsItem = Jsonix.Util.Type.isObject(parentPnsItem) ? pindex : parentPnsItem;
		this.pns.push(pnsItem);
		pindex++;
		var reference = true;
		if (node.attributes)
		{
			var attributes = node.attributes;
			var alength = attributes.length;
			if (alength > 0)
			{
				// If given node has attributes
				for (var aindex = 0; aindex < alength; aindex++)
				{
					var attribute = attributes[aindex];
					var attributeName = attribute.nodeName;
					var p = null;
					var ns = null;
					var isNS = false;
					if (attributeName === 'xmlns')
					{
						p = '';
						ns = attribute.value;
						isNS = true;
					}
					else if (attributeName.substring(0, 6) === 'xmlns:')
					{
						p = attributeName.substring(6);
						ns = attribute.value;
						isNS = true;
					}
					// Attribute is a namespace declaration
					if (isNS)
					{
						if (reference)
						{
							pnsItem = Jsonix.Util.Type.cloneObject(this.pns[pnsItem], {});
							this.pns[pindex] = pnsItem;
							reference = false;
						}
						pnsItem[p] = ns;
					}
				}
			}
		}		
	},
	popNS : function () {
		this.pns.pop();
	},
	getNamespaceURI : function (p) {
		var pindex = this.pns.length - 1;
		var pnsItem = this.pns[pindex];
		pnsItem = Jsonix.Util.Type.isObject(pnsItem) ? pnsItem : this.pns[pnsItem];
		return pnsItem[p];
	},
	CLASS_NAME : "Jsonix.XML.Input"

});

Jsonix.XML.Input.START_ELEMENT = 1;
Jsonix.XML.Input.END_ELEMENT = 2;
Jsonix.XML.Input.PROCESSING_INSTRUCTION = 3;
Jsonix.XML.Input.CHARACTERS = 4;
Jsonix.XML.Input.COMMENT = 5;
Jsonix.XML.Input.SPACE = 6;
Jsonix.XML.Input.START_DOCUMENT = 7;
Jsonix.XML.Input.END_DOCUMENT = 8;
Jsonix.XML.Input.ENTITY_REFERENCE = 9;
Jsonix.XML.Input.ATTRIBUTE = 10;
Jsonix.XML.Input.DTD = 11;
Jsonix.XML.Input.CDATA = 12;
Jsonix.XML.Input.NAMESPACE = 13;
Jsonix.XML.Input.NOTATION_DECLARATION = 14;
Jsonix.XML.Input.ENTITY_DECLARATION = 15;

Jsonix.XML.Output = Jsonix.Class({
	document : null,
	documentElement : null,
	node : null,
	nodes : null,
	nsp : null,
	pns : null,
	namespacePrefixIndex : 0,
	xmldom : null,
	initialize : function(options) {
		// REWORK
		if (typeof ActiveXObject !== 'undefined') {
			this.xmldom = new ActiveXObject("Microsoft.XMLDOM");
		} else {
			this.xmldom = null;
		}
		this.nodes = [];
		var rootNspItem =
		{
			'' : ''
		};
		rootNspItem[Jsonix.XML.XMLNS_NS] = Jsonix.XML.XMLNS_P;
		if (Jsonix.Util.Type.isObject(options)) {
			if (Jsonix.Util.Type.isObject(options.namespacePrefixes)) {
				Jsonix.Util.Type.cloneObject(options.namespacePrefixes, rootNspItem);
			}
		}
		this.nsp = [rootNspItem];
		var rootPnsItem =
		{
			'' : ''
		};
		rootPnsItem[Jsonix.XML.XMLNS_P] = Jsonix.XML.XMLNS_NS;
		this.pns = [rootPnsItem];
	},
	destroy : function() {
		this.xmldom = null;
	},
	writeStartDocument : function() {
		// TODO Check
		var doc = Jsonix.DOM.createDocument();
		this.document = doc;
		return this.push(doc);
	},
	writeEndDocument : function() {
		return this.pop();

	},
	writeStartElement : function(name) {
		Jsonix.Util.Ensure.ensureObject(name);
		var localPart = name.localPart || name.lp || null;
		Jsonix.Util.Ensure.ensureString(localPart);
		var ns = name.namespaceURI || name.ns || null;
		var namespaceURI = Jsonix.Util.Type.isString(ns) ? ns : '';

		var p = name.prefix || name.p;
		var prefix = this.getPrefix(namespaceURI, p);

		var qualifiedName = (!prefix ? localPart : prefix + ':' + localPart);

		var element;
		if (Jsonix.Util.Type.isFunction(this.document.createElementNS))	{
			element = this.document.createElementNS(namespaceURI, qualifiedName);
		}
		else if (this.xmldom) {
			element = this.xmldom.createNode(1, qualifiedName, namespaceURI);

		} else {
			throw new Error("Could not create an element node.");
		}
		this.peek().appendChild(element);
		this.push(element);
		this.declareNamespace(namespaceURI, prefix);
		if (this.documentElement === null)
		{
			this.documentElement = element;
			this.declareNamespaces();
		}
		return element;
	},
	writeEndElement : function() {
		return this.pop();
	},
	writeCharacters : function(text) {
		var node;
		if (Jsonix.Util.Type.isFunction(this.document.createTextNode))	{
			node = this.document.createTextNode(text);
		}
		else if (this.xmldom) {
			node = this.xmldom.createTextNode(text);
		} else {
			throw new Error("Could not create a text node.");
		}
		this.peek().appendChild(node);
		return node;

	},
	writeAttribute : function(name, value) {
		Jsonix.Util.Ensure.ensureString(value);
		Jsonix.Util.Ensure.ensureObject(name);
		var localPart = name.localPart || name.lp || null;
		Jsonix.Util.Ensure.ensureString(localPart);
		var ns = name.namespaceURI || name.ns || null;
		var namespaceURI = Jsonix.Util.Type.isString(ns) ? ns : '';
		var p = name.prefix || name.p || null;
		var prefix = this.getPrefix(namespaceURI, p);

		var qualifiedName = (!prefix ? localPart : prefix + ':' + localPart);

		var node = this.peek();

		if (namespaceURI === '') {
			node.setAttribute(qualifiedName, value);
		} else {
			if (node.setAttributeNS) {
				node.setAttributeNS(namespaceURI, qualifiedName, value);
			} else {
				if (this.xmldom) {
					var attribute = this.document.createNode(2, qualifiedName, namespaceURI);
					attribute.nodeValue = value;
					node.setAttributeNode(attribute);
				}
				else if (namespaceURI === Jsonix.XML.XMLNS_NS)
				{
					// XMLNS namespace may be processed unqualified
					node.setAttribute(qualifiedName, value);
				}
				else
				{
					throw new Error("The [setAttributeNS] method is not implemented");
				}
			}
			this.declareNamespace(namespaceURI, prefix);
		}
		
	},
	writeNode : function(node) {
		var importedNode;
		if (Jsonix.Util.Type.exists(this.document.importNode)) {
			importedNode = this.document.importNode(node, true);
		} else {
			importedNode = node;
		}
		this.peek().appendChild(importedNode);
		return importedNode;
	},
	push : function(node) {
		this.nodes.push(node);
		this.pushNS();
		return node;
	},
	peek : function() {
		return this.nodes[this.nodes.length - 1];
	},
	pop : function() {
		this.popNS();
		var result = this.nodes.pop();
		return result;
	},
	pushNS : function ()
	{
		var nindex = this.nsp.length - 1;
		var pindex = this.pns.length - 1;
		var parentNspItem = this.nsp[nindex];
		var parentPnsItem = this.pns[pindex];
		var nspItem = Jsonix.Util.Type.isObject(parentNspItem) ? nindex : parentNspItem;
		var pnsItem = Jsonix.Util.Type.isObject(parentPnsItem) ? pindex : parentPnsItem;
		this.nsp.push(nspItem);
		this.pns.push(pnsItem);
	},
	popNS : function ()
	{
		this.nsp.pop();
		this.pns.pop();
	},
	declareNamespaces : function ()
	{
		var index = this.nsp.length - 1;
		var nspItem = this.nsp[index];
		nspItem = Jsonix.Util.Type.isNumber(nspItem) ? this.nsp[nspItem] : nspItem;
		var ns, p;
		for (ns in nspItem)
		{
			if (nspItem.hasOwnProperty(ns))
			{
				p = nspItem[ns];
				this.declareNamespace(ns, p);
			}
		}
	},
	declareNamespace : function (ns, p)
	{
		var index = this.pns.length - 1;
		var pnsItem = this.pns[index];
		var reference;
		if (Jsonix.Util.Type.isNumber(pnsItem))
		{
			// Resolve the reference
			reference = true;
			pnsItem = this.pns[pnsItem];
		}
		else
		{
			reference = false;
		}
		// If this prefix is mapped to a different namespace and must be redeclared
		if (pnsItem[p] !== ns)
		{
			if (p === '')
			{
				this.writeAttribute({ns : Jsonix.XML.XMLNS_NS, lp : Jsonix.XML.XMLNS_P}, ns);
			}
			else
			{
				this.writeAttribute({ns : Jsonix.XML.XMLNS_NS, lp : p, p : Jsonix.XML.XMLNS_P}, ns);
			}
			if (reference)
			{
				// If this was a reference, clone it and replace the reference
				pnsItem = Jsonix.Util.Type.cloneObject(pnsItem, {});
				this.pns[index] = pnsItem;
			}
			pnsItem[p] = ns;
		}
	},
	getPrefix : function (ns, p)
	{
		var index = this.nsp.length - 1;
		var nspItem = this.nsp[index];
		var reference;
		if (Jsonix.Util.Type.isNumber(nspItem))
		{
			// This is a reference, the item is the index of the parent item
			reference = true;
			nspItem = this.nsp[nspItem];
		}
		else
		{
			reference = false;
		}
		if (Jsonix.Util.Type.isString(p))
		{
			var oldp = nspItem[ns];
			// If prefix is already declared and equals the proposed prefix 
			if (p === oldp)
			{
				// Nothing to do
			}
			else
			{
				// If this was a reference, we have to clone it now
				if (reference)
				{
					nspItem = Jsonix.Util.Type.cloneObject(nspItem, {});
					this.nsp[index] = nspItem;
				}
				nspItem[ns] = p;
			}
		}
		else
		{
			p = nspItem[ns];
			if (!Jsonix.Util.Type.exists(p)) {
				p = 'p' + (this.namespacePrefixIndex++);
				// If this was a reference, we have to clone it now
				if (reference)
				{
					nspItem = Jsonix.Util.Type.cloneObject(nspItem, {});
					this.nsp[index] = nspItem;
				}
				nspItem[ns] = p;
			}
		}
		return p;
	},
	CLASS_NAME : "Jsonix.XML.Output"
});
Jsonix.Model.TypeInfo = Jsonix.Class({
	name : null,
	initialize : function() {
	},
	CLASS_NAME : 'Jsonix.Model.TypeInfo'
});
Jsonix.Model.Adapter = Jsonix.Class({
	initialize : function() {
	},
	unmarshal: function(typeInfo, context, input, scope)
	{
		return typeInfo.unmarshal(context, input, scope);
	},
	marshal: function(typeInfo, value, context, output, scope)
	{
		typeInfo.marshal(value, context, output, scope);
	},	
	CLASS_NAME : "Jsonix.Model.Adapter"
});
Jsonix.Model.Adapter.INSTANCE = new Jsonix.Model.Adapter();
// TODO is this correct?
Jsonix.Model.Adapter.getAdapter = function (elementInfo)
{
	Jsonix.Util.Ensure.ensureObject(elementInfo);
	return Jsonix.Util.Type.exists(elementInfo.adapter) ? elementInfo.adapter : Jsonix.Model.Adapter.INSTANCE;
};
Jsonix.Model.ClassInfo = Jsonix
		.Class(Jsonix.Model.TypeInfo, {
			name : null,
			baseTypeInfo : null,
			instanceFactory : null,
			properties : null,
			structure : null,
			defaultElementNamespaceURI : '',
			defaultAttributeNamespaceURI : '',
			built : false,
			initialize : function(mapping) {
				Jsonix.Model.TypeInfo.prototype.initialize.apply(this, []);
				Jsonix.Util.Ensure.ensureObject(mapping);
				var n = mapping.name||mapping.n||undefined;
				Jsonix.Util.Ensure.ensureString(n);
				this.name = n;
				
				var dens = mapping.defaultElementNamespaceURI||mapping.dens||'';
				this.defaultElementNamespaceURI = dens;

				var dans = mapping.defaultAttributeNamespaceURI||mapping.dans||'';
				this.defaultAttributeNamespaceURI = dans;
				
				var bti = mapping.baseTypeInfo||mapping.bti||null;
				this.baseTypeInfo = bti;
				
				var inF = mapping.instanceFactory||mapping.inF||undefined;
				if (Jsonix.Util.Type.exists(inF)) {
					// TODO: should we support instanceFactory as functions?
					// For the pure JSON configuration?
					Jsonix.Util.Ensure.ensureFunction(inF);
					this.instanceFactory = inF;
				}
				
				this.properties = [];
				var ps = mapping.propertyInfos||mapping.ps||[];
				Jsonix.Util.Ensure.ensureArray(ps);
				for ( var index = 0; index < ps.length; index++) {
					this.p(ps[index]);
				}
			},
			// Obsolete
			destroy : function() {
			},
			build : function(context, module) {
				if (!this.built) {
					this.baseTypeInfo = context.resolveTypeInfo(this.baseTypeInfo, module);
					if (Jsonix.Util.Type.exists(this.baseTypeInfo)) {
						this.baseTypeInfo.build(context, module);
					}

					// Build properties in this context
					for ( var index = 0; index < this.properties.length; index++) {
						var propertyInfo = this.properties[index];
						propertyInfo.build(context, module);
					}

					// Build the structure
					var structure = {
						elements : null,
						attributes : {},
						anyAttribute : null,
						value : null,
						any : null
					};
					this.buildStructure(context, structure);
					this.structure = structure;
				}
			},
			buildStructure : function(context, structure) {
				if (Jsonix.Util.Type.exists(this.baseTypeInfo)) {
					this.baseTypeInfo.buildStructure(context, structure);
				}
				for ( var index = 0; index < this.properties.length; index++) {
					var propertyInfo = this.properties[index];
					propertyInfo.buildStructure(context, structure);
				}
			},
			unmarshal : function(context, input) {
				this.build(context);
				var result;
				
				if (this.instanceFactory) {
					result = new this.instanceFactory();
				}
				else
				{
					result = { TYPE_NAME : this.name }; 
				}
				
				if (input.eventType !== 1) {
					throw new Error("Parser must be on START_ELEMENT to read a class info.");
				}

				// Read attributes
				if (Jsonix.Util.Type.exists(this.structure.attributes)) {
					var attributeCount = input.getAttributeCount();
					if (attributeCount !== 0) {
						for ( var index = 0; index < attributeCount; index++) {
							var attributeNameKey = input
									.getAttributeNameKey(index);
							if (Jsonix.Util.Type
									.exists(this.structure.attributes[attributeNameKey])) {
								var attributeValue = input
										.getAttributeValue(index);
								if (Jsonix.Util.Type.isString(attributeValue)) {
									var attributePropertyInfo = this.structure.attributes[attributeNameKey];
									this.unmarshalPropertyValue(context, input,
											attributePropertyInfo, result,
											attributeValue);
								}
							}
						}
					}
				}
				// Read any attribute
				if (Jsonix.Util.Type.exists(this.structure.anyAttribute)) {
					var propertyInfo = this.structure.anyAttribute;
					this
							.unmarshalProperty(context, input, propertyInfo,
									result);
				}
				// Read elements
				if (Jsonix.Util.Type.exists(this.structure.elements)) {

					var et = input.next();
					while (et !== Jsonix.XML.Input.END_ELEMENT) {
						if (et === Jsonix.XML.Input.START_ELEMENT) {
							// New sub-element starts
							var elementNameKey = input.getNameKey();
							if (Jsonix.Util.Type
									.exists(this.structure.elements[elementNameKey])) {
								var elementPropertyInfo = this.structure.elements[elementNameKey];
								this.unmarshalProperty(context, input,
										elementPropertyInfo, result);
							} else if (Jsonix.Util.Type
									.exists(this.structure.any)) {
								// TODO Refactor

								var anyPropertyInfo = this.structure.any;
								this.unmarshalProperty(context, input,
										anyPropertyInfo, result);
							} else {
								// TODO optionally report a validation error that the element is not expected
								et = input.skipElement();
							}
						} else if ((et === Jsonix.XML.Input.CHARACTERS || et === Jsonix.XML.Input.CDATA || et === Jsonix.XML.Input.ENTITY_REFERENCE) && Jsonix.Util.Type.exists(this.structure.mixed)) {
							// Characters and structure has a mixed property
							var mixedPropertyInfo = this.structure.mixed;
							this.unmarshalProperty(context, input,
									mixedPropertyInfo, result);
						} else if (et === Jsonix.XML.Input.SPACE || et === Jsonix.XML.Input.COMMENT	|| et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
							// Ignore
						} else {
							throw new Error("Illegal state: unexpected event type [" + et	+ "].");
						}
						et = input.next();
					}
				} else if (Jsonix.Util.Type.exists(this.structure.value)) {
					var valuePropertyInfo = this.structure.value;
					this.unmarshalProperty(context, input, valuePropertyInfo,
							result);
				} else {
					// Just skip everything
					input.nextTag();
				}
				if (input.eventType !== 2) {
					throw new Error("Illegal state: must be END_ELEMENT.");
				}
				return result;
			},
			unmarshalProperty : function(context, input, propertyInfo, result) {
				var propertyValue = propertyInfo
						.unmarshal(context, input, this);
				propertyInfo.setProperty(result, propertyValue);
			},
			unmarshalPropertyValue : function(context, input, propertyInfo,
					result, value) {
				var propertyValue = propertyInfo.unmarshalValue(value, context, input, this);
				propertyInfo.setProperty(result, propertyValue);
			},
			marshal : function(value, context, output) {
				// TODO This must be reworked
				if (Jsonix.Util.Type.exists(this.baseTypeInfo)) {
					this.baseTypeInfo.marshal(value, context, output);
				}
				for ( var index = 0; index < this.properties.length; index++) {
					var propertyInfo = this.properties[index];
					var propertyValue = value[propertyInfo.name];
					if (Jsonix.Util.Type.exists(propertyValue)) {
						propertyInfo.marshal(propertyValue, context, output, this);
					}
				}
			},
			isInstance : function(value, context, scope) {
				if (this.instanceFactory) {
					return value instanceof this.instanceFactory;
				}
				else {
					return Jsonix.Util.Type.isObject(value) && Jsonix.Util.Type.isString(value.TYPE_NAME) && value.TYPE_NAME === this.name;
				}
			},

			// Obsolete, left for backwards compatibility
			b : function(baseTypeInfo) {
				Jsonix.Util.Ensure.ensureObject(baseTypeInfo);
				this.baseTypeInfo = baseTypeInfo;
				return this;
			},
			// Obsolete, left for backwards compatibility
			ps : function() {
				return this;
			},
			p : function(property) {
				Jsonix.Util.Ensure.ensureObject(property);
				// If property is an instance of the property class
				if (property instanceof Jsonix.Model.PropertyInfo) {
					this.addProperty(property);
				}
				// Else create it via generic mapping configuration
				else {
					var type = property.type||property.t||'element';
					// Locate the creator function
					if (Jsonix.Util.Type
							.isFunction(this.propertyInfoCreators[type])) {
						var propertyInfoCreator = this.propertyInfoCreators[type];
						// Call the creator function
						propertyInfoCreator.call(this, property);
					} else {
						throw new Error("Unknown property info type [" + type + "].");
					}
				}
			},
			aa : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this
						.addProperty(new Jsonix.Model.AnyAttributePropertyInfo(
								mapping));
			},
			ae : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this
						.addProperty(new Jsonix.Model.AnyElementPropertyInfo(
								mapping));
			},
			a : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this.addProperty(new Jsonix.Model.AttributePropertyInfo(
						mapping));
			},
			em : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this
						.addProperty(new Jsonix.Model.ElementMapPropertyInfo(
								mapping));
			},
			e : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this.addProperty(new Jsonix.Model.ElementPropertyInfo(
						mapping));
			},
			es : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this.addProperty(new Jsonix.Model.ElementsPropertyInfo(
						mapping));
			},
			er : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this
						.addProperty(new Jsonix.Model.ElementRefPropertyInfo(
								mapping));
			},
			ers : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this
						.addProperty(new Jsonix.Model.ElementRefsPropertyInfo(
								mapping));
			},
			v : function(mapping) {
				this.addDefaultNamespaces(mapping);
				return this.addProperty(new Jsonix.Model.ValuePropertyInfo(
						mapping));
			},
			addDefaultNamespaces : function(mapping) {
				if (Jsonix.Util.Type.isObject(mapping)) {
					if (!Jsonix.Util.Type
							.isString(mapping.defaultElementNamespaceURI)) {
						mapping.defaultElementNamespaceURI = this.defaultElementNamespaceURI;
					}
					if (!Jsonix.Util.Type
							.isString(mapping.defaultAttributeNamespaceURI)) {
						mapping.defaultAttributeNamespaceURI = this.defaultAttributeNamespaceURI;
					}
				}
			},
			addProperty : function(property) {
				this.properties.push(property);
				return this;
			},
			CLASS_NAME : 'Jsonix.Model.ClassInfo'
		});
Jsonix.Model.ClassInfo.prototype.propertyInfoCreators = {
	"aa" : Jsonix.Model.ClassInfo.prototype.aa,
	"anyAttribute" : Jsonix.Model.ClassInfo.prototype.aa,
	"ae" : Jsonix.Model.ClassInfo.prototype.ae,
	"anyElement" : Jsonix.Model.ClassInfo.prototype.ae,
	"a" : Jsonix.Model.ClassInfo.prototype.a,
	"attribute" : Jsonix.Model.ClassInfo.prototype.a,
	"em" : Jsonix.Model.ClassInfo.prototype.em,
	"elementMap" : Jsonix.Model.ClassInfo.prototype.em,
	"e" : Jsonix.Model.ClassInfo.prototype.e,
	"element" : Jsonix.Model.ClassInfo.prototype.e,
	"es" : Jsonix.Model.ClassInfo.prototype.es,
	"elements" : Jsonix.Model.ClassInfo.prototype.es,
	"er" : Jsonix.Model.ClassInfo.prototype.er,
	"elementRef" : Jsonix.Model.ClassInfo.prototype.er,
	"ers" : Jsonix.Model.ClassInfo.prototype.ers,
	"elementRefs" : Jsonix.Model.ClassInfo.prototype.ers,
	"v" : Jsonix.Model.ClassInfo.prototype.v,
	"value" : Jsonix.Model.ClassInfo.prototype.v
};
Jsonix.Model.EnumLeafInfo = Jsonix.Class(Jsonix.Model.TypeInfo, {
	name : null,
	baseTypeInfo : 'String',
	entries : null,
	keys : null,
	values : null,
	built : false,
	initialize : function(mapping) {
		Jsonix.Model.TypeInfo.prototype.initialize.apply(this, []);
		Jsonix.Util.Ensure.ensureObject(mapping);
		
		var n = mapping.name||mapping.n||undefined;
		Jsonix.Util.Ensure.ensureString(n);
		this.name = n;
		
		var bti = mapping.baseTypeInfo||mapping.bti||'String';
		this.baseTypeInfo = bti;
		
		var vs = mapping.values||mapping.vs||undefined;
		Jsonix.Util.Ensure.ensureExists(vs);
		if (!(Jsonix.Util.Type.isObject(vs) || Jsonix.Util.Type.isArray(vs))) {
			throw new Error('Enum values must be either an array or an object.');
		}
		else
		{
			this.entries = vs;
		}		
	},
	build : function(context, module) {
		if (!this.built) {
			this.baseTypeInfo = context.resolveTypeInfo(this.baseTypeInfo, module);
			this.baseTypeInfo.build(context, module);
			var items = this.entries;
			var entries = {};
			var keys = [];
			var values = [];
			var index = 0;
			var key;
			var value;
			// If values is an array, process individual items
			if (Jsonix.Util.Type.isArray(items))
			{
				// Build properties in this context
				for (index = 0; index < items.length; index++) {
					value = items[index];
					if (Jsonix.Util.Type.isString(value)) {
						key = value;
						if (!(Jsonix.Util.Type.isFunction(this.baseTypeInfo.parse)))
						{
							throw new Error('Enum value is provided as string but the base type ['+this.baseTypeInfo.name+'] of the enum info [' + this.name + '] does not implement the parse method.');
						}
						// Using null as input since input is not available
						value = this.baseTypeInfo.parse(value, context, null, this);
					}
					else
					{
						if (this.baseTypeInfo.isInstance(value, context, this))
						{
							if (!(Jsonix.Util.Type.isFunction(this.baseTypeInfo.print)))
							{
								throw new Error('The base type ['+this.baseTypeInfo.name+'] of the enum info [' + this.name + '] does not implement the print method, unable to produce the enum key as string.');
							}
							// Using null as output since output is not available at this moment
							key = this.baseTypeInfo.print(value, context, null, this);
						}
						else
						{
							throw new Error('Enum value [' + value + '] is not an instance of the enum base type [' + this.baseTypeInfo.name + '].');
						}
					}
					entries[key] = value;
					keys[index] = key;
					values[index] = value;
				}
			}
			else if (Jsonix.Util.Type.isObject(items))
			{
				for (key in items) {
					if (items.hasOwnProperty(key)) {
						value = items[key];
						if (Jsonix.Util.Type.isString(value)) {
							if (!(Jsonix.Util.Type.isFunction(this.baseTypeInfo.parse)))
							{
								throw new Error('Enum value is provided as string but the base type ['+this.baseTypeInfo.name+'] of the enum info [' + this.name + '] does not implement the parse method.');
							}
							// Using null as input since input is not available
							value = this.baseTypeInfo.parse(value, context, null, this);
						}
						else
						{
							if (!this.baseTypeInfo.isInstance(value, context, this))
							{
								throw new Error('Enum value [' + value + '] is not an instance of the enum base type [' + this.baseTypeInfo.name + '].');
							}
						}
						entries[key] = value;
						keys[index] = key;
						values[index] = value;
						index++;
					}
				}
			}
			else {
				throw new Error('Enum values must be either an array or an object.');
			}
			this.entries = entries;
			this.keys = keys;
			this.values = values;
			this.built = true;
		}
	},
	unmarshal : function(context, input, scope) {
		var text = input.getElementText();
		if (Jsonix.Util.StringUtils.isNotBlank(text)) {
			return this.parse(text, context, input, scope);
		} else {
			return null;
		}
	},
	marshal : function(value, context, output, scope) {
		if (Jsonix.Util.Type.exists(value)) {
			output.writeCharacters(this.reprint(value, context, output, scope));
		}
	},
	reprint : function(value, context, output, scope) {
		if (Jsonix.Util.Type.isString(value) && !this.isInstance(value, context, scope)) {
			// Using null as input since input is not available
			return this.print(this.parse(value, context, null, scope), context, output, scope);
		} else {
			return this.print(value, context, output, scope);
		}
	},
	print : function(value, context, output, scope) {
		for (var index = 0; index < this.values.length; index++)
		{
			if (this.values[index] === value)
			{
				return this.keys[index];
			}
		}
		throw new Error('Value [' + value + '] is invalid for the enum type [' + this.name + '].');
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		if (this.entries.hasOwnProperty(text))
		{
			return this.entries[text];
		}
		else
		{
			throw new Error('Value [' + text + '] is invalid for the enum type [' + this.name + '].');
		}
	},
	isInstance : function(value, context, scope) {
		for (var index = 0; index < this.values.length; index++)
		{
			if (this.values[index] === value)
			{
				return true;
			}
		}
		return false;
	},
	CLASS_NAME : 'Jsonix.Model.EnumLeafInfo'
});
Jsonix.Model.ElementInfo = Jsonix.Class({
	elementName : null,
	typeInfo : null,
	substitutionHead : null,
	scope : null,
	built : false,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		
		var dens = mapping.defaultElementNamespaceURI||mapping.dens||'';
		this.defaultElementNamespaceURI = dens;
		
		var en = mapping.elementName || mapping.en||undefined;
		if (Jsonix.Util.Type.isObject(en)) {
			this.elementName = Jsonix.XML.QName.fromObject(en);
		} else {
			Jsonix.Util.Ensure.ensureString(en);
			this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, en);
		}
		
		var ti = mapping.typeInfo||mapping.ti||'String';
		this.typeInfo = ti;
		
		var sh = mapping.substitutionHead||mapping.sh||null;
		this.substitutionHead = sh;
		
		var sc = mapping.scope||mapping.sc||null;
		this.scope = sc;
	},
	build : function(context, module) {
		// If element info is not yet built
		if (!this.built) {
			this.typeInfo = context.resolveTypeInfo(this.typeInfo, module);
			this.scope = context.resolveTypeInfo(this.scope, module);
			this.built = true;
		}
	},
	CLASS_NAME : 'Jsonix.Model.ElementInfo'
});
Jsonix.Model.PropertyInfo = Jsonix
		.Class({
			name : null,
			collection : false,
			defaultElementNamespaceURI : '',
			defaultAttributeNamespaceURI : '',
			built : false,
			initialize : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				var n = mapping.name||mapping.n||undefined;
				Jsonix.Util.Ensure.ensureString(n);
				this.name = n;
				var dens = mapping.defaultElementNamespaceURI||mapping.dens||'';
				this.defaultElementNamespaceURI = dens;
				var dans = mapping.defaultAttributeNamespaceURI||mapping.dans||'';
				this.defaultAttributeNamespaceURI = dans;
				var col = mapping.collection||mapping.col||false;
				this.collection = col;
			},
			build : function(context, module) {
				if (!this.built) {
					this.doBuild(context, module);
					this.built = true;
				}
			},
			doBuild : function(context, module) {
				throw new Error("Abstract method [doBuild].");
			},
			buildStructure : function(context, structure) {
				throw new Error("Abstract method [buildStructure].");
			},
			setProperty : function(object, value) {
				if (Jsonix.Util.Type.exists(value)) {
					if (this.collection) {
						Jsonix.Util.Ensure.ensureArray(value,
								'Collection property requires an array value.');
						if (!Jsonix.Util.Type.exists(object[this.name])) {
							object[this.name] = [];
						}
						for ( var index = 0; index < value.length; index++) {
							object[this.name].push(value[index]);
						}

					} else {
						object[this.name] = value;
					}
				}
			},
			CLASS_NAME : 'Jsonix.Model.PropertyInfo'
		});
Jsonix.Model.AnyAttributePropertyInfo = Jsonix.Class(Jsonix.Model.PropertyInfo, {
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.PropertyInfo.prototype.initialize.apply(this, [ mapping ]);
	},
	unmarshal : function(context, input, scope) {
		var attributeCount = input.getAttributeCount();
		if (attributeCount === 0) {
			return null;
		} else {
			var result = {};
			for ( var index = 0; index < attributeCount; index++) {
				var attributeNameKey = input.getAttributeNameKey(index);
				var attributeValue = input.getAttributeValue(index);
				if (Jsonix.Util.Type.isString(attributeValue)) {
					result[attributeNameKey] = attributeValue;
				}
			}
			return result;
		}
	},
	marshal : function(value, context, output, scope) {
		if (!Jsonix.Util.Type.isObject(value)) {
			// Nothing to do
			return;
		}
		for ( var attributeName in value) {
			if (value.hasOwnProperty(attributeName)) {
				var attributeValue = value[attributeName];
				if (Jsonix.Util.Type.isString(attributeValue)) {
					output.writeAttribute(Jsonix.XML.QName.fromString(attributeName), attributeValue);
				}
			}
		}

	},
	doBuild : function(context, module)	{
		// Nothing to do
	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		// if (Jsonix.Util.Type.exists(structure.anyAttribute))
		// {
		// // TODO better exception
		// throw new Error("The structure already defines an any attribute
		// property.");
		// } else
		// {
		structure.anyAttribute = this;
		// }
	},
	CLASS_NAME : 'Jsonix.Model.AnyAttributePropertyInfo'
});

Jsonix.Model.SingleTypePropertyInfo = Jsonix.Class(Jsonix.Model.PropertyInfo,
		{
			typeInfo : 'String',
			initialize : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				Jsonix.Model.PropertyInfo.prototype.initialize.apply(this,
						[ mapping ]);
				var ti = mapping.typeInfo || mapping.ti || 'String';
				this.typeInfo = ti;
			},
			doBuild : function(context, module) {
				this.typeInfo = context.resolveTypeInfo(this.typeInfo, module);
			},
			unmarshalValue : function(value, context, input, scope) {
				return this.parse(value, context, input, scope);
			},
			parse : function(value, context, input, scope) {
				return this.typeInfo.parse(value, context, input, scope);
			},
			print : function(value, context, output, scope) {
				return this.typeInfo.reprint(value, context, output, scope);
			},
			CLASS_NAME : 'Jsonix.Model.SingleTypePropertyInfo'
		});

Jsonix.Model.AttributePropertyInfo = Jsonix.Class(Jsonix.Model.SingleTypePropertyInfo, {
	attributeName : null,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.SingleTypePropertyInfo.prototype.initialize.apply(this, [ mapping ]);
		var an = mapping.attributeName||mapping.an||undefined;
		if (Jsonix.Util.Type.isObject(an)) {
			this.attributeName = Jsonix.XML.QName.fromObject(an);
		} else if (Jsonix.Util.Type.isString(an)) {
			this.attributeName = new Jsonix.XML.QName(this.defaultAttributeNamespaceURI, an);
		} else {
			this.attributeName = new Jsonix.XML.QName(this.defaultAttributeNamespaceURI, this.name);
		}
	},
	unmarshal : function(context, input, scope) {
		var attributeCount = input.getAttributeCount();
		var result = null;
		for ( var index = 0; index < attributeCount; index++) {
			var attributeNameKey = input.getAttributeNameKey(index);
			if (this.attributeName.key === attributeNameKey) {
				var attributeValue = input.getAttributeValue(index);
				if (Jsonix.Util.Type.isString(attributeValue)) {
					result = this.unmarshalValue(attributeValue, context, input, scope);
				}
			}
		}
		return result;
	},
	marshal : function(value, context, output, scope) {
		if (Jsonix.Util.Type.exists(value)) {
			output.writeAttribute(this.attributeName, this.print(value, context, output, scope));
		}

	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		Jsonix.Util.Ensure.ensureObject(structure.attributes);
		var key = this.attributeName.key;
		// if (Jsonix.Util.Type.exists(structure.attributes[key])) {
		// // TODO better exception
		// throw new Error("The structure already defines an attribute for the key
		// ["
		// + key + "].");
		// } else
		// {
		structure.attributes[key] = this;
		// }
	},
	CLASS_NAME : 'Jsonix.Model.AttributePropertyInfo'
});

Jsonix.Model.ValuePropertyInfo = Jsonix.Class(Jsonix.Model.SingleTypePropertyInfo, {
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.SingleTypePropertyInfo.prototype.initialize.apply(this, [ mapping ]);
	},
	unmarshal : function(context, input, scope) {
		var text = input.getElementText();
		if (Jsonix.Util.StringUtils.isNotBlank(text)) {
			return this.unmarshalValue(text, context, input, scope);
		} else {
			return null;
		}
	},
	marshal : function(value, context, output, scope) {
		if (!Jsonix.Util.Type.exists(value)) {
			return;
		}
		output.writeCharacters(this.print(value, context, output, scope));
	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		// if (Jsonix.Util.Type.exists(structure.value)) {
		// // TODO better exception
		// throw new Error("The structure already defines a value
		// property.");
		// } else
		if (Jsonix.Util.Type.exists(structure.elements)) {
			// TODO better exception
			throw new Error("The structure already defines element mappings, it cannot define a value property.");
		} else {
			structure.value = this;
		}
	},
	CLASS_NAME : 'Jsonix.Model.ValuePropertyInfo'
});

Jsonix.Model.AbstractElementsPropertyInfo = Jsonix.Class(Jsonix.Model.PropertyInfo, {
	wrapperElementName : null,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.PropertyInfo.prototype.initialize.apply(this, [ mapping ]);
		var wen = mapping.wrapperElementName||mapping.wen||undefined;
		if (Jsonix.Util.Type.isObject(wen)) {
			this.wrapperElementName = Jsonix.XML.QName.fromObject(wen);
		} else if (Jsonix.Util.Type.isString(wen)) {
			this.wrapperElementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, wen);
		} else {
			this.wrapperElementName = null;
		}
	},
	unmarshal : function(context, input, scope) {
		var result = null;
		var that = this;
		var callback = function(value) {
			if (that.collection) {
				if (result === null) {
					result = [];
				}
				result.push(value);

			} else {
				if (result === null) {
					result = value;
				} else {
					// TODO Report validation error
					throw new Error("Value already set.");
				}
			}
		};

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			this.unmarshalWrapperElement(context, input, scope, callback);
		} else {
			this.unmarshalElement(context, input, scope, callback);
		}
		return result;
	},
	unmarshalWrapperElement : function(context, input, scope, callback) {
		var et = input.next();
		while (et !== Jsonix.XML.Input.END_ELEMENT) {
			// New sub-element starts
			if (et === Jsonix.XML.Input.START_ELEMENT) {
				this.unmarshalElement(context, input, scope, callback);
			} else if (et === Jsonix.XML.Input.SPACE || et === Jsonix.XML.Input.COMMENT || et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
				// Skip whitespace
			} else {
				// TODO ignore comments, processing
				// instructions
				throw new Error("Illegal state: unexpected event type [" + et + "].");
			}
			et = input.next();
		}
	},
	unmarshalElement : function(context, input, scope, callback) {
		throw new Error("Abstract method [unmarshalElement].");
	},
	marshal : function(value, context, output, scope) {

		if (!Jsonix.Util.Type.exists(value)) {
			// Do nothing
			return;
		}

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			output.writeStartElement(this.wrapperElementName);
		}

		if (!this.collection) {
			this.marshalElement(value, context, output, scope);
		} else {
			Jsonix.Util.Ensure.ensureArray(value);
			// TODO Exception if not array
			for ( var index = 0; index < value.length; index++) {
				var item = value[index];
				// TODO Exception if item does not exist
				this.marshalElement(item, context, output, scope);
			}
		}

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			output.writeEndElement();
		}
	},
	marshalElement : function(value, context, output, scope) {
		throw new Error("Abstract method [marshalElement].");
	},
	marshalElementTypeInfo : function(elementName, typeInfo,  value, context, output, scope) {
		output.writeStartElement(elementName);
		typeInfo.marshal(value, context, output, scope);
		output.writeEndElement();
	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		if (Jsonix.Util.Type.exists(structure.value)) {
			// TODO better exception
			throw new Error("The structure already defines a value property.");
		} else if (!Jsonix.Util.Type.exists(structure.elements)) {
			structure.elements = {};
		}

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			structure.elements[this.wrapperElementName.key] = this;
		} else {
			this.buildStructureElements(context, structure);
		}
	},
	buildStructureElements : function(context, structure) {
		throw new Error("Abstract method [buildStructureElements].");
	},
	CLASS_NAME : 'Jsonix.Model.AbstractElementsPropertyInfo'
});

Jsonix.Model.ElementPropertyInfo = Jsonix.Class(
		Jsonix.Model.AbstractElementsPropertyInfo, {
			typeInfo : 'String',
			elementName : null,
			initialize : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				Jsonix.Model.AbstractElementsPropertyInfo.prototype.initialize
						.apply(this, [ mapping ]);
				var ti = mapping.typeInfo||mapping.ti||'String';
				if (Jsonix.Util.Type.isObject(ti)) {
					this.typeInfo = ti;
				} else {
					Jsonix.Util.Ensure.ensureString(ti);
					this.typeInfo = ti;
				}
				var en = mapping.elementName||mapping.en||undefined;
				if (Jsonix.Util.Type.isObject(en)) {
					this.elementName = Jsonix.XML.QName.fromObject(en);
				} else if (Jsonix.Util.Type.isString(en)) {
					this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, en);
				} else {
					this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, this.name);
				}
			},
			unmarshalElement : function(context, input, scope, callback) {
				return callback(this.typeInfo.unmarshal(context, input, scope));
			},
			marshalElement : function(value, context, output, scope) {
				this.marshalElementTypeInfo(this.elementName, this.typeInfo, value, context, output, scope);
			},
			doBuild : function(context, module) {
				this.typeInfo = context.resolveTypeInfo(this.typeInfo, module);
			},
			buildStructureElements : function(context, structure) {
				structure.elements[this.elementName.key] = this;
			},
			CLASS_NAME : 'Jsonix.Model.ElementPropertyInfo'
		});

Jsonix.Model.ElementsPropertyInfo = Jsonix
		.Class(
				Jsonix.Model.AbstractElementsPropertyInfo,
				{
					elementTypeInfos : null,
					elementTypeInfosMap : null,
					initialize : function(mapping) {
						Jsonix.Util.Ensure.ensureObject(mapping);
						Jsonix.Model.AbstractElementsPropertyInfo.prototype.initialize
								.apply(this, [ mapping ]);
						var etis = mapping.elementTypeInfos||mapping.etis||[];
						Jsonix.Util.Ensure.ensureArray(etis);
						this.elementTypeInfos = etis;
					},
					unmarshalElement : function(context, input, scope, callback) {
						// TODO make sure it's the right event type
						var elementNameKey = input.getNameKey();
						var typeInfo = this.elementTypeInfosMap[elementNameKey];
						if (Jsonix.Util.Type.exists(typeInfo)) {
							return callback(typeInfo.unmarshal(context, input, scope));
						}
						// TODO better exception
						throw new Error("Element [" + elementNameKey + "] is not known in this context");
					},
					marshalElement : function(value, context, output, scope) {
						for ( var index = 0; index < this.elementTypeInfos.length; index++) {
							var elementTypeInfo = this.elementTypeInfos[index];
							var typeInfo = elementTypeInfo.typeInfo;
							if (typeInfo.isInstance(value, context, scope)) {
								var elementName = elementTypeInfo.elementName;
								this.marshalElementTypeInfo(elementName, typeInfo, value, context, output, scope);
								return;
							}
						}
						throw new Error("Could not find an element with type info supporting the value ["	+ value + "].");
					},
					doBuild : function(context, module) {
						this.elementTypeInfosMap = {};
						var etiti, etien;
						for ( var index = 0; index < this.elementTypeInfos.length; index++) {
							var elementTypeInfo = this.elementTypeInfos[index];
							Jsonix.Util.Ensure.ensureObject(elementTypeInfo);
							etiti = elementTypeInfo.typeInfo||elementTypeInfo.ti||'String';
							elementTypeInfo.typeInfo = context.resolveTypeInfo(etiti, module);
							etien = elementTypeInfo.elementName||elementTypeInfo.en||undefined;
							if (Jsonix.Util.Type.isObject(etien)) {
								elementTypeInfo.elementName = Jsonix.XML.QName.fromObject(etien);
							} else {
								Jsonix.Util.Ensure.ensureString(etien);
								elementTypeInfo.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, etien);
							}
							this.elementTypeInfosMap[elementTypeInfo.elementName.key] = elementTypeInfo.typeInfo;
						}
					},
					buildStructureElements : function(context, structure) {
						for ( var index = 0; index < this.elementTypeInfos.length; index++) {
							var elementTypeInfo = this.elementTypeInfos[index];
							structure.elements[elementTypeInfo.elementName.key] = this;
						}
					},
					CLASS_NAME : 'Jsonix.Model.ElementsPropertyInfo'
				});

Jsonix.Model.ElementMapPropertyInfo = Jsonix.Class(Jsonix.Model.AbstractElementsPropertyInfo, {
	elementName : null,
	key : null,
	value : null,
	entryTypeInfo : null,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.AbstractElementsPropertyInfo.prototype.initialize.apply(this, [ mapping ]);
		// TODO Ensure correct argument
		var k = mapping.key||mapping.k||undefined;
		Jsonix.Util.Ensure.ensureObject(k);
		var v = mapping.value||mapping.v||undefined;
		Jsonix.Util.Ensure.ensureObject(v);
		// TODO Ensure correct argument
		var en = mapping.elementName||mapping.en||undefined;
		if (Jsonix.Util.Type.isObject(en)) {
			this.elementName = Jsonix.XML.QName.fromObject(en);
		} else if (Jsonix.Util.Type.isString(en)) {
			this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, en);
		} else {
			this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, this.name);
		}
		this.entryTypeInfo = new Jsonix.Model.ClassInfo({
			name: 'Map<' + k.name + ',' + v.name + '>',
			propertyInfos : [ k, v ]
		});

	},
	unmarshalWrapperElement : function(context, input, scope) {
		var result = Jsonix.Model.AbstractElementsPropertyInfo.prototype.unmarshalWrapperElement.apply(this, arguments);
	},
	unmarshal : function(context, input, scope) {
		var result = null;
		var that = this;
		var callback = function(value) {

			if (Jsonix.Util.Type.exists(value)) {
				Jsonix.Util.Ensure.ensureObject(value, 'Map property requires an object.');
				if (!Jsonix.Util.Type.exists(result)) {
					result = {};
				}
				for ( var attributeName in value) {
					if (value.hasOwnProperty(attributeName)) {
						var attributeValue = value[attributeName];
						if (that.collection) {
							if (!Jsonix.Util.Type.exists(result[attributeName])) {
								result[attributeName] = [];
							}
							result[attributeName].push(attributeValue);
						} else {
							if (!Jsonix.Util.Type.exists(result[attributeName])) {
								result[attributeName] = attributeValue;
							} else {
								// TODO Report validation error
								throw new Error("Value was already set.");
							}
						}
					}
				}
			}
		};

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			this.unmarshalWrapperElement(context, input, scope, callback);
		} else {
			this.unmarshalElement(context, input, scope, callback);
		}
		return result;
	},
	unmarshalElement : function(context, input, scope, callback) {
		var entry = this.entryTypeInfo.unmarshal(context, input, scope);
		var result = {};
		if (!!entry[this.key.name]) {
			result[entry[this.key.name]] = entry[this.value.name];
		}
		return callback(result);
	},
	marshal : function(value, context, output, scope) {

		if (!Jsonix.Util.Type.exists(value)) {
			// Do nothing
			return;
		}

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			output.writeStartElement(this.wrapperElementName);
		}

		this.marshalElement(value, context, output, scope);

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			output.writeEndElement();
		}
	},
	marshalElement : function(value, context, output, scope) {
		if (!!value) {
			for ( var attributeName in value) {
				if (value.hasOwnProperty(attributeName)) {
					var attributeValue = value[attributeName];
					if (!this.collection) {
						var singleEntry = {};
						singleEntry[this.key.name] = attributeName;
						singleEntry[this.value.name] = attributeValue;
						output.writeStartElement(this.elementName);
						this.entryTypeInfo.marshal(singleEntry, context, output, scope);
						output.writeEndElement();

					} else {
						for ( var index = 0; index < attributeValue.length; index++) {
							var collectionEntry = {};
							collectionEntry[this.key.name] = attributeName;
							collectionEntry[this.value.name] = attributeValue[index];
							output.writeStartElement(this.elementName);
							this.entryTypeInfo.marshal(collectionEntry, context, output, scope);
							output.writeEndElement();
						}
					}
				}
			}
		}
	},
	doBuild: function(context, module) {
		this.entryTypeInfo.build(context, module);
		// TODO get property by name
		this.key = this.entryTypeInfo.properties[0]; 
		this.value = this.entryTypeInfo.properties[1];
	},
	buildStructureElements : function(context, structure) {
		structure.elements[this.elementName.key] = this;
	},
	setProperty : function(object, value) {
		if (Jsonix.Util.Type.exists(value)) {
			Jsonix.Util.Ensure.ensureObject(value, 'Map property requires an object.');
			if (!Jsonix.Util.Type.exists(object[this.name])) {
				object[this.name] = {};
			}
			var map = object[this.name];
			for ( var attributeName in value) {
				if (value.hasOwnProperty(attributeName)) {
					var attributeValue = value[attributeName];
					if (this.collection) {
						if (!Jsonix.Util.Type.exists(map[attributeName])) {
							map[attributeName] = [];
						}

						for ( var index = 0; index < attributeValue.length; index++) {
							map[attributeName].push(attributeValue[index]);
						}
					} else {
						map[attributeName] = attributeValue;
					}
				}
			}
		}
	},
	CLASS_NAME : 'Jsonix.Model.ElementMapPropertyInfo'
});

Jsonix.Model.AbstractElementRefsPropertyInfo = Jsonix.Class(Jsonix.Model.PropertyInfo, {
	wrapperElementName : null,
	mixed : true,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping, 'Mapping must be an object.');
		Jsonix.Model.PropertyInfo.prototype.initialize.apply(this, [ mapping ]);
		var wen = mapping.wrapperElementName||mapping.wen||undefined;
		var mx = mapping.mixed||mapping.mx||true;
		if (Jsonix.Util.Type.isObject(wen)) {
			this.wrapperElementName = Jsonix.XML.QName.fromObject(wen);
		} else if (Jsonix.Util.Type.isString(wen)) {
			this.wrapperElementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, wen);
		} else {
			this.wrapperElementName = null;
		}
		this.mixed = mx;
	},
	unmarshal : function(context, input, scope) {
		var et = input.eventType;

		if (et === Jsonix.XML.Input.START_ELEMENT) {
			if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
				return this.unmarshalWrapperElement(context, input, scope);
			} else {
				return this.unmarshalElement(context, input, scope);
			}
		} else if (this.mixed && (et === Jsonix.XML.Input.CHARACTERS || et === Jsonix.XML.Input.CDATA || et === Jsonix.XML.Input.ENTITY_REFERENCE)) {
			var value = input.getText();
			if (this.collection) {
				return [ value ];

			} else {
				return value;
			}
		} else if (et === Jsonix.XML.Input.SPACE || et === Jsonix.XML.Input.COMMENT || et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
			// Skip whitespace
		} else {
			// TODO better exception
			throw new Error("Illegal state: unexpected event type [" + et + "].");
		}
	},
	unmarshalWrapperElement : function(context, input, scope) {
		var result = null;
		var et = input.next();
		while (et !== Jsonix.XML.Input.END_ELEMENT) {
			if (et === Jsonix.XML.Input.START_ELEMENT) {
				var value = this.unmarshalElement(context, input, scope);
				if (this.collection) {
					if (result === null) {
						result = [];
					}
					for ( var index = 0; index < value.length; index++) {
						result.push(value[index]);
					}

				} else {
					if (result === null) {
						result = value;
					} else {
						// TODO Report validation error
						throw new Error("Value already set.");
					}
				}
			} else
			// Characters
			if (this.mixed && (et === Jsonix.XML.Input.CHARACTERS || et === Jsonix.XML.Input.CDATA || et === Jsonix.XML.Input.ENTITY_REFERENCE)) {
				var text = input.getText();
				if (this.collection) {
					if (result === null) {
						result = [];
					}
					result.push(text);
				} else {
					if (result === null) {
						result = text;
					} else {
						// TODO Report validation error
						throw new Error("Value already set.");
					}
				}
			} else if (et === Jsonix.XML.Input.SPACE || et === Jsonix.XML.Input.COMMENT || et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
				// Skip whitespace
			} else {
				throw new Error("Illegal state: unexpected event type [" + et + "].");
			}
			et = input.next();
		}
		return result;
	},
	unmarshalElement : function(context, input, scope) {
		var name = input.getName();
		var typeInfo = this.getElementTypeInfo(context, name, scope);
		var value = {
			name : name,
			value : typeInfo.unmarshal(context, input, scope)
		};
		if (this.collection) {
			return [ value ];
		} else {
			return value;
		}
	},
	marshal : function(value, context, output, scope) {

		if (Jsonix.Util.Type.exists(value)) {
			if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
				output.writeStartElement(this.wrapperElementName);
			}

			if (!this.collection) {
				this.marshalItem(value, context, output, scope);
			} else {
				Jsonix.Util.Ensure.ensureArray(value, 'Collection property requires an array value.');
				for ( var index = 0; index < value.length; index++) {
					var item = value[index];
					this.marshalItem(item, context, output, scope);
				}
			}

			if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
				output.writeEndElement();
			}
		}

	},
	marshalItem : function(value, context, output, scope) {

		if (Jsonix.Util.Type.isString(value)) {
			if (!this.mixed) {
				// TODO
				throw new Error("Property is not mixed, can't handle string values.");
			} else {
				output.writeCharacters(value);
			}
		} else if (Jsonix.Util.Type.isObject(value)) {
			this.marshalElement(value, context, output, scope);

		} else {
			if (this.mixed) {
				throw new Error("Unsupported content type, either objects or strings are supported.");
			} else {
				throw new Error("Unsupported content type, only objects are supported.");
			}
		}

	},
	marshalElement : function(value, context, output, scope) {
		var elementName = Jsonix.XML.QName.fromObject(value.name);
		var typeInfo = this.getElementTypeInfo(context, elementName, scope);
		return this.marshalElementTypeInfo(elementName, typeInfo, value, context, output, scope);
	},
	marshalElementTypeInfo : function(elementName, typeInfo, value, context, output, scope) {
		output.writeStartElement(elementName);
		if (Jsonix.Util.Type.exists(value.value)) {
			typeInfo.marshal(value.value, context, output, scope);
		}
		output.writeEndElement();

	},
	getElementTypeInfo : function(context, elementName, scope) {
		var propertyElementTypeInfo = this.getPropertyElementTypeInfo(elementName);
		if (Jsonix.Util.Type.exists(propertyElementTypeInfo)) {
			return propertyElementTypeInfo.typeInfo;
		} else {
			var contextElementTypeInfo = context.getElementInfo(elementName, scope);
			if (Jsonix.Util.Type.exists(contextElementTypeInfo)) {
				return contextElementTypeInfo.typeInfo;
			} else {
				throw new Error("Element [" + elementName.key + "] is not known in this context.");
			}
		}

	},
	getPropertyElementTypeInfo : function(elementName) {
		throw new Error("Abstract method [getPropertyElementTypeInfo].");
	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		if (Jsonix.Util.Type.exists(structure.value)) {
			// TODO better exception
			throw new Error("The structure already defines a value property.");
		} else if (!Jsonix.Util.Type.exists(structure.elements)) {
			structure.elements = {};
		}

		if (Jsonix.Util.Type.exists(this.wrapperElementName)) {
			structure.elements[this.wrapperElementName.key] = this;
		} else {
			this.buildStructureElements(context, structure);
		}

		// if (Jsonix.Util.Type.exists(structure.elements[key]))
		// {
		// // TODO better exception
		// throw new Error("The structure already defines an element for
		// the key ["
		// + key + "].");
		// } else
		// {
		// structure.elements[key] = this;
		// }

		if (this.mixed && !Jsonix.Util.Type.exists(this.wrapperElementName)) {
			// if (Jsonix.Util.Type.exists(structure.mixed)) {
			// // TODO better exception
			// throw new Error("The structure already defines the mixed
			// property.");
			// } else
			// {
			structure.mixed = this;
			// }
		}
	},
	buildStructureElements : function(context, structure) {
		throw new Error("Abstract method [buildStructureElements].");
	},
	buildStructureElementTypeInfos : function(context, structure, elementTypeInfo) {
		structure.elements[elementTypeInfo.elementName.key] = this;
		var substitutionMembers = context.getSubstitutionMembers(elementTypeInfo.elementName);
		if (Jsonix.Util.Type.isArray(substitutionMembers)) {
			for ( var jndex = 0; jndex < substitutionMembers.length; jndex++) {
				var substitutionElementInfo = substitutionMembers[jndex];
				this.buildStructureElementTypeInfos(context, structure, substitutionElementInfo);
			}

		}
	},
	CLASS_NAME : 'Jsonix.Model.ElementRefPropertyInfo'
});

Jsonix.Model.ElementRefPropertyInfo = Jsonix
		.Class(
				Jsonix.Model.AbstractElementRefsPropertyInfo,
				{
					typeInfo : 'String',
					elementName : null,
					initialize : function(mapping) {
						Jsonix.Util.Ensure.ensureObject(mapping);
						Jsonix.Model.AbstractElementRefsPropertyInfo.prototype.initialize
								.apply(this, [ mapping ]);
						// TODO Ensure correct argument
						var ti = mapping.typeInfo||mapping.ti||'String';
						if (Jsonix.Util.Type.isObject(ti)) {
							this.typeInfo = ti;
						} else {
							Jsonix.Util.Ensure.ensureString(ti);
							this.typeInfo = ti;
						}
						var en = mapping.elementName||mapping.en||undefined;
						if (Jsonix.Util.Type.isObject(en)) {
							this.elementName = Jsonix.XML.QName.fromObject(en);
						} else if (Jsonix.Util.Type.isString(en)) {
							this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, en);
						} else {
							this.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, this.name);
						}
					},
					getPropertyElementTypeInfo : function(elementName) {
						Jsonix.Util.Ensure.ensureObject(elementName);
						var name = Jsonix.XML.QName.fromObject(elementName);

						if (name.key === this.elementName.key) {
							return this;
						} else {
							return null;
						}
					},
					doBuild : function(context, module) {
						this.typeInfo = context.resolveTypeInfo(this.typeInfo, module);
					},
					buildStructureElements : function(context, structure) {
						this.buildStructureElementTypeInfos(context, structure,	this);
					},
					CLASS_NAME : 'Jsonix.Model.ElementRefPropertyInfo'
				});

Jsonix.Model.ElementRefsPropertyInfo = Jsonix
		.Class(
				Jsonix.Model.AbstractElementRefsPropertyInfo,
				{
					elementTypeInfos : null,
					elementTypeInfosMap : null,
					initialize : function(mapping) {
						Jsonix.Util.Ensure.ensureObject(mapping);
						Jsonix.Model.AbstractElementRefsPropertyInfo.prototype.initialize
								.apply(this, [ mapping ]);
						// TODO Ensure correct arguments
						var etis = mapping.elementTypeInfos||mapping.etis||[];
						Jsonix.Util.Ensure.ensureArray(etis);
						this.elementTypeInfos = etis;
					},
					getPropertyElementTypeInfo : function(elementName) {
						Jsonix.Util.Ensure.ensureObject(elementName);
						var name = Jsonix.XML.QName.fromObject(elementName);

						var typeInfo = this.elementTypeInfosMap[name.key];
						if (Jsonix.Util.Type.exists(typeInfo)) {
							return {
								elementName : name,
								typeInfo : typeInfo
							};
						} else {
							return null;
						}
					},
					doBuild : function(context, module) {
						this.elementTypeInfosMap = {};
						var etiti, etien;
						for ( var index = 0; index < this.elementTypeInfos.length; index++) {
							var elementTypeInfo = this.elementTypeInfos[index];
							Jsonix.Util.Ensure.ensureObject(elementTypeInfo);
							etiti = elementTypeInfo.typeInfo || elementTypeInfo.ti || 'String';
							elementTypeInfo.typeInfo = context.resolveTypeInfo(etiti, module);
							etien = elementTypeInfo.elementName || elementTypeInfo.en||undefined;
							if (Jsonix.Util.Type.isObject(etien)) {
								elementTypeInfo.elementName = Jsonix.XML.QName.fromObject(etien);
							} else {
								Jsonix.Util.Ensure
										.ensureString(etien);
								elementTypeInfo.elementName = new Jsonix.XML.QName(
										this.defaultElementNamespaceURI,
										etien);
							}
							this.elementTypeInfosMap[elementTypeInfo.elementName.key] = elementTypeInfo.typeInfo;
						}
					},
					buildStructureElements : function(context, structure) {
						for ( var index = 0; index < this.elementTypeInfos.length; index++) {
							var elementTypeInfo = this.elementTypeInfos[index];
							this.buildStructureElementTypeInfos(context, structure, elementTypeInfo);
						}
					},
					CLASS_NAME : 'Jsonix.Model.ElementRefsPropertyInfo'
				});

Jsonix.Model.AnyElementPropertyInfo = Jsonix.Class(Jsonix.Model.PropertyInfo, {
	allowDom : true,
	allowTypedObject : true,
	mixed : true,
	initialize : function(mapping) {
		Jsonix.Util.Ensure.ensureObject(mapping);
		Jsonix.Model.PropertyInfo.prototype.initialize.apply(this, [ mapping ]);
		var dom = mapping.allowDom || mapping.dom || true;
		var typed = mapping.allowTypedObject || mapping.typed || true;
		var mx = mapping.mixed || mapping.mx || true;
		this.allowDom = dom;
		this.allowTypedObject = typed;
		this.mixed = mx;
	},
	unmarshal : function(context, input, scope) {
		var et = input.eventType;

		if (et === Jsonix.XML.Input.START_ELEMENT) {
			return this.unmarshalElement(context, input, scope);
		} else if (this.mixed && (et === Jsonix.XML.Input.CHARACTERS || et === Jsonix.XML.Input.CDATA || et === Jsonix.XML.Input.ENTITY_REFERENCE)) {
			var value = input.getText();
			if (this.collection) {
				return [ value ];

			} else {
				return value;
			}
		} else if (this.mixed && (et === Jsonix.XML.Input.SPACE)) {
			// Whitespace
			return null;
		} else if (et === Jsonix.XML.Input.COMMENT || et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
			return null;

		} else {
			// TODO better exception
			throw new Error("Illegal state: unexpected event type [" + et + "].");

		}
	},
	unmarshalElement : function(context, input, scope) {

		var name = input.getName();
		var value;

		if (this.allowTypedObject && Jsonix.Util.Type.exists(context.getElementInfo(name, scope))) {
			// TODO optimize
			var elementDeclaration = context.getElementInfo(name, scope);
			var typeInfo = elementDeclaration.typeInfo;
			var adapter = Jsonix.Model.Adapter.getAdapter(elementDeclaration);
			value = {
				name : name,
				value : adapter.unmarshal(typeInfo, context, input, scope)
			};
		} else if (this.allowDom) {
			value = input.getElement();
		} else {
			// TODO better exception
			throw new Error("Element [" + name.toString() + "] is not known in this context and property does not allow DOM.");
		}
		if (this.collection) {
			return [ value ];
		} else {
			return value;
		}
	},
	marshal : function(value, context, output, scope) {
		if (!Jsonix.Util.Type.exists(value)) {
			return;
		}
		if (!this.collection) {
			this.marshalItem(value, context, output, scope);
		} else {
			Jsonix.Util.Ensure.ensureArray(value);
			for ( var index = 0; index < value.length; index++) {
				this.marshalItem(value[index], context, output, scope);
			}
		}
	},
	marshalItem : function(value, context, output, scope) {
		if (this.mixed && Jsonix.Util.Type.isString(value)) {
			// Mixed
			output.writeCharacters(value);
		} else if (this.allowDom && Jsonix.Util.Type.exists(value.nodeType)) {
			// DOM node
			output.writeNode(value);

		} else {
			// Typed object
			var name = Jsonix.XML.QName.fromObject(value.name);
			if (this.allowTypedObject && Jsonix.Util.Type.exists(context.getElementInfo(name, scope))) {
				var elementDeclaration = context.getElementInfo(name, scope);
				var typeInfo = elementDeclaration.typeInfo;
				var adapter = Jsonix.Model.Adapter.getAdapter(elementDeclaration);
				output.writeStartElement(name);
				adapter.marshal(typeInfo, value.value, context, output, scope);
				output.writeEndElement();
			} else {
				// TODO better exception
				throw new Error("Element [" + name.toString() + "] is not known in this context");
			}
		}
	},
	doBuild : function(context, module)	{
		// Nothing to do
	},
	buildStructure : function(context, structure) {
		Jsonix.Util.Ensure.ensureObject(structure);
		if (Jsonix.Util.Type.exists(structure.value)) {
			// TODO better exception
			throw new Error("The structure already defines a value property.");
		} else if (!Jsonix.Util.Type.exists(structure.elements)) {
			structure.elements = {};
		}

		if ((this.allowDom || this.allowTypedObject)) {
			// if (Jsonix.Util.Type.exists(structure.any)) {
			// // TODO better exception
			// throw new Error("The structure already defines the any
			// property.");
			// } else
			// {
			structure.any = this;
			// }
		}
		if (this.mixed) {
			// if (Jsonix.Util.Type.exists(structure.mixed)) {
			// // TODO better exception
			// throw new Error("The structure already defines the mixed
			// property.");
			// } else
			// {
			structure.mixed = this;
			// }
		}
	},
	CLASS_NAME : 'Jsonix.Model.AnyElementPropertyInfo'
});

Jsonix.Model.Module = Jsonix
		.Class({
			name : null,
			typeInfos : null,
			elementInfos : null,
			defaultElementNamespaceURI : '',
			defaultAttributeNamespaceURI : '',
			initialize : function(mapping) {
				this.typeInfos = [];
				this.elementInfos = [];
				if (typeof mapping !== 'undefined') {
					Jsonix.Util.Ensure.ensureObject(mapping);
					var n = mapping.name||mapping.n||null;
					this.name = n;
					var dens = mapping.defaultElementNamespaceURI||mapping.dens||'';
					this.defaultElementNamespaceURI = dens;
					var dans = mapping.defaultAttributeNamespaceURI||mapping.dans||'';
					this.defaultAttributeNamespaceURI = dans;
					// Initialize type infos
					var tis = mapping.typeInfos||mapping.tis||[];
					this.initializeTypeInfos(tis);

					// Backwards compatibility: class infos can also be defined
					// as properties of the schema, for instance Schema.MyType
					for ( var typeInfoName in mapping) {
						if (mapping.hasOwnProperty(typeInfoName)) {
							if (mapping[typeInfoName] instanceof Jsonix.Model.ClassInfo) {
								this.typeInfos.push(mapping[typeInfoName]);
							}
						}
					}
					var eis = mapping.elementInfos||mapping.eis||[];
					// Initialize element infos
					this.initializeElementInfos(eis);
				}
			},
			initializeTypeInfos : function(typeInfoMappings) {
				Jsonix.Util.Ensure.ensureArray(typeInfoMappings);
				var index, typeInfoMapping, typeInfo;
				for (index = 0; index < typeInfoMappings.length; index++) {
					typeInfoMapping = typeInfoMappings[index];
					typeInfo = this.createTypeInfo(typeInfoMapping);
					this.typeInfos.push(typeInfo);
				}
			},
			initializeElementInfos : function(elementInfoMappings) {
				Jsonix.Util.Ensure.ensureArray(elementInfoMappings);
				var index, elementInfoMapping, elementInfo;
				for (index = 0; index < elementInfoMappings.length; index++) {
					elementInfoMapping = elementInfoMappings[index];
					elementInfo = this.createElementInfo(elementInfoMapping);
					this.elementInfos.push(elementInfo);
				}
			},
			createTypeInfo : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				var typeInfo;
				// If mapping is already a type info, do nothing
				if (mapping instanceof Jsonix.Model.TypeInfo) {
					typeInfo = mapping;
				}
				// Else create it via generic mapping configuration
				else {
					var type = mapping.type||mapping.t||'classInfo';
					// Locate the creator function
					if (Jsonix.Util.Type
							.isFunction(this.typeInfoCreators[type])) {
						var typeInfoCreator = this.typeInfoCreators[type];
						// Call the creator function
						typeInfo = typeInfoCreator.call(this, mapping);
					} else {
						throw new Error("Unknown type info type [" + type + "].");
					}
				}
				return typeInfo;
			},
			initializeNames : function(mapping) {
				var ln = mapping.localName||mapping.ln||null;
				mapping.localName = ln;
				var n = mapping.name||mapping.n||null;
				mapping.name = n;
				// Calculate both name as well as localName
				// name is provided
				if (Jsonix.Util.Type.isString(mapping.name)) {
					// Nothing to do - only name matters
					
					// Obsolete code below
//					// localName is not provided
//					if (!Jsonix.Util.Type.isString(mapping.localName)) {
//						// But module name is provided
//						if (Jsonix.Util.Type.isString(this.name)) {
//							// If name starts with module name, use second part
//							// as local name
//							if (mapping.name.indexOf(this.name + '.') === 0) {
//								mapping.localName = mapping.name
//										.substring(this.name.length + 1);
//							}
//							// Else use name as local name
//							else {
//								mapping.localName = mapping.name;
//							}
//						}
//						// Module name is not provided, use name as local name
//						else {
//							mapping.localName = mapping.name;
//						}
//					}
					if (mapping.name.length > 0 && mapping.name.charAt(0) === '.' && Jsonix.Util.Type.isString(this.name))
					{
						mapping.name = this.name + mapping.name;
					}
				}
				// name is not provided but local name is provided
				else if (Jsonix.Util.Type.isString(mapping.localName)) {
					// Module name is provided
					if (Jsonix.Util.Type.isString(this.name)) {
						mapping.name = this.name + '.' + mapping.localName;
					}
					// Module name is not provided
					else {
						mapping.name = mapping.localName;
					}
				} else {
					throw new Error("Neither [name/n] nor [localName/ln] was provided for the class info.");
				}
			},
			createClassInfo : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				var dens = mapping.defaultElementNamespaceURI||mapping.dens||this.defaultElementNamespaceURI;
				mapping.defaultElementNamespaceURI = dens;
				var dans = mapping.defaultAttributeNamespaceURI||mapping.dans||this.defaultAttributeNamespaceURI;
				mapping.defaultAttributeNamespaceURI = dans;
				this.initializeNames(mapping);
				// Now both name an local name are initialized
				var classInfo = new Jsonix.Model.ClassInfo(mapping);
				return classInfo;
			},
			createEnumLeafInfo : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				this.initializeNames(mapping);
				// Now both name an local name are initialized
				var enumLeafInfo = new Jsonix.Model.EnumLeafInfo(mapping);
				return enumLeafInfo;
			},
			createList : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				var ti = mapping.baseTypeInfo||mapping.typeInfo||mapping.bti||mapping.ti||'String';
				var tn = mapping.typeName||mapping.tn||null;
				var s = mapping.separator||mapping.sep||' ';
				Jsonix.Util.Ensure.ensureExists(ti);
				return new Jsonix.Schema.XSD.List(ti, tn, s);
			},
			createElementInfo : function(mapping) {
				Jsonix.Util.Ensure.ensureObject(mapping);
				var dens = mapping.defaultElementNamespaceURI||mapping.dens||this.defaultElementNamespaceURI;
				mapping.defaultElementNamespaceURI = dens;
				var en = mapping.elementName||mapping.en||undefined;
				Jsonix.Util.Ensure.ensureExists(en);
				
				var ti = mapping.typeInfo||mapping.ti||'String';
				Jsonix.Util.Ensure.ensureExists(ti);
				
				mapping.typeInfo = ti;
				if (Jsonix.Util.Type.isObject(en)) {
					mapping.elementName = Jsonix.XML.QName.fromObject(en);
				} else if (Jsonix.Util.Type.isString(en)) {
					mapping.elementName = new Jsonix.XML.QName(this.defaultElementNamespaceURI, en);
				} else {
					throw new Error('Element info [' + mapping + '] must provide an element name.');
				}
				
				var sh = mapping.substitutionHead||mapping.sh||null;
				if (Jsonix.Util.Type.exists(sh)) {
					if (Jsonix.Util.Type.isObject(sh)) {
						mapping.substitutionHead = Jsonix.XML.QName.fromObject(sh);
					} else {
						Jsonix.Util.Ensure.ensureString(sh);
						mapping.substitutionHead = new Jsonix.XML.QName(this.defaultElementNamespaceURI, sh);
					}
				}
				
				var elementInfo = new Jsonix.Model.ElementInfo(mapping);
				return elementInfo;
			},
			registerTypeInfos : function(context) {
				for ( var index = 0; index < this.typeInfos.length; index++) {
					var typeInfo = this.typeInfos[index];
					context.registerTypeInfo(typeInfo, this);
				}
			},
			buildTypeInfos : function(context) {
				for ( var index = 0; index < this.typeInfos.length; index++) {
					var typeInfo = this.typeInfos[index];
					typeInfo.build(context, this);
				}
			},
			registerElementInfos : function(context) {
				for ( var index = 0; index < this.elementInfos.length; index++) {
					var elementInfo = this.elementInfos[index];
					context.registerElementInfo(elementInfo, this);
				}
			},
			buildElementInfos : function(context) {
				for ( var index = 0; index < this.elementInfos.length; index++) {
					var elementInfo = this.elementInfos[index];
					elementInfo.build(context, this);
				}
			},
			// Obsolete, retained for backwards compatibility
			cs : function() {
				return this;
			},
			// Obsolete, retained for backwards compatibility
			es : function() {
				return this;
			},
			CLASS_NAME : 'Jsonix.Model.Module'
		});
Jsonix.Model.Module.prototype.typeInfoCreators = {
	"classInfo" : Jsonix.Model.Module.prototype.createClassInfo,
	"c" : Jsonix.Model.Module.prototype.createClassInfo,
	"enumInfo" : Jsonix.Model.Module.prototype.createEnumLeafInfo,
	"enum" : Jsonix.Model.Module.prototype.createEnumLeafInfo,
	"list" : Jsonix.Model.Module.prototype.createList,
	"l" : Jsonix.Model.Module.prototype.createList
};
Jsonix.Schema.XSD = {};
Jsonix.Schema.XSD.NAMESPACE_URI = 'http://www.w3.org/2001/XMLSchema';
Jsonix.Schema.XSD.PREFIX = 'xsd';
Jsonix.Schema.XSD.qname = function(localPart) {
	Jsonix.Util.Ensure.ensureString(localPart);
	return new Jsonix.XML.QName(Jsonix.Schema.XSD.NAMESPACE_URI, localPart,
			Jsonix.Schema.XSD.PREFIX);
};

Jsonix.Schema.XSD.AnyType = Jsonix.Class(Jsonix.Model.ClassInfo, {
	typeName : Jsonix.Schema.XSD.qname('anyType'),
	initialize : function() {
		Jsonix.Model.ClassInfo.prototype.initialize.call(this, {
			name : 'AnyType',
			propertyInfos : [ {
				type : 'anyAttribute',
				name : 'attributes'
			}, {
				type : 'anyElement',
				name : 'content',
				collection : true
			} ]
		});
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.AnyType'
});
Jsonix.Schema.XSD.AnyType.INSTANCE = new Jsonix.Schema.XSD.AnyType();
Jsonix.Schema.XSD.AnySimpleType = Jsonix.Class(Jsonix.Model.TypeInfo, {
	name : 'AnySimpleType',
	typeName : Jsonix.Schema.XSD.qname('anySimpleType'),
	initialize : function() {
		Jsonix.Model.TypeInfo.prototype.initialize.apply(this, []);
	},	
	print : function(value, context, output, scope) {
		throw new Error('Abstract method [print].');
	},
	parse : function(text, context, input, scope) {
		throw new Error('Abstract method [parse].');
	},
	reprint : function(value, context, output, scope) {
		// Only reprint when the value is a string but not an instance
		if (Jsonix.Util.Type.isString(value) && !this.isInstance(value, context, scope)) {
			// Using null as input as input is not available
			return this.print(this.parse(value, context, null, scope), context, output, scope);
		}
		else
		{
			return this.print(value, context, output, scope);
		}
	},
	unmarshal : function(context, input, scope) {
		var text = input.getElementText();
		if (Jsonix.Util.StringUtils.isNotBlank(text)) {
			return this.parse(text, context, input, scope);
		} else {
			return null;
		}
	},
	marshal : function(value, context, output, scope) {
		if (Jsonix.Util.Type.exists(value)) {
			output.writeCharacters(this.reprint(value, context, output, scope));
		}
	},
	build: function(context, module)
	{
		// Nothing to do
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.AnySimpleType'
});

Jsonix.Schema.XSD.List = Jsonix
		.Class(
				Jsonix.Schema.XSD.AnySimpleType,
				{
					name : null,
					typeName : null,
					typeInfo : null,
					separator : ' ',
					trimmedSeparator : Jsonix.Util.StringUtils.whitespaceCharacters,
					simpleType : true,
					built : false,
					initialize : function(typeInfo, typeName, separator) {
						Jsonix.Util.Ensure.ensureExists(typeInfo);
						// TODO Ensure correct argument
						this.typeInfo = typeInfo;
						if (!Jsonix.Util.Type.exists(this.name)) {
							this.name = typeInfo.name + "*";
						}
						if (Jsonix.Util.Type.exists(typeName)) {
							// TODO Ensure correct argument
							this.typeName = typeName;
						}

						if (Jsonix.Util.Type.isString(separator)) {
							// TODO Ensure correct argument
							this.separator = separator;
						} else {
							this.separator = ' ';
						}

						var trimmedSeparator = Jsonix.Util.StringUtils
								.trim(this.separator);
						if (trimmedSeparator.length === 0) {
							this.trimmedSeparator = Jsonix.Util.StringUtils.whitespaceCharacters;
						} else {
							this.trimmedSeparator = trimmedSeparator;
						}
					},
					build : function(context, module) {
						if (!this.built) {
							this.typeInfo = context.resolveTypeInfo(this.typeInfo, module);
							this.built = true;
						}
					},
					print : function(value, context, output, scope) {
						if (!Jsonix.Util.Type.exists(value)) {
							return null;
						}
						// TODO Exception if not an array
						Jsonix.Util.Ensure.ensureArray(value);
						var result = '';
						for ( var index = 0; index < value.length; index++) {
							if (index > 0) {
								result = result + this.separator;
							}
							result = result + this.typeInfo.reprint(value[index], context, output, scope);
						}
						return result;
					},
					parse : function(text, context, input, scope) {
						Jsonix.Util.Ensure.ensureString(text);
						var items = Jsonix.Util.StringUtils
								.splitBySeparatorChars(text,
										this.trimmedSeparator);
						var result = [];
						for ( var index = 0; index < items.length; index++) {
							result.push(this.typeInfo
									.parse(Jsonix.Util.StringUtils.trim(items[index]), context, input, scope));
						}
						return result;
					},
					// TODO isInstance?
					CLASS_NAME : 'Jsonix.Schema.XSD.List'
				});

Jsonix.Schema.XSD.String = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'String',
	typeName : Jsonix.Schema.XSD.qname('string'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureString(value);
		return value;
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		return text;
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isString(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.String'
});
Jsonix.Schema.XSD.String.INSTANCE = new Jsonix.Schema.XSD.String();
Jsonix.Schema.XSD.String.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.String.INSTANCE);
Jsonix.Schema.XSD.Strings = Jsonix.Class(Jsonix.Schema.XSD.List, {
	name : 'Strings',
	initialize : function() {
		Jsonix.Schema.XSD.List.prototype.initialize.apply(this, [ Jsonix.Schema.XSD.String.INSTANCE, Jsonix.Schema.XSD.qname('strings'), ' ' ]);
	},
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.Strings'
});
Jsonix.Schema.XSD.Strings.INSTANCE = new Jsonix.Schema.XSD.Strings();
Jsonix.Schema.XSD.NormalizedString = Jsonix.Class(Jsonix.Schema.XSD.String, {
	name : 'NormalizedString',
	typeName : Jsonix.Schema.XSD.qname('normalizedString'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.NormalizedString'
});
Jsonix.Schema.XSD.NormalizedString.INSTANCE = new Jsonix.Schema.XSD.NormalizedString();
Jsonix.Schema.XSD.NormalizedString.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.NormalizedString.INSTANCE);
Jsonix.Schema.XSD.Token = Jsonix.Class(Jsonix.Schema.XSD.NormalizedString, {
	name : 'Token',
	typeName : Jsonix.Schema.XSD.qname('token'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.Token'
});
Jsonix.Schema.XSD.Token.INSTANCE = new Jsonix.Schema.XSD.Token();
Jsonix.Schema.XSD.Token.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Token.INSTANCE);
Jsonix.Schema.XSD.Language = Jsonix.Class(Jsonix.Schema.XSD.Token, {
	name : 'Language',
	typeName : Jsonix.Schema.XSD.qname('language'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.Language'
});
Jsonix.Schema.XSD.Language.INSTANCE = new Jsonix.Schema.XSD.Language();
Jsonix.Schema.XSD.Language.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Language.INSTANCE);
Jsonix.Schema.XSD.Name = Jsonix.Class(Jsonix.Schema.XSD.Token, {
	name : 'Name',
	typeName : Jsonix.Schema.XSD.qname('Name'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.Name'
});
Jsonix.Schema.XSD.Name.INSTANCE = new Jsonix.Schema.XSD.Name();
Jsonix.Schema.XSD.Name.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Name.INSTANCE);
Jsonix.Schema.XSD.NCName = Jsonix.Class(Jsonix.Schema.XSD.Name, {
	name : 'NCName',
	typeName : Jsonix.Schema.XSD.qname('NCName'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.NCName'
});
Jsonix.Schema.XSD.NCName.INSTANCE = new Jsonix.Schema.XSD.NCName();
Jsonix.Schema.XSD.NCName.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.NCName.INSTANCE);
Jsonix.Schema.XSD.NMToken = Jsonix.Class(Jsonix.Schema.XSD.Token, {
	name : 'NMToken',
	typeName : Jsonix.Schema.XSD.qname('NMTOKEN'),
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.NMToken'
});
Jsonix.Schema.XSD.NMToken.INSTANCE = new Jsonix.Schema.XSD.NMToken();
Jsonix.Schema.XSD.NMTokens = Jsonix.Class(Jsonix.Schema.XSD.List, {
	name : 'NMTokens',
	initialize : function() {
		Jsonix.Schema.XSD.List.prototype.initialize.apply(this, [ Jsonix.Schema.XSD.NMToken.INSTANCE, Jsonix.Schema.XSD.qname('NMTOKEN'), ' ' ]);
	},
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.NMTokens'
});
Jsonix.Schema.XSD.NMTokens.INSTANCE = new Jsonix.Schema.XSD.NMTokens();
Jsonix.Schema.XSD.Boolean = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'Boolean',
	typeName : Jsonix.Schema.XSD.qname('boolean'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureBoolean(value);
		return value ? 'true' : 'false';
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		if (text === 'true' || text === '1') {
			return true;
		} else if (text === 'false' || text === '0') {
			return false;
		} else {
			throw new Error("Either [true], [1], [0] or [false] expected as boolean value.");
		}
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isBoolean(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.Boolean'
});
Jsonix.Schema.XSD.Boolean.INSTANCE = new Jsonix.Schema.XSD.Boolean();
Jsonix.Schema.XSD.Boolean.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Boolean.INSTANCE);
Jsonix.Schema.XSD.Base64Binary = Jsonix
		.Class(
				Jsonix.Schema.XSD.AnySimpleType,
				{
					name : 'Base64Binary',
					typeName : Jsonix.Schema.XSD.qname('base64Binary'),
					charToByte : {},
					byteToChar : [],
					initialize : function() {
						Jsonix.Schema.XSD.AnySimpleType.prototype.initialize
								.apply(this);
						// Initialize charToByte and byteToChar table for fast
						// lookups
						var charTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
						for ( var i = 0; i < charTable.length; i++) {
							var _char = charTable.charAt(i);
							var _byte = charTable.charCodeAt(i);
							this.byteToChar[i] = _char;
							this.charToByte[_char] = i;
						}
					},
					print : function(value, context, output, scope) {
						Jsonix.Util.Ensure.ensureArray(value);
						return this.encode(value);
					},

					parse : function(text, context, input, scope) {
						Jsonix.Util.Ensure.ensureString(text);
						return this.decode(text);
					},
					encode : function(uarray) {
						var output = "";
						var byte0;
						var byte1;
						var byte2;
						var char0;
						var char1;
						var char2;
						var char3;
						var i = 0;
						var j = 0;
						var length = uarray.length;

						for (i = 0; i < length; i += 3) {
							byte0 = uarray[i] & 0xFF;
							char0 = this.byteToChar[byte0 >> 2];

							if (i + 1 < length) {
								byte1 = uarray[i + 1] & 0xFF;
								char1 = this.byteToChar[((byte0 & 0x03) << 4)
										| (byte1 >> 4)];
								if (i + 2 < length) {
									byte2 = uarray[i + 2] & 0xFF;
									char2 = this.byteToChar[((byte1 & 0x0F) << 2)
											| (byte2 >> 6)];
									char3 = this.byteToChar[byte2 & 0x3F];
								} else {
									char2 = this.byteToChar[(byte1 & 0x0F) << 2];
									char3 = "=";
								}
							} else {
								char1 = this.byteToChar[(byte0 & 0x03) << 4];
								char2 = "=";
								char3 = "=";
							}
							output = output + char0 + char1 + char2 + char3;
						}
						return output;
					},
					decode : function(text) {

						input = text.replace(/[^A-Za-z0-9\+\/\=]/g, "");

						var length = (input.length / 4) * 3;
						if (input.charAt(input.length - 1) === "=") {
							length--;
						}
						if (input.charAt(input.length - 2) === "=") {
							length--;
						}

						var uarray = new Array(length);

						var byte0;
						var byte1;
						var byte2;
						var char0;
						var char1;
						var char2;
						var char3;
						var i = 0;
						var j = 0;

						for (i = 0; i < length; i += 3) {
							// get the 3 octects in 4 ascii chars
							char0 = this.charToByte[input.charAt(j++)];
							char1 = this.charToByte[input.charAt(j++)];
							char2 = this.charToByte[input.charAt(j++)];
							char3 = this.charToByte[input.charAt(j++)];

							byte0 = (char0 << 2) | (char1 >> 4);
							byte1 = ((char1 & 0x0F) << 4) | (char2 >> 2);
							byte2 = ((char2 & 0x03) << 6) | char3;

							uarray[i] = byte0;
							if (char2 != 64) {
								uarray[i + 1] = byte1;
							}
							if (char3 != 64) {
								uarray[i + 2] = byte2;
							}
						}
						return uarray;
					},
					isInstance : function(value, context, scope) {
						return Jsonix.Util.Type.isArray(value);
					},
					CLASS_NAME : 'Jsonix.Schema.XSD.Base64Binary'
				});
Jsonix.Schema.XSD.Base64Binary.INSTANCE = new Jsonix.Schema.XSD.Base64Binary();
Jsonix.Schema.XSD.Base64Binary.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.Base64Binary.INSTANCE);
Jsonix.Schema.XSD.HexBinary = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'HexBinary',
	typeName : Jsonix.Schema.XSD.qname('hexBinary'),
	charToQuartet : {},
	byteToDuplet : [],
	initialize : function() {
		Jsonix.Schema.XSD.AnySimpleType.prototype.initialize.apply(this);
		var charTableUpperCase = "0123456789ABCDEF";
		var charTableLowerCase = charTableUpperCase.toLowerCase();
		var i;
		for (i = 0; i < 16; i++) {
			this.charToQuartet[charTableUpperCase.charAt(i)] = i;
			if (i >= 0xA) {
				this.charToQuartet[charTableLowerCase.charAt(i)] = i;
			}
		}
		for (i = 0; i < 256; i++) {
			this.byteToDuplet[i] =
			//
			charTableUpperCase[i >> 4] + charTableUpperCase[i & 0xF];
		}
	},
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureArray(value);
		return this.encode(value);
	},

	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		return this.decode(text);
	},
	encode : function(uarray) {
		var output = "";
		for ( var i = 0; i < uarray.length; i++) {
			output = output + this.byteToDuplet[uarray[i] & 0xFF];
		}
		return output;
	},
	decode : function(text) {
		var input = text.replace(/[^A-Fa-f0-9]/g, "");
		// Round by two
		var length = input.length >> 1;
		var uarray = new Array(length);
		for ( var i = 0; i < length; i++) {
			var char0 = input.charAt(2 * i);
			var char1 = input.charAt(2 * i + 1);
			uarray[i] = this.charToQuartet[char0] << 4
					| this.charToQuartet[char1];
		}
		return uarray;
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isArray(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.HexBinary'
});
Jsonix.Schema.XSD.HexBinary.INSTANCE = new Jsonix.Schema.XSD.HexBinary();
Jsonix.Schema.XSD.HexBinary.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.HexBinary.INSTANCE);
Jsonix.Schema.XSD.Number = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'Number',
	typeName : Jsonix.Schema.XSD.qname('number'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureNumberOrNaN(value);
		if (Jsonix.Util.Type.isNaN(value)) {
			return 'NaN';
		} else if (value === Infinity) {
			return 'INF';
		} else if (value === -Infinity) {
			return '-INF';
		} else {
			var text = String(value);
			return text;
		}
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		if (text === '-INF') {
			return -Infinity;
		} else if (text === 'INF') {
			return Infinity;
		} else if (text === 'NaN') {
			return NaN;
		} else {
			var value = Number(text);
			Jsonix.Util.Ensure.ensureNumber(value);
			return value;
		}
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isNumberOrNaN(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.Number'
});
Jsonix.Schema.XSD.Number.INSTANCE = new Jsonix.Schema.XSD.Number();
Jsonix.Schema.XSD.Number.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Number.INSTANCE);
Jsonix.Schema.XSD.Float = Jsonix.Class(Jsonix.Schema.XSD.Number, {
	name : 'Float',
	typeName : Jsonix.Schema.XSD.qname('float'),
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isNaN(value) || value === -Infinity || value === Infinity || (Jsonix.Util.Type.isNumber(value) && value >= this.MIN_VALUE && value <= this.MAX_VALUE);
	},
	MIN_VALUE : -3.4028235e+38,
	MAX_VALUE : 3.4028235e+38,
	CLASS_NAME : 'Jsonix.Schema.XSD.Float'
});
Jsonix.Schema.XSD.Float.INSTANCE = new Jsonix.Schema.XSD.Float();
Jsonix.Schema.XSD.Float.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Float.INSTANCE);
Jsonix.Schema.XSD.Decimal = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'Decimal',
	typeName : Jsonix.Schema.XSD.qname('decimal'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureNumber(value);
		var text = String(value);
		return text;
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		var value = Number(text);
		Jsonix.Util.Ensure.ensureNumber(value);
		return value;
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isNumber(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.Decimal'
});
Jsonix.Schema.XSD.Decimal.INSTANCE = new Jsonix.Schema.XSD.Decimal();
Jsonix.Schema.XSD.Decimal.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Decimal.INSTANCE);
Jsonix.Schema.XSD.Integer = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'Integer',
	typeName : Jsonix.Schema.XSD.qname('integer'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureInteger(value);
		var text = String(value);
		return text;
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		var value = Number(text);
		Jsonix.Util.Ensure.ensureInteger(value);
		return value;
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.NumberUtils.isInteger(value) && value >= this.MIN_VALUE && value <= this.MAX_VALUE;
	},
	MIN_VALUE : -9223372036854775808,
	MAX_VALUE : 9223372036854775807,
	CLASS_NAME : 'Jsonix.Schema.XSD.Integer'
});
Jsonix.Schema.XSD.Integer.INSTANCE = new Jsonix.Schema.XSD.Integer();
Jsonix.Schema.XSD.Integer.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Integer.INSTANCE);
Jsonix.Schema.XSD.NonPositiveInteger = Jsonix.Class(Jsonix.Schema.XSD.Integer, {
	name : 'NonPositiveInteger',
	typeName : Jsonix.Schema.XSD.qname('nonPositiveInteger'),
	MIN_VALUE: -9223372036854775808,
	MAX_VALUE: 0,
	CLASS_NAME : 'Jsonix.Schema.XSD.NonPositiveInteger'
});
Jsonix.Schema.XSD.NonPositiveInteger.INSTANCE = new Jsonix.Schema.XSD.NonPositiveInteger();
Jsonix.Schema.XSD.NonPositiveInteger.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.NonPositiveInteger.INSTANCE);
Jsonix.Schema.XSD.NegativeInteger = Jsonix.Class(Jsonix.Schema.XSD.NonPositiveInteger, {
	name : 'NegativeInteger',
	typeName : Jsonix.Schema.XSD.qname('negativeInteger'),
	MIN_VALUE: -9223372036854775808,
	MAX_VALUE: -1,
	CLASS_NAME : 'Jsonix.Schema.XSD.NegativeInteger'
});
Jsonix.Schema.XSD.NegativeInteger.INSTANCE = new Jsonix.Schema.XSD.NegativeInteger();
Jsonix.Schema.XSD.NegativeInteger.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.NegativeInteger.INSTANCE);
Jsonix.Schema.XSD.Long = Jsonix.Class(Jsonix.Schema.XSD.Integer, {
	name : 'Long',
	typeName : Jsonix.Schema.XSD.qname('long'),
	MIN_VALUE : -9223372036854775808,
	MAX_VALUE : 9223372036854775807,
	CLASS_NAME : 'Jsonix.Schema.XSD.Long'
});
Jsonix.Schema.XSD.Long.INSTANCE = new Jsonix.Schema.XSD.Long();
Jsonix.Schema.XSD.Long.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.Long.INSTANCE);
Jsonix.Schema.XSD.Int = Jsonix.Class(Jsonix.Schema.XSD.Long, {
	name : 'Int',
	typeName : Jsonix.Schema.XSD.qname('int'),
	MIN_VALUE : -2147483648,
	MAX_VALUE : 2147483647,
	CLASS_NAME : 'Jsonix.Schema.XSD.Int'
});
Jsonix.Schema.XSD.Int.INSTANCE = new Jsonix.Schema.XSD.Int();
Jsonix.Schema.XSD.Int.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.Int.INSTANCE);
Jsonix.Schema.XSD.Short = Jsonix.Class(Jsonix.Schema.XSD.Int, {
	name : 'Short',
	typeName : Jsonix.Schema.XSD.qname('short'),
	MIN_VALUE : -32768,
	MAX_VALUE : 32767,
	CLASS_NAME : 'Jsonix.Schema.XSD.Short'
});
Jsonix.Schema.XSD.Short.INSTANCE = new Jsonix.Schema.XSD.Short();
Jsonix.Schema.XSD.Short.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Short.INSTANCE);
Jsonix.Schema.XSD.Byte = Jsonix.Class(Jsonix.Schema.XSD.Short, {
	name : 'Byte',
	typeName : Jsonix.Schema.XSD.qname('byte'),
	MIN_VALUE : -128,
	MAX_VALUE : 127,
	CLASS_NAME : 'Jsonix.Schema.XSD.Byte'
});
Jsonix.Schema.XSD.Byte.INSTANCE = new Jsonix.Schema.XSD.Byte();
Jsonix.Schema.XSD.Byte.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Byte.INSTANCE);
Jsonix.Schema.XSD.NonNegativeInteger = Jsonix.Class(Jsonix.Schema.XSD.Integer, {
	name : 'NonNegativeInteger',
	typeName : Jsonix.Schema.XSD.qname('nonNegativeInteger'),
	MIN_VALUE: 0,
	MAX_VALUE: 9223372036854775807,
	CLASS_NAME : 'Jsonix.Schema.XSD.NonNegativeInteger'
});
Jsonix.Schema.XSD.NonNegativeInteger.INSTANCE = new Jsonix.Schema.XSD.NonNegativeInteger();
Jsonix.Schema.XSD.NonNegativeInteger.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.NonNegativeInteger.INSTANCE);
Jsonix.Schema.XSD.UnsignedLong = Jsonix.Class(Jsonix.Schema.XSD.NonNegativeInteger, {
	name : 'UnsignedLong',
	typeName : Jsonix.Schema.XSD.qname('unsignedLong'),
	MIN_VALUE : 0,
	MAX_VALUE : 18446744073709551615,
	CLASS_NAME : 'Jsonix.Schema.XSD.UnsignedLong'
});
Jsonix.Schema.XSD.UnsignedLong.INSTANCE = new Jsonix.Schema.XSD.UnsignedLong();
Jsonix.Schema.XSD.UnsignedLong.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.UnsignedLong.INSTANCE);
Jsonix.Schema.XSD.UnsignedInt = Jsonix.Class(Jsonix.Schema.XSD.UnsignedLong, {
	name : 'UnsignedInt',
	typeName : Jsonix.Schema.XSD.qname('unsignedInt'),
	MIN_VALUE : 0,
	MAX_VALUE : 4294967295,
	CLASS_NAME : 'Jsonix.Schema.XSD.UnsignedInt'
});
Jsonix.Schema.XSD.UnsignedInt.INSTANCE = new Jsonix.Schema.XSD.UnsignedInt();
Jsonix.Schema.XSD.UnsignedInt.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.UnsignedInt.INSTANCE);
Jsonix.Schema.XSD.UnsignedShort = Jsonix.Class(Jsonix.Schema.XSD.UnsignedInt, {
	name : 'UnsignedShort',
	typeName : Jsonix.Schema.XSD.qname('unsignedShort'),
	MIN_VALUE : 0,
	MAX_VALUE : 65535,
	CLASS_NAME : 'Jsonix.Schema.XSD.UnsignedShort'
});
Jsonix.Schema.XSD.UnsignedShort.INSTANCE = new Jsonix.Schema.XSD.UnsignedShort();
Jsonix.Schema.XSD.UnsignedShort.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.UnsignedShort.INSTANCE);
Jsonix.Schema.XSD.UnsignedByte = Jsonix.Class(Jsonix.Schema.XSD.UnsignedShort, {
	name : 'UnsignedByte',
	typeName : Jsonix.Schema.XSD.qname('unsignedByte'),
	MIN_VALUE : 0,
	MAX_VALUE : 255,
	CLASS_NAME : 'Jsonix.Schema.XSD.UnsignedByte'
});
Jsonix.Schema.XSD.UnsignedByte.INSTANCE = new Jsonix.Schema.XSD.UnsignedByte();
Jsonix.Schema.XSD.UnsignedByte.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.UnsignedByte.INSTANCE);
Jsonix.Schema.XSD.PositiveInteger = Jsonix.Class(Jsonix.Schema.XSD.NonNegativeInteger, {
	name : 'PositiveInteger',
	typeName : Jsonix.Schema.XSD.qname('positiveInteger'),
	MIN_VALUE : 1,
	MAX_VALUE : 9223372036854775807,
	CLASS_NAME : 'Jsonix.Schema.XSD.PositiveInteger'
});
Jsonix.Schema.XSD.PositiveInteger.INSTANCE = new Jsonix.Schema.XSD.PositiveInteger();
Jsonix.Schema.XSD.PositiveInteger.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.PositiveInteger.INSTANCE);
Jsonix.Schema.XSD.Double = Jsonix.Class(Jsonix.Schema.XSD.Number, {
	name : 'Double',
	typeName : Jsonix.Schema.XSD.qname('double'),
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isNaN(value) || value === -Infinity || value === Infinity || (Jsonix.Util.Type.isNumber(value) && value >= this.MIN_VALUE && value <= this.MAX_VALUE);
	},
	MIN_VALUE : -1.7976931348623157e+308,
	MAX_VALUE : 1.7976931348623157e+308,
	CLASS_NAME : 'Jsonix.Schema.XSD.Double'
});
Jsonix.Schema.XSD.Double.INSTANCE = new Jsonix.Schema.XSD.Double();
Jsonix.Schema.XSD.Double.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Double.INSTANCE);
Jsonix.Schema.XSD.AnyURI = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'AnyURI',
	typeName : Jsonix.Schema.XSD.qname('anyURI'),
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureString(value);
		return value;
	},
	parse : function(text, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(text);
		return text;
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isString(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.AnyURI'
});
Jsonix.Schema.XSD.AnyURI.INSTANCE = new Jsonix.Schema.XSD.AnyURI();
Jsonix.Schema.XSD.AnyURI.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.AnyURI.INSTANCE);
Jsonix.Schema.XSD.QName = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'QName',
	typeName : Jsonix.Schema.XSD.qname('QName'),
	print : function(value, context, output, scope) {
		var qName = Jsonix.XML.QName.fromObject(value);
		var prefix;
		var localPart = qName.localPart;
		if (output) {
			// If QName does not provide the prefix, let it be generated
			prefix = output.getPrefix(qName.namespaceURI, qName.prefix||null);
			output.declareNamespace(qName.namespaceURI, prefix);
		} else {
			prefix = qName.prefix;
		}
		return !prefix ? localPart : (prefix + ':' + localPart);
	},
	parse : function(value, context, input, scope) {
		Jsonix.Util.Ensure.ensureString(value);
		value = Jsonix.Util.StringUtils.trim(value);
		var prefix;
		var localPart;
		var colonPosition = value.indexOf(':');
		if (colonPosition === -1) {
			prefix = '';
			localPart = value;
		} else if (colonPosition > 0 && colonPosition < (value.length - 1)) {
			prefix = value.substring(0, colonPosition);
			localPart = value.substring(colonPosition + 1);
		} else {
			throw new Error('Invalid QName [' + value + '].');
		}
		var namespaceContext = input || context || null;
		if (!namespaceContext)
		{
			return value;
		}
		else
		{
			var namespaceURI = namespaceContext.getNamespaceURI(prefix);
			if (Jsonix.Util.Type.isString(namespaceURI))
			{
				return new Jsonix.XML.QName(namespaceURI, localPart, prefix);
			}
			else
			{
				throw new Error('Prefix [' + prefix + '] of the QName [' + value + '] is not bound in this context.');
			}
		}
	},
	isInstance : function(value, context, scope) {
		return (value instanceof Jsonix.XML.QName) || (Jsonix.Util.Type.isObject(value) && Jsonix.Util.Type.isString(value.localPart || value.lp));
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.QName'
});
Jsonix.Schema.XSD.QName.INSTANCE = new Jsonix.Schema.XSD.QName();
Jsonix.Schema.XSD.QName.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.QName.INSTANCE);
Jsonix.Schema.XSD.Calendar = Jsonix
		.Class(
				Jsonix.Schema.XSD.AnySimpleType,
				{
					name : 'Calendar',
					typeName : Jsonix.Schema.XSD.qname('calendar'),
					parse : function(text, context, input, scope) {
						Jsonix.Util.Ensure.ensureString(text);
						var negative = (text.charAt(0) === '-');
						var sign = negative ? -1 : 1;
						var data = negative ? text.substring(1) : text;

						// Detect pattern

						var result;
						if (data.length >= 19 && data.charAt(4) === '-' && data.charAt(7) === '-' && data.charAt(10) === 'T' && data.charAt(13) === ':' && data.charAt(16) === ':') {
							return this.parseDateTime(text);
						} else if (data.length >= 10 && data.charAt(4) === '-' && data.charAt(7) === '-') {
							return this.parseDate(text);
						} else if (data.length >= 8 && data.charAt(2) === ':' && data.charAt(5) === ':') {
							return this.parseTime(text);
						} else {
							throw new Error('Value [' + text + '] does not match dateTime, date or time patterns.');
						}
					},
					parseDateTime : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						var negative = (text.charAt(0) === '-');
						var sign = negative ? -1 : 1;

						var dateTimeWithTimeZone = negative ? text.substring(1) : text;

						if (dateTimeWithTimeZone.length < 19 || dateTimeWithTimeZone.charAt(4) !== '-' || dateTimeWithTimeZone.charAt(7) !== '-' || dateTimeWithTimeZone.charAt(10) !== 'T' || dateTimeWithTimeZone.charAt(13) !== ':' || dateTimeWithTimeZone.charAt(16) !== ':') {
							throw new Error('Date time string [' + dateTimeWithTimeZone + '] must be a string in format [\'-\'? yyyy \'-\' mm \'-\' dd \'T\' hh \':\' mm \':\' ss (\'.\' s+)? (zzzzzz)?].');
						}

						var timeZoneIndex;
						var plusIndex = dateTimeWithTimeZone.indexOf('+', 19);
						if (plusIndex >= 0) {
							timeZoneIndex = plusIndex;
						} else {
							var minusIndex = dateTimeWithTimeZone.indexOf('-', 19);
							if (minusIndex >= 0) {
								timeZoneIndex = minusIndex;
							} else {
								var zIndex = dateTimeWithTimeZone.indexOf('Z', 19);
								if (zIndex >= 0) {
									timeZoneIndex = zIndex;
								} else {
									timeZoneIndex = dateTimeWithTimeZone.length;
								}
							}
						}

						var validTimeZoneIndex = timeZoneIndex > 0 && timeZoneIndex < dateTimeWithTimeZone.length;

						var dateString = dateTimeWithTimeZone.substring(0, 10);
						var timeString = validTimeZoneIndex ? dateTimeWithTimeZone.substring(11, timeZoneIndex) : dateTimeWithTimeZone.substring(11);
						var timeZoneString = validTimeZoneIndex ? dateTimeWithTimeZone.substring(timeZoneIndex) : '';
						var date = this.parseDateString(dateString);
						var time = this.parseTimeString(timeString);
						var timezone = this.parseTimeZoneString(timeZoneString);

						return Jsonix.XML.Calendar.fromObject({
							year : sign * date.year,
							month : date.month,
							day : date.day,
							hour : time.hour,
							minute : time.minute,
							second : time.second,
							fractionalSecond : time.fractionalSecond,
							timezone : timezone
						});

					},
					parseDate : function(text) {
						Jsonix.Util.Ensure.ensureString(text);

						var negative = (text.charAt(0) === '-');
						var sign = negative ? -1 : 1;

						var dateWithTimeZone = negative ? text.substring(1) : text;

						var timeZoneIndex;
						var plusIndex = dateWithTimeZone.indexOf('+', 10);
						if (plusIndex >= 0) {
							timeZoneIndex = plusIndex;
						} else {
							var minusIndex = dateWithTimeZone.indexOf('-', 10);
							if (minusIndex >= 0) {
								timeZoneIndex = minusIndex;
							} else {
								var zIndex = dateWithTimeZone.indexOf('Z', 10);
								if (zIndex >= 0) {
									timeZoneIndex = zIndex;
								} else {
									timeZoneIndex = dateWithTimeZone.length;
								}
							}
						}
						var validTimeZoneIndex = timeZoneIndex > 0 && timeZoneIndex < dateWithTimeZone.length;
						var dateString = validTimeZoneIndex ? dateWithTimeZone.substring(0, timeZoneIndex) : dateWithTimeZone;

						var date = this.parseDateString(dateString);
						var timeZoneString = validTimeZoneIndex ? text.substring(timeZoneIndex) : '';
						var timezone = this.parseTimeZoneString(timeZoneString);

						return Jsonix.XML.Calendar.fromObject({
							year : sign * date.year,
							month : date.month,
							day : date.day,
							timezone : timezone
						});

					},
					parseTime : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						var timeZoneIndex;
						var plusIndex = text.indexOf('+', 7);
						if (plusIndex >= 0) {
							timeZoneIndex = plusIndex;
						} else {
							var minusIndex = text.indexOf('-', 7);
							if (minusIndex >= 0) {
								timeZoneIndex = minusIndex;
							} else {
								var zIndex = text.indexOf('Z', 7);
								if (zIndex >= 0) {
									timeZoneIndex = zIndex;
								} else {
									timeZoneIndex = text.length;
								}
							}
						}

						var validTimeZoneIndex = timeZoneIndex > 0 && timeZoneIndex < text.length;
						var timeString = validTimeZoneIndex ? text.substring(0, timeZoneIndex) : text;

						var time = this.parseTimeString(timeString);
						var timeZoneString = validTimeZoneIndex ? text.substring(timeZoneIndex) : '';
						var timezone = this.parseTimeZoneString(timeZoneString);

						return Jsonix.XML.Calendar.fromObject({
							hour : time.hour,
							minute : time.minute,
							second : time.second,
							fractionalSecond : time.fractionalSecond,
							timezone : timezone
						});

					},
					parseDateString : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 10) {
							throw new Error('Date string [' + text + '] must be 10 characters long.');
						}

						if (text.charAt(4) !== '-' || text.charAt(7) !== '-') {
							throw new Error('Date string [' + text + '] must be a string in format [yyyy \'-\' mm \'-\' ss ].');
						}

						var year = this.parseYear(text.substring(0, 4));
						var month = this.parseMonth(text.substring(5, 7));
						var day = this.parseDay(text.substring(8, 10));

						return {
							year : year,
							month : month,
							day : day
						};
					},
					parseTimeString : function(timeString) {
						Jsonix.Util.Ensure.ensureString(timeString);
						if (timeString.length < 8 || timeString.charAt(2) !== ':' || timeString.charAt(5) !== ':') {
							throw new Error('Time string [' + timeString + '] must be a string in format [hh \':\' mm \':\' ss (\'.\' s+)?].');
						}
						var hourString = timeString.substring(0, 2);
						var minuteString = timeString.substring(3, 5);
						var secondString = timeString.substring(6, 8);
						var fractionalSecondString = timeString.length >= 9 ? timeString.substring(8) : '';
						var hour = this.parseHour(hourString);
						var minute = this.parseHour(minuteString);
						var second = this.parseSecond(secondString);
						var fractionalSecond = this.parseFractionalSecond(fractionalSecondString);
						return {
							hour : hour,
							minute : minute,
							second : second,
							fractionalSecond : fractionalSecond
						};

					},
					parseTimeZoneString : function(text) {
						// (('+' | '-') hh ':' mm) | 'Z'
						Jsonix.Util.Ensure.ensureString(text);
						if (text === '') {
							return NaN;
						} else if (text === 'Z') {
							return 0;
						} else {
							if (text.length !== 6) {
								throw new Error('Time zone must be an empty string, \'Z\' or a string in format [(\'+\' | \'-\') hh \':\' mm].');
							}
							var signString = text.charAt(0);
							var sign;
							if (signString === '+') {
								sign = 1;
							} else if (signString === '-') {
								sign = -1;
							} else {
								throw new Error('First character of the time zone [' + text + '] must be \'+\' or \'-\'.');
							}
							var hour = this.parseHour(text.substring(1, 3));
							var minute = this.parseMinute(text.substring(4, 6));
							return -1 * sign * (hour * 60 + minute);
						}

					},
					parseYear : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 4) {
							throw new Error('Year [' + text + '] must be a four-digit number.');
						}
						var year = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureInteger(year);
						return year;
					},
					parseMonth : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 2) {
							throw new Error('Month [' + text + '] must be a two-digit number.');
						}
						var month = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureInteger(month);
						return month;
					},
					parseDay : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 2) {
							throw new Error('Day [' + text + '] must be a two-digit number.');
						}
						var day = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureInteger(day);
						return day;
					},
					parseHour : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 2) {
							throw new Error('Hour [' + text + '] must be a two-digit number.');
						}
						var hour = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureInteger(hour);
						return hour;
					},
					parseMinute : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 2) {
							throw new Error('Minute [' + text + '] must be a two-digit number.');
						}
						var minute = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureInteger(minute);
						return minute;
					},
					parseSecond : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text.length !== 2) {
							throw new Error('Second [' + text + '] must be a two-digit number.');
						}
						var second = Number(text);
						// TODO message
						Jsonix.Util.Ensure.ensureNumber(second);
						return second;
					},
					parseFractionalSecond : function(text) {
						Jsonix.Util.Ensure.ensureString(text);
						if (text === '') {
							return 0;
						} else {
							var fractionalSecond = Number(text);
							// TODO message
							Jsonix.Util.Ensure.ensureNumber(fractionalSecond);
							return fractionalSecond;
						}
					},
					print : function(value, context, output, scope) {
						Jsonix.Util.Ensure.ensureObject(value);
						if (Jsonix.Util.NumberUtils.isInteger(value.year) && Jsonix.Util.NumberUtils.isInteger(value.month) && Jsonix.Util.NumberUtils.isInteger(value.day) && Jsonix.Util.NumberUtils.isInteger(value.hour) && Jsonix.Util.NumberUtils.isInteger(value.minute) && Jsonix.Util.NumberUtils
								.isInteger(value.second)) {
							return this.printDateTime(value);
						} else if (Jsonix.Util.NumberUtils.isInteger(value.year) && Jsonix.Util.NumberUtils.isInteger(value.month) && Jsonix.Util.NumberUtils.isInteger(value.day)) {
							return this.printDate(value);
						} else if (Jsonix.Util.NumberUtils.isInteger(value.hour) && Jsonix.Util.NumberUtils.isInteger(value.minute) && Jsonix.Util.NumberUtils.isInteger(value.second)) {
							return this.printTime(value);
						} else {
							throw new Error('Value [' + value + '] is not recognized as dateTime, date or time.');
						}
					},
					printDateTime : function(value) {
						Jsonix.Util.Ensure.ensureObject(value);
						Jsonix.Util.Ensure.ensureInteger(value.year);
						Jsonix.Util.Ensure.ensureInteger(value.month);
						Jsonix.Util.Ensure.ensureInteger(value.day);
						Jsonix.Util.Ensure.ensureInteger(value.hour);
						Jsonix.Util.Ensure.ensureInteger(value.minute);
						Jsonix.Util.Ensure.ensureNumber(value.second);
						if (Jsonix.Util.Type.exists(value.fractionalString)) {
							Jsonix.Util.Ensure.ensureNumber(value.fractionalString);
						}
						if (Jsonix.Util.Type.exists(value.timezone) && !Jsonix.Util.Type.isNaN(value.timezone)) {
							Jsonix.Util.Ensure.ensureInteger(value.timezone);
						}
						var result = this.printDateString(value);
						result = result + 'T';
						result = result + this.printTimeString(value);
						if (Jsonix.Util.Type.exists(value.timezone)) {
							result = result + this.printTimeZoneString(value.timezone);
						}
						return result;
					},
					printDate : function(value) {
						Jsonix.Util.Ensure.ensureObject(value);
						Jsonix.Util.Ensure.ensureNumber(value.year);
						Jsonix.Util.Ensure.ensureNumber(value.month);
						Jsonix.Util.Ensure.ensureNumber(value.day);
						if (Jsonix.Util.Type.exists(value.timezone) && !Jsonix.Util.Type.isNaN(value.timezone)) {
							Jsonix.Util.Ensure.ensureInteger(value.timezone);
						}
						var result = this.printDateString(value);
						if (Jsonix.Util.Type.exists(value.timezone)) {
							result = result + this.printTimeZoneString(value.timezone);
						}
						return result;
					},
					printTime : function(value) {
						Jsonix.Util.Ensure.ensureObject(value);
						Jsonix.Util.Ensure.ensureNumber(value.hour);
						Jsonix.Util.Ensure.ensureNumber(value.minute);
						Jsonix.Util.Ensure.ensureNumber(value.second);
						if (Jsonix.Util.Type.exists(value.fractionalString)) {
							Jsonix.Util.Ensure.ensureNumber(value.fractionalString);
						}
						if (Jsonix.Util.Type.exists(value.timezone) && !Jsonix.Util.Type.isNaN(value.timezone)) {
							Jsonix.Util.Ensure.ensureInteger(value.timezone);
						}

						var result = this.printTimeString(value);
						if (Jsonix.Util.Type.exists(value.timezone)) {
							result = result + this.printTimeZoneString(value.timezone);
						}
						return result;
					},
					printDateString : function(value) {
						Jsonix.Util.Ensure.ensureObject(value);
						Jsonix.Util.Ensure.ensureInteger(value.year);
						Jsonix.Util.Ensure.ensureInteger(value.month);
						Jsonix.Util.Ensure.ensureInteger(value.day);
						return (value.year < 0 ? ('-' + this.printYear(-value.year)) : this.printYear(value.year)) + '-' + this.printMonth(value.month) + '-' + this.printDay(value.day);
					},
					printTimeString : function(value) {
						Jsonix.Util.Ensure.ensureObject(value);
						Jsonix.Util.Ensure.ensureInteger(value.hour);
						Jsonix.Util.Ensure.ensureInteger(value.minute);
						Jsonix.Util.Ensure.ensureInteger(value.second);
						if (Jsonix.Util.Type.exists(value.fractionalSecond)) {
							Jsonix.Util.Ensure.ensureNumber(value.fractionalSecond);
						}
						var result = this.printHour(value.hour);
						result = result + ':';
						result = result + this.printMinute(value.minute);
						result = result + ':';
						result = result + this.printSecond(value.second);
						if (Jsonix.Util.Type.exists(value.fractionalSecond)) {
							result = result + this.printFractionalSecond(value.fractionalSecond);
						}
						return result;
					},
					printTimeZoneString : function(value) {
						if (!Jsonix.Util.Type.exists(value) || Jsonix.Util.Type.isNaN(value)) {
							return '';
						} else {
							Jsonix.Util.Ensure.ensureInteger(value);

							var sign = value < 0 ? -1 : (value > 0 ? 1 : 0);
							var data = value * sign;
							var minute = data % 60;
							var hour = Math.floor(data / 60);

							var result;
							if (sign === 0) {
								return 'Z';
							} else {
								if (sign > 0) {
									result = '-';
								} else if (sign < 0) {
									result = '+';
								}
								result = result + this.printHour(hour);
								result = result + ':';
								result = result + this.printMinute(minute);
								return result;
							}
						}
					},
					printYear : function(value) {
						return this.printInteger(value, 4);
					},
					printMonth : function(value) {
						return this.printInteger(value, 2);
					},
					printDay : function(value) {
						return this.printInteger(value, 2);
					},
					printHour : function(value) {
						return this.printInteger(value, 2);
					},
					printMinute : function(value) {
						return this.printInteger(value, 2);
					},
					printSecond : function(value) {
						return this.printInteger(value, 2);
					},
					printFractionalSecond : function(value) {
						Jsonix.Util.Ensure.ensureNumber(value);
						if (value < 0 || value >= 1) {
							throw new Error('Fractional second [' + value + '] must be between 0 and 1.');
						} else if (value === 0) {
							return '';
						} else {
							var string = String(value);
							var dotIndex = string.indexOf('.');
							if (dotIndex < 0) {
								return '';
							} else {
								return string.substring(dotIndex);
							}
						}
					},
					printInteger : function(value, length) {
						Jsonix.Util.Ensure.ensureInteger(value);
						Jsonix.Util.Ensure.ensureInteger(length);
						if (length <= 0) {
							throw new Error('Length [' + value + '] must be positive.');
						}
						if (value < 0) {
							throw new Error('Value [' + value + '] must not be negative.');
						}
						if (value >= Math.pow(10, length)) {
							throw new Error('Value [' + value + '] must be less than [' + Math.pow(10, length) + '].');
						}
						var result = String(value);
						for ( var i = result.length; i < length; i++) {
							result = '0' + result;
						}
						return result;
					},
					isInstance : function(value, context, scope) {
						return Jsonix.Util.Type.isObject(value) && ((Jsonix.Util.NumberUtils.isInteger(value.year) && Jsonix.Util.NumberUtils.isInteger(value.month) && Jsonix.Util.NumberUtils.isInteger(value.day)) || (Jsonix.Util.NumberUtils.isInteger(value.hour) && Jsonix.Util.NumberUtils.isInteger(value.minute) && Jsonix.Util.NumberUtils
								.isInteger(value.second)));
					},
					CLASS_NAME : 'Jsonix.Schema.XSD.Calendar'
				});
Jsonix.Schema.XSD.Calendar.INSTANCE = new Jsonix.Schema.XSD.Calendar();
Jsonix.Schema.XSD.Calendar.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Calendar.INSTANCE);
Jsonix.Schema.XSD.Duration = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'Duration',
	typeName : Jsonix.Schema.XSD.qname('duration'),
	CLASS_NAME : 'Jsonix.Schema.XSD.Duration'
});
Jsonix.Schema.XSD.Duration.INSTANCE = new Jsonix.Schema.XSD.Duration();
Jsonix.Schema.XSD.Duration.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.Duration.INSTANCE);
Jsonix.Schema.XSD.DateTime = Jsonix.Class(Jsonix.Schema.XSD.Calendar, {
	name : 'DateTime',
	typeName : Jsonix.Schema.XSD.qname('dateTime'),
	parse : function(value, context, input, scope) {
		var calendar = this.parseDateTime(value);
		var date = new Date();
		date.setFullYear(calendar.year);
		date.setMonth(calendar.month - 1);
		date.setDate(calendar.day);
		date.setHours(calendar.hour);
		date.setMinutes(calendar.minute);
		date.setSeconds(calendar.second);
		if (Jsonix.Util.Type.isNumber(calendar.fractionalSecond)) {
			date.setMilliseconds(Math.floor(1000 * calendar.fractionalSecond));
		}
		var timezoneOffset;
		var unknownTimezone;
		var localTimezoneOffset = date.getTimezoneOffset();
		if (Jsonix.Util.NumberUtils.isInteger(calendar.timezone))
		{
			timezoneOffset = calendar.timezone;
			unknownTimezone = false;
		}
		else
		{
			// Unknown timezone
			timezoneOffset = localTimezoneOffset;
			unknownTimezone = true;
		}
		//
		var result = new Date(date.getTime() + (60000 * (timezoneOffset - localTimezoneOffset)));
		if (unknownTimezone)
		{
			// null denotes "unknown timezone"
			result.originalTimezoneOffset = null;
		}
		else
		{
			result.originalTimezoneOffset = timezoneOffset;
		}
		return result;
	},
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureDate(value);
		var timezoneOffset;
		var localTimezoneOffset = value.getTimezoneOffset();
		var correctedValue;
		// If original time zone was unknown, print the given value without
		// the timezone
		if (value.originalTimezoneOffset === null)
		{
			return this.printDateTime(new Jsonix.XML.Calendar({
				year : value.getFullYear(),
				month : value.getMonth() + 1,
				day : value.getDate(),
				hour : value.getHours(),
				minute : value.getMinutes(),
				second : value.getSeconds(),
				fractionalSecond : (value.getMilliseconds() / 1000)
			}));
		}
		else
		{
			// If original timezone was known, correct and print the value with the timezone
			if (Jsonix.Util.NumberUtils.isInteger(value.originalTimezoneOffset))
			{
				timezoneOffset = value.originalTimezoneOffset;
				correctedValue = new Date(value.getTime() - (60000 * (timezoneOffset - localTimezoneOffset)));
			}
			// If original timezone was not specified, do not correct and use the local time zone
			else
			{
				timezoneOffset = localTimezoneOffset;
				correctedValue = value;
			}
			return this.printDateTime(new Jsonix.XML.Calendar({
				year : correctedValue.getFullYear(),
				month : correctedValue.getMonth() + 1,
				day : correctedValue.getDate(),
				hour : correctedValue.getHours(),
				minute : correctedValue.getMinutes(),
				second : correctedValue.getSeconds(),
				fractionalSecond : (correctedValue.getMilliseconds() / 1000),
				timezone: timezoneOffset
			}));
		}
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isDate(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.DateTime'
});
Jsonix.Schema.XSD.DateTime.INSTANCE = new Jsonix.Schema.XSD.DateTime();
Jsonix.Schema.XSD.DateTime.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.DateTime.INSTANCE);

Jsonix.Schema.XSD.Time = Jsonix.Class(Jsonix.Schema.XSD.Calendar, {
	name : 'Time',
	typeName : Jsonix.Schema.XSD.qname('time'),
	parse : function(value, context, input, scope) {
		var calendar = this.parseTime(value);
		var date = new Date();
		date.setFullYear(1970);
		date.setMonth(0);
		date.setDate(1);
		date.setHours(calendar.hour);
		date.setMinutes(calendar.minute);
		date.setSeconds(calendar.second);
		if (Jsonix.Util.Type.isNumber(calendar.fractionalSecond)) {
			date.setMilliseconds(Math.floor(1000 * calendar.fractionalSecond));
		}
		var timezoneOffset;
		var unknownTimezone;
		var localTimezoneOffset = date.getTimezoneOffset();
		if (Jsonix.Util.NumberUtils.isInteger(calendar.timezone))
		{
			timezoneOffset = calendar.timezone;
			unknownTimezone = false;
		}
		else
		{
			// Unknown timezone
			timezoneOffset = localTimezoneOffset;
			unknownTimezone = true;
		}
		//
		var result = new Date(date.getTime() + (60000 * (timezoneOffset - localTimezoneOffset)));
		if (unknownTimezone)
		{
			// null denotes "unknown timezone"
			result.originalTimezoneOffset = null;
		}
		else
		{
			result.originalTimezoneOffset = timezoneOffset;
		}
		return result;
	},
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureDate(value);
		var time = value.getTime();
		if (time <= -86400000 && time >= 86400000) {
			throw new Error('Invalid time [' + value + '].');
		}
		// Original timezone was unknown, just use current time, no timezone
		if (value.originalTimezoneOffset === null)
		{
			return this.printTime(new Jsonix.XML.Calendar({
				hour : value.getHours(),
				minute : value.getMinutes(),
				second : value.getSeconds(),
				fractionalSecond : (value.getMilliseconds() / 1000)
			}));
		}
		else
		{
			var correctedValue;
			var timezoneOffset;
			var localTimezoneOffset = value.getTimezoneOffset();
			if (Jsonix.Util.NumberUtils.isInteger(value.originalTimezoneOffset))
			{
				timezoneOffset = value.originalTimezoneOffset;
				correctedValue = new Date(value.getTime() - (60000 * (timezoneOffset - localTimezoneOffset)));
			}
			else
			{
				timezoneOffset = localTimezoneOffset;
				correctedValue = value;
			}
			var correctedTime = correctedValue.getTime();
			if (correctedTime >= 0) {
				return this.printTime(new Jsonix.XML.Calendar({
					hour : correctedValue.getHours(),
					minute : correctedValue.getMinutes(),
					second : correctedValue.getSeconds(),
					fractionalSecond : (correctedValue.getMilliseconds() / 1000),
					timezone: timezoneOffset
				}));
			} else {
				var timezoneOffsetHours = Math.ceil(-correctedTime / 3600000);
				return this.printTime(new Jsonix.XML.Calendar({
					hour : (correctedValue.getHours() + timezoneOffsetHours + timezoneOffset / 60 ) % 24,
					minute : correctedValue.getMinutes(),
					second : correctedValue.getSeconds(),
					fractionalSecond : (correctedValue.getMilliseconds() / 1000),
					timezone : - timezoneOffsetHours * 60
				}));
			}
		}
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isDate(value) && value.getTime() > -86400000 && value.getTime() < 86400000;
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.Time'
});
Jsonix.Schema.XSD.Time.INSTANCE = new Jsonix.Schema.XSD.Time();
Jsonix.Schema.XSD.Time.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Time.INSTANCE);
Jsonix.Schema.XSD.Date = Jsonix.Class(Jsonix.Schema.XSD.Calendar, {
	name : 'Date',
	typeName : Jsonix.Schema.XSD.qname('date'),
	parse : function(value, context, input, scope) {
		var calendar = this.parseDate(value);
		var date = new Date();
		date.setFullYear(calendar.year);
		date.setMonth(calendar.month - 1);
		date.setDate(calendar.day);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		if (Jsonix.Util.Type.isNumber(calendar.fractionalSecond)) {
			date.setMilliseconds(Math.floor(1000 * calendar.fractionalSecond));
		}
		var timezoneOffset;
		var unknownTimezone;
		var localTimezoneOffset = date.getTimezoneOffset();
		if (Jsonix.Util.NumberUtils.isInteger(calendar.timezone))
		{
			timezoneOffset = calendar.timezone;
			unknownTimezone = false;
		}
		else
		{
			// Unknown timezone
			timezoneOffset = localTimezoneOffset;
			unknownTimezone = true;
		}
		//
		var result = new Date(date.getTime() + (60000 * (timezoneOffset - localTimezoneOffset)));
		if (unknownTimezone)
		{
			// null denotes "unknown timezone"
			result.originalTimezoneOffset = null;
		}
		else
		{
			result.originalTimezoneOffset = timezoneOffset;
		}
		return result;
	},
	print : function(value, context, output, scope) {
		Jsonix.Util.Ensure.ensureDate(value);
		var localDate = new Date(value.getTime());
		localDate.setHours(0);
		localDate.setMinutes(0);
		localDate.setSeconds(0);
		localDate.setMilliseconds(0);
		
		// Original timezone is unknown
		if (value.originalTimezoneOffset === null)
		{
			return this.printDate(new Jsonix.XML.Calendar({
				year : value.getFullYear(),
				month : value.getMonth() + 1,
				day : value.getDate()
			}));
		}
		else
		{
			// If original timezone was known, correct and print the value with the timezone
			if (Jsonix.Util.NumberUtils.isInteger(value.originalTimezoneOffset))
			{
				var correctedValue = new Date(value.getTime() - (60000 * (value.originalTimezoneOffset - value.getTimezoneOffset())));
				return this.printDate(new Jsonix.XML.Calendar({
					year : correctedValue.getFullYear(),
					month : correctedValue.getMonth() + 1,
					day : correctedValue.getDate(),
					timezone : value.originalTimezoneOffset
				}));
			}
			// If original timezone was not specified, do not correct and use the local time zone
			else
			{
				// We assume that the difference between the date value and local midnight
				// should be interpreted as a timezone offset.
				// In case there's no difference, we assume default/unknown timezone
				var localTimezoneOffset = value.getTime() - localDate.getTime();
				if (localTimezoneOffset === 0) {
					return this.printDate(new Jsonix.XML.Calendar({
						year : value.getFullYear(),
						month : value.getMonth() + 1,
						day : value.getDate()
					}));
				} else {
					var timezoneOffset = localTimezoneOffset + (60000 * value.getTimezoneOffset());
					if (timezoneOffset <= 43200000) {
						return this.printDate(new Jsonix.XML.Calendar({
							year : value.getFullYear(),
							month : value.getMonth() + 1,
							day : value.getDate(),
							timezone : Math.floor(timezoneOffset / 60000)
						}));
					} else {
						var nextDay = new Date(value.getTime() + 86400000);
						return this.printDate(new Jsonix.XML.Calendar({
							year : nextDay.getFullYear(),
							month : nextDay.getMonth() + 1,
							day : nextDay.getDate(),
							timezone : (Math.floor(timezoneOffset / 60000) - 1440)
						}));
					}
				}
			}
		}
	},
	isInstance : function(value, context, scope) {
		return Jsonix.Util.Type.isDate(value);
	},
	CLASS_NAME : 'Jsonix.Schema.XSD.Date'
});
Jsonix.Schema.XSD.Date.INSTANCE = new Jsonix.Schema.XSD.Date();
Jsonix.Schema.XSD.Date.INSTANCE.LIST = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Date.INSTANCE);
Jsonix.Schema.XSD.GYearMonth = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'GYearMonth',
	typeName : Jsonix.Schema.XSD.qname('gYearMonth'),
	CLASS_NAME : 'Jsonix.Schema.XSD.GYearMonth'
});
Jsonix.Schema.XSD.GYearMonth.INSTANCE = new Jsonix.Schema.XSD.GYearMonth();
Jsonix.Schema.XSD.GYearMonth.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.GYearMonth.INSTANCE);
Jsonix.Schema.XSD.GYear = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'GYear',
	typeName : Jsonix.Schema.XSD.qname('gYear'),
	CLASS_NAME : 'Jsonix.Schema.XSD.GYear'
});
Jsonix.Schema.XSD.GYear.INSTANCE = new Jsonix.Schema.XSD.GYear();
Jsonix.Schema.XSD.GYear.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.GYear.INSTANCE);
Jsonix.Schema.XSD.GMonthDay = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'GMonthDay',
	typeName : Jsonix.Schema.XSD.qname('gMonthDay'),
	CLASS_NAME : 'Jsonix.Schema.XSD.GMonthDay'
});
Jsonix.Schema.XSD.GMonthDay.INSTANCE = new Jsonix.Schema.XSD.GMonthDay();
Jsonix.Schema.XSD.GMonthDay.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.GMonthDay.INSTANCE);
Jsonix.Schema.XSD.GDay = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'GDay',
	typeName : Jsonix.Schema.XSD.qname('gDay'),
	CLASS_NAME : 'Jsonix.Schema.XSD.GDay'
});
Jsonix.Schema.XSD.GDay.INSTANCE = new Jsonix.Schema.XSD.GDay();
Jsonix.Schema.XSD.GDay.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.GDay.INSTANCE);
Jsonix.Schema.XSD.GMonth = Jsonix.Class(Jsonix.Schema.XSD.AnySimpleType, {
	name : 'GMonth',
	typeName : Jsonix.Schema.XSD.qname('gMonth'),
	CLASS_NAME : 'Jsonix.Schema.XSD.GMonth'
});
Jsonix.Schema.XSD.GMonth.INSTANCE = new Jsonix.Schema.XSD.GMonth();
Jsonix.Schema.XSD.GMonth.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.GMonth.INSTANCE);
Jsonix.Schema.XSD.ID = Jsonix.Class(Jsonix.Schema.XSD.String, {
	name : 'ID',
	typeName : Jsonix.Schema.XSD.qname('ID'),
	CLASS_NAME : 'Jsonix.Schema.XSD.ID'
});
Jsonix.Schema.XSD.ID.INSTANCE = new Jsonix.Schema.XSD.ID();
Jsonix.Schema.XSD.ID.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.ID.INSTANCE);
Jsonix.Schema.XSD.IDREF = Jsonix.Class(Jsonix.Schema.XSD.String, {
	name : 'IDREF',
	typeName : Jsonix.Schema.XSD.qname('IDREF'),
	CLASS_NAME : 'Jsonix.Schema.XSD.IDREF'
});
Jsonix.Schema.XSD.IDREF.INSTANCE = new Jsonix.Schema.XSD.IDREF();
Jsonix.Schema.XSD.IDREF.INSTANCE.LIST = new Jsonix.Schema.XSD.List(
		Jsonix.Schema.XSD.IDREF.INSTANCE);
Jsonix.Schema.XSD.IDREFS = Jsonix.Class(Jsonix.Schema.XSD.List, {
	name : 'IDREFS',
	initialize : function() {
		Jsonix.Schema.XSD.List.prototype.initialize.apply(this, [ Jsonix.Schema.XSD.IDREF.INSTANCE, Jsonix.Schema.XSD.qname('IDREFS'), ' ' ]);
	},
	// TODO Constraints
	CLASS_NAME : 'Jsonix.Schema.XSD.IDREFS'
});
Jsonix.Schema.XSD.IDREFS.INSTANCE = new Jsonix.Schema.XSD.IDREFS();
Jsonix.Context = Jsonix
		.Class({
			modules : [],
			typeInfos : null,
			elementInfos : null,
			properties : null,
			substitutionMembersMap : null,
			scopedElementInfosMap : null,
			initialize : function(mappings, properties) {
				this.modules = [];
				this.elementInfos = [];
				this.typeInfos = {};
				this.registerBuiltinTypeInfos();
				this.properties = {
					namespacePrefixes : {}
				};
				this.substitutionMembersMap = {};
				this.scopedElementInfosMap = {};


				// Initialize properties
				if (Jsonix.Util.Type.exists(properties)) {
					Jsonix.Util.Ensure.ensureObject(properties);
					if (Jsonix.Util.Type
							.isObject(properties.namespacePrefixes)) {
						this.properties.namespacePrefixes = 
							Jsonix.Util.Type.cloneObject(properties.namespacePrefixes, {});
					}
				}
				// Initialize modules
				if (Jsonix.Util.Type.exists(mappings)) {
					Jsonix.Util.Ensure.ensureArray(mappings);
					// Initialize modules
					var index, mapping, module;
					for (index = 0; index < mappings.length; index++) {
						mapping = mappings[index];
						module = this.createModule(mapping);
						this.modules[index] = module;
					}
				}
				this.processModules();
			},
			createModule : function(mapping) {
				var module;
				if (mapping instanceof Jsonix.Model.Module) {
					module = mapping;
				} else {
					module = new Jsonix.Model.Module(mapping);
				}
				return module;
			},
			registerBuiltinTypeInfos : function() {
				for ( var index = 0; index < this.builtinTypeInfos.length; index++) {
					this.registerTypeInfo(this.builtinTypeInfos[index]);
				}
			},
			processModules : function() {
				var index, module;
				for (index = 0; index < this.modules.length; index++) {
					module = this.modules[index];
					module.registerTypeInfos(this);
				}
				for (index = 0; index < this.modules.length; index++) {
					module = this.modules[index];
					module.buildTypeInfos(this);
				}
				for (index = 0; index < this.modules.length; index++) {
					module = this.modules[index];
					module.registerElementInfos(this);
				}
				for (index = 0; index < this.modules.length; index++) {
					module = this.modules[index];
					module.buildElementInfos(this);
				}
			},
			registerTypeInfo : function(typeInfo) {
				Jsonix.Util.Ensure.ensureObject(typeInfo);
				var n = typeInfo.name||typeInfo.n||null;
				Jsonix.Util.Ensure.ensureString(n);
				this.typeInfos[n] = typeInfo;
			},
			resolveTypeInfo : function(mapping, module) {
				if (!Jsonix.Util.Type.exists(mapping)) {
					return null;
				} else if (mapping instanceof Jsonix.Model.TypeInfo) {
					return mapping;
				} else if (Jsonix.Util.Type.isString(mapping)) {
					var typeInfoName;
					// If mapping starts with '.' consider it to be a local type name in this module
					if (mapping.length > 0 && mapping.charAt(0) === '.')
					{
						var n = module.name || module.n || undefined;
						Jsonix.Util.Ensure.ensureObject(module, 'Type info mapping can only be resolved if module is provided.');
						Jsonix.Util.Ensure.ensureString(n, 'Type info mapping can only be resolved if module name is provided.');
						typeInfoName = n + mapping;
					}
					else
					{
						typeInfoName = mapping;
					}
					if (!this.typeInfos[typeInfoName]) {
						throw new Error('Type info [' + typeInfoName + '] is not known in this context.');
					} else {
						return this.typeInfos[typeInfoName];
					}
				} else {
					Jsonix.Util.Ensure.ensureObject(module, 'Type info mapping can only be resolved if module is provided.');
					var typeInfo = module.createTypeInfo(mapping);
					typeInfo.build(this, module);
					return typeInfo;
				}
			},
			registerElementInfo : function(elementInfo, module) {
				Jsonix.Util.Ensure.ensureObject(elementInfo);
				this.elementInfos.push(elementInfo);

				if (Jsonix.Util.Type.exists(elementInfo.substitutionHead)) {
					var substitutionHead = elementInfo.substitutionHead;
					var substitutionHeadKey = substitutionHead.key;
					var substitutionMembers = this.substitutionMembersMap[substitutionHeadKey];

					if (!Jsonix.Util.Type.isArray(substitutionMembers)) {
						substitutionMembers = [];
						this.substitutionMembersMap[substitutionHeadKey] = substitutionMembers;
					}
					substitutionMembers.push(elementInfo);
				}

				var scopeKey;
				if (Jsonix.Util.Type.exists(elementInfo.scope)) {
					scopeKey = this.resolveTypeInfo(elementInfo.scope, module).name;
				} else {
					scopeKey = '##global';
				}

				var scopedElementInfos = this.scopedElementInfosMap[scopeKey];

				if (!Jsonix.Util.Type.isObject(scopedElementInfos)) {
					scopedElementInfos = {};
					this.scopedElementInfosMap[scopeKey] = scopedElementInfos;
				}
				scopedElementInfos[elementInfo.elementName.key] = elementInfo;

			},
			getElementInfo : function(name, scope) {
				if (Jsonix.Util.Type.exists(scope)) {
					var scopeKey = scope.name;
					var scopedElementInfos = this.scopedElementInfosMap[scopeKey];
					if (Jsonix.Util.Type.exists(scopedElementInfos)) {
						var scopedElementInfo = scopedElementInfos[name.key];
						if (Jsonix.Util.Type.exists(scopedElementInfo)) {
							return scopedElementInfo;
						}
					}
				}

				var globalScopeKey = '##global';
				var globalScopedElementInfos = this.scopedElementInfosMap[globalScopeKey];
				if (Jsonix.Util.Type.exists(globalScopedElementInfos)) {
					var globalScopedElementInfo = globalScopedElementInfos[name.key];
					if (Jsonix.Util.Type.exists(globalScopedElementInfo)) {
						return globalScopedElementInfo;
					}
				}
				return null;
				//
				// throw new Error("Element [" + name.key
				// + "] could not be found in the given context.");
			},
			getSubstitutionMembers : function(name) {
				return this.substitutionMembersMap[Jsonix.XML.QName
						.fromObject(name).key];
			},
			createMarshaller : function() {
				return new Jsonix.Context.Marshaller(this);
			},
			createUnmarshaller : function() {
				return new Jsonix.Context.Unmarshaller(this);
			},
			getNamespaceURI : function(prefix) {
				Jsonix.Util.Ensure.ensureString(prefix);
				return this.properties.namespacePrefixes[prefix];
			},
			/**
			 * Builtin type infos.
			 */
			builtinTypeInfos : [
			        Jsonix.Schema.XSD.AnyType.INSTANCE,
					Jsonix.Schema.XSD.AnyURI.INSTANCE,
					Jsonix.Schema.XSD.Base64Binary.INSTANCE,
					Jsonix.Schema.XSD.Boolean.INSTANCE,
					Jsonix.Schema.XSD.Byte.INSTANCE,
					Jsonix.Schema.XSD.Calendar.INSTANCE,
					Jsonix.Schema.XSD.Date.INSTANCE,
					Jsonix.Schema.XSD.DateTime.INSTANCE,
					Jsonix.Schema.XSD.Decimal.INSTANCE,
					Jsonix.Schema.XSD.Double.INSTANCE,
					Jsonix.Schema.XSD.Duration.INSTANCE,
					Jsonix.Schema.XSD.Float.INSTANCE,
					Jsonix.Schema.XSD.GDay.INSTANCE,
					Jsonix.Schema.XSD.GMonth.INSTANCE,
					Jsonix.Schema.XSD.GMonthDay.INSTANCE,
					Jsonix.Schema.XSD.GYear.INSTANCE,
					Jsonix.Schema.XSD.GYearMonth.INSTANCE,
					Jsonix.Schema.XSD.HexBinary.INSTANCE,
					Jsonix.Schema.XSD.ID.INSTANCE,
					Jsonix.Schema.XSD.IDREF.INSTANCE,
					Jsonix.Schema.XSD.IDREFS.INSTANCE,
					Jsonix.Schema.XSD.Int.INSTANCE,
					Jsonix.Schema.XSD.Integer.INSTANCE,
					Jsonix.Schema.XSD.Language.INSTANCE,
					Jsonix.Schema.XSD.Long.INSTANCE,
					Jsonix.Schema.XSD.Name.INSTANCE,
					Jsonix.Schema.XSD.NCName.INSTANCE,
					Jsonix.Schema.XSD.NegativeInteger.INSTANCE,
					Jsonix.Schema.XSD.NMToken.INSTANCE,
					Jsonix.Schema.XSD.NMTokens.INSTANCE,
					Jsonix.Schema.XSD.NonNegativeInteger.INSTANCE,
					Jsonix.Schema.XSD.NonPositiveInteger.INSTANCE,
					Jsonix.Schema.XSD.NormalizedString.INSTANCE,
					Jsonix.Schema.XSD.Number.INSTANCE,
					Jsonix.Schema.XSD.PositiveInteger.INSTANCE,
					Jsonix.Schema.XSD.QName.INSTANCE,
					Jsonix.Schema.XSD.Short.INSTANCE,
					Jsonix.Schema.XSD.String.INSTANCE,
					Jsonix.Schema.XSD.Strings.INSTANCE,
					Jsonix.Schema.XSD.Time.INSTANCE,
					Jsonix.Schema.XSD.Token.INSTANCE,
					Jsonix.Schema.XSD.UnsignedByte.INSTANCE,
					Jsonix.Schema.XSD.UnsignedInt.INSTANCE,
					Jsonix.Schema.XSD.UnsignedLong.INSTANCE,
					Jsonix.Schema.XSD.UnsignedShort.INSTANCE ],
			CLASS_NAME : 'Jsonix.Context'
		});
Jsonix.Context.Marshaller = Jsonix.Class({
	context : null,
	initialize : function(context) {
		Jsonix.Util.Ensure.ensureObject(context);
		this.context = context;
	},
	marshalString : function(value) {
		var doc = this.marshalDocument(value);
		var text = Jsonix.DOM.serialize(doc);
		return text;
	},
	marshalDocument : function(value) {
		var output = new Jsonix.XML.Output({
			namespacePrefixes : this.context.properties.namespacePrefixes
		});

		var doc = output.writeStartDocument();

		this.marshalElementNode(value, output);

		output.writeEndDocument();

		return doc;

	},
	marshalElementNode : function(value, output, scope) {

		Jsonix.Util.Ensure.ensureObject(value);
		Jsonix.Util.Ensure.ensureObject(value.name);
		Jsonix.Util.Ensure.ensureExists(value.value);

		var name = Jsonix.XML.QName.fromObject(value.name);

		var elementDeclaration = this.context.getElementInfo(name, scope);
		if (!Jsonix.Util.Type.exists(elementDeclaration)) {
			throw new Error("Could not find element declaration for the element [" + name.key + "].");
		}
		Jsonix.Util.Ensure.ensureObject(elementDeclaration.typeInfo);
		var typeInfo = elementDeclaration.typeInfo;
		var element = output.writeStartElement(value.name);
		var adapter = Jsonix.Model.Adapter.getAdapter(elementDeclaration);
		adapter.marshal(typeInfo, value.value, this.context, output, scope);
		output.writeEndElement();
		return element;

	},
	CLASS_NAME : 'Jsonix.Context.Marshaller'
});
Jsonix.Context.Unmarshaller = Jsonix.Class({
	context : null,
	initialize : function(context) {
		Jsonix.Util.Ensure.ensureObject(context);
		this.context = context;
	},
	unmarshalString : function(text) {
		Jsonix.Util.Ensure.ensureString(text);
		var doc = Jsonix.DOM.parse(text);
		return this.unmarshalDocument(doc);
	},
	unmarshalURL : function(url, callback, options) {
		Jsonix.Util.Ensure.ensureString(url);
		Jsonix.Util.Ensure.ensureFunction(callback);
		if (Jsonix.Util.Type.exists(options)) {
			Jsonix.Util.Ensure.ensureObject(options);
		}
		that = this;
		Jsonix.DOM.load(url, function(doc) {
			callback(that.unmarshalDocument(doc));
		}, options);
	},
	unmarshalFile : function(fileName, callback, options) {
		if (typeof _jsonix_fs === 'undefined')
		{
			throw new Error("File unmarshalling is only available in environments which support file systems.");
		}
		Jsonix.Util.Ensure.ensureString(fileName);
		Jsonix.Util.Ensure.ensureFunction(callback);
		if (Jsonix.Util.Type.exists(options)) {
			Jsonix.Util.Ensure.ensureObject(options);
		}
		that = this;
		var fs =_jsonix_fs;
		fs.readFile(fileName, options, function(err, data) {
			if (err)
			{
				throw err;
			}
			else
			{
				var text = data.toString();
				var doc = Jsonix.DOM.parse(text);
				callback(that.unmarshalDocument(doc));
			}
		});
	},
	unmarshalDocument : function(doc) {
		var input = new Jsonix.XML.Input(doc);

		var result = null;
		input.nextTag();
		return this.unmarshalElementNode(input);

	},
	unmarshalElementNode : function(input, scope) {
		if (input.eventType != 1) {
			throw new Error("Parser must be on START_ELEMENT to read next text.");
		}

		var result = null;
		var name = Jsonix.XML.QName.fromObject(input.getName());

		var elementDeclaration = this.context.getElementInfo(name, scope);
		if (!Jsonix.Util.Type.exists(elementDeclaration)) {
			throw new Error("Could not find element declaration for the element [" + name.key + "].");
		}
		Jsonix.Util.Ensure.ensureObject(elementDeclaration.typeInfo);
		var typeInfo = elementDeclaration.typeInfo;
		var adapter = Jsonix.Model.Adapter.getAdapter(elementDeclaration);
		var value = adapter.unmarshal(typeInfo, this.context, input, scope);
		result = {
			name : name,
			value : value
		};

		return result;

	},
	CLASS_NAME : 'Jsonix.Context.Unmarshaller'
});
	// Complete Jsonix script is included above
	return { Jsonix: Jsonix };
};

// If the require function exists ...
if (typeof require === 'function') {
	// ... but the define function does not exists
	if (typeof define !== 'function') {
		// Load the define function via amdefine
		var define = require('amdefine')(module);
		// If we're not in browser
		if (typeof window === 'undefined')
		{
			// Require xmldom, xmlhttprequest and fs
			define(["xmldom", "xmlhttprequest", "fs"], _jsonix_factory);
		}
		else
		{
			// We're probably in browser, maybe browserify
			// Do not require xmldom, xmlhttprequest as they'r provided by the browser
			// Do not require fs since file system is not available anyway
			define([], _jsonix_factory);
		}
	}
	else {
		// Otherwise assume we're in the browser/RequireJS environment
		// Load the module without xmldom and xmlhttprequests dependencies
		define([], _jsonix_factory);
	}
}
// If the require function does not exists, we're not in Node.js and therefore in browser environment
else
{
	// Just call the factory and set Jsonix as global.
	var Jsonix = _jsonix_factory().Jsonix;
}

},{"amdefine":17}],3:[function(require,module,exports){
var Filter_1_0_0_Module_Factory = function () {
  var Filter_1_0_0 = {
    n: 'Filter_1_0_0',
    dens: 'http:\/\/www.opengis.net\/ogc',
    deps: ['GML_2_1_2'],
    tis: [{
        ln: 'LowerBoundaryType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'BinaryOperatorType',
        bti: '.ExpressionType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'SortPropertyType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'sortOrder',
            en: 'SortOrder'
          }]
      }, {
        ln: 'PropertyNameType',
        bti: '.ExpressionType',
        ps: [{
            n: 'content',
            t: 'v'
          }]
      }, {
        ln: 'DistanceBufferType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'geometry',
            mx: false,
            dom: false,
            en: {
              lp: '_Geometry',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_2_1_2.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'distance',
            en: 'Distance',
            ti: '.DistanceType'
          }]
      }, {
        ln: 'ComparisonOpsType'
      }, {
        ln: 'LiteralType',
        bti: '.ExpressionType',
        ps: [{
            n: 'content',
            col: true,
            dom: false,
            t: 'ae'
          }]
      }, {
        ln: 'FilterType',
        ps: [{
            n: 'spatialOps',
            mx: false,
            dom: false,
            ti: '.SpatialOpsType',
            t: 'er'
          }, {
            n: 'comparisonOps',
            mx: false,
            dom: false,
            ti: '.ComparisonOpsType',
            t: 'er'
          }, {
            n: 'logicOps',
            mx: false,
            dom: false,
            ti: '.LogicOpsType',
            t: 'er'
          }, {
            n: 'featureId',
            col: true,
            en: 'FeatureId',
            ti: '.FeatureIdType'
          }]
      }, {
        ln: 'BBOXType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'box',
            en: {
              lp: 'Box',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_2_1_2.BoxType'
          }]
      }, {
        ln: 'BinaryLogicOpType',
        bti: '.LogicOpsType',
        ps: [{
            n: 'ops',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'comparisonOps',
                ti: '.ComparisonOpsType'
              }, {
                en: 'spatialOps',
                ti: '.SpatialOpsType'
              }, {
                en: 'logicOps',
                ti: '.LogicOpsType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'BinarySpatialOpType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'geometry',
            mx: false,
            dom: false,
            en: {
              lp: '_Geometry',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_2_1_2.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'box',
            en: {
              lp: 'Box',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_2_1_2.BoxType'
          }]
      }, {
        ln: 'FeatureIdType',
        ps: [{
            n: 'fid',
            an: {
              lp: 'fid'
            },
            t: 'a'
          }]
      }, {
        ln: 'UpperBoundaryType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'PropertyIsNullType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'literal',
            en: 'Literal',
            ti: '.LiteralType'
          }]
      }, {
        ln: 'SortByType',
        ps: [{
            n: 'sortProperty',
            col: true,
            en: 'SortProperty',
            ti: '.SortPropertyType'
          }]
      }, {
        ln: 'PropertyIsLikeType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'literal',
            en: 'Literal',
            ti: '.LiteralType'
          }, {
            n: 'wildCard',
            an: {
              lp: 'wildCard'
            },
            t: 'a'
          }, {
            n: 'singleChar',
            an: {
              lp: 'singleChar'
            },
            t: 'a'
          }, {
            n: 'escape',
            an: {
              lp: 'escape'
            },
            t: 'a'
          }]
      }, {
        ln: 'SpatialOpsType'
      }, {
        ln: 'ExpressionType'
      }, {
        ln: 'BinaryComparisonOpType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'UnaryLogicOpType',
        bti: '.LogicOpsType',
        ps: [{
            n: 'comparisonOps',
            mx: false,
            dom: false,
            ti: '.ComparisonOpsType',
            t: 'er'
          }, {
            n: 'spatialOps',
            mx: false,
            dom: false,
            ti: '.SpatialOpsType',
            t: 'er'
          }, {
            n: 'logicOps',
            mx: false,
            dom: false,
            ti: '.LogicOpsType',
            t: 'er'
          }]
      }, {
        ln: 'LogicOpsType'
      }, {
        ln: 'PropertyIsBetweenType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }, {
            n: 'lowerBoundary',
            en: 'LowerBoundary',
            ti: '.LowerBoundaryType'
          }, {
            n: 'upperBoundary',
            en: 'UpperBoundary',
            ti: '.UpperBoundaryType'
          }]
      }, {
        ln: 'FunctionType',
        bti: '.ExpressionType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'DistanceType',
        ps: [{
            n: 'content',
            t: 'v'
          }, {
            n: 'units',
            an: {
              lp: 'units'
            },
            t: 'a'
          }]
      }, {
        t: 'enum',
        ln: 'SortOrderType',
        vs: ['DESC', 'ASC']
      }],
    eis: [{
        en: 'Add',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'PropertyIsGreaterThanOrEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Crosses',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'Beyond',
        ti: '.DistanceBufferType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Touches',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'Div',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'BBOX',
        ti: '.BBOXType',
        sh: 'spatialOps'
      }, {
        en: 'comparisonOps',
        ti: '.ComparisonOpsType'
      }, {
        en: 'PropertyIsNull',
        ti: '.PropertyIsNullType',
        sh: 'comparisonOps'
      }, {
        en: 'PropertyName',
        ti: '.PropertyNameType',
        sh: 'expression'
      }, {
        en: 'And',
        ti: '.BinaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'Function',
        ti: '.FunctionType',
        sh: 'expression'
      }, {
        en: 'PropertyIsBetween',
        ti: '.PropertyIsBetweenType',
        sh: 'comparisonOps'
      }, {
        en: 'Literal',
        ti: '.LiteralType',
        sh: 'expression'
      }, {
        en: 'Overlaps',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsGreaterThan',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'SortBy',
        ti: '.SortByType'
      }, {
        en: 'Sub',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'Within',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'expression',
        ti: '.ExpressionType'
      }, {
        en: 'DWithin',
        ti: '.DistanceBufferType',
        sh: 'spatialOps'
      }, {
        en: 'Or',
        ti: '.BinaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'Filter',
        ti: '.FilterType'
      }, {
        en: 'PropertyIsLike',
        ti: '.PropertyIsLikeType',
        sh: 'comparisonOps'
      }, {
        en: 'PropertyIsLessThan',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Contains',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'FeatureId',
        ti: '.FeatureIdType'
      }, {
        en: 'logicOps',
        ti: '.LogicOpsType'
      }, {
        en: 'Intersects',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsLessThanOrEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Equals',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsNotEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'spatialOps',
        ti: '.SpatialOpsType'
      }, {
        en: 'Mul',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'Not',
        ti: '.UnaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'Disjoint',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }]
  };
  return {
    Filter_1_0_0: Filter_1_0_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], Filter_1_0_0_Module_Factory);
}
else {
  var Filter_1_0_0_Module = Filter_1_0_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Filter_1_0_0 = Filter_1_0_0_Module.Filter_1_0_0;
  }
  else {
    var Filter_1_0_0 = Filter_1_0_0_Module.Filter_1_0_0;
  }
}
},{}],4:[function(require,module,exports){
var Filter_1_1_0_Module_Factory = function () {
  var Filter_1_1_0 = {
    n: 'Filter_1_1_0',
    dens: 'http:\/\/www.opengis.net\/ogc',
    deps: ['GML_3_1_1'],
    tis: [{
        ln: 'BinaryOperatorType',
        bti: '.ExpressionType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'FeatureIdType',
        bti: '.AbstractIdType',
        ps: [{
            n: 'fid',
            ti: 'ID',
            an: {
              lp: 'fid'
            },
            t: 'a'
          }]
      }, {
        ln: 'UpperBoundaryType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'ArithmeticOperatorsType',
        ps: [{
            n: 'ops',
            col: true,
            etis: [{
                en: 'SimpleArithmetic',
                ti: '.SimpleArithmetic'
              }, {
                en: 'Functions',
                ti: '.FunctionsType'
              }],
            t: 'es'
          }]
      }, {
        ln: 'DistanceBufferType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'geometry',
            mx: false,
            dom: false,
            en: {
              lp: '_Geometry',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_3_1_1.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'distance',
            en: 'Distance',
            ti: '.DistanceType'
          }]
      }, {
        ln: 'PropertyNameType',
        bti: '.ExpressionType',
        ps: [{
            n: 'content',
            t: 'v'
          }]
      }, {
        ln: 'FunctionsType',
        ps: [{
            n: 'functionNames',
            en: 'FunctionNames',
            ti: '.FunctionNamesType'
          }]
      }, {
        ln: 'DistanceType',
        ps: [{
            n: 'value',
            ti: 'Double',
            t: 'v'
          }, {
            n: 'units',
            an: {
              lp: 'units'
            },
            t: 'a'
          }]
      }, {
        ln: 'PropertyIsLikeType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'literal',
            en: 'Literal',
            ti: '.LiteralType'
          }, {
            n: 'wildCard',
            an: {
              lp: 'wildCard'
            },
            t: 'a'
          }, {
            n: 'singleChar',
            an: {
              lp: 'singleChar'
            },
            t: 'a'
          }, {
            n: 'escapeChar',
            an: {
              lp: 'escapeChar'
            },
            t: 'a'
          }, {
            n: 'matchCase',
            ti: 'Boolean',
            an: {
              lp: 'matchCase'
            },
            t: 'a'
          }]
      }, {
        ln: 'LiteralType',
        bti: '.ExpressionType',
        ps: [{
            n: 'content',
            col: true,
            dom: false,
            t: 'ae'
          }]
      }, {
        ln: 'FilterCapabilities',
        tn: null,
        ps: [{
            n: 'spatialCapabilities',
            en: 'Spatial_Capabilities',
            ti: '.SpatialCapabilitiesType'
          }, {
            n: 'scalarCapabilities',
            en: 'Scalar_Capabilities',
            ti: '.ScalarCapabilitiesType'
          }, {
            n: 'idCapabilities',
            en: 'Id_Capabilities',
            ti: '.IdCapabilitiesType'
          }]
      }, {
        ln: 'FunctionNameType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'nArgs',
            an: {
              lp: 'nArgs'
            },
            t: 'a'
          }]
      }, {
        ln: 'PropertyIsBetweenType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }, {
            n: 'lowerBoundary',
            en: 'LowerBoundary',
            ti: '.LowerBoundaryType'
          }, {
            n: 'upperBoundary',
            en: 'UpperBoundary',
            ti: '.UpperBoundaryType'
          }]
      }, {
        ln: 'FunctionType',
        bti: '.ExpressionType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'SpatialCapabilitiesType',
        tn: 'Spatial_CapabilitiesType',
        ps: [{
            n: 'geometryOperands',
            en: 'GeometryOperands',
            ti: '.GeometryOperandsType'
          }, {
            n: 'spatialOperators',
            en: 'SpatialOperators',
            ti: '.SpatialOperatorsType'
          }]
      }, {
        ln: 'FunctionNamesType',
        ps: [{
            n: 'functionName',
            col: true,
            en: 'FunctionName',
            ti: '.FunctionNameType'
          }]
      }, {
        ln: 'EID',
        tn: null
      }, {
        ln: 'UnaryLogicOpType',
        bti: '.LogicOpsType',
        ps: [{
            n: 'comparisonOps',
            mx: false,
            dom: false,
            ti: '.ComparisonOpsType',
            t: 'er'
          }, {
            n: 'spatialOps',
            mx: false,
            dom: false,
            ti: '.SpatialOpsType',
            t: 'er'
          }, {
            n: 'logicOps',
            mx: false,
            dom: false,
            ti: '.LogicOpsType',
            t: 'er'
          }, {
            n: 'function',
            en: 'Function',
            ti: '.FunctionType'
          }]
      }, {
        ln: 'LogicalOperators',
        tn: null
      }, {
        ln: 'PropertyIsNullType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }]
      }, {
        ln: 'SortByType',
        ps: [{
            n: 'sortProperty',
            col: true,
            en: 'SortProperty',
            ti: '.SortPropertyType'
          }]
      }, {
        ln: 'FID',
        tn: null
      }, {
        ln: 'IdCapabilitiesType',
        tn: 'Id_CapabilitiesType',
        ps: [{
            n: 'ids',
            col: true,
            etis: [{
                en: 'EID',
                ti: '.EID'
              }, {
                en: 'FID',
                ti: '.FID'
              }],
            t: 'es'
          }]
      }, {
        ln: 'SpatialOperatorsType',
        ps: [{
            n: 'spatialOperator',
            col: true,
            en: 'SpatialOperator',
            ti: '.SpatialOperatorType'
          }]
      }, {
        ln: 'SimpleArithmetic',
        tn: null
      }, {
        ln: 'ExpressionType'
      }, {
        ln: 'SpatialOperatorType',
        ps: [{
            n: 'geometryOperands',
            en: 'GeometryOperands',
            ti: '.GeometryOperandsType'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'BinaryLogicOpType',
        bti: '.LogicOpsType',
        ps: [{
            n: 'ops',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'spatialOps',
                ti: '.SpatialOpsType'
              }, {
                en: 'comparisonOps',
                ti: '.ComparisonOpsType'
              }, {
                en: 'logicOps',
                ti: '.LogicOpsType'
              }, {
                en: 'Function',
                ti: '.FunctionType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'SortPropertyType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'sortOrder',
            en: 'SortOrder'
          }]
      }, {
        ln: 'FilterType',
        ps: [{
            n: 'spatialOps',
            mx: false,
            dom: false,
            ti: '.SpatialOpsType',
            t: 'er'
          }, {
            n: 'comparisonOps',
            mx: false,
            dom: false,
            ti: '.ComparisonOpsType',
            t: 'er'
          }, {
            n: 'logicOps',
            mx: false,
            dom: false,
            ti: '.LogicOpsType',
            t: 'er'
          }, {
            n: 'id',
            col: true,
            mx: false,
            dom: false,
            en: '_Id',
            ti: '.AbstractIdType',
            t: 'er'
          }]
      }, {
        ln: 'ScalarCapabilitiesType',
        tn: 'Scalar_CapabilitiesType',
        ps: [{
            n: 'logicalOperators',
            en: 'LogicalOperators',
            ti: '.LogicalOperators'
          }, {
            n: 'comparisonOperators',
            en: 'ComparisonOperators',
            ti: '.ComparisonOperatorsType'
          }, {
            n: 'arithmeticOperators',
            en: 'ArithmeticOperators',
            ti: '.ArithmeticOperatorsType'
          }]
      }, {
        ln: 'SpatialOpsType'
      }, {
        ln: 'GmlObjectIdType',
        bti: '.AbstractIdType',
        ps: [{
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComparisonOpsType'
      }, {
        ln: 'BBOXType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'envelope',
            mx: false,
            dom: false,
            en: {
              lp: 'Envelope',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_3_1_1.EnvelopeType',
            t: 'er'
          }]
      }, {
        ln: 'BinarySpatialOpType',
        bti: '.SpatialOpsType',
        ps: [{
            n: 'propertyName1',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'propertyName2',
            en: 'PropertyName',
            ti: '.PropertyNameType'
          }, {
            n: 'geometry',
            mx: false,
            dom: false,
            en: {
              lp: '_Geometry',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_3_1_1.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'envelope',
            mx: false,
            dom: false,
            en: {
              lp: 'Envelope',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_3_1_1.EnvelopeType',
            t: 'er'
          }]
      }, {
        ln: 'GeometryOperandsType',
        ps: [{
            n: 'geometryOperand',
            col: true,
            en: 'GeometryOperand',
            ti: 'QName'
          }]
      }, {
        ln: 'LowerBoundaryType',
        ps: [{
            n: 'expression',
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'AbstractIdType'
      }, {
        ln: 'BinaryComparisonOpType',
        bti: '.ComparisonOpsType',
        ps: [{
            n: 'expression',
            col: true,
            mx: false,
            dom: false,
            ti: '.ExpressionType',
            t: 'er'
          }, {
            n: 'matchCase',
            ti: 'Boolean',
            an: {
              lp: 'matchCase'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComparisonOperatorsType',
        ps: [{
            n: 'comparisonOperator',
            col: true,
            en: 'ComparisonOperator'
          }]
      }, {
        ln: 'LogicOpsType'
      }, {
        t: 'enum',
        ln: 'ComparisonOperatorType',
        vs: ['LessThan', 'GreaterThan', 'LessThanEqualTo', 'GreaterThanEqualTo', 'EqualTo', 'NotEqualTo', 'Like', 'Between', 'NullCheck']
      }, {
        t: 'enum',
        ln: 'SortOrderType',
        vs: ['DESC', 'ASC']
      }, {
        t: 'enum',
        ln: 'SpatialOperatorNameType',
        vs: ['BBOX', 'Equals', 'Disjoint', 'Intersects', 'Touches', 'Crosses', 'Within', 'Contains', 'Overlaps', 'Beyond', 'DWithin']
      }],
    eis: [{
        en: 'Not',
        ti: '.UnaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'PropertyIsEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'comparisonOps',
        ti: '.ComparisonOpsType'
      }, {
        en: 'Touches',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'Div',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'Mul',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'Intersects',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'FID',
        ti: '.FID'
      }, {
        en: 'Crosses',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'Overlaps',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'logicOps',
        ti: '.LogicOpsType'
      }, {
        en: 'SortBy',
        ti: '.SortByType'
      }, {
        en: 'DWithin',
        ti: '.DistanceBufferType',
        sh: 'spatialOps'
      }, {
        en: 'Literal',
        ti: '.LiteralType',
        sh: 'expression'
      }, {
        en: 'spatialOps',
        ti: '.SpatialOpsType'
      }, {
        en: 'FeatureId',
        ti: '.FeatureIdType',
        sh: '_Id'
      }, {
        en: 'And',
        ti: '.BinaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'BBOX',
        ti: '.BBOXType',
        sh: 'spatialOps'
      }, {
        en: 'expression',
        ti: '.ExpressionType'
      }, {
        en: 'PropertyIsBetween',
        ti: '.PropertyIsBetweenType',
        sh: 'comparisonOps'
      }, {
        en: 'Filter_Capabilities',
        ti: '.FilterCapabilities'
      }, {
        en: 'PropertyIsNull',
        ti: '.PropertyIsNullType',
        sh: 'comparisonOps'
      }, {
        en: 'Disjoint',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'GmlObjectId',
        ti: '.GmlObjectIdType',
        sh: '_Id'
      }, {
        en: 'Equals',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: '_Id',
        ti: '.AbstractIdType'
      }, {
        en: 'PropertyName',
        ti: '.PropertyNameType',
        sh: 'expression'
      }, {
        en: 'Add',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'PropertyIsGreaterThanOrEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'SimpleArithmetic',
        ti: '.SimpleArithmetic'
      }, {
        en: 'Within',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'Filter',
        ti: '.FilterType'
      }, {
        en: 'EID',
        ti: '.EID'
      }, {
        en: 'PropertyIsLike',
        ti: '.PropertyIsLikeType',
        sh: 'comparisonOps'
      }, {
        en: 'Beyond',
        ti: '.DistanceBufferType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsLessThan',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Function',
        ti: '.FunctionType',
        sh: 'expression'
      }, {
        en: 'LogicalOperators',
        ti: '.LogicalOperators'
      }, {
        en: 'PropertyIsLessThanOrEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'Or',
        ti: '.BinaryLogicOpType',
        sh: 'logicOps'
      }, {
        en: 'Sub',
        ti: '.BinaryOperatorType',
        sh: 'expression'
      }, {
        en: 'Contains',
        ti: '.BinarySpatialOpType',
        sh: 'spatialOps'
      }, {
        en: 'PropertyIsGreaterThan',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }, {
        en: 'PropertyIsNotEqualTo',
        ti: '.BinaryComparisonOpType',
        sh: 'comparisonOps'
      }]
  };
  return {
    Filter_1_1_0: Filter_1_1_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], Filter_1_1_0_Module_Factory);
}
else {
  var Filter_1_1_0_Module = Filter_1_1_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Filter_1_1_0 = Filter_1_1_0_Module.Filter_1_1_0;
  }
  else {
    var Filter_1_1_0 = Filter_1_1_0_Module.Filter_1_1_0;
  }
}
},{}],5:[function(require,module,exports){
var GML_2_1_2_Module_Factory = function () {
  var GML_2_1_2 = {
    n: 'GML_2_1_2',
    dens: 'http:\/\/www.opengis.net\/gml',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    deps: ['XLink_1_0'],
    tis: [{
        ln: 'GeometryAssociationType',
        ps: [{
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometryCollectionType',
        bti: '.AbstractGeometryCollectionBaseType',
        ps: [{
            n: 'geometryMember',
            col: true,
            mx: false,
            dom: false,
            ti: '.GeometryAssociationType',
            t: 'er'
          }]
      }, {
        ln: 'MultiGeometryPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'MultiPolygonPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'AbstractFeatureCollectionBaseType',
        bti: '.AbstractFeatureType'
      }, {
        ln: 'MultiPointType',
        bti: '.GeometryCollectionType'
      }, {
        ln: 'LineStringMemberType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'LinearRingType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'coord',
            col: true,
            ti: '.CoordType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }]
      }, {
        ln: 'PointMemberType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'MultiLineStringType',
        bti: '.GeometryCollectionType'
      }, {
        ln: 'CoordType',
        ps: [{
            n: 'x',
            en: 'X',
            ti: 'Decimal'
          }, {
            n: 'y',
            en: 'Y',
            ti: 'Decimal'
          }, {
            n: 'z',
            en: 'Z',
            ti: 'Decimal'
          }]
      }, {
        ln: 'AbstractFeatureCollectionType',
        bti: '.AbstractFeatureCollectionBaseType',
        ps: [{
            n: 'featureMember',
            col: true,
            ti: '.FeatureAssociationType'
          }]
      }, {
        ln: 'LinearRingMemberType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'PointPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'AbstractGeometryType',
        ps: [{
            n: 'gid',
            ti: 'ID',
            an: {
              lp: 'gid'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }]
      }, {
        ln: 'BoxType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'coord',
            col: true,
            ti: '.CoordType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }]
      }, {
        ln: 'AbstractFeatureType',
        ps: [{
            n: 'description'
          }, {
            n: 'name'
          }, {
            n: 'boundedBy',
            ti: '.BoundingShapeType'
          }, {
            n: 'fid',
            ti: 'ID',
            an: {
              lp: 'fid'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiPolygonType',
        bti: '.GeometryCollectionType'
      }, {
        ln: 'FeatureAssociationType',
        ps: [{
            n: 'feature',
            mx: false,
            dom: false,
            en: '_Feature',
            ti: '.AbstractFeatureType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'LineStringType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'coord',
            col: true,
            ti: '.CoordType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }]
      }, {
        ln: 'BoundingShapeType',
        ps: [{
            n: 'box',
            en: 'Box',
            ti: '.BoxType'
          }, {
            n: '_null',
            en: 'null'
          }]
      }, {
        ln: 'MultiLineStringPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'PolygonMemberType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'LineStringPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'CoordinatesType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'decimal',
            an: {
              lp: 'decimal'
            },
            t: 'a'
          }, {
            n: 'cs',
            an: {
              lp: 'cs'
            },
            t: 'a'
          }, {
            n: 'ts',
            an: {
              lp: 'ts'
            },
            t: 'a'
          }]
      }, {
        ln: 'PolygonType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'outerBoundaryIs',
            ti: '.LinearRingMemberType'
          }, {
            n: 'innerBoundaryIs',
            col: true,
            ti: '.LinearRingMemberType'
          }]
      }, {
        ln: 'PolygonPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'GeometryPropertyType',
        ps: [{
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractGeometryCollectionBaseType',
        bti: '.AbstractGeometryType'
      }, {
        ln: 'MultiPointPropertyType',
        bti: '.GeometryAssociationType'
      }, {
        ln: 'PointType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'coord',
            ti: '.CoordType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }]
      }, {
        t: 'enum',
        ln: 'NullType',
        vs: ['inapplicable', 'unknown', 'unavailable', 'missing']
      }],
    eis: [{
        en: 'position',
        ti: '.PointPropertyType',
        sh: 'pointProperty'
      }, {
        en: 'outerBoundaryIs',
        ti: '.LinearRingMemberType'
      }, {
        en: 'coordinates',
        ti: '.CoordinatesType'
      }, {
        en: 'multiLocation',
        ti: '.MultiPointPropertyType',
        sh: 'multiPointProperty'
      }, {
        en: 'centerOf',
        ti: '.PointPropertyType',
        sh: 'pointProperty'
      }, {
        en: 'polygonMember',
        ti: '.PolygonMemberType',
        sh: 'geometryMember'
      }, {
        en: '_FeatureCollection',
        ti: '.AbstractFeatureCollectionType',
        sh: '_Feature'
      }, {
        en: 'multiGeometryProperty',
        ti: '.MultiGeometryPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'centerLineOf',
        ti: '.LineStringPropertyType',
        sh: 'lineStringProperty'
      }, {
        en: 'lineStringMember',
        ti: '.LineStringMemberType',
        sh: 'geometryMember'
      }, {
        en: 'Polygon',
        ti: '.PolygonType',
        sh: '_Geometry'
      }, {
        en: 'multiExtentOf',
        ti: '.MultiPolygonPropertyType',
        sh: 'multiPolygonProperty'
      }, {
        en: '_GeometryCollection',
        ti: '.GeometryCollectionType',
        sh: '_Geometry'
      }, {
        en: 'pointMember',
        ti: '.PointMemberType',
        sh: 'geometryMember'
      }, {
        en: 'multiCenterLineOf',
        ti: '.MultiLineStringPropertyType',
        sh: 'multiLineStringProperty'
      }, {
        en: 'multiPolygonProperty',
        ti: '.MultiPolygonPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'name'
      }, {
        en: 'multiPosition',
        ti: '.MultiPointPropertyType',
        sh: 'multiPointProperty'
      }, {
        en: 'lineStringProperty',
        ti: '.LineStringPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'geometryMember',
        ti: '.GeometryAssociationType'
      }, {
        en: 'MultiLineString',
        ti: '.MultiLineStringType',
        sh: '_Geometry'
      }, {
        en: 'MultiGeometry',
        ti: '.GeometryCollectionType',
        sh: '_Geometry'
      }, {
        en: '_Feature',
        ti: '.AbstractFeatureType'
      }, {
        en: 'location',
        ti: '.PointPropertyType',
        sh: 'pointProperty'
      }, {
        en: 'MultiPolygon',
        ti: '.MultiPolygonType',
        sh: '_Geometry'
      }, {
        en: 'MultiPoint',
        ti: '.MultiPointType',
        sh: '_Geometry'
      }, {
        en: 'multiCoverage',
        ti: '.MultiPolygonPropertyType',
        sh: 'multiPolygonProperty'
      }, {
        en: 'LinearRing',
        ti: '.LinearRingType',
        sh: '_Geometry'
      }, {
        en: 'description'
      }, {
        en: 'edgeOf',
        ti: '.LineStringPropertyType',
        sh: 'lineStringProperty'
      }, {
        en: 'multiLineStringProperty',
        ti: '.MultiLineStringPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'coverage',
        ti: '.PolygonPropertyType',
        sh: 'polygonProperty'
      }, {
        en: '_Geometry',
        ti: '.AbstractGeometryType'
      }, {
        en: 'multiCenterOf',
        ti: '.MultiPointPropertyType',
        sh: 'multiPointProperty'
      }, {
        en: 'featureMember',
        ti: '.FeatureAssociationType'
      }, {
        en: 'pointProperty',
        ti: '.PointPropertyType',
        sh: '_geometryProperty'
      }, {
        en: '_geometryProperty',
        ti: '.GeometryAssociationType'
      }, {
        en: 'LineString',
        ti: '.LineStringType',
        sh: '_Geometry'
      }, {
        en: 'boundedBy',
        ti: '.BoundingShapeType'
      }, {
        en: 'extentOf',
        ti: '.PolygonPropertyType',
        sh: 'polygonProperty'
      }, {
        en: 'multiEdgeOf',
        ti: '.MultiLineStringPropertyType',
        sh: 'multiLineStringProperty'
      }, {
        en: 'coord',
        ti: '.CoordType'
      }, {
        en: 'polygonProperty',
        ti: '.PolygonPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'geometryProperty',
        ti: '.GeometryAssociationType'
      }, {
        en: 'innerBoundaryIs',
        ti: '.LinearRingMemberType'
      }, {
        en: 'multiPointProperty',
        ti: '.MultiPointPropertyType',
        sh: '_geometryProperty'
      }, {
        en: 'Box',
        ti: '.BoxType'
      }, {
        en: 'Point',
        ti: '.PointType',
        sh: '_Geometry'
      }]
  };
  return {
    GML_2_1_2: GML_2_1_2
  };
};
if (typeof define === 'function' && define.amd) {
  define([], GML_2_1_2_Module_Factory);
}
else {
  var GML_2_1_2_Module = GML_2_1_2_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.GML_2_1_2 = GML_2_1_2_Module.GML_2_1_2;
  }
  else {
    var GML_2_1_2 = GML_2_1_2_Module.GML_2_1_2;
  }
}
},{}],6:[function(require,module,exports){
var GML_3_1_1_Module_Factory = function () {
  var GML_3_1_1 = {
    n: 'GML_3_1_1',
    dens: 'http:\/\/www.opengis.net\/gml',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    deps: ['XLink_1_0', 'SMIL_2_0_Language'],
    tis: [{
        ln: 'TopoVolumeType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'directedTopoSolid',
            col: true,
            ti: '.DirectedTopoSolidPropertyType'
          }]
      }, {
        ln: 'CubicSplineType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'vectorAtStart',
            ti: '.VectorType'
          }, {
            n: 'vectorAtEnd',
            ti: '.VectorType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }, {
            n: 'degree',
            ti: 'Integer',
            an: {
              lp: 'degree'
            },
            t: 'a'
          }]
      }, {
        ln: 'SphericalCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'OperationParameterGroupType',
        bti: '.OperationParameterGroupBaseType',
        ps: [{
            n: 'groupID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'maximumOccurs',
            ti: 'Integer'
          }, {
            n: 'includesParameter',
            col: true,
            ti: '.AbstractGeneralOperationParameterRefType'
          }]
      }, {
        ln: 'CompositeSolidPropertyType',
        ps: [{
            n: 'compositeSolid',
            en: 'CompositeSolid',
            ti: '.CompositeSolidType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'RingType',
        bti: '.AbstractRingType',
        ps: [{
            n: 'curveMember',
            col: true,
            ti: '.CurvePropertyType'
          }]
      }, {
        ln: 'AbstractTimeReferenceSystemType',
        bti: '.DefinitionType',
        ps: [{
            n: 'domainOfValidity'
          }]
      }, {
        ln: 'PassThroughOperationType',
        bti: '.AbstractCoordinateOperationType',
        ps: [{
            n: 'modifiedCoordinate',
            col: true,
            ti: 'Integer'
          }, {
            n: 'usesOperation',
            ti: '.OperationRefType'
          }]
      }, {
        ln: 'TopoCurvePropertyType',
        ps: [{
            n: 'topoCurve',
            en: 'TopoCurve',
            ti: '.TopoCurveType'
          }]
      }, {
        ln: 'MultiLineStringPropertyType',
        ps: [{
            n: 'multiLineString',
            en: 'MultiLineString',
            ti: '.MultiLineStringType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometricComplexType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'element',
            col: true,
            ti: '.GeometricPrimitivePropertyType'
          }]
      }, {
        ln: 'LineStringSegmentArrayPropertyType',
        ps: [{
            n: 'lineStringSegment',
            col: true,
            en: 'LineStringSegment',
            ti: '.LineStringSegmentType'
          }]
      }, {
        ln: 'TimeTopologyPrimitivePropertyType',
        ps: [{
            n: 'timeTopologyPrimitive',
            mx: false,
            dom: false,
            en: '_TimeTopologyPrimitive',
            ti: '.AbstractTimeTopologyPrimitiveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'EngineeringDatumRefType',
        ps: [{
            n: 'engineeringDatum',
            en: 'EngineeringDatum',
            ti: '.EngineeringDatumType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CoordinateSystemAxisRefType',
        ps: [{
            n: 'coordinateSystemAxis',
            en: 'CoordinateSystemAxis',
            ti: '.CoordinateSystemAxisType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometryStyleType',
        bti: '.BaseStyleDescriptorType',
        ps: [{
            n: 'symbol',
            ti: '.SymbolType'
          }, {
            n: 'style'
          }, {
            n: 'labelStyle',
            ti: '.LabelStylePropertyType'
          }, {
            n: 'geometryProperty',
            an: {
              lp: 'geometryProperty'
            },
            t: 'a'
          }, {
            n: 'geometryType',
            an: {
              lp: 'geometryType'
            },
            t: 'a'
          }]
      }, {
        ln: 'OrientableCurveType',
        bti: '.AbstractCurveType',
        ps: [{
            n: 'baseCurve',
            ti: '.CurvePropertyType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }]
      }, {
        ln: 'PolygonPropertyType',
        ps: [{
            n: 'polygon',
            en: 'Polygon',
            ti: '.PolygonType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeTopologyComplexType',
        bti: '.AbstractTimeComplexType',
        ps: [{
            n: 'primitive',
            col: true,
            ti: '.TimeTopologyPrimitivePropertyType'
          }]
      }, {
        ln: 'CovarianceMatrixType',
        bti: '.AbstractPositionalAccuracyType',
        ps: [{
            n: 'unitOfMeasure',
            col: true,
            ti: '.UnitOfMeasureType'
          }, {
            n: 'includesElement',
            col: true,
            ti: '.CovarianceElementType'
          }]
      }, {
        ln: 'TemporalCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesTemporalCS',
            ti: '.TemporalCSRefType'
          }, {
            n: 'usesTemporalDatum',
            ti: '.TemporalDatumRefType'
          }]
      }, {
        ln: 'LengthType',
        bti: '.MeasureType'
      }, {
        ln: 'MultiSurfaceDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'ArrayType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'members',
            ti: '.ArrayAssociationType'
          }]
      }, {
        ln: 'AbstractGeneralTransformationType',
        bti: '.AbstractCoordinateOperationType'
      }, {
        ln: 'EnvelopeWithTimePeriodType',
        bti: '.EnvelopeType',
        ps: [{
            n: 'timePosition',
            col: true,
            ti: '.TimePositionType'
          }, {
            n: 'frame',
            an: {
              lp: 'frame'
            },
            t: 'a'
          }]
      }, {
        ln: 'DerivationUnitTermType',
        bti: '.UnitOfMeasureType',
        ps: [{
            n: 'exponent',
            ti: 'Integer',
            an: {
              lp: 'exponent'
            },
            t: 'a'
          }]
      }, {
        ln: 'TimeOrdinalEraPropertyType',
        ps: [{
            n: 'timeOrdinalEra',
            en: 'TimeOrdinalEra',
            ti: '.TimeOrdinalEraType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'BaseUnitType',
        bti: '.UnitDefinitionType',
        ps: [{
            n: 'unitsSystem',
            ti: '.ReferenceType'
          }]
      }, {
        ln: 'EllipsoidalCSRefType',
        ps: [{
            n: 'ellipsoidalCS',
            en: 'EllipsoidalCS',
            ti: '.EllipsoidalCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'EllipsoidalCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'ExtentType',
        ps: [{
            n: 'description',
            ti: '.StringOrRefType'
          }, {
            n: 'boundingBox',
            col: true,
            ti: '.EnvelopeType'
          }, {
            n: 'boundingPolygon',
            col: true,
            ti: '.PolygonType'
          }, {
            n: 'verticalExtent',
            col: true,
            ti: '.EnvelopeType'
          }, {
            n: 'temporalExtent',
            col: true,
            ti: '.TimePeriodType'
          }]
      }, {
        ln: 'OperationMethodBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'DirectedObservationType',
        bti: '.ObservationType',
        ps: [{
            n: 'direction',
            ti: '.DirectionPropertyType'
          }]
      }, {
        ln: 'DirectedFacePropertyType',
        ps: [{
            n: 'face',
            en: 'Face',
            ti: '.FaceType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ConcatenatedOperationRefType',
        ps: [{
            n: 'concatenatedOperation',
            en: 'ConcatenatedOperation',
            ti: '.ConcatenatedOperationType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DefaultStylePropertyType',
        ps: [{
            n: 'style',
            mx: false,
            dom: false,
            en: '_Style',
            ti: '.AbstractStyleType',
            t: 'er'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'VerticalCSRefType',
        ps: [{
            n: 'verticalCS',
            en: 'VerticalCS',
            ti: '.VerticalCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractCurveType',
        bti: '.AbstractGeometricPrimitiveType'
      }, {
        ln: 'AbstractGeneralOperationParameterRefType',
        ps: [{
            n: 'generalOperationParameter',
            mx: false,
            dom: false,
            en: '_GeneralOperationParameter',
            ti: '.AbstractGeneralOperationParameterType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'FeaturePropertyType',
        ps: [{
            n: 'feature',
            mx: false,
            en: '_Feature',
            ti: '.AbstractFeatureType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ProjectedCRSType',
        bti: '.AbstractGeneralDerivedCRSType',
        ps: [{
            n: 'usesCartesianCS',
            ti: '.CartesianCSRefType'
          }]
      }, {
        ln: 'FeatureStylePropertyType',
        ps: [{
            n: 'featureStyle',
            en: 'FeatureStyle',
            ti: '.FeatureStyleType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TinType',
        bti: '.TriangulatedSurfaceType',
        ps: [{
            n: 'stopLines',
            col: true,
            ti: '.LineStringSegmentArrayPropertyType'
          }, {
            n: 'breakLines',
            col: true,
            ti: '.LineStringSegmentArrayPropertyType'
          }, {
            n: 'maxLength',
            ti: '.LengthType'
          }, {
            n: 'controlPoint',
            ti: '.TinType.ControlPoint'
          }]
      }, {
        ln: 'EngineeringDatumType',
        bti: '.AbstractDatumType'
      }, {
        ln: 'EnvelopeType',
        ps: [{
            n: 'lowerCorner',
            ti: '.DirectPositionType'
          }, {
            n: 'upperCorner',
            ti: '.DirectPositionType'
          }, {
            n: 'coord',
            col: true,
            ti: '.CoordType'
          }, {
            n: 'pos',
            col: true,
            ti: '.DirectPositionType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }, {
            n: 'srsDimension',
            ti: 'Integer',
            an: {
              lp: 'srsDimension'
            },
            t: 'a'
          }, {
            n: 'axisLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'axisLabels'
            },
            t: 'a'
          }, {
            n: 'uomLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'uomLabels'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiCurveDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'TimeCalendarType',
        bti: '.AbstractTimeReferenceSystemType',
        ps: [{
            n: 'referenceFrame',
            col: true,
            ti: '.TimeCalendarEraPropertyType'
          }]
      }, {
        ln: 'CircleType',
        bti: '.ArcType'
      }, {
        ln: 'GridLengthType',
        bti: '.MeasureType'
      }, {
        ln: 'DerivedCRSRefType',
        ps: [{
            n: 'derivedCRS',
            en: 'DerivedCRS',
            ti: '.DerivedCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TopoPointPropertyType',
        ps: [{
            n: 'topoPoint',
            en: 'TopoPoint',
            ti: '.TopoPointType'
          }]
      }, {
        ln: 'ReferenceSystemRefType',
        ps: [{
            n: 'referenceSystem',
            mx: false,
            dom: false,
            en: '_ReferenceSystem',
            ti: '.AbstractReferenceSystemType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'PolygonType',
        bti: '.AbstractSurfaceType',
        ps: [{
            n: 'exterior',
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }, {
            n: 'interior',
            col: true,
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }]
      }, {
        ln: 'AbstractContinuousCoverageType',
        bti: '.AbstractCoverageType',
        ps: [{
            n: 'coverageFunction',
            ti: '.CoverageFunctionType'
          }]
      }, {
        ln: 'CompoundCRSRefType',
        ps: [{
            n: 'compoundCRS',
            en: 'CompoundCRS',
            ti: '.CompoundCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeCoordinateSystemType',
        bti: '.AbstractTimeReferenceSystemType',
        ps: [{
            n: 'originPosition',
            ti: '.TimePositionType'
          }, {
            n: 'origin',
            ti: '.TimeInstantPropertyType'
          }, {
            n: 'interval',
            ti: '.TimeIntervalLengthType'
          }]
      }, {
        ln: 'ProjectedCRSRefType',
        ps: [{
            n: 'projectedCRS',
            en: 'ProjectedCRS',
            ti: '.ProjectedCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TriangulatedSurfaceType',
        bti: '.SurfaceType'
      }, {
        ln: 'GeodesicType',
        bti: '.GeodesicStringType'
      }, {
        ln: 'MovingObjectStatusType',
        bti: '.AbstractTimeSliceType',
        ps: [{
            n: 'location',
            mx: false,
            dom: false,
            ti: '.LocationPropertyType',
            t: 'er'
          }, {
            n: 'speed',
            ti: '.MeasureType'
          }, {
            n: 'bearing',
            ti: '.DirectionPropertyType'
          }, {
            n: 'acceleration',
            ti: '.MeasureType'
          }, {
            n: 'elevation',
            ti: '.MeasureType'
          }, {
            n: 'status',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'AngleChoiceType',
        ps: [{
            n: 'angle',
            ti: '.MeasureType'
          }, {
            n: 'dmsAngle',
            ti: '.DMSAngleType'
          }]
      }, {
        ln: 'TopologyStylePropertyType',
        ps: [{
            n: 'topologyStyle',
            en: 'TopologyStyle',
            ti: '.TopologyStyleType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'SurfacePropertyType',
        ps: [{
            n: 'surface',
            mx: false,
            dom: false,
            en: '_Surface',
            ti: '.AbstractSurfaceType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'EngineeringCRSRefType',
        ps: [{
            n: 'engineeringCRS',
            en: 'EngineeringCRS',
            ti: '.EngineeringCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ReferenceType',
        ps: [{
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeEdgePropertyType',
        ps: [{
            n: 'timeEdge',
            en: 'TimeEdge',
            ti: '.TimeEdgeType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'SymbolType',
        ps: [{
            n: 'any',
            col: true,
            typed: false,
            mx: false,
            t: 'ae'
          }, {
            n: 'symbolType',
            an: {
              lp: 'symbolType'
            },
            t: 'a'
          }, {
            n: 'transform',
            an: {
              lp: 'transform',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'PolyhedralSurfaceType',
        bti: '.SurfaceType'
      }, {
        ln: 'MultiSolidCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'ValueArrayPropertyType',
        ps: [{
            n: 'value',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'Null',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'QuantityList',
                ti: '.MeasureOrNullListType'
              }, {
                en: 'BooleanList',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'CountList',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'CategoryList',
                ti: '.CodeOrNullListType'
              }, {
                en: 'Count',
                ti: 'Integer'
              }, {
                en: 'QuantityExtent',
                ti: '.QuantityExtentType'
              }, {
                en: '_Object',
                ti: 'AnyType'
              }, {
                en: 'CountExtent',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'Quantity',
                ti: '.MeasureType'
              }, {
                en: 'CategoryExtent',
                ti: '.CategoryExtentType'
              }, {
                en: 'Boolean',
                ti: 'Boolean'
              }, {
                en: 'Category',
                ti: '.CodeType'
              }, {
                en: 'CompositeValue',
                ti: '.CompositeValueType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'ParameterValueType',
        bti: '.AbstractGeneralParameterValueType',
        ps: [{
            n: 'value',
            ti: '.MeasureType'
          }, {
            n: 'dmsAngleValue',
            ti: '.DMSAngleType'
          }, {
            n: 'stringValue'
          }, {
            n: 'integerValue',
            ti: 'Integer'
          }, {
            n: 'booleanValue',
            ti: 'Boolean'
          }, {
            n: 'valueList',
            ti: '.MeasureListType'
          }, {
            n: 'integerValueList',
            ti: {
              t: 'l',
              bti: 'Integer'
            }
          }, {
            n: 'valueFile'
          }, {
            n: 'valueOfParameter',
            ti: '.OperationParameterRefType'
          }]
      }, {
        ln: 'PolygonPatchType',
        bti: '.AbstractSurfacePatchType',
        ps: [{
            n: 'exterior',
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }, {
            n: 'interior',
            col: true,
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }]
      }, {
        ln: 'CoordinateOperationRefType',
        ps: [{
            n: 'coordinateOperation',
            mx: false,
            dom: false,
            en: '_CoordinateOperation',
            ti: '.AbstractCoordinateOperationType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometricComplexPropertyType',
        ps: [{
            n: 'geometricComplex',
            en: 'GeometricComplex',
            ti: '.GeometricComplexType'
          }, {
            n: 'compositeCurve',
            en: 'CompositeCurve',
            ti: '.CompositeCurveType'
          }, {
            n: 'compositeSurface',
            en: 'CompositeSurface',
            ti: '.CompositeSurfaceType'
          }, {
            n: 'compositeSolid',
            en: 'CompositeSolid',
            ti: '.CompositeSolidType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractPositionalAccuracyType',
        ps: [{
            n: 'measureDescription',
            ti: '.CodeType'
          }]
      }, {
        ln: 'QuantityPropertyType',
        bti: '.ValuePropertyType'
      }, {
        ln: 'AbstractGeometricAggregateType',
        bti: '.AbstractGeometryType'
      }, {
        ln: 'DomainSetType',
        ps: [{
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'timeObject',
            mx: false,
            dom: false,
            en: '_TimeObject',
            ti: '.AbstractTimeObjectType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimePeriodType',
        bti: '.AbstractTimeGeometricPrimitiveType',
        ps: [{
            n: 'beginPosition',
            ti: '.TimePositionType'
          }, {
            n: 'begin',
            ti: '.TimeInstantPropertyType'
          }, {
            n: 'endPosition',
            ti: '.TimePositionType'
          }, {
            n: 'end',
            ti: '.TimeInstantPropertyType'
          }, {
            n: 'duration',
            ti: 'Duration'
          }, {
            n: 'timeInterval',
            ti: '.TimeIntervalLengthType'
          }]
      }, {
        ln: 'DMSAngleType',
        ps: [{
            n: 'degrees',
            ti: '.DegreesType'
          }, {
            n: 'decimalMinutes',
            ti: 'Decimal'
          }, {
            n: 'minutes',
            ti: 'Int'
          }, {
            n: 'seconds',
            ti: 'Decimal'
          }]
      }, {
        ln: 'SecondDefiningParameterType',
        ps: [{
            n: 'inverseFlattening',
            ti: '.MeasureType'
          }, {
            n: 'semiMinorAxis',
            ti: '.MeasureType'
          }, {
            n: 'isSphere'
          }]
      }, {
        ln: 'TopoPointType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'directedNode',
            ti: '.DirectedNodePropertyType'
          }]
      }, {
        ln: 'TimeNodePropertyType',
        ps: [{
            n: 'timeNode',
            en: 'TimeNode',
            ti: '.TimeNodeType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DefinitionType',
        bti: '.AbstractGMLType'
      }, {
        ln: 'TopoSurfaceType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'directedFace',
            col: true,
            ti: '.DirectedFacePropertyType'
          }]
      }, {
        ln: 'VerticalCRSRefType',
        ps: [{
            n: 'verticalCRS',
            en: 'VerticalCRS',
            ti: '.VerticalCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractDatumType',
        bti: '.AbstractDatumBaseType',
        ps: [{
            n: 'datumID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'anchorPoint',
            ti: '.CodeType'
          }, {
            n: 'realizationEpoch',
            ti: 'Calendar'
          }, {
            n: 'validArea',
            ti: '.ExtentType'
          }, {
            n: 'scope'
          }]
      }, {
        ln: 'DirectionPropertyType',
        ps: [{
            n: 'directionVector',
            en: 'DirectionVector',
            ti: '.DirectionVectorType'
          }, {
            n: 'compassPoint',
            en: 'CompassPoint'
          }, {
            n: 'directionKeyword',
            en: 'DirectionKeyword',
            ti: '.CodeType'
          }, {
            n: 'directionString',
            en: 'DirectionString',
            ti: '.StringOrRefType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DirectedEdgePropertyType',
        ps: [{
            n: 'edge',
            en: 'Edge',
            ti: '.EdgeType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeClockType',
        bti: '.AbstractTimeReferenceSystemType',
        ps: [{
            n: 'referenceEvent',
            ti: '.StringOrRefType'
          }, {
            n: 'referenceTime',
            ti: 'Calendar'
          }, {
            n: 'utcReference',
            ti: 'Calendar'
          }, {
            n: 'dateBasis',
            col: true,
            ti: '.TimeCalendarPropertyType'
          }]
      }, {
        ln: 'TemporalCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'ClothoidType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'refLocation',
            ti: '.ClothoidType.RefLocation'
          }, {
            n: 'scaleFactor',
            ti: 'Decimal'
          }, {
            n: 'startParameter',
            ti: 'Double'
          }, {
            n: 'endParameter',
            ti: 'Double'
          }]
      }, {
        ln: 'TopoPrimitiveMemberType',
        ps: [{
            n: 'topoPrimitive',
            mx: false,
            dom: false,
            en: '_TopoPrimitive',
            ti: '.AbstractTopoPrimitiveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'PolarCSRefType',
        ps: [{
            n: 'polarCS',
            en: 'PolarCS',
            ti: '.PolarCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TopoComplexType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'maximalComplex',
            ti: '.TopoComplexMemberType'
          }, {
            n: 'superComplex',
            col: true,
            ti: '.TopoComplexMemberType'
          }, {
            n: 'subComplex',
            col: true,
            ti: '.TopoComplexMemberType'
          }, {
            n: 'topoPrimitiveMember',
            col: true,
            ti: '.TopoPrimitiveMemberType'
          }, {
            n: 'topoPrimitiveMembers',
            ti: '.TopoPrimitiveArrayAssociationType'
          }, {
            n: 'isMaximal',
            ti: 'Boolean',
            an: {
              lp: 'isMaximal'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiSurfaceCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'AbstractCoordinateSystemType',
        bti: '.AbstractCoordinateSystemBaseType',
        ps: [{
            n: 'csID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'usesAxis',
            col: true,
            ti: '.CoordinateSystemAxisRefType'
          }]
      }, {
        ln: 'DirectPositionListType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l',
              bti: 'Double'
            },
            t: 'v'
          }, {
            n: 'count',
            ti: 'Integer',
            an: {
              lp: 'count'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }, {
            n: 'srsDimension',
            ti: 'Integer',
            an: {
              lp: 'srsDimension'
            },
            t: 'a'
          }, {
            n: 'axisLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'axisLabels'
            },
            t: 'a'
          }, {
            n: 'uomLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'uomLabels'
            },
            t: 'a'
          }]
      }, {
        ln: 'PointPropertyType',
        ps: [{
            n: 'point',
            en: 'Point',
            ti: '.PointType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeIntervalLengthType',
        ps: [{
            n: 'value',
            ti: 'Decimal',
            t: 'v'
          }, {
            n: 'unit',
            an: {
              lp: 'unit'
            },
            t: 'a'
          }, {
            n: 'radix',
            ti: 'Integer',
            an: {
              lp: 'radix'
            },
            t: 'a'
          }, {
            n: 'factor',
            ti: 'Integer',
            an: {
              lp: 'factor'
            },
            t: 'a'
          }]
      }, {
        ln: 'DynamicFeatureCollectionType',
        bti: '.FeatureCollectionType',
        ps: [{
            n: 'validTime',
            ti: '.TimePrimitivePropertyType'
          }, {
            n: 'history',
            mx: false,
            dom: false,
            ti: '.HistoryPropertyType',
            t: 'er'
          }, {
            n: 'dataSource',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'RingPropertyType',
        ps: [{
            n: 'ring',
            en: 'Ring',
            ti: '.RingType'
          }]
      }, {
        ln: 'MeasureOrNullListType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l'
            },
            t: 'v'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'OperationParameterBaseType',
        bti: '.AbstractGeneralOperationParameterType'
      }, {
        ln: 'AbsoluteExternalPositionalAccuracyType',
        bti: '.AbstractPositionalAccuracyType',
        ps: [{
            n: 'result',
            ti: '.MeasureType'
          }]
      }, {
        ln: 'PixelInCellType',
        bti: '.CodeType'
      }, {
        ln: 'PrimeMeridianRefType',
        ps: [{
            n: 'primeMeridian',
            en: 'PrimeMeridian',
            ti: '.PrimeMeridianType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CRSRefType',
        ps: [{
            n: 'crs',
            mx: false,
            dom: false,
            en: '_CRS',
            ti: '.AbstractReferenceSystemType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DatumRefType',
        ps: [{
            n: 'datum',
            mx: false,
            dom: false,
            en: '_Datum',
            ti: '.AbstractDatumType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'VerticalCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'AbstractSolidType',
        bti: '.AbstractGeometricPrimitiveType'
      }, {
        ln: 'SphericalCSRefType',
        ps: [{
            n: 'sphericalCS',
            en: 'SphericalCS',
            ti: '.SphericalCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ClothoidType.RefLocation',
        tn: null,
        ps: [{
            n: 'affinePlacement',
            en: 'AffinePlacement',
            ti: '.AffinePlacementType'
          }]
      }, {
        ln: 'TimePrimitivePropertyType',
        ps: [{
            n: 'timePrimitive',
            mx: false,
            dom: false,
            en: '_TimePrimitive',
            ti: '.AbstractTimePrimitiveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GraphStyleType',
        bti: '.BaseStyleDescriptorType',
        ps: [{
            n: 'planar',
            ti: 'Boolean'
          }, {
            n: 'directed',
            ti: 'Boolean'
          }, {
            n: 'grid',
            ti: 'Boolean'
          }, {
            n: 'minDistance',
            ti: 'Double'
          }, {
            n: 'minAngle',
            ti: 'Double'
          }, {
            n: 'graphType'
          }, {
            n: 'drawingType'
          }, {
            n: 'lineType'
          }, {
            n: 'aestheticCriteria',
            col: true
          }]
      }, {
        ln: 'CurveSegmentArrayPropertyType',
        ps: [{
            n: 'curveSegment',
            col: true,
            mx: false,
            dom: false,
            en: '_CurveSegment',
            ti: '.AbstractCurveSegmentType',
            t: 'er'
          }]
      }, {
        ln: 'SurfacePatchArrayPropertyType',
        ps: [{
            n: 'surfacePatch',
            col: true,
            mx: false,
            dom: false,
            en: '_SurfacePatch',
            ti: '.AbstractSurfacePatchType',
            t: 'er'
          }]
      }, {
        ln: 'SequenceRuleType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'order',
            an: {
              lp: 'order'
            },
            t: 'a'
          }]
      }, {
        ln: 'DegreesType',
        ps: [{
            n: 'value',
            ti: 'Int',
            t: 'v'
          }, {
            n: 'direction',
            an: {
              lp: 'direction'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractFeatureCollectionType',
        bti: '.AbstractFeatureType',
        ps: [{
            n: 'featureMember',
            col: true,
            ti: '.FeaturePropertyType'
          }, {
            n: 'featureMembers',
            ti: '.FeatureArrayPropertyType'
          }]
      }, {
        ln: 'DirectionVectorType',
        ps: [{
            n: 'vector',
            ti: '.VectorType'
          }, {
            n: 'horizontalAngle',
            ti: '.AngleType'
          }, {
            n: 'verticalAngle',
            ti: '.AngleType'
          }]
      }, {
        ln: 'ConversionToPreferredUnitType',
        bti: '.UnitOfMeasureType',
        ps: [{
            n: 'factor',
            ti: 'Double'
          }, {
            n: 'formula',
            ti: '.FormulaType'
          }]
      }, {
        ln: 'AbstractSurfaceType',
        bti: '.AbstractGeometricPrimitiveType'
      }, {
        ln: 'SolidArrayPropertyType',
        ps: [{
            n: 'solid',
            col: true,
            mx: false,
            dom: false,
            en: '_Solid',
            ti: '.AbstractSolidType',
            t: 'er'
          }]
      }, {
        ln: 'PassThroughOperationRefType',
        ps: [{
            n: 'passThroughOperation',
            en: 'PassThroughOperation',
            ti: '.PassThroughOperationType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CompositeValueType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'valueComponent',
            col: true,
            ti: '.ValuePropertyType'
          }, {
            n: 'valueComponents',
            ti: '.ValueArrayPropertyType'
          }]
      }, {
        ln: 'GraphStylePropertyType',
        ps: [{
            n: 'graphStyle',
            en: 'GraphStyle',
            ti: '.GraphStyleType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractTimeGeometricPrimitiveType',
        bti: '.AbstractTimePrimitiveType',
        ps: [{
            n: 'frame',
            an: {
              lp: 'frame'
            },
            t: 'a'
          }]
      }, {
        ln: 'TriangleType',
        bti: '.AbstractSurfacePatchType',
        ps: [{
            n: 'exterior',
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }]
      }, {
        ln: 'CoordinateSystemAxisType',
        bti: '.CoordinateSystemAxisBaseType',
        ps: [{
            n: 'axisID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'axisAbbrev',
            ti: '.CodeType'
          }, {
            n: 'axisDirection',
            ti: '.CodeType'
          }, {
            n: 'uom',
            an: {
              lp: 'uom',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }]
      }, {
        ln: 'TimeType',
        bti: '.MeasureType'
      }, {
        ln: 'UserDefinedCSRefType',
        ps: [{
            n: 'userDefinedCS',
            en: 'UserDefinedCS',
            ti: '.UserDefinedCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CompositeSolidType',
        bti: '.AbstractSolidType',
        ps: [{
            n: 'solidMember',
            col: true,
            ti: '.SolidPropertyType'
          }]
      }, {
        ln: 'SphereType',
        bti: '.AbstractGriddedSurfaceType',
        ps: [{
            n: 'horizontalCURVETYPE',
            an: {
              lp: 'horizontalCurveType'
            },
            t: 'a'
          }, {
            n: 'verticalCURVETYPE',
            an: {
              lp: 'verticalCurveType'
            },
            t: 'a'
          }]
      }, {
        ln: 'GeometryPropertyType',
        ps: [{
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TopoPrimitiveArrayAssociationType',
        ps: [{
            n: 'topoPrimitive',
            col: true,
            mx: false,
            dom: false,
            en: '_TopoPrimitive',
            ti: '.AbstractTopoPrimitiveType',
            t: 'er'
          }]
      }, {
        ln: 'RelativeInternalPositionalAccuracyType',
        bti: '.AbstractPositionalAccuracyType',
        ps: [{
            n: 'result',
            ti: '.MeasureType'
          }]
      }, {
        ln: 'PriorityLocationPropertyType',
        bti: '.LocationPropertyType',
        ps: [{
            n: 'priority',
            an: {
              lp: 'priority'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiPolygonType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'polygonMember',
            col: true,
            ti: '.PolygonPropertyType'
          }]
      }, {
        ln: 'ConversionRefType',
        ps: [{
            n: 'conversion',
            en: 'Conversion',
            ti: '.ConversionType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ArcType',
        bti: '.ArcStringType'
      }, {
        ln: 'FeatureStyleType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'featureConstraint'
          }, {
            n: 'geometryStyle',
            col: true,
            ti: '.GeometryStylePropertyType'
          }, {
            n: 'topologyStyle',
            col: true,
            ti: '.TopologyStylePropertyType'
          }, {
            n: 'labelStyle',
            ti: '.LabelStylePropertyType'
          }, {
            n: 'featureType',
            an: {
              lp: 'featureType'
            },
            t: 'a'
          }, {
            n: 'baseType',
            an: {
              lp: 'baseType'
            },
            t: 'a'
          }, {
            n: 'queryGrammar',
            an: {
              lp: 'queryGrammar'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractTopoPrimitiveType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'isolated',
            col: true,
            ti: '.IsolatedPropertyType'
          }, {
            n: 'container',
            ti: '.ContainerPropertyType'
          }]
      }, {
        ln: 'DerivedCRSTypeType',
        bti: '.CodeType'
      }, {
        ln: 'UnitOfMeasureType',
        ps: [{
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'VectorType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l',
              bti: 'Double'
            },
            t: 'v'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }, {
            n: 'srsDimension',
            ti: 'Integer',
            an: {
              lp: 'srsDimension'
            },
            t: 'a'
          }, {
            n: 'axisLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'axisLabels'
            },
            t: 'a'
          }, {
            n: 'uomLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'uomLabels'
            },
            t: 'a'
          }]
      }, {
        ln: 'UnitDefinitionType',
        bti: '.DefinitionType',
        ps: [{
            n: 'quantityType',
            ti: '.StringOrRefType'
          }, {
            n: 'catalogSymbol',
            ti: '.CodeType'
          }]
      }, {
        ln: 'CompositeCurvePropertyType',
        ps: [{
            n: 'compositeCurve',
            en: 'CompositeCurve',
            ti: '.CompositeCurveType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ContainerPropertyType',
        ps: [{
            n: 'face',
            en: 'Face',
            ti: '.FaceType'
          }, {
            n: 'topoSolid',
            en: 'TopoSolid',
            ti: '.TopoSolidType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'PointArrayPropertyType',
        ps: [{
            n: 'point',
            col: true,
            en: 'Point',
            ti: '.PointType'
          }]
      }, {
        ln: 'TopoSolidType',
        bti: '.AbstractTopoPrimitiveType',
        ps: [{
            n: 'directedFace',
            col: true,
            ti: '.DirectedFacePropertyType'
          }]
      }, {
        ln: 'GeometryStylePropertyType',
        ps: [{
            n: 'geometryStyle',
            en: 'GeometryStyle',
            ti: '.GeometryStyleType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractTimeComplexType',
        bti: '.AbstractTimeObjectType'
      }, {
        ln: 'GeodeticDatumType',
        bti: '.AbstractDatumType',
        ps: [{
            n: 'usesPrimeMeridian',
            ti: '.PrimeMeridianRefType'
          }, {
            n: 'usesEllipsoid',
            ti: '.EllipsoidRefType'
          }]
      }, {
        ln: 'CodeListType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l'
            },
            t: 'v'
          }, {
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }]
      }, {
        ln: 'FeatureArrayPropertyType',
        ps: [{
            n: 'feature',
            col: true,
            mx: false,
            en: '_Feature',
            ti: '.AbstractFeatureType',
            t: 'er'
          }]
      }, {
        ln: 'ArrayAssociationType',
        ps: [{
            n: 'object',
            col: true,
            mx: false,
            dom: false,
            en: '_Object',
            ti: 'AnyType',
            t: 'er'
          }]
      }, {
        ln: 'AbstractGMLType',
        ps: [{
            n: 'metaDataProperty',
            col: true,
            ti: '.MetaDataPropertyType'
          }, {
            n: 'description',
            ti: '.StringOrRefType'
          }, {
            n: 'name',
            col: true,
            mx: false,
            dom: false,
            ti: '.CodeType',
            t: 'er'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }]
      }, {
        ln: 'ObliqueCartesianCSRefType',
        ps: [{
            n: 'obliqueCartesianCS',
            en: 'ObliqueCartesianCS',
            ti: '.ObliqueCartesianCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeocentricCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesCartesianCS',
            ti: '.CartesianCSRefType'
          }, {
            n: 'usesSphericalCS',
            ti: '.SphericalCSRefType'
          }, {
            n: 'usesGeodeticDatum',
            ti: '.GeodeticDatumRefType'
          }]
      }, {
        ln: 'CodeOrNullListType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l'
            },
            t: 'v'
          }, {
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }]
      }, {
        ln: 'PrimeMeridianType',
        bti: '.PrimeMeridianBaseType',
        ps: [{
            n: 'meridianID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'greenwichLongitude',
            ti: '.AngleChoiceType'
          }]
      }, {
        ln: 'GeneralConversionRefType',
        ps: [{
            n: 'generalConversion',
            mx: false,
            dom: false,
            en: '_GeneralConversion',
            ti: '.AbstractGeneralConversionType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GridEnvelopeType',
        ps: [{
            n: 'low',
            ti: {
              t: 'l',
              bti: 'Integer'
            }
          }, {
            n: 'high',
            ti: {
              t: 'l',
              bti: 'Integer'
            }
          }]
      }, {
        ln: 'ArcByBulgeType',
        bti: '.ArcStringByBulgeType'
      }, {
        ln: 'PolygonPatchArrayPropertyType',
        bti: '.SurfacePatchArrayPropertyType'
      }, {
        ln: 'FormulaType',
        ps: [{
            n: 'a',
            ti: 'Double'
          }, {
            n: 'b',
            ti: 'Double'
          }, {
            n: 'c',
            ti: 'Double'
          }, {
            n: 'd',
            ti: 'Double'
          }]
      }, {
        ln: 'DefinitionProxyType',
        bti: '.DefinitionType',
        ps: [{
            n: 'definitionRef',
            ti: '.ReferenceType'
          }]
      }, {
        ln: 'UserDefinedCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'TimeTopologyComplexPropertyType',
        ps: [{
            n: 'timeTopologyComplex',
            en: 'TimeTopologyComplex',
            ti: '.TimeTopologyComplexType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CurveArrayPropertyType',
        ps: [{
            n: 'curve',
            col: true,
            mx: false,
            dom: false,
            en: '_Curve',
            ti: '.AbstractCurveType',
            t: 'er'
          }]
      }, {
        ln: 'CylindricalCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'CompoundCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'includesCRS',
            col: true,
            ti: '.CoordinateReferenceSystemRefType'
          }]
      }, {
        ln: 'DictionaryEntryType',
        ps: [{
            n: 'definition',
            mx: false,
            dom: false,
            en: 'Definition',
            ti: '.DefinitionType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CurvePropertyType',
        ps: [{
            n: 'curve',
            mx: false,
            dom: false,
            en: '_Curve',
            ti: '.AbstractCurveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'RectifiedGridCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'FaceType',
        bti: '.AbstractTopoPrimitiveType',
        ps: [{
            n: 'directedEdge',
            col: true,
            ti: '.DirectedEdgePropertyType'
          }, {
            n: 'directedTopoSolid',
            col: true,
            ti: '.DirectedTopoSolidPropertyType'
          }, {
            n: 'surfaceProperty',
            ti: '.SurfacePropertyType'
          }]
      }, {
        ln: 'QuantityExtentType',
        bti: '.MeasureOrNullListType'
      }, {
        ln: 'BSplineType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'degree',
            ti: 'Integer'
          }, {
            n: 'knot',
            col: true,
            ti: '.KnotPropertyType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }, {
            n: 'isPolynomial',
            ti: 'Boolean',
            an: {
              lp: 'isPolynomial'
            },
            t: 'a'
          }, {
            n: 'knotType',
            an: {
              lp: 'knotType'
            },
            t: 'a'
          }]
      }, {
        ln: 'AffinePlacementType',
        ps: [{
            n: 'location',
            ti: '.DirectPositionType'
          }, {
            n: 'refDirection',
            col: true,
            ti: '.VectorType'
          }, {
            n: 'inDimension',
            ti: 'Integer'
          }, {
            n: 'outDimension',
            ti: 'Integer'
          }]
      }, {
        ln: 'AbstractCoverageType',
        bti: '.AbstractFeatureType',
        ps: [{
            n: 'domainSet',
            mx: false,
            dom: false,
            ti: '.DomainSetType',
            t: 'er'
          }, {
            n: 'rangeSet',
            ti: '.RangeSetType'
          }, {
            n: 'dimension',
            ti: 'Integer',
            an: {
              lp: 'dimension'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiSolidDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'EllipsoidRefType',
        ps: [{
            n: 'ellipsoid',
            en: 'Ellipsoid',
            ti: '.EllipsoidType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'MeasureListType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l',
              bti: 'Double'
            },
            t: 'v'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'RelatedTimeType',
        bti: '.TimePrimitivePropertyType',
        ps: [{
            n: 'relativePosition',
            an: {
              lp: 'relativePosition'
            },
            t: 'a'
          }]
      }, {
        ln: 'DynamicFeatureType',
        bti: '.AbstractFeatureType',
        ps: [{
            n: 'validTime',
            ti: '.TimePrimitivePropertyType'
          }, {
            n: 'history',
            mx: false,
            dom: false,
            ti: '.HistoryPropertyType',
            t: 'er'
          }, {
            n: 'dataSource',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'MultiPointDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'ConcatenatedOperationType',
        bti: '.AbstractCoordinateOperationType',
        ps: [{
            n: 'usesSingleOperation',
            col: true,
            ti: '.SingleOperationRefType'
          }]
      }, {
        ln: 'CoordinateSystemRefType',
        ps: [{
            n: 'coordinateSystem',
            mx: false,
            dom: false,
            en: '_CoordinateSystem',
            ti: '.AbstractCoordinateSystemType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TransformationRefType',
        ps: [{
            n: 'transformation',
            en: 'Transformation',
            ti: '.TransformationType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ArcStringType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }, {
            n: 'numArc',
            ti: 'Integer',
            an: {
              lp: 'numArc'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractCoordinateOperationBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'BaseStyleDescriptorType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'spatialResolution',
            ti: '.ScaleType'
          }, {
            n: 'styleVariation',
            col: true,
            ti: '.StyleVariationType'
          }, {
            n: 'animate',
            col: true,
            en: {
              lp: 'animate',
              ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/'
            },
            ti: 'SMIL_2_0_Language.AnimateType'
          }, {
            n: 'animateMotion',
            col: true,
            en: {
              lp: 'animateMotion',
              ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/'
            },
            ti: 'SMIL_2_0_Language.AnimateMotionType'
          }, {
            n: 'animateColor',
            col: true,
            en: {
              lp: 'animateColor',
              ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/'
            },
            ti: 'SMIL_2_0_Language.AnimateColorType'
          }, {
            n: 'set',
            col: true,
            en: {
              lp: 'set',
              ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/'
            },
            ti: 'SMIL_2_0_Language.SetType'
          }]
      }, {
        ln: 'LineStringType',
        bti: '.AbstractCurveType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }, {
                en: 'coord',
                ti: '.CoordType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }]
      }, {
        ln: 'LabelStylePropertyType',
        ps: [{
            n: 'labelStyle',
            en: 'LabelStyle',
            ti: '.LabelStyleType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ArcByCenterPointType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'pos',
            ti: '.DirectPositionType'
          }, {
            n: 'pointProperty',
            ti: '.PointPropertyType'
          }, {
            n: 'pointRep',
            ti: '.PointPropertyType'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'radius',
            ti: '.LengthType'
          }, {
            n: 'startAngle',
            ti: '.AngleType'
          }, {
            n: 'endAngle',
            ti: '.AngleType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }, {
            n: 'numARC',
            ti: 'Integer',
            an: {
              lp: 'numArc'
            },
            t: 'a'
          }]
      }, {
        ln: 'EllipsoidBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'VerticalDatumTypeType',
        bti: '.CodeType'
      }, {
        ln: 'AbstractReferenceSystemType',
        bti: '.AbstractReferenceSystemBaseType',
        ps: [{
            n: 'srsID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'validArea',
            ti: '.ExtentType'
          }, {
            n: 'scope'
          }]
      }, {
        ln: 'ScaleType',
        bti: '.MeasureType'
      }, {
        ln: 'CompositeSurfaceType',
        bti: '.AbstractSurfaceType',
        ps: [{
            n: 'surfaceMember',
            col: true,
            ti: '.SurfacePropertyType'
          }]
      }, {
        ln: 'LabelType',
        ps: [{
            n: 'content',
            col: true,
            dom: false,
            en: 'LabelExpression',
            t: 'er'
          }, {
            n: 'transform',
            an: {
              lp: 'transform',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }]
      }, {
        ln: 'KnotType',
        ps: [{
            n: 'value',
            ti: 'Double'
          }, {
            n: 'multiplicity',
            ti: 'Integer'
          }, {
            n: 'weight',
            ti: 'Double'
          }]
      }, {
        ln: 'SpeedType',
        bti: '.MeasureType'
      }, {
        ln: 'MultiSurfaceType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'surfaceMember',
            col: true,
            ti: '.SurfacePropertyType'
          }, {
            n: 'surfaceMembers',
            ti: '.SurfaceArrayPropertyType'
          }]
      }, {
        ln: 'ArcStringByBulgeType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'bulge',
            col: true,
            ti: 'Double'
          }, {
            n: 'normal',
            col: true,
            ti: '.VectorType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }, {
            n: 'numArc',
            ti: 'Integer',
            an: {
              lp: 'numArc'
            },
            t: 'a'
          }]
      }, {
        ln: 'CircleByCenterPointType',
        bti: '.ArcByCenterPointType'
      }, {
        ln: 'ConversionType',
        bti: '.AbstractGeneralConversionType',
        ps: [{
            n: 'usesMethod',
            ti: '.OperationMethodRefType'
          }, {
            n: 'usesValue',
            col: true,
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'AbstractTimeObjectType',
        bti: '.AbstractGMLType'
      }, {
        ln: 'TimeEdgeType',
        bti: '.AbstractTimeTopologyPrimitiveType',
        ps: [{
            n: 'start',
            ti: '.TimeNodePropertyType'
          }, {
            n: 'end',
            ti: '.TimeNodePropertyType'
          }, {
            n: 'extent',
            ti: '.TimePeriodPropertyType'
          }]
      }, {
        ln: 'StringOrRefType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CategoryPropertyType',
        bti: '.ValuePropertyType'
      }, {
        ln: 'AngleType',
        bti: '.MeasureType'
      }, {
        ln: 'MultiSolidType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'solidMember',
            col: true,
            ti: '.SolidPropertyType'
          }, {
            n: 'solidMembers',
            ti: '.SolidArrayPropertyType'
          }]
      }, {
        ln: 'IndexMapType',
        bti: '.GridFunctionType',
        ps: [{
            n: 'lookUpTable',
            ti: {
              t: 'l',
              bti: 'Integer'
            }
          }]
      }, {
        ln: 'AbstractGeometryType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'gid',
            an: {
              lp: 'gid'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }, {
            n: 'srsDimension',
            ti: 'Integer',
            an: {
              lp: 'srsDimension'
            },
            t: 'a'
          }, {
            n: 'axisLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'axisLabels'
            },
            t: 'a'
          }, {
            n: 'uomLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'uomLabels'
            },
            t: 'a'
          }]
      }, {
        ln: 'CartesianCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'VerticalDatumType',
        bti: '.AbstractDatumType',
        ps: [{
            n: 'verticalDatumType',
            ti: '.VerticalDatumTypeType'
          }]
      }, {
        ln: 'CurveType',
        bti: '.AbstractCurveType',
        ps: [{
            n: 'segments',
            ti: '.CurveSegmentArrayPropertyType'
          }]
      }, {
        ln: 'ImageDatumType',
        bti: '.AbstractDatumType',
        ps: [{
            n: 'pixelInCell',
            ti: '.PixelInCellType'
          }]
      }, {
        ln: 'TemporalDatumType',
        bti: '.TemporalDatumBaseType',
        ps: [{
            n: 'origin',
            ti: 'Calendar'
          }]
      }, {
        ln: 'OperationMethodRefType',
        ps: [{
            n: 'operationMethod',
            en: 'OperationMethod',
            ti: '.OperationMethodType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TinType.ControlPoint',
        tn: null,
        ps: [{
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'geometricPositionGroup',
            col: true,
            etis: [{
                en: 'pos',
                ti: '.DirectPositionType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }],
            t: 'es'
          }]
      }, {
        ln: 'TopoCurveType',
        bti: '.AbstractTopologyType',
        ps: [{
            n: 'directedEdge',
            col: true,
            ti: '.DirectedEdgePropertyType'
          }]
      }, {
        ln: 'AbstractRingPropertyType',
        ps: [{
            n: 'ring',
            mx: false,
            dom: false,
            en: '_Ring',
            ti: '.AbstractRingType',
            t: 'er'
          }]
      }, {
        ln: 'GridFunctionType',
        ps: [{
            n: 'sequenceRule',
            ti: '.SequenceRuleType'
          }, {
            n: 'startPoint',
            ti: {
              t: 'l',
              bti: 'Integer'
            }
          }]
      }, {
        ln: 'CompositeCurveType',
        bti: '.AbstractCurveType',
        ps: [{
            n: 'curveMember',
            col: true,
            ti: '.CurvePropertyType'
          }]
      }, {
        ln: 'LabelStyleType',
        bti: '.BaseStyleDescriptorType',
        ps: [{
            n: 'style'
          }, {
            n: 'label',
            ti: '.LabelType'
          }]
      }, {
        ln: 'TimeGeometricPrimitivePropertyType',
        ps: [{
            n: 'timeGeometricPrimitive',
            mx: false,
            dom: false,
            en: '_TimeGeometricPrimitive',
            ti: '.AbstractTimeGeometricPrimitiveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'StyleVariationType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'styleProperty',
            an: {
              lp: 'styleProperty'
            },
            t: 'a'
          }, {
            n: 'featurePropertyRange',
            an: {
              lp: 'featurePropertyRange'
            },
            t: 'a'
          }]
      }, {
        ln: 'GenericMetaDataType',
        bti: '.AbstractMetaDataType',
        ps: [{
            n: 'contentOverrideForGenericMetaDataType',
            t: 'ae'
          }]
      }, {
        ln: 'AbstractTopologyType',
        bti: '.AbstractGMLType'
      }, {
        ln: 'IdentifierType',
        ps: [{
            n: 'name',
            mx: false,
            dom: false,
            ti: '.CodeType',
            t: 'er'
          }, {
            n: 'version'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'AbstractGeneralDerivedCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'baseCRS',
            ti: '.CoordinateReferenceSystemRefType'
          }, {
            n: 'definedByConversion',
            ti: '.GeneralConversionRefType'
          }]
      }, {
        ln: 'AbstractCurveSegmentType',
        ps: [{
            n: 'numDerivativesAtStart',
            ti: 'Integer',
            an: {
              lp: 'numDerivativesAtStart'
            },
            t: 'a'
          }, {
            n: 'numDerivativesAtEnd',
            ti: 'Integer',
            an: {
              lp: 'numDerivativesAtEnd'
            },
            t: 'a'
          }, {
            n: 'numDerivativeInterior',
            ti: 'Integer',
            an: {
              lp: 'numDerivativeInterior'
            },
            t: 'a'
          }]
      }, {
        ln: 'ConventionalUnitType',
        bti: '.UnitDefinitionType',
        ps: [{
            n: 'conversionToPreferredUnit',
            ti: '.ConversionToPreferredUnitType'
          }, {
            n: 'roughConversionToPreferredUnit',
            ti: '.ConversionToPreferredUnitType'
          }, {
            n: 'derivationUnitTerm',
            col: true,
            ti: '.DerivationUnitTermType'
          }]
      }, {
        ln: 'DirectedTopoSolidPropertyType',
        ps: [{
            n: 'topoSolid',
            en: 'TopoSolid',
            ti: '.TopoSolidType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimePositionType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l'
            },
            t: 'v'
          }, {
            n: 'frame',
            an: {
              lp: 'frame'
            },
            t: 'a'
          }, {
            n: 'calendarEraName',
            an: {
              lp: 'calendarEraName'
            },
            t: 'a'
          }, {
            n: 'indeterminatePosition',
            an: {
              lp: 'indeterminatePosition'
            },
            t: 'a'
          }]
      }, {
        ln: 'ValuePropertyType',
        ps: [{
            n: '_boolean',
            en: 'Boolean',
            ti: 'Boolean'
          }, {
            n: 'category',
            en: 'Category',
            ti: '.CodeType'
          }, {
            n: 'quantity',
            en: 'Quantity',
            ti: '.MeasureType'
          }, {
            n: 'count',
            en: 'Count',
            ti: 'Integer'
          }, {
            n: 'booleanList',
            en: 'BooleanList',
            ti: {
              t: 'l'
            }
          }, {
            n: 'categoryList',
            en: 'CategoryList',
            ti: '.CodeOrNullListType'
          }, {
            n: 'quantityList',
            en: 'QuantityList',
            ti: '.MeasureOrNullListType'
          }, {
            n: 'countList',
            en: 'CountList',
            ti: {
              t: 'l'
            }
          }, {
            n: 'categoryExtent',
            en: 'CategoryExtent',
            ti: '.CategoryExtentType'
          }, {
            n: 'quantityExtent',
            en: 'QuantityExtent',
            ti: '.QuantityExtentType'
          }, {
            n: 'countExtent',
            en: 'CountExtent',
            ti: {
              t: 'l'
            }
          }, {
            n: 'compositeValue',
            mx: false,
            dom: false,
            en: 'CompositeValue',
            ti: '.CompositeValueType',
            t: 'er'
          }, {
            n: 'object',
            mx: false,
            dom: false,
            en: '_Object',
            ti: 'AnyType',
            t: 'er'
          }, {
            n: '_null',
            en: 'Null',
            ti: {
              t: 'l'
            }
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractSurfacePatchType'
      }, {
        ln: 'ImageCRSRefType',
        ps: [{
            n: 'imageCRS',
            en: 'ImageCRS',
            ti: '.ImageCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'NodeType',
        bti: '.AbstractTopoPrimitiveType',
        ps: [{
            n: 'directedEdge',
            col: true,
            ti: '.DirectedEdgePropertyType'
          }, {
            n: 'pointProperty',
            ti: '.PointPropertyType'
          }]
      }, {
        ln: 'OperationParameterType',
        bti: '.OperationParameterBaseType',
        ps: [{
            n: 'parameterID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'BoundedFeatureType',
        bti: '.AbstractFeatureType'
      }, {
        ln: 'TransformationType',
        bti: '.AbstractGeneralTransformationType',
        ps: [{
            n: 'usesMethod',
            ti: '.OperationMethodRefType'
          }, {
            n: 'usesValue',
            col: true,
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'TimePeriodPropertyType',
        ps: [{
            n: 'timePeriod',
            en: 'TimePeriod',
            ti: '.TimePeriodType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometryArrayPropertyType',
        ps: [{
            n: 'geometry',
            col: true,
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }]
      }, {
        ln: 'AbstractCoordinateOperationType',
        bti: '.AbstractCoordinateOperationBaseType',
        ps: [{
            n: 'coordinateOperationID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'operationVersion'
          }, {
            n: 'validArea',
            ti: '.ExtentType'
          }, {
            n: 'scope'
          }, {
            n: 'positionalAccuracy',
            col: true,
            mx: false,
            dom: false,
            en: '_positionalAccuracy',
            ti: '.AbstractPositionalAccuracyType',
            t: 'er'
          }, {
            n: 'sourceCRS',
            ti: '.CRSRefType'
          }, {
            n: 'targetCRS',
            ti: '.CRSRefType'
          }]
      }, {
        ln: 'FeatureCollectionType',
        bti: '.AbstractFeatureCollectionType'
      }, {
        ln: 'AbstractGeometricPrimitiveType',
        bti: '.AbstractGeometryType'
      }, {
        ln: 'GridType',
        bti: '.AbstractGeometryType',
        ps: [{
            n: 'limits',
            ti: '.GridLimitsType'
          }, {
            n: 'axisName',
            col: true
          }, {
            n: 'dimension',
            ti: 'Integer',
            an: {
              lp: 'dimension'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiPointPropertyType',
        ps: [{
            n: 'multiPoint',
            en: 'MultiPoint',
            ti: '.MultiPointType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'BagType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'member',
            col: true,
            ti: '.AssociationType'
          }, {
            n: 'members',
            ti: '.ArrayAssociationType'
          }]
      }, {
        ln: 'LinearCSRefType',
        ps: [{
            n: 'linearCS',
            en: 'LinearCS',
            ti: '.LinearCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'OperationMethodType',
        bti: '.OperationMethodBaseType',
        ps: [{
            n: 'methodID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'methodFormula',
            ti: '.CodeType'
          }, {
            n: 'sourceDimensions',
            ti: 'Integer'
          }, {
            n: 'targetDimensions',
            ti: 'Integer'
          }, {
            n: 'usesParameter',
            col: true,
            ti: '.AbstractGeneralOperationParameterRefType'
          }]
      }, {
        ln: 'CoverageFunctionType',
        ps: [{
            n: 'mappingRule',
            en: 'MappingRule',
            ti: '.StringOrRefType'
          }, {
            n: 'gridFunction',
            mx: false,
            dom: false,
            en: 'GridFunction',
            ti: '.GridFunctionType',
            t: 'er'
          }]
      }, {
        ln: 'MultiLineStringType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'lineStringMember',
            col: true,
            ti: '.LineStringPropertyType'
          }]
      }, {
        ln: 'TopoVolumePropertyType',
        ps: [{
            n: 'topoVolume',
            en: 'TopoVolume',
            ti: '.TopoVolumeType'
          }]
      }, {
        ln: 'MultiPointCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'CoordType',
        ps: [{
            n: 'x',
            en: 'X',
            ti: 'Decimal'
          }, {
            n: 'y',
            en: 'Y',
            ti: 'Decimal'
          }, {
            n: 'z',
            en: 'Z',
            ti: 'Decimal'
          }]
      }, {
        ln: 'TopologyStyleType',
        bti: '.BaseStyleDescriptorType',
        ps: [{
            n: 'symbol',
            ti: '.SymbolType'
          }, {
            n: 'style'
          }, {
            n: 'labelStyle',
            ti: '.LabelStylePropertyType'
          }, {
            n: 'topologyProperty',
            an: {
              lp: 'topologyProperty'
            },
            t: 'a'
          }, {
            n: 'topologyType',
            an: {
              lp: 'topologyType'
            },
            t: 'a'
          }]
      }, {
        ln: 'TimeOrdinalEraType',
        bti: '.DefinitionType',
        ps: [{
            n: 'relatedTime',
            col: true,
            ti: '.RelatedTimeType'
          }, {
            n: 'start',
            ti: '.TimeNodePropertyType'
          }, {
            n: 'end',
            ti: '.TimeNodePropertyType'
          }, {
            n: 'extent',
            ti: '.TimePeriodPropertyType'
          }, {
            n: 'member',
            col: true,
            ti: '.TimeOrdinalEraPropertyType'
          }, {
            n: 'group',
            ti: '.ReferenceType'
          }]
      }, {
        ln: 'CoordinatesType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'decimal',
            an: {
              lp: 'decimal'
            },
            t: 'a'
          }, {
            n: 'cs',
            an: {
              lp: 'cs'
            },
            t: 'a'
          }, {
            n: 'ts',
            an: {
              lp: 'ts'
            },
            t: 'a'
          }]
      }, {
        ln: 'HistoryPropertyType',
        ps: [{
            n: 'timeSlice',
            col: true,
            mx: false,
            dom: false,
            en: '_TimeSlice',
            ti: '.AbstractTimeSliceType',
            t: 'er'
          }]
      }, {
        ln: 'SurfaceArrayPropertyType',
        ps: [{
            n: 'surface',
            col: true,
            mx: false,
            dom: false,
            en: '_Surface',
            ti: '.AbstractSurfaceType',
            t: 'er'
          }]
      }, {
        ln: 'TimeNodeType',
        bti: '.AbstractTimeTopologyPrimitiveType',
        ps: [{
            n: 'previousEdge',
            col: true,
            ti: '.TimeEdgePropertyType'
          }, {
            n: 'nextEdge',
            col: true,
            ti: '.TimeEdgePropertyType'
          }, {
            n: 'position',
            ti: '.TimeInstantPropertyType'
          }]
      }, {
        ln: 'AbstractGeneralConversionType',
        bti: '.AbstractCoordinateOperationType'
      }, {
        ln: 'EdgeType',
        bti: '.AbstractTopoPrimitiveType',
        ps: [{
            n: 'directedNode',
            col: true,
            ti: '.DirectedNodePropertyType'
          }, {
            n: 'directedFace',
            col: true,
            ti: '.DirectedFacePropertyType'
          }, {
            n: 'curveProperty',
            ti: '.CurvePropertyType'
          }]
      }, {
        ln: 'TimeCalendarEraPropertyType',
        ps: [{
            n: 'timeCalendarEra',
            en: 'TimeCalendarEra',
            ti: '.TimeCalendarEraType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'EngineeringCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesCS',
            ti: '.CoordinateSystemRefType'
          }, {
            n: 'usesEngineeringDatum',
            ti: '.EngineeringDatumRefType'
          }]
      }, {
        ln: 'RectifiedGridDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'GeocentricCRSRefType',
        ps: [{
            n: 'geocentricCRS',
            en: 'GeocentricCRS',
            ti: '.GeocentricCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'MultiCurvePropertyType',
        ps: [{
            n: 'multiCurve',
            en: 'MultiCurve',
            ti: '.MultiCurveType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AssociationType',
        ps: [{
            n: 'object',
            mx: false,
            dom: false,
            en: '_Object',
            ti: 'AnyType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'OperationParameterGroupBaseType',
        bti: '.AbstractGeneralOperationParameterType'
      }, {
        ln: 'StyleType',
        bti: '.AbstractStyleType',
        ps: [{
            n: 'featureStyle',
            col: true,
            ti: '.FeatureStylePropertyType'
          }, {
            n: 'graphStyle',
            ti: '.GraphStylePropertyType'
          }]
      }, {
        ln: 'ScalarValuePropertyType',
        bti: '.ValuePropertyType'
      }, {
        ln: 'SolidType',
        bti: '.AbstractSolidType',
        ps: [{
            n: 'exterior',
            ti: '.SurfacePropertyType'
          }, {
            n: 'interior',
            col: true,
            ti: '.SurfacePropertyType'
          }]
      }, {
        ln: 'TemporalCSRefType',
        ps: [{
            n: 'temporalCS',
            en: 'TemporalCS',
            ti: '.TemporalCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'SingleOperationRefType',
        ps: [{
            n: 'singleOperation',
            mx: false,
            dom: false,
            en: '_SingleOperation',
            ti: '.AbstractCoordinateOperationType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeCalendarPropertyType',
        ps: [{
            n: 'timeCalendar',
            en: 'TimeCalendar',
            ti: '.TimeCalendarType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'LinearRingPropertyType',
        ps: [{
            n: 'linearRing',
            en: 'LinearRing',
            ti: '.LinearRingType'
          }]
      }, {
        ln: 'AbstractTimePrimitiveType',
        bti: '.AbstractTimeObjectType',
        ps: [{
            n: 'relatedTime',
            col: true,
            ti: '.RelatedTimeType'
          }]
      }, {
        ln: 'DirectedNodePropertyType',
        ps: [{
            n: 'node',
            en: 'Node',
            ti: '.NodeType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractReferenceSystemBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'PrimeMeridianBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'TimeOrdinalReferenceSystemType',
        bti: '.AbstractTimeReferenceSystemType',
        ps: [{
            n: 'component',
            col: true,
            ti: '.TimeOrdinalEraPropertyType'
          }]
      }, {
        ln: 'LineStringSegmentType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractStyleType',
        bti: '.AbstractGMLType'
      }, {
        ln: 'PolarCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'KnotPropertyType',
        ps: [{
            n: 'knot',
            en: 'Knot',
            ti: '.KnotType'
          }]
      }, {
        ln: 'SurfaceType',
        bti: '.AbstractSurfaceType',
        ps: [{
            n: 'patches',
            mx: false,
            dom: false,
            ti: '.SurfacePatchArrayPropertyType',
            t: 'er'
          }]
      }, {
        ln: 'GeodesicStringType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'geometricPositionGroup',
            col: true,
            etis: [{
                en: 'pos',
                ti: '.DirectPositionType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }],
            t: 'es'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }]
      }, {
        ln: 'TimeInstantPropertyType',
        ps: [{
            n: 'timeInstant',
            en: 'TimeInstant',
            ti: '.TimeInstantType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractCoordinateSystemBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'AbstractGeneralOperationParameterType',
        bti: '.DefinitionType',
        ps: [{
            n: 'minimumOccurs',
            ti: 'Integer'
          }]
      }, {
        ln: 'DataBlockType',
        ps: [{
            n: 'rangeParameters',
            ti: '.RangeParametersType'
          }, {
            n: 'tupleList',
            ti: '.CoordinatesType'
          }, {
            n: 'doubleOrNullTupleList',
            ti: {
              t: 'l'
            }
          }]
      }, {
        ln: 'CylinderType',
        bti: '.AbstractGriddedSurfaceType',
        ps: [{
            n: 'horizontalCURVETYPE',
            an: {
              lp: 'horizontalCurveType'
            },
            t: 'a'
          }, {
            n: 'verticalCURVETYPE',
            an: {
              lp: 'verticalCurveType'
            },
            t: 'a'
          }]
      }, {
        ln: 'GeographicCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesEllipsoidalCS',
            ti: '.EllipsoidalCSRefType'
          }, {
            n: 'usesGeodeticDatum',
            ti: '.GeodeticDatumRefType'
          }]
      }, {
        ln: 'CoordinateSystemAxisBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'PointType',
        bti: '.AbstractGeometricPrimitiveType',
        ps: [{
            n: 'pos',
            ti: '.DirectPositionType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'coord',
            ti: '.CoordType'
          }]
      }, {
        ln: 'BooleanPropertyType',
        bti: '.ValuePropertyType'
      }, {
        ln: 'DirectedObservationAtDistanceType',
        bti: '.DirectedObservationType',
        ps: [{
            n: 'distance',
            ti: '.MeasureType'
          }]
      }, {
        ln: 'SolidPropertyType',
        ps: [{
            n: 'solid',
            mx: false,
            dom: false,
            en: '_Solid',
            ti: '.AbstractSolidType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AreaType',
        bti: '.MeasureType'
      }, {
        ln: 'GridLimitsType',
        ps: [{
            n: 'gridEnvelope',
            en: 'GridEnvelope',
            ti: '.GridEnvelopeType'
          }]
      }, {
        ln: 'ConeType',
        bti: '.AbstractGriddedSurfaceType',
        ps: [{
            n: 'horizontalCURVETYPE',
            an: {
              lp: 'horizontalCurveType'
            },
            t: 'a'
          }, {
            n: 'verticalCURVETYPE',
            an: {
              lp: 'verticalCurveType'
            },
            t: 'a'
          }]
      }, {
        ln: 'GeographicCRSRefType',
        ps: [{
            n: 'geographicCRS',
            en: 'GeographicCRS',
            ti: '.GeographicCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'LocationPropertyType',
        ps: [{
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'locationKeyWord',
            en: 'LocationKeyWord',
            ti: '.CodeType'
          }, {
            n: 'locationString',
            en: 'LocationString',
            ti: '.StringOrRefType'
          }, {
            n: '_null',
            en: 'Null',
            ti: {
              t: 'l'
            }
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ObservationType',
        bti: '.AbstractFeatureType',
        ps: [{
            n: 'validTime',
            ti: '.TimePrimitivePropertyType'
          }, {
            n: 'using',
            ti: '.FeaturePropertyType'
          }, {
            n: 'target',
            mx: false,
            dom: false,
            ti: '.TargetPropertyType',
            t: 'er'
          }, {
            n: 'resultOf',
            ti: '.AssociationType'
          }]
      }, {
        ln: 'BezierType',
        bti: '.BSplineType'
      }, {
        ln: 'AbstractRingType',
        bti: '.AbstractGeometryType'
      }, {
        ln: 'TrianglePatchArrayPropertyType',
        bti: '.SurfacePatchArrayPropertyType'
      }, {
        ln: 'DerivedUnitType',
        bti: '.UnitDefinitionType',
        ps: [{
            n: 'derivationUnitTerm',
            col: true,
            ti: '.DerivationUnitTermType'
          }]
      }, {
        ln: 'AbstractGriddedSurfaceType',
        bti: '.AbstractParametricCurveSurfaceType',
        ps: [{
            n: 'row',
            col: true,
            ti: '.AbstractGriddedSurfaceType.Row'
          }, {
            n: 'rows',
            ti: 'Integer'
          }, {
            n: 'columns',
            ti: 'Integer'
          }]
      }, {
        ln: 'AbstractDatumBaseType',
        bti: '.DefinitionType'
      }, {
        ln: 'CategoryExtentType',
        bti: '.CodeOrNullListType'
      }, {
        ln: 'TimeCalendarEraType',
        bti: '.DefinitionType',
        ps: [{
            n: 'referenceEvent',
            ti: '.StringOrRefType'
          }, {
            n: 'referenceDate',
            ti: 'Calendar'
          }, {
            n: 'julianReference',
            ti: 'Decimal'
          }, {
            n: 'epochOfUse',
            ti: '.TimePeriodPropertyType'
          }]
      }, {
        ln: 'LineStringPropertyType',
        ps: [{
            n: 'lineString',
            en: 'LineString',
            ti: '.LineStringType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'MultiPolygonPropertyType',
        ps: [{
            n: 'multiPolygon',
            en: 'MultiPolygon',
            ti: '.MultiPolygonType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'VerticalCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesVerticalCS',
            ti: '.VerticalCSRefType'
          }, {
            n: 'usesVerticalDatum',
            ti: '.VerticalDatumRefType'
          }]
      }, {
        ln: 'OperationParameterRefType',
        ps: [{
            n: 'operationParameter',
            en: 'OperationParameter',
            ti: '.OperationParameterType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'RangeParametersType',
        ps: [{
            n: '_boolean',
            en: 'Boolean',
            ti: 'Boolean'
          }, {
            n: 'category',
            en: 'Category',
            ti: '.CodeType'
          }, {
            n: 'quantity',
            en: 'Quantity',
            ti: '.MeasureType'
          }, {
            n: 'count',
            en: 'Count',
            ti: 'Integer'
          }, {
            n: 'booleanList',
            en: 'BooleanList',
            ti: {
              t: 'l'
            }
          }, {
            n: 'categoryList',
            en: 'CategoryList',
            ti: '.CodeOrNullListType'
          }, {
            n: 'quantityList',
            en: 'QuantityList',
            ti: '.MeasureOrNullListType'
          }, {
            n: 'countList',
            en: 'CountList',
            ti: {
              t: 'l'
            }
          }, {
            n: 'categoryExtent',
            en: 'CategoryExtent',
            ti: '.CategoryExtentType'
          }, {
            n: 'quantityExtent',
            en: 'QuantityExtent',
            ti: '.QuantityExtentType'
          }, {
            n: 'countExtent',
            en: 'CountExtent',
            ti: {
              t: 'l'
            }
          }, {
            n: 'compositeValue',
            mx: false,
            dom: false,
            en: 'CompositeValue',
            ti: '.CompositeValueType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'RangeSetType',
        ps: [{
            n: 'valueArray',
            col: true,
            en: 'ValueArray',
            ti: '.ValueArrayType'
          }, {
            n: 'scalarValueList',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'QuantityList',
                ti: '.MeasureOrNullListType'
              }, {
                en: 'CountList',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'BooleanList',
                ti: {
                  t: 'l'
                }
              }, {
                en: 'CategoryList',
                ti: '.CodeOrNullListType'
              }],
            t: 'ers'
          }, {
            n: 'dataBlock',
            en: 'DataBlock',
            ti: '.DataBlockType'
          }, {
            n: 'file',
            en: 'File',
            ti: '.FileType'
          }]
      }, {
        ln: 'RectangleType',
        bti: '.AbstractSurfacePatchType',
        ps: [{
            n: 'exterior',
            mx: false,
            dom: false,
            ti: '.AbstractRingPropertyType',
            t: 'er'
          }, {
            n: 'interpolation',
            an: {
              lp: 'interpolation'
            },
            t: 'a'
          }]
      }, {
        ln: 'CoordinateReferenceSystemRefType',
        ps: [{
            n: 'coordinateReferenceSystem',
            mx: false,
            dom: false,
            en: '_CoordinateReferenceSystem',
            ti: '.AbstractReferenceSystemType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'OffsetCurveType',
        bti: '.AbstractCurveSegmentType',
        ps: [{
            n: 'offsetBase',
            ti: '.CurvePropertyType'
          }, {
            n: 'distance',
            ti: '.LengthType'
          }, {
            n: 'refDirection',
            ti: '.VectorType'
          }]
      }, {
        ln: 'MultiSolidPropertyType',
        ps: [{
            n: 'multiSolid',
            en: 'MultiSolid',
            ti: '.MultiSolidType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractParametricCurveSurfaceType',
        bti: '.AbstractSurfacePatchType'
      }, {
        ln: 'VerticalDatumRefType',
        ps: [{
            n: 'verticalDatum',
            en: 'VerticalDatum',
            ti: '.VerticalDatumType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GridCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'TopoComplexMemberType',
        ps: [{
            n: 'topoComplex',
            en: 'TopoComplex',
            ti: '.TopoComplexType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DirectPositionType',
        ps: [{
            n: 'value',
            ti: {
              t: 'l',
              bti: 'Double'
            },
            t: 'v'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }, {
            n: 'srsDimension',
            ti: 'Integer',
            an: {
              lp: 'srsDimension'
            },
            t: 'a'
          }, {
            n: 'axisLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'axisLabels'
            },
            t: 'a'
          }, {
            n: 'uomLabels',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'uomLabels'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractDiscreteCoverageType',
        bti: '.AbstractCoverageType',
        ps: [{
            n: 'coverageFunction',
            ti: '.CoverageFunctionType'
          }]
      }, {
        ln: 'TemporalDatumRefType',
        ps: [{
            n: 'temporalDatum',
            en: 'TemporalDatum',
            ti: '.TemporalDatumType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TopoSurfacePropertyType',
        ps: [{
            n: 'topoSurface',
            en: 'TopoSurface',
            ti: '.TopoSurfaceType'
          }]
      }, {
        ln: 'TrackType',
        bti: '.HistoryPropertyType'
      }, {
        ln: 'IndirectEntryType',
        ps: [{
            n: 'definitionProxy',
            en: 'DefinitionProxy',
            ti: '.DefinitionProxyType'
          }]
      }, {
        ln: 'AbstractTimeTopologyPrimitiveType',
        bti: '.AbstractTimePrimitiveType',
        ps: [{
            n: 'complex',
            ti: '.ReferenceType'
          }]
      }, {
        ln: 'LinearCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'MultiSurfacePropertyType',
        ps: [{
            n: 'multiSurface',
            en: 'MultiSurface',
            ti: '.MultiSurfaceType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeodeticDatumRefType',
        ps: [{
            n: 'geodeticDatum',
            en: 'GeodeticDatum',
            ti: '.GeodeticDatumType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TemporalCRSRefType',
        ps: [{
            n: 'temporalCRS',
            en: 'TemporalCRS',
            ti: '.TemporalCRSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ObliqueCartesianCSType',
        bti: '.AbstractCoordinateSystemType'
      }, {
        ln: 'VolumeType',
        bti: '.MeasureType'
      }, {
        ln: 'FileType',
        ps: [{
            n: 'rangeParameters',
            ti: '.RangeParametersType'
          }, {
            n: 'fileName'
          }, {
            n: 'fileStructure'
          }, {
            n: 'mimeType'
          }, {
            n: 'compression'
          }]
      }, {
        ln: 'TargetPropertyType',
        ps: [{
            n: 'feature',
            mx: false,
            en: '_Feature',
            ti: '.AbstractFeatureType',
            t: 'er'
          }, {
            n: 'geometry',
            mx: false,
            dom: false,
            en: '_Geometry',
            ti: '.AbstractGeometryType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractMetaDataType',
        ps: [{
            n: 'content',
            col: true,
            dom: false,
            t: 'ers'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractGeneralParameterValueType'
      }, {
        ln: 'GridDomainType',
        bti: '.DomainSetType'
      }, {
        ln: 'IsolatedPropertyType',
        ps: [{
            n: 'node',
            en: 'Node',
            ti: '.NodeType'
          }, {
            n: 'edge',
            en: 'Edge',
            ti: '.EdgeType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DictionaryType',
        bti: '.DefinitionType',
        ps: [{
            n: 'dictionaryEntryOrIndirectEntry',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'indirectEntry',
                ti: '.IndirectEntryType'
              }, {
                en: 'dictionaryEntry',
                ti: '.DictionaryEntryType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'MultiCurveCoverageType',
        bti: '.AbstractDiscreteCoverageType'
      }, {
        ln: 'EllipsoidType',
        bti: '.EllipsoidBaseType',
        ps: [{
            n: 'ellipsoidID',
            col: true,
            ti: '.IdentifierType'
          }, {
            n: 'remarks',
            ti: '.StringOrRefType'
          }, {
            n: 'semiMajorAxis',
            ti: '.MeasureType'
          }, {
            n: 'secondDefiningParameter',
            ti: '.SecondDefiningParameterType'
          }]
      }, {
        ln: 'MultiGeometryType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'geometryMember',
            col: true,
            ti: '.GeometryPropertyType'
          }, {
            n: 'geometryMembers',
            ti: '.GeometryArrayPropertyType'
          }]
      }, {
        ln: 'ImageCRSType',
        bti: '.AbstractReferenceSystemType',
        ps: [{
            n: 'usesCartesianCS',
            ti: '.CartesianCSRefType'
          }, {
            n: 'usesObliqueCartesianCS',
            ti: '.ObliqueCartesianCSRefType'
          }, {
            n: 'usesImageDatum',
            ti: '.ImageDatumRefType'
          }]
      }, {
        ln: 'ImageDatumRefType',
        ps: [{
            n: 'imageDatum',
            en: 'ImageDatum',
            ti: '.ImageDatumType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CartesianCSRefType',
        ps: [{
            n: 'cartesianCS',
            en: 'CartesianCS',
            ti: '.CartesianCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'TimeClockPropertyType',
        ps: [{
            n: 'timeClock',
            en: 'TimeClock',
            ti: '.TimeClockType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'LinearRingType',
        bti: '.AbstractRingType',
        ps: [{
            n: 'posOrPointPropertyOrPointRep',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'pointRep',
                ti: '.PointPropertyType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }, {
                en: 'pos',
                ti: '.DirectPositionType'
              }],
            t: 'ers'
          }, {
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'coordinates',
            ti: '.CoordinatesType'
          }, {
            n: 'coord',
            col: true,
            ti: '.CoordType'
          }]
      }, {
        ln: 'CompositeSurfacePropertyType',
        ps: [{
            n: 'compositeSurface',
            en: 'CompositeSurface',
            ti: '.CompositeSurfaceType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CountPropertyType',
        bti: '.ValuePropertyType'
      }, {
        ln: 'CodeType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }]
      }, {
        ln: 'AbstractTimeSliceType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'validTime',
            ti: '.TimePrimitivePropertyType'
          }, {
            n: 'dataSource',
            ti: '.StringOrRefType'
          }]
      }, {
        ln: 'TemporalDatumBaseType',
        bti: '.AbstractDatumType'
      }, {
        ln: 'OrientableSurfaceType',
        bti: '.AbstractSurfaceType',
        ps: [{
            n: 'baseSurface',
            ti: '.SurfacePropertyType'
          }, {
            n: 'orientation',
            an: {
              lp: 'orientation'
            },
            t: 'a'
          }]
      }, {
        ln: 'MultiPointType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'pointMember',
            col: true,
            ti: '.PointPropertyType'
          }, {
            n: 'pointMembers',
            ti: '.PointArrayPropertyType'
          }]
      }, {
        ln: 'RectifiedGridType',
        bti: '.GridType',
        ps: [{
            n: 'origin',
            ti: '.PointPropertyType'
          }, {
            n: 'offsetVector',
            col: true,
            ti: '.VectorType'
          }]
      }, {
        ln: 'AbstractGriddedSurfaceType.Row',
        tn: null,
        ps: [{
            n: 'posList',
            ti: '.DirectPositionListType'
          }, {
            n: 'geometricPositionGroup',
            col: true,
            etis: [{
                en: 'pos',
                ti: '.DirectPositionType'
              }, {
                en: 'pointProperty',
                ti: '.PointPropertyType'
              }],
            t: 'es'
          }]
      }, {
        ln: 'MeasureType',
        ps: [{
            n: 'value',
            ti: 'Double',
            t: 'v'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'MetaDataPropertyType',
        ps: [{
            n: 'any',
            mx: false,
            t: 'ae'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ValueArrayType',
        bti: '.CompositeValueType',
        ps: [{
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'GeneralTransformationRefType',
        ps: [{
            n: 'generalTransformation',
            mx: false,
            dom: false,
            en: '_GeneralTransformation',
            ti: '.AbstractGeneralTransformationType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GeometricPrimitivePropertyType',
        ps: [{
            n: 'geometricPrimitive',
            mx: false,
            dom: false,
            en: '_GeometricPrimitive',
            ti: '.AbstractGeometricPrimitiveType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'DerivedCRSType',
        bti: '.AbstractGeneralDerivedCRSType',
        ps: [{
            n: 'derivedCRSType',
            ti: '.DerivedCRSTypeType'
          }, {
            n: 'usesCS',
            ti: '.CoordinateSystemRefType'
          }]
      }, {
        ln: 'CylindricalCSRefType',
        ps: [{
            n: 'cylindricalCS',
            en: 'CylindricalCS',
            ti: '.CylindricalCSType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'BoundingShapeType',
        ps: [{
            n: 'envelope',
            mx: false,
            dom: false,
            en: 'Envelope',
            ti: '.EnvelopeType',
            t: 'er'
          }, {
            n: '_null',
            en: 'Null',
            ti: {
              t: 'l'
            }
          }]
      }, {
        ln: 'MultiCurveType',
        bti: '.AbstractGeometricAggregateType',
        ps: [{
            n: 'curveMember',
            col: true,
            ti: '.CurvePropertyType'
          }, {
            n: 'curveMembers',
            ti: '.CurveArrayPropertyType'
          }]
      }, {
        ln: 'ParameterValueGroupType',
        bti: '.AbstractGeneralParameterValueType',
        ps: [{
            n: 'includesValue',
            col: true,
            ti: '.AbstractGeneralParameterValueType'
          }, {
            n: 'valuesOfGroup',
            ti: '.OperationParameterGroupRefType'
          }]
      }, {
        ln: 'TimeInstantType',
        bti: '.AbstractTimeGeometricPrimitiveType',
        ps: [{
            n: 'timePosition',
            ti: '.TimePositionType'
          }]
      }, {
        ln: 'OperationParameterGroupRefType',
        ps: [{
            n: 'operationParameterGroup',
            en: 'OperationParameterGroup',
            ti: '.OperationParameterGroupType'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'CovarianceElementType',
        ps: [{
            n: 'rowIndex',
            ti: 'Integer'
          }, {
            n: 'columnIndex',
            ti: 'Integer'
          }, {
            n: 'covariance',
            ti: 'Double'
          }]
      }, {
        ln: 'OperationRefType',
        ps: [{
            n: 'operation',
            mx: false,
            dom: false,
            en: '_Operation',
            ti: '.AbstractCoordinateOperationType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'AbstractFeatureType',
        bti: '.AbstractGMLType',
        ps: [{
            n: 'boundedBy',
            ti: '.BoundingShapeType'
          }, {
            n: 'location',
            mx: false,
            dom: false,
            ti: '.LocationPropertyType',
            t: 'er'
          }]
      }, {
        ln: 'MultiGeometryPropertyType',
        ps: [{
            n: 'geometricAggregate',
            mx: false,
            dom: false,
            en: '_GeometricAggregate',
            ti: '.AbstractGeometricAggregateType',
            t: 'er'
          }, {
            n: 'remoteSchema',
            an: {
              lp: 'remoteSchema',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        t: 'enum',
        ln: 'CurveInterpolationType',
        vs: ['linear', 'geodesic', 'circularArc3Points', 'circularArc2PointWithBulge', 'circularArcCenterPointWithRadius', 'elliptical', 'clothoid', 'conic', 'polynomialSpline', 'cubicSpline', 'rationalSpline']
      }, {
        t: 'enum',
        ln: 'FileValueModelType',
        vs: ['Record Interleaved']
      }, {
        t: 'enum',
        ln: 'QueryGrammarEnumeration',
        vs: ['xpath', 'xquery', 'other']
      }, {
        t: 'enum',
        ln: 'SignType',
        vs: ['-', '+']
      }, {
        t: 'enum',
        ln: 'DrawingTypeType',
        vs: ['POLYLINE', 'ORTHOGONAL']
      }, {
        t: 'enum',
        ln: 'SequenceRuleNames',
        vs: ['Linear', 'Boustrophedonic', 'Cantor-diagonal', 'Spiral', 'Morton', 'Hilbert']
      }, {
        t: 'enum',
        ln: 'SymbolTypeEnumeration',
        vs: ['svg', 'xpath', 'other']
      }, {
        t: 'enum',
        ln: 'LineTypeType',
        vs: ['STRAIGHT', 'BENT']
      }, {
        t: 'enum',
        ln: 'KnotTypesType',
        vs: ['uniform', 'quasiUniform', 'piecewiseBezier']
      }, {
        t: 'enum',
        ln: 'AesheticCriteriaType',
        vs: ['MIN_CROSSINGS', 'MIN_AREA', 'MIN_BENDS', 'MAX_BENDS', 'UNIFORM_BENDS', 'MIN_SLOPES', 'MIN_EDGE_LENGTH', 'MAX_EDGE_LENGTH', 'UNIFORM_EDGE_LENGTH', 'MAX_ANGULAR_RESOLUTION', 'MIN_ASPECT_RATIO', 'MAX_SYMMETRIES']
      }, {
        t: 'enum',
        ln: 'TimeIndeterminateValueType',
        vs: ['after', 'before', 'now', 'unknown']
      }, {
        t: 'enum',
        ln: 'SuccessionType',
        vs: ['substitution', 'division', 'fusion', 'initiation']
      }, {
        t: 'enum',
        ln: 'CompassPointEnumeration',
        vs: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      }, {
        t: 'enum',
        ln: 'SurfaceInterpolationType',
        vs: ['none', 'planar', 'spherical', 'elliptical', 'conic', 'tin', 'parametricCurve', 'polynomialSpline', 'rationalSpline', 'triangulatedSpline']
      }, {
        t: 'enum',
        ln: 'IncrementOrder',
        vs: ['+x+y', '+y+x', '+x-y', '-x-y']
      }, {
        t: 'enum',
        ln: 'GraphTypeType',
        vs: ['TREE', 'BICONNECTED']
      }],
    eis: [{
        en: 'srsName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'parameterID',
        ti: '.IdentifierType'
      }, {
        en: 'lineStringMember',
        ti: '.LineStringPropertyType'
      }, {
        en: 'CountList',
        ti: {
          t: 'l'
        }
      }, {
        en: 'metaDataProperty',
        ti: '.MetaDataPropertyType'
      }, {
        en: 'coordinateSystemAxisRef',
        ti: '.CoordinateSystemAxisRefType'
      }, {
        en: '_GeneralOperationParameter',
        ti: '.AbstractGeneralOperationParameterType',
        sh: 'Definition'
      }, {
        en: 'Sphere',
        ti: '.SphereType',
        sh: '_GriddedSurface'
      }, {
        en: 'modifiedCoordinate',
        ti: 'Integer'
      }, {
        en: 'inverseFlattening',
        ti: '.MeasureType'
      }, {
        en: 'surfaceProperty',
        ti: '.SurfacePropertyType'
      }, {
        en: 'valueList',
        ti: '.MeasureListType'
      }, {
        en: 'RectifiedGridCoverage',
        ti: '.RectifiedGridCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: '_DiscreteCoverage',
        ti: '.AbstractDiscreteCoverageType',
        sh: '_Coverage'
      }, {
        en: 'member',
        ti: '.AssociationType'
      }, {
        en: 'TopoCurve',
        ti: '.TopoCurveType'
      }, {
        en: 'TimeOrdinalReferenceSystem',
        ti: '.TimeOrdinalReferenceSystemType',
        sh: '_TimeReferenceSystem'
      }, {
        en: 'MultiSurface',
        ti: '.MultiSurfaceType',
        sh: '_GeometricAggregate'
      }, {
        en: 'includesParameter',
        ti: '.AbstractGeneralOperationParameterRefType'
      }, {
        en: 'Curve',
        ti: '.CurveType',
        sh: '_Curve'
      }, {
        en: 'maximumOccurs',
        ti: 'Integer'
      }, {
        en: 'graphStyle',
        ti: '.GraphStylePropertyType'
      }, {
        en: 'definedByConversion',
        ti: '.GeneralConversionRefType'
      }, {
        en: 'Rectangle',
        ti: '.RectangleType',
        sh: '_SurfacePatch'
      }, {
        en: 'coordinates',
        ti: '.CoordinatesType'
      }, {
        en: 'subComplex',
        ti: '.TopoComplexMemberType'
      }, {
        en: 'MultiPoint',
        ti: '.MultiPointType',
        sh: '_GeometricAggregate'
      }, {
        en: 'CompositeSurface',
        ti: '.CompositeSurfaceType',
        sh: '_Surface'
      }, {
        en: 'DirectedObservationAtDistance',
        ti: '.DirectedObservationAtDistanceType',
        sh: 'DirectedObservation'
      }, {
        en: 'catalogSymbol',
        ti: '.CodeType'
      }, {
        en: 'BooleanList',
        ti: {
          t: 'l'
        }
      }, {
        en: 'referenceSystemRef',
        ti: '.ReferenceSystemRefType'
      }, {
        en: '_TimeGeometricPrimitive',
        ti: '.AbstractTimeGeometricPrimitiveType',
        sh: '_TimePrimitive'
      }, {
        en: 'TimeTopologyComplex',
        ti: '.TimeTopologyComplexType',
        sh: '_TimeComplex'
      }, {
        en: 'operationVersion'
      }, {
        en: 'cartesianCSRef',
        ti: '.CartesianCSRefType'
      }, {
        en: '_association',
        ti: '.AssociationType'
      }, {
        en: 'solidMembers',
        ti: '.SolidArrayPropertyType'
      }, {
        en: 'Quantity',
        ti: '.MeasureType'
      }, {
        en: 'Bag',
        ti: '.BagType',
        sh: '_GML'
      }, {
        en: 'Triangle',
        ti: '.TriangleType',
        sh: '_SurfacePatch'
      }, {
        en: 'Clothoid',
        ti: '.ClothoidType',
        sh: '_CurveSegment'
      }, {
        en: 'Transformation',
        ti: '.TransformationType',
        sh: '_GeneralTransformation'
      }, {
        en: 'coordinateSystemRef',
        ti: '.CoordinateSystemRefType'
      }, {
        en: 'gridDomain',
        ti: '.GridDomainType',
        sh: 'domainSet'
      }, {
        en: 'TopoComplex',
        ti: '.TopoComplexType',
        sh: '_Topology'
      }, {
        en: '_ContinuousCoverage',
        ti: '.AbstractContinuousCoverageType',
        sh: '_Coverage'
      }, {
        en: 'MultiCurve',
        ti: '.MultiCurveType',
        sh: '_GeometricAggregate'
      }, {
        en: 'Observation',
        ti: '.ObservationType',
        sh: '_Feature'
      }, {
        en: 'boundedBy',
        ti: '.BoundingShapeType'
      }, {
        en: '_ImplicitGeometry',
        ti: '.AbstractGeometryType',
        sh: '_Geometry'
      }, {
        en: 'operationRef',
        ti: '.OperationRefType'
      }, {
        en: 'history',
        ti: '.HistoryPropertyType'
      }, {
        en: 'temporalDatumRef',
        ti: '.TemporalDatumRefType'
      }, {
        en: 'imageCRSRef',
        ti: '.ImageCRSRefType'
      }, {
        en: 'DirectedObservation',
        ti: '.DirectedObservationType',
        sh: 'Observation'
      }, {
        en: 'featureStyle',
        ti: '.FeatureStylePropertyType'
      }, {
        en: '_strictAssociation',
        ti: '.AssociationType'
      }, {
        en: 'boundingBox',
        ti: '.EnvelopeType'
      }, {
        en: 'targetCRS',
        ti: '.CRSRefType'
      }, {
        en: 'VerticalCRS',
        ti: '.VerticalCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'maximalComplex',
        ti: '.TopoComplexMemberType'
      }, {
        en: 'valueProperty',
        ti: '.ValuePropertyType'
      }, {
        en: 'SphericalCS',
        ti: '.SphericalCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'temporalCRSRef',
        ti: '.TemporalCRSRefType'
      }, {
        en: 'CountExtent',
        ti: {
          t: 'l'
        }
      }, {
        en: 'geometryStyle',
        ti: '.GeometryStylePropertyType'
      }, {
        en: 'polygonMember',
        ti: '.PolygonPropertyType'
      }, {
        en: 'surfaceMembers',
        ti: '.SurfaceArrayPropertyType'
      }, {
        en: '_generalParameterValue',
        ti: '.AbstractGeneralParameterValueType'
      }, {
        en: 'AffinePlacement',
        ti: '.AffinePlacementType'
      }, {
        en: 'vector',
        ti: '.VectorType'
      }, {
        en: 'track',
        ti: '.TrackType',
        sh: 'history'
      }, {
        en: 'ellipsoidName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'centerOf',
        ti: '.PointPropertyType'
      }, {
        en: '_TopoPrimitive',
        ti: '.AbstractTopoPrimitiveType',
        sh: '_Topology'
      }, {
        en: 'usesOperation',
        ti: '.OperationRefType'
      }, {
        en: 'pointProperty',
        ti: '.PointPropertyType'
      }, {
        en: 'csID',
        ti: '.IdentifierType'
      }, {
        en: 'multiSurfaceDomain',
        ti: '.MultiSurfaceDomainType',
        sh: 'domainSet'
      }, {
        en: '_ParametricCurveSurface',
        ti: '.AbstractParametricCurveSurfaceType',
        sh: '_SurfacePatch'
      }, {
        en: 'groupID',
        ti: '.IdentifierType'
      }, {
        en: 'CategoryList',
        ti: '.CodeOrNullListType'
      }, {
        en: '_Operation',
        ti: '.AbstractCoordinateOperationType',
        sh: '_SingleOperation'
      }, {
        en: 'surfaceMember',
        ti: '.SurfacePropertyType'
      }, {
        en: 'labelStyle',
        ti: '.LabelStylePropertyType'
      }, {
        en: 'baseSurface',
        ti: '.SurfacePropertyType'
      }, {
        en: 'transformationRef',
        ti: '.TransformationRefType'
      }, {
        en: 'TimeCoordinateSystem',
        ti: '.TimeCoordinateSystemType',
        sh: '_TimeReferenceSystem'
      }, {
        en: 'UnitDefinition',
        ti: '.UnitDefinitionType',
        sh: 'Definition'
      }, {
        en: 'TopoSolid',
        ti: '.TopoSolidType',
        sh: '_TopoPrimitive'
      }, {
        en: 'CategoryExtent',
        ti: '.CategoryExtentType'
      }, {
        en: 'pos',
        ti: '.DirectPositionType'
      }, {
        en: 'CartesianCS',
        ti: '.CartesianCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'featureMembers',
        ti: '.FeatureArrayPropertyType'
      }, {
        en: 'ArcByBulge',
        ti: '.ArcByBulgeType',
        sh: 'ArcStringByBulge'
      }, {
        en: 'Node',
        ti: '.NodeType',
        sh: '_TopoPrimitive'
      }, {
        en: 'multiSolidDomain',
        ti: '.MultiSolidDomainType',
        sh: 'domainSet'
      }, {
        en: 'PrimeMeridian',
        ti: '.PrimeMeridianType',
        sh: 'Definition'
      }, {
        en: 'surfaceArrayProperty',
        ti: '.SurfaceArrayPropertyType'
      }, {
        en: 'axisAbbrev',
        ti: '.CodeType'
      }, {
        en: 'ellipsoidID',
        ti: '.IdentifierType'
      }, {
        en: 'cylindricalCSRef',
        ti: '.CylindricalCSRefType'
      }, {
        en: 'baseCurve',
        ti: '.CurvePropertyType'
      }, {
        en: 'valueComponents',
        ti: '.ValueArrayPropertyType'
      }, {
        en: 'pointMember',
        ti: '.PointPropertyType'
      }, {
        en: 'ellipsoidRef',
        ti: '.EllipsoidRefType'
      }, {
        en: 'polygonProperty',
        ti: '.PolygonPropertyType'
      }, {
        en: 'usesObliqueCartesianCS',
        ti: '.ObliqueCartesianCSRefType'
      }, {
        en: 'topoSurfaceProperty',
        ti: '.TopoSurfacePropertyType'
      }, {
        en: 'MultiPolygon',
        ti: '.MultiPolygonType',
        sh: '_GeometricAggregate'
      }, {
        en: 'relativeInternalPositionalAccuracy',
        ti: '.RelativeInternalPositionalAccuracyType',
        sh: '_positionalAccuracy'
      }, {
        en: 'Cone',
        ti: '.ConeType',
        sh: '_GriddedSurface'
      }, {
        en: 'usesTemporalCS',
        ti: '.TemporalCSRefType'
      }, {
        en: 'verticalDatumType',
        ti: '.VerticalDatumTypeType'
      }, {
        en: 'ProjectedCRS',
        ti: '.ProjectedCRSType',
        sh: '_GeneralDerivedCRS'
      }, {
        en: 'DerivedCRS',
        ti: '.DerivedCRSType',
        sh: '_GeneralDerivedCRS'
      }, {
        en: 'realizationEpoch',
        ti: 'Calendar'
      }, {
        en: '_Surface',
        ti: '.AbstractSurfaceType',
        sh: '_GeometricPrimitive'
      }, {
        en: 'includesValue',
        ti: '.AbstractGeneralParameterValueType',
        sh: '_generalParameterValue'
      }, {
        en: 'lineStringProperty',
        ti: '.LineStringPropertyType'
      }, {
        en: 'TimeInstant',
        ti: '.TimeInstantType',
        sh: '_TimeGeometricPrimitive'
      }, {
        en: 'defaultStyle',
        ti: '.DefaultStylePropertyType'
      }, {
        en: 'ellipsoidalCSRef',
        ti: '.EllipsoidalCSRefType'
      }, {
        en: 'OrientableCurve',
        ti: '.OrientableCurveType',
        sh: '_Curve'
      }, {
        en: 'origin',
        ti: 'Calendar'
      }, {
        en: '_reference',
        ti: '.ReferenceType'
      }, {
        en: 'minimumOccurs',
        ti: 'Integer'
      }, {
        en: 'usesImageDatum',
        ti: '.ImageDatumRefType'
      }, {
        en: 'usesEngineeringDatum',
        ti: '.EngineeringDatumRefType'
      }, {
        en: 'stringValue'
      }, {
        en: 'definitionRef',
        ti: '.ReferenceType'
      }, {
        en: 'validTime',
        ti: '.TimePrimitivePropertyType'
      }, {
        en: 'TopoPoint',
        ti: '.TopoPointType'
      }, {
        en: 'parameterValueGroup',
        ti: '.ParameterValueGroupType',
        sh: '_generalParameterValue'
      }, {
        en: '_Topology',
        ti: '.AbstractTopologyType',
        sh: '_GML'
      }, {
        en: 'OrientableSurface',
        ti: '.OrientableSurfaceType',
        sh: '_Surface'
      }, {
        en: 'featureMember',
        ti: '.FeaturePropertyType'
      }, {
        en: 'singleOperationRef',
        ti: '.SingleOperationRefType'
      }, {
        en: 'targetDimensions',
        ti: 'Integer'
      }, {
        en: 'booleanValue',
        ti: 'Boolean'
      }, {
        en: 'rowIndex',
        ti: 'Integer'
      }, {
        en: 'validArea',
        ti: '.ExtentType'
      }, {
        en: 'TopologyStyle',
        ti: '.TopologyStyleType',
        sh: '_GML'
      }, {
        en: 'description',
        ti: '.StringOrRefType'
      }, {
        en: 'PolygonPatch',
        ti: '.PolygonPatchType',
        sh: '_SurfacePatch'
      }, {
        en: 'usesSingleOperation',
        ti: '.SingleOperationRefType'
      }, {
        en: 'includesElement',
        ti: '.CovarianceElementType'
      }, {
        en: 'valueOfParameter',
        ti: '.OperationParameterRefType'
      }, {
        en: 'File',
        ti: '.FileType'
      }, {
        en: 'directedTopoSolid',
        ti: '.DirectedTopoSolidPropertyType'
      }, {
        en: 'obliqueCartesianCSRef',
        ti: '.ObliqueCartesianCSRefType'
      }, {
        en: 'multiGeometryProperty',
        ti: '.MultiGeometryPropertyType'
      }, {
        en: 'usesGeodeticDatum',
        ti: '.GeodeticDatumRefType'
      }, {
        en: '_Ring',
        ti: '.AbstractRingType',
        sh: '_Geometry'
      }, {
        en: 'BSpline',
        ti: '.BSplineType',
        sh: '_CurveSegment'
      }, {
        en: 'dataSource',
        ti: '.StringOrRefType'
      }, {
        en: 'datumName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'rectifiedGridDomain',
        ti: '.RectifiedGridDomainType',
        sh: 'domainSet'
      }, {
        en: '_SurfacePatch',
        ti: '.AbstractSurfacePatchType'
      }, {
        en: 'generalConversionRef',
        ti: '.GeneralConversionRefType'
      }, {
        en: 'verticalCSRef',
        ti: '.VerticalCSRefType'
      }, {
        en: 'TimeCalendar',
        ti: '.TimeCalendarType',
        sh: '_TimeReferenceSystem'
      }, {
        en: 'OperationParameter',
        ti: '.OperationParameterType',
        sh: '_GeneralOperationParameter'
      }, {
        en: 'direction',
        ti: '.DirectionPropertyType'
      }, {
        en: '_Geometry',
        ti: '.AbstractGeometryType',
        sh: '_GML'
      }, {
        en: 'roughConversionToPreferredUnit',
        ti: '.ConversionToPreferredUnitType'
      }, {
        en: 'DerivedUnit',
        ti: '.DerivedUnitType',
        sh: 'UnitDefinition'
      }, {
        en: 'CubicSpline',
        ti: '.CubicSplineType',
        sh: '_CurveSegment'
      }, {
        en: 'LabelExpression',
        sc: '.LabelType'
      }, {
        en: 'Point',
        ti: '.PointType',
        sh: '_GeometricPrimitive'
      }, {
        en: 'usesEllipsoid',
        ti: '.EllipsoidRefType'
      }, {
        en: 'result',
        ti: '.MeasureType'
      }, {
        en: 'usesVerticalCS',
        ti: '.VerticalCSRefType'
      }, {
        en: 'multiCenterLineOf',
        ti: '.MultiCurvePropertyType'
      }, {
        en: 'DefinitionCollection',
        ti: '.DictionaryType',
        sh: 'Definition'
      }, {
        en: 'geocentricCRSRef',
        ti: '.GeocentricCRSRefType'
      }, {
        en: 'crsRef',
        ti: '.CRSRefType'
      }, {
        en: 'anchorPoint',
        ti: '.CodeType'
      }, {
        en: 'ArcString',
        ti: '.ArcStringType',
        sh: '_CurveSegment'
      }, {
        en: 'multiPointProperty',
        ti: '.MultiPointPropertyType'
      }, {
        en: 'using',
        ti: '.FeaturePropertyType'
      }, {
        en: '_TimeComplex',
        ti: '.AbstractTimeComplexType',
        sh: '_TimeObject'
      }, {
        en: 'Style',
        ti: '.StyleType',
        sh: '_Style'
      }, {
        en: 'LabelStyle',
        ti: '.LabelStyleType',
        sh: '_GML'
      }, {
        en: 'Edge',
        ti: '.EdgeType',
        sh: '_TopoPrimitive'
      }, {
        en: 'angle',
        ti: '.MeasureType'
      }, {
        en: 'curveMember',
        ti: '.CurvePropertyType'
      }, {
        en: 'meridianID',
        ti: '.IdentifierType'
      }, {
        en: 'Boolean',
        ti: 'Boolean'
      }, {
        en: 'PolyhedralSurface',
        ti: '.PolyhedralSurfaceType',
        sh: 'Surface'
      }, {
        en: 'multiCenterOf',
        ti: '.MultiPointPropertyType'
      }, {
        en: 'usesValue',
        ti: '.ParameterValueType'
      }, {
        en: 'superComplex',
        ti: '.TopoComplexMemberType'
      }, {
        en: 'timeInterval',
        ti: '.TimeIntervalLengthType'
      }, {
        en: 'minutes',
        ti: 'Int'
      }, {
        en: 'edgeOf',
        ti: '.CurvePropertyType'
      }, {
        en: 'usesAxis',
        ti: '.CoordinateSystemAxisRefType'
      }, {
        en: 'TimeOrdinalEra',
        ti: '.TimeOrdinalEraType'
      }, {
        en: 'usesSphericalCS',
        ti: '.SphericalCSRefType'
      }, {
        en: 'sourceDimensions',
        ti: 'Integer'
      }, {
        en: 'duration',
        ti: 'Duration'
      }, {
        en: 'subject',
        ti: '.TargetPropertyType',
        sh: 'target'
      }, {
        en: 'parameterValue',
        ti: '.ParameterValueType',
        sh: '_generalParameterValue'
      }, {
        en: 'curveArrayProperty',
        ti: '.CurveArrayPropertyType'
      }, {
        en: '_Style',
        ti: '.AbstractStyleType',
        sh: '_GML'
      }, {
        en: 'Grid',
        ti: '.GridType',
        sh: '_ImplicitGeometry'
      }, {
        en: 'Cylinder',
        ti: '.CylinderType',
        sh: '_GriddedSurface'
      }, {
        en: 'GridCoverage',
        ti: '.GridCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: 'target',
        ti: '.TargetPropertyType'
      }, {
        en: 'Face',
        ti: '.FaceType',
        sh: '_TopoPrimitive'
      }, {
        en: 'TopoSurface',
        ti: '.TopoSurfaceType'
      }, {
        en: 'usesMethod',
        ti: '.OperationMethodRefType'
      }, {
        en: 'location',
        ti: '.LocationPropertyType'
      }, {
        en: 'geodeticDatumRef',
        ti: '.GeodeticDatumRefType'
      }, {
        en: 'isolated',
        ti: '.IsolatedPropertyType'
      }, {
        en: 'FeatureStyle',
        ti: '.FeatureStyleType',
        sh: '_GML'
      }, {
        en: 'valueFile'
      }, {
        en: 'Tin',
        ti: '.TinType',
        sh: 'TriangulatedSurface'
      }, {
        en: 'methodName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'LineStringSegment',
        ti: '.LineStringSegmentType',
        sh: '_CurveSegment'
      }, {
        en: 'usesCS',
        ti: '.CoordinateSystemRefType'
      }, {
        en: 'verticalExtent',
        ti: '.EnvelopeType'
      }, {
        en: 'pixelInCell',
        ti: '.PixelInCellType'
      }, {
        en: 'CompoundCRS',
        ti: '.CompoundCRSType',
        sh: '_CRS'
      }, {
        en: 'topoVolumeProperty',
        ti: '.TopoVolumePropertyType'
      }, {
        en: 'tupleList',
        ti: '.CoordinatesType'
      }, {
        en: 'PolarCS',
        ti: '.PolarCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'compoundCRSRef',
        ti: '.CompoundCRSRefType'
      }, {
        en: 'datumRef',
        ti: '.DatumRefType'
      }, {
        en: 'CylindricalCS',
        ti: '.CylindricalCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'VerticalCS',
        ti: '.VerticalCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'MultiSurfaceCoverage',
        ti: '.MultiSurfaceCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: 'LocationString',
        ti: '.StringOrRefType'
      }, {
        en: 'IndexMap',
        ti: '.IndexMapType',
        sh: 'GridFunction'
      }, {
        en: 'Envelope',
        ti: '.EnvelopeType'
      }, {
        en: '_FeatureCollection',
        ti: '.AbstractFeatureCollectionType',
        sh: '_Feature'
      }, {
        en: '_CurveSegment',
        ti: '.AbstractCurveSegmentType'
      }, {
        en: 'coordinateReferenceSystemRef',
        ti: '.CoordinateReferenceSystemRefType'
      }, {
        en: 'MultiSolid',
        ti: '.MultiSolidType',
        sh: '_GeometricAggregate'
      }, {
        en: 'centerLineOf',
        ti: '.CurvePropertyType'
      }, {
        en: 'ConcatenatedOperation',
        ti: '.ConcatenatedOperationType',
        sh: '_CoordinateOperation'
      }, {
        en: 'dmsAngle',
        ti: '.DMSAngleType'
      }, {
        en: 'resultOf',
        ti: '.AssociationType'
      }, {
        en: '_GeometricPrimitive',
        ti: '.AbstractGeometricPrimitiveType',
        sh: '_Geometry'
      }, {
        en: 'BaseUnit',
        ti: '.BaseUnitType',
        sh: 'UnitDefinition'
      }, {
        en: 'definitionMember',
        ti: '.DictionaryEntryType',
        sh: 'dictionaryEntry'
      }, {
        en: 'patches',
        ti: '.SurfacePatchArrayPropertyType'
      }, {
        en: 'UserDefinedCS',
        ti: '.UserDefinedCSType',
        sh: '_CoordinateSystem'
      }, {
        en: '_MetaData',
        ti: '.AbstractMetaDataType',
        sh: '_Object'
      }, {
        en: 'quantityType',
        ti: '.StringOrRefType'
      }, {
        en: 'axisDirection',
        ti: '.CodeType'
      }, {
        en: 'Geodesic',
        ti: '.GeodesicType',
        sh: 'GeodesicString'
      }, {
        en: 'CoordinateSystemAxis',
        ti: '.CoordinateSystemAxisType',
        sh: 'Definition'
      }, {
        en: 'extentOf',
        ti: '.SurfacePropertyType'
      }, {
        en: 'userDefinedCSRef',
        ti: '.UserDefinedCSRefType'
      }, {
        en: 'verticalDatumRef',
        ti: '.VerticalDatumRefType'
      }, {
        en: 'usesPrimeMeridian',
        ti: '.PrimeMeridianRefType'
      }, {
        en: 'name',
        ti: '.CodeType'
      }, {
        en: 'passThroughOperationRef',
        ti: '.PassThroughOperationRefType'
      }, {
        en: 'GenericMetaData',
        ti: '.GenericMetaDataType',
        sh: '_MetaData'
      }, {
        en: 'imageDatumRef',
        ti: '.ImageDatumRefType'
      }, {
        en: 'TimeClock',
        ti: '.TimeClockType',
        sh: '_TimeReferenceSystem'
      }, {
        en: 'baseCRS',
        ti: '.CoordinateReferenceSystemRefType'
      }, {
        en: 'ObliqueCartesianCS',
        ti: '.ObliqueCartesianCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'operationParameterRef',
        ti: '.OperationParameterRefType'
      }, {
        en: 'includesCRS',
        ti: '.CoordinateReferenceSystemRefType'
      }, {
        en: 'decimalMinutes',
        ti: 'Decimal'
      }, {
        en: 'multiSurfaceProperty',
        ti: '.MultiSurfacePropertyType'
      }, {
        en: 'curveMembers',
        ti: '.CurveArrayPropertyType'
      }, {
        en: 'parameterName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'ImageCRS',
        ti: '.ImageCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: '_TimeObject',
        ti: '.AbstractTimeObjectType',
        sh: '_GML'
      }, {
        en: 'interior',
        ti: '.AbstractRingPropertyType'
      }, {
        en: 'RectifiedGrid',
        ti: '.RectifiedGridType',
        sh: '_ImplicitGeometry'
      }, {
        en: 'exterior',
        ti: '.AbstractRingPropertyType'
      }, {
        en: '_SingleOperation',
        ti: '.AbstractCoordinateOperationType',
        sh: '_CoordinateOperation'
      }, {
        en: 'LinearCS',
        ti: '.LinearCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'GeometricComplex',
        ti: '.GeometricComplexType',
        sh: '_Geometry'
      }, {
        en: 'GeographicCRS',
        ti: '.GeographicCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'GeodesicString',
        ti: '.GeodesicStringType',
        sh: '_CurveSegment'
      }, {
        en: 'valueComponent',
        ti: '.ValuePropertyType'
      }, {
        en: 'posList',
        ti: '.DirectPositionListType'
      }, {
        en: '_Coverage',
        ti: '.AbstractCoverageType',
        sh: '_Feature'
      }, {
        en: '_GeneralTransformation',
        ti: '.AbstractGeneralTransformationType',
        sh: '_Operation'
      }, {
        en: 'innerBoundaryIs',
        ti: '.AbstractRingPropertyType',
        sh: 'interior'
      }, {
        en: 'operationParameterGroupRef',
        ti: '.OperationParameterRefType'
      }, {
        en: 'Ring',
        ti: '.RingType',
        sh: '_Ring'
      }, {
        en: 'temporalExtent',
        ti: '.TimePeriodType'
      }, {
        en: 'sphericalCSRef',
        ti: '.SphericalCSRefType'
      }, {
        en: 'outerBoundaryIs',
        ti: '.AbstractRingPropertyType',
        sh: 'exterior'
      }, {
        en: 'MultiLineString',
        ti: '.MultiLineStringType',
        sh: '_GeometricAggregate'
      }, {
        en: 'multiPointDomain',
        ti: '.MultiPointDomainType',
        sh: 'domainSet'
      }, {
        en: 'geometryMembers',
        ti: '.GeometryArrayPropertyType'
      }, {
        en: 'MappingRule',
        ti: '.StringOrRefType'
      }, {
        en: 'linearCSRef',
        ti: '.LinearCSRefType'
      }, {
        en: 'multiCurveProperty',
        ti: '.MultiCurvePropertyType'
      }, {
        en: 'multiSolidProperty',
        ti: '.MultiSolidPropertyType'
      }, {
        en: 'absoluteExternalPositionalAccuracy',
        ti: '.AbsoluteExternalPositionalAccuracyType',
        sh: '_positionalAccuracy'
      }, {
        en: 'QuantityExtent',
        ti: '.QuantityExtentType'
      }, {
        en: 'multiCoverage',
        ti: '.MultiSurfacePropertyType'
      }, {
        en: 'semiMinorAxis',
        ti: '.MeasureType'
      }, {
        en: 'topoPointProperty',
        ti: '.TopoPointPropertyType'
      }, {
        en: 'version'
      }, {
        en: 'rangeParameters',
        ti: '.RangeParametersType'
      }, {
        en: 'container',
        ti: '.ContainerPropertyType'
      }, {
        en: 'pointArrayProperty',
        ti: '.PointArrayPropertyType'
      }, {
        en: 'GeocentricCRS',
        ti: '.GeocentricCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'derivedCRSRef',
        ti: '.DerivedCRSRefType'
      }, {
        en: 'secondDefiningParameter',
        ti: '.SecondDefiningParameterType'
      }, {
        en: 'usesTemporalDatum',
        ti: '.TemporalDatumRefType'
      }, {
        en: 'coord',
        ti: '.CoordType'
      }, {
        en: 'MultiSolidCoverage',
        ti: '.MultiSolidCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: 'topoPrimitiveMember',
        ti: '.TopoPrimitiveMemberType'
      }, {
        en: 'TimePeriod',
        ti: '.TimePeriodType',
        sh: '_TimeGeometricPrimitive'
      }, {
        en: 'priorityLocation',
        ti: '.PriorityLocationPropertyType',
        sh: 'location'
      }, {
        en: 'EngineeringDatum',
        ti: '.EngineeringDatumType',
        sh: '_Datum'
      }, {
        en: 'geographicCRSRef',
        ti: '.GeographicCRSRefType'
      }, {
        en: 'doubleOrNullTupleList',
        ti: {
          t: 'l'
        }
      }, {
        en: 'TopoVolume',
        ti: '.TopoVolumeType'
      }, {
        en: 'TemporalCS',
        ti: '.TemporalCSType',
        sh: '_CoordinateSystem'
      }, {
        en: '_TimeReferenceSystem',
        ti: '.AbstractTimeReferenceSystemType',
        sh: 'Definition'
      }, {
        en: 'trianglePatches',
        ti: '.TrianglePatchArrayPropertyType',
        sh: 'patches'
      }, {
        en: 'csName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: '_TimeSlice',
        ti: '.AbstractTimeSliceType',
        sh: '_GML'
      }, {
        en: 'rangeSet',
        ti: '.RangeSetType'
      }, {
        en: 'unitOfMeasure',
        ti: '.UnitOfMeasureType'
      }, {
        en: 'GeometryStyle',
        ti: '.GeometryStyleType',
        sh: '_GML'
      }, {
        en: 'usesParameter',
        ti: '.AbstractGeneralOperationParameterRefType'
      }, {
        en: 'datumID',
        ti: '.IdentifierType'
      }, {
        en: 'topologyStyle',
        ti: '.TopologyStylePropertyType'
      }, {
        en: 'covarianceMatrix',
        ti: '.CovarianceMatrixType',
        sh: '_positionalAccuracy'
      }, {
        en: 'Solid',
        ti: '.SolidType',
        sh: '_Solid'
      }, {
        en: '_Feature',
        ti: '.AbstractFeatureType',
        sh: '_GML'
      }, {
        en: 'valuesOfGroup',
        ti: '.OperationParameterGroupRefType'
      }, {
        en: 'multiCurveDomain',
        ti: '.MultiCurveDomainType',
        sh: 'domainSet'
      }, {
        en: '_positionalAccuracy',
        ti: '.AbstractPositionalAccuracyType'
      }, {
        en: 'ValueArray',
        ti: '.ValueArrayType',
        sh: 'CompositeValue'
      }, {
        en: 'multiExtentOf',
        ti: '.MultiSurfacePropertyType'
      }, {
        en: 'Arc',
        ti: '.ArcType',
        sh: 'ArcString'
      }, {
        en: 'conversionRef',
        ti: '.ConversionRefType'
      }, {
        en: 'DataBlock',
        ti: '.DataBlockType'
      }, {
        en: 'ImageDatum',
        ti: '.ImageDatumType',
        sh: '_Datum'
      }, {
        en: 'greenwichLongitude',
        ti: '.AngleChoiceType'
      }, {
        en: 'GeodeticDatum',
        ti: '.GeodeticDatumType',
        sh: '_Datum'
      }, {
        en: 'generalTransformationRef',
        ti: '.GeneralTransformationRefType'
      }, {
        en: 'CompassPoint'
      }, {
        en: 'derivedCRSType',
        ti: '.DerivedCRSTypeType'
      }, {
        en: '_CoordinateSystem',
        ti: '.AbstractCoordinateSystemType',
        sh: 'Definition'
      }, {
        en: '_GML',
        ti: '.AbstractGMLType',
        sh: '_Object'
      }, {
        en: 'remarks',
        ti: '.StringOrRefType'
      }, {
        en: 'Definition',
        ti: '.DefinitionType',
        sh: '_GML'
      }, {
        en: 'DirectionVector',
        ti: '.DirectionVectorType'
      }, {
        en: 'covariance',
        ti: 'Double'
      }, {
        en: 'QuantityList',
        ti: '.MeasureOrNullListType'
      }, {
        en: '_CRS',
        ti: '.AbstractReferenceSystemType',
        sh: '_ReferenceSystem'
      }, {
        en: 'geometryMember',
        ti: '.GeometryPropertyType'
      }, {
        en: 'columnIndex',
        ti: 'Integer'
      }, {
        en: 'Surface',
        ti: '.SurfaceType',
        sh: '_Surface'
      }, {
        en: '_Curve',
        ti: '.AbstractCurveType',
        sh: '_GeometricPrimitive'
      }, {
        en: 'EllipsoidalCS',
        ti: '.EllipsoidalCSType',
        sh: '_CoordinateSystem'
      }, {
        en: 'solidProperty',
        ti: '.SolidPropertyType'
      }, {
        en: 'LinearRing',
        ti: '.LinearRingType',
        sh: '_Ring'
      }, {
        en: 'methodID',
        ti: '.IdentifierType'
      }, {
        en: 'engineeringCRSRef',
        ti: '.EngineeringCRSRefType'
      }, {
        en: 'Conversion',
        ti: '.ConversionType',
        sh: '_GeneralConversion'
      }, {
        en: 'Polygon',
        ti: '.PolygonType',
        sh: '_Surface'
      }, {
        en: 'status',
        ti: '.StringOrRefType'
      }, {
        en: 'primeMeridianRef',
        ti: '.PrimeMeridianRefType'
      }, {
        en: 'LocationKeyWord',
        ti: '.CodeType'
      }, {
        en: 'coverageFunction',
        ti: '.CoverageFunctionType'
      }, {
        en: 'CircleByCenterPoint',
        ti: '.CircleByCenterPointType',
        sh: 'ArcByCenterPoint'
      }, {
        en: '_Object',
        ti: 'AnyType'
      }, {
        en: 'sourceCRS',
        ti: '.CRSRefType'
      }, {
        en: 'TemporalCRS',
        ti: '.TemporalCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'ArcStringByBulge',
        ti: '.ArcStringByBulgeType',
        sh: '_CurveSegment'
      }, {
        en: 'EnvelopeWithTimePeriod',
        ti: '.EnvelopeWithTimePeriodType',
        sh: 'Envelope'
      }, {
        en: 'usesCartesianCS',
        ti: '.CartesianCSRefType'
      }, {
        en: 'position',
        ti: '.PointPropertyType'
      }, {
        en: 'pointRep',
        ti: '.PointPropertyType'
      }, {
        en: 'usesEllipsoidalCS',
        ti: '.EllipsoidalCSRefType'
      }, {
        en: 'usesVerticalDatum',
        ti: '.VerticalDatumRefType'
      }, {
        en: 'seconds',
        ti: 'Decimal'
      }, {
        en: '_ReferenceSystem',
        ti: '.AbstractReferenceSystemType',
        sh: 'Definition'
      }, {
        en: '_TimeTopologyPrimitive',
        ti: '.AbstractTimeTopologyPrimitiveType',
        sh: '_TimePrimitive'
      }, {
        en: '_TimePrimitive',
        ti: '.AbstractTimePrimitiveType',
        sh: '_TimeObject'
      }, {
        en: 'segments',
        ti: '.CurveSegmentArrayPropertyType'
      }, {
        en: 'semiMajorAxis',
        ti: '.MeasureType'
      }, {
        en: 'Dictionary',
        ti: '.DictionaryType',
        sh: 'Definition'
      }, {
        en: 'boundingPolygon',
        ti: '.PolygonType'
      }, {
        en: '_Solid',
        ti: '.AbstractSolidType',
        sh: '_GeometricPrimitive'
      }, {
        en: 'DefinitionProxy',
        ti: '.DefinitionProxyType',
        sh: 'Definition'
      }, {
        en: '_GriddedSurface',
        ti: '.AbstractGriddedSurfaceType',
        sh: '_ParametricCurveSurface'
      }, {
        en: '_GeneralDerivedCRS',
        ti: '.AbstractGeneralDerivedCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'TimeNode',
        ti: '.TimeNodeType',
        sh: '_TimeTopologyPrimitive'
      }, {
        en: 'Category',
        ti: '.CodeType'
      }, {
        en: 'pointMembers',
        ti: '.PointArrayPropertyType'
      }, {
        en: 'operationMethodRef',
        ti: '.OperationMethodRefType'
      }, {
        en: 'Ellipsoid',
        ti: '.EllipsoidType',
        sh: 'Definition'
      }, {
        en: 'OperationMethod',
        ti: '.OperationMethodType',
        sh: 'Definition'
      }, {
        en: 'directedEdge',
        ti: '.DirectedEdgePropertyType'
      }, {
        en: 'multiPosition',
        ti: '.MultiPointPropertyType'
      }, {
        en: 'topoCurveProperty',
        ti: '.TopoCurvePropertyType'
      }, {
        en: 'ConventionalUnit',
        ti: '.ConventionalUnitType',
        sh: 'UnitDefinition'
      }, {
        en: 'PassThroughOperation',
        ti: '.PassThroughOperationType',
        sh: '_SingleOperation'
      }, {
        en: 'ArcByCenterPoint',
        ti: '.ArcByCenterPointType',
        sh: '_CurveSegment'
      }, {
        en: 'indirectEntry',
        ti: '.IndirectEntryType'
      }, {
        en: 'coordinateOperationName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'scope'
      }, {
        en: 'projectedCRSRef',
        ti: '.ProjectedCRSRefType'
      }, {
        en: 'dictionaryEntry',
        ti: '.DictionaryEntryType'
      }, {
        en: 'MovingObjectStatus',
        ti: '.MovingObjectStatusType',
        sh: '_TimeSlice'
      }, {
        en: 'MultiPointCoverage',
        ti: '.MultiPointCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: 'OperationParameterGroup',
        ti: '.OperationParameterGroupType',
        sh: '_GeneralOperationParameter'
      }, {
        en: 'FeatureCollection',
        ti: '.FeatureCollectionType',
        sh: '_Feature'
      }, {
        en: 'timePosition',
        ti: '.TimePositionType'
      }, {
        en: 'LineString',
        ti: '.LineStringType',
        sh: '_Curve'
      }, {
        en: 'multiLocation',
        ti: '.MultiPointPropertyType'
      }, {
        en: 'axisID',
        ti: '.IdentifierType'
      }, {
        en: 'curveProperty',
        ti: '.CurvePropertyType'
      }, {
        en: 'derivationUnitTerm',
        ti: '.DerivationUnitTermType'
      }, {
        en: 'solidMember',
        ti: '.SolidPropertyType'
      }, {
        en: 'MultiCurveCoverage',
        ti: '.MultiCurveCoverageType',
        sh: '_DiscreteCoverage'
      }, {
        en: 'integerValueList',
        ti: {
          t: 'l',
          bti: 'Integer'
        }
      }, {
        en: 'TimeCalendarEra',
        ti: '.TimeCalendarEraType',
        sh: 'Definition'
      }, {
        en: '_CoordinateReferenceSystem',
        ti: '.AbstractReferenceSystemType',
        sh: '_CRS'
      }, {
        en: 'Circle',
        ti: '.CircleType',
        sh: 'Arc'
      }, {
        en: 'methodFormula',
        ti: '.CodeType'
      }, {
        en: '_GeometricAggregate',
        ti: '.AbstractGeometricAggregateType',
        sh: '_Geometry'
      }, {
        en: 'Count',
        ti: 'Integer'
      }, {
        en: 'GraphStyle',
        ti: '.GraphStyleType',
        sh: '_GML'
      }, {
        en: 'CompositeValue',
        ti: '.CompositeValueType'
      }, {
        en: 'polygonPatches',
        ti: '.PolygonPatchArrayPropertyType',
        sh: 'patches'
      }, {
        en: 'directedNode',
        ti: '.DirectedNodePropertyType'
      }, {
        en: 'meridianName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: 'temporalCSRef',
        ti: '.TemporalCSRefType'
      }, {
        en: 'integerValue',
        ti: 'Integer'
      }, {
        en: 'domainSet',
        ti: '.DomainSetType'
      }, {
        en: 'VerticalDatum',
        ti: '.VerticalDatumType',
        sh: '_Datum'
      }, {
        en: 'members',
        ti: '.ArrayAssociationType'
      }, {
        en: 'abstractGeneralOperationParameterRef',
        ti: '.AbstractGeneralOperationParameterRefType'
      }, {
        en: 'CompositeCurve',
        ti: '.CompositeCurveType',
        sh: '_Curve'
      }, {
        en: 'Null',
        ti: {
          t: 'l'
        }
      }, {
        en: 'featureProperty',
        ti: '.FeaturePropertyType'
      }, {
        en: 'degrees',
        ti: '.DegreesType'
      }, {
        en: 'groupName',
        ti: '.CodeType',
        sh: 'name'
      }, {
        en: '_Datum',
        ti: '.AbstractDatumType',
        sh: 'Definition'
      }, {
        en: 'symbol',
        ti: '.SymbolType'
      }, {
        en: 'coordinateOperationID',
        ti: '.IdentifierType'
      }, {
        en: 'concatenatedOperationRef',
        ti: '.ConcatenatedOperationRefType'
      }, {
        en: 'value',
        ti: '.MeasureType'
      }, {
        en: '_CoordinateOperation',
        ti: '.AbstractCoordinateOperationType',
        sh: 'Definition'
      }, {
        en: 'CompositeSolid',
        ti: '.CompositeSolidType',
        sh: '_Solid'
      }, {
        en: 'Array',
        ti: '.ArrayType',
        sh: '_GML'
      }, {
        en: 'measureDescription',
        ti: '.CodeType'
      }, {
        en: 'polarCSRef',
        ti: '.PolarCSRefType'
      }, {
        en: 'conversionToPreferredUnit',
        ti: '.ConversionToPreferredUnitType'
      }, {
        en: 'directedFace',
        ti: '.DirectedFacePropertyType'
      }, {
        en: 'TriangulatedSurface',
        ti: '.TriangulatedSurfaceType',
        sh: 'Surface'
      }, {
        en: 'GridFunction',
        ti: '.GridFunctionType'
      }, {
        en: 'multiEdgeOf',
        ti: '.MultiCurvePropertyType'
      }, {
        en: 'EngineeringCRS',
        ti: '.EngineeringCRSType',
        sh: '_CoordinateReferenceSystem'
      }, {
        en: 'TemporalDatum',
        ti: '.TemporalDatumType',
        sh: '_Datum'
      }, {
        en: 'MultiGeometry',
        ti: '.MultiGeometryType',
        sh: '_GeometricAggregate'
      }, {
        en: 'TimeEdge',
        ti: '.TimeEdgeType',
        sh: '_TimeTopologyPrimitive'
      }, {
        en: '_GeneralConversion',
        ti: '.AbstractGeneralConversionType',
        sh: '_Operation'
      }, {
        en: 'solidArrayProperty',
        ti: '.SolidArrayPropertyType'
      }, {
        en: 'measure',
        ti: '.MeasureType'
      }, {
        en: 'Bezier',
        ti: '.BezierType',
        sh: 'BSpline'
      }, {
        en: 'topoPrimitiveMembers',
        ti: '.TopoPrimitiveArrayAssociationType'
      }, {
        en: 'srsID',
        ti: '.IdentifierType'
      }, {
        en: 'isSphere'
      }, {
        en: 'dmsAngleValue',
        ti: '.DMSAngleType'
      }, {
        en: 'verticalCRSRef',
        ti: '.VerticalCRSRefType'
      }, {
        en: 'engineeringDatumRef',
        ti: '.EngineeringDatumRefType'
      }, {
        en: 'topoComplexProperty',
        ti: '.TopoComplexMemberType'
      }, {
        en: 'OffsetCurve',
        ti: '.OffsetCurveType',
        sh: '_CurveSegment'
      }, {
        en: 'coordinateOperationRef',
        ti: '.CoordinateOperationRefType'
      }]
  };
  return {
    GML_3_1_1: GML_3_1_1
  };
};
if (typeof define === 'function' && define.amd) {
  define([], GML_3_1_1_Module_Factory);
}
else {
  var GML_3_1_1_Module = GML_3_1_1_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.GML_3_1_1 = GML_3_1_1_Module.GML_3_1_1;
  }
  else {
    var GML_3_1_1 = GML_3_1_1_Module.GML_3_1_1;
  }
}
},{}],7:[function(require,module,exports){
var OWS_1_0_0_Module_Factory = function () {
  var OWS_1_0_0 = {
    n: 'OWS_1_0_0',
    dens: 'http:\/\/www.opengis.net\/ows',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    deps: ['XLink_1_0'],
    tis: [{
        ln: 'ServiceIdentification',
        tn: null,
        bti: '.DescriptionType',
        ps: [{
            n: 'serviceType',
            en: 'ServiceType',
            ti: '.CodeType'
          }, {
            n: 'serviceTypeVersion',
            col: true,
            en: 'ServiceTypeVersion'
          }, {
            n: 'fees',
            en: 'Fees'
          }, {
            n: 'accessConstraints',
            col: true,
            en: 'AccessConstraints'
          }]
      }, {
        ln: 'ResponsiblePartySubsetType',
        ps: [{
            n: 'individualName',
            en: 'IndividualName'
          }, {
            n: 'positionName',
            en: 'PositionName'
          }, {
            n: 'contactInfo',
            en: 'ContactInfo',
            ti: '.ContactType'
          }, {
            n: 'role',
            en: 'Role',
            ti: '.CodeType'
          }]
      }, {
        ln: 'OnlineResourceType',
        ps: [{
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'WGS84BoundingBoxType',
        bti: '.BoundingBoxType'
      }, {
        ln: 'CodeType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }]
      }, {
        ln: 'Operation',
        tn: null,
        ps: [{
            n: 'dcp',
            col: true,
            en: 'DCP',
            ti: '.DCP'
          }, {
            n: 'parameter',
            col: true,
            en: 'Parameter',
            ti: '.DomainType'
          }, {
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'RequestMethodType',
        bti: '.OnlineResourceType',
        ps: [{
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }]
      }, {
        ln: 'ServiceProvider',
        tn: null,
        ps: [{
            n: 'providerName',
            en: 'ProviderName'
          }, {
            n: 'providerSite',
            en: 'ProviderSite',
            ti: '.OnlineResourceType'
          }, {
            n: 'serviceContact',
            en: 'ServiceContact',
            ti: '.ResponsiblePartySubsetType'
          }]
      }, {
        ln: 'SectionsType',
        ps: [{
            n: 'section',
            col: true,
            en: 'Section'
          }]
      }, {
        ln: 'DomainType',
        ps: [{
            n: 'value',
            col: true,
            en: 'Value'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'AcceptFormatsType',
        ps: [{
            n: 'outputFormat',
            col: true,
            en: 'OutputFormat'
          }]
      }, {
        ln: 'HTTP',
        tn: null,
        ps: [{
            n: 'getOrPost',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'Get',
                ti: '.RequestMethodType'
              }, {
                en: 'Post',
                ti: '.RequestMethodType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'ContactType',
        ps: [{
            n: 'phone',
            en: 'Phone',
            ti: '.TelephoneType'
          }, {
            n: 'address',
            en: 'Address',
            ti: '.AddressType'
          }, {
            n: 'onlineResource',
            en: 'OnlineResource',
            ti: '.OnlineResourceType'
          }, {
            n: 'hoursOfService',
            en: 'HoursOfService'
          }, {
            n: 'contactInstructions',
            en: 'ContactInstructions'
          }]
      }, {
        ln: 'MetadataType',
        ps: [{
            n: 'abstractMetaData',
            en: 'AbstractMetaData',
            ti: 'AnyType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ResponsiblePartyType',
        ps: [{
            n: 'individualName',
            en: 'IndividualName'
          }, {
            n: 'organisationName',
            en: 'OrganisationName'
          }, {
            n: 'positionName',
            en: 'PositionName'
          }, {
            n: 'contactInfo',
            en: 'ContactInfo',
            ti: '.ContactType'
          }, {
            n: 'role',
            en: 'Role',
            ti: '.CodeType'
          }]
      }, {
        ln: 'ExceptionReport',
        tn: null,
        ps: [{
            n: 'exception',
            col: true,
            en: 'Exception',
            ti: '.ExceptionType'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'language',
            an: {
              lp: 'language'
            },
            t: 'a'
          }]
      }, {
        ln: 'AddressType',
        ps: [{
            n: 'deliveryPoint',
            col: true,
            en: 'DeliveryPoint'
          }, {
            n: 'city',
            en: 'City'
          }, {
            n: 'administrativeArea',
            en: 'AdministrativeArea'
          }, {
            n: 'postalCode',
            en: 'PostalCode'
          }, {
            n: 'country',
            en: 'Country'
          }, {
            n: 'electronicMailAddress',
            col: true,
            en: 'ElectronicMailAddress'
          }]
      }, {
        ln: 'CapabilitiesBaseType',
        ps: [{
            n: 'serviceIdentification',
            en: 'ServiceIdentification',
            ti: '.ServiceIdentification'
          }, {
            n: 'serviceProvider',
            en: 'ServiceProvider',
            ti: '.ServiceProvider'
          }, {
            n: 'operationsMetadata',
            en: 'OperationsMetadata',
            ti: '.OperationsMetadata'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'updateSequence',
            an: {
              lp: 'updateSequence'
            },
            t: 'a'
          }]
      }, {
        ln: 'IdentificationType',
        bti: '.DescriptionType',
        ps: [{
            n: 'identifier',
            en: 'Identifier',
            ti: '.CodeType'
          }, {
            n: 'boundingBox',
            col: true,
            mx: false,
            dom: false,
            en: 'BoundingBox',
            ti: '.BoundingBoxType',
            t: 'er'
          }, {
            n: 'outputFormat',
            col: true,
            en: 'OutputFormat'
          }, {
            n: 'availableCRS',
            col: true,
            mx: false,
            dom: false,
            en: 'AvailableCRS',
            t: 'er'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }]
      }, {
        ln: 'OperationsMetadata',
        tn: null,
        ps: [{
            n: 'operation',
            col: true,
            en: 'Operation',
            ti: '.Operation'
          }, {
            n: 'parameter',
            col: true,
            en: 'Parameter',
            ti: '.DomainType'
          }, {
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }, {
            n: 'extendedCapabilities',
            en: 'ExtendedCapabilities',
            ti: 'AnyType'
          }]
      }, {
        ln: 'DescriptionType',
        ps: [{
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'keywords',
            col: true,
            en: 'Keywords',
            ti: '.KeywordsType'
          }]
      }, {
        ln: 'DCP',
        tn: null,
        ps: [{
            n: 'http',
            en: 'HTTP',
            ti: '.HTTP'
          }]
      }, {
        ln: 'GetCapabilitiesType',
        ps: [{
            n: 'acceptVersions',
            en: 'AcceptVersions',
            ti: '.AcceptVersionsType'
          }, {
            n: 'sections',
            en: 'Sections',
            ti: '.SectionsType'
          }, {
            n: 'acceptFormats',
            en: 'AcceptFormats',
            ti: '.AcceptFormatsType'
          }, {
            n: 'updateSequence',
            an: {
              lp: 'updateSequence'
            },
            t: 'a'
          }]
      }, {
        ln: 'AcceptVersionsType',
        ps: [{
            n: 'version',
            col: true,
            en: 'Version'
          }]
      }, {
        ln: 'TelephoneType',
        ps: [{
            n: 'voice',
            col: true,
            en: 'Voice'
          }, {
            n: 'facsimile',
            col: true,
            en: 'Facsimile'
          }]
      }, {
        ln: 'BoundingBoxType',
        ps: [{
            n: 'lowerCorner',
            en: 'LowerCorner',
            ti: {
              t: 'l',
              bti: 'Double'
            }
          }, {
            n: 'upperCorner',
            en: 'UpperCorner',
            ti: {
              t: 'l',
              bti: 'Double'
            }
          }, {
            n: 'crs',
            an: {
              lp: 'crs'
            },
            t: 'a'
          }, {
            n: 'dimensions',
            ti: 'Integer',
            an: {
              lp: 'dimensions'
            },
            t: 'a'
          }]
      }, {
        ln: 'ExceptionType',
        ps: [{
            n: 'exceptionText',
            col: true,
            en: 'ExceptionText'
          }, {
            n: 'exceptionCode',
            an: {
              lp: 'exceptionCode'
            },
            t: 'a'
          }, {
            n: 'locator',
            an: {
              lp: 'locator'
            },
            t: 'a'
          }]
      }, {
        ln: 'KeywordsType',
        ps: [{
            n: 'keyword',
            col: true,
            en: 'Keyword'
          }, {
            n: 'type',
            en: 'Type',
            ti: '.CodeType'
          }]
      }],
    eis: [{
        en: 'Metadata',
        ti: '.MetadataType'
      }, {
        en: 'DCP',
        ti: '.DCP'
      }, {
        en: 'ExtendedCapabilities',
        ti: 'AnyType'
      }, {
        en: 'IndividualName'
      }, {
        en: 'Fees'
      }, {
        en: 'WGS84BoundingBox',
        ti: '.WGS84BoundingBoxType',
        sh: 'BoundingBox'
      }, {
        en: 'OperationsMetadata',
        ti: '.OperationsMetadata'
      }, {
        en: 'Title'
      }, {
        en: 'GetCapabilities',
        ti: '.GetCapabilitiesType'
      }, {
        en: 'Keywords',
        ti: '.KeywordsType'
      }, {
        en: 'Role',
        ti: '.CodeType'
      }, {
        en: 'Operation',
        ti: '.Operation'
      }, {
        en: 'Language'
      }, {
        en: 'ContactInfo',
        ti: '.ContactType'
      }, {
        en: 'PointOfContact',
        ti: '.ResponsiblePartyType'
      }, {
        en: 'Abstract'
      }, {
        en: 'OrganisationName'
      }, {
        en: 'Post',
        ti: '.RequestMethodType',
        sc: '.HTTP'
      }, {
        en: 'ServiceIdentification',
        ti: '.ServiceIdentification'
      }, {
        en: 'Get',
        ti: '.RequestMethodType',
        sc: '.HTTP'
      }, {
        en: 'SupportedCRS',
        sh: 'AvailableCRS'
      }, {
        en: 'OutputFormat'
      }, {
        en: 'Identifier',
        ti: '.CodeType'
      }, {
        en: 'AvailableCRS'
      }, {
        en: 'Exception',
        ti: '.ExceptionType'
      }, {
        en: 'BoundingBox',
        ti: '.BoundingBoxType'
      }, {
        en: 'ServiceProvider',
        ti: '.ServiceProvider'
      }, {
        en: 'ExceptionReport',
        ti: '.ExceptionReport'
      }, {
        en: 'AbstractMetaData',
        ti: 'AnyType'
      }, {
        en: 'HTTP',
        ti: '.HTTP'
      }, {
        en: 'AccessConstraints'
      }, {
        en: 'PositionName'
      }]
  };
  return {
    OWS_1_0_0: OWS_1_0_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], OWS_1_0_0_Module_Factory);
}
else {
  var OWS_1_0_0_Module = OWS_1_0_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.OWS_1_0_0 = OWS_1_0_0_Module.OWS_1_0_0;
  }
  else {
    var OWS_1_0_0 = OWS_1_0_0_Module.OWS_1_0_0;
  }
}
},{}],8:[function(require,module,exports){
var OWS_1_1_0_Module_Factory = function () {
  var OWS_1_1_0 = {
    n: 'OWS_1_1_0',
    dens: 'http:\/\/www.opengis.net\/ows\/1.1',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    deps: ['XLink_1_0'],
    tis: [{
        ln: 'ServiceIdentification',
        tn: null,
        bti: '.DescriptionType',
        ps: [{
            n: 'serviceType',
            en: 'ServiceType',
            ti: '.CodeType'
          }, {
            n: 'serviceTypeVersion',
            col: true,
            en: 'ServiceTypeVersion'
          }, {
            n: 'profile',
            col: true,
            en: 'Profile'
          }, {
            n: 'fees',
            en: 'Fees'
          }, {
            n: 'accessConstraints',
            col: true,
            en: 'AccessConstraints'
          }]
      }, {
        ln: 'OperationsMetadata',
        tn: null,
        ps: [{
            n: 'operation',
            col: true,
            en: 'Operation',
            ti: '.Operation'
          }, {
            n: 'parameter',
            col: true,
            en: 'Parameter',
            ti: '.DomainType'
          }, {
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }, {
            n: 'extendedCapabilities',
            en: 'ExtendedCapabilities',
            ti: 'AnyType'
          }]
      }, {
        ln: 'ReferenceGroupType',
        bti: '.BasicIdentificationType',
        ps: [{
            n: 'abstractReferenceBase',
            col: true,
            mx: false,
            dom: false,
            en: 'AbstractReferenceBase',
            ti: '.AbstractReferenceBaseType',
            t: 'er'
          }]
      }, {
        ln: 'DomainMetadataType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'reference',
            an: {
              lp: 'reference',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            t: 'a'
          }]
      }, {
        ln: 'DescriptionType',
        ps: [{
            n: 'title',
            col: true,
            en: 'Title',
            ti: '.LanguageStringType'
          }, {
            n: '_abstract',
            col: true,
            en: 'Abstract',
            ti: '.LanguageStringType'
          }, {
            n: 'keywords',
            col: true,
            en: 'Keywords',
            ti: '.KeywordsType'
          }]
      }, {
        ln: 'ContactType',
        ps: [{
            n: 'phone',
            en: 'Phone',
            ti: '.TelephoneType'
          }, {
            n: 'address',
            en: 'Address',
            ti: '.AddressType'
          }, {
            n: 'onlineResource',
            en: 'OnlineResource',
            ti: '.OnlineResourceType'
          }, {
            n: 'hoursOfService',
            en: 'HoursOfService'
          }, {
            n: 'contactInstructions',
            en: 'ContactInstructions'
          }]
      }, {
        ln: 'ReferenceType',
        bti: '.AbstractReferenceBaseType',
        ps: [{
            n: 'identifier',
            en: 'Identifier',
            ti: '.CodeType'
          }, {
            n: '_abstract',
            col: true,
            en: 'Abstract',
            ti: '.LanguageStringType'
          }, {
            n: 'format',
            en: 'Format'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }]
      }, {
        ln: 'HTTP',
        tn: null,
        ps: [{
            n: 'getOrPost',
            col: true,
            mx: false,
            dom: false,
            etis: [{
                en: 'Post',
                ti: '.RequestMethodType'
              }, {
                en: 'Get',
                ti: '.RequestMethodType'
              }],
            t: 'ers'
          }]
      }, {
        ln: 'ServiceProvider',
        tn: null,
        ps: [{
            n: 'providerName',
            en: 'ProviderName'
          }, {
            n: 'providerSite',
            en: 'ProviderSite',
            ti: '.OnlineResourceType'
          }, {
            n: 'serviceContact',
            en: 'ServiceContact',
            ti: '.ResponsiblePartySubsetType'
          }]
      }, {
        ln: 'ResponsiblePartyType',
        ps: [{
            n: 'individualName',
            en: 'IndividualName'
          }, {
            n: 'organisationName',
            en: 'OrganisationName'
          }, {
            n: 'positionName',
            en: 'PositionName'
          }, {
            n: 'contactInfo',
            en: 'ContactInfo',
            ti: '.ContactType'
          }, {
            n: 'role',
            en: 'Role',
            ti: '.CodeType'
          }]
      }, {
        ln: 'ContentsBaseType',
        ps: [{
            n: 'datasetDescriptionSummary',
            col: true,
            en: 'DatasetDescriptionSummary',
            ti: '.DatasetDescriptionSummaryBaseType'
          }, {
            n: 'otherSource',
            col: true,
            en: 'OtherSource',
            ti: '.MetadataType'
          }]
      }, {
        ln: 'AbstractReferenceBaseType',
        ps: [{
            n: 'type',
            an: {
              lp: 'type',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'GetCapabilitiesType',
        ps: [{
            n: 'acceptVersions',
            en: 'AcceptVersions',
            ti: '.AcceptVersionsType'
          }, {
            n: 'sections',
            en: 'Sections',
            ti: '.SectionsType'
          }, {
            n: 'acceptFormats',
            en: 'AcceptFormats',
            ti: '.AcceptFormatsType'
          }, {
            n: 'updateSequence',
            an: {
              lp: 'updateSequence'
            },
            t: 'a'
          }]
      }, {
        ln: 'AcceptVersionsType',
        ps: [{
            n: 'version',
            col: true,
            en: 'Version'
          }]
      }, {
        ln: 'AllowedValues',
        tn: null,
        ps: [{
            n: 'valueOrRange',
            col: true,
            etis: [{
                en: 'Value',
                ti: '.ValueType'
              }, {
                en: 'Range',
                ti: '.RangeType'
              }],
            t: 'es'
          }]
      }, {
        ln: 'ManifestType',
        bti: '.BasicIdentificationType',
        ps: [{
            n: 'referenceGroup',
            col: true,
            en: 'ReferenceGroup',
            ti: '.ReferenceGroupType'
          }]
      }, {
        ln: 'BoundingBoxType',
        ps: [{
            n: 'lowerCorner',
            en: 'LowerCorner',
            ti: {
              t: 'l',
              bti: 'Double'
            }
          }, {
            n: 'upperCorner',
            en: 'UpperCorner',
            ti: {
              t: 'l',
              bti: 'Double'
            }
          }, {
            n: 'crs',
            an: {
              lp: 'crs'
            },
            t: 'a'
          }, {
            n: 'dimensions',
            ti: 'Integer',
            an: {
              lp: 'dimensions'
            },
            t: 'a'
          }]
      }, {
        ln: 'ValuesReference',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'reference',
            an: {
              lp: 'reference',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnyValue',
        tn: null
      }, {
        ln: 'ValueType',
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'GetResourceByIdType',
        ps: [{
            n: 'resourceID',
            col: true,
            en: 'ResourceID'
          }, {
            n: 'outputFormat',
            en: 'OutputFormat'
          }, {
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }]
      }, {
        ln: 'TelephoneType',
        ps: [{
            n: 'voice',
            col: true,
            en: 'Voice'
          }, {
            n: 'facsimile',
            col: true,
            en: 'Facsimile'
          }]
      }, {
        ln: 'SectionsType',
        ps: [{
            n: 'section',
            col: true,
            en: 'Section'
          }]
      }, {
        ln: 'RequestMethodType',
        bti: '.OnlineResourceType',
        ps: [{
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }]
      }, {
        ln: 'DCP',
        tn: null,
        ps: [{
            n: 'http',
            en: 'HTTP',
            ti: '.HTTP'
          }]
      }, {
        ln: 'ResponsiblePartySubsetType',
        ps: [{
            n: 'individualName',
            en: 'IndividualName'
          }, {
            n: 'positionName',
            en: 'PositionName'
          }, {
            n: 'contactInfo',
            en: 'ContactInfo',
            ti: '.ContactType'
          }, {
            n: 'role',
            en: 'Role',
            ti: '.CodeType'
          }]
      }, {
        ln: 'UnNamedDomainType',
        ps: [{
            n: 'allowedValues',
            en: 'AllowedValues',
            ti: '.AllowedValues'
          }, {
            n: 'anyValue',
            en: 'AnyValue',
            ti: '.AnyValue'
          }, {
            n: 'noValues',
            en: 'NoValues',
            ti: '.NoValues'
          }, {
            n: 'valuesReference',
            en: 'ValuesReference',
            ti: '.ValuesReference'
          }, {
            n: 'defaultValue',
            en: 'DefaultValue',
            ti: '.ValueType'
          }, {
            n: 'meaning',
            en: 'Meaning',
            ti: '.DomainMetadataType'
          }, {
            n: 'dataType',
            en: 'DataType',
            ti: '.DomainMetadataType'
          }, {
            n: 'uom',
            en: 'UOM',
            ti: '.DomainMetadataType'
          }, {
            n: 'referenceSystem',
            en: 'ReferenceSystem',
            ti: '.DomainMetadataType'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }]
      }, {
        ln: 'OnlineResourceType',
        ps: [{
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'ServiceReferenceType',
        bti: '.ReferenceType',
        ps: [{
            n: 'requestMessage',
            en: 'RequestMessage',
            ti: 'AnyType'
          }, {
            n: 'requestMessageReference',
            en: 'RequestMessageReference'
          }]
      }, {
        ln: 'AddressType',
        ps: [{
            n: 'deliveryPoint',
            col: true,
            en: 'DeliveryPoint'
          }, {
            n: 'city',
            en: 'City'
          }, {
            n: 'administrativeArea',
            en: 'AdministrativeArea'
          }, {
            n: 'postalCode',
            en: 'PostalCode'
          }, {
            n: 'country',
            en: 'Country'
          }, {
            n: 'electronicMailAddress',
            col: true,
            en: 'ElectronicMailAddress'
          }]
      }, {
        ln: 'RangeType',
        ps: [{
            n: 'minimumValue',
            en: 'MinimumValue',
            ti: '.ValueType'
          }, {
            n: 'maximumValue',
            en: 'MaximumValue',
            ti: '.ValueType'
          }, {
            n: 'spacing',
            en: 'Spacing',
            ti: '.ValueType'
          }, {
            n: 'rangeClosure',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'rangeClosure',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            t: 'a'
          }]
      }, {
        ln: 'CapabilitiesBaseType',
        ps: [{
            n: 'serviceIdentification',
            en: 'ServiceIdentification',
            ti: '.ServiceIdentification'
          }, {
            n: 'serviceProvider',
            en: 'ServiceProvider',
            ti: '.ServiceProvider'
          }, {
            n: 'operationsMetadata',
            en: 'OperationsMetadata',
            ti: '.OperationsMetadata'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'updateSequence',
            an: {
              lp: 'updateSequence'
            },
            t: 'a'
          }]
      }, {
        ln: 'WGS84BoundingBoxType',
        bti: '.BoundingBoxType'
      }, {
        ln: 'IdentificationType',
        bti: '.BasicIdentificationType',
        ps: [{
            n: 'boundingBox',
            col: true,
            mx: false,
            dom: false,
            en: 'BoundingBox',
            ti: '.BoundingBoxType',
            t: 'er'
          }, {
            n: 'outputFormat',
            col: true,
            en: 'OutputFormat'
          }, {
            n: 'availableCRS',
            col: true,
            mx: false,
            dom: false,
            en: 'AvailableCRS',
            t: 'er'
          }]
      }, {
        ln: 'KeywordsType',
        ps: [{
            n: 'keyword',
            col: true,
            en: 'Keyword',
            ti: '.LanguageStringType'
          }, {
            n: 'type',
            en: 'Type',
            ti: '.CodeType'
          }]
      }, {
        ln: 'DomainType',
        bti: '.UnNamedDomainType',
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'DatasetDescriptionSummaryBaseType',
        bti: '.DescriptionType',
        ps: [{
            n: 'wgs84BoundingBox',
            col: true,
            en: 'WGS84BoundingBox',
            ti: '.WGS84BoundingBoxType'
          }, {
            n: 'identifier',
            en: 'Identifier',
            ti: '.CodeType'
          }, {
            n: 'boundingBox',
            col: true,
            mx: false,
            dom: false,
            en: 'BoundingBox',
            ti: '.BoundingBoxType',
            t: 'er'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }, {
            n: 'datasetDescriptionSummary',
            col: true,
            en: 'DatasetDescriptionSummary',
            ti: '.DatasetDescriptionSummaryBaseType'
          }]
      }, {
        ln: 'ExceptionType',
        ps: [{
            n: 'exceptionText',
            col: true,
            en: 'ExceptionText'
          }, {
            n: 'exceptionCode',
            an: {
              lp: 'exceptionCode'
            },
            t: 'a'
          }, {
            n: 'locator',
            an: {
              lp: 'locator'
            },
            t: 'a'
          }]
      }, {
        ln: 'BasicIdentificationType',
        bti: '.DescriptionType',
        ps: [{
            n: 'identifier',
            en: 'Identifier',
            ti: '.CodeType'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }]
      }, {
        ln: 'AcceptFormatsType',
        ps: [{
            n: 'outputFormat',
            col: true,
            en: 'OutputFormat'
          }]
      }, {
        ln: 'LanguageStringType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'MetadataType',
        ps: [{
            n: 'abstractMetaData',
            en: 'AbstractMetaData',
            ti: 'AnyType'
          }, {
            n: 'about',
            an: {
              lp: 'about'
            },
            t: 'a'
          }, {
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'NoValues',
        tn: null
      }, {
        ln: 'ExceptionReport',
        tn: null,
        ps: [{
            n: 'exception',
            col: true,
            en: 'Exception',
            ti: '.ExceptionType'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'CodeType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'codeSpace',
            an: {
              lp: 'codeSpace'
            },
            t: 'a'
          }]
      }, {
        ln: 'Operation',
        tn: null,
        ps: [{
            n: 'dcp',
            col: true,
            en: 'DCP',
            ti: '.DCP'
          }, {
            n: 'parameter',
            col: true,
            en: 'Parameter',
            ti: '.DomainType'
          }, {
            n: 'constraint',
            col: true,
            en: 'Constraint',
            ti: '.DomainType'
          }, {
            n: 'metadata',
            col: true,
            en: 'Metadata',
            ti: '.MetadataType'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }],
    eis: [{
        en: 'ServiceIdentification',
        ti: '.ServiceIdentification'
      }, {
        en: 'Meaning',
        ti: '.DomainMetadataType'
      }, {
        en: 'Exception',
        ti: '.ExceptionType'
      }, {
        en: 'OrganisationName'
      }, {
        en: 'AbstractReferenceBase',
        ti: '.AbstractReferenceBaseType'
      }, {
        en: 'Value',
        ti: '.ValueType'
      }, {
        en: 'Keywords',
        ti: '.KeywordsType'
      }, {
        en: 'MaximumValue',
        ti: '.ValueType'
      }, {
        en: 'OperationResponse',
        ti: '.ManifestType'
      }, {
        en: 'Metadata',
        ti: '.MetadataType'
      }, {
        en: 'ServiceReference',
        ti: '.ServiceReferenceType',
        sh: 'Reference'
      }, {
        en: 'Fees'
      }, {
        en: 'ServiceProvider',
        ti: '.ServiceProvider'
      }, {
        en: 'MinimumValue',
        ti: '.ValueType'
      }, {
        en: 'DataType',
        ti: '.DomainMetadataType'
      }, {
        en: 'Manifest',
        ti: '.ManifestType'
      }, {
        en: 'DefaultValue',
        ti: '.ValueType'
      }, {
        en: 'AllowedValues',
        ti: '.AllowedValues'
      }, {
        en: 'DCP',
        ti: '.DCP'
      }, {
        en: 'NoValues',
        ti: '.NoValues'
      }, {
        en: 'ReferenceGroup',
        ti: '.ReferenceGroupType'
      }, {
        en: 'Title',
        ti: '.LanguageStringType'
      }, {
        en: 'PointOfContact',
        ti: '.ResponsiblePartyType'
      }, {
        en: 'Identifier',
        ti: '.CodeType'
      }, {
        en: 'IndividualName'
      }, {
        en: 'ExceptionReport',
        ti: '.ExceptionReport'
      }, {
        en: 'SupportedCRS',
        sh: 'AvailableCRS'
      }, {
        en: 'AnyValue',
        ti: '.AnyValue'
      }, {
        en: 'Language'
      }, {
        en: 'ReferenceSystem',
        ti: '.DomainMetadataType'
      }, {
        en: 'ExtendedCapabilities',
        ti: 'AnyType'
      }, {
        en: 'UOM',
        ti: '.DomainMetadataType'
      }, {
        en: 'Range',
        ti: '.RangeType'
      }, {
        en: 'AbstractMetaData',
        ti: 'AnyType'
      }, {
        en: 'Resource',
        ti: 'AnyType'
      }, {
        en: 'AccessConstraints'
      }, {
        en: 'Role',
        ti: '.CodeType'
      }, {
        en: 'HTTP',
        ti: '.HTTP'
      }, {
        en: 'BoundingBox',
        ti: '.BoundingBoxType'
      }, {
        en: 'Post',
        ti: '.RequestMethodType',
        sc: '.HTTP'
      }, {
        en: 'PositionName'
      }, {
        en: 'ContactInfo',
        ti: '.ContactType'
      }, {
        en: 'WGS84BoundingBox',
        ti: '.WGS84BoundingBoxType',
        sh: 'BoundingBox'
      }, {
        en: 'ValuesReference',
        ti: '.ValuesReference'
      }, {
        en: 'GetResourceByID',
        ti: '.GetResourceByIdType'
      }, {
        en: 'Reference',
        ti: '.ReferenceType',
        sh: 'AbstractReferenceBase'
      }, {
        en: 'OperationsMetadata',
        ti: '.OperationsMetadata'
      }, {
        en: 'Operation',
        ti: '.Operation'
      }, {
        en: 'InputData',
        ti: '.ManifestType'
      }, {
        en: 'Abstract',
        ti: '.LanguageStringType'
      }, {
        en: 'GetCapabilities',
        ti: '.GetCapabilitiesType'
      }, {
        en: 'OutputFormat'
      }, {
        en: 'AvailableCRS'
      }, {
        en: 'Spacing',
        ti: '.ValueType'
      }, {
        en: 'Get',
        ti: '.RequestMethodType',
        sc: '.HTTP'
      }, {
        en: 'DatasetDescriptionSummary',
        ti: '.DatasetDescriptionSummaryBaseType'
      }, {
        en: 'OtherSource',
        ti: '.MetadataType'
      }]
  };
  return {
    OWS_1_1_0: OWS_1_1_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], OWS_1_1_0_Module_Factory);
}
else {
  var OWS_1_1_0_Module = OWS_1_1_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.OWS_1_1_0 = OWS_1_1_0_Module.OWS_1_1_0;
  }
  else {
    var OWS_1_1_0 = OWS_1_1_0_Module.OWS_1_1_0;
  }
}
},{}],9:[function(require,module,exports){
var SLD_1_0_0_Module_Factory = function () {
  var SLD_1_0_0 = {
    n: 'SLD_1_0_0',
    dens: 'http:\/\/www.opengis.net\/sld',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    deps: ['Filter_1_0_0', 'XLink_1_0'],
    tis: [{
        ln: 'CssParameter',
        tn: null,
        bti: '.ParameterValueType',
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'LabelPlacement',
        tn: null,
        ps: [{
            n: 'pointPlacement',
            en: 'PointPlacement',
            ti: '.PointPlacement'
          }, {
            n: 'linePlacement',
            en: 'LinePlacement',
            ti: '.LinePlacement'
          }]
      }, {
        ln: 'StyledLayerDescriptor',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'namedLayerOrUserLayer',
            col: true,
            etis: [{
                en: 'NamedLayer',
                ti: '.NamedLayer'
              }, {
                en: 'UserLayer',
                ti: '.UserLayer'
              }],
            t: 'es'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }]
      }, {
        ln: 'Rule',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'legendGraphic',
            en: 'LegendGraphic',
            ti: '.LegendGraphic'
          }, {
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_0_0.FilterType'
          }, {
            n: 'elseFilter',
            en: 'ElseFilter',
            ti: '.ElseFilter'
          }, {
            n: 'minScaleDenominator',
            en: 'MinScaleDenominator',
            ti: 'Double'
          }, {
            n: 'maxScaleDenominator',
            en: 'MaxScaleDenominator',
            ti: 'Double'
          }, {
            n: 'symbolizer',
            col: true,
            mx: false,
            dom: false,
            en: 'Symbolizer',
            ti: '.SymbolizerType',
            t: 'er'
          }]
      }, {
        ln: 'AnchorPoint',
        tn: null,
        ps: [{
            n: 'anchorPointX',
            en: 'AnchorPointX',
            ti: '.ParameterValueType'
          }, {
            n: 'anchorPointY',
            en: 'AnchorPointY',
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'Mark',
        tn: null,
        ps: [{
            n: 'wellKnownName',
            en: 'WellKnownName'
          }, {
            n: 'fill',
            en: 'Fill',
            ti: '.Fill'
          }, {
            n: 'stroke',
            en: 'Stroke',
            ti: '.Stroke'
          }]
      }, {
        ln: 'LineSymbolizer',
        tn: null,
        bti: '.SymbolizerType',
        ps: [{
            n: 'geometry',
            en: 'Geometry',
            ti: '.Geometry'
          }, {
            n: 'stroke',
            en: 'Stroke',
            ti: '.Stroke'
          }]
      }, {
        ln: 'AVERAGE',
        tn: null
      }, {
        ln: 'RemoteOWS',
        tn: null,
        ps: [{
            n: 'service',
            en: 'Service'
          }, {
            n: 'onlineResource',
            en: 'OnlineResource',
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'SelectedChannelType',
        ps: [{
            n: 'sourceChannelName',
            en: 'SourceChannelName'
          }, {
            n: 'contrastEnhancement',
            en: 'ContrastEnhancement',
            ti: '.ContrastEnhancement'
          }]
      }, {
        ln: 'OverlapBehavior',
        tn: null,
        ps: [{
            n: 'latestontop',
            en: 'LATEST_ON_TOP',
            ti: '.LATESTONTOP'
          }, {
            n: 'earliestontop',
            en: 'EARLIEST_ON_TOP',
            ti: '.EARLIESTONTOP'
          }, {
            n: 'average',
            en: 'AVERAGE',
            ti: '.AVERAGE'
          }, {
            n: 'random',
            en: 'RANDOM',
            ti: '.RANDOM'
          }]
      }, {
        ln: 'LayerFeatureConstraints',
        tn: null,
        ps: [{
            n: 'featureTypeConstraint',
            col: true,
            en: 'FeatureTypeConstraint',
            ti: '.FeatureTypeConstraint'
          }]
      }, {
        ln: 'SymbolizerType'
      }, {
        ln: 'GraphicStroke',
        tn: null,
        ps: [{
            n: 'graphic',
            en: 'Graphic',
            ti: '.Graphic'
          }]
      }, {
        ln: 'ChannelSelection',
        tn: null,
        ps: [{
            n: 'redChannel',
            en: 'RedChannel',
            ti: '.SelectedChannelType'
          }, {
            n: 'greenChannel',
            en: 'GreenChannel',
            ti: '.SelectedChannelType'
          }, {
            n: 'blueChannel',
            en: 'BlueChannel',
            ti: '.SelectedChannelType'
          }, {
            n: 'grayChannel',
            en: 'GrayChannel',
            ti: '.SelectedChannelType'
          }]
      }, {
        ln: 'Geometry',
        tn: null,
        ps: [{
            n: 'propertyName',
            en: {
              lp: 'PropertyName',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_0_0.PropertyNameType'
          }]
      }, {
        ln: 'Halo',
        tn: null,
        ps: [{
            n: 'radius',
            en: 'Radius',
            ti: '.ParameterValueType'
          }, {
            n: 'fill',
            en: 'Fill',
            ti: '.Fill'
          }]
      }, {
        ln: 'Extent',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'value',
            en: 'Value'
          }]
      }, {
        ln: 'Histogram',
        tn: null
      }, {
        ln: 'NamedLayer',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'layerFeatureConstraints',
            en: 'LayerFeatureConstraints',
            ti: '.LayerFeatureConstraints'
          }, {
            n: 'namedStyleOrUserStyle',
            col: true,
            etis: [{
                en: 'NamedStyle',
                ti: '.NamedStyle'
              }, {
                en: 'UserStyle',
                ti: '.UserStyle'
              }],
            t: 'es'
          }]
      }, {
        ln: 'ColorMap',
        tn: null,
        ps: [{
            n: 'colorMapEntry',
            col: true,
            en: 'ColorMapEntry',
            ti: '.ColorMapEntry'
          }]
      }, {
        ln: 'PointPlacement',
        tn: null,
        ps: [{
            n: 'anchorPoint',
            en: 'AnchorPoint',
            ti: '.AnchorPoint'
          }, {
            n: 'displacement',
            en: 'Displacement',
            ti: '.Displacement'
          }, {
            n: 'rotation',
            en: 'Rotation',
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'ElseFilter',
        tn: null
      }, {
        ln: 'LATESTONTOP',
        tn: null
      }, {
        ln: 'Font',
        tn: null,
        ps: [{
            n: 'cssParameter',
            col: true,
            en: 'CssParameter',
            ti: '.CssParameter'
          }]
      }, {
        ln: 'RANDOM',
        tn: null
      }, {
        ln: 'PolygonSymbolizer',
        tn: null,
        bti: '.SymbolizerType',
        ps: [{
            n: 'geometry',
            en: 'Geometry',
            ti: '.Geometry'
          }, {
            n: 'fill',
            en: 'Fill',
            ti: '.Fill'
          }, {
            n: 'stroke',
            en: 'Stroke',
            ti: '.Stroke'
          }]
      }, {
        ln: 'EARLIESTONTOP',
        tn: null
      }, {
        ln: 'UserLayer',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'remoteOWS',
            en: 'RemoteOWS',
            ti: '.RemoteOWS'
          }, {
            n: 'layerFeatureConstraints',
            en: 'LayerFeatureConstraints',
            ti: '.LayerFeatureConstraints'
          }, {
            n: 'userStyle',
            col: true,
            en: 'UserStyle',
            ti: '.UserStyle'
          }]
      }, {
        ln: 'OnlineResource',
        tn: null,
        ps: [{
            n: 'type',
            ti: 'XLink_1_0.TypeType',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            ti: 'XLink_1_0.ShowType',
            t: 'a'
          }, {
            n: 'actuate',
            ti: 'XLink_1_0.ActuateType',
            t: 'a'
          }]
      }, {
        ln: 'NamedStyle',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }]
      }, {
        ln: 'ContrastEnhancement',
        tn: null,
        ps: [{
            n: 'normalize',
            en: 'Normalize',
            ti: '.Normalize'
          }, {
            n: 'histogram',
            en: 'Histogram',
            ti: '.Histogram'
          }, {
            n: 'gammaValue',
            en: 'GammaValue',
            ti: 'Double'
          }]
      }, {
        ln: 'ColorMapEntry',
        tn: null,
        ps: [{
            n: 'color',
            an: {
              lp: 'color'
            },
            t: 'a'
          }, {
            n: 'opacity',
            ti: 'Double',
            an: {
              lp: 'opacity'
            },
            t: 'a'
          }, {
            n: 'quantity',
            ti: 'Double',
            an: {
              lp: 'quantity'
            },
            t: 'a'
          }, {
            n: 'label',
            an: {
              lp: 'label'
            },
            t: 'a'
          }]
      }, {
        ln: 'LinePlacement',
        tn: null,
        ps: [{
            n: 'perpendicularOffset',
            en: 'PerpendicularOffset',
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'UserStyle',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'isDefault',
            en: 'IsDefault',
            ti: 'Boolean'
          }, {
            n: 'featureTypeStyle',
            col: true,
            en: 'FeatureTypeStyle',
            ti: '.FeatureTypeStyle'
          }]
      }, {
        ln: 'PointSymbolizer',
        tn: null,
        bti: '.SymbolizerType',
        ps: [{
            n: 'geometry',
            en: 'Geometry',
            ti: '.Geometry'
          }, {
            n: 'graphic',
            en: 'Graphic',
            ti: '.Graphic'
          }]
      }, {
        ln: 'FeatureTypeStyle',
        tn: null,
        ps: [{
            n: 'name',
            en: 'Name'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'featureTypeName',
            en: 'FeatureTypeName'
          }, {
            n: 'semanticTypeIdentifier',
            col: true,
            en: 'SemanticTypeIdentifier'
          }, {
            n: 'rule',
            col: true,
            en: 'Rule',
            ti: '.Rule'
          }]
      }, {
        ln: 'ImageOutline',
        tn: null,
        ps: [{
            n: 'lineSymbolizer',
            en: 'LineSymbolizer',
            ti: '.LineSymbolizer'
          }, {
            n: 'polygonSymbolizer',
            en: 'PolygonSymbolizer',
            ti: '.PolygonSymbolizer'
          }]
      }, {
        ln: 'ParameterValueType',
        ps: [{
            n: 'content',
            col: true,
            dom: false,
            en: {
              lp: 'expression',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_0_0.ExpressionType',
            t: 'er'
          }]
      }, {
        ln: 'Stroke',
        tn: null,
        ps: [{
            n: 'graphicFill',
            en: 'GraphicFill',
            ti: '.GraphicFill'
          }, {
            n: 'graphicStroke',
            en: 'GraphicStroke',
            ti: '.GraphicStroke'
          }, {
            n: 'cssParameter',
            col: true,
            en: 'CssParameter',
            ti: '.CssParameter'
          }]
      }, {
        ln: 'Graphic',
        tn: null,
        ps: [{
            n: 'externalGraphicOrMark',
            col: true,
            etis: [{
                en: 'ExternalGraphic',
                ti: '.ExternalGraphic'
              }, {
                en: 'Mark',
                ti: '.Mark'
              }],
            t: 'es'
          }, {
            n: 'opacity',
            en: 'Opacity',
            ti: '.ParameterValueType'
          }, {
            n: 'size',
            en: 'Size',
            ti: '.ParameterValueType'
          }, {
            n: 'rotation',
            en: 'Rotation',
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'Normalize',
        tn: null
      }, {
        ln: 'Displacement',
        tn: null,
        ps: [{
            n: 'displacementX',
            en: 'DisplacementX',
            ti: '.ParameterValueType'
          }, {
            n: 'displacementY',
            en: 'DisplacementY',
            ti: '.ParameterValueType'
          }]
      }, {
        ln: 'GraphicFill',
        tn: null,
        ps: [{
            n: 'graphic',
            en: 'Graphic',
            ti: '.Graphic'
          }]
      }, {
        ln: 'ExternalGraphic',
        tn: null,
        ps: [{
            n: 'onlineResource',
            en: 'OnlineResource',
            ti: '.OnlineResource'
          }, {
            n: 'format',
            en: 'Format'
          }]
      }, {
        ln: 'RasterSymbolizer',
        tn: null,
        bti: '.SymbolizerType',
        ps: [{
            n: 'geometry',
            en: 'Geometry',
            ti: '.Geometry'
          }, {
            n: 'opacity',
            en: 'Opacity',
            ti: '.ParameterValueType'
          }, {
            n: 'channelSelection',
            en: 'ChannelSelection',
            ti: '.ChannelSelection'
          }, {
            n: 'overlapBehavior',
            en: 'OverlapBehavior',
            ti: '.OverlapBehavior'
          }, {
            n: 'colorMap',
            en: 'ColorMap',
            ti: '.ColorMap'
          }, {
            n: 'contrastEnhancement',
            en: 'ContrastEnhancement',
            ti: '.ContrastEnhancement'
          }, {
            n: 'shadedRelief',
            en: 'ShadedRelief',
            ti: '.ShadedRelief'
          }, {
            n: 'imageOutline',
            en: 'ImageOutline',
            ti: '.ImageOutline'
          }]
      }, {
        ln: 'LegendGraphic',
        tn: null,
        ps: [{
            n: 'graphic',
            en: 'Graphic',
            ti: '.Graphic'
          }]
      }, {
        ln: 'TextSymbolizer',
        tn: null,
        bti: '.SymbolizerType',
        ps: [{
            n: 'geometry',
            en: 'Geometry',
            ti: '.Geometry'
          }, {
            n: 'label',
            en: 'Label',
            ti: '.ParameterValueType'
          }, {
            n: 'font',
            en: 'Font',
            ti: '.Font'
          }, {
            n: 'labelPlacement',
            en: 'LabelPlacement',
            ti: '.LabelPlacement'
          }, {
            n: 'halo',
            en: 'Halo',
            ti: '.Halo'
          }, {
            n: 'fill',
            en: 'Fill',
            ti: '.Fill'
          }]
      }, {
        ln: 'ShadedRelief',
        tn: null,
        ps: [{
            n: 'brightnessOnly',
            en: 'BrightnessOnly',
            ti: 'Boolean'
          }, {
            n: 'reliefFactor',
            en: 'ReliefFactor',
            ti: 'Double'
          }]
      }, {
        ln: 'FeatureTypeConstraint',
        tn: null,
        ps: [{
            n: 'featureTypeName',
            en: 'FeatureTypeName'
          }, {
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_0_0.FilterType'
          }, {
            n: 'extent',
            col: true,
            en: 'Extent',
            ti: '.Extent'
          }]
      }, {
        ln: 'Fill',
        tn: null,
        ps: [{
            n: 'graphicFill',
            en: 'GraphicFill',
            ti: '.GraphicFill'
          }, {
            n: 'cssParameter',
            col: true,
            en: 'CssParameter',
            ti: '.CssParameter'
          }]
      }],
    eis: [{
        en: 'PointSymbolizer',
        ti: '.PointSymbolizer',
        sh: 'Symbolizer'
      }, {
        en: 'EARLIEST_ON_TOP',
        ti: '.EARLIESTONTOP'
      }, {
        en: 'Rotation',
        ti: '.ParameterValueType'
      }, {
        en: 'NamedStyle',
        ti: '.NamedStyle'
      }, {
        en: 'Normalize',
        ti: '.Normalize'
      }, {
        en: 'Name'
      }, {
        en: 'ChannelSelection',
        ti: '.ChannelSelection'
      }, {
        en: 'OnlineResource',
        ti: '.OnlineResource'
      }, {
        en: 'Radius',
        ti: '.ParameterValueType'
      }, {
        en: 'ColorMapEntry',
        ti: '.ColorMapEntry'
      }, {
        en: 'RedChannel',
        ti: '.SelectedChannelType'
      }, {
        en: 'PolygonSymbolizer',
        ti: '.PolygonSymbolizer',
        sh: 'Symbolizer'
      }, {
        en: 'MinScaleDenominator',
        ti: 'Double'
      }, {
        en: 'WellKnownName'
      }, {
        en: 'SemanticTypeIdentifier'
      }, {
        en: 'AnchorPoint',
        ti: '.AnchorPoint'
      }, {
        en: 'PointPlacement',
        ti: '.PointPlacement'
      }, {
        en: 'BlueChannel',
        ti: '.SelectedChannelType'
      }, {
        en: 'Histogram',
        ti: '.Histogram'
      }, {
        en: 'StyledLayerDescriptor',
        ti: '.StyledLayerDescriptor'
      }, {
        en: 'Value'
      }, {
        en: 'Service'
      }, {
        en: 'ShadedRelief',
        ti: '.ShadedRelief'
      }, {
        en: 'LabelPlacement',
        ti: '.LabelPlacement'
      }, {
        en: 'DisplacementY',
        ti: '.ParameterValueType'
      }, {
        en: 'ImageOutline',
        ti: '.ImageOutline'
      }, {
        en: 'Extent',
        ti: '.Extent'
      }, {
        en: 'RemoteOWS',
        ti: '.RemoteOWS'
      }, {
        en: 'Halo',
        ti: '.Halo'
      }, {
        en: 'Size',
        ti: '.ParameterValueType'
      }, {
        en: 'Stroke',
        ti: '.Stroke'
      }, {
        en: 'ContrastEnhancement',
        ti: '.ContrastEnhancement'
      }, {
        en: 'BrightnessOnly',
        ti: 'Boolean'
      }, {
        en: 'LineSymbolizer',
        ti: '.LineSymbolizer',
        sh: 'Symbolizer'
      }, {
        en: 'PerpendicularOffset',
        ti: '.ParameterValueType'
      }, {
        en: 'ReliefFactor',
        ti: 'Double'
      }, {
        en: 'FeatureTypeConstraint',
        ti: '.FeatureTypeConstraint'
      }, {
        en: 'Mark',
        ti: '.Mark'
      }, {
        en: 'Geometry',
        ti: '.Geometry'
      }, {
        en: 'FeatureTypeStyle',
        ti: '.FeatureTypeStyle'
      }, {
        en: 'FeatureTypeName'
      }, {
        en: 'AnchorPointX',
        ti: '.ParameterValueType'
      }, {
        en: 'SourceChannelName'
      }, {
        en: 'Symbolizer',
        ti: '.SymbolizerType'
      }, {
        en: 'DisplacementX',
        ti: '.ParameterValueType'
      }, {
        en: 'OverlapBehavior',
        ti: '.OverlapBehavior'
      }, {
        en: 'RANDOM',
        ti: '.RANDOM'
      }, {
        en: 'TextSymbolizer',
        ti: '.TextSymbolizer',
        sh: 'Symbolizer'
      }, {
        en: 'LinePlacement',
        ti: '.LinePlacement'
      }, {
        en: 'Font',
        ti: '.Font'
      }, {
        en: 'GreenChannel',
        ti: '.SelectedChannelType'
      }, {
        en: 'Rule',
        ti: '.Rule'
      }, {
        en: 'RasterSymbolizer',
        ti: '.RasterSymbolizer',
        sh: 'Symbolizer'
      }, {
        en: 'Opacity',
        ti: '.ParameterValueType'
      }, {
        en: 'MaxScaleDenominator',
        ti: 'Double'
      }, {
        en: 'UserLayer',
        ti: '.UserLayer'
      }, {
        en: 'Title'
      }, {
        en: 'Fill',
        ti: '.Fill'
      }, {
        en: 'Graphic',
        ti: '.Graphic'
      }, {
        en: 'GrayChannel',
        ti: '.SelectedChannelType'
      }, {
        en: 'Label',
        ti: '.ParameterValueType'
      }, {
        en: 'GraphicStroke',
        ti: '.GraphicStroke'
      }, {
        en: 'UserStyle',
        ti: '.UserStyle'
      }, {
        en: 'Format'
      }, {
        en: 'ExternalGraphic',
        ti: '.ExternalGraphic'
      }, {
        en: 'LATEST_ON_TOP',
        ti: '.LATESTONTOP'
      }, {
        en: 'GammaValue',
        ti: 'Double'
      }, {
        en: 'ElseFilter',
        ti: '.ElseFilter'
      }, {
        en: 'LegendGraphic',
        ti: '.LegendGraphic'
      }, {
        en: 'Displacement',
        ti: '.Displacement'
      }, {
        en: 'Abstract'
      }, {
        en: 'NamedLayer',
        ti: '.NamedLayer'
      }, {
        en: 'ColorMap',
        ti: '.ColorMap'
      }, {
        en: 'AVERAGE',
        ti: '.AVERAGE'
      }, {
        en: 'GraphicFill',
        ti: '.GraphicFill'
      }, {
        en: 'LayerFeatureConstraints',
        ti: '.LayerFeatureConstraints'
      }, {
        en: 'IsDefault',
        ti: 'Boolean'
      }, {
        en: 'CssParameter',
        ti: '.CssParameter'
      }, {
        en: 'AnchorPointY',
        ti: '.ParameterValueType'
      }]
  };
  return {
    SLD_1_0_0: SLD_1_0_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], SLD_1_0_0_Module_Factory);
}
else {
  var SLD_1_0_0_Module = SLD_1_0_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.SLD_1_0_0 = SLD_1_0_0_Module.SLD_1_0_0;
  }
  else {
    var SLD_1_0_0 = SLD_1_0_0_Module.SLD_1_0_0;
  }
}
},{}],10:[function(require,module,exports){
var SMIL_2_0_Module_Factory = function () {
  var SMIL_2_0 = {
    n: 'SMIL_2_0',
    dens: 'http:\/\/www.w3.org\/2001\/SMIL20\/',
    deps: ['SMIL_2_0_Language'],
    tis: [{
        ln: 'SetPrototype',
        tn: 'setPrototype',
        ps: [{
            n: 'to',
            an: {
              lp: 'to'
            },
            t: 'a'
          }, {
            n: 'attributeName',
            an: {
              lp: 'attributeName'
            },
            t: 'a'
          }, {
            n: 'attributeType',
            an: {
              lp: 'attributeType'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnimatePrototype',
        tn: 'animatePrototype',
        ps: [{
            n: 'additive',
            an: {
              lp: 'additive'
            },
            t: 'a'
          }, {
            n: 'accumulate',
            an: {
              lp: 'accumulate'
            },
            t: 'a'
          }, {
            n: 'attributeName',
            an: {
              lp: 'attributeName'
            },
            t: 'a'
          }, {
            n: 'attributeType',
            an: {
              lp: 'attributeType'
            },
            t: 'a'
          }, {
            n: 'from',
            an: {
              lp: 'from'
            },
            t: 'a'
          }, {
            n: 'by',
            an: {
              lp: 'by'
            },
            t: 'a'
          }, {
            n: 'values',
            an: {
              lp: 'values'
            },
            t: 'a'
          }, {
            n: 'to',
            an: {
              lp: 'to'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnimateColorPrototype',
        tn: 'animateColorPrototype',
        ps: [{
            n: 'additive',
            an: {
              lp: 'additive'
            },
            t: 'a'
          }, {
            n: 'accumulate',
            an: {
              lp: 'accumulate'
            },
            t: 'a'
          }, {
            n: 'from',
            an: {
              lp: 'from'
            },
            t: 'a'
          }, {
            n: 'by',
            an: {
              lp: 'by'
            },
            t: 'a'
          }, {
            n: 'values',
            an: {
              lp: 'values'
            },
            t: 'a'
          }, {
            n: 'to',
            an: {
              lp: 'to'
            },
            t: 'a'
          }, {
            n: 'attributeName',
            an: {
              lp: 'attributeName'
            },
            t: 'a'
          }, {
            n: 'attributeType',
            an: {
              lp: 'attributeType'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnimateMotionPrototype',
        tn: 'animateMotionPrototype',
        ps: [{
            n: 'origin',
            an: {
              lp: 'origin'
            },
            t: 'a'
          }, {
            n: 'additive',
            an: {
              lp: 'additive'
            },
            t: 'a'
          }, {
            n: 'accumulate',
            an: {
              lp: 'accumulate'
            },
            t: 'a'
          }, {
            n: 'from',
            an: {
              lp: 'from'
            },
            t: 'a'
          }, {
            n: 'by',
            an: {
              lp: 'by'
            },
            t: 'a'
          }, {
            n: 'values',
            an: {
              lp: 'values'
            },
            t: 'a'
          }, {
            n: 'to',
            an: {
              lp: 'to'
            },
            t: 'a'
          }]
      }, {
        t: 'enum',
        ln: 'SyncBehaviorDefaultType',
        vs: ['canSlip', 'locked', 'independent', 'inherit']
      }, {
        t: 'enum',
        ln: 'FillTimingAttrsType',
        vs: ['remove', 'freeze', 'hold', 'auto', 'default', 'transition']
      }, {
        t: 'enum',
        ln: 'RestartDefaultType',
        vs: ['never', 'always', 'whenNotActive', 'inherit']
      }, {
        t: 'enum',
        ln: 'RestartTimingType',
        vs: ['never', 'always', 'whenNotActive', 'default']
      }, {
        t: 'enum',
        ln: 'SyncBehaviorType',
        vs: ['canSlip', 'locked', 'independent', 'default']
      }, {
        t: 'enum',
        ln: 'FillDefaultType',
        vs: ['remove', 'freeze', 'hold', 'auto', 'inherit', 'transition']
      }],
    eis: [{
        en: 'set',
        ti: 'SMIL_2_0_Language.SetType',
        sh: {
          lp: 'set',
          ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/Language'
        }
      }, {
        en: 'animateColor',
        ti: 'SMIL_2_0_Language.AnimateColorType',
        sh: {
          lp: 'animateColor',
          ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/Language'
        }
      }, {
        en: 'animateMotion',
        ti: 'SMIL_2_0_Language.AnimateMotionType',
        sh: {
          lp: 'animateMotion',
          ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/Language'
        }
      }, {
        en: 'animate',
        ti: 'SMIL_2_0_Language.AnimateType',
        sh: {
          lp: 'animate',
          ns: 'http:\/\/www.w3.org\/2001\/SMIL20\/Language'
        }
      }]
  };
  return {
    SMIL_2_0: SMIL_2_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], SMIL_2_0_Module_Factory);
}
else {
  var SMIL_2_0_Module = SMIL_2_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.SMIL_2_0 = SMIL_2_0_Module.SMIL_2_0;
  }
  else {
    var SMIL_2_0 = SMIL_2_0_Module.SMIL_2_0;
  }
}
},{}],11:[function(require,module,exports){
var SMIL_2_0_Language_Module_Factory = function () {
  var SMIL_2_0_Language = {
    n: 'SMIL_2_0_Language',
    dens: 'http:\/\/www.w3.org\/2001\/SMIL20\/Language',
    deps: ['SMIL_2_0'],
    tis: [{
        ln: 'AnimateColorType',
        tn: 'animateColorType',
        bti: 'SMIL_2_0.AnimateColorPrototype',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'any',
            col: true,
            mx: false,
            t: 'ae'
          }, {
            n: 'targetElement',
            ti: 'IDREF',
            an: {
              lp: 'targetElement'
            },
            t: 'a'
          }, {
            n: 'calcMode',
            an: {
              lp: 'calcMode'
            },
            t: 'a'
          }, {
            n: 'alt',
            an: {
              lp: 'alt'
            },
            t: 'a'
          }, {
            n: 'longdesc',
            an: {
              lp: 'longdesc'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }, {
            n: 'clazz',
            an: {
              lp: 'class'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }, {
            n: 'fillDefault',
            an: {
              lp: 'fillDefault'
            },
            t: 'a'
          }, {
            n: 'dur',
            an: {
              lp: 'dur'
            },
            t: 'a'
          }, {
            n: 'repeatDur',
            an: {
              lp: 'repeatDur'
            },
            t: 'a'
          }, {
            n: 'repeatCount',
            ti: 'Decimal',
            an: {
              lp: 'repeatCount'
            },
            t: 'a'
          }, {
            n: 'min',
            an: {
              lp: 'min'
            },
            t: 'a'
          }, {
            n: 'max',
            an: {
              lp: 'max'
            },
            t: 'a'
          }, {
            n: 'begin',
            an: {
              lp: 'begin'
            },
            t: 'a'
          }, {
            n: 'end',
            an: {
              lp: 'end'
            },
            t: 'a'
          }, {
            n: 'repeat',
            ti: 'Integer',
            an: {
              lp: 'repeat'
            },
            t: 'a'
          }, {
            n: 'restartDefault',
            an: {
              lp: 'restartDefault'
            },
            t: 'a'
          }, {
            n: 'syncBehavior',
            an: {
              lp: 'syncBehavior'
            },
            t: 'a'
          }, {
            n: 'syncTolerance',
            an: {
              lp: 'syncTolerance'
            },
            t: 'a'
          }, {
            n: 'restart',
            an: {
              lp: 'restart'
            },
            t: 'a'
          }, {
            n: 'syncBehaviorDefault',
            an: {
              lp: 'syncBehaviorDefault'
            },
            t: 'a'
          }, {
            n: 'syncToleranceDefault',
            an: {
              lp: 'syncToleranceDefault'
            },
            t: 'a'
          }, {
            n: 'fill',
            an: {
              lp: 'fill'
            },
            t: 'a'
          }, {
            n: 'skipContent',
            ti: 'Boolean',
            an: {
              lp: 'skip-content'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnimateType',
        tn: 'animateType',
        bti: 'SMIL_2_0.AnimatePrototype',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'any',
            col: true,
            mx: false,
            t: 'ae'
          }, {
            n: 'alt',
            an: {
              lp: 'alt'
            },
            t: 'a'
          }, {
            n: 'longdesc',
            an: {
              lp: 'longdesc'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }, {
            n: 'clazz',
            an: {
              lp: 'class'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }, {
            n: 'skipContent',
            ti: 'Boolean',
            an: {
              lp: 'skip-content'
            },
            t: 'a'
          }, {
            n: 'targetElement',
            ti: 'IDREF',
            an: {
              lp: 'targetElement'
            },
            t: 'a'
          }, {
            n: 'fillDefault',
            an: {
              lp: 'fillDefault'
            },
            t: 'a'
          }, {
            n: 'dur',
            an: {
              lp: 'dur'
            },
            t: 'a'
          }, {
            n: 'repeatDur',
            an: {
              lp: 'repeatDur'
            },
            t: 'a'
          }, {
            n: 'repeatCount',
            ti: 'Decimal',
            an: {
              lp: 'repeatCount'
            },
            t: 'a'
          }, {
            n: 'min',
            an: {
              lp: 'min'
            },
            t: 'a'
          }, {
            n: 'max',
            an: {
              lp: 'max'
            },
            t: 'a'
          }, {
            n: 'begin',
            an: {
              lp: 'begin'
            },
            t: 'a'
          }, {
            n: 'end',
            an: {
              lp: 'end'
            },
            t: 'a'
          }, {
            n: 'repeat',
            ti: 'Integer',
            an: {
              lp: 'repeat'
            },
            t: 'a'
          }, {
            n: 'restartDefault',
            an: {
              lp: 'restartDefault'
            },
            t: 'a'
          }, {
            n: 'syncBehavior',
            an: {
              lp: 'syncBehavior'
            },
            t: 'a'
          }, {
            n: 'syncTolerance',
            an: {
              lp: 'syncTolerance'
            },
            t: 'a'
          }, {
            n: 'restart',
            an: {
              lp: 'restart'
            },
            t: 'a'
          }, {
            n: 'syncBehaviorDefault',
            an: {
              lp: 'syncBehaviorDefault'
            },
            t: 'a'
          }, {
            n: 'syncToleranceDefault',
            an: {
              lp: 'syncToleranceDefault'
            },
            t: 'a'
          }, {
            n: 'fill',
            an: {
              lp: 'fill'
            },
            t: 'a'
          }, {
            n: 'calcMode',
            an: {
              lp: 'calcMode'
            },
            t: 'a'
          }]
      }, {
        ln: 'SetType',
        tn: 'setType',
        bti: 'SMIL_2_0.SetPrototype',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'any',
            col: true,
            mx: false,
            t: 'ae'
          }, {
            n: 'targetElement',
            ti: 'IDREF',
            an: {
              lp: 'targetElement'
            },
            t: 'a'
          }, {
            n: 'alt',
            an: {
              lp: 'alt'
            },
            t: 'a'
          }, {
            n: 'longdesc',
            an: {
              lp: 'longdesc'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }, {
            n: 'clazz',
            an: {
              lp: 'class'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }, {
            n: 'fillDefault',
            an: {
              lp: 'fillDefault'
            },
            t: 'a'
          }, {
            n: 'dur',
            an: {
              lp: 'dur'
            },
            t: 'a'
          }, {
            n: 'repeatDur',
            an: {
              lp: 'repeatDur'
            },
            t: 'a'
          }, {
            n: 'repeatCount',
            ti: 'Decimal',
            an: {
              lp: 'repeatCount'
            },
            t: 'a'
          }, {
            n: 'min',
            an: {
              lp: 'min'
            },
            t: 'a'
          }, {
            n: 'max',
            an: {
              lp: 'max'
            },
            t: 'a'
          }, {
            n: 'begin',
            an: {
              lp: 'begin'
            },
            t: 'a'
          }, {
            n: 'end',
            an: {
              lp: 'end'
            },
            t: 'a'
          }, {
            n: 'repeat',
            ti: 'Integer',
            an: {
              lp: 'repeat'
            },
            t: 'a'
          }, {
            n: 'restartDefault',
            an: {
              lp: 'restartDefault'
            },
            t: 'a'
          }, {
            n: 'syncBehavior',
            an: {
              lp: 'syncBehavior'
            },
            t: 'a'
          }, {
            n: 'syncTolerance',
            an: {
              lp: 'syncTolerance'
            },
            t: 'a'
          }, {
            n: 'restart',
            an: {
              lp: 'restart'
            },
            t: 'a'
          }, {
            n: 'syncBehaviorDefault',
            an: {
              lp: 'syncBehaviorDefault'
            },
            t: 'a'
          }, {
            n: 'syncToleranceDefault',
            an: {
              lp: 'syncToleranceDefault'
            },
            t: 'a'
          }, {
            n: 'fill',
            an: {
              lp: 'fill'
            },
            t: 'a'
          }, {
            n: 'skipContent',
            ti: 'Boolean',
            an: {
              lp: 'skip-content'
            },
            t: 'a'
          }]
      }, {
        ln: 'AnimateMotionType',
        tn: 'animateMotionType',
        bti: 'SMIL_2_0.AnimateMotionPrototype',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'any',
            col: true,
            mx: false,
            t: 'ae'
          }, {
            n: 'calcMode',
            an: {
              lp: 'calcMode'
            },
            t: 'a'
          }, {
            n: 'fillDefault',
            an: {
              lp: 'fillDefault'
            },
            t: 'a'
          }, {
            n: 'dur',
            an: {
              lp: 'dur'
            },
            t: 'a'
          }, {
            n: 'repeatDur',
            an: {
              lp: 'repeatDur'
            },
            t: 'a'
          }, {
            n: 'repeatCount',
            ti: 'Decimal',
            an: {
              lp: 'repeatCount'
            },
            t: 'a'
          }, {
            n: 'min',
            an: {
              lp: 'min'
            },
            t: 'a'
          }, {
            n: 'max',
            an: {
              lp: 'max'
            },
            t: 'a'
          }, {
            n: 'begin',
            an: {
              lp: 'begin'
            },
            t: 'a'
          }, {
            n: 'end',
            an: {
              lp: 'end'
            },
            t: 'a'
          }, {
            n: 'repeat',
            ti: 'Integer',
            an: {
              lp: 'repeat'
            },
            t: 'a'
          }, {
            n: 'restartDefault',
            an: {
              lp: 'restartDefault'
            },
            t: 'a'
          }, {
            n: 'syncBehavior',
            an: {
              lp: 'syncBehavior'
            },
            t: 'a'
          }, {
            n: 'syncTolerance',
            an: {
              lp: 'syncTolerance'
            },
            t: 'a'
          }, {
            n: 'restart',
            an: {
              lp: 'restart'
            },
            t: 'a'
          }, {
            n: 'syncBehaviorDefault',
            an: {
              lp: 'syncBehaviorDefault'
            },
            t: 'a'
          }, {
            n: 'syncToleranceDefault',
            an: {
              lp: 'syncToleranceDefault'
            },
            t: 'a'
          }, {
            n: 'fill',
            an: {
              lp: 'fill'
            },
            t: 'a'
          }, {
            n: 'skipContent',
            ti: 'Boolean',
            an: {
              lp: 'skip-content'
            },
            t: 'a'
          }, {
            n: 'targetElement',
            ti: 'IDREF',
            an: {
              lp: 'targetElement'
            },
            t: 'a'
          }, {
            n: 'alt',
            an: {
              lp: 'alt'
            },
            t: 'a'
          }, {
            n: 'longdesc',
            an: {
              lp: 'longdesc'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }, {
            n: 'clazz',
            an: {
              lp: 'class'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }],
    eis: [{
        en: 'animateColor',
        ti: '.AnimateColorType'
      }, {
        en: 'set',
        ti: '.SetType'
      }, {
        en: 'animateMotion',
        ti: '.AnimateMotionType'
      }, {
        en: 'animate',
        ti: '.AnimateType'
      }]
  };
  return {
    SMIL_2_0_Language: SMIL_2_0_Language
  };
};
if (typeof define === 'function' && define.amd) {
  define([], SMIL_2_0_Language_Module_Factory);
}
else {
  var SMIL_2_0_Language_Module = SMIL_2_0_Language_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.SMIL_2_0_Language = SMIL_2_0_Language_Module.SMIL_2_0_Language;
  }
  else {
    var SMIL_2_0_Language = SMIL_2_0_Language_Module.SMIL_2_0_Language;
  }
}
},{}],12:[function(require,module,exports){
var WFS_1_1_0_Module_Factory = function () {
  var WFS_1_1_0 = {
    n: 'WFS_1_1_0',
    dens: 'http:\/\/www.opengis.net\/wfs',
    deps: ['OWS_1_0_0', 'Filter_1_1_0', 'GML_3_1_1'],
    tis: [{
        ln: 'TransactionResponseType',
        ps: [{
            n: 'transactionSummary',
            en: 'TransactionSummary',
            ti: '.TransactionSummaryType'
          }, {
            n: 'transactionResults',
            en: 'TransactionResults',
            ti: '.TransactionResultsType'
          }, {
            n: 'insertResults',
            en: 'InsertResults',
            ti: '.InsertResultsType'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }]
      }, {
        ln: 'InsertElementType',
        ps: [{
            n: 'feature',
            col: true,
            mx: false,
            dom: false,
            en: {
              lp: '_Feature',
              ns: 'http:\/\/www.opengis.net\/gml'
            },
            ti: 'GML_3_1_1.AbstractFeatureType',
            t: 'er'
          }, {
            n: 'idgen',
            an: {
              lp: 'idgen'
            },
            t: 'a'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }, {
            n: 'inputFormat',
            an: {
              lp: 'inputFormat'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }]
      }, {
        ln: 'TransactionType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'lockId',
            en: 'LockId'
          }, {
            n: 'insertOrUpdateOrDelete',
            col: true,
            etis: [{
                en: 'Insert',
                ti: '.InsertElementType'
              }, {
                en: 'Update',
                ti: '.UpdateElementType'
              }, {
                en: 'Delete',
                ti: '.DeleteElementType'
              }, {
                en: 'Native',
                ti: '.NativeType'
              }],
            t: 'es'
          }, {
            n: 'releaseAction',
            an: {
              lp: 'releaseAction'
            },
            t: 'a'
          }]
      }, {
        ln: 'FeatureTypeType.NoSRS',
        tn: null
      }, {
        ln: 'UpdateElementType',
        ps: [{
            n: 'property',
            col: true,
            en: 'Property',
            ti: '.PropertyType'
          }, {
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FilterType'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }, {
            n: 'typeName',
            ti: 'QName',
            an: {
              lp: 'typeName'
            },
            t: 'a'
          }, {
            n: 'inputFormat',
            an: {
              lp: 'inputFormat'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }]
      }, {
        ln: 'OutputFormatListType',
        ps: [{
            n: 'format',
            col: true,
            en: 'Format'
          }]
      }, {
        ln: 'QueryType',
        ps: [{
            n: 'propertyNameOrXlinkPropertyNameOrFunction',
            col: true,
            etis: [{
                en: 'PropertyName'
              }, {
                en: 'XlinkPropertyName',
                ti: '.XlinkPropertyName'
              }, {
                en: {
                  lp: 'Function',
                  ns: 'http:\/\/www.opengis.net\/ogc'
                },
                ti: 'Filter_1_1_0.FunctionType'
              }],
            t: 'es'
          }, {
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FilterType'
          }, {
            n: 'sortBy',
            en: {
              lp: 'SortBy',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.SortByType'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }, {
            n: 'typeName',
            ti: {
              t: 'l',
              bti: 'QName'
            },
            an: {
              lp: 'typeName'
            },
            t: 'a'
          }, {
            n: 'featureVersion',
            an: {
              lp: 'featureVersion'
            },
            t: 'a'
          }, {
            n: 'srsName',
            an: {
              lp: 'srsName'
            },
            t: 'a'
          }]
      }, {
        ln: 'GetFeatureType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'query',
            col: true,
            en: 'Query',
            ti: '.QueryType'
          }, {
            n: 'resultType',
            an: {
              lp: 'resultType'
            },
            t: 'a'
          }, {
            n: 'outputFormat',
            an: {
              lp: 'outputFormat'
            },
            t: 'a'
          }, {
            n: 'maxFeatures',
            ti: 'Integer',
            an: {
              lp: 'maxFeatures'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkDepth',
            an: {
              lp: 'traverseXlinkDepth'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkExpiry',
            ti: 'Integer',
            an: {
              lp: 'traverseXlinkExpiry'
            },
            t: 'a'
          }]
      }, {
        ln: 'BaseRequestType',
        ps: [{
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }]
      }, {
        ln: 'LockType',
        ps: [{
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FilterType'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }, {
            n: 'typeName',
            ti: 'QName',
            an: {
              lp: 'typeName'
            },
            t: 'a'
          }]
      }, {
        ln: 'InsertedFeatureType',
        ps: [{
            n: 'featureId',
            col: true,
            en: {
              lp: 'FeatureId',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FeatureIdType'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }]
      }, {
        ln: 'TransactionSummaryType',
        ps: [{
            n: 'totalInserted',
            ti: 'Integer'
          }, {
            n: 'totalUpdated',
            ti: 'Integer'
          }, {
            n: 'totalDeleted',
            ti: 'Integer'
          }]
      }, {
        ln: 'PropertyType',
        ps: [{
            n: 'name',
            en: 'Name',
            ti: 'QName'
          }, {
            n: 'value',
            en: 'Value',
            ti: 'AnyType'
          }]
      }, {
        ln: 'GetFeatureWithLockType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'query',
            col: true,
            en: 'Query',
            ti: '.QueryType'
          }, {
            n: 'expiry',
            ti: 'Integer',
            an: {
              lp: 'expiry'
            },
            t: 'a'
          }, {
            n: 'resultType',
            an: {
              lp: 'resultType'
            },
            t: 'a'
          }, {
            n: 'outputFormat',
            an: {
              lp: 'outputFormat'
            },
            t: 'a'
          }, {
            n: 'maxFeatures',
            ti: 'Integer',
            an: {
              lp: 'maxFeatures'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkDepth',
            an: {
              lp: 'traverseXlinkDepth'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkExpiry',
            ti: 'Integer',
            an: {
              lp: 'traverseXlinkExpiry'
            },
            t: 'a'
          }]
      }, {
        ln: 'GMLObjectTypeListType',
        ps: [{
            n: 'gmlObjectType',
            col: true,
            en: 'GMLObjectType',
            ti: '.GMLObjectTypeType'
          }]
      }, {
        ln: 'TransactionResultsType',
        ps: [{
            n: 'action',
            col: true,
            en: 'Action',
            ti: '.ActionType'
          }]
      }, {
        ln: 'FeaturesLockedType',
        ps: [{
            n: 'featureId',
            col: true,
            en: {
              lp: 'FeatureId',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FeatureIdType'
          }]
      }, {
        ln: 'NativeType',
        ps: [{
            n: 'vendorId',
            an: {
              lp: 'vendorId'
            },
            t: 'a'
          }, {
            n: 'safeToIgnore',
            ti: 'Boolean',
            an: {
              lp: 'safeToIgnore'
            },
            t: 'a'
          }]
      }, {
        ln: 'DescribeFeatureTypeType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'typeName',
            col: true,
            en: 'TypeName',
            ti: 'QName'
          }, {
            n: 'outputFormat',
            an: {
              lp: 'outputFormat'
            },
            t: 'a'
          }]
      }, {
        ln: 'MetadataURLType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'type',
            an: {
              lp: 'type'
            },
            t: 'a'
          }, {
            n: 'format',
            an: {
              lp: 'format'
            },
            t: 'a'
          }]
      }, {
        ln: 'OperationsType',
        ps: [{
            n: 'operation',
            col: true,
            en: 'Operation'
          }]
      }, {
        ln: 'GMLObjectTypeType',
        ps: [{
            n: 'name',
            en: 'Name',
            ti: 'QName'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'keywords',
            col: true,
            en: {
              lp: 'Keywords',
              ns: 'http:\/\/www.opengis.net\/ows'
            },
            ti: 'OWS_1_0_0.KeywordsType'
          }, {
            n: 'outputFormats',
            en: 'OutputFormats',
            ti: '.OutputFormatListType'
          }]
      }, {
        ln: 'FeatureTypeType',
        ps: [{
            n: 'name',
            en: 'Name',
            ti: 'QName'
          }, {
            n: 'title',
            en: 'Title'
          }, {
            n: '_abstract',
            en: 'Abstract'
          }, {
            n: 'keywords',
            col: true,
            en: {
              lp: 'Keywords',
              ns: 'http:\/\/www.opengis.net\/ows'
            },
            ti: 'OWS_1_0_0.KeywordsType'
          }, {
            n: 'defaultSRS',
            en: 'DefaultSRS'
          }, {
            n: 'otherSRS',
            col: true,
            en: 'OtherSRS'
          }, {
            n: 'noSRS',
            en: 'NoSRS',
            ti: '.FeatureTypeType.NoSRS'
          }, {
            n: 'operations',
            en: 'Operations',
            ti: '.OperationsType'
          }, {
            n: 'outputFormats',
            en: 'OutputFormats',
            ti: '.OutputFormatListType'
          }, {
            n: 'wgs84BoundingBox',
            col: true,
            en: {
              lp: 'WGS84BoundingBox',
              ns: 'http:\/\/www.opengis.net\/ows'
            },
            ti: 'OWS_1_0_0.WGS84BoundingBoxType'
          }, {
            n: 'metadataURL',
            col: true,
            en: 'MetadataURL',
            ti: '.MetadataURLType'
          }]
      }, {
        ln: 'InsertResultsType',
        ps: [{
            n: 'feature',
            col: true,
            en: 'Feature',
            ti: '.InsertedFeatureType'
          }]
      }, {
        ln: 'LockFeatureResponseType',
        ps: [{
            n: 'lockId',
            en: 'LockId'
          }, {
            n: 'featuresLocked',
            en: 'FeaturesLocked',
            ti: '.FeaturesLockedType'
          }, {
            n: 'featuresNotLocked',
            en: 'FeaturesNotLocked',
            ti: '.FeaturesNotLockedType'
          }]
      }, {
        ln: 'FeatureCollectionType',
        bti: 'GML_3_1_1.AbstractFeatureCollectionType',
        ps: [{
            n: 'lockId',
            an: {
              lp: 'lockId'
            },
            t: 'a'
          }, {
            n: 'timeStamp',
            ti: 'Calendar',
            an: {
              lp: 'timeStamp'
            },
            t: 'a'
          }, {
            n: 'numberOfFeatures',
            ti: 'Integer',
            an: {
              lp: 'numberOfFeatures'
            },
            t: 'a'
          }]
      }, {
        ln: 'FeaturesNotLockedType',
        ps: [{
            n: 'featureId',
            col: true,
            en: {
              lp: 'FeatureId',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FeatureIdType'
          }]
      }, {
        ln: 'ActionType',
        ps: [{
            n: 'message',
            en: 'Message'
          }, {
            n: 'locator',
            an: {
              lp: 'locator'
            },
            t: 'a'
          }, {
            n: 'code',
            an: {
              lp: 'code'
            },
            t: 'a'
          }]
      }, {
        ln: 'LockFeatureType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'lock',
            col: true,
            en: 'Lock',
            ti: '.LockType'
          }, {
            n: 'expiry',
            ti: 'Integer',
            an: {
              lp: 'expiry'
            },
            t: 'a'
          }, {
            n: 'lockAction',
            an: {
              lp: 'lockAction'
            },
            t: 'a'
          }]
      }, {
        ln: 'XlinkPropertyName',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'traverseXlinkDepth',
            an: {
              lp: 'traverseXlinkDepth'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkExpiry',
            ti: 'Integer',
            an: {
              lp: 'traverseXlinkExpiry'
            },
            t: 'a'
          }]
      }, {
        ln: 'GetCapabilitiesType',
        bti: 'OWS_1_0_0.GetCapabilitiesType',
        ps: [{
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }]
      }, {
        ln: 'WFSCapabilitiesType',
        tn: 'WFS_CapabilitiesType',
        bti: 'OWS_1_0_0.CapabilitiesBaseType',
        ps: [{
            n: 'featureTypeList',
            en: 'FeatureTypeList',
            ti: '.FeatureTypeListType'
          }, {
            n: 'servesGMLObjectTypeList',
            en: 'ServesGMLObjectTypeList',
            ti: '.GMLObjectTypeListType'
          }, {
            n: 'supportsGMLObjectTypeList',
            en: 'SupportsGMLObjectTypeList',
            ti: '.GMLObjectTypeListType'
          }, {
            n: 'filterCapabilities',
            en: {
              lp: 'Filter_Capabilities',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FilterCapabilities'
          }]
      }, {
        ln: 'GetGmlObjectType',
        bti: '.BaseRequestType',
        ps: [{
            n: 'gmlObjectId',
            en: {
              lp: 'GmlObjectId',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.GmlObjectIdType'
          }, {
            n: 'outputFormat',
            an: {
              lp: 'outputFormat'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkDepth',
            an: {
              lp: 'traverseXlinkDepth'
            },
            t: 'a'
          }, {
            n: 'traverseXlinkExpiry',
            ti: 'Integer',
            an: {
              lp: 'traverseXlinkExpiry'
            },
            t: 'a'
          }]
      }, {
        ln: 'DeleteElementType',
        ps: [{
            n: 'filter',
            en: {
              lp: 'Filter',
              ns: 'http:\/\/www.opengis.net\/ogc'
            },
            ti: 'Filter_1_1_0.FilterType'
          }, {
            n: 'handle',
            an: {
              lp: 'handle'
            },
            t: 'a'
          }, {
            n: 'typeName',
            ti: 'QName',
            an: {
              lp: 'typeName'
            },
            t: 'a'
          }]
      }, {
        ln: 'FeatureTypeListType',
        ps: [{
            n: 'operations',
            en: 'Operations',
            ti: '.OperationsType'
          }, {
            n: 'featureType',
            col: true,
            en: 'FeatureType',
            ti: '.FeatureTypeType'
          }]
      }, {
        t: 'enum',
        ln: 'OperationType',
        vs: ['Insert', 'Update', 'Delete', 'Query', 'Lock', 'GetGmlObject']
      }, {
        t: 'enum',
        ln: 'ResultTypeType',
        vs: ['results', 'hits']
      }, {
        t: 'enum',
        ln: 'IdentifierGenerationOptionType',
        vs: ['UseExisting', 'ReplaceDuplicate', 'GenerateNew']
      }, {
        t: 'enum',
        ln: 'AllSomeType',
        vs: ['ALL', 'SOME']
      }],
    eis: [{
        en: 'TransactionResponse',
        ti: '.TransactionResponseType'
      }, {
        en: 'Native',
        ti: '.NativeType'
      }, {
        en: 'Insert',
        ti: '.InsertElementType'
      }, {
        en: 'FeatureCollection',
        ti: '.FeatureCollectionType',
        sh: {
          lp: '_FeatureCollection',
          ns: 'http:\/\/www.opengis.net\/gml'
        }
      }, {
        en: 'GetGmlObject',
        ti: '.GetGmlObjectType'
      }, {
        en: 'Property',
        ti: '.PropertyType'
      }, {
        en: 'XlinkPropertyName',
        ti: '.XlinkPropertyName'
      }, {
        en: 'Update',
        ti: '.UpdateElementType'
      }, {
        en: 'WFS_Capabilities',
        ti: '.WFSCapabilitiesType'
      }, {
        en: 'GetFeatureWithLock',
        ti: '.GetFeatureWithLockType'
      }, {
        en: 'SupportsGMLObjectTypeList',
        ti: '.GMLObjectTypeListType'
      }, {
        en: 'GetCapabilities',
        ti: '.GetCapabilitiesType'
      }, {
        en: 'PropertyName'
      }, {
        en: 'LockFeatureResponse',
        ti: '.LockFeatureResponseType'
      }, {
        en: 'ServesGMLObjectTypeList',
        ti: '.GMLObjectTypeListType'
      }, {
        en: 'Query',
        ti: '.QueryType'
      }, {
        en: 'DescribeFeatureType',
        ti: '.DescribeFeatureTypeType'
      }, {
        en: 'LockFeature',
        ti: '.LockFeatureType'
      }, {
        en: 'FeatureTypeList',
        ti: '.FeatureTypeListType'
      }, {
        en: 'Delete',
        ti: '.DeleteElementType'
      }, {
        en: 'GetFeature',
        ti: '.GetFeatureType'
      }, {
        en: 'LockId'
      }, {
        en: 'Transaction',
        ti: '.TransactionType'
      }]
  };
  return {
    WFS_1_1_0: WFS_1_1_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], WFS_1_1_0_Module_Factory);
}
else {
  var WFS_1_1_0_Module = WFS_1_1_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.WFS_1_1_0 = WFS_1_1_0_Module.WFS_1_1_0;
  }
  else {
    var WFS_1_1_0 = WFS_1_1_0_Module.WFS_1_1_0;
  }
}
},{}],13:[function(require,module,exports){
var WMSC_1_1_1_Module_Factory = function () {
  var WMSC_1_1_1 = {
    n: 'WMSC_1_1_1',
    tis: [{
        ln: 'Exception',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }]
      }, {
        ln: 'Format',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'VendorSpecificCapabilities',
        tn: null,
        ps: [{
            n: 'tileSet',
            col: true,
            en: {
              lp: 'TileSet'
            },
            ti: '.TileSet'
          }]
      }, {
        ln: 'HTTP',
        tn: null,
        ps: [{
            n: 'getOrPost',
            col: true,
            etis: [{
                en: {
                  lp: 'Get'
                },
                ti: '.Get'
              }, {
                en: {
                  lp: 'Post'
                },
                ti: '.Post'
              }],
            t: 'es'
          }]
      }, {
        ln: 'GetCapabilities',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'MetadataURL',
        tn: null,
        ps: [{
            n: 'type',
            an: {
              lp: 'type'
            },
            t: 'a'
          }, {
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'PutStyles',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'LayerDescription',
        tn: null,
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'wfs',
            an: {
              lp: 'wfs'
            },
            t: 'a'
          }, {
            n: 'owsType',
            an: {
              lp: 'owsType'
            },
            t: 'a'
          }, {
            n: 'owsURL',
            an: {
              lp: 'owsURL'
            },
            t: 'a'
          }, {
            n: 'query',
            col: true,
            en: {
              lp: 'Query'
            },
            ti: '.Query'
          }]
      }, {
        ln: 'Dimension',
        tn: null,
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'units',
            an: {
              lp: 'units'
            },
            t: 'a'
          }, {
            n: 'unitSymbol',
            an: {
              lp: 'unitSymbol'
            },
            t: 'a'
          }]
      }, {
        ln: 'StyleURL',
        tn: null,
        ps: [{
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'GetMap',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'GetFeatureInfo',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'Layer',
        tn: null,
        ps: [{
            n: 'queryable',
            an: {
              lp: 'queryable'
            },
            t: 'a'
          }, {
            n: 'cascaded',
            an: {
              lp: 'cascaded'
            },
            t: 'a'
          }, {
            n: 'opaque',
            an: {
              lp: 'opaque'
            },
            t: 'a'
          }, {
            n: 'noSubsets',
            an: {
              lp: 'noSubsets'
            },
            t: 'a'
          }, {
            n: 'fixedWidth',
            an: {
              lp: 'fixedWidth'
            },
            t: 'a'
          }, {
            n: 'fixedHeight',
            an: {
              lp: 'fixedHeight'
            },
            t: 'a'
          }, {
            n: 'name',
            en: {
              lp: 'Name'
            }
          }, {
            n: 'title',
            en: {
              lp: 'Title'
            }
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract'
            }
          }, {
            n: 'keywordList',
            en: {
              lp: 'KeywordList'
            },
            ti: '.KeywordList'
          }, {
            n: 'srs',
            col: true,
            en: {
              lp: 'SRS'
            },
            ti: '.SRS'
          }, {
            n: 'latLonBoundingBox',
            en: {
              lp: 'LatLonBoundingBox'
            },
            ti: '.LatLonBoundingBox'
          }, {
            n: 'boundingBox',
            col: true,
            en: {
              lp: 'BoundingBox'
            },
            ti: '.BoundingBox'
          }, {
            n: 'dimension',
            col: true,
            en: {
              lp: 'Dimension'
            },
            ti: '.Dimension'
          }, {
            n: 'extent',
            col: true,
            en: {
              lp: 'Extent'
            },
            ti: '.Extent'
          }, {
            n: 'attribution',
            en: {
              lp: 'Attribution'
            },
            ti: '.Attribution'
          }, {
            n: 'authorityURL',
            col: true,
            en: {
              lp: 'AuthorityURL'
            },
            ti: '.AuthorityURL'
          }, {
            n: 'identifier',
            col: true,
            en: {
              lp: 'Identifier'
            },
            ti: '.Identifier'
          }, {
            n: 'metadataURL',
            col: true,
            en: {
              lp: 'MetadataURL'
            },
            ti: '.MetadataURL'
          }, {
            n: 'dataURL',
            col: true,
            en: {
              lp: 'DataURL'
            },
            ti: '.DataURL'
          }, {
            n: 'featureListURL',
            col: true,
            en: {
              lp: 'FeatureListURL'
            },
            ti: '.FeatureListURL'
          }, {
            n: 'style',
            col: true,
            en: {
              lp: 'Style'
            },
            ti: '.Style'
          }, {
            n: 'scaleHint',
            en: {
              lp: 'ScaleHint'
            },
            ti: '.ScaleHint'
          }, {
            n: 'layer',
            col: true,
            en: {
              lp: 'Layer'
            },
            ti: '.Layer'
          }]
      }, {
        ln: 'Layers',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'LogoURL',
        tn: null,
        ps: [{
            n: 'width',
            an: {
              lp: 'width'
            },
            t: 'a'
          }, {
            n: 'height',
            an: {
              lp: 'height'
            },
            t: 'a'
          }, {
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'ScaleHint',
        tn: null,
        ps: [{
            n: 'min',
            an: {
              lp: 'min'
            },
            t: 'a'
          }, {
            n: 'max',
            an: {
              lp: 'max'
            },
            t: 'a'
          }]
      }, {
        ln: 'Query',
        tn: null,
        ps: [{
            n: 'typeName',
            an: {
              lp: 'typeName'
            },
            t: 'a'
          }]
      }, {
        ln: 'Service',
        tn: null,
        ps: [{
            n: 'name',
            en: {
              lp: 'Name'
            }
          }, {
            n: 'title',
            en: {
              lp: 'Title'
            }
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract'
            }
          }, {
            n: 'keywordList',
            en: {
              lp: 'KeywordList'
            },
            ti: '.KeywordList'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }, {
            n: 'contactInformation',
            en: {
              lp: 'ContactInformation'
            },
            ti: '.ContactInformation'
          }, {
            n: 'fees',
            en: {
              lp: 'Fees'
            }
          }, {
            n: 'accessConstraints',
            en: {
              lp: 'AccessConstraints'
            }
          }]
      }, {
        ln: 'ServiceException',
        tn: null,
        ps: [{
            n: 'code',
            an: {
              lp: 'code'
            },
            t: 'a'
          }, {
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'Styles',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'LatLonBoundingBox',
        tn: null,
        ps: [{
            n: 'minx',
            an: {
              lp: 'minx'
            },
            t: 'a'
          }, {
            n: 'miny',
            an: {
              lp: 'miny'
            },
            t: 'a'
          }, {
            n: 'maxx',
            an: {
              lp: 'maxx'
            },
            t: 'a'
          }, {
            n: 'maxy',
            an: {
              lp: 'maxy'
            },
            t: 'a'
          }]
      }, {
        ln: 'ContactInformation',
        tn: null,
        ps: [{
            n: 'contactPersonPrimary',
            en: {
              lp: 'ContactPersonPrimary'
            },
            ti: '.ContactPersonPrimary'
          }, {
            n: 'contactPosition',
            en: {
              lp: 'ContactPosition'
            }
          }, {
            n: 'contactAddress',
            en: {
              lp: 'ContactAddress'
            },
            ti: '.ContactAddress'
          }, {
            n: 'contactVoiceTelephone',
            en: {
              lp: 'ContactVoiceTelephone'
            }
          }, {
            n: 'contactFacsimileTelephone',
            en: {
              lp: 'ContactFacsimileTelephone'
            }
          }, {
            n: 'contactElectronicMailAddress',
            en: {
              lp: 'ContactElectronicMailAddress'
            }
          }]
      }, {
        ln: 'ContactPersonPrimary',
        tn: null,
        ps: [{
            n: 'contactPerson',
            en: {
              lp: 'ContactPerson'
            }
          }, {
            n: 'contactOrganization',
            en: {
              lp: 'ContactOrganization'
            }
          }]
      }, {
        ln: 'DescribeLayer',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'GetStyles',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'ContactAddress',
        tn: null,
        ps: [{
            n: 'addressType',
            en: {
              lp: 'AddressType'
            }
          }, {
            n: 'address',
            en: {
              lp: 'Address'
            }
          }, {
            n: 'city',
            en: {
              lp: 'City'
            }
          }, {
            n: 'stateOrProvince',
            en: {
              lp: 'StateOrProvince'
            }
          }, {
            n: 'postCode',
            en: {
              lp: 'PostCode'
            }
          }, {
            n: 'country',
            en: {
              lp: 'Country'
            }
          }]
      }, {
        ln: 'KeywordList',
        tn: null,
        ps: [{
            n: 'keyword',
            col: true,
            en: {
              lp: 'Keyword'
            },
            ti: '.Keyword'
          }]
      }, {
        ln: 'Style',
        tn: null,
        ps: [{
            n: 'name',
            en: {
              lp: 'Name'
            }
          }, {
            n: 'title',
            en: {
              lp: 'Title'
            }
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract'
            }
          }, {
            n: 'legendURL',
            col: true,
            en: {
              lp: 'LegendURL'
            },
            ti: '.LegendURL'
          }, {
            n: 'styleSheetURL',
            en: {
              lp: 'StyleSheetURL'
            },
            ti: '.StyleSheetURL'
          }, {
            n: 'styleURL',
            en: {
              lp: 'StyleURL'
            },
            ti: '.StyleURL'
          }]
      }, {
        ln: 'StyleSheetURL',
        tn: null,
        ps: [{
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'SRS',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'Extent',
        tn: null,
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: '_default',
            an: {
              lp: 'default'
            },
            t: 'a'
          }, {
            n: 'nearestValue',
            an: {
              lp: 'nearestValue'
            },
            t: 'a'
          }, {
            n: 'multipleValues',
            an: {
              lp: 'multipleValues'
            },
            t: 'a'
          }, {
            n: 'current',
            an: {
              lp: 'current'
            },
            t: 'a'
          }, {
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'DCPType',
        tn: null,
        ps: [{
            n: 'http',
            en: {
              lp: 'HTTP'
            },
            ti: '.HTTP'
          }]
      }, {
        ln: 'Capability',
        tn: null,
        ps: [{
            n: 'request',
            en: {
              lp: 'Request'
            },
            ti: '.Request'
          }, {
            n: 'exception',
            en: {
              lp: 'Exception'
            },
            ti: '.Exception'
          }, {
            n: 'vendorSpecificCapabilities',
            en: {
              lp: 'VendorSpecificCapabilities'
            },
            ti: '.VendorSpecificCapabilities'
          }, {
            n: 'userDefinedSymbolization',
            en: {
              lp: 'UserDefinedSymbolization'
            },
            ti: '.UserDefinedSymbolization'
          }, {
            n: 'layer',
            en: {
              lp: 'Layer'
            },
            ti: '.Layer'
          }]
      }, {
        ln: 'AuthorityURL',
        tn: null,
        ps: [{
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'Keyword',
        tn: null,
        ps: [{
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'UserDefinedSymbolization',
        tn: null,
        ps: [{
            n: 'supportSLD',
            an: {
              lp: 'SupportSLD'
            },
            t: 'a'
          }, {
            n: 'userLayer',
            an: {
              lp: 'UserLayer'
            },
            t: 'a'
          }, {
            n: 'userStyle',
            an: {
              lp: 'UserStyle'
            },
            t: 'a'
          }, {
            n: 'remoteWFS',
            an: {
              lp: 'RemoteWFS'
            },
            t: 'a'
          }]
      }, {
        ln: 'DataURL',
        tn: null,
        ps: [{
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'GetLegendGraphic',
        tn: null,
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'dcpType',
            col: true,
            en: {
              lp: 'DCPType'
            },
            ti: '.DCPType'
          }]
      }, {
        ln: 'LegendURL',
        tn: null,
        ps: [{
            n: 'width',
            an: {
              lp: 'width'
            },
            t: 'a'
          }, {
            n: 'height',
            an: {
              lp: 'height'
            },
            t: 'a'
          }, {
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'Post',
        tn: null,
        ps: [{
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'WMTMSCapabilities',
        tn: null,
        ps: [{
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'updateSequence',
            an: {
              lp: 'updateSequence'
            },
            t: 'a'
          }, {
            n: 'service',
            en: {
              lp: 'Service'
            },
            ti: '.Service'
          }, {
            n: 'capability',
            en: {
              lp: 'Capability'
            },
            ti: '.Capability'
          }]
      }, {
        ln: 'Identifier',
        tn: null,
        ps: [{
            n: 'authority',
            an: {
              lp: 'authority'
            },
            t: 'a'
          }, {
            n: 'value',
            t: 'v'
          }]
      }, {
        ln: 'Request',
        tn: null,
        ps: [{
            n: 'getCapabilities',
            en: {
              lp: 'GetCapabilities'
            },
            ti: '.GetCapabilities'
          }, {
            n: 'getMap',
            en: {
              lp: 'GetMap'
            },
            ti: '.GetMap'
          }, {
            n: 'getFeatureInfo',
            en: {
              lp: 'GetFeatureInfo'
            },
            ti: '.GetFeatureInfo'
          }, {
            n: 'describeLayer',
            en: {
              lp: 'DescribeLayer'
            },
            ti: '.DescribeLayer'
          }, {
            n: 'getLegendGraphic',
            en: {
              lp: 'GetLegendGraphic'
            },
            ti: '.GetLegendGraphic'
          }, {
            n: 'getStyles',
            en: {
              lp: 'GetStyles'
            },
            ti: '.GetStyles'
          }, {
            n: 'putStyles',
            en: {
              lp: 'PutStyles'
            },
            ti: '.PutStyles'
          }]
      }, {
        ln: 'TileSet',
        tn: null,
        ps: [{
            n: 'srs',
            en: {
              lp: 'SRS'
            },
            ti: '.SRS'
          }, {
            n: 'boundingBox',
            en: {
              lp: 'BoundingBox'
            },
            ti: '.BoundingBox'
          }, {
            n: 'resolutions',
            en: {
              lp: 'Resolutions'
            }
          }, {
            n: 'width',
            en: {
              lp: 'Width'
            }
          }, {
            n: 'height',
            en: {
              lp: 'Height'
            }
          }, {
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'layers',
            col: true,
            en: {
              lp: 'Layers'
            },
            ti: '.Layers'
          }, {
            n: 'styles',
            col: true,
            en: {
              lp: 'Styles'
            },
            ti: '.Styles'
          }]
      }, {
        ln: 'FeatureListURL',
        tn: null,
        ps: [{
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.Format'
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'Attribution',
        tn: null,
        ps: [{
            n: 'title',
            en: {
              lp: 'Title'
            }
          }, {
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }, {
            n: 'logoURL',
            en: {
              lp: 'LogoURL'
            },
            ti: '.LogoURL'
          }]
      }, {
        ln: 'Get',
        tn: null,
        ps: [{
            n: 'onlineResource',
            en: {
              lp: 'OnlineResource'
            },
            ti: '.OnlineResource'
          }]
      }, {
        ln: 'ServiceExceptionReport',
        tn: null,
        ps: [{
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'serviceException',
            col: true,
            en: {
              lp: 'ServiceException'
            },
            ti: '.ServiceException'
          }]
      }, {
        ln: 'BoundingBox',
        tn: null,
        ps: [{
            n: 'srs',
            an: {
              lp: 'SRS'
            },
            t: 'a'
          }, {
            n: 'minx',
            an: {
              lp: 'minx'
            },
            t: 'a'
          }, {
            n: 'miny',
            an: {
              lp: 'miny'
            },
            t: 'a'
          }, {
            n: 'maxx',
            an: {
              lp: 'maxx'
            },
            t: 'a'
          }, {
            n: 'maxy',
            an: {
              lp: 'maxy'
            },
            t: 'a'
          }, {
            n: 'resx',
            an: {
              lp: 'resx'
            },
            t: 'a'
          }, {
            n: 'resy',
            an: {
              lp: 'resy'
            },
            t: 'a'
          }]
      }, {
        ln: 'WMSDescribeLayerResponse',
        tn: null,
        ps: [{
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'layerDescription',
            col: true,
            en: {
              lp: 'LayerDescription'
            },
            ti: '.LayerDescription'
          }]
      }, {
        ln: 'OnlineResource',
        tn: null,
        ps: [{
            n: 'xmlnsXlink',
            an: {
              lp: 'xmlns:xlink'
            },
            t: 'a'
          }, {
            n: 'xlinkType',
            an: {
              lp: 'xlink:type'
            },
            t: 'a'
          }, {
            n: 'xlinkHref',
            an: {
              lp: 'xlink:href'
            },
            t: 'a'
          }]
      }],
    eis: [{
        en: {
          lp: 'TileSet'
        },
        ti: '.TileSet'
      }, {
        en: {
          lp: 'GetLegendGraphic'
        },
        ti: '.GetLegendGraphic'
      }, {
        en: {
          lp: 'UserDefinedSymbolization'
        },
        ti: '.UserDefinedSymbolization'
      }, {
        en: {
          lp: 'MetadataURL'
        },
        ti: '.MetadataURL'
      }, {
        en: {
          lp: 'Service'
        },
        ti: '.Service'
      }, {
        en: {
          lp: 'GetMap'
        },
        ti: '.GetMap'
      }, {
        en: {
          lp: 'Layer'
        },
        ti: '.Layer'
      }, {
        en: {
          lp: 'AuthorityURL'
        },
        ti: '.AuthorityURL'
      }, {
        en: {
          lp: 'DescribeLayer'
        },
        ti: '.DescribeLayer'
      }, {
        en: {
          lp: 'Styles'
        },
        ti: '.Styles'
      }, {
        en: {
          lp: 'Extent'
        },
        ti: '.Extent'
      }, {
        en: {
          lp: 'Format'
        },
        ti: '.Format'
      }, {
        en: {
          lp: 'BoundingBox'
        },
        ti: '.BoundingBox'
      }, {
        en: {
          lp: 'GetFeatureInfo'
        },
        ti: '.GetFeatureInfo'
      }, {
        en: {
          lp: 'WMT_MS_Capabilities'
        },
        ti: '.WMTMSCapabilities'
      }, {
        en: {
          lp: 'PutStyles'
        },
        ti: '.PutStyles'
      }, {
        en: {
          lp: 'DCPType'
        },
        ti: '.DCPType'
      }, {
        en: {
          lp: 'Capability'
        },
        ti: '.Capability'
      }, {
        en: {
          lp: 'GetStyles'
        },
        ti: '.GetStyles'
      }, {
        en: {
          lp: 'Attribution'
        },
        ti: '.Attribution'
      }, {
        en: {
          lp: 'ServiceException'
        },
        ti: '.ServiceException'
      }, {
        en: {
          lp: 'Exception'
        },
        ti: '.Exception'
      }, {
        en: {
          lp: 'ContactAddress'
        },
        ti: '.ContactAddress'
      }, {
        en: {
          lp: 'OnlineResource'
        },
        ti: '.OnlineResource'
      }, {
        en: {
          lp: 'ContactInformation'
        },
        ti: '.ContactInformation'
      }, {
        en: {
          lp: 'VendorSpecificCapabilities'
        },
        ti: '.VendorSpecificCapabilities'
      }, {
        en: {
          lp: 'LayerDescription'
        },
        ti: '.LayerDescription'
      }, {
        en: {
          lp: 'Identifier'
        },
        ti: '.Identifier'
      }, {
        en: {
          lp: 'LatLonBoundingBox'
        },
        ti: '.LatLonBoundingBox'
      }, {
        en: {
          lp: 'Get'
        },
        ti: '.Get'
      }, {
        en: {
          lp: 'HTTP'
        },
        ti: '.HTTP'
      }, {
        en: {
          lp: 'DataURL'
        },
        ti: '.DataURL'
      }, {
        en: {
          lp: 'Style'
        },
        ti: '.Style'
      }, {
        en: {
          lp: 'ScaleHint'
        },
        ti: '.ScaleHint'
      }, {
        en: {
          lp: 'LegendURL'
        },
        ti: '.LegendURL'
      }, {
        en: {
          lp: 'SRS'
        },
        ti: '.SRS'
      }, {
        en: {
          lp: 'Dimension'
        },
        ti: '.Dimension'
      }, {
        en: {
          lp: 'ContactPersonPrimary'
        },
        ti: '.ContactPersonPrimary'
      }, {
        en: {
          lp: 'Query'
        },
        ti: '.Query'
      }, {
        en: {
          lp: 'Keyword'
        },
        ti: '.Keyword'
      }, {
        en: {
          lp: 'Request'
        },
        ti: '.Request'
      }, {
        en: {
          lp: 'WMS_DescribeLayerResponse'
        },
        ti: '.WMSDescribeLayerResponse'
      }, {
        en: {
          lp: 'KeywordList'
        },
        ti: '.KeywordList'
      }, {
        en: {
          lp: 'LogoURL'
        },
        ti: '.LogoURL'
      }, {
        en: {
          lp: 'Layers'
        },
        ti: '.Layers'
      }, {
        en: {
          lp: 'StyleSheetURL'
        },
        ti: '.StyleSheetURL'
      }, {
        en: {
          lp: 'Post'
        },
        ti: '.Post'
      }, {
        en: {
          lp: 'StyleURL'
        },
        ti: '.StyleURL'
      }, {
        en: {
          lp: 'GetCapabilities'
        },
        ti: '.GetCapabilities'
      }, {
        en: {
          lp: 'ServiceExceptionReport'
        },
        ti: '.ServiceExceptionReport'
      }, {
        en: {
          lp: 'FeatureListURL'
        },
        ti: '.FeatureListURL'
      }]
  };
  return {
    WMSC_1_1_1: WMSC_1_1_1
  };
};
if (typeof define === 'function' && define.amd) {
  define([], WMSC_1_1_1_Module_Factory);
}
else {
  var WMSC_1_1_1_Module = WMSC_1_1_1_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.WMSC_1_1_1 = WMSC_1_1_1_Module.WMSC_1_1_1;
  }
  else {
    var WMSC_1_1_1 = WMSC_1_1_1_Module.WMSC_1_1_1;
  }
}
},{}],14:[function(require,module,exports){
var WPS_1_0_0_Module_Factory = function () {
  var WPS_1_0_0 = {
    n: 'WPS_1_0_0',
    dens: 'http:\/\/www.opengis.net\/wps\/1.0.0',
    deps: ['OWS_1_1_0'],
    tis: [{
        ln: 'RequestBaseType',
        ps: [{
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'language',
            an: {
              lp: 'language'
            },
            t: 'a'
          }]
      }, {
        ln: 'DataType',
        ps: [{
            n: 'complexData',
            en: 'ComplexData',
            ti: '.ComplexDataType'
          }, {
            n: 'literalData',
            en: 'LiteralData',
            ti: '.LiteralDataType'
          }, {
            n: 'boundingBoxData',
            en: 'BoundingBoxData',
            ti: 'OWS_1_1_0.BoundingBoxType'
          }]
      }, {
        ln: 'LanguagesType',
        ps: [{
            n: 'language',
            col: true,
            en: {
              lp: 'Language',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            }
          }]
      }, {
        ln: 'ResponseFormType',
        ps: [{
            n: 'responseDocument',
            en: 'ResponseDocument',
            ti: '.ResponseDocumentType'
          }, {
            n: 'rawDataOutput',
            en: 'RawDataOutput',
            ti: '.OutputDefinitionType'
          }]
      }, {
        ln: 'InputReferenceType.BodyReference',
        tn: null,
        ps: [{
            n: 'href',
            an: {
              lp: 'href',
              ns: 'http:\/\/www.w3.org\/1999\/xlink'
            },
            t: 'a'
          }]
      }, {
        ln: 'ExecuteResponse.ProcessOutputs',
        tn: null,
        ps: [{
            n: 'output',
            col: true,
            en: 'Output',
            ti: '.OutputDataType'
          }]
      }, {
        ln: 'ProcessOfferings',
        tn: null,
        ps: [{
            n: 'process',
            col: true,
            en: 'Process',
            ti: '.ProcessBriefType'
          }]
      }, {
        ln: 'WPSCapabilitiesType',
        bti: 'OWS_1_1_0.CapabilitiesBaseType',
        ps: [{
            n: 'processOfferings',
            en: 'ProcessOfferings',
            ti: '.ProcessOfferings'
          }, {
            n: 'languages',
            en: 'Languages',
            ti: '.Languages'
          }, {
            n: 'wsdl',
            en: 'WSDL',
            ti: '.WSDL'
          }, {
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'ProcessFailedType',
        ps: [{
            n: 'exceptionReport',
            en: {
              lp: 'ExceptionReport',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.ExceptionReport'
          }]
      }, {
        ln: 'CRSsType',
        ps: [{
            n: 'crs',
            col: true,
            en: {
              lp: 'CRS'
            }
          }]
      }, {
        ln: 'SupportedComplexDataInputType',
        bti: '.SupportedComplexDataType',
        ps: [{
            n: 'maximumMegabytes',
            ti: 'Integer',
            an: {
              lp: 'maximumMegabytes'
            },
            t: 'a'
          }]
      }, {
        ln: 'ProcessBriefType',
        bti: '.DescriptionType',
        ps: [{
            n: 'profile',
            col: true,
            en: 'Profile'
          }, {
            n: 'wsdl',
            en: 'WSDL',
            ti: '.WSDL'
          }, {
            n: 'processVersion',
            an: {
              lp: 'processVersion',
              ns: 'http:\/\/www.opengis.net\/wps\/1.0.0'
            },
            t: 'a'
          }]
      }, {
        ln: 'SupportedCRSsType.Default',
        tn: null,
        ps: [{
            n: 'crs',
            en: {
              lp: 'CRS'
            }
          }]
      }, {
        ln: 'SupportedUOMsType',
        ps: [{
            n: '_default',
            en: {
              lp: 'Default'
            },
            ti: '.SupportedUOMsType.Default'
          }, {
            n: 'supported',
            en: {
              lp: 'Supported'
            },
            ti: '.UOMsType'
          }]
      }, {
        ln: 'DescriptionType',
        ps: [{
            n: 'identifier',
            en: {
              lp: 'Identifier',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.CodeType'
          }, {
            n: 'title',
            en: {
              lp: 'Title',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: 'metadata',
            col: true,
            en: {
              lp: 'Metadata',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.MetadataType'
          }]
      }, {
        ln: 'Execute',
        tn: null,
        bti: '.RequestBaseType',
        ps: [{
            n: 'identifier',
            en: {
              lp: 'Identifier',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.CodeType'
          }, {
            n: 'dataInputs',
            en: 'DataInputs',
            ti: '.DataInputsType'
          }, {
            n: 'responseForm',
            en: 'ResponseForm',
            ti: '.ResponseFormType'
          }]
      }, {
        ln: 'OutputDataType',
        bti: '.DescriptionType',
        ps: [{
            n: 'reference',
            en: 'Reference',
            ti: '.OutputReferenceType'
          }, {
            n: 'data',
            en: 'Data',
            ti: '.DataType'
          }]
      }, {
        ln: 'OutputDescriptionType',
        bti: '.DescriptionType',
        ps: [{
            n: 'complexOutput',
            en: {
              lp: 'ComplexOutput'
            },
            ti: '.SupportedComplexDataType'
          }, {
            n: 'literalOutput',
            en: {
              lp: 'LiteralOutput'
            },
            ti: '.LiteralOutputType'
          }, {
            n: 'boundingBoxOutput',
            en: {
              lp: 'BoundingBoxOutput'
            },
            ti: '.SupportedCRSsType'
          }]
      }, {
        ln: 'OutputDefinitionType',
        ps: [{
            n: 'identifier',
            en: {
              lp: 'Identifier',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.CodeType'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }, {
            n: 'mimeType',
            an: {
              lp: 'mimeType'
            },
            t: 'a'
          }, {
            n: 'encoding',
            an: {
              lp: 'encoding'
            },
            t: 'a'
          }, {
            n: 'schema',
            an: {
              lp: 'schema'
            },
            t: 'a'
          }]
      }, {
        ln: 'DocumentOutputDefinitionType',
        bti: '.OutputDefinitionType',
        ps: [{
            n: 'title',
            en: {
              lp: 'Title',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: 'asReference',
            ti: 'Boolean',
            an: {
              lp: 'asReference'
            },
            t: 'a'
          }]
      }, {
        ln: 'InputType',
        ps: [{
            n: 'identifier',
            en: {
              lp: 'Identifier',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.CodeType'
          }, {
            n: 'title',
            en: {
              lp: 'Title',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: '_abstract',
            en: {
              lp: 'Abstract',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.LanguageStringType'
          }, {
            n: 'reference',
            en: 'Reference',
            ti: '.InputReferenceType'
          }, {
            n: 'data',
            en: 'Data',
            ti: '.DataType'
          }]
      }, {
        ln: 'ProcessDescriptionType.DataInputs',
        tn: null,
        ps: [{
            n: 'input',
            col: true,
            en: {
              lp: 'Input'
            },
            ti: '.InputDescriptionType'
          }]
      }, {
        ln: 'Languages',
        tn: null,
        ps: [{
            n: '_default',
            en: 'Default',
            ti: '.Languages.Default'
          }, {
            n: 'supported',
            en: 'Supported',
            ti: '.LanguagesType'
          }]
      }, {
        ln: 'ProcessDescriptionType',
        bti: '.ProcessBriefType',
        ps: [{
            n: 'dataInputs',
            en: {
              lp: 'DataInputs'
            },
            ti: '.ProcessDescriptionType.DataInputs'
          }, {
            n: 'processOutputs',
            en: {
              lp: 'ProcessOutputs'
            },
            ti: '.ProcessDescriptionType.ProcessOutputs'
          }, {
            n: 'storeSupported',
            ti: 'Boolean',
            an: {
              lp: 'storeSupported'
            },
            t: 'a'
          }, {
            n: 'statusSupported',
            ti: 'Boolean',
            an: {
              lp: 'statusSupported'
            },
            t: 'a'
          }]
      }, {
        ln: 'LiteralDataType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'dataType',
            an: {
              lp: 'dataType'
            },
            t: 'a'
          }, {
            n: 'uom',
            an: {
              lp: 'uom'
            },
            t: 'a'
          }]
      }, {
        ln: 'InputReferenceType',
        ps: [{
            n: 'header',
            col: true,
            en: 'Header',
            ti: '.InputReferenceType.Header'
          }, {
            n: 'body',
            en: 'Body',
            ti: 'AnyType'
          }, {
            n: 'bodyReference',
            en: 'BodyReference',
            ti: '.InputReferenceType.BodyReference'
          }, {
            n: 'href',
            an: {
              lp: 'href',
              ns: 'http:\/\/www.w3.org\/1999\/xlink'
            },
            t: 'a'
          }, {
            n: 'method',
            an: {
              lp: 'method'
            },
            t: 'a'
          }, {
            n: 'mimeType',
            an: {
              lp: 'mimeType'
            },
            t: 'a'
          }, {
            n: 'encoding',
            an: {
              lp: 'encoding'
            },
            t: 'a'
          }, {
            n: 'schema',
            an: {
              lp: 'schema'
            },
            t: 'a'
          }]
      }, {
        ln: 'WSDL',
        tn: null,
        ps: [{
            n: 'href',
            an: {
              lp: 'href',
              ns: 'http:\/\/www.w3.org\/1999\/xlink'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComplexDataCombinationType',
        ps: [{
            n: 'format',
            en: {
              lp: 'Format'
            },
            ti: '.ComplexDataDescriptionType'
          }]
      }, {
        ln: 'ProcessDescriptionType.ProcessOutputs',
        tn: null,
        ps: [{
            n: 'output',
            col: true,
            en: {
              lp: 'Output'
            },
            ti: '.OutputDescriptionType'
          }]
      }, {
        ln: 'ExecuteResponse',
        tn: null,
        bti: '.ResponseBaseType',
        ps: [{
            n: 'process',
            en: 'Process',
            ti: '.ProcessBriefType'
          }, {
            n: 'status',
            en: 'Status',
            ti: '.StatusType'
          }, {
            n: 'dataInputs',
            en: 'DataInputs',
            ti: '.DataInputsType'
          }, {
            n: 'outputDefinitions',
            en: 'OutputDefinitions',
            ti: '.OutputDefinitionsType'
          }, {
            n: 'processOutputs',
            en: 'ProcessOutputs',
            ti: '.ExecuteResponse.ProcessOutputs'
          }, {
            n: 'serviceInstance',
            an: {
              lp: 'serviceInstance'
            },
            t: 'a'
          }, {
            n: 'statusLocation',
            an: {
              lp: 'statusLocation'
            },
            t: 'a'
          }]
      }, {
        ln: 'ResponseDocumentType',
        ps: [{
            n: 'output',
            col: true,
            en: 'Output',
            ti: '.DocumentOutputDefinitionType'
          }, {
            n: 'storeExecuteResponse',
            ti: 'Boolean',
            an: {
              lp: 'storeExecuteResponse'
            },
            t: 'a'
          }, {
            n: 'lineage',
            ti: 'Boolean',
            an: {
              lp: 'lineage'
            },
            t: 'a'
          }, {
            n: 'status',
            ti: 'Boolean',
            an: {
              lp: 'status'
            },
            t: 'a'
          }]
      }, {
        ln: 'OutputDefinitionsType',
        ps: [{
            n: 'output',
            col: true,
            en: 'Output',
            ti: '.DocumentOutputDefinitionType'
          }]
      }, {
        ln: 'SupportedCRSsType',
        ps: [{
            n: '_default',
            en: {
              lp: 'Default'
            },
            ti: '.SupportedCRSsType.Default'
          }, {
            n: 'supported',
            en: {
              lp: 'Supported'
            },
            ti: '.CRSsType'
          }]
      }, {
        ln: 'LiteralInputType',
        bti: '.LiteralOutputType',
        ps: [{
            n: 'allowedValues',
            en: {
              lp: 'AllowedValues',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.AllowedValues'
          }, {
            n: 'anyValue',
            en: {
              lp: 'AnyValue',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.AnyValue'
          }, {
            n: 'valuesReference',
            en: {
              lp: 'ValuesReference'
            },
            ti: '.ValuesReferenceType'
          }, {
            n: 'defaultValue',
            en: {
              lp: 'DefaultValue'
            }
          }]
      }, {
        ln: 'OutputReferenceType',
        ps: [{
            n: 'href',
            an: {
              lp: 'href'
            },
            t: 'a'
          }, {
            n: 'mimeType',
            an: {
              lp: 'mimeType'
            },
            t: 'a'
          }, {
            n: 'encoding',
            an: {
              lp: 'encoding'
            },
            t: 'a'
          }, {
            n: 'schema',
            an: {
              lp: 'schema'
            },
            t: 'a'
          }]
      }, {
        ln: 'Languages.Default',
        tn: null,
        ps: [{
            n: 'language',
            en: {
              lp: 'Language',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            }
          }]
      }, {
        ln: 'ComplexDataType',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'mimeType',
            an: {
              lp: 'mimeType'
            },
            t: 'a'
          }, {
            n: 'encoding',
            an: {
              lp: 'encoding'
            },
            t: 'a'
          }, {
            n: 'schema',
            an: {
              lp: 'schema'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComplexDataCombinationsType',
        ps: [{
            n: 'format',
            col: true,
            en: {
              lp: 'Format'
            },
            ti: '.ComplexDataDescriptionType'
          }]
      }, {
        ln: 'UOMsType',
        ps: [{
            n: 'uom',
            col: true,
            en: {
              lp: 'UOM',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.DomainMetadataType'
          }]
      }, {
        ln: 'ProcessStartedType',
        ps: [{
            n: 'value',
            t: 'v'
          }, {
            n: 'percentCompleted',
            ti: 'Int',
            an: {
              lp: 'percentCompleted'
            },
            t: 'a'
          }]
      }, {
        ln: 'GetCapabilities',
        tn: null,
        ps: [{
            n: 'acceptVersions',
            en: 'AcceptVersions',
            ti: 'OWS_1_1_0.AcceptVersionsType'
          }, {
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'language',
            an: {
              lp: 'language'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComplexDataDescriptionType',
        ps: [{
            n: 'mimeType',
            en: {
              lp: 'MimeType'
            }
          }, {
            n: 'encoding',
            en: {
              lp: 'Encoding'
            }
          }, {
            n: 'schema',
            en: {
              lp: 'Schema'
            }
          }]
      }, {
        ln: 'InputReferenceType.Header',
        tn: null,
        ps: [{
            n: 'key',
            an: {
              lp: 'key'
            },
            t: 'a'
          }, {
            n: 'value',
            an: {
              lp: 'value'
            },
            t: 'a'
          }]
      }, {
        ln: 'ValuesReferenceType',
        ps: [{
            n: 'reference',
            an: {
              lp: 'reference',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            t: 'a'
          }, {
            n: 'valuesForm',
            an: {
              lp: 'valuesForm'
            },
            t: 'a'
          }]
      }, {
        ln: 'SupportedComplexDataType',
        ps: [{
            n: '_default',
            en: {
              lp: 'Default'
            },
            ti: '.ComplexDataCombinationType'
          }, {
            n: 'supported',
            en: {
              lp: 'Supported'
            },
            ti: '.ComplexDataCombinationsType'
          }]
      }, {
        ln: 'ResponseBaseType',
        ps: [{
            n: 'service',
            an: {
              lp: 'service'
            },
            t: 'a'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'SupportedUOMsType.Default',
        tn: null,
        ps: [{
            n: 'uom',
            en: {
              lp: 'UOM',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.DomainMetadataType'
          }]
      }, {
        ln: 'StatusType',
        ps: [{
            n: 'processAccepted',
            en: 'ProcessAccepted'
          }, {
            n: 'processStarted',
            en: 'ProcessStarted',
            ti: '.ProcessStartedType'
          }, {
            n: 'processPaused',
            en: 'ProcessPaused',
            ti: '.ProcessStartedType'
          }, {
            n: 'processSucceeded',
            en: 'ProcessSucceeded'
          }, {
            n: 'processFailed',
            en: 'ProcessFailed',
            ti: '.ProcessFailedType'
          }, {
            n: 'creationTime',
            ti: 'Calendar',
            an: {
              lp: 'creationTime'
            },
            t: 'a'
          }]
      }, {
        ln: 'DescribeProcess',
        tn: null,
        bti: '.RequestBaseType',
        ps: [{
            n: 'identifier',
            col: true,
            en: {
              lp: 'Identifier',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.CodeType'
          }]
      }, {
        ln: 'InputDescriptionType',
        bti: '.DescriptionType',
        ps: [{
            n: 'complexData',
            en: {
              lp: 'ComplexData'
            },
            ti: '.SupportedComplexDataInputType'
          }, {
            n: 'literalData',
            en: {
              lp: 'LiteralData'
            },
            ti: '.LiteralInputType'
          }, {
            n: 'boundingBoxData',
            en: {
              lp: 'BoundingBoxData'
            },
            ti: '.SupportedCRSsType'
          }, {
            n: 'minOccurs',
            ti: 'Integer',
            an: {
              lp: 'minOccurs'
            },
            t: 'a'
          }, {
            n: 'maxOccurs',
            ti: 'Integer',
            an: {
              lp: 'maxOccurs'
            },
            t: 'a'
          }]
      }, {
        ln: 'ProcessDescriptions',
        tn: null,
        bti: '.ResponseBaseType',
        ps: [{
            n: 'processDescription',
            col: true,
            en: {
              lp: 'ProcessDescription'
            },
            ti: '.ProcessDescriptionType'
          }]
      }, {
        ln: 'LiteralOutputType',
        ps: [{
            n: 'dataType',
            en: {
              lp: 'DataType',
              ns: 'http:\/\/www.opengis.net\/ows\/1.1'
            },
            ti: 'OWS_1_1_0.DomainMetadataType'
          }, {
            n: 'uoMs',
            en: {
              lp: 'UOMs'
            },
            ti: '.SupportedUOMsType'
          }]
      }, {
        ln: 'DataInputsType',
        ps: [{
            n: 'input',
            col: true,
            en: 'Input',
            ti: '.InputType'
          }]
      }],
    eis: [{
        en: 'WSDL',
        ti: '.WSDL'
      }, {
        en: 'Execute',
        ti: '.Execute'
      }, {
        en: 'ProcessDescriptions',
        ti: '.ProcessDescriptions'
      }, {
        en: 'ProcessOfferings',
        ti: '.ProcessOfferings'
      }, {
        en: 'Languages',
        ti: '.Languages'
      }, {
        en: 'Capabilities',
        ti: '.WPSCapabilitiesType'
      }, {
        en: 'DescribeProcess',
        ti: '.DescribeProcess'
      }, {
        en: 'GetCapabilities',
        ti: '.GetCapabilities'
      }, {
        en: 'ExecuteResponse',
        ti: '.ExecuteResponse'
      }]
  };
  return {
    WPS_1_0_0: WPS_1_0_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], WPS_1_0_0_Module_Factory);
}
else {
  var WPS_1_0_0_Module = WPS_1_0_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.WPS_1_0_0 = WPS_1_0_0_Module.WPS_1_0_0;
  }
  else {
    var WPS_1_0_0 = WPS_1_0_0_Module.WPS_1_0_0;
  }
}
},{}],15:[function(require,module,exports){
var XLink_1_0_Module_Factory = function () {
  var XLink_1_0 = {
    n: 'XLink_1_0',
    dens: 'http:\/\/www.w3.org\/1999\/xlink',
    dans: 'http:\/\/www.w3.org\/1999\/xlink',
    tis: [{
        ln: 'TitleEltType',
        tn: 'titleEltType',
        ps: [{
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'Extended',
        tn: 'extended',
        ps: [{
            n: 'extendedModel',
            col: true,
            etis: [{
                en: 'title',
                ti: '.TitleEltType'
              }, {
                en: 'resource',
                ti: '.ResourceType'
              }, {
                en: 'locator',
                ti: '.LocatorType'
              }, {
                en: 'arc',
                ti: '.ArcType'
              }],
            t: 'es'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }]
      }, {
        ln: 'Simple',
        tn: 'simple',
        ps: [{
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            t: 'a'
          }, {
            n: 'actuate',
            t: 'a'
          }]
      }, {
        ln: 'ArcType',
        tn: 'arcType',
        ps: [{
            n: 'locatorTitle',
            col: true,
            en: 'title',
            ti: '.TitleEltType'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'arcrole',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'show',
            t: 'a'
          }, {
            n: 'actuate',
            t: 'a'
          }, {
            n: 'from',
            t: 'a'
          }, {
            n: 'to',
            t: 'a'
          }]
      }, {
        ln: 'LocatorType',
        tn: 'locatorType',
        ps: [{
            n: 'locatorTitle',
            col: true,
            en: 'title',
            ti: '.TitleEltType'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'href',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'label',
            t: 'a'
          }]
      }, {
        ln: 'ResourceType',
        tn: 'resourceType',
        ps: [{
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'type',
            t: 'a'
          }, {
            n: 'role',
            t: 'a'
          }, {
            n: 'title',
            t: 'a'
          }, {
            n: 'label',
            t: 'a'
          }]
      }, {
        t: 'enum',
        ln: 'ActuateType',
        vs: ['onLoad', 'onRequest', 'other', 'none']
      }, {
        t: 'enum',
        ln: 'ShowType',
        vs: ['new', 'replace', 'embed', 'other', 'none']
      }, {
        t: 'enum',
        ln: 'TypeType',
        vs: ['simple', 'extended', 'title', 'resource', 'locator', 'arc']
      }],
    eis: [{
        en: 'resource',
        ti: '.ResourceType'
      }, {
        en: 'locator',
        ti: '.LocatorType'
      }, {
        en: 'title',
        ti: '.TitleEltType'
      }, {
        en: 'arc',
        ti: '.ArcType'
      }]
  };
  return {
    XLink_1_0: XLink_1_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], XLink_1_0_Module_Factory);
}
else {
  var XLink_1_0_Module = XLink_1_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.XLink_1_0 = XLink_1_0_Module.XLink_1_0;
  }
  else {
    var XLink_1_0 = XLink_1_0_Module.XLink_1_0;
  }
}
},{}],16:[function(require,module,exports){
var XSD_1_0_Module_Factory = function () {
  var XSD_1_0 = {
    n: 'XSD_1_0',
    dens: 'http:\/\/www.w3.org\/2001\/XMLSchema',
    tis: [{
        ln: 'Keybase',
        tn: 'keybase',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'selector',
            ti: '.Selector'
          }, {
            n: 'field',
            col: true,
            ti: '.Field'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'Element',
        tn: 'element',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleType',
            ti: '.LocalSimpleType'
          }, {
            n: 'complexType',
            ti: '.LocalComplexType'
          }, {
            n: 'key',
            col: true,
            ti: '.Keybase'
          }, {
            n: 'keyref',
            col: true,
            ti: '.Keyref'
          }, {
            n: 'unique',
            col: true,
            ti: '.Keybase'
          }, {
            n: 'type',
            ti: 'QName',
            an: {
              lp: 'type'
            },
            t: 'a'
          }, {
            n: 'substitutionGroup',
            ti: 'QName',
            an: {
              lp: 'substitutionGroup'
            },
            t: 'a'
          }, {
            n: '_default',
            an: {
              lp: 'default'
            },
            t: 'a'
          }, {
            n: 'fixed',
            an: {
              lp: 'fixed'
            },
            t: 'a'
          }, {
            n: 'nillable',
            ti: 'Boolean',
            an: {
              lp: 'nillable'
            },
            t: 'a'
          }, {
            n: '_abstract',
            ti: 'Boolean',
            an: {
              lp: 'abstract'
            },
            t: 'a'
          }, {
            n: '_final',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'final'
            },
            t: 'a'
          }, {
            n: 'block',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'block'
            },
            t: 'a'
          }, {
            n: 'form',
            an: {
              lp: 'form'
            },
            t: 'a'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'ref',
            ti: 'QName',
            an: {
              lp: 'ref'
            },
            t: 'a'
          }, {
            n: 'minOccurs',
            ti: 'Integer',
            an: {
              lp: 'minOccurs'
            },
            t: 'a'
          }, {
            n: 'maxOccurs',
            an: {
              lp: 'maxOccurs'
            },
            t: 'a'
          }]
      }, {
        ln: 'Documentation',
        tn: null,
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'source',
            an: {
              lp: 'source'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'NumFacet',
        tn: 'numFacet',
        bti: '.Facet'
      }, {
        ln: 'NamedGroup',
        tn: 'namedGroup',
        bti: '.RealGroup'
      }, {
        ln: 'Any',
        tn: null,
        bti: '.Wildcard',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'minOccurs',
            ti: 'Integer',
            an: {
              lp: 'minOccurs'
            },
            t: 'a'
          }, {
            n: 'maxOccurs',
            an: {
              lp: 'maxOccurs'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComplexType',
        tn: 'complexType',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleContent',
            ti: '.SimpleContent'
          }, {
            n: 'complexContent',
            ti: '.ComplexContent'
          }, {
            n: 'group',
            ti: '.GroupRef'
          }, {
            n: 'all',
            ti: '.All'
          }, {
            n: 'choice',
            ti: '.ExplicitGroup'
          }, {
            n: 'sequence',
            ti: '.ExplicitGroup'
          }, {
            n: 'attribute',
            col: true,
            ti: '.Attribute'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.AttributeGroupRef'
          }, {
            n: 'anyAttribute',
            ti: '.Wildcard'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'mixed',
            ti: 'Boolean',
            an: {
              lp: 'mixed'
            },
            t: 'a'
          }, {
            n: '_abstract',
            ti: 'Boolean',
            an: {
              lp: 'abstract'
            },
            t: 'a'
          }, {
            n: '_final',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'final'
            },
            t: 'a'
          }, {
            n: 'block',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'block'
            },
            t: 'a'
          }]
      }, {
        ln: 'ComplexContent',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'restriction',
            ti: '.ComplexRestrictionType'
          }, {
            n: 'extension',
            ti: '.ExtensionType'
          }, {
            n: 'mixed',
            ti: 'Boolean',
            an: {
              lp: 'mixed'
            },
            t: 'a'
          }]
      }, {
        ln: 'Restriction',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleType',
            ti: '.LocalSimpleType'
          }, {
            n: 'pattern',
            col: true,
            ti: '.Pattern'
          }, {
            n: 'maxLength',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'minLength',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'maxExclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'length',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'minInclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'fractionDigits',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'whiteSpace',
            col: true,
            ti: '.WhiteSpace'
          }, {
            n: 'minExclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'maxInclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'enumeration',
            col: true,
            ti: '.NoFixedFacet'
          }, {
            n: 'totalDigits',
            col: true,
            ti: '.TotalDigits'
          }, {
            n: 'base',
            ti: 'QName',
            an: {
              lp: 'base'
            },
            t: 'a'
          }]
      }, {
        ln: 'SimpleContent',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'restriction',
            ti: '.SimpleRestrictionType'
          }, {
            n: 'extension',
            ti: '.SimpleExtensionType'
          }]
      }, {
        ln: 'Notation',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: '_public',
            an: {
              lp: 'public'
            },
            t: 'a'
          }, {
            n: 'system',
            an: {
              lp: 'system'
            },
            t: 'a'
          }]
      }, {
        ln: 'Facet',
        tn: 'facet',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'value',
            an: {
              lp: 'value'
            },
            t: 'a'
          }, {
            n: 'fixed',
            ti: 'Boolean',
            an: {
              lp: 'fixed'
            },
            t: 'a'
          }]
      }, {
        ln: 'Appinfo',
        tn: null,
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'content',
            col: true,
            t: 'ae'
          }, {
            n: 'source',
            an: {
              lp: 'source'
            },
            t: 'a'
          }]
      }, {
        ln: 'GroupRef',
        tn: 'groupRef',
        bti: '.RealGroup'
      }, {
        ln: 'Redefine',
        tn: null,
        bti: '.OpenAttrs',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'annotation',
            col: true,
            ti: '.Annotation'
          }, {
            n: 'simpleType',
            col: true,
            ti: '.TopLevelSimpleType'
          }, {
            n: 'complexType',
            col: true,
            ti: '.TopLevelComplexType'
          }, {
            n: 'group',
            col: true,
            ti: '.NamedGroup'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.NamedAttributeGroup'
          }, {
            n: 'schemaLocation',
            an: {
              lp: 'schemaLocation'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }]
      }, {
        ln: 'Annotation',
        tn: null,
        bti: '.OpenAttrs',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'appinfo',
            col: true,
            ti: '.Appinfo'
          }, {
            n: 'documentation',
            col: true,
            ti: '.Documentation'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }]
      }, {
        ln: 'TopLevelElement',
        tn: 'topLevelElement',
        bti: '.Element'
      }, {
        ln: 'Annotated',
        tn: 'annotated',
        bti: '.OpenAttrs',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'annotation',
            ti: '.Annotation'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }]
      }, {
        ln: 'Import',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'namespace',
            an: {
              lp: 'namespace'
            },
            t: 'a'
          }, {
            n: 'schemaLocation',
            an: {
              lp: 'schemaLocation'
            },
            t: 'a'
          }]
      }, {
        ln: 'List',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleType',
            ti: '.LocalSimpleType'
          }, {
            n: 'itemType',
            ti: 'QName',
            an: {
              lp: 'itemType'
            },
            t: 'a'
          }]
      }, {
        ln: 'Include',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'schemaLocation',
            an: {
              lp: 'schemaLocation'
            },
            t: 'a'
          }]
      }, {
        ln: 'Group',
        tn: 'group',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'choice',
            col: true,
            ti: '.ExplicitGroup'
          }, {
            n: 'group',
            col: true,
            ti: '.GroupRef'
          }, {
            n: 'element',
            col: true,
            ti: '.LocalElement'
          }, {
            n: 'any',
            col: true,
            ti: '.Any'
          }, {
            n: 'sequence',
            col: true,
            ti: '.ExplicitGroup'
          }, {
            n: 'all',
            col: true,
            ti: '.All'
          }, {
            n: 'minOccurs',
            ti: 'Integer',
            an: {
              lp: 'minOccurs'
            },
            t: 'a'
          }, {
            n: 'maxOccurs',
            an: {
              lp: 'maxOccurs'
            },
            t: 'a'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'ref',
            ti: 'QName',
            an: {
              lp: 'ref'
            },
            t: 'a'
          }]
      }, {
        ln: 'RestrictionType',
        tn: 'restrictionType',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'group',
            ti: '.GroupRef'
          }, {
            n: 'all',
            ti: '.All'
          }, {
            n: 'choice',
            ti: '.ExplicitGroup'
          }, {
            n: 'sequence',
            ti: '.ExplicitGroup'
          }, {
            n: 'simpleType',
            ti: '.LocalSimpleType'
          }, {
            n: 'pattern',
            col: true,
            ti: '.Pattern'
          }, {
            n: 'maxLength',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'minLength',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'maxExclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'length',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'minInclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'fractionDigits',
            col: true,
            ti: '.NumFacet'
          }, {
            n: 'whiteSpace',
            col: true,
            ti: '.WhiteSpace'
          }, {
            n: 'minExclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'maxInclusive',
            col: true,
            ti: '.Facet'
          }, {
            n: 'enumeration',
            col: true,
            ti: '.NoFixedFacet'
          }, {
            n: 'totalDigits',
            col: true,
            ti: '.TotalDigits'
          }, {
            n: 'attribute',
            col: true,
            ti: '.Attribute'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.AttributeGroupRef'
          }, {
            n: 'anyAttribute',
            ti: '.Wildcard'
          }, {
            n: 'base',
            ti: 'QName',
            an: {
              lp: 'base'
            },
            t: 'a'
          }]
      }, {
        ln: 'OpenAttrs',
        tn: 'openAttrs',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }]
      }, {
        ln: 'SimpleType',
        tn: 'simpleType',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'restriction',
            ti: '.Restriction'
          }, {
            n: 'list',
            ti: '.List'
          }, {
            n: 'union',
            ti: '.Union'
          }, {
            n: '_final',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'final'
            },
            t: 'a'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }]
      }, {
        ln: 'Union',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleType',
            col: true,
            ti: '.LocalSimpleType'
          }, {
            n: 'memberTypes',
            ti: {
              t: 'l',
              bti: 'QName'
            },
            an: {
              lp: 'memberTypes'
            },
            t: 'a'
          }]
      }, {
        ln: 'ExtensionType',
        tn: 'extensionType',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'group',
            ti: '.GroupRef'
          }, {
            n: 'all',
            ti: '.All'
          }, {
            n: 'choice',
            ti: '.ExplicitGroup'
          }, {
            n: 'sequence',
            ti: '.ExplicitGroup'
          }, {
            n: 'attribute',
            col: true,
            ti: '.Attribute'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.AttributeGroupRef'
          }, {
            n: 'anyAttribute',
            ti: '.Wildcard'
          }, {
            n: 'base',
            ti: 'QName',
            an: {
              lp: 'base'
            },
            t: 'a'
          }]
      }, {
        ln: 'Keyref',
        tn: null,
        bti: '.Keybase',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'refer',
            ti: 'QName',
            an: {
              lp: 'refer'
            },
            t: 'a'
          }]
      }, {
        ln: 'SimpleExtensionType',
        tn: 'simpleExtensionType',
        bti: '.ExtensionType'
      }, {
        ln: 'Attribute',
        tn: 'attribute',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'simpleType',
            ti: '.LocalSimpleType'
          }, {
            n: 'type',
            ti: 'QName',
            an: {
              lp: 'type'
            },
            t: 'a'
          }, {
            n: 'use',
            an: {
              lp: 'use'
            },
            t: 'a'
          }, {
            n: '_default',
            an: {
              lp: 'default'
            },
            t: 'a'
          }, {
            n: 'fixed',
            an: {
              lp: 'fixed'
            },
            t: 'a'
          }, {
            n: 'form',
            an: {
              lp: 'form'
            },
            t: 'a'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'ref',
            ti: 'QName',
            an: {
              lp: 'ref'
            },
            t: 'a'
          }]
      }, {
        ln: 'Selector',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'xpath',
            an: {
              lp: 'xpath'
            },
            t: 'a'
          }]
      }, {
        ln: 'TopLevelSimpleType',
        tn: 'topLevelSimpleType',
        bti: '.SimpleType'
      }, {
        ln: 'TotalDigits',
        tn: null,
        bti: '.NumFacet'
      }, {
        ln: 'Schema',
        tn: null,
        bti: '.OpenAttrs',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'include',
            col: true,
            ti: '.Include'
          }, {
            n: '_import',
            col: true,
            en: 'import',
            ti: '.Import'
          }, {
            n: 'redefine',
            col: true,
            ti: '.Redefine'
          }, {
            n: 'simpleType',
            col: true,
            ti: '.TopLevelSimpleType'
          }, {
            n: 'complexType',
            col: true,
            ti: '.TopLevelComplexType'
          }, {
            n: 'group',
            col: true,
            ti: '.NamedGroup'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.NamedAttributeGroup'
          }, {
            n: 'element',
            col: true,
            ti: '.TopLevelElement'
          }, {
            n: 'attribute',
            col: true,
            ti: '.TopLevelAttribute'
          }, {
            n: 'notation',
            col: true,
            ti: '.Notation'
          }, {
            n: 'annotation',
            col: true,
            ti: '.Annotation'
          }, {
            n: 'targetNamespace',
            an: {
              lp: 'targetNamespace'
            },
            t: 'a'
          }, {
            n: 'version',
            an: {
              lp: 'version'
            },
            t: 'a'
          }, {
            n: 'finalDefault',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'finalDefault'
            },
            t: 'a'
          }, {
            n: 'blockDefault',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'blockDefault'
            },
            t: 'a'
          }, {
            n: 'attributeFormDefault',
            an: {
              lp: 'attributeFormDefault'
            },
            t: 'a'
          }, {
            n: 'elementFormDefault',
            an: {
              lp: 'elementFormDefault'
            },
            t: 'a'
          }, {
            n: 'id',
            ti: 'ID',
            an: {
              lp: 'id'
            },
            t: 'a'
          }, {
            n: 'lang',
            an: {
              lp: 'lang',
              ns: 'http:\/\/www.w3.org\/XML\/1998\/namespace'
            },
            t: 'a'
          }]
      }, {
        ln: 'SimpleRestrictionType',
        tn: 'simpleRestrictionType',
        bti: '.RestrictionType'
      }, {
        ln: 'ComplexRestrictionType',
        tn: 'complexRestrictionType',
        bti: '.RestrictionType'
      }, {
        ln: 'Wildcard',
        tn: 'wildcard',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'namespace',
            ti: {
              t: 'l'
            },
            an: {
              lp: 'namespace'
            },
            t: 'a'
          }, {
            n: 'processContents',
            an: {
              lp: 'processContents'
            },
            t: 'a'
          }]
      }, {
        ln: 'RealGroup',
        tn: 'realGroup',
        bti: '.Group'
      }, {
        ln: 'AttributeGroupRef',
        tn: 'attributeGroupRef',
        bti: '.AttributeGroup'
      }, {
        ln: 'SimpleExplicitGroup',
        tn: 'simpleExplicitGroup',
        bti: '.ExplicitGroup'
      }, {
        ln: 'TopLevelComplexType',
        tn: 'topLevelComplexType',
        bti: '.ComplexType'
      }, {
        ln: 'ExplicitGroup',
        tn: 'explicitGroup',
        bti: '.Group'
      }, {
        ln: 'Pattern',
        tn: null,
        bti: '.NoFixedFacet'
      }, {
        ln: 'LocalElement',
        tn: 'localElement',
        bti: '.Element'
      }, {
        ln: 'TopLevelAttribute',
        tn: 'topLevelAttribute',
        bti: '.Attribute'
      }, {
        ln: 'AttributeGroup',
        tn: 'attributeGroup',
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'attribute',
            col: true,
            ti: '.Attribute'
          }, {
            n: 'attributeGroup',
            col: true,
            ti: '.AttributeGroupRef'
          }, {
            n: 'anyAttribute',
            ti: '.Wildcard'
          }, {
            n: 'name',
            an: {
              lp: 'name'
            },
            t: 'a'
          }, {
            n: 'ref',
            ti: 'QName',
            an: {
              lp: 'ref'
            },
            t: 'a'
          }]
      }, {
        ln: 'NarrowMaxMin',
        tn: 'narrowMaxMin',
        bti: '.LocalElement'
      }, {
        ln: 'LocalSimpleType',
        tn: 'localSimpleType',
        bti: '.SimpleType'
      }, {
        ln: 'NamedAttributeGroup',
        tn: 'namedAttributeGroup',
        bti: '.AttributeGroup'
      }, {
        ln: 'All',
        tn: 'all',
        bti: '.ExplicitGroup'
      }, {
        ln: 'Field',
        tn: null,
        bti: '.Annotated',
        ps: [{
            n: 'otherAttributes',
            t: 'aa'
          }, {
            n: 'xpath',
            an: {
              lp: 'xpath'
            },
            t: 'a'
          }]
      }, {
        ln: 'WhiteSpace',
        tn: null,
        bti: '.Facet'
      }, {
        ln: 'LocalComplexType',
        tn: 'localComplexType',
        bti: '.ComplexType'
      }, {
        ln: 'NoFixedFacet',
        tn: 'noFixedFacet',
        bti: '.Facet'
      }, {
        t: 'enum',
        ln: 'ReducedDerivationControl',
        vs: ['extension', 'restriction']
      }, {
        t: 'enum',
        ln: 'TypeDerivationControl',
        vs: ['extension', 'restriction', 'list', 'union']
      }, {
        t: 'enum',
        ln: 'DerivationControl',
        vs: ['substitution', 'extension', 'restriction', 'list', 'union']
      }, {
        t: 'enum',
        ln: 'FormChoice',
        vs: ['qualified', 'unqualified']
      }],
    eis: [{
        en: 'import',
        ti: '.Import'
      }, {
        en: 'minLength',
        ti: '.NumFacet'
      }, {
        en: 'anyAttribute',
        ti: '.Wildcard'
      }, {
        en: 'annotation',
        ti: '.Annotation'
      }, {
        en: 'simpleContent',
        ti: '.SimpleContent'
      }, {
        en: 'keyref',
        ti: '.Keyref'
      }, {
        en: 'list',
        ti: '.List'
      }, {
        en: 'whiteSpace',
        ti: '.WhiteSpace'
      }, {
        en: 'notation',
        ti: '.Notation'
      }, {
        en: 'union',
        ti: '.Union'
      }, {
        en: 'element',
        ti: '.TopLevelElement'
      }, {
        en: 'complexContent',
        ti: '.ComplexContent'
      }, {
        en: 'length',
        ti: '.NumFacet'
      }, {
        en: 'group',
        ti: '.GroupRef',
        sc: '.Group'
      }, {
        en: 'choice',
        ti: '.ExplicitGroup'
      }, {
        en: 'selector',
        ti: '.Selector'
      }, {
        en: 'maxInclusive',
        ti: '.Facet'
      }, {
        en: 'attributeGroup',
        ti: '.NamedAttributeGroup'
      }, {
        en: 'minInclusive',
        ti: '.Facet'
      }, {
        en: 'complexType',
        ti: '.TopLevelComplexType'
      }, {
        en: 'schema',
        ti: '.Schema'
      }, {
        en: 'any',
        ti: '.Any'
      }, {
        en: 'restriction',
        ti: '.Restriction'
      }, {
        en: 'minExclusive',
        ti: '.Facet'
      }, {
        en: 'simpleType',
        ti: '.TopLevelSimpleType'
      }, {
        en: 'enumeration',
        ti: '.NoFixedFacet'
      }, {
        en: 'maxExclusive',
        ti: '.Facet'
      }, {
        en: 'redefine',
        ti: '.Redefine'
      }, {
        en: 'maxLength',
        ti: '.NumFacet'
      }, {
        en: 'fractionDigits',
        ti: '.NumFacet'
      }, {
        en: 'totalDigits',
        ti: '.TotalDigits'
      }, {
        en: 'pattern',
        ti: '.Pattern'
      }, {
        en: 'attribute',
        ti: '.TopLevelAttribute'
      }, {
        en: 'include',
        ti: '.Include'
      }, {
        en: 'field',
        ti: '.Field'
      }, {
        en: 'element',
        ti: '.LocalElement',
        sc: '.Group'
      }, {
        en: 'key',
        ti: '.Keybase'
      }, {
        en: 'sequence',
        ti: '.ExplicitGroup'
      }, {
        en: 'group',
        ti: '.NamedGroup'
      }, {
        en: 'documentation',
        ti: '.Documentation'
      }, {
        en: 'appinfo',
        ti: '.Appinfo'
      }, {
        en: 'all',
        ti: '.All'
      }, {
        en: 'unique',
        ti: '.Keybase'
      }]
  };
  return {
    XSD_1_0: XSD_1_0
  };
};
if (typeof define === 'function' && define.amd) {
  define([], XSD_1_0_Module_Factory);
}
else {
  var XSD_1_0_Module = XSD_1_0_Module_Factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.XSD_1_0 = XSD_1_0_Module.XSD_1_0;
  }
  else {
    var XSD_1_0 = XSD_1_0_Module.XSD_1_0;
  }
}
},{}],17:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.0 Copyright (c) 2011-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require('_process'),"/node_modules/amdefine/amdefine.js")
},{"_process":19,"path":18}],18:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":19}],19:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])(1)
});
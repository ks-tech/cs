var colorMap = {
    aliceblue:"#F0F8FF", antiquewhite:"#FAEBD7", aqua:"#00FFFF", aquamarine:"#7FFFD4",
    azure:"#F0FFFF", beige:"#F5F5DC", bisque:"#FFE4C4", black:"#000000",
    blanchedalmond:"#FFEBCD", blue:"#0000FF", blueviolet:"#8A2BE2", brown:"#A52A2A",
    burlywood:"#DEB887", cadetblue:"#5F9EA0", chartreuse:"#7FFF00", chocolate:"#D2691E",
    coral:"#FF7F50", cornflowerblue:"#6495ED", cornsilk:"#FFF8DC", crimson:"#DC143C",
    cyan:"#00FFFF", darkblue:"#00008B", darkcyan:"#008B8B", darkgoldenrod:"#B8860B",
    darkgray:"#A9A9A9", darkgreen:"#006400", darkkhaki:"#BDB76B", darkmagenta:"#8B008B",
    darkolivegreen:"#556B2F", darkorange:"#FF8C00", darkorchid:"#9932CC", darkred:"#8B0000",
    darksalmon:"#E9967A", darkseagreen:"#8FBC8B", darkslateblue:"#483D8B", darkslategray:"#2F4F4F",
    darkturquoise:"#00CED1", darkviolet:"#9400D3", deeppink:"#FF1493", deepskyblue:"#00BFFF",
    dimgray:"#696969", dodgerblue:"#1E90FF", firebrick:"#B22222", floralwhite:"#FFFAF0",
    forestgreen:"#228B22", fuchsia:"#FF00FF", gainsboro:"#DCDCDC", ghostwhite:"#F8F8FF",
    gold:"#FFD700", goldenrod:"#DAA520", gray:"#808080", green:"#008000",
    greenyellow:"#ADFF2F", honeydew:"#F0FFF0", hotpink:"#FF69B4", indianred:"#CD5C5C",
    indigo:"#4B0082", ivory:"#FFFFF0", khaki:"#F0E68C", lavender:"#E6E6FA",
    lavenderblush:"#FFF0F5", lawngreen:"#7CFC00", lemonchiffon:"#FFFACD", lightblue:"#ADD8E6",
    lightcoral:"#F08080", lightcyan:"#E0FFFF", lightgoldenrodyellow:"#FAFAD2", lightgreen:"#90EE90",
    lightgrey:"#D3D3D3", lightpink:"#FFB6C1", lightsalmon:"#FFA07A", lightseagreen:"#20B2AA",
    lightskyblue:"#87CEFA", lightslategray:"#778899", lightsteelblue:"#B0C4DE", lightyellow:"#FFFFE0",
    lime:"#00FF00", limegreen:"#32CD32", linen:"#FAF0E6", magenta:"#FF00FF",
    maroon:"#800000", mediumaquamarine:"#66CDAA", mediumblue:"#0000CD", mediumorchid:"#BA55D3",
    mediumpurple:"#9370DB", mediumseagreen:"#3CB371", mediumslateblue:"#7B68EE", mediumspringgreen:"#00FA9A",
    mediumturquoise:"#48D1CC", mediumvioletred:"#C71585", midnightblue:"#191970", mintcream:"#F5FFFA",
    mistyrose:"#FFE4E1", moccasin:"#FFE4B5", navajowhite:"#FFDEAD", navy:"#000080",
    oldlace:"#FDF5E6", olive:"#808000", olivedrab:"#6B8E23", orange:"#FFA500",
    orangered:"#FF4500", orchid:"#DA70D6", palegoldenrod:"#EEE8AA", palegreen:"#98FB98",
    paleturquoise:"#AFEEEE", palevioletred:"#DB7093", papayawhip:"#FFEFD5", peachpuff:"#FFDAB9",
    peru:"#CD853F", pink:"#FFC0CB", plum:"#DDA0DD", powderblue:"#B0E0E6",
    purple:"#800080", red:"#FF0000", rosybrown:"#BC8F8F", royalblue:"#4169E1",
    saddlebrown:"#8B4513", salmon:"#FA8072", sandybrown:"#F4A460", seagreen:"#2E8B57",
    seashell:"#FFF5EE", sienna:"#A0522D", silver:"#C0C0C0", skyblue:"#87CEEB",
    slateblue:"#6A5ACD", slategray:"#708090", snow:"#FFFAFA", springgreen:"#00FF7F",
    steelblue:"#4682B4", tan:"#D2B48C", teal:"#008080", thistle:"#D8BFD8",
    tomato:"#FF6347", turquoise:"#40E0D0", violet:"#EE82EE", wheat:"#F5DEB3",
    white:"#FFFFFF", whitesmoke:"#F5F5F5", yellow:"#FFFF00", yellowgreen:"#9ACD32"}

var buf = [];
for(var n in colorMap){
    buf.push(n)
}
buf.push('\\b(?:rgb|hsl)a?\\s*\\(\\s*\\d+%?\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d\\.]+)?\\)')
var colorPattern = new RegExp(
    "\\b(background|color|border|border-\\w+)\\s*\\:|'[^']*'|\"[^\"]*\""
        +"|("+buf.join('|')+")|([\\{;])\\b",'ig');

function normalizeColor(source){
    var maybeColor;
    var color = colorMap[source.toLowerCase()];
    if(color){
        return color;
    }else if(/^#([\da-f])([\da-f])([\da-f])$/g.test(source)){
        return source.replace(/#([\da-f])([\da-f])([\da-f])\b/g,'#$1$1$2$2$3$3').toUpperCase();
    }else if(/^#[\da-f]{6}$/g.test(source)){
        return source.toUpperCase();
    }
    source = source.replace(/#([\da-f])([\da-f])([\da-f])\b/g,'#$1$1$2$2$3$3')
        .replace(colorPattern,function(a,start,color,reset){
            if(color){
                if(maybeColor){
                    if(/^hsl/i.test(color)){
                        return hsl2rgb(color);
                    }else if(/^rgb/i.test(color)){
                        return formatRGB(color)
                    }
                    return colorMap[color.toLowerCase()];
                }
            }else if(reset){
                maybeColor = false;
            }else if(start){
                maybeColor = true;
            }
            return a;
        });
    return source;
}
function formatRGB(rgb){
    var tokens = rgb.toLowerCase().match(/^rgba?|[\d\.]+%?/g);
    var type = tokens[0];
    var r = to255(tokens[1])
    var g = to255(tokens[2])
    var b = to255(tokens[3])
    var a = tokens[4];
    if(type == 'rgba'){
        return 'rgba('+r+','+g+','+b+','+a+')';
    }
    rgb = (0x1000000 | r<<16 | g<<8 | b).toString(16).replace('1','#')
    //console.log(rgb,tokens)
    return rgb;
}
function to255(value){
    if(/%$/.test(value)){
        return Math.ceil(value.slice(0,-1)*2.5)
    }
    return parseInt(value);
}
/**
 * hsl:hsl(120,100%,50%)
 * hsla:hsla(120,100%,50%,.1)
 */
function hsl2rgb(hsl){
    var tokens = hsl.toLowerCase().match(/^hsla?|[\d\.]+/g);
    var type = tokens[0];
    var h = +tokens[1];
    var s = tokens[2]/100;
    var l = tokens[3]/100;
    var a = tokens[4];
    //* h:0,359
    //* s:0,1
    //* l:0,1
    var r, g, b;
    if (h < 120){
        r = (120 - h) / 60;
        g = h / 60;
        b = 0;
    }else if (h < 240){
        r = 0;
        g = (240 - h) / 60;
        b = (h - 120) / 60;
    }else{
        r = (h - 240) / 60;
        g = 0;
        b = (360 - h) / 60;
    }

    r = Math.min(r, 1);
    g = Math.min(g, 1);
    b = Math.min(b, 1);

    r = 2 * s * r + (1 - s);
    g = 2 * s * g + (1 - s);
    b = 2 * s * b + (1 - s);

    if (l < 0.5){
        r = l * r;
        g = l * g;
        b = l * b;
    }else{
        r = (1 - l) * r + 2 * l - 1;
        g = (1 - l) * g + 2 * l - 1;
        b = (1 - l) * b + 2 * l - 1;
    }

    r = Math.ceil(r * 255);
    g = Math.ceil(g * 255);
    b = Math.ceil(b * 255);
    if(type == 'hsla'){
        return 'rgba('+r+','+g+','+b+','+a+')';
    }
    return (0x1000000 | r<<16 | g<<8 | b).toString(16).replace('1','#')
}
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2009 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var QUnit = {

	// Initialize the configuration options
	init: function() {
		config = {
			stats: { all: 0, bad: 0 },
            moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			blocking: false,
			autorun: false,
			assertions: [],
			filters: [],
			queue: []
		};

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;

		synchronize(function() {
			if ( config.currentModule ) {
				QUnit.moduleDone( config.currentModule, config.moduleStats.bad, config.moduleStats.all );
			}

			config.currentModule = name;
			config.moduleTestEnvironment = testEnvironment;
			config.moduleStats = { all: 0, bad: 0 };

			QUnit.moduleStart( name, testEnvironment );
		});
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = testName, testEnvironment, testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = config.currentModule + " module: " + name;
		}

		if ( !validTest(name) ) {
			return;
		}

		synchronize(function() {
			QUnit.testStart( testName );

			testEnvironment = extend({
				setup: function() {},
				teardown: function() {}
			}, config.moduleTestEnvironment);
			if (testEnvironmentArg) {
				extend(testEnvironment,testEnvironmentArg);
			}

			// allow utility functions to access the current test environment
			QUnit.current_testEnvironment = testEnvironment;
			
			config.assertions = [];
			config.expected = expected;

			try {
				if ( !config.pollution ) {
					saveGlobal();
				}

				testEnvironment.setup.call(testEnvironment);
			} catch(e) {
				QUnit.ok( false, "Setup failed on " + name + ": " + e.message );
			}

			if ( async ) {
				QUnit.stop();
			}

			try {
				callback.call(testEnvironment);
			} catch(e) {
				fail("Test " + name + " died, exception and test follows", e, callback);
				QUnit.ok( false, "Died on test #" + (config.assertions.length + 1) + ": " + e.message );
				// else next test will carry the responsibility
				saveGlobal();

				// Restart the tests if they're blocking
				if ( config.blocking ) {
					start();
				}
			}
		});

		synchronize(function() {
			try {
				checkPollution();
				testEnvironment.teardown.call(testEnvironment);
			} catch(e) {
				QUnit.ok( false, "Teardown failed on " + name + ": " + e.message );
			}

			try {
				QUnit.reset();
			} catch(e) {
				fail("reset() failed, following Test " + name + ", exception and reset fn follows", e, reset);
			}

			if ( config.expected && config.expected != config.assertions.length ) {
				QUnit.ok( false, "Expected " + config.expected + " assertions, but " + config.assertions.length + " were run" );
			}

			var good = 0, bad = 0,
				tests = id("qunit-tests");

			config.stats.all += config.assertions.length;
			config.moduleStats.all += config.assertions.length;

			if ( tests ) {
				var ol  = document.createElement("ol");
				ol.style.display = "none";

				for ( var i = 0; i < config.assertions.length; i++ ) {
					var assertion = config.assertions[i];

					var li = document.createElement("li");
					li.className = assertion.result ? "pass" : "fail";
					li.appendChild(document.createTextNode(assertion.message || "(no message)"));
					ol.appendChild( li );

					if ( assertion.result ) {
						good++;
					} else {
						bad++;
						config.stats.bad++;
						config.moduleStats.bad++;
					}
				}

				var b = document.createElement("strong");
				b.innerHTML = name + " <b style='color:black;'>(<b class='fail'>" + bad + "</b>, <b class='pass'>" + good + "</b>, " + config.assertions.length + ")</b>";
				
				addEvent(b, "click", function() {
					var next = b.nextSibling, display = next.style.display;
					next.style.display = display === "none" ? "block" : "none";
				});
				
				addEvent(b, "dblclick", function(e) {
					var target = e && e.target ? e.target : window.event.srcElement;
					if ( target.nodeName.toLowerCase() === "strong" ) {
						var text = "", node = target.firstChild;

						while ( node.nodeType === 3 ) {
							text += node.nodeValue;
							node = node.nextSibling;
						}

						text = text.replace(/(^\s*|\s*$)/g, "");

						if ( window.location ) {
							window.location.href = window.location.href.match(/^(.+?)(\?.*)?$/)[1] + "?" + encodeURIComponent(text);
						}
					}
				});

				var li = document.createElement("li");
				li.className = bad ? "fail" : "pass";
				li.appendChild( b );
				li.appendChild( ol );
				tests.appendChild( li );

				if ( bad ) {
					var toolbar = id("qunit-testrunner-toolbar");
					if ( toolbar ) {
						toolbar.style.display = "block";
						id("qunit-filter-pass").disabled = null;
						id("qunit-filter-missing").disabled = null;
					}
				}

			} else {
				for ( var i = 0; i < config.assertions.length; i++ ) {
					if ( !config.assertions[i].result ) {
						bad++;
						config.stats.bad++;
						config.moduleStats.bad++;
					}
				}
			}

			QUnit.testDone( testName, bad, config.assertions.length );

			if ( !window.setTimeout && !config.queue.length ) {
				done();
			}
		});

		if ( window.setTimeout && !config.doneTimer ) {
			config.doneTimer = window.setTimeout(function(){
				if ( !config.queue.length ) {
					done();
				} else {
					synchronize( done );
				}
			}, 13);
		}
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		QUnit.log(a, msg);

		config.assertions.push({
			result: !!a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		push(expected != actual, actual, expected, message);
	},
    
    colorEqual : function(actual , expected , message) {
        push(normalizeColor(expected) == normalizeColor(actual), actual, expected, message);
    },
    
    colorNotEqual: function(actual, expected, message) {
        push(normalizeColor(expected) != normalizeColor(actual), actual, expected, message);
    },
	deepEqual: function(a, b, message) {
		push(QUnit.equiv(a, b), a, b, message);
	},

	notDeepEqual: function(a, b, message) {
		push(!QUnit.equiv(a, b), a, b, message);
	},

	strictEqual: function(actual, expected, message) {
		push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		push(expected !== actual, actual, expected, message);
	},
	
	start: function() {
		// A slight delay, to avoid any current callbacks
		if ( window.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.blocking = true;

		if ( timeout && window.setTimeout ) {
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery("#main").html( config.fixture );
			jQuery.event.global = {};
			jQuery.ajaxSettings = extend({}, config.ajaxSettings);
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return Object.prototype.toString.call( obj ) === "[object "+ type +"]";
	},
	
	// Logging callbacks
	done: function(failures, total) {},
	log: function(result, message) {},
	testStart: function(name) {},
	testDone: function(name, failures, total) {},
	moduleStart: function(name, testEnvironment) {},
	moduleDone: function(name, failures, total) {}
};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		toolbar.style.display = "none";
		
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		filter.disabled = true;
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
		});
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );

		var missing = document.createElement("input");
		missing.type = "checkbox";
		missing.id = "qunit-filter-missing";
		missing.disabled = true;
		addEvent( missing, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("fail") > -1 && li[i].innerHTML.indexOf('missing test - untested code is broken code') > - 1 ) {
					li[i].parentNode.parentNode.style.display = missing.checked ? "none" : "block";
				}
			}
		});
		toolbar.appendChild( missing );

		label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-missing");
		label.innerHTML = "Hide missing tests (untested code is broken code)";
		toolbar.appendChild( label );
	}

	var main = id('main');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if ( window.jQuery ) {
		config.ajaxSettings = window.jQuery.ajaxSettings;
	}

	QUnit.start();
});

function done() {
	if ( config.doneTimer && window.clearTimeout ) {
		window.clearTimeout( config.doneTimer );
		config.doneTimer = null;
	}

	if ( config.queue.length ) {
		config.doneTimer = window.setTimeout(function(){
			if ( !config.queue.length ) {
				done();
			} else {
				synchronize( done );
			}
		}, 13);

		return;
	}

	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( config.currentModule, config.moduleStats.bad, config.moduleStats.all );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		html = ['Tests completed in ',
		+new Date - config.started, ' milliseconds.<br/>',
		'<span class="passed">', config.stats.all - config.stats.bad, '</span> tests of <span class="total">', config.stats.all, '</span> passed, <span class="failed">', config.stats.bad,'</span> failed.'].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( config.stats.bad, config.stats.all );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

function push(result, actual, expected, message) {
	message = message || (result ? "okay" : "failed");
	QUnit.ok( result, result ? message + ": " + expected : message + ", expected: " + QUnit.jsDump.parse(expected) + " result: " + QUnit.jsDump.parse(actual) );
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	while ( config.queue.length && !config.blocking ) {
		config.queue.shift()();
	}
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions


    // Determine what is o.
    function hoozit(o) {
        if (QUnit.is("String", o)) {
            return "string";
            
        } else if (QUnit.is("Boolean", o)) {
            return "boolean";

        } else if (QUnit.is("Number", o)) {

            if (isNaN(o)) {
                return "nan";
            } else {
                return "number";
            }

        } else if (typeof o === "undefined") {
            return "undefined";

        // consider: typeof null === object
        } else if (o === null) {
            return "null";

        // consider: typeof [] === object
        } else if (QUnit.is( "Array", o)) {
            return "array";
        
        // consider: typeof new Date() === object
        } else if (QUnit.is( "Date", o)) {
            return "date";

        // consider: /./ instanceof Object;
        //           /./ instanceof RegExp;
        //          typeof /./ === "function"; // => false in IE and Opera,
        //                                          true in FF and Safari
        } else if (QUnit.is( "RegExp", o)) {
            return "regexp";

        } else if (typeof o === "object") {
            return "object";

        } else if (QUnit.is( "Function", o)) {
            return "function";
        } else {
            return undefined;
        }
    }

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = hoozit(o);
        if (prop) {
            if (hoozit(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return hoozit(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i;
                var len;

                // b could be an object literal here
                if ( ! (hoozit(b) === "array")) {
                    return false;
                }

                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if ( ! innerEquiv(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            },

            "object": function (b, a) {
                var i;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);

                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

                    aProperties.push(i); // collect a's properties

                    if ( ! innerEquiv(a[i], b[i])) {
                        eq = false;
                    }
                }

                callers.pop(); // unstack, we are done

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (QUnit.is("Array", obj)) {
				type = "array";
			} else if (QUnit.is("Window", obj) || QUnit.is("global", obj)) {
				type = "window";
			} else if (QUnit.is("HTMLDocument", obj)) {
				type = "document";
			} else if (QUnit.is("HTMLCollection", obj) || QUnit.is("NodeList", obj)) {
				type = "nodelist";
			} else if (/^\[object HTML/.test(Object.prototype.toString.call( obj ))) {
				type = "node";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, this.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, this.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				this.up();
				for ( var key in map )
					ret.push( this.parse(key,'key') + ': ' + this.parse(map[key]) );
				this.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = this.HTML ? '&lt;' : '<',
					close = this.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in this.DOMAttrs ) {
					var val = node[this.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + this.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:true,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'   ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

})(this);

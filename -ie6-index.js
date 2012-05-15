require('./lib/ie6-only');
require('./lib/transition');
require('./lib/nth');
require('./lib/box');
require('./lib/matrix');
exports.CS = require('./lib/core').CS

var FilterHelper = require('./filter').FilterHelper
var vistTransition = require('./lib/runtime/transition').vistTransition
var pollMap = CS.pollMap;
pollMap.opacity = function(el,opacity,config){
	FilterUtil(el).setOpacity(transform).update();
}
pollMap.transform = function(el,transform,config){
	FilterHelper(el).setTransform(transform).update();
}
pollMap["cs-linear-gradient"]=function(el,gradient,config){
	FilterHelper(el).setLinearGradient(gradient).update();
}
pollMap["box"]=function(el,mw){
	
}

pollMap.transition = vistTransition
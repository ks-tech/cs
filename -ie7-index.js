var CS = require('./lib/runtime/core').CS;

var dynamicClassPlugin = require("./lib/runtime/plugin-ie7-dynamic-class").dynamicClassPlugin
var attributePlugin = require("./lib/runtime/plugin-ie6-attr").attributePlugin



var nthPlugin = require("./lib/runtime/updater-nth").nthPlugin
var boxPlugin = require("./lib/runtime/updater-box").boxPlugin
var refPlugin = require("./lib/runtime/updater-ref").refPlugin
var transitionPlugin = require('./lib/runtime/updater-transition').transitionPlugin

var FilterManager = require('./lib/runtime/filter').FilterManager


CS.addPlugin(dynamicClassPlugin);
CS.addPlugin(attributePlugin);

//CS.addPlugin('child',childPlugin);//需要轮询



CS.addPlugin(nthPlugin,'onexist','cs-update-nth')
CS.addPlugin(boxPlugin,'onexist',"border-radius")
CS.addPlugin(refPlugin,'onexist',"cs-ref")
CS.addPlugin(transitionPlugin,'onexist','transition-property')


//CS.addPlugin(relationPlugin,'onexist',"cs-update-relation")

CS.addPlugin({
	id:'update-opacity',
	update:function(el,config,opacity){
		FilterManager(el).setOpacity(opacity).update();
	}
},'onchange','opacity')
CS.addPlugin({id:'update-cs-linear-gradient',
	update:function(el,config,gradient){
		FilterManager(el).setLinearGradient(gradient).update();
	}
},'onchange','cs-linear-gradient')

CS.addPlugin({id:'update-transform',
	update: function(el,config,transform){
		FilterManager(el).setTransform(transform).update();
	}
},'onchange','transform')


exports.CS = CS;
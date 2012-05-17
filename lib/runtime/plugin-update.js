/* add default update plugin**/

var FilterManager = require('./filter').FilterManager
var updatePlugin = {
	id:'update',
	config:function(style){//可选
		var i = configPlugins.length;
		while(i--){
			configPlugins[i].config(style);
		}
	},
	update:function (el,config){
		elementList.push(el);
		configList.push(config);
		inc = -1;
		updateInterval || startInterval();
		
	}
}
var configPlugins= [];
var changedUpdaterMap = {};
var existedUpdaterMap = {};

var configList = [];
var elementList = []
var updateInterval = null;
var interval = 50;
var inc = -1;
var forceUpdate = false;
function startInterval(){
	if(updateInterval){
		clearInterval(updateInterval);updateInterval = null;
	}
	forceUpdate = true;
	updateTask();
	updateInterval = setInterval(updateTask,interval)
}

function updateTask(){
	inc++
	var i = elementList.length;
	while(i--){
		updateElement(elementList[i],configList[i]);
	}
	forceUpdate = false;
}
function updateElement(el,config){
	var currentStyle = el.currentStyle;
	var transaction ;
	if(forceUpdate || currentStyle['cs-alive']!='0'){
		for(var n in changedUpdaterMap){
			var currentValue = currentStyle[n];
			if(currentValue != config[n]){
				transaction = transaction || FilterManager.start();
				changedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
		for(var n in existedUpdaterMap){
			var currentValue = currentStyle[n];
			if(currentValue || currentValue != config[n] ){
				transaction = transaction || FilterManager.start();
				existedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
		transaction && FilterManager.end();
	}
}
exports.pluginMap = {
	update:updatePlugin,
	onexist:{
		appendChild:function(impl,styleKey){
			existedUpdaterMap[styleKey] = impl;
			impl.config && configPlugins.push(impl)
		}
	},
	onchange:{
		appendChild:function(impl,styleKey){
			changedUpdaterMap[styleKey] = impl;
			impl.config && configPlugins.push(impl)
		}
	}
}
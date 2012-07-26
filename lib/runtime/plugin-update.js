/* add default update plugin**/

//var FilterManager = require('./filter').FilterManager
var updatePlugin = {
	id:'update',
//	config:function(style){//可选
//		var i = configPlugins.length;
//		while(i--){
//			configPlugins[i].config(style);
//		}
//	},
	update:function (el,config){
		elementList.push(el);
		configList.push(config);
		inc = -1;
		updateElement(el,config)
		updateInterval || startInterval();
	}
}
//var configPlugins= [];
var changedUpdaterMap = {};
var existedUpdaterMap = {};

var configList = [];
var elementList = []
var updateInterval = null;
var interval = 64;
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
	var cont = true;
	//try{
	while(i--){
		updateElement(elementList[i],configList[i]);
	}
	//}catch(e){
	//	cont = cont && confirm(e.message)
	//}
	forceUpdate = false;
}
function updateElement(el,config){
	var currentStyle = el.currentStyle;
	var transaction ;
	try{
	if(forceUpdate || currentStyle['cs-alive']!='0'){
		for(var n in existedUpdaterMap){
			var currentValue = currentStyle[n];
			if(currentValue || currentValue != config[n] ){
//				transaction = transaction || FilterManager.start();
				existedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
		for(var n in changedUpdaterMap){
			var currentValue = currentStyle[n];
			//if(n == 'transform'){
			//	console.log(currentValue)
			//}
			if(currentValue != config[n]){
//				transaction = transaction || FilterManager.start();
				
				changedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
//		transaction && FilterManager.end();
	}
	}catch(e){
		if(!el.runtimeStyle['cs-reported']){
			el.runtimeStyle['cs-reported']=1;
			console.error('update failed',el.outerHTML,n,e.message||e)
		}
		throw e;
	}
}
exports.pluginMap = {
	update:updatePlugin,
	onexist:{
		appendChild:function(impl,styleKey){
			existedUpdaterMap[styleKey] = impl;
//			impl.config && configPlugins.push(impl)
		}
	},
	onchange:{
		appendChild:function(impl,styleKey){
			changedUpdaterMap[styleKey] = impl;
//			impl.config && configPlugins.push(impl)
		}
	}
}

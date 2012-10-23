/* add default update plugin**/

//var FilterManager = require('./filter').FilterManager
var attrPlugin = require("./plugin-attr").attributePlugin
var updatePlugin = {
	id:'update',
//	config:function(style){//可选
//		var i = configPlugins.length;
//		while(i--){
//			configPlugins[i].config(style);
//		}
//	},
	update:function (el,config){
		try{
		if(el.currentStyle['cs-plugin-attr']){
			el.runtimeStyle['cs-plugin-attr'] = 1;
			attrPlugin.update(el)
		}
		elementList.push(el);
		configList.push(config);
		inc = -1;
		el && updateElement(el,config)
		updateInterval || startInterval();
		}catch(e){alert(e)}
	}
}
var deactive = false;
var activeInc = 0;
try{
function active(){
	deactive = false;
}
document.attachEvent('onfocusin',active)
document.attachEvent('onmousemove',active)
document.attachEvent('onfocusout',function(){
	deactive = true;
})
}catch(e){}

//var configPlugins= [];
var changedUpdaterMap = {};
var existedUpdaterMap = {};

var configList = [];
var elementList = []
var updateInterval = null;
var interval = 128;
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
	if(deactive && 
		activeInc++%32){
		return;
	}
	inc++
	var i = elementList.length;
	var cont = true;
	//try{
	var t = new Date();
	while(i--){
		var el = elementList[i];
		el && updateElement(el,configList[i]);
	}
	switch(CS.ieVersion){
		case '7':
		case '8':
		//attribute NOTIFY
		document.documentElement.className+=''
	}
	t = new Date() -t;
	
	//}catch(e){cont = cont && confirm(e.message);}
	forceUpdate = false;
}
function updateElement(el,config){
	var currentStyle = el.currentStyle;
	var transaction ;
	try{
	if(forceUpdate ||true){//|| currentStyle['cs-alive']!='0'){
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
		//console.log(el)
		if('cs-reported' in el && el.runtimeStyle){
			el.runtimeStyle['cs-reported']=1;
			console.error('update failed',location,el.outerHTML,n,e.message||e)
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

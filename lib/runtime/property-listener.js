var pluginListenerMap = {}
function setupListener(pid,el){
	var style = el.runtimeStyle;
	if(pluginListenerMap[pid] && !style['cs-propertychange']){
		style['cs-propertychange'] = 1;
		el.attachEvent('onpropertychange',propertyListener)
		//console.log(el.tagName)
	}
}
function configListener(pid,propertyListenerMap){
	if(propertyListenerMap){
		pluginListenerMap[pid] = propertyListenerMap;
	}
}
function propertyListener(){
	var el = event.srcElement;
	var attr = event.propertyName;
	if('opacity' == attr || 'style.opacity' == attr){//el.runtimeStyle.opacity changed
		//el.runtimeStyle.filter = 'Alpha(opacity='+parseInt(el.currentStyle.opacity * 100)+')'
		//console.log(el.runtimeStyle.filter)
		return;
	}
	for(var pid in pluginListenerMap){
		var m = pluginListenerMap[pid]
		if(m[attr] && el.runtimeStyle['cs-plugin-'+pid]){
			m[attr](el,attr)
		}
	}
}
exports.setupListener = setupListener;
exports.configListener = configListener;

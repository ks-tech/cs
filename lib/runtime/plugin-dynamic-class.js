var updateClasses = require('./plugin-muti-class').updateClasses;
var dynamicClassPlugin = {
	id:'dc',//dynamic pseudo-classes plugin
	update:function(el){//ie7
		el.attachEvent('onmousedown',dpcActive);
		el.attachEvent('onfocus',dpcFocus);
	}
}

var dpcFocus = dpcEvent('focus__','onfocus','onblur');
var dpcActive = dpcEvent('active__','onmousedown','onmouseup','onmouseout');
//ie6
var ie6 = navigator.userAgent.indexOf('; MSIE 6')>0 ;
if(ie6){
	var dpcHover = dpcEvent('hover__','onmouseenter','onmouseleave');
	dynamicClassPlugin.update = function(el){
		el.attachEvent('onmouseenter',dpcHover);
		el.attachEvent('onmousedown',dpcActive);
		el.attachEvent('onfocus',dpcFocus);
	}
}else{
	updateClasses = function(el,className){
		el.className = className;
	}
}
//处理三大动态交互伪类
function dpcEvent(className,enterEvent,exitEvent,exitEvent2){
	function onstart(){
		var el = event.srcElement;
		el.detachEvent(enterEvent,onstart)
		el.attachEvent(enterEvent,onenter);
		el.attachEvent(exitEvent,onexit);
		if(exitEvent2){
			el.attachEvent(exitEvent2,onexit);
		}
		onenter();
	}
	function onenter(){
		var el = event.srcElement
		updateClasses(el,el.className +' '+ className, true);
	}
	var removePattern = new RegExp(
		"(?:^|\\s+)(?:\\S+--)?"+
		className+
		"(?:--\\S+)?(?=\\s|$)",'g')
	function onexit(){
		_removeClassByPattern(event.srcElement,removePattern);
	}
	return onstart;
}


function _removeClassByPattern(el,pattern){
	var c = el.className.replace(pattern,'').replace(/^\s+/,'');
	updateClasses(el,c, false);
}

//IE6 支持多class hack
exports.dynamicClassPlugin = dynamicClassPlugin;

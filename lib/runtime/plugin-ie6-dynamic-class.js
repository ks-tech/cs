var updateClasses = require('./plugin-ie6-muti-class').updateClasses;
var dynamicClassPlugin = {
	id:'dc',//dynamic pseudo-classes plugin
	update:function(el){//可选
		//css apply 时执行
		//var tagName = el.tagName;
		el.attachEvent('onmouseenter',dpcHover);
		//if(focusPattern.test(tagName) ){
		el.attachEvent('onmousedown',dpcActive);
		//if(tagName != 'A' || has tabIndex ){
		el.attachEvent('onfocus',dpcFocus);
	}
}
var dpcHover = dpcEvent('hover__','onmouseenter','onmouseleave');
var dpcFocus = dpcEvent('focus__','onfocus','onblur');
var dpcActive = dpcEvent('active__','onmousedown','onmouseup','onmouseout');

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
	var removePattern = new RegExp("(^|\\s+)(?:\\S+--)?"+/*toRegSource(className)*/className+"(?:--\\S+)?(\\s+|$)",'g')
	function onexit(){
		_removeClassByPattern(event.srcElement,removePattern);
	}
	return onstart;
}


function _removeClassByPattern(el,pattern){
	var c = el.className.replace(pattern,function(a,prefix,postfix){
		return prefix && postfix && ' ' || ''
	});
	updateClasses(el,c, false);
}

//IE6 支持多class hack
exports.dynamicClassPlugin = dynamicClassPlugin;

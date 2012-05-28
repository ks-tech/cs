var dynamicClassPlugin = {
	id:'dc',
	update:function(el){//可选
		console.log(el.tagName)
		el.attachEvent('onfocus',onfocusStart);
		el.attachEvent('onmousedown',onactiveStart);
	}
}

//处理onactive
function onactiveStart(){
	var el = event.srcElement;
	el.detachEvent('onmousedown',onactiveStart)
	el.attachEvent('onmousedown',onactive);
	el.attachEvent('onmouseup',ondeactive);
	el.attachEvent('onmouseout',ondeactive);
	onactive();
}
function onactive(){
	var el = event.srcElement
	el.className +=' active__';
}
function ondeactive(){
	var el = event.srcElement
	var c = el.className;
	var c2 = c.replace(/(^|\s+)active__(\s+|$)/g,function(a,prefix,postfix){
		return prefix && postfix && ' ' || ''
	});
	if(c != c2 ){
		el.className = c2;
	}
}
//处理onfocus,onblur
function onfocusStart(){
	var el = event.srcElement;
	el.detachEvent('onfocus',onfocusStart)
	el.attachEvent('onfocus',onfocus);
	el.attachEvent('onblur',onblur);
	onfocus();
}
function onfocus(){
	var el = event.srcElement
	el.className +=' focus__';
}
function onblur(){
	var el = event.srcElement
	var c = el.className;
	var c2 = c.replace(/(^|\s+)focus__(\s+|$)/g,function(a,prefix,postfix){
		return prefix && postfix && ' ' || ''
	});
	if(c != c2 ){
		el.className = c2;
	}
}



exports.dynamicClassPlugin = dynamicClassPlugin;

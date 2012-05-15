var dynamicPseudoPlugin = {id:'dc',//dynamic pseudo-classes plugin
	setup:function(el){//可选
		el.attachEvent('onfocus',onfocusStart);
	},
	expression:'textKashidaSpace'
}

//处理onfocus,onblur
function onfocusStart(){
	var el = event.srcElement;
	el.detachEvent('onfocus',onfocusStart)
	el.attachEvent('onfocus',onfocusEvent);
	el.attachEvent('onblur',onblurEvent);
	onfocusEvent();
}
function onfocusEvent(){
	var el = event.srcElement
	el.className +=' focus__';
}
function onblurEvent(){
	var c = el.className;
	var c2 = c.replace(/(^|\s+)focus__(\s+|$)/g,function(a,prefix,postfix){
		return prefix && postfix && ' ' || ''
	});
	if(c != c2 ){
		el.className = c2;
	}
}

//IE6 支持多class hack
exports.dynamicPseudoPlugin = dynamicPseudoPlugin;

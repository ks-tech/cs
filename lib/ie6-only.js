var CS = require('./core').CS
var mutiClassMap = {};
var attrClassMap = {};
var attributeUpdaterMap={};
var dpcHover = dpcEvent('hover__','onmouseenter','onmouseleave');
var dpcFocus = dpcEvent('focus__','onfocus','onblur');
var dpcActive = dpcEvent('active__','onmousedown','onmouseup','onmouseout');
var classUpdaterMap = {'className':classUpdater};
var tracePC = true;
//IE6 支持多class hack
CS.addPlugin({id:'mc',//multi-classes plugin
	config:function(style){
		addMutiClassesConfig(style.getAttribute('muti-classes'));
		CS.setPropertyListener(classUpdaterMap)
	},
	setup:function(el){//可选
		//css apply 时执行
		updateMultiClasses(el.className,el)
	},
	//vist:function
	//dispose:function(el){//可选，系统发现该对象不存在时执行。	//},
	expression:'textKashida' //可选，如果设置，编译是需要设置自动添加初始化expression
})


CS.addPlugin({id:'attr',//attribute query plugin
	config:function(style){
		addAttriClassesConfig(style.getAttribute('attr-classes'));
		CS.setPropertyListener(attributeUpdaterMap)
	},
	setup:function(el){//可选
		var out=[el.className]
		for(var attr in attrClassMap){
			var map = attrClassMap[attr];
			var value = el.getAttribute(attr);
			applyClass(map,'attr-',value,out);
		}
		updateMultiClasses(out.join(' '),el)
		//el.attachEvent('onpropertychange',attrListener);
	},
	expression:'pageBreakBefore'
})




CS.addPlugin({id:'dc',//dynamic pseudo-classes plugin
	setup:function(el){//可选
		//css apply 时执行
		//var tagName = el.tagName;
		el.attachEvent('onmouseenter',dpcHover);
		//if(focusPattern.test(tagName) ){
		el.attachEvent('onmousedown',dpcActive);
		//if(tagName != 'A' || has tabIndex ){
		el.attachEvent('onfocus',dpcFocus);
	},
	expression:'textKashidaSpace'
})
/* ============= impl util =============== */


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
		updateMultiClasses(el.className +' '+ className, el);
		//console.info(event.srcElement.className)
	}
	var removePattern = new RegExp("(^|\\s+)(?:\\S+--)?"+toRegSource(className)+"(?:--\\S+)?(\\s+|$)",'g')
	function onexit(){
		_removeClassByPattern(event.srcElement,removePattern);
	}
	return onstart;
}
function _setClass(el,cs){//ie6 only becauseof attr suport failed
	el.className = cs
	tracePC = false;
	el.className = cs;
	tracePC = true;
}

function _removeClassByPattern(el,pattern){
	//el.detachEvent('onpropertychange',propertyListener)
	
	var c = el.className.replace(pattern,function(a,prefix,postfix){
		return prefix && postfix && ' ' || ''
	});
	//console.log(el.className,'\n',c,'\n',pattern)
	tracePC = false;
	el.className = c;
	tracePC = true;
	//el.attachEvent('onpropertychange',propertyListener)
	//document.title = el.className;
	//.replace(/(?:^|\s+)(?:\S+\-\-)?(?:\-\-\S+)(?:\s+|$)/,' ');
}
function buildAttrCheck(type,value){
	var pattern = toRegSource(value);
	switch(type){
		case '^':
			pattern = '^'+pattern;
			break;
		case '$':
			pattern = pattern+'$';
		case '*':
			break;
		case '~'://space-separated
			pattern = '(?:^|\\s)'+pattern+'(?:\\s|$)';
			break;
		case '|':////hyphen-separated 
			pattern = '(?:^|\\|)'+pattern+'(?:\\||$)';
			break;
		default:
			if(value == null){//exist check
				return function(value){return value != null;}
			}else{//=
				pattern = '^'+pattern+'$';
			}
	}
	pattern = new RegExp(pattern);
	return function(value){
		if(value == null){//ie === null not exists
			return false;
		}
		return pattern.test(value)
	}
}



/**
 * classMap
 * key3:[[key1,key2,key3],[key0,key3]]
 */
function updateMultiClasses(cs,el){
	var cm = mutiClassMap;
	var t = new Date;
//	console.log(2,cs)
	if(cs.match(/\s+/)){
		cs = cs.replace(/\S*\-\-\S*/g,'').replace(/^\s+|\s+$/g,'').split(/\s+/);
		cs.sort();
//		console.log('3',cs)
		var i = cs.length;
		while(i-->0){
			var c = cs[i];
			if(i && (c in cm)){
				var list = cm[c];
				var l = list.length;
				next:while(l-->0){//一个组合class
					var ms = list[l];
					var mi = ms.length-1;
					var k = i;
					while(mi--){//一个class
						var mc = ms[mi];
						while(true){
							if(k-->0){
								if(cs[k] === mc){break;}
							}else{
								continue next;
							}
						}
					}
					cs.push(ms.join('--'))
				}
			}
		}
		cs = cs.join(' ');
//		console.log('end1 class update:',(new Date - t))
		if(el && (el.className != cs)){
			_setClass(el,cs)
		}
//		console.log('4',cs)
	}
//	console.log('end2 class update:',cs)
	return cs;
}


function addMutiClassesConfig(value){//ie6 only
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var cs = value[len].split('--');
			var last = cs[cs.length-1];
			var list = mutiClassMap[last] ;
			list && list.push(cs)|| (mutiClassMap[last]=[cs])
		}
	}
}

/**
 * 
 * '^': '$':
 * '*'://
 * '~'://space-separated
 * '|'://hyphen-separated 
 */
function addAttriClassesConfig(value){//ie6 only
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var v = value[len];
			decodeURIComponent(v.replace(/_/g,'%')).replace(/^([\w-_$]+)([|~*$^])?(?:=([\s\S]*$))?/,function(a,attr,type,value){
				var map = attrClassMap[attr] ;
				var check = buildAttrCheck(type,value);
				if(!map){
					 map = attrClassMap[attr] = {}
				}
				map[v]=check
				attributeUpdaterMap[attr] = attributeUpdater;
			});
		}
	}
}
function classUpdater(el){
	if(tracePC){
		updateMultiClasses(el.className,el)
	}
}
function attributeUpdater(el,attr){
	console.log(attr,tracePC)
	if(tracePC){
		var out = [el.className.replace(new RegExp("(^|\\s+)attr-"+
								toRegSource(attr)+
								"_(?:5E|24|7E|2A|7C|3D)[\\w\\-_]+__",'g'),'')];
		var value = el.getAttribute(attr);
		var map = attrClassMap[attr] ;
		applyClass(map,'attr-',value,out)
		updateMultiClasses(out.join(' '),el)
	}
}

function applyClass(map,prefix,testValue,out){
	for(var c in map){
		if(map[c](testValue)){
			out.push(prefix+c+'__');
		}
	}
}
function toRegSource(s,c){
	return c? '\\u'+(0x10000+c.charCodeAt()).toString(16).substr(1)
			: s.replace(/([^\w_-])/g,toRegSource);
}

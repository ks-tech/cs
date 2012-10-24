var updateClasses = require('./plugin-muti-class').updateClasses;
var configListener = require('./property-listener').configListener
var setupListener = require('./property-listener').setupListener
var ieVersion = this.navigator && navigator.userAgent.replace(/^.*(?:; MSIE ([6-9])).*$|.*/,'$1')
var attributePlugin = {
	id:'attr',
	config:function(style){
		addAttriClassesConfig(style.getAttribute('attr-classes'));
		configListener('attr',attributeUpdaterMap);
		console.dir(attributeUpdaterMap)
		//console.log('!!!!!!!!',style.getAttribute('attr-classes'))
	},
	update:function(el){//可选
		setupListener('attr',el);
		switch(ieVersion){
		case '5':
		case '6':
			//console.log(attributeUpdaterMap)
			var out=[el.className]//初始化不需要清理已有。
			for(var attr in attrClassMap){
				var map = attrClassMap[attr];
				applyClass(map,'attr-',el,attr,out);
			}
			updateClasses(el,out.join(' '),true)
			break
		case '7':
		case '8':
			el.className = el.className;
			console.log(el.className)
		}
		//el.attachEvent('onpropertychange',attrListener);
	}
}
var attrClassMap = {};
var attributeUpdaterMap={};



/* ============= impl util =============== */
function toRegSource(s,c){
	return c? '\\u'+(0x10000+c.charCodeAt()).toString(16).substr(1)
			: s.replace(/([^\w_-])/g,toRegSource);
}
function buildAttrCheck(type,value){
	if(value == null){//exist check
		return function(value){return value != null;}
	}
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
			pattern = '(?:^|\\-)'+pattern+'(?:\\-|$)';
			break;
		default:
			pattern = '^'+pattern+'$';
	}
	pattern = new RegExp(pattern);
	
	return function(value){
		if(value == null){//ie === null not exists
			return false;
		}
		//alert([value,pattern.test(value)])
		return pattern.test(value)
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
			decodeURIComponent(v.replace(/_/g,'%')).replace(/^([\w-_]+)([|~*$^])?(?:=([\s\S]*$))?/,function(a,attr,type,value){
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

function attributeUpdater(el,attr){
	//console.log(attr,tracePC)
	var out = [el.className.replace(new RegExp("(^|\\s+)attr-"+
						/*toRegSource(attr)*/attr+//attr 没有正在特殊字符
						"(?:_(?:5E|24|7E|2A|7C|3D)[\\w\\-_]+)?__(?=\\s|$)",'g'),'')];
	var map = attrClassMap[attr] ;
	applyClass(map,'attr-',el,attr,out)
	//if(tracePC){
	if(CS.ieVersion<=6){
		updateClasses(el,out.join(' '),true);
	}else{
		el.className = out.join(' ');
		//console.log('class updated')
		//setTimeout(function(){el.className +='';document.recalc(true);},300);
	}
}

function applyClass(map,prefix,el,attr,out){
	var testValue = /^class$/.test(attr)?el.className:el.getAttribute(attr);
	switch(attr.toLowerCase()){
	case 'checked':
		testValue = !!el.checked;
		break;
	case 'disabled':
		testValue = !!el.disabled;//?'true':'false';
		break;
	case 'class':
		testValue = el.className;
		break;
	//case 'value':
	//	testValue = el.value;
	default:
		var testValue = el.getAttribute(attr);
	}
	//el.hasAttributeNode(attr)
	testValue = testValue === '' ?null:testValue;
	
	for(var c in map){
		if(map[c](testValue)){
			out.push(prefix+c+'__');
		}
	}
}

//IE6 支持多class hack
exports.attributePlugin = attributePlugin;

var setupKeyMap = require('../runtime/core').setupKeyMap
function getPluginStyle(pid){
	var v = setupKeyMap[pid];
	//console.log(pid,v)
	return v.replace(/[A-Z]/g,'-$&').toLowerCase();
}
function encodeSelector(attr){
	attr = encodeURIComponent(attr).replace(/[^\w]/g,function(c){
		return c=='%'?'_': 
			'_'+c.charCodeAt().toString(16).toUpperCase();
	})
	return attr;
}

function normalizeNth(nth){
	nth = nth.toLowerCase().replace(/[()]/g,'')
	if(nth == 'odd'){
		return '_2_1';
	}else if(nth == 'even'){
		return '_2_0';
	}
	nth = nth.split('n');
	var n1 = eval(nth[0]);
	var n2 = n1;
	if(nth.length < 2){
		n1 = 0;
	}else{
		n2 = eval(nth[1])||0;
	}
	//有n
	if(n1>0){
		if(n2<0){
			n2 = n2 % n1 + n1
		}
	}else if(n1 <=0){
		if(n2 <0){
			n1=0;n2=-1
		}
	}
	return '_'+n1+'_'+n2;
}
function walkSelector(data,callback){
	var i = data.length;
	while(i--){
		var group = data[i];
		var j = group.length;
		while(j--){
			var node = group[j];
			var k = node.length;
			while(--k){
				callback(node,node[k],k)
			}
		}
	}
}
function walkNode(data,callback){
	var i = data.length;
	while(i--){
		var group = data[i];
		var len = group.length;
		for(var j=0;j<len;j++){
			callback(group,group[j],j)
		}
	}
}
function clean(selectors,cache,type){
	var i = selectors.length;
	var typedCache = cache[type] || (cache[type] = {});
	while(i--){
		var n = selectors[i]
		if(n in typedCache){
			selectors.splice(i,1)
		}else{
			typedCache[n] = true;
		}
	}
	return selectors.length
}
function CSSManager(cssom,index,cs){
	var config = cs.config;
	var cache = cs.cache;
	this.setup = function(pid,selectors,appendInfo){
		if(ClassList.clean(selectors,cache,pid)){
			cssom.insertRule(selectors.join(',')+"{"+(appendInfo||'')+getPluginStyle(pid)+":expression(CS(this,'"+pid+"'));}",index+1);
		}
	}
	this.config = function(key,list){
		var thiz = config[key] || (config[key] = new ClassList())
		var i = list.length;
		while(i--){
			thiz.data[list[i]] = 1;
		}
	}
	this.append = function(selector,style){
		cssom.insertRule(selector+style.replace(/^\{?([\s\S]*?)\}?$/,'{$1}'),index+1)
	}
	
}
function ClassList(){
	this.data = {};
}


ClassList.prototype.toString = function(){
	var buf = []
	for(var n in this.data){
		buf.push(n)
	}
	return buf.join(',')
}
exports.encodeSelector = encodeSelector;
exports.normalizeNth = normalizeNth;
exports.walkSelector = walkSelector;
exports.walkNode = walkNode;
exports.getPluginStyle = getPluginStyle;
exports.CSSManager = CSSManager;
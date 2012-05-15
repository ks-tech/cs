//var updateClasses = require('./plugin-ie6-muti-class').updateClasses;
var nthPlugin = {id:'nth',//attribute query plugin
	config:function(style){
//		console.log('nth-classes:',style.cssText)
		style = style['nth-classes'];
		configNth(style);
	},
	setup:function(el){//可选
		var cn = el.className;
		var cn2 = computeNth(el,cn);
		if(cn!=cn2){
			el.className = cn;
		}
		//updateClasses(cn,el)
	},
	//visit:function(){}
	expression:'pageBreakAfter'
};

var nthClassMap = {};
var cachedNthInfo = {}
function computeNth(el,cn){
	var nthInfo = new CachedNthInfo(el);
	var out=[cn.replace(/(^|\s+)nth-[^ ]__(?:\s+|$)/g,'$1')]
	for(var type in nthClassMap){
		var map = nthClassMap[type];
		var index = nthInfo.getIndex(el,type);
		//applyClass(map,'nth-',index,out);
		for(var c in map){
			if(map[c](index)){ //&& el.currentStyle['nth-'+c]
				out.push('nth-'+c+'__');
			}
		}
	}
	return out.join(' ')
}

function configNth(value){
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var v = value[len];
			var type = v.replace(/_.*/,'');
			var map = nthClassMap[type] ;
			if(!map){
				 map = nthClassMap[type] = {}
			}
			map[v]=nthChecker(type,v.substr(type.length+1))
		}
	}
}

function CachedNthInfo(el){
	var parentNode = el.parentNode;
	var pid = parentNode.uniqueID;
	if(pid in cachedNthInfo){
		return cachedNthInfo[pid];
	}
	this.pid = pid;
	this.reset(parentNode.children);
}
CachedNthInfo.prototype = {
	getIndex:function(el,type){
		var children = el.parentNode.children;
		var uniqueID = el.uniqueID;
		if(children.length != this.length || !(uniqueID in this.indexMap)){
			this.reset(children);
		}
		var index = this.indexMap[uniqueID]
		switch(type){
		case 'child':
			return index;
		case 'last-child':
			return this.length-index;
		case 'last-of-type'://index+1->end
			var end = this.length;
		case 'of-type'://0->index
			var tag = this.tags[index];
			var inc = -1;
			if(!end){
				end = index;
				index = -1;
			}
			while(++index<end){
				if(this.tags[index]==tag){
					inc++;
				}
			}
			return inc;
		}
	},
	reset:function(children){
		var indexMap = this.indexMap = {}
		var tags = this.tags = [];
		var ids = this.ids = [];
		var len = this.length = children.length;
		while(len--){
			var el = children[len]
			tags[len] = el.tagName;
			indexMap[ids[len] = el.uniqueID] = len
		}
	}
}
function nthChecker(type,nth){
	nth = nth.split('_');
	var n1 = +nth[0];
	var n2 = +nth[1];
	return function(index){
		return index == n2 || n1 && !((index-n2)%n1)
	}
}
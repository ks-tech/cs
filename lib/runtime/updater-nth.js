//var updateClasses = require('./plugin-muti-class').updateClasses;

var nthClassMap = {};
var cachedNthInfo = {}
var nthPlugin = {
	id:'update-nth',
	config:function(style){
		//console.log('config',style['nth-classes']);
		configNth(style['nth-classes']);
	},
	update:function(el,config,value,excuteInc){//可选
		var cn = el.className;
		if(excuteInc % 0 ==0 ){
			var nth = computeNth(el)
			if(config.lastedNth!=(config.lastedNth=nth)){
				el.className = cn.replace(/(^|\s+)nth-[^ ]__(?:\s+|$)/g,'$1')+' nth-'+nth+'__';
			}
		}
		//updateClasses(cn,el)
	}
}
function computeNth(el){
	var nthInfo = new CachedNthInfo(el);
	var out=[]
	for(var type in nthClassMap){
		var map = nthClassMap[type];
		var index = nthInfo.getIndex(el,type);
		//applyClass(map,'nth-',index,out);
		for(var c in map){
			if(map[c](index)){ //&& el.currentStyle['nth-'+c]
				out.push(c);
			}
		}
	}
	return out.join('__ nth-')
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
	this.reset(parentNode.children||[]);
}
CachedNthInfo.prototype = {
	getIndex:function(el,type){
		var children = el.parentNode.children || [];
		var uniqueID = el.uniqueID;
		if(children.length != this.length || !(uniqueID in this.indexMap)){
			this.reset(children);
		}
		var index = this.indexMap[uniqueID]
		switch(type){
		case 'child':
			return index+1;
		case 'last-child':
			return this.length-index;
		case 'last-of-type'://index+1->end
			var end = this.length;
		case 'of-type'://0->index
			var tag = this.tags[index];
			var inc = 0;
			if(!end){
				end = index;
				index = -1;
			}
			while(++index<end){
				if(this.tags[index]==tag){
					inc++;
				}
			}
			return inc+1;
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
		var i = index-n2;
		return n1==0 && n2==index||i%n1==0 && i/n1>=0;
		
		//return index == n2 || n1 && !((index-n2)%n1)
	}
}

exports.nthPlugin = nthPlugin;

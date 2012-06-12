exports.ElementExtension = ElementExtension;
var elementCached = {};
var Filter = require('./filter').Filter
function ElementExtension(el){
	if(el){
		var id = el.uniqueID || el;
		var f = elementCached[id];
		if(!f){
			f = elementCached[id] = new ElementExtension();
			f.id = id
		}
		return f;
	}
}
ElementExtension.prototype = {
	setBefore:function(content){
	},
	setAfter:function(){
	},
	setBoxShadow:function(right,bottom,radius,extension,inset){
	},
	setBackground:function(){
	},
	setBorderRadius:function(){
	},
	setBorderImage:function(){
	},
	setFilter:function(filter){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update(filter.replace(/\(.*/,''),filter);
		return this;
	}
}
'opacity,gradient,transform,alphaPng'.replace(/\w+/g,function(key){
	ElementExtension.prototype['set'+key.charAt().toUpperCase()+key.slice(1)] = function(value){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update(key,value);
		return this;
	}
})
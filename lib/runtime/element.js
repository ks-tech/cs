exports.ElementExtension = ElementExtension;
var elementCached = {};
var Filter = require('./filter').Filter
var AdditionManager = require('./addition').AdditionManager
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
function addition(ee){
	return  ee.addition ||(ee.addition= new AdditionManager(ee.id));
}
ElementExtension.prototype = {
	setBefore:function(content){
		addition(this).setContent(content,true)
	},
	setAfter:function(content){
		addition(this).setContent(content)
	},
	setBoxShadow:function(shadow){
		addition(this).setBoxShadow(shadow)
	},
	setBorderRadius:function(){
		addition(this).setBorderRadius(content)
	},
	setBorderImage:function(){
		addition(this).setBorderImage(content)
	},
	setBackground:function(){
		addition(this).setBackground(content)
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
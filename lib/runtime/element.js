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
			f.config = {};
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
	setRgba:function(rgba){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('rgba',rgba);
		return this;
	},
	setFilter:function(filter){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update(filter.replace(/\(.*/,''),filter);
		return this;
	},
	setOpacity:function(opacity){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('opacity',opacity)
		return this;
	},
	setAlphaPng:function(alphaPng){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('alphaPng',alphaPng)
		return this;
	},
	setGradient:function(gradient){
		var f = this.filter ||(this.filter= new Filter(this.id));
		if(gradient){
			var type = gradient.shift();
			if(type == 'linear'){
				f.update('gradient',gradient)
			}
		}else{
			f.update('gradient',null)
		}
		return this;
	},
	setTransform:function(matrix){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('transform',matrix)
		var el = document.all[this.id]
		var rs = el.runtimeStyle;
		var cs = el.currentStyle;
		var config = this.config;
		var oldOffset = config.csTransformOffset || [0,0];
		setTimeout(function(){
			if(matrix){
				var x = +matrix[4];
				var y = +matrix[5];
				var rsw = rs.width ;
				var rsh = rs.height;
				if(rsw || rsh){
					rs.width = rs.height = '';
				}
				var offsetLeft = parseInt(x+(el.clientWidth - el.offsetWidth) / 2);
				var offsetTop = parseInt(y+(el.clientHeight - el.offsetHeight) / 2);
//					rs.marginLeft = rs.posLeft - oldOffset[0] + offsetLeft + 'px';
//					rs.marginTop = rs.posTop - oldOffset[1] + offsetTop + 'px'; 
				var h = offsetLeft-oldOffset[0] 
				var v = offsetTop-oldOffset[1] 
				rs.marginLeft = (parseInt(cs.marginLeft)||0) +h+ 'px';
				rs.marginRight = (parseInt(cs.marginRight)||0) +h+ 'px';
				rs.marginTop = (parseInt(cs.marginTop)||0) +v+ 'px'; 
				rs.marginBottom = (parseInt(cs.marginBottom)||0) +v+ 'px'; 
				//rs.position='relative';
//					rs.posLeft = rs.posLeft - oldOffset[0] + offsetLeft;
//					rs.posTop = rs.posTop - oldOffset[1] + offsetTop;
				//console.log([rs.marginLeft,rs.marginTop],[x,y,offsetLeft,offsetTop],'\n',el.clientWidth - el.offsetWidth)
				config.csTransformOffset = [offsetLeft,offsetTop];
				if(rsw || rsh){
					rs.width = rsw
					rs.height = rsh;
				}
			}else{
//					rs.marginLeft = rs.posLeft - oldOffset[0]+'px';
//					rs.marginTop = rs.posTop - oldOffset[1]+'px'; 
				
				rs.marginLeft = (parseInt(cs.marginLeft)||0) - oldOffset[0]+'px';
				rs.marginRight = (parseInt(cs.marginRight)||0) - oldOffset[0]+'px';
				rs.marginTop = (parseInt(cs.marginTop)||0) - oldOffset[1]+'px'; 
				rs.marginBottom = (parseInt(cs.marginBottom)||0) - oldOffset[1]+'px'; 
				oldOffset[0]=oldOffset[1] = 0;
				//console.log(oldOffset)
			}
			rs = el = null;
		},0);
	}
}

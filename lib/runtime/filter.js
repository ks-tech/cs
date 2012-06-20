exports.Filter = Filter;

function Filter(id){
	this.id = id
	this.indexMap = {};
	this.valueMap = {};
	this.lastValueMap = {};
}

Filter.prototype = {
	opacity:function(opacity,filter){
		opacity = parseInt(opacity*100+0.5);
		if(filter){
			filter.opacity = opacity
		}else{
			return 'Alpha(opacity:'+opacity+')'
		}
	},
	transform:function(transform,filter){
		var m = /matrix\(([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+)\)/.exec(transform.replace(/\s+|px/g,''))
		//margin: :m[5],m[6]
		if(filter){
			filter.M11 = m[1];
			filter.M12 = m[3];
			filter.M21 = m[2];
			filter.M22 = m[4];
		}else{
			//alert("Matrix(M11="+m[1]+",M12="+m[3]+",M21="+m[2]+",M22="+m[4]+",SizingMethod='auto expand')")
			return "Matrix(M11="+m[1]+",M12="+m[3]+",M21="+m[2]+",M22="+m[4]+",SizingMethod='auto expand')"
		}
		
	},
	alphaPng:function(png,filter){
		//image,sizing
		if(filter){
			if(filter.enabled = !!png){
				filter.src = png;
			}
			
		}
		return "AlphaImageLoader(src='"+png+"', enabled="+!!png+",sizingMethod='crop')";
	},
	//only for linear-gradient(180deg, yellow, blue);
	gradient:function(linearGradien,filter){
		//linear-gradient(180deg, yellow, blue);
		var match = /^linear-gradient\((\d+)deg\s*,\s*(#?[\w]+)\s*,\s*(#?[\w]+)\)$/i.exec(linearGradien);
		if(match){
			var deg = +match[1]+135;
			var step = parseInt(deg/180);
			var type = parseInt(deg/90)%2;
			var colors = match.slice(2,4)
			if(step%2){
				colors.reverse();
			}
			if(filter){
				filter.gradientType = type;
				filter.startColorstr = colors[0];
				filter.endColorstr = colors[1];
			}else{
				return "Gradient(gradientType="+type+",startColorstr="+colors[0]+", endColorstr="+colors[1]+")" ;
			}
		}
	},
	update:function(key,value){
		//if(transaction){transaction[this.id] = this;return }
		var valueMap = this.valueMap;
		var indexMap = this.indexMap;
		var lastValueMap = this.lastValueMap;
		var newFilter ;
		var el = document.all[this.id];
		if(key){
			newFilter = initFilter(el,key,value,this[key],indexMap,lastValueMap)
			valueMap[key] = value;
		}else{
			for(key in valueMap){
				if(initFilter(el,key,valueMap[key],this[key],indexMap,lastValueMap)){
					newFilter = true;
					break;
				}
			}
		}

		if(newFilter){
			var updated = [];
			var style = el.runtimeStyle;
			for(var key in valueMap){
				var fn = this[key];
				var value=lastValueMap[key]=valueMap[key];
				indexMap[key] = updated.length;
				updated.push('progid:DXImageTransform.Microsoft.'+(fn?fn.call(this, value):value));
			}
			if(!el.currentStyle.hasLayout){
				style.zoom = 1;
			}
			style.filter = updated.join('\n')
			//console.log('filter:',updated.length,style.filter)
		}
	}
}
function initFilter(el,key,value,fn,indexMap,lastValueMap){
	if(key in indexMap){
		if(lastValueMap[key] != value){
			//add key,index,value
			lastValueMap[key] = value
			var filter = el.filters[indexMap[key]];
			//console.log('filter:',key,value)
			if(fn){
				value = fn(value, filter);
			}else{
				while(fn = /(\w+)\s*=['"\s]*([^,'"]*)['"]*/g.exec(value)){
					filter[fn[1]] = fn[2];
				}
			}
		}
	}else{
		return true;
	}
}
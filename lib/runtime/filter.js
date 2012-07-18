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
	alphaPng:function(png,filter){
		//image,sizing
		if(filter){
			if(filter.enabled = !!png){
				filter.src = png;
			}
			
		}
		return "AlphaImageLoader(src='"+png+"', enabled="+!!png+",sizingMethod='crop')";
	},
	transform:function(m,filter){
		if(filter){
			if(m){
				filter.M11 = m[0];
				filter.M12 = m[2];
				filter.M21 = m[1];
				filter.M22 = m[3];
				filter.Enabled = true;
			}else{
				filter.Enabled = false;
			}
		}else if(m){
			//alert("Matrix(M11="+m[0]+",M12="+m[2]+",M21="+m[1]+",M22="+m[3]+",SizingMethod='auto expand')")
			return "Matrix(M11="+m[0]+",M12="+m[2]+",M21="+m[1]+",M22="+m[3]+",SizingMethod='auto expand')"
		}else{
			//alert("Matrix(M11=0,M12=0,M21=0,M22=0,SizingMethod='auto expand' enabled='false')")
			return "Matrix(SizingMethod='auto expand' enabled='false')"
		}
		
	},
	//only for linear-gradient(180deg, yellow, blue);
	gradient:function(match,filter){
		//linear-gradient(180deg, yellow, blue);
		// /\d(?=deg,)|#?\w+(?=,\))/
		//var match = /^linear-gradient\((\d+)deg\s*,\s*(#?[\w]+)\s*,\s*(#?[\w]+)\)$/i.exec(linearGradien);
		if(match){
			var deg = +match[0]+135;
			var step = parseInt(deg/180);
			var type = parseInt(deg/90)%2;
			//var colors = match
			match = match.slice(1)
			if(step%2){
				match.reverse();
			}
			console.log("Gradient(gradientType="+type+",StartColorStr="+match[0]+",EndColorStr="+match[1]+")" )
			if(filter){
				filter.gradientType = type;
				filter.startColorstr = match[0];
				filter.endColorstr = match[1];
				filter.Enabled = true;
			}else{
				return "Gradient(gradientType="+type+",StartColorStr="+match[0]+",EndColorStr="+match[1]+")" ;
			}
		}else{
			if(filter){
				filter.Enabled = false;
			}else{
				return "Gradient(enabled=false)";
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
				var value=valueMap[key];
				lastValueMap[key]=[].concat(value).join('');

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
		var code = [].concat(value).join('')
		if(lastValueMap[key] != code){
			//add key,index,value
			lastValueMap[key] = code
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
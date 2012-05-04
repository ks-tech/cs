exports.FilterHelper = FilterHelper;
function FilterHelper(el){
	if(el){
		var id = el.uniqueID;
		var f = filterCached[id];
		if(!f){
			f = filterCached[id] = new FilterHelper();
			f.id = id
			f.style = {};
			f.lastStyle = {};
			f.styleFilter = {};
		}
		return f;
	}
	
}
var filterCached = {};
FilterHelper.get = function(el){

}
FilterHelper.prototype = {
	setOpacity:function(opacity){
		this.style.opacity = [opacity];
		return this;
	},
	opacity:function(opacity){
		opacity = parseInt(opacity*100+0.5);
		return opacity == 100?"":"Alpha(opacity="+opacity+")"
	},
	//only for linear-gradient(180deg, yellow, blue);
	setLinearGradient:function(linearGradien){
		//linear-gradient(180deg, yellow, blue);
		var match = /^linear-gradient\((\d+)deg\s*,\s*(#?[\w]+)\s*,\s*(#?[\w]+)\)$/i.exec(linearGradien);
		if(match){
			var deg = +match[1]+135;
			var step = parseInt(deg/180);
			if(step%2){
				this.style.linearGradient = [parseInt(deg/90)%2,match[3],match[2]]
			}else{
				this.style.linearGradient = [parseInt(deg/90)%2,match[2],match[3]]
			}
		}else{
			//..
		}
		return this;
	},
	linearGradient:function(type,startColor,endColor){
		// 1 Default. Displays a horizontal gradient. 
		// 0 Displays a vertical gradient. 
		return "Gradient(gradientType="+type+",startColorstr="+startColor+", endColorstr="+endColor+")" ;
	},
	setTransform:function(transform){
		var matrix = /matrix\(([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+)\)/.exec(transform)
		this.style.transform = [matrix[1],matrix[2],matrix[3],matrix[4],matrix[5],matrix[6]]
		return this;
	},
	transform:function(a,b,c,d,e,f){
		return "Matrix(M11="+a+",M12="+c+",M21="+b+",M22="+d+",SizingMethod='auto expand')"
	},
	setAlphaImage:function(image,sizing){
		this.style.alphaImage = [image,sizing]
		return this;
	},
	alphaImage:function(image,sizing){
		
	},
	update:function(){
		var style = this.style;
		var lastStyle = this.lastStyle;
		var styleFilter = this.styleFilter;
		var updated;
		for(var n in style){
			if(style[n] !== lastStyle[n]){
				updated = [];
				styleFilter[n] = this[n].apply(this,style[n])
			}
		}
		if(updated){
			for(var n in styleFilter){
				updated.push("progid:DXImageTransform.Microsoft."+styleFilter[n]);
			}
			this.lastStyle = style;
			this.style = {};
			document.all[this.id].style.filter = updated.join('\n')
		}
	}
}

function AdditionManager(id){this.id = id}

AdditionManager.prototype = {
	setContent:function(content,before){
		var el = document.getElementById(this.id);
		content = window.eval(content);
		el = getAddition(el,before).lastChild;
		el.onselectstart = function(){return false}
		el.oncopy = function(){return false}
		el.innerText = content;
	},
	setBoxShadow:function(shadow){
		var args;
		var result = [];
		(','+shadow).replace(/(-?[\d]+)(?:px)?|(#\w+)|inset|,/ig,function(a,px,color){
			if(px){
				args.push(parseInt(px)||0);
			}else if(color){
				args[1] = a;
			}else if(a == 'inset'){//insert
				args[0] = true;
			}else if(a == ','){
				args = [false,'#000']
				result.push(args);
			}
		})
		
		var el = document.getElementById(this.id);
		var el = bg(el);
//		var shadow = el.firstChild;//radius;
//		while(var i = 0;i<result.length;i++){}
		var shadowEl = el.lastChild;//radius;
		while(args.length<6){
			args.push(0)
		}
		args.unshift(shadowEl,el.offsetWidth,el.offsetHeight)
		setupShadow.apply(null,args)
		
	},
	setBorderRadius:function(){
		
	},
	setBackground:function(){
		
	},
	setBorderImage:function(){
		
	}
}
function setupShadow(el,width,height,inset,color,right,bottom,radius,extension){
	var style = el.style;
	var filter = el.filters[0];
	//172142false#0001010100
	//console.log(width,height,inset,color,right,bottom,radius,extension)
	style.left = right-extension-radius+'px';
	style.top = bottom-extension-radius+'px';
	
	style.width = width + extension*2+'px';
	style.height = height + extension*2+'px';
	style.backgroundColor = color;
	if(window.radius != radius){
		window.radius = radius;
		console.log(radius)
	}
	if(radius){//radius.filter
		filter.Enabled = true;
		filter.PixelRadius = radius;
	}else{
		if(filter.Enabled){
			filter.Enabled = false;
			console.log(filter.Enabled)
		}
	}
}
		

var beforeHTML = '<cs:before style="margin:0;padding:0;border:0;"><cs:content/></cs:before>';
var afterHTML = '<cs:after style="margin:0;padding:0;border:0;">' +
					'<cs:bg style="margin:0;padding:0;border:0;position:absolute;display:inline-block;z-index:-1">' +
					'<cs:radius style="margin:0;padding:0;border:0;position:absolute;display:block;"/>' +
					'<cs:shadow style="margin:0;padding:0;border:0;position:absolute;display:block;filter:progid:DXImageTransform.Microsoft.Blur(enabled=false)"/>' +
					'</cs:bg><cs:content/></cs:after>'
function getAddition(el,before){
	var key = before?'cs-addition-before':'cs-addition-after';
	var aid = el.runtimeStyle[key];
	var ael = aid && document.getElementById(aid);
	if(!ael){
		if(before){
			el.insertAdjacentHTML('afterBegin',beforeHTML)
			ael = el.firstChild;
		}else{
			el.insertAdjacentHTML('beforeEnd',afterHTML);
			ael = el.lastChild;
		}
		
		el.runtimeStyle[key] = ael.uniqueID;
	}
	return ael;
}
function bg(el){
	var bg = getAddition(el).firstChild;
	var ps = el.currentStyle;
	var bs = bg.style;
	var rect = el.getBoundingClientRect();
	if(el === bg.offsetParent){
		bs.top = 0;
		bs.left = 0;
	}else{
		bs.pixelLeft = rect.left-2;
		bs.pixelTop = rect.top-2;
	}
	bs.pixelHeight = rect.bottom- rect.top;
	bs.pixelWidth = rect.right- rect.left;
	return bg;
}
exports.AdditionManager = AdditionManager;

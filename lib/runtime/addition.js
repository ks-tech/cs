function AdditionManager(id){this.id = id}
function returnFalse(){return false}
AdditionManager.prototype = {
	setContent:function(content,before){
		var el = document.all[this.id];
		content = window.eval(content.replace(/\r\n?|\n/g,'\\r\\n'));
		el = before?
				addition(el,'cs-addition-before',beforeHTML,true):
				addition(el,'cs-addition-after',afterHTML);
		el.onselectstart = returnFalse;
		//el.oncopy = function(){return false}
		try{
			while(el.firstChild){el.removeChild(el.firstChild);}
			el.appendChild(document.createTextNode(content))
		}catch(e){
			el.innerHTML = content;
		}
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
		
		var el = document.all[this.id];
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
		//console.log(radius)
	}
	if(radius){//radius.filter
		filter.Enabled = true;
		filter.PixelRadius = radius;
	}else{
		if(filter.Enabled){
			filter.Enabled = false;
			//console.log(filter.Enabled)
		}
	}
}
		

var beforeHTML = '<cs:content class="before__"></cs:content>';
var afterHTML = '<cs:content class="after__"></cs:content>';
var bgHTML = '<cs:bg style="margin:0;padding:0;border:0;position:absolute;display:inline-block;z-index:-1">' +
					
//var bgInnerHTML = 
					+'<cs:radius style="margin:0;padding:0;border:0;position:absolute;display:block;"/>' +
					'<cs:shadow style="margin:0;padding:0;border:0;position:absolute;display:block;filter:progid:DXImageTransform.Microsoft.Blur(enabled=false)"/>'
				+'</cs:bg>'
var inc = 0;
function addition(el,key,html,before,inner){
	var aid = el.runtimeStyle[key];
	var ael = aid && document.all[aid];
	if(ael == null){
		//el.style.display='block'
		el.runtimeStyle[key] = true;
		el.insertAdjacentHTML(before?'afterBegin':'beforeEnd',html)
//		if(inc++<10)console.log(el.tagName,html)
		ael = before ? el.firstChild:el.lastChild;
//		ael = document.createElement(html);
//		if(inc++<10)console.log(4,el.tagName,el.outerHTML)
//		el.insertBefore(ael,before?el.firstChild:null);
//		if(inc++<10)console.log(5,el.tagName,el.outerHTML)
//		//console.error('?',ael.innerHTML)
//		inner && (ael.innerHTML = inner);
//		if(inc++<13)console.error('6',ael.innerHTML)
		el.runtimeStyle[key] = ael.uniqueID;
	}
	return ael;
}
function bg(el){
	var bg = addition(el,'cs-addition-bg',bgHTML);
	var ps = el.currentStyle;
	var bs = bg.style;
	var rect = el.getBoundingClientRect();
	if(el === bg.offsetParent){
		bs.top = 0;
		bs.left = 0;
	}else{
		var scrollTop = document.documentElement.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft;
		bs.pixelLeft = rect.left-2+scrollLeft;
		bs.pixelTop = rect.top-2+scrollTop;
	}
	bs.border = "1px solid red"
	bs.pixelHeight = rect.bottom- rect.top;
	bs.pixelWidth = rect.right- rect.left;
	return bg;
}
exports.AdditionManager = AdditionManager;

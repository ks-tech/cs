exports.AdditionManager = AdditionManager;
var additionCached = {};
function AdditionManager(el){
	if(el){
		var id = el.uniqueID || el;
		var f = additionCached[id];
		if(!f){
			f = additionCached[id] = new AdditionManager();
			f.id = id
		}
		return f;
	}
}
function getAddition(id,before){
	var key = before?'cs-addition-before':'cs-addition-after';
	var aid = el.runtimeStyle[key];
	var ael = aid && document.getElementById(aid);
	if(!ael){
		if(before){
			el.insertAdjacentHTML('afterBegin','<ad:before style="margin:0;padding:0;border-width:0;"></ad:before>')
			ael = el.firstChild;
		}else{
			el.insertAdjacentHTML('beforeEnd','<ad:root style="margin:0;padding:0;border-width:0;">' +
					'<ad:bg style="position:absolute;display:inline-block;z-index:-1"><ad:radius/><ad:shadow/></ad:bg><ad:after/></ad:root>');
			ael = el.lastChild;
		}
		el.runtimeStyle[key] = ael.uniqueID;
	}
	return ael;
}
function bg(id){
	var el = document.getElementById(id);
	var bg = getAddition(id).firstChild;
	var ps = el.currentStyle;
	var bs = bg.style;
	if(el === bg.offsetParent){
		bs.top = 0;
		bs.left = 0;
	}else{
		bs.top = el.offsetTop;
		bs.left = el.offsetLeft;
	}
	bs.width = el.offsetWidth+ +ps.paddingLeft+ +ps.paddingRight+ +ps.borderLeftWidth+ +ps.borderRightWidth + 'px';
	bs.height = el.offsetHeight+ +ps.paddingTop+ +ps.paddingBottom+ +ps.borderTopWidth+ +ps.borderBottomWidth + 'px';
	return bg;
}
function getSize(el){
	var width = parseInt(el.offsetWidth)+ parseInt(ps.paddingLeft)+parseInt(ps.paddingRight)+parseInt(ps.borderLeftWidth)+parseInt(ps.borderRightWidth)
	//+ 'px';
	var height = parseInt(el.offsetHeight)+parseInt(ps.paddingTop)+parseInt(ps.paddingBottom)+parseInt(ps.borderTopWidth)+parseInt(ps.borderBottomWidth)
	// + 'px';
	
}
AdditionManager.prototype = {
	setBefore:function(content){
		getAddition(this.id,true).innerText = content;
	},
	setAfter:function(){
		getAddition(this.id).lastChild.innerText = content;
	},
	setBoxShadow:function(right,bottom,radius,extension,inset){
		var el = bg(this.id);
		var shadow = el.lastChild;
		shadow.style.cssText = "";
	},
	setBackground:function(){
		
	},
	setBorderRadius:function(){
		
	},
	setBorderImage:function(){
		
	}
}
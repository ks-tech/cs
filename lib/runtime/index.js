var CS = require('./core').CS;
var nthPlugin = require("./updater-nth").nthPlugin
var boxPlugin = require("./updater-box").boxPlugin
var refPlugin = require("./updater-ref").refPlugin
var transitionPlugin = require('./updater-transition').transitionPlugin
var ElementExtension = require('./element').ElementExtension
var latestHash ='';
function hashchanged(){
	var hash = location.hash;
	if(hash!=latestHash){
		var el = /^#[\w\-\$_]+$/.test(latestHash) && document.all[latestHash.slice(1)];
		if(el){
			el.className = el.className.replace(/(?:^|\s+|\S+--)target__(\s+|--\S+|$)/,' ')
		}
		latestHash = hash;
		if(el = /^#[\w\-\$_]+$/.test(latestHash)&& document.all[latestHash.slice(1)]){
			el.className += ' target__'
		}
	}
}
//放最前面,在其他变化生效前.
CS.addPlugin(transitionPlugin,'onexist','transition-property')

//prompt('',navigator.userAgent + '\n'+navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1'))
switch(CS.ieVersion = navigator.userAgent.replace(/^.*(?:; MSIE ([6-9])).*$|.*/,'$1')){
case '6':
	if('CSS1Compat' !== document.compatMode){
		alert('IE6 BackCompat Mode is not support')
	}
	CS.addPlugin({id:'png-alpha',
		update: function(el,config,flag,inc){
			if(flag){
				el.runtimeStyle.backgroundImage = '';
				var png = el.currentStyle.backgroundImage.replace(/^url\((.+?)\)$/,'$1').replace(/['"]/g,'')
				el.runtimeStyle.backgroundImage = 'none'
				if(config.pngAlpha != png && png.match(/#alpha$/)){
					ElementExtension(el).setAlphaPng(config.pngAlpha = png);
				}
			}else{
				if(config.pngAlpha){
					el.runtimeStyle.backgroundImage = '';
					ElementExtension(el).setAlphaPng(config.pngAlpha = null);
				}
			}
			
		}
	},'onexist','cs-png-alpha')
	CS.addPlugin(require("./plugin-muti-class").mutiClassPlugin);
	//采用监听方式更靠谱把?
	CS.addPlugin(
		require("./updater-fixed").fixedPlugin
		,'onexist','cs-position-fixed')
case '7':
	CS.addPlugin(require("./plugin-dynamic-class").dynamicClassPlugin);// ie67()
	CS.addPlugin(require("./plugin-attr").attributePlugin);// ie67()
	CS.addPlugin({
		id:'update-gen-before',
		update:function(el,config,content){
			ElementExtension(el).setBefore(content);
		}
	},'onchange','cs-gen-before')
	CS.addPlugin({
		id:'update-gen-after',
		update:function(el,config,content){
			ElementExtension(el).setAfter(content);
		}
	},'onchange','cs-gen-after');
	setInterval(hashchanged,200)
	break;
case '8':
	CS.addPlugin(require("./plugin-attr").attributePlugin);// ie67()
	window.attachEvent('onload',hashchanged);//readyState for oncontenload is better
	window.attachEvent('onhashchange',hashchanged);
}
CS.addPlugin(nthPlugin,'onexist','cs-update-nth')
CS.addPlugin(boxPlugin,'onexist',"border-radius")
CS.addPlugin(refPlugin,'onexist',"cs-ref")



CS.addPlugin({id:'update-transform',
	update: function(el,config,transform){
		if(config.transition && config.transition.task){
			//ignore transition 
			return
		}
		var m = transform && transform.match(/[\d\.\-]+/g);
		//var m = transform && /matrix\(([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+)\)/.exec(transform.replace(/\s+|px/g,''))
		ElementExtension(el).setTransform(m);
	}
},'onchange','transform')

CS.addPlugin({
	id:'update-box-shadow',
	update:function(el,config,shadow){
		//console.log(shadow)
		ElementExtension(el).setBoxShadow(shadow);
	}
},'onexist','box-shadow')

CS.addPlugin({
	id:'update-opacity',
	update:function(el,config,opacity){
		ElementExtension(el)
			.setOpacity(opacity||1);
	}
},'onchange','opacity')

CS.addPlugin({
	id:'update-mimax-size',
	update:function(el,config,v,inc){
		//TODO:...
		var size = config.mimaxSize
		var rs = el.runtimeStyle;
		if(size){
			if(v){
				if(inc%10){
					return;
				}
			}
			if(size.width!=null){rs.width = ''};
			if(size.height!=null){rs.height = ''};
		}else{
			size = config.mimaxSize = {}
		}
		var currentStyle = el.currentStyle;
		var width = inside(el.clientWidth,currentStyle['min-width'],currentStyle['max-width'])
		var height = inside(el.clientHeight,currentStyle['minHeight'],currentStyle['maxHeight']);
		if(size.width = width){rs.width = width+'px'};
		if(size.height = height){rs.height = height+'px'};
	}
},'onexist','cs-update-mimax')

function inside(value,min,max){
	if(min && value<(min = parseInt(min))){
		return min;
	}else if(max && value<(max = parseInt(max))){
		return max;
	}
}


CS.addPlugin({id:'update-cs-background-rgba',
	update:function(el,config,rgba){
		ElementExtension(el).setRgba(rgba);
		//rgba && ElementExtension(el).setGradient(['linear',0,rgba,rgba])
		//console.log(['rgba',rgba,rgba])
//		setTimeout(function(){
//			console.log(el.currentStyle.filter)
//			for(var i = el.filters.length-1;i--;){
//				var f = el.filters && el.filters.item(i)
//				if(f)try{console.log(f.StartColorStr,f.EndColorStr)}catch(e){}
//			}
//			
//			
//			},300)
	}
},'onchange','cs-background-rgba')
CS.addPlugin({id:'update-cs-linear-gradient',
	update:function(el,config,image){
		if(image !==  (config.image || 'none')){
			config.image = image
			var image2 = image.replace(/^url\("about:blank#(linear),(.*)"\)$/,'$1,$2')
			if(image2 == image){
				image2 = null;
			}
			//el.runtimeStyle.backgroundImage = 'none';
			//console.log(image2,image2.match(/\d+(?=(?:deg)?,)|#?\b\w+(?=,|$)/g).join('\n'))
			image2 = image2 && image2.match(/\d+(?=(?:deg)?,)|#?\b\w+(?=,|$)/g);
			ElementExtension(el).setGradient(image2);
			//console.log(image2)
		}
//		ElementExtension(el).setGradient(image);
	}
},'onchange','backgroundImage')


exports.CS = CS;
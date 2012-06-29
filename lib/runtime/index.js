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
		var el = /^#[\w_-$]$/.test(latestHash) && document.all[latestHash.slice(1)];
		if(el){
			el.className = el.className.replace(/(?:^|\s+|\S+--)target__(\s+|--\S+|$)/,' ')
		}
		latestHash = hash;
		if(el = /^#[\w_-$]$/.test(latestHash)&& document.all[latestHash.slice(1)]){
			el.className += ' target__'
		}
	}
}
//放最前面,在其他变化生效前.
CS.addPlugin(transitionPlugin,'onexist','transition-property')

//prompt('',navigator.userAgent + '\n'+navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1'))
switch(navigator.userAgent.replace(/^.*(?:; MSIE ([6-9])).*$|.*/,'$1')){
case '6':
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
	setInterval(hashchanged,100)
	break;
case '8':
	window.attachEvent('onload',hashchanged);//readyState for oncontenload is better
	window.attachEvent('onhashchange',hashchanged);
}

CS.addPlugin(nthPlugin,'onexist','cs-update-nth')
CS.addPlugin(boxPlugin,'onexist',"border-radius")
CS.addPlugin(refPlugin,'onexist',"cs-ref")

CS.addPlugin({id:'update-transform',

	update: function(el,config,transform){
		if(config.transition && config.transition.task){
			return
		}
		var m = transform.match(/[\d\.\-]+/g);
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
		ElementExtension(el).setOpacity(opacity||1);
	}
},'onchange','opacity')

CS.addPlugin({
	id:'update-mimax-size',
	update:function(el,config,v,inc){
		var size = config.size
		if(size){
			if((inc %10)){
				return;
			}
			if(size.width){el.runtimeStyle.width = ''};
			if(size.height){el.runtimeStyle.height = ''};
		}else{
			size = config.size = {}
		}
		var currentStyle = el.currentStyle;
		var width = inside(el.clientWidth,currentStyle['min-width'],currentStyle['max-width'])
		var height = inside(el.clientHeight,currentStyle['minHeight'],currentStyle['maxHeight']);
		if(size.width = width){el.runtimeStyle.width = width+'px'};
		if(size.height = height){el.runtimeStyle.height = height+'px'};
	}
},'onexist','cs-update-mimax')

function inside(value,min,max){
	if(min && value<(min = parseInt(min))){
		return min;
	}else if(max && value<(max = parseInt(max))){
		return max;
	}
}

CS.addPlugin({id:'update-cs-linear-gradient',
	update:function(el,config,image){
		if(image !==  (config.image || 'none')){
			config.image = image
			var image2 = image.replace(/^url\("about:blank#(linear),(.*)"\)$/,'$1,$2')
			if(image2 == image){
				image2 = null;
			}
			//el.runtimeStyle.backgroundImage = 'none';
			//console.log(image2)
			ElementExtension(el).setGradient(image2 && image2.match(/\d(?=deg,)|#?\b\w+(?=,|$)/g));
		}
//		console.log(image)
//		ElementExtension(el).setGradient(image);
	}
},'onchange','backgroundImage')

CS.addPlugin({id:'update-cs-background-rgba',
	update:function(el,config,rgba){
		console.log(rgba)
		ElementExtension(el).setGradient(rgba && ['linear',0,rgba,rgba]);
	}
},'onchange','cs-background-rgba')

exports.CS = CS;
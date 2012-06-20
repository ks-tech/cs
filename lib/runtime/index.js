var CS = require('./core').CS;
var nthPlugin = require("./updater-nth").nthPlugin
var boxPlugin = require("./updater-box").boxPlugin
var refPlugin = require("./updater-ref").refPlugin
var transitionPlugin = require('./updater-transition').transitionPlugin
var ElementExtension = require('./element').ElementExtension

//放最前面,在其他变化生效前.
CS.addPlugin(transitionPlugin,'onexist','transition-property')

//prompt('',navigator.userAgent + '\n'+navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1'))
switch(navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1')){
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
	},'onchange','cs-gen-after')
}


CS.addPlugin(nthPlugin,'onexist','cs-update-nth')
CS.addPlugin(boxPlugin,'onexist',"border-radius")
CS.addPlugin(refPlugin,'onexist',"cs-ref")

CS.addPlugin({id:'update-transform',
	update: function(el,config,transform){
		var m = transform && /matrix\(([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+)\)/.exec(transform.replace(/\s+|px/g,''))
		var rs = el.runtimeStyle;
		var oldOffset = config.csTransformOffset || [0,0];
		ElementExtension(el).setTransform(m);
		setTimeout(function(){
			if(m){
				var x = +m[5];
				var y = +m[6];
				var offsetLeft = parseInt(x+(el.clientWidth - el.offsetWidth) / 2);
				var offsetTop = parseInt(y+(el.clientHeight - el.offsetHeight) / 2);
//				rs.marginLeft = rs.posLeft - oldOffset[0] + offsetLeft + 'px';
//				rs.marginTop = rs.posTop - oldOffset[1] + offsetTop + 'px'; 
				rs.marginLeft = (parseInt(rs.marginLeft)||0) -oldOffset[0] + offsetLeft + 'px';
				rs.marginTop = (parseInt(rs.marginTop)||0) -oldOffset[1] + offsetTop + 'px'; 
//				rs.posLeft = rs.posLeft - oldOffset[0] + offsetLeft;
//				rs.posTop = rs.posTop - oldOffset[1] + offsetTop;
				//console.log([rs.marginLeft,rs.marginTop],[x,y,offsetLeft,offsetTop],'\n',el.clientWidth - el.offsetWidth)
				config.csTransformOffset = [offsetLeft,offsetTop];
			}else{
//				rs.marginLeft = rs.posLeft - oldOffset[0]+'px';
//				rs.marginTop = rs.posTop - oldOffset[1]+'px'; 
				
				rs.marginLeft = (parseInt(rs.marginLeft)||0) - oldOffset[0]+'px';
				rs.marginTop = (parseInt(rs.marginTop)||0) - oldOffset[1]+'px'; 
				oldOffset[0]=oldOffset[1] = 0;
				//console.log(oldOffset)
				
				
			}
			rs = el = null;
		},0);
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


CS.addPlugin({id:'update-cs-linear-gradient',
	update:function(el,config,gradient){
		ElementExtension(el).setGradient(gradient);
	}
},'onchange','cs-linear-gradient')



exports.CS = CS;
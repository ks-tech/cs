var updateBoxStyle = require('./ie-box').updateBoxStyle
var updateMatrixStyle = require('./ie-matrix').updateMatrixStyle
var getPngInfo = require('./png-info').getPngInfo
var Path = require('path')

function ieUpdateFilter(resource,cssom,rule,index){
	//添加动画支持
	var style = rule.style;
	var ieversion = resource.prefix.replace(/^-ie(\d)-.*$|.*/,'$1');
	
	function appendExpression(){
		if(ieversion >= '8'){
			var key = ieversion == '8'?'behavior':'-ms-behavior';
			var value = 'url('+htc+')';
			var selectorText = rule.selectorText;
			var selectorText2 = selectorText.replace(/\:(?:active|focus|hover)\b/g,'');
			if(selectorText!=selectorText2){
				cssom.insertRule(selectorText2+"{"+key+':'+value+"}",index+1);
			}else{
				style.setProperty(key,value );
			}
		}else{
			style.setProperty('layout-flow', "expression(CS(this,'update'))");
		}
	}
	if(ieversion<='8') {
		var htc = resource.cs.htcPath;
		updateBoxStyle(style)
		updateMatrixStyle(style);
		if(ieversion <='6'){//png alpha
			if(updateAlphaPng(resource,style,'background',/url\s*\(\s*(?:'[^]+'|"[^"]"|\S+?)\s*\)/)
				||updateAlphaPng(resource,style,'background-image',/.*/)){
				style.setProperty('cs-png-alpha','1')
				appendExpression();
			}
			if(hasProperty(style,'min-width','max-width','min-height','max-height')){
				style.setProperty('cs-update-mimax','1')
				appendExpression()
			}
			var display = style.getPropertyValue('position')
			if(display == 'absolute'){
				style.setProperty('cs-position-fixed','');
			}else if(/fixed/.test(display)){
				style.setProperty('cs-position-fixed','1');
				style.setProperty('position','absolute');
				appendExpression();
			}
		}
		if(hasProperty(style,'transition')){
			var transition = style.getPropertyValue('transition')
			var split = transition.split(/\s+/);
			style.setProperty('transition-property',split[0]);
			style.setProperty('transition-duration',split[1]);
		}
		if(hasProperty(style,'transition-property','border-radius',
			'box-shadow','transform','opacity')
			){
			appendExpression();
		}
		if(updateLinear(style,'background-image') || updateLinear(style,'background')){
			appendExpression();
		}
		var rgba = updateRgba(style);
		if(rgba){
			appendExpression();
			style.setProperty('cs-background-rgba',rgba)
		}else if(rgba == ''){
			style.setProperty('cs-background-rgba','')
		}

	}
}
function updateRgba(style){
	var len = style.length;
	while(len--){
		var n = style[len]
		if(/^background(?:-color)?$/.test(n)){
			var bgcolor = style.getPropertyValue(n);
			var result = '';
			if(bgcolor.match(/\brgba\b/i)){
				bgcolor = bgcolor.replace(
					/url\([^)'"]+\)|'[^']+'|"[^"]+"|(\brgba\([\d+,\.]+\))/,
					function(a,rgba){
						if(rgba){
							result = rgba2hex(rgba)
							return 'transparent';
						}
						return a;
					})
				if(result){
					style.setProperty(n,bgcolor)
					return result;
				}
			}
		}
	}
	return result;
}
function rgba2hex(bgcolor){
	var match = bgcolor.match(/[\.\d]+/g)
	return ((0x100 + parseInt(match[3]*255)).toString(16)+
		(0x1000000 | match[0]<<16 | match[1]<<8 | match[2]).toString(16).slice(1)).replace('1','#')
		
}
function hasProperty(style){
	var i = arguments.length;
	while(--i){
		if(style.getPropertyValue(arguments[i])){
			return true;
		}
	}
}
function updateLinear(style,key){
	var gradient = style.getPropertyValue(key )
	if(gradient){
		var gradient2 = gradient.replace(/linear-gradient\((.+?)\)/,'url("about:blank#linear,$1")');
		if(gradient2 != gradient){
			style.setProperty(key,gradient2);
			return true;
		}
	}
}
function updateAlphaPng(resource,style,key,exp){
	var value = style.getPropertyValue(key)
	var hasAlpha
	if(value){
		value = value.replace(exp,function(a){
			var img = a.replace(/^(?:url\s*\()?\s*['"]?|['"]?\s*\)$/g,'')
			var file = Path.resolve(resource.path.replace(/^\/|[^\/]+$/g,''),img);
			var info = getPngInfo(file);
			if(info && info.alpha){
				hasAlpha = true;
				return 'url("'+img+'#alpha")'
			}
			return a;
		});
		if(hasAlpha){
			style.setProperty(key,value)
			return true;
		}
	}
}
exports.ieUpdateFilter = ieUpdateFilter
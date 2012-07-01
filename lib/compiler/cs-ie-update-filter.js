var updateBoxStyle = require('./cs-ie-box').updateBoxStyle
var updateMatrixStyle = require('./cs-ie-matrix').updateMatrixStyle
var getPngInfo = require('./png-info').getPngInfo
var Path = require('path')
function appendExpression(style,ieversion,htc){
	if(ieversion > '8'){
		style.setProperty('-ms-behavior', 'url('+htc+')');
	}else if(ieversion == '8'){
		style.setProperty('behavior', 'url('+htc+')');
	}else{
		style.setProperty('layout-flow', "expression(CS(this,'update'))");
	}
}
function ieUpdateFilter(resource,cssom,rule,index){
	//添加动画支持
	var style = rule.style;
	var ieversion = resource.prefix.replace(/^-ie(\d)-.*$|.*/,'$1')
	if(ieversion<='8') {
		var htc = resource.cs.htcPath;
		updateBoxStyle(style)
		updateMatrixStyle(style);
		if(ieversion <='6'){//png alpha
			if(updateAlphaPng(resource,style,'background',/url\s*\(\s*(?:'[^]+'|"[^"]"|\S+)\s*\)/)
				||updateAlphaPng(resource,style,'background-image',/.*/)){
				style.setProperty('cs-png-alpha','1')
				appendExpression(style,ieversion,htc);
			}
			if(hasProperty(style,'min-width','max-width','min-height','max-height')){
				style.setProperty('cs-update-mimax','1')
				appendExpression(style,ieversion,htc)
			}
			var display = style.getPropertyValue('position')
			if(display == 'absolute'){
				style.setProperty('cs-position-fixed','');
			}else if(/fixed/.test(display)){
				style.setProperty('cs-position-fixed','1');
				style.setProperty('position','absolute');
				appendExpression(style,ieversion,htc);
			}
		}
		
		if(hasProperty(style,'transition-property','border-radius',
			'box-shadow','transform','opacity')
			){
			appendExpression(style,ieversion,htc);
		}
		if(updateLinear(style,'background-image') || updateLinear(style,'background')){
			appendExpression(style,ieversion,htc);
		}
		var rgba = updateRgba(style);
		if(rgba){
			appendExpression(style,ieversion,htc);
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
		if(/^background(?:-color)$/.test(n)){
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
			var img = a.replace(/^(?:url\s*\()?\s*['"]?|['"]?\s*\)$/,'')
			var file = Path.resolve(resource.path.replace(/^\/|[^\/]+$/g,''),img);
			var info = getPngInfo(file);
			if(info && info.type>4){
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
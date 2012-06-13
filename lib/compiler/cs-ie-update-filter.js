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
			var img = style.getPropertyValue('background-image');
			if(img){
				img = img.replace(/url\(([\s\S]+)\)/,'$1').replace(/['"]/g,'');
				var file = Path.resolve(resource.path.replace(/^\/|[^\/]+$/g,''),img);
				var info = getPngInfo(file);
				if(info && info.type>4){
					style.setProperty('cs-png-alpha','1')
					style.setProperty('background-image','url("'+img+'#alpha")')
					appendExpression(style,ieversion,htc);
				}
			}
			
		}
		
		if(style.getPropertyValue('transition-property')
			||style.getPropertyValue('border-radius')
			||style.getPropertyValue('transform')
			||style.getPropertyValue('opacity')
			){
			appendExpression(style,ieversion,htc);
		}
		var gradient = style.getPropertyValue('background-image');
		if(gradient.indexOf('linear-gradient')>=0){
			appendExpression(style,ieversion,htc);
			style.setProperty('cs-linear-gradient',gradient)
		}else{
			gradient = style.getPropertyValue('background');
			if(gradient.indexOf('linear-gradient')>=0){
				appendExpression(style,ieversion,htc);
				style.setProperty('cs-linear-gradient',gradient)
			}
		}
	}

}
exports.ieUpdateFilter = ieUpdateFilter
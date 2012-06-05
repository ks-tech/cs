var updateBoxStyle = require('./cs-ie-box').updateBoxStyle
var updateMatrixStyle = require('./cs-ie-matrix').updateMatrixStyle
function appendExpression(style,ieversion){
	if(ieversion > '8'){
		style.setProperty('-ms-behavior', "url(/static/cs.htc)");
	}else if(ieversion == '8'){
		style.setProperty('behavior', "url(/static/cs.htc)");
	}else{
		style.setProperty('layout-flow', "expression(CS(this,'update'))");
	}
}
function ieUpdateFilter(resource,cssom,rule,index){

	//添加动画支持
	var style = rule.style;
	var ieversion = resource.prefix.replace(/^-ie(\d)-.*$|.*/,'$1')
	if(ieversion<='8') {
		
		updateBoxStyle(style)
		updateMatrixStyle(style)
		
		if(style.getPropertyValue('transition-property')
			||style.getPropertyValue('border-radius')
			||style.getPropertyValue('transform')
			||style.getPropertyValue('opacity')
			){
			appendExpression(style,ieversion);
		}
		var gradient = style.getPropertyValue('background-image');
		if(gradient.indexOf('linear-gradient')>=0){
			appendExpression(style,ieversion);
			style.setProperty('cs-linear-gradient',gradient)
		}else{
			gradient = style.getPropertyValue('background');
			if(gradient.indexOf('linear-gradient')>=0){
				appendExpression(style,ieversion);
				style.setProperty('cs-linear-gradient',gradient)
			}
		}
	}

}
exports.ieUpdateFilter = ieUpdateFilter
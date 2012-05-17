var updateBoxStyle = require('./cs-ie-box').updateBoxStyle
var updateMatrixStyle = require('./cs-ie-matrix').updateMatrixStyle
function appendExpression(style){
	style.setProperty('layout-flow', "expression(CS(this,'update'))");
}
function ieUpdateFilter(resource,cssom,rule,index){

	//添加动画支持
	var style = rule.style;
	if(/-ie[678]-/.test(resource.prefix)) {
		
		updateBoxStyle(style)
		updateMatrixStyle(style)
		
		if(style.getPropertyValue('transition-property')
			||style.getPropertyValue('border-radius')
			||style.getPropertyValue('transform')
			||style.getPropertyValue('opacity')
			){
			appendExpression(style);
		}
		var gradient = style.getPropertyValue('background-image');
		if(gradient.indexOf('linear-gradient')>=0){
			appendExpression(style);
			style.setProperty('cs-linear-gradient',gradient)
		}else{
			gradient = style.getPropertyValue('background');
			if(gradient.indexOf('linear-gradient')>=0){
				appendExpression(style);
				style.setProperty('cs-linear-gradient',gradient)
			}
		}
	}

}
exports.ieUpdateFilter = ieUpdateFilter
var CS = require('./core').CS;
var nthPlugin = require("./updater-nth").nthPlugin
var boxPlugin = require("./updater-box").boxPlugin
var refPlugin = require("./updater-ref").refPlugin
var transitionPlugin = require('./updater-transition').transitionPlugin
var ElementExtension = require('./element').ElementExtension

//prompt('',navigator.userAgent + '\n'+navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1'))
switch(navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1')){
case '6':
	CS.addPlugin(require("./plugin-muti-class").mutiClassPlugin);
case '7':
	CS.addPlugin(require("./plugin-dynamic-class").dynamicClassPlugin);// ie67()
	CS.addPlugin(require("./plugin-attr").attributePlugin);// ie67()
}


CS.addPlugin(nthPlugin,'onexist','cs-update-nth')

//放最前面,在其他变化生效前.
CS.addPlugin({id:'update-transform',
	update: function(el,config,transform){
		ElementExtension(el).setTransform(transform);
	}
},'onchange','transform')


CS.addPlugin(boxPlugin,'onexist',"border-radius")
CS.addPlugin(refPlugin,'onexist',"cs-ref")
CS.addPlugin(transitionPlugin,'onexist','transition-property')
CS.addPlugin({
	id:'update-box-shadow',
	update:function(el,config,opacity){
		ElementExtension(el).setBoxShadow(opacity);
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
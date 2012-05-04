var CS = require('./core').CS
var FilterHelper = require('./filter').FilterHelper

CS.addPlugin({id:'matrix',//attribute query plugin
	setup:function(el,config){//可选
		FilterHelper(el).setTransform(el.currentStyle["transform"]).update();
	},
	expression:'rubyOverhang'
})
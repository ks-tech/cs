exports.ieBoxFilter = ieBoxFilter
function ieBoxFilter(resource,cssom,rule,index){
	var s = rule.style;
	//key->{property:[value,important,prefixIndex]}rubyAlign
	var valueMap = {};
	var radius = s.getPropertyValue('border-radius').replace(/^\s+|\s+$/,'');
	if(radius){
		var pir = s.getPropertyPriority('border-radius')
		radius = radius.split(/\s+\/\s+/);
		for(var i = radius.length;i--;){
			var radius1 = radius[0] = radius[0].split(/\s+/);
			switch(radius1.length){
			case 1:
				radius1[1] = radius1[0]
			case 2:
				radius1[2] = radius1[0]
			case 3:
				radius1[3] = radius1[1]
			}
		}
		radius[1] = radius[1] || radius[0]
		//console.dir(radius)
		var keys = ['border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-right-radius',
		'border-bottom-left-radius']
		for(var i = keys.length;i--;){
			s.setProperty(keys[i],radius[0][i]+" "+radius[1][i],pir)
		}
		s.setProperty('ruby-align','expression(CS.setup("box",this))')
	}

}
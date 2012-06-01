var totalRelations = [];
var refPlugin = {
	id:'update-ref',
	parentId:'update',
	config:function(style){
		var refs = style['ref-classes']
		if(refs){
			totalRelations.push.apply(totalRelations,refs.split(','))
		}
	},
	update:function(el,config){
		var refs = getRefs(el);
		var refClasses = config.refClasses || '';
		var newRef = refs.join('__ ref-');
		if(refClasses != newRef){
			var className = el.className;
			config.refClasses = newRef;
			//remove
			if(refClasses){
				className = className.replace(/(?:^|\s)ref-\S+?__(?:\s|$)/g,' ').replace(/^\s+|\s+$/g,'');
			}
			el.className = className + " ref-"+newRef+'__';
		}
	}
}
function getRefs(el){
	var buf = [];
	var i = totalRelations.length;
	var style = el.currentStyle;
	while(i--){
		var ref_ = totalRelations[i];
		if(style['cs-ref-'+ref_]){
			var target = 'cs-target-'+ref_;
			var type = ref_.substr(0,ref_.indexOf('-'));
			switch(type){
			case 'child':
				if(el.parentNode.currentStyle[target]){
					buf.push(ref_);
				}
				break;
			case 'gs':
			case 'as':
				var pre =el;
				while(pre= pre.previousSibling){
					if(pre.nodeType === 1){
						if(pre.currentStyle[target]){
							buf.push(ref_);
							break;
						}else{
							if(type === 'as'){
								break;
							}
						}
					}
				}
				break;
			case 'not':
				if(!el.currentStyle[target]){
					buf.push(ref_);
				}
			}
		}
	}
	return buf;
}

exports.refPlugin = refPlugin;

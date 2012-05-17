var totalRelations = [];
var relationPlugin = {
	id:'update-relation',
	parentId:'update',
	config:function(refs){
		if(refs){
		totalRelations.push.apply(totalRelations,refs.split(','))
		}
	},
	update:function(el){
		var i = totalRelations.length;
		var style = el.currentStyle;
		while(i--){
			var ref_ = totalRelations[i];
			var key = 'data-'+ref_;
			if(ref_)
			if(style[ref_]){
				el.setAttribute(key,'1')
			}else{
				el.removeAttribute(key)
			}
		}
	}
}


exports.relationPlugin = relationPlugin;

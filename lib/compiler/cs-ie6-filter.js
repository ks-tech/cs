exports.ie6Filter = ie6Filter
function ie6Filter(resource,cssom,rule,index){
	var csConfig = resource.csConfig;
	var attributeClasses = [];
	var nthClasses = [];
	var mutiClasses = [];
	//dynamic class
	var selector = rule.selectorText.replace(/\[([^=]+)((?:'[^']*'|[^\]]|"[^"]*")+)\]/g,function(a,k,v){
		a = encodeAttr(k,v);
		if(a.match(/^(?:selected|checked)_3D/)){
			if(a == (a = a.replace(/(?:checked|selected)$/,'true'))){
				a = a.replace(/_3D.*$/,'_3Dfalse')
			}
		}
		attributeClasses.push(a)
		return ':attr-'+a;
	});
	
	//nth-child
	//nth-last-child,nth-of-type,nth-last-of-type
	selector = selector.replace(/\:nth\-(child|last\-child|of\-type|last\-of\-type)\(\s*([^)]+?)\s*\)|\:(first|last)-child/,function(a,type,nth,firstLast){
		//nth an+b 标准化
		if(firstLast){
			type = firstLast == 'first'?'child':'last-child'
			nth = '0'
		}else{
			nth = nth.toLowerCase();
			if(nth == 'odd'){
				nth = '2n+1';
			}else if(nth == 'even'){
				nth = '2n';
			}
		}
		nth = type + normalizeNth(nth)
		nthClasses.push(nth)
		return ':nth-'+nth;
	})
	//TODO:not(),这个最复杂
	//
	
	
	
	var mutiSelectors = [];
	var nthSelectors = [];
	var dynamicSelectors = [];
	var attributeSelectors = [];
	//muti class
	selector = selector.replace(/(?:[\.\:][\w\-_]+)+/g,function(cn){
		var cs = [];
		var ps = [];
		cn.replace(/\:(first-letter|first-line|link|visited)\b|[\:\.][\w\-_\*]+/ig,function(a,existed){
			if(existed){
				ps.push(a)
			}else if(a.charAt() == ':'){
				cs.push(a.substr(1)+'__');
			}else{
				cs.push(a.substr(1))
			}
		})
		if(cs.length>1){
			cs.sort();
			mutiSelectors.push(cs[cs.length-1])
			mutiClasses.push(cs = cs.join('--'))
		}else{
			cs = cs.join('--')
		}
		return '.'+cs+ps.join('');
	});
	rule.selectorText = selector;
	
	//dyanmic class and attr hover__,active__,focus__ ,attr-,nth-...
	selector.replace(/[^,]*__[^,]*/,function(g){//(tag|id).class1--class2--class3
		var attrFlag ,dynamicFlag ,nthFlag;
		var sp = g.split('.',2);
		//有且只有一个'.'
		g = g.replace(/(?:(\.)|--)([\w_-]+?)__(?:--|$)/g,function(a,dot,value){
			if(value.match(/^attr-/)){
				attrFlag = 1;
			}
			if(value.match(/^(?:hover|active|focus)$/)){
				dynamicFlag = 1;
			}
			//if(value.match(/(enabled|disabled|checked|invalid|valid|required|read-only|read-write)/)){
			//}
			if(value.match(/^nth-/)){
				nthFlag = 1;
			}
			return '.';
		}).replace(/--$|\.$/,'')
		dynamicFlag && dynamicSelectors.push(g)
		attrFlag && attributeSelectors.push(g)
		nthFlag && nthSelectors.push(g)
	});
	if(dynamicSelectors.length>0){
		cssom.insertRule(dynamicSelectors.join(',')+"{text-kashida-space:expression(CS.setup('dc',this));}",index+1);
	}
	//muti class add expression
	if(mutiSelectors.length){
		cssom.insertRule('.'+mutiSelectors.join(',.')+"{text-kashida:expression(CS.setup('mc',this));}",index+1);
		ClassList.append(csConfig,'muti-classes',mutiClasses);
	}
	if(attributeSelectors.length>0){//
		cssom.insertRule(attributeSelectors.join(',')+"{attr-"+attributeClasses.join(':1;attr-')+":1;page-break-before:expression(CS.setup('attr',this));}",index+1);
		ClassList.append(csConfig,'attr-classes',attributeClasses);
	}
	if(nthSelectors.length>0){//
		cssom.insertRule(nthSelectors.join(',')+"{nth-"+nthClasses.join(':1;nth-')+":1;page-break-after:expression(CS.setup('nth',this));}",index+1);
		ClassList.append(csConfig,'nth-classes',nthClasses);
	}
	//添加动画支持
	var style = rule.style;
	if(style.getPropertyValue('transition-property')){
		style.setProperty('layout-flow', "expression(CS.setup('trans',this))");
	}
}


function ClassList(){
	this.data = {};
}

ClassList.append = function(csConfig,key,list){
	var thiz = csConfig[key] || (csConfig[key] = new ClassList())
	var i = list.length;
	while(i--){
		thiz.data[list[i]] = 1;
	}
}
ClassList.prototype = {
	toString:function(){
		var buf = []
		for(var n in this.data){
			buf.push(n)
		}
		return buf.join(',')
	}
}
function encodeAttr(k,v){
	k = k.replace(/\s/g,'')
	if(v){
		v = v.substr(1);
		if(v.charAt() == '"' || v.charAt() == '\''){
			v = eval(v);
		}else{v = v.replace(/^\s+|\s+$/g,'')}
		k = k+'='+v;
	}
	k = encodeURIComponent(k).replace(/[^\w]/,function(c){
		return c=='%'?'_': 
			'_'+c.charCodeAt().toString(16).toUpperCase();
	})
	return k;
}
// 			2n+1 => 2_1 ; 2n-1=>2_1 ; 2n+3 => 2_3
// 			2n => 2_0 ; 2n+0 => 2_0 ;2=>0_2 ; 3=>0_3
function normalizeNth(nth){
	nth = nth.toLowerCase().split('n');
	var n1 = eval(nth[0]);
	var n2 = n1;
	if(nth.length < 2){
		n1 = 0;
	}else{
		n2 = eval(nth[1])||0;
	}
	//有n
	if(n1>0){
		if(n2<0){
			n2 = n2 % n1 + n1
		}
	}else if(n1 <=0){
		if(n2 <0){
			n1=0;n2=-1
		}
	}
	return '_'+n1+'_'+n2;
}

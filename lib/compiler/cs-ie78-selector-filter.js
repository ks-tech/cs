var parseSelectors = require('./selector-parser').parseSelectors

var getPluginStyle =  require('./cs-util').getPluginStyle;
var encodeSelector =  require('./cs-util').encodeSelector;
var normalizeNth = require('./cs-util').normalizeNth;
var walkSelector = require('./cs-util').walkSelector;
var walkNode = require('./cs-util').walkNode;
var CSSManager = require('./cs-util').CSSManager;
function ie7SelectorFilter(resource,cssom,rule,index){
	var selectorData = parseSelectors(rule.selectorText);
	walkSelector(selectorData,normalizeIE7Selector);
	var result = [];
	var groupResult = [];
	var dynamicSelectors = [];
	var attributeSelectors = [];
	var attributeClasses = [];
	var nthSelectors = [];
	var nthClasses = [];
	walkNode(selectorData,function(group,node,index){
		var pureSelector;
		for(var i=0;i<node.length;i++){
			var c = node[i];
			if(c.charAt(0) == '.'){
			switch(c){
				case '.active__':
				case '.focus__': 
					pureSelector =  pureSelector || toPureSelector(groupResult,node);
					dynamicSelectors .push(pureSelector)
					break;
				default:
					var c2 = c.replace(/^\.(?:nth|attr|not)-(.*)__$/,'$1')
					if(c2 != c){
						if(/\.attr-.+__/.test(c)){
							pureSelector =  pureSelector || toPureSelector(groupResult,node);
							attributeSelectors.push(pureSelector);
							attributeClasses && attributeClasses.push(c2);
						}else if(/\.nth-.+__/.test(c)){
							pureSelector =  pureSelector || toPureSelector(groupResult,node);
							nthSelectors.push(pureSelector)
							nthClasses.push(c2);
						}else if(/\.not-.+__/.test(c)){
							pureSelector =  pureSelector || toPureSelector(groupResult,node);
							notClasses && notClasses.push(c2);
						}
					}
				}
				
			}
		}
		
		groupResult.push(node.join(''))
		if(index==group.length-1){
			result.push(groupResult.join(''))
			groupResult = [];
		}
	})
	rule.selectorText = result.reverse().join(',');
	var css = new CSSManager(cssom,index,resource.cs)
	css.setup('dc',dynamicSelectors);
	css.setup('attr',attributeSelectors).config('attr-classes',attributeClasses);
	css.setup('update',nthSelectors,'cs-update-nth:1;').config('nth-classes',nthClasses);
}

function ie8SelectorFilter(resource,cssom,rule,index){
	var selectorData = parseSelectors(rule.selectorText);
	walkSelector(selectorData,normalizeIE8Selector);
	var result = [];
	var groupResult = [];
	var dcSelectors = [];
	walkNode(selectorData,function(group,node,index){
		groupResult.push(node.join(''))
		for(var i=0;i<node.length;i++){
			var selector = node[i];
			if(/.attr-.+__/.test(selector)){
				
			}else if(/.nth-.+__/.test(selector)){
				
			}else if(/.not-.+__/.test(selector)){
				
			}
		}
		if(index==group.length-1){
			result.push(groupResult.join(''))
			groupResult = [];
		}
	})
	var config = resource.cs.config;
	var cache = resource.cs.cache;
	function setup(pid,selectors,configKey,configClasses,appendInfo){
		if(cleanSelector(selectors,cache,pid)){
			cssom.insertRule(selectors.join(',')+"{"+(appendInfo||'')+getPluginStyle(pid)+":expression(CS(this,'"+pid+"'));}",index+1);
		}
		configKey && ClassList.append(config,configKey,configClasses);
	}
	setup('dc',dynamicSelectors);
	setup('attr',attributeSelectors,'attr-classes',attributeClasses);
}
function toPureSelector(groupResult,node){
	var buf = groupResult.concat();
	for(var i=0;i<node.length;i++){
		if(!/^\.\w+-.*__$/.test(node[i])){
			buf.push(node[i]);
		}
	}
	return buf.join('');
	
				var prefix = parentPrefix+ node.slice(0,classIndex).join('');
				var postfix = node.slice(classIndex+1).join('');
}
function normalizeIE7Selector(node,item,i){
	if(item.charAt() == ':'){
		item = item.substr(1);
		switch(item){
		//case 'hover':
		case 'active':
		case 'focus':
			node[i] = '.'+item+'__'
			break;
		default:
			normalizeIE8Pseudo(node,item,i);
		}
	}
}
function normalizeIE8Selector(node,item,i){
	if(item.charAt() == ':'){
		item = item.substr(1);
		normalizeIE8Pseudo(node,item,i);
	}
}
function normalizeIE8Pseudo(node,item,i){
	switch(item){
	case 'default':
	case 'valid':
	case 'invalid':
	case 'in-range':
	case 'out-of-range':
		break;
	//form status support
	case 'required':
		var newItem = 'required';
	case 'optional':
		newItem = newItem || 'required=null';
	case 'read-only':
		newItem = newItem || 'readOnly=true';
	case 'read-write':
		newItem = newItem || 'readOnly=false';
	////replace :checked,:enabled,:disabled
	case 'checked':
		newItem = newItem || 'checked=true';
	case 'enabled':
		newItem = newItem || 'disabled=false';
	case 'disabled':
		newItem = newItem || 'disabled=true';
		item = encodeSelector(newItem);
		node[i] = '.attr-'+item+'__'
		break;
	case 'first-letter'://||link|
	case 'first-line':
	case 'link':
	case 'visited':
		break;
	case 'target':
	case 'empty':
		//TODO:...
		break;
	case 'only-child':
	case 'only-of-type':
		var first = item.replace('only','')+'_0_0'
		var last = item.replace('only','last')+'_0_0'
		node.splice(i+1,0,'.nth-'+last+'__')
		newItem = first;
	case 'first-child':
		newItem = 'nth-child_0_0'
	case 'last-child':
		item = newItem || 'nth-last-child_0_0'
	default:
		if(/^nth-/.test(item)){//nth
			//nth-child,nth-last-child,nth-of-type,nth-last-of-type
			item = item.replace(/\(.*\)/,normalizeNth)
			node[i] = '.'+item+'__';
		}else if(/^not\(/.test(item)){
			item = encodeSelector(item.slice(4,-1));
			node[i] = '.not-'+item+'__'
		}
	}
}

exports.normalizeIE8Pseudo = normalizeIE8Pseudo;
exports.ie7SelectorFilter = ie7SelectorFilter;
exports.ie8SelectorFilter = ie8SelectorFilter;
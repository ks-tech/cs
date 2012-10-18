var fixedPlugin = {
	id:'position-fixed',
	config:function(style){
	},
	update:function(el,config,fixed,inc){
		//try{
		if(fixed){
			
			switch(scrolled){
			case -1:
				var b = document.body;
				b.attachEvent('onscroll',onscroll)
				b.parentNode.attachEvent('onscroll',onscroll);
				scrolled = 1;
			default:
				if(scrolled){
					scrolled--;
				}else if(inc%10){
					return;
				}
				resetFixed(el,config);
				
				config.positionFix = true;
			}
		}else if(config.positionFix){
			var runtimeStyle = el.runtimeStyle;
			runtimeStyle.top = runtimeStyle.right = runtimeStyle.bottom = runtimeStyle.left = ''
		}
		//}catch(e){console.log(e.message)}
	}
}
var scrolled = -1;
function onscroll(){
	onscroll = 3
}
//function initEvent(el){
////	while(el = el.offsetParent){
////		attachEvent('onscroll',onscroll)
////	}
//}
//document.write('<div id="x" style="position:absolute;top:300px"></div>')
//document.title = "aaa";
//document.documentElement.attachEvent('onscroll',onscroll)
//var inc = 0;
//function onscroll(){
//	x.innerHTML = inc++;
//	//gfix && resetFixed.apply(null,gfix)
//}
function resetFixed(el,config){
	var rootRect;
	var rect = el.getBoundingClientRect();
	var currentStyle = el.currentStyle;
	var runtimeStyle = el.runtimeStyle;
	//alert(el.tagName)
	fix('top') || fix('bottom',true);
	fix('left') || fix('right',true);
	function fix(key,rev){
		try{
		var currentValue = parseInt(currentStyle[key]);
		var rectValue = rect[key];
		if(rev){
			rootRect = rootRect || document.documentElement.getBoundingClientRect();
			rectValue = rootRect[key]-19 -rectValue;
			//if(key == 'bottom')console.log(currentValue,rectValue)
		}
		if(!isNaN(currentValue)){
			runtimeStyle[key] = '';
			var fixValue = parseInt(currentStyle[key]);
			if(!isNaN(fixValue)){
				runtimeStyle[key] = currentValue + (fixValue- rectValue)  + 'px'
				return true;
			}
			
		}
		}catch(e){console.log(e.message,currentValue,[fixValue,rectValue])}
		
	}
}

exports.fixedPlugin = fixedPlugin;

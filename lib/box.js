var CS = require('./core').CS
var ns = document.namespaces;

var FilterHelper = require('./filter').FilterHelper

function nsInit(){
	try{
		ns.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
	}catch(e){
		nsInit && setTimeout(nsInit,100);
		nsInit = null;
	}
}
nsInit()
CS.addPlugin({id:'box',//attribute query plugin
	setup:function(el,config){//可选
		setupVMLBorder(el);
	},
	expression:'rubyAlign'
})
CS.addPlugin({
	id:'gradient',
	
	setup:function(el,config){//可选
		FilterHelper(el).setLinearGradient(el.currentStyle["background-gradient"]).update();
	},
	expression:'rubyPosition'
})
function toPixelWidth(v){
	return v == 'auto'? 0 :parseInt(v)||0
}


function setupVMLBorder(el){

	var rs = el.currentStyle;
	var x = 0;//toPixelWidth(rs.left);
	var y = 0;//toPixelWidth(rs.top);
	var color = rs.borderColor || rs.borderTopColor;
	var bs = [
			toPixelWidth(rs['borderTopWidth']),
			toPixelWidth(rs['borderRightWidth']),
			toPixelWidth(rs['borderBottomWidth']),
			toPixelWidth(rs['borderLeftWidth'])];
	var rs = [rs['border-top-left-radius'],//0		//3  0
			rs['border-top-right-radius'],//1		//1 0
			rs['border-bottom-right-radius'],//2	//1 2
			rs['border-bottom-left-radius']]//3		//3 2
	var width = parseInt(el.offsetWidth);
	var height = parseInt(el.offsetHeight);
	var args = [0,0,width,height];
	//el.runtimeStyle.display = 'none';
	for(var i=0;i<4;i++){
		var r = rs[i].split(' ');
		args.push(parseInt(r[0]),parseInt(r[1]))
		//args.push(parseInt(r[0])+bs[i%3?1:3],parseInt(r[1])+bs[i>1?2:0])
	}
	//console.log(args);
	//console.log(buildInnerArgs(args,bs))
	var buf = [];
	var outer = buildRoundRect.apply(this,args);
	var inner = buildRoundRect.apply(this,buildInnerArgs(args,bs))
	
	doMask(el,x,y,width,height,color,inner,outer)
	
}
function doMask(source,x,y,width,height,color,inner,outer){
	setTimeout(function(){
		var style = source.currentStyle;
		var mask = document.createElement('div');
		var position = style.position=='absolute'?'absolute':'relative';
		var pos = 'position:'+position+';top:'+(toPixelWidth(style.top)-y)+'px;left:'+(toPixelWidth(style.left)-x)+'px;'
		source.parentNode.insertBefore(mask,source)
		mask.style.cssText = pos+'width:'+width+'px;height:'+height
				+'px;filter:progid:DXImageTransform.Microsoft.Compositor(function=21) ';
		source.style.left = 0;
		source.style.top = 0;
		mask.zIndex= style.zIndex
		//alert([x,y,pos])
		//source.style.filter = "alpha(opacity=20)"
		mask.innerHTML =buildShape(inner,width,height,'green');
		
		//setTimeout(function(){
			mask.filters[0].apply();
			mask.removeChild(mask.firstChild);
			mask.appendChild(source);
			mask.filters[0].play();
	
	//		source.style.display = 'none'
			if(outer != inner){
				var border = 
				"<div style='"+pos+";z-index:"+style.zIndex+"'>"
					+buildShape(outer+inner,width,height,color)+"</div>"
					
				mask.insertAdjacentHTML('beforeBegin',border)
			}
		//},100);
	},100);
}

/* ============= impl util =============== */
function buildShape(path,width,height,color){
	var buf = []
	buf.push('<v:shape  strokeweight="0px" strokecolor="',color,'"  fillcolor="',color,'"',
		' coordsize="',width,' ',height,'"',
		' style="overflow:hidden;position:absolute;left:0px;top:0px;width:',width,'px;height:',height,'px;"',
		' path="',path,'e">',
		//<div style="position:absolute;left:-5px;top:0px;width:10px;width:10px;background:blue"></div>',
		'</v:shape>');
	return buf.join('')
}
function buildRoundRect(x,y,w,h,
			tlh,tlv,trh,trv,brh,brv,blh,blv){
	var buf = ['m',x,',',y+tlv];
	if(tlh){//&&tlv
		buf.push('qy',x+tlh,',',y);
	}
	buf.push('l',x+w-trh,',',y);
	if(trh){//&&trv
		buf.push('qx',x+w,',',y+trv);
	}
	buf.push('l',x+w,',',y+h-brv);
	if(brh){//&&brv
		buf.push('qy',x+w-brh,',',y+h);
	}
	buf.push('l',x+blh,',',y+h);
	if(blh){//&&brv
		buf.push('qx',x,',',y+h-blv);
	}
	buf.push('x');
	return buf.join('')
}
function buildInnerArgs(box,border){
//x,y,w,h,
	var nb = box.concat();
	nb[0] +=border[3];///2
	nb[1] +=border[0];
	nb[2] -=(border[1]+border[3]);
	nb[3] -=(border[0]+border[2]);
/// tlh,tlv,trh,trv, 
	nb[4] -= Math.min(border[3],nb[4]);
	nb[5] -= Math.min(border[0],nb[5]);
	nb[6] -= Math.min(border[1],nb[6]);
	nb[7] -= Math.min(border[0],nb[7]);
//brh,brv,blh,blv
	nb[8] -= Math.min(border[1],nb[8]);
	nb[9] -= Math.min(border[2],nb[9]);
	nb[10]-= Math.min(border[3],nb[10]);
	nb[11]-= Math.min(border[2],nb[11]);
//	*/
	return nb;
}
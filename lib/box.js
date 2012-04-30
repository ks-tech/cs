var CS = require('./core').CS
CS.addPlugin({id:'box',//attribute query plugin
	setup:function(el,config){//可选
		setupVMLBorder(el);
	},
	visit:function(el,config){
		
	},
	expression:'rubyAlign'
})

function setupVMLBorder(el){
	try{
		document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
	}catch(e){
		console.log(e)
	}
	var rs = el.currentStyle;
	var x = parseInt(rs.left);
	var y = parseInt(rs.top);
	var color = rs.borderColor || rs.borderTopColor;
	var bs = [
			parseInt(rs['borderTopWidth'])||0,
			parseInt(rs['borderRightWidth'])||0,
			parseInt(rs['borderBottomWidth'])||0,
			parseInt(rs['borderLeftWidth'])||0];
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
		args.push(parseInt(r[0])+bs[i%3?1:3],parseInt(r[1])+bs[i>1?2:0])
	}
	var buf = [];
	var outer = buildRoundRect.apply(this,args);
	var inner = buildRoundRect.apply(this,buildInnerArgs(args,bs))
	
	doMask(el,x,y,width,height,color,inner,outer)
	
}
function doMask(source,x,y,width,height,color,inner,outer){



setTimeout(function(){
	var mask = document.createElement('div');
	source.parentNode.insertBefore(mask,source)
	mask.style.cssText = 'position:relative;top:'+y+'px;left:'+x+'px;width:'+width+'px;height:'+height
			+'px;filter:progid:DXImageTransform.Microsoft.Compositor(function=21)';
	source.style.left = 0;
	source.style.top = 0;
	
	mask.innerHTML = buildShape(inner,width,height,color);
	mask.filters[0].apply();
	mask.removeChild(mask.firstChild);
	mask.appendChild(source);
	mask.filters[0].play();
	if(outer != inner){
	mask.insertAdjacentHTML('beforeBegin',
		"<div style='position:relative;z-index:-1;top:-"+y+"px;left:-"+x+";'>"+buildShape(outer+inner,width,height,color)+"</div>")
	}
	
},100);


}

/* ============= impl util =============== */
function buildShape(path,width,height,color){
	var buf = []
	buf.push('<v:shape fill="false" stroke="false" strokeweight="0px"  strokecolor="',color,'" fillcolor="',color,'" coordsize="',width,',',height,'"',
		' style="position:absolute;left:0;top:0;width:',width,'px;height:',height,'px;"',
		' path="',path,'e">',
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
	buf.push('l',x+w,',',y+h-trv);
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
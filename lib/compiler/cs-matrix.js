exports.matrixFilter = matrixFilter

function matrixFilter(resource,cssom,rule,index){
	var s = rule.style;
	var i = s.length;
	
	//console.log(11111111111111,i)
	//key->{property:[value,important,prefixIndex]}
	while(i--){
		var n = s[i];
		//console.log(resource.prefix,n)
		if(/(?:-\w+-)?transform/.test(n)){
			var value = s.getPropertyValue(n);
			var priority = s.getPropertyPriority(n);
			value = toMatrix(value).join(',');
			if(/-moz-/.test(n)){
				value = value.replace(/,[\w\(\)]+$/,'px,$&px')
			}
			s.setProperty(n,"matrix("+value+")",priority);
			if(/-ie[678]-/.test(resource.prefix)){
				//6/7
				if(n == '-ie8-'){
				}else{
					s.setProperty('ruby-overhang',"expression(CS.setup('matrix',this))");
				}
			}
		}
	}
}

function toMatrix(value){
	var matrix = startMatrix;
	value.replace(transformPattern,function(a,fn,args){
		fn = MatrixGenerator[fn];
		matrix = matrix.x(fn.apply(MatrixGenerator,args.split(',')));
	})
//			filter.M11 = matrix.e(1, 1);
//		filter.M12 = matrix.e(1, 2);
//		filter.M21 = matrix.e(2, 1);
//		filter.M22 = matrix.e(2, 2);
	return [matrix.e(1,1),matrix.e(2,1),matrix.e(1,2),matrix.e(2,2),matrix.e(1,3),matrix.e(2,3)]
}
var transformPattern = /([a-zA-Z]+)\(([^\)]*)\)\s*/g;
var Matrix = require("sylvester").Matrix;
var $M = Matrix.create;
var startMatrix = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
var MatrixGenerator = {
	rotate :  function(angleStr){
		var num = getRadianScalar(angleStr);
		return Matrix.RotationZ(num);
	}
	,scale :  function(sx, sy){
		sx = parseFloat(sx)
		if (!sy) {
			sy = sx;
		}else {
			sy = parseFloat(sy)
		}
		return $M([[sx, 0, 0], [0, sy, 0], [0, 0, 1]]);
	}
	,scaleX :  function(sx){
		return this.scale(sx, 1);
	}
	,scaleY :  function(sy){
		return this.scale(1, sy);
	}
	,skew :  function(ax, ay){
		var xRad = getRadianScalar(ax);
		var yRad;
		if (ay != null) {
			yRad = getRadianScalar(ay)
		}else {
			yRad = xRad
		}
		if (xRad != null && yRad != null) {
			return $M([[1, Math.tan(xRad), 0], [Math.tan(yRad), 1, 0], [0, 0, 1]]);
		}else {
			return null;
		}
	}
	,skewX :  function(ax){
		return this.skew(ax, "0");
	}
	
	,skewY :  function(ay){
		return this.skew("0", ay);
	}
	,translate :  function(tx, ty){
		var TX = parseInt(tx);
		var TY = parseInt(ty)
		//jslog.debug(StringHelpers.sprintf('translate %f %f', TX, TY));
		return $M([[1, 0, TX], [0, 1, TY], [0, 0, 1]]);
	}
	,translateX :  function(tx){
		return this.translate(tx, 0);
	}
	,translateY :  function(ty){
		return this.translate(0, ty);
	}
	,matrix :  function(a, b, c, d, e, f){
		// for now, e and f are ignored
		return $M([[a, c, parseInt(e)], [b, d, parseInt(f)], [0, 0, 1]])
	}
}
function degreesToRadians(degrees){
	return (degrees - 360) * Math.PI / 180;
}
function getRadianScalar(angleStr){//托管的代码，绝对都是统一的deg，不会有其他单位
	var num = parseFloat(angleStr);
	return /deg$/.test(angleStr)?degreesToRadians(num):num;
}
		

		

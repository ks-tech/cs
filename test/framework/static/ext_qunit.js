var colorMap = {
    aliceblue:"#F0F8FF", antiquewhite:"#FAEBD7", aqua:"#00FFFF", aquamarine:"#7FFFD4",
    azure:"#F0FFFF", beige:"#F5F5DC", bisque:"#FFE4C4", black:"#000000",
    blanchedalmond:"#FFEBCD", blue:"#0000FF", blueviolet:"#8A2BE2", brown:"#A52A2A",
    burlywood:"#DEB887", cadetblue:"#5F9EA0", chartreuse:"#7FFF00", chocolate:"#D2691E",
    coral:"#FF7F50", cornflowerblue:"#6495ED", cornsilk:"#FFF8DC", crimson:"#DC143C",
    cyan:"#00FFFF", darkblue:"#00008B", darkcyan:"#008B8B", darkgoldenrod:"#B8860B",
    darkgray:"#A9A9A9", darkgreen:"#006400", darkkhaki:"#BDB76B", darkmagenta:"#8B008B",
    darkolivegreen:"#556B2F", darkorange:"#FF8C00", darkorchid:"#9932CC", darkred:"#8B0000",
    darksalmon:"#E9967A", darkseagreen:"#8FBC8B", darkslateblue:"#483D8B", darkslategray:"#2F4F4F",
    darkturquoise:"#00CED1", darkviolet:"#9400D3", deeppink:"#FF1493", deepskyblue:"#00BFFF",
    dimgray:"#696969", dodgerblue:"#1E90FF", firebrick:"#B22222", floralwhite:"#FFFAF0",
    forestgreen:"#228B22", fuchsia:"#FF00FF", gainsboro:"#DCDCDC", ghostwhite:"#F8F8FF",
    gold:"#FFD700", goldenrod:"#DAA520", gray:"#808080", green:"#008000",
    greenyellow:"#ADFF2F", honeydew:"#F0FFF0", hotpink:"#FF69B4", indianred:"#CD5C5C",
    indigo:"#4B0082", ivory:"#FFFFF0", khaki:"#F0E68C", lavender:"#E6E6FA",
    lavenderblush:"#FFF0F5", lawngreen:"#7CFC00", lemonchiffon:"#FFFACD", lightblue:"#ADD8E6",
    lightcoral:"#F08080", lightcyan:"#E0FFFF", lightgoldenrodyellow:"#FAFAD2", lightgreen:"#90EE90",
    lightgrey:"#D3D3D3", lightpink:"#FFB6C1", lightsalmon:"#FFA07A", lightseagreen:"#20B2AA",
    lightskyblue:"#87CEFA", lightslategray:"#778899", lightsteelblue:"#B0C4DE", lightyellow:"#FFFFE0",
    lime:"#00FF00", limegreen:"#32CD32", linen:"#FAF0E6", magenta:"#FF00FF",
    maroon:"#800000", mediumaquamarine:"#66CDAA", mediumblue:"#0000CD", mediumorchid:"#BA55D3",
    mediumpurple:"#9370DB", mediumseagreen:"#3CB371", mediumslateblue:"#7B68EE", mediumspringgreen:"#00FA9A",
    mediumturquoise:"#48D1CC", mediumvioletred:"#C71585", midnightblue:"#191970", mintcream:"#F5FFFA",
    mistyrose:"#FFE4E1", moccasin:"#FFE4B5", navajowhite:"#FFDEAD", navy:"#000080",
    oldlace:"#FDF5E6", olive:"#808000", olivedrab:"#6B8E23", orange:"#FFA500",
    orangered:"#FF4500", orchid:"#DA70D6", palegoldenrod:"#EEE8AA", palegreen:"#98FB98",
    paleturquoise:"#AFEEEE", palevioletred:"#DB7093", papayawhip:"#FFEFD5", peachpuff:"#FFDAB9",
    peru:"#CD853F", pink:"#FFC0CB", plum:"#DDA0DD", powderblue:"#B0E0E6",
    purple:"#800080", red:"#FF0000", rosybrown:"#BC8F8F", royalblue:"#4169E1",
    saddlebrown:"#8B4513", salmon:"#FA8072", sandybrown:"#F4A460", seagreen:"#2E8B57",
    seashell:"#FFF5EE", sienna:"#A0522D", silver:"#C0C0C0", skyblue:"#87CEEB",
    slateblue:"#6A5ACD", slategray:"#708090", snow:"#FFFAFA", springgreen:"#00FF7F",
    steelblue:"#4682B4", tan:"#D2B48C", teal:"#008080", thistle:"#D8BFD8",
    tomato:"#FF6347", turquoise:"#40E0D0", violet:"#EE82EE", wheat:"#F5DEB3",
    white:"#FFFFFF", whitesmoke:"#F5F5F5", yellow:"#FFFF00", yellowgreen:"#9ACD32"}

var buf = [];
for(var n in colorMap){
    buf.push(n)
}
buf.push('\\b(?:rgb|hsl)a?\\s*\\(\\s*\\d+%?\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d\\.]+)?\\)')
var colorPattern = new RegExp(
    "\\b(background|color|border|border-\\w+)\\s*\\:|'[^']*'|\"[^\"]*\""
        +"|("+buf.join('|')+")|([\\{;])\\b",'ig');

function normalizeColor(source){
    var maybeColor;
    var color = colorMap[source.toLowerCase()];
    if(color){
        return color;
    }else if(/^#([\da-f])([\da-f])([\da-f])$/g.test(source)){
        return source.replace(/#([\da-f])([\da-f])([\da-f])\b/g,'#$1$1$2$2$3$3').toUpperCase();
    }else if(/^#[\da-f]{6}$/g.test(source)){
        return source.toUpperCase();
    }
    source = source.replace(/#([\da-f])([\da-f])([\da-f])\b/g,'#$1$1$2$2$3$3')
        .replace(colorPattern,function(a,start,color,reset){
            if(color){
                if(maybeColor){
                    if(/^hsl/i.test(color)){
                        return hsl2rgb(color);
                    }else if(/^rgb/i.test(color)){
                        return formatRGB(color)
                    }
                    return colorMap[color.toLowerCase()];
                }
            }else if(reset){
                maybeColor = false;
            }else if(start){
                maybeColor = true;
            }
            return a;
        });
    return source;
}
function formatRGB(rgb){
    var tokens = rgb.toLowerCase().match(/^rgba?|[\d\.]+%?/g);
    var type = tokens[0];
    var r = to255(tokens[1])
    var g = to255(tokens[2])
    var b = to255(tokens[3])
    var a = tokens[4];
    if(type == 'rgba'){
        return 'rgba('+r+','+g+','+b+','+a+')';
    }
    rgb = (0x1000000 | r<<16 | g<<8 | b).toString(16).replace('1','#')
    //console.log(rgb,tokens)
    return rgb;
}
function to255(value){
    if(/%$/.test(value)){
        return Math.ceil(value.slice(0,-1)*2.5)
    }
    return parseInt(value);
}
/**
 * hsl:hsl(120,100%,50%)
 * hsla:hsla(120,100%,50%,.1)
 */
function hsl2rgb(hsl){
    var tokens = hsl.toLowerCase().match(/^hsla?|[\d\.]+/g);
    var type = tokens[0];
    var h = +tokens[1];
    var s = tokens[2]/100;
    var l = tokens[3]/100;
    var a = tokens[4];
    //* h:0,359
    //* s:0,1
    //* l:0,1
    var r, g, b;
    if (h < 120){
        r = (120 - h) / 60;
        g = h / 60;
        b = 0;
    }else if (h < 240){
        r = 0;
        g = (240 - h) / 60;
        b = (h - 120) / 60;
    }else{
        r = (h - 240) / 60;
        g = 0;
        b = (360 - h) / 60;
    }

    r = Math.min(r, 1);
    g = Math.min(g, 1);
    b = Math.min(b, 1);

    r = 2 * s * r + (1 - s);
    g = 2 * s * g + (1 - s);
    b = 2 * s * b + (1 - s);

    if (l < 0.5){
        r = l * r;
        g = l * g;
        b = l * b;
    }else{
        r = (1 - l) * r + 2 * l - 1;
        g = (1 - l) * g + 2 * l - 1;
        b = (1 - l) * b + 2 * l - 1;
    }

    r = Math.ceil(r * 255);
    g = Math.ceil(g * 255);
    b = Math.ceil(b * 255);
    if(type == 'hsla'){
        return 'rgba('+r+','+g+','+b+','+a+')';
    }
    return (0x1000000 | r<<16 | g<<8 | b).toString(16).replace('1','#')
}
/**
 * 重载QUnit部分接口实现批量执行控制功能
 */
(function() {
	if (!QUnit)
		return;
	var ms = QUnit.moduleStart, d = QUnit.done;

	function _d(args /* failures, total */) {
		//默认展开失败用例
		$('li.fail ol').toggle();
		if (parent && parent.brtest) {
			parent.$(parent.brtest).trigger('done', [ new Date().getTime(), {
				failed : args[0],
				passed : args[1]
			}, window._$jscoverage || null ]);
		}
	}
	QUnit.moduleStart = function() {
		stop();
		/* 为批量执行等待import.php正确返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);
				ms.apply(this, arguments);
				start();
			}
		}, 20);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};
    QUnit.colorEqual = QUnit.colorEquals = function(actual, expected, message) {
        QUnit.equal(normalizeColor(actual) ,normalizeColor(expected) ,message);
    }

    QUnit.colorNotEqual = QUnit.colorNotEqual = function(actual, expected, message) {
        QUnit.notEqual(normalizeColor(actual) ,normalizeColor(expected) ,message);
    }
})();
//function RGBToHex(rgb){
//    var regexp = /^rgb/(([0-9]{0,3})/,/s([0-9]{0,3})/,/s([0-9]{0,3})/)/g;
//    var re = rgb.replace(regexp, "$1 $2 $3").split(" ");//利用正则表达式去掉多余的部分  
//    var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
//    for (var i = 0; i < 3; i++) {
//        var r = null; var c = re[i];
//        var hexAr = [];
//        while (c > 16) {
//            r = c % 16;
//            c = (c / 16) >> 0;
//            hexAr.push(hex[r]);
//        } hexAr.push(hex[c]);
//        hexColor += hexAr.reverse().join('');
//    }
//    //alert(hexColor)  
//    return hexColor;
//}
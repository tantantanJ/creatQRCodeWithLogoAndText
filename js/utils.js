/*
 * 生成二维码
 * 前提：	无；
 * 输入:		参数1： 	String或Array, 为String时是需跳转的URL，为Array是一些键值对
 *          参数2：    jQuery对象，需要显示二维码的元素所在的父容器
 *          参数3：   二维码的文字说明
 * 出口：	返回调用点，继续执行后续语句
 * 返回：	无
 * 其他:		1）	需引入qrcode包（https://github.com/tantantanJ/qrcodejs）
 *			2）  将url作为String直接传入主要针对需要直接扫码跳转的情况
 *
 * 改进：	暂无
 * 
 * @author tanjie
 * @version 1.0 2018-12-26
 */
function createQRCodeWidthLogoAndText(parValue,parentContainer,text){
	var imgWidth = 200;
	var imgHeight = 200;
	var textCanvasHeight = 20;
	if($('#qrcode').length>0){
		return;																																										
	}
	var creatTime = Date.parse(new Date()) / 1000; //将当前时间作为参数写入用于判断是否失效
	var element_a = "<a id='qrcode'></a>"
	parentContainer.append(element_a);
	
	//模拟参数
	parValue = {'custom':'1','url':'www.wenyangmuye.com','KeHuBiaoShi':'WYHB000619'};
	
	var parText = '';
	if(typeof parValue === 'string'){
		if(parValue.indexOf('?')!=-1){
			parText = parValue + '&creatTime=' + creatTime;
		} else {
			parText = parValue + '?creatTime=' + creatTime;
		}
		parText = compileStr(parText,'E');
	} else if(parValue instanceof Object){
		parValue['creatTime'] = creatTime;
		parText = JSON.stringify(parValue);
		parText = compileStr(parText,'E');
	} else {
		parText = '这是一个未正确传递参数的二维码'
	}
	var qrcode = new QRCode('qrcode', {
		  render : 'canvas',    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
		  text: parText,
		  width: imgWidth,
		  height: imgHeight,
		  colorDark : '#000000',
		  colorLight : '#ffffff',
		  correctLevel : QRCode.CorrectLevel.H
	});
	
	drawText(text);
	drawAll(function(){
		debugger;
		var url = convertCanvasToImage($(allCanvas));
		downloadFile(url);
	});
	
	// 将canvas转换为url
    function convertCanvasToImage(canvasContainer) {
        var base64URL = canvasContainer[0].toDataURL("image/jpeg");
        return base64URL
    }
	
	// 绘制文字图
    function drawText(text){
    	var textCanvas=document.createElement("canvas");
    	textCanvas.setAttribute("id", "textCanvas");
    	textCanvas.width = imgWidth;
    	textCanvas.height = textCanvasHeight;
    	textCanvas.style.display="none";
    	document.body.appendChild(textCanvas);
    	var myCanvasWidth = textCanvas.width; 
    	var myCanvasHeight = textCanvas.height; 
    	var ctx = textCanvas.getContext("2d");
    	ctx.font = "16px bold 黑体";
    	ctx.textAlign = "center";
    	ctx.textBaseline="middle";
    	ctx.fillText(text,myCanvasWidth/2,myCanvasHeight/2);
    	
    	// change non-opaque pixels to white
    	var imgData=ctx.getImageData(0,0,textCanvas.width,textCanvas.height);
    	var data=imgData.data;
    	for(var i=0;i<data.length;i+=4){
    	    if(data[i+3]<255){
    	        data[i] = 255 - data[i];
    	        data[i+1] = 255 - data[i+1];
    	        data[i+2] = 255 - data[i+2];
    	        data[i+3] = 255 - data[i+3];
    	    }
    	}
    	ctx.putImageData(imgData,0,0);
    }
    
    function drawAll(callback){	
    	var allCanvas=document.createElement("canvas");
    	allCanvas.setAttribute("id", "allCanvas");
    	var ctx = allCanvas.getContext("2d");
    	allCanvas.width = imgWidth;
    	allCanvas.height = imgHeight+textCanvasHeight;
    	ctx.fillStyle="#ffffff";
    	ctx.fillRect(0,0,imgWidth,imgHeight+textCanvasHeight);
    	document.body.appendChild(allCanvas);
    	
    	var imgQrcode = new Image();
    	var qrcodeContainer = $("#qrcode canvas");
    	imgQrcode.setAttribute('crossOrigin', 'anonymous');
    	imgQrcode.src = convertCanvasToImage(qrcodeContainer);
    	imgQrcode.onload = function(){

    		
    		var imgText = new Image();
    		var imgTextContainer = $('#textCanvas');
    		imgText.setAttribute('crossOrigin', 'anonymous');
    		imgText.src = convertCanvasToImage(imgTextContainer);
    		imgText.onload = function(){

    			
    			var imgLogo = new Image();
    			imgLogo.src = "Logo/qrcodeLogo.png"; //logo url
    			imgLogo.onload = function(){
    				ctx.drawImage(imgQrcode, 10, 10, imgWidth-20, imgHeight-20);
    				ctx.drawImage(imgLogo, 80, 80, 40, 40);
    				ctx.drawImage(imgText, 0, imgHeight, imgWidth, textCanvasHeight);
    				callback && callback();
    			}
    		}   	
    	}
    	
    }
}

/*
 * 下载文件
 * 前提：	无；
 * 输入:		参数1： 	jQuery对象，需要下载的页面元素所在的父容器
 * 出口：	返回调用点，继续执行后续语句
 * 返回：	无
 * 其他:		无
 *
 * 改进：	暂无
 * 
 * @author tanjie
 * @version 1.0 2018-12-27
 */
function downloadFile(url){
	//IE这种智障浏览器不支持HTML5的download属性，所以IE用document.execCommand("SaveAs")方法
	function isIEBrowser() {
	    if (!!window.ActiveXObject || "ActiveXObject" in window){
	        return true;
	    }
	    else{
	        return false;
	    }
	}	
	//execCommand方法只能保存iframe上的文件
	function createIframe(imgSrc) {
	    if ($("#IframeReportImg").length === 0){
	        $('<iframe style="display:none;" id="iframe" onload="saveAs();" width="0" height="0" src="about:blank"></iframe>').appendTo("body");
	    }
	    //iframe的src属性如不指向图片地址,则手动修改,加载图片
	    if ($('#iframe').attr("src") != imgSrc) {
	        $('#iframe').attr("src",imgSrc);
	    } else {
	        //如指向图片地址,直接调用下载方法
	    	saveAs();
	    }
	}
	//下载图片的函数
	function saveAs() {
	    if ($('#iframe').src != "about:blank") {
	        window.frames["iframe"].document.execCommand("SaveAs");
	    }
	}
	
	if (isIEBrowser()) {
       // var imgSrc = $(this).siblings("img").attr("src");
        createIframe(url);
	} else {
	//	var qrcodea = $('#qrcode img');
	 //   var imgSrc = $('#qrcode img').attr("src");
	    $('#qrcode_btn-download').attr("download",url);
	    $('#qrcode_btn-download').attr("href",url);
	    $('#qrcode_btn-download').click();
	}
}

/*
 * 对字符串进行简单加密、解密
 * 前提：	无；
 * 输入:		参数1： 	String, 需要加密的字符串
 *          参数2：   String, E为加密，D为解密
 * 出口：	返回调用点，继续执行后续语句
 * 返回：	无
 * 其他:		无
 *
 * 改进：	暂无
 * 
 * @author tanjie
 * @version 1.0 2018-12-27
 */
function compileStr(code,type){        
	if(type == 'E'){
		var c=String.fromCharCode(code.charCodeAt(0)+code.length);
		for(var i=1;i<code.length;i++)
		{      
			c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
		}   
		return escape(c);   
	} else if (type == 'D'){
		code=unescape(code);      
		var c=String.fromCharCode(code.charCodeAt(0)-code.length);      
		for(var i=1;i<code.length;i++)
		{      
			c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));      
		}      
		return c;   
	}
}
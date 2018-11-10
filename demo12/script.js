(function () {

    //变量声明
    var mouseFrom = {},
        mouseTo = {},
        drawType = null,
        canvasObjectIndex = 0,
        textbox = null;

    var drawWidth = 10; //笔触宽度
    var color = "#000099"; //画笔颜色
    var drawingObject = null; //当前绘制对象
    var moveCount = 1; //绘制移动计数器
    var doDrawing = false; // 绘制状态

    //初始化画板
    var canvas = new fabric.Canvas("c", {
        isDrawingMode: true,
        skipTargetFind: true,
        selectable: false,
        selection: false
    });

    window.canvas = canvas;
    window.zoom = window.zoom ? window.zoom : 1;

    canvas.freeDrawingBrush.color = color; //设置自由绘颜色
    canvas.freeDrawingBrush.width = drawWidth;

    //绑定画板事件
    canvas.on("mouse:down", function (options) {
        var xy = transformMouse(options.e.offsetX, options.e.offsetY);
        mouseFrom.x = xy.x;
        mouseFrom.y = xy.y;
        doDrawing = true;
    });

    canvas.on("mouse:up", function (options) {
        var xy = transformMouse(options.e.offsetX, options.e.offsetY);
        mouseTo.x = xy.x;
        mouseTo.y = xy.y;
        // drawing();
        drawingObject = null;
        moveCount = 1;
        doDrawing = false;
    });

    canvas.on("mouse:move", function (options) {
        if (moveCount % 2 && !doDrawing) {
        //减少绘制频率
        return;
        }
        moveCount++;
        var xy = transformMouse(options.e.offsetX, options.e.offsetY);
        mouseTo.x = xy.x;
        mouseTo.y = xy.y;
        drawing();
    });

    canvas.on("selection:created", function (e) {
        if (e.target._objects) {
            //多选删除
            var etCount = e.target._objects.length;
            for (var etindex = 0; etindex < etCount; etindex++) {
                canvas.remove(e.target._objects[etindex]);
            }
        } else {
            //单选删除
            canvas.remove(e.target);
        }
        canvas.discardActiveObject(); //清楚选中框
    });

    //坐标转换
    function transformMouse(mouseX, mouseY) {
        return { x: mouseX / window.zoom, y: mouseY / window.zoom };
    }

    //绑定工具事件
    jQuery("#toolsul").find("li").on("click", function(){
        //设置样式
        jQuery("#toolsul").find("li>i").each(function () {
          jQuery(this).attr("class", jQuery(this).attr("data-default"));
        });
        jQuery(this).addClass("active").siblings().removeClass("active");
        jQuery(this).find("i").attr("class",jQuery(this).find("i").attr("class").replace("black", "select"));
        drawType = jQuery(this).attr("data-type");
        canvas.isDrawingMode = false;
        if(textbox){
            //退出文本编辑状态
            textbox.exitEditing();
            textbox = null;
        }
        if(drawType == "pen"){
            canvas.isDrawingMode = true;
        }else if(drawType == "remove"){
            canvas.selection = true;
            canvas.skipTargetFind = false;
            canvas.selectable = true;
        }else{
            canvas.skipTargetFind = true; //画板元素不能被选中
            canvas.selection = false; //画板不显示选中
        }
    });



  //绘画方法
  function drawing() {
    if (drawingObject) {
      canvas.remove(drawingObject);
    }
    var canvasObject = null;
    switch (drawType) {
      case "arrow": //箭头
        canvasObject = new fabric.Path(drawArrow(mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y, 30, 30), {
          stroke: color,
          fill: "rgba(255,255,255,0)",
          strokeWidth: drawWidth
        });
        break;
      case "line": //直线
        canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
          stroke: color,
          strokeWidth: drawWidth
        });
        break;
      case "dottedline": //虚线
        canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
          strokeDashArray: [3, 1],
          stroke: color,
          strokeWidth: drawWidth
        });
        break;
      case "circle": //正圆
        var left = mouseFrom.x,
          top = mouseFrom.y;
        var radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
        canvasObject = new fabric.Circle({
          left: left,
          top: top,
          stroke: color,
          fill: "rgba(255, 255, 255, 0)",
          radius: radius,
          strokeWidth: drawWidth
        });
        break;
      case "ellipse": //椭圆
        var left = mouseFrom.x,
          top = mouseFrom.y;
        var radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
        canvasObject = new fabric.Ellipse({
          left: left,
          top: top,
          stroke: color,
          fill: "rgba(255, 255, 255, 0)",
          originX: "center",
          originY: "center",
          rx: Math.abs(left - mouseTo.x),
          ry: Math.abs(top - mouseTo.y),
          strokeWidth: drawWidth
        });
        break;
      case "square": //TODO:正方形（后期完善）
        break;
      case "rectangle": //长方形
        var path =
          "M " +
          mouseFrom.x +
          " " +
          mouseFrom.y +
          " L " +
          mouseTo.x +
          " " +
          mouseFrom.y +
          " L " +
          mouseTo.x +
          " " +
          mouseTo.y +
          " L " +
          mouseFrom.x +
          " " +
          mouseTo.y +
          " L " +
          mouseFrom.x +
          " " +
          mouseFrom.y +
          " z";
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: color,
          strokeWidth: drawWidth,
          fill: "rgba(255, 255, 255, 0)"
        });
        //也可以使用fabric.Rect
        break;
      case "rightangle": //直角三角形
        var path = "M " + mouseFrom.x + " " + mouseFrom.y + " L " + mouseFrom.x + " " + mouseTo.y + " L " + mouseTo.x + " " + mouseTo.y + " z";
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: color,
          strokeWidth: drawWidth,
          fill: "rgba(255, 255, 255, 0)"
        });
        break;
      case "equilateral": //等边三角形
        var height = mouseTo.y - mouseFrom.y;
        canvasObject = new fabric.Triangle({
          top: mouseFrom.y,
          left: mouseFrom.x,
          width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
          height: height,
          stroke: color,
          strokeWidth: drawWidth,
          fill: "rgba(255,255,255,0)"
        });
        break;
      case "isosceles":
        break;
      case "text":
        textbox = new fabric.Textbox("", {
          left: mouseFrom.x - 60,
          top: mouseFrom.y - 20,
          width: 150,
          fontSize: 50,
          borderColor: "#2c2c2c",
          fill: color,
          hasControls: false
        });
        canvas.add(textbox);
        textbox.enterEditing();
        textbox.hiddenTextarea.focus();
        break;
      case "remove":
        break;
      default:
        break;
    }
    if (canvasObject) {
      // canvasObject.index = getCanvasObjectIndex();
      canvas.add(canvasObject); //.setActiveObject(canvasObject)
      drawingObject = canvasObject;
    }
  }

  //绘制箭头方法
  function drawArrow(fromX, fromY, toX, toY, theta, headlen) {
    theta = typeof theta != "undefined" ? theta : 30;
    headlen = typeof theta != "undefined" ? headlen : 10;
    // 计算各角度和对应的P2,P3坐标
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
      angle1 = (angle + theta) * Math.PI / 180,
      angle2 = (angle - theta) * Math.PI / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    var arrowX = fromX - topX,
        arrowY = fromY - topY;
    var path = " M " + fromX + " " + fromY;
    path += " L " + toX + " " + toY;
    arrowX = toX + topX;
    arrowY = toY + topY;
    path += " M " + arrowX + " " + arrowY;
    path += " L " + toX + " " + toY;
    arrowX = toX + botX;
    arrowY = toY + botY;
    path += " L " + arrowX + " " + arrowY;
    return path;
  }

  //获取画板对象的下标
  function getCanvasObjectIndex() {
    return canvasObjectIndex++;
  }
  
  //下载功能
  var download = document.getElementById('download');
  download.onclick = function(){
    var MIME_TYPE = "image/png";
    //转换成base64
    var imgURL = canvas.toDataURL(MIME_TYPE);
　　//创建一个a链接，模拟点击下载
　　var dlLink = document.createElement('a');
    var filename = '个人画板_' + (new Date()).getTime() + '.png';
　　dlLink.download = filename;
　　dlLink.href = imgURL;
　　dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
　　document.body.appendChild(dlLink);
　　dlLink.click();
　　document.body.removeChild(dlLink);
  }

  //打印
  var print = document.getElementById('print');
  print.onclick = function(){
    window.print();
  }

  //切换颜色
  var red = document.getElementById('red');
  red.onclick = function(){
    color="red";
    canvas.freeDrawingBrush.color="red";
  }
  var pink = document.getElementById('pink');
  pink.onclick = function(){
    color="pink";
    canvas.freeDrawingBrush.color="pink";
  }
  var colorA = document.getElementById('colorA');
  colorA.onclick = function(){
    color="#6699FF";
    canvas.freeDrawingBrush.color="#6699FF";
  }
  var colorB = document.getElementById('colorB');
  colorB.onclick = function(){
    color="#66CCFF";
    canvas.freeDrawingBrush.color="#66CCFF";
  }
  var colorC = document.getElementById('colorC');
  colorC.onclick = function(){
    color="#66FFFF";
    canvas.freeDrawingBrush.color="#66FFFF";
  }
  var colorD = document.getElementById('colorD');
  colorD.onclick = function(){
    color="#66FFCC";
    canvas.freeDrawingBrush.color="#66FFCC";
  }
  var colorE = document.getElementById('colorE');
  colorE.onclick = function(){
    color="#6699CC";
    canvas.freeDrawingBrush.color="#6699CC";
  }  
  var colorF = document.getElementById('colorF');
  colorF.onclick = function(){
    color="#66CCCC";
    canvas.freeDrawingBrush.color="#66CCCC";
  }

  //切换笔粗细
  var penA = document.getElementById('penA');
  penA.onclick = function(){
    canvas.freeDrawingBrush.width = 1;
  }

  var penB = document.getElementById('penB');
  penB.onclick = function(){
    canvas.freeDrawingBrush.width = 5;
  }

  var penC = document.getElementById('penC');
  penC.onclick = function(){
    canvas.freeDrawingBrush.width = 15;
  }

  var penD = document.getElementById('penD');
  penD.onclick = function(){
    canvas.freeDrawingBrush.width = 20;
  }

  var penE = document.getElementById('penE');
  penE.onclick = function(){
    canvas.freeDrawingBrush.width = 30;
  }

  var penF = document.getElementById('penF');
  penF.onclick = function(){
    canvas.freeDrawingBrush.width = 40;
  }

  var penG = document.getElementById('penG');
  penG.onclick = function(){
    canvas.freeDrawingBrush.width = 500;
  }

  var penH = document.getElementById('penH');
  penH.onclick = function(){
    canvas.freeDrawingBrush.width = 1000;
  }

})();

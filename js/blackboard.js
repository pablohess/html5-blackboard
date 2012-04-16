var xDown = 0;
var yDown = 0;
var mouseDown = false;
var chalkColor = '#ffffff';
var drawMode = "hand";
var lineWidth = 4;
var xLast = -1;
var yLast = -1;
var selectedBlackboard = 1;
var canvasBack = document.getElementById('canvas1');
var canvasFront = document.getElementById('screen-front');

var changeTo = function(boardNumber, animation) {
	// menu
	document.getElementById('menu' + selectedBlackboard).className ='';
	document.getElementById('menu' + boardNumber).className ='selectedMenu';
	localStorage.setItem('blackboardMenu', boardNumber);
	
	// canvas
	canvasBack = document.getElementById('canvas' + boardNumber);
	for (i=1; i<=3; i++) {
		document.getElementById("canvas" + i).setAttribute("class" , "screenBackHidden");
	}
	
	if (animation) {
		document.getElementById("canvas" + selectedBlackboard).setAttribute("class" , "screenBack hide");
		document.getElementById("canvas" + boardNumber).setAttribute("class" , "screenBack show");
	} else {
		document.getElementById("canvas" + selectedBlackboard).setAttribute("class" , "screenBack");
		document.getElementById("canvas" + boardNumber).setAttribute("class" , "screenBack");
	}
	
	// background
	selectedBlackboard = boardNumber;
	if (animation) {
		if (document.getElementById('blackboardImage').className == 'spinHorizontalForwards') {
			document.getElementById('blackboardImage').className ='spinHorizontalBackwards';
		} else {
			document.getElementById('blackboardImage').className ='spinHorizontalForwards';
		}
	}
}

var textInputCheckEnter = function(event) {
	if (event.keyCode == 13) { // Enter pressed
		var textInput = document.getElementById("textInput");
		var contextBack = canvasBack.getContext('2d');
		contextBack.font = "30pt 'Gochi Hand'";
		contextBack.fillStyle = chalkColor;
		var xPos = textInput.offsetLeft + 1;
		var yPos = textInput.offsetTop + 31;
		contextBack.fillText(textInput.value, xPos, yPos); 

		textInput.style.zIndex = "0";
		textInput.style.display = "none";
		
		saveToLocaleStorage();
	}
}

var blackboardDown = function(event) {
	mouseDown = true;
	xDown = getX(event);
	yDown = getY(event);
}

var blackboardUp = function(event) {
	mouseDown = false;
	var contextFront = canvasFront.getContext('2d');
	contextFront.clearRect(0,0,canvasFront.width,canvasFront.height);
	var contextBack = canvasBack.getContext('2d');
	if (drawMode == "ruler") {
		drawLine(contextBack,xDown,yDown,getX(event),getY(event),lineWidth,chalkColor);
	} else if (drawMode == "hand"){
		xLast = -1;
		yLast = -1;
	} else if (drawMode == "circle") {
		var xAbs = Math.abs(xDown-getX(event));
		var yAbs = Math.abs(yDown-getY(event));
		var r = Math.sqrt(Math.pow(yAbs,2) + Math.pow(xAbs,2));
		drawCircle(contextBack,xDown,yDown,r,lineWidth,chalkColor);
	}
	
	saveToLocaleStorage();
}

var blackboardMove = function(event) {
	if (mouseDown) {
		if (drawMode == "ruler") {
			var context = canvasFront.getContext('2d');
			context.clearRect(0,0,canvasFront.width,canvasFront.height);
			drawLine(context,xDown,yDown,getX(event),getY(event),lineWidth,chalkColor);
		} else if (drawMode == "hand") {
			var context = canvasBack.getContext('2d');
			xNow = getX(event);
			yNow = getY(event);
			if (xLast >= 0 && yLast >= 0) {
				drawLine(context,xLast,yLast,xNow,yNow,lineWidth,chalkColor);
			}
			xLast = xNow;
			yLast = yNow;
		} else if (drawMode == "circle") {
			var context = canvasFront.getContext('2d');
			context.clearRect(0,0,canvasFront.width,canvasFront.height);
			var xAbs = Math.abs(xDown-getX(event));
			var yAbs = Math.abs(yDown-getY(event));
			var r = Math.sqrt(Math.pow(yAbs,2) + Math.pow(xAbs,2));
			drawCircle(context,xDown,yDown,r,lineWidth,chalkColor)
		} else if (drawMode == "sponge") {
			var contextFront = canvasFront.getContext('2d');
			contextFront.clearRect(0,0,canvasFront.width,canvasFront.height);
			var img = new Image();
			img.src = 'img/sponge.png';
			var spongeImage = document.getElementById('spongeImage');
			var x1 = getX(event)-(spongeImage.width/2);
			var y1 = getY(event)-(spongeImage.height/2);
			var yDiff = spongeImage.height/6;
			var xDiff = spongeImage.width/6;
			contextFront.drawImage(img,x1,y1,spongeImage.width,spongeImage.height);
			var contextBack = canvasBack.getContext('2d');
			contextBack.clearRect(x1+xDiff/2,y1+yDiff/2,spongeImage.width-xDiff,spongeImage.height-yDiff);
		} else if (drawMode == "text") {
			var textInput = document.getElementById("textInput");
			textInput.style.zIndex = "30";
			textInput.style.display = "block";
			var xNow = getX(event);
			var yNow = getY(event);
			if (yNow + textInput.clientHeight > canvasFront.height) {
				yNow = canvasFront.height - textInput.clientHeight;
			}
			textInput.style.top = yNow + "px";
			textInput.style.left = xNow + "px";
			textInput.style.width = (canvasFront.width - xNow) + "px";
			textInput.focus();
		}
	}
}

var handClick = function(event) {
	drawMode = "hand";
}

var rulerClick = function(event) {
	drawMode = "ruler";
}

var circleClick = function(event) {
	drawMode = "circle";
}

var spongeClick = function(event) {
	drawMode = "sponge";
}

var textClick = function(event) {
	drawMode = "text";
}

var changeColor = function(color) {
	chalkColor = color;
	document.getElementById("textInput").style.color = color;
	localStorage.setItem('blackboardColor', color);
}

function drawLine(con,x1,y1,x2,y2,lineWidth,color) {
	con.strokeStyle = color;
	con.lineWidth = lineWidth;
	con.beginPath();
	con.moveTo(x1,y1);
	con.lineTo(x2,y2);
	con.stroke();
	con.closePath();
}

function drawCircle(con,x,y,r,lineWidth,color) {
	con.beginPath();
	con.arc(x,y,r,0,2*Math.PI,false);
	con.lineWidth = lineWidth;
	con.strokeStyle = color;
	con.stroke();
}

function getX(event) {
	return event.offsetX ? (event.offsetX) : event.pageX-document.getElementById('screen-front').offsetLeft;
}

function getY(event) {
	return event.offsetY ? (event.offsetY) : event.pageY-document.getElementById('screen-front').offsetTop;
}

function initBlackboard() {
	// blackboard
	var canvasElements=new Array();
	for (i=1; i<=3; i++) {
		(function(number) {
			var localStorageImage = new Image();
		    localStorageImage.addEventListener("load", function (event) {
		    	var canvas = document.getElementById('canvas' + number);
		    	var context = canvas.getContext('2d');
		    	context.drawImage(localStorageImage, 0, 0);
		    }, false);
		    localStorageImage.src = localStorage.getItem('blackboard' + number);
		})(i);
	}
    
    // color
    var color = localStorage.getItem('blackboardColor');
    if (color) {
    	chalkColor = color;
    	document.getElementById("textInput").style.color = color;
    }
    
    // menu
    if (localStorage.getItem('blackboardMenu')) {
    	selectedBlackboard = localStorage.getItem('blackboardMenu');
    }
    changeTo(selectedBlackboard, false);
}

function saveToLocaleStorage() {
	for (i=1; i<=3; i++) {
		localStorage.setItem('blackboard' + i, document.getElementById('canvas' + i).toDataURL('image/png'));
	}
}
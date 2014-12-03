var height, width;
var shapes = [];
var stage, layer;
var bg;
var selectedShape;
var isDragging = false;

var isTextMode = false;
var currentTextGroup;

$(document).ready(function() {
	var maxWidth = $('.col-md-12').width() - 20;
	var maxHeight = window.screen.availHeight - 200;	
	$('#rotate').click(function(){

		//swap height and width.
		var temp  = height;
		height = width;
		width = temp;

		stage.setHeight(height);
		stage.setWidth(width);
		bg.setX(newWidth/2);
		bg.setY(newHeight/2)
		bg.rotate(90);
		layer.draw();
	});

	$('#exampleText').change(function(){
		if($(this).val() == ""){
			$(this).parent('.form-group').toggleClass('has-error');
		}
		else{
			$(this).parent('.form-group').toggleClass('has-success');
		}
	});

	$('#addText').bind('click',function(){
		$('#myModal').modal('hide')
		var text = $('#exampleText').val();
		if(text == "")
		{
			return;
		}

		var size = $('#exampleTextSize').val();
		var bgcolor = $('#exampleBgColor').val();
		currentTextGroup = new Kinetic.Group({
			x: 0,
			y: 0
		});			
		var textObj = new Kinetic.Text({
			x: 0,
			y: 0,
			text: text,
			fontSize: size,
			fill: $('#color').val(),
			fillStyle : bgcolor
		});
		if(textObj.getWidth()>(newWidth-100))
			textObj.setWidth(newWidth-100)
		var textRectObj = new Kinetic.Rect({
			x: 0,
			y: 0,
			fill: bgcolor,
			width: textObj.getWidth(),
			height: textObj.getHeight()
		});
		currentTextGroup.add(textRectObj);
		currentTextGroup.add(textObj);

		shapes.push(currentTextGroup);
		layer.add(currentTextGroup);
		layer.draw();
		$('#textOverlay').show();
		isTextMode = true;
	});

	$('#exampleTextSize').bind("change",function(){
		$('#fontSizeDisplayer').html($(this).val()+"px")
	});

	$('#doneText').click(function(){
		$('#textOverlay').hide();
		isTextMode = false;
	});

	$('#undo').click(function() {
		if (shapes.length > 0) {
			var shapeToUndo = shapes[shapes.length - 1];
			shapeToUndo.destroy();
			layer.draw();
			shapes.splice(shapes.length - 1, 1);
		} else {
			alert("cant undo more");
		}
	});

	function loadImage() {
		var imgsrc = getParameterByName("img_src");
		var imageObj = new Image();
		imageObj.onload = function() {
			var height = imageObj.height;
			var width = imageObj.width;

			console.log(width + "x" + height);
			bg = new Kinetic.Image({
				image : imageObj,
				height : height,
				width : width				
			});

			stage = new Kinetic.Stage({
				container : 'container',
				width : width,
				height : height
			});
			layer = new Kinetic.Layer();
			stage.add(layer);
			// add the shape to the layer
			layer.add(bg);
			layer.draw();
			setupEvents();
		};
		imageObj.src = imgsrc;				
	
	};

	$('#save').click(function() {
		var data = [];
		for(i=0;i<shapes.length;i++){
			var shape = {
				shape : shapes[i].className,
				attrs : shapes[i].attrs
			};
			data.push(shape);
		}	
		console.log(data);
	});
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	function Circle(mouseX, mouseY) {

		var circle = new Kinetic.Circle({
			x : mouseX,
			y : mouseY,
			myShape : true,
			radius : 1,
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});
		circle.resize = function(posX, posY) {
			//console.log(this.attrs);
			var dx = posX - this.attrs.x;
			var dy = posY - this.attrs.y;
			var r = Math.sqrt(dx * dx + dy * dy);
			this.setRadius(r);
		};
		shapes.push(circle);
		layer.add(circle);
		layer.draw();

		return circle;
	}

	function Rectangle(mouseX, mouseY) {

		var rect = new Kinetic.Rect({
			x : mouseX,
			y : mouseY,
			width : 1,
			height : 1,
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false,
			startX : mouseX,
			startY : mouseY
		});

		rect.resize = function(posX, posY) {
	        var w = posX - this.attrs.x;
	        var h = posY - this.attrs.y;
	    	this.setWidth(w);
	    	this.setHeight(h);
		};
		shapes.push(rect);
		layer.add(rect);
		layer.draw();

		return rect;
	}

	function Oval(mouseX, mouseY) {

		var oval = new Kinetic.Ellipse({
			x : mouseX,
			y : mouseY,
			radius : {
				x : 1,
				y : 1
			},
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});

		oval.resize = function(posX, posY) {
			var dx = Math.abs(posX - this.attrs.x);
			var dy = Math.abs(posY - this.attrs.y);
			this.setRadiusX(dx);
			this.setRadiusY(dy);
		};
		shapes.push(oval);
		layer.add(oval);
		layer.draw();

		return oval;
	}



	function getDesiredShape(mouseX, mouseY) {
		var shapeToDraw = $("#shape").val();
		switch(shapeToDraw) {
			case "Circle":
				return new Circle(mouseX, mouseY);
				break;
			case "Rectangle":
				return new Rectangle(mouseX, mouseY);
				break;
			case "Oval":
				return new Oval(mouseX, mouseY);
				break;
		}
	}
	function setupEvents() {

		stage.on('mousedown', function(event) {
			var pos = stage.getPointerPosition();
			var mouseX = parseInt(pos.x);
			var mouseY = parseInt(pos.y);
			if(!isTextMode){
				selectedShape = getDesiredShape(mouseX, mouseY);
				isDragging = true;
				isMaking = true;				
			}
			else{
				currentTextGroup.setX(mouseX);
				currentTextGroup.setY(mouseY);
				layer.draw();
			}
		});

		stage.on('mousemove', function(event) {
			var pos = stage.getPointerPosition();
			var posX = parseInt(pos.x);
			var posY = parseInt(pos.y);			
			if (!isDragging) {
				return;
			}
			selectedShape.resize(posX, posY);
			layer.draw();
		});

		stage.on('mouseup', function(event) {
			isDragging = false;
		});
	}
	loadImage();

});

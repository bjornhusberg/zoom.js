
(function (canvas, imageFile) {

var renderWidth = canvas.width;
var renderHeight = canvas.height;
var renderContext = canvas.getContext("2d");
var renderImageData = renderContext.getImageData(0, 0, renderWidth, renderHeight);
var renderBuffer = renderImageData.data;

var sourceBuffer;
var angleTable;
var maxAngles;
var distanceTable
var maxDistance;

var rotation;
var zoom;
var animationStartTime;

initSourceBuffer(function() {
	var angleTable = initAngleTable();
	var distanceTable = initDistanceTable();
	animationStartTime = new Date().getTime();
	animate();
});

function initSourceBuffer(callback) {
	var image = new Image();
	image.crossOrigin="anonymous";
	image.onload = function() {
		var imageCanvas = document.createElement("canvas");
		imageCanvas.width = image.width;
		imageCanvas.height = image.height;
		var imageContext = imageCanvas.getContext("2d");
		imageContext.drawImage(image, 0, 0);
		sourceBuffer = imageContext.getImageData(0, 0, image.width, image.height).data;
		maxAngles = image.width;
		maxDistance = image.height;
		callback();
	}
	image.src = imageFile;
}

function initAngleTable() {
	var buffer = new ArrayBuffer(4*renderWidth*renderHeight);
	angleTable = new Uint32Array(buffer);
	for (var i = 0, y = -Math.floor(renderHeight / 2), maxy = y + renderHeight; y < maxy; y++) {
		for (var x = -Math.floor(renderWidth / 2), maxx = x + renderWidth; x < maxx; x++) {
			angleTable[i++] = Math.floor(maxAngles * ((Math.atan2(x, y) + Math.PI) / (2 * Math.PI)));
		}
	}
}

function initDistanceTable() {
	var buffer = new ArrayBuffer(4*renderWidth*renderHeight);
	distanceTable = new Uint32Array(buffer);
	var halfRenderWidth = Math.floor(renderWidth / 2);
	var halfRenderHeight = Math.floor(renderHeight / 2);
	var maxRadius = Math.sqrt(halfRenderWidth*halfRenderWidth + halfRenderHeight*halfRenderHeight);
	for (var i = 0, y = -halfRenderHeight, maxy = y + renderHeight; y < maxy; y++) {
		for (var x = -halfRenderWidth, maxx = x + renderWidth; x < maxx; x++) {
			var radius = Math.sqrt(x*x + y*y) / maxRadius;
			distanceTable[i++] = Math.floor(Math.pow(1.9, 9 * (1 - radius)));
		}
	}
}

function animate() {
	var timeDiff = new Date().getTime() - animationStartTime;
	rotation = -timeDiff / 15;
	zoom = timeDiff / 6 - 550;
	renderFrame();
	requestAnimationFrame(animate);
}

function renderFrame() {
	for (var i = 0, max = renderWidth*renderHeight; i < max; i++) {
		var distance = Math.floor(distanceTable[i] + zoom) % maxDistance;
		var angle = Math.floor(angleTable[i] + rotation) % maxAngles;
		var j = distance * maxAngles + angle;
		renderBuffer[4*i] = sourceBuffer[4*j];
		renderBuffer[4*i + 1] = sourceBuffer[4*j + 1];
		renderBuffer[4*i + 2] = sourceBuffer[4*j + 2];
		renderBuffer[4*i + 3] = 255;
	}
	renderContext.putImageData(renderImageData, 0, 0);
}

})(document.getElementsByTagName("canvas")[0], "./fractal.jpg");

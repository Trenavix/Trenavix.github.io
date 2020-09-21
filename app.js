var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');
var canvas = document.getElementById('game-surface');
var gl = canvas.getContext('webgl');
var resizeCanvas = function ()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

var framecount = 0;

var InitDemo = function (e) 
{
	AudioProcess();
	canvas.setAttribute("tabindex", 0);
	kd.run(function () { kd.tick(); } );
	canvas.addEventListener("click", function() 
	{
		console.log("AAAAH");
    	//AudioProcess();
	});
	window.addEventListener('resize', resizeCanvas, false);
	var angle_x = 0; var angle_y = 0;
	var spread = 0;
	kd.RIGHT.down(function() {angle_x -= 0.1} );
	kd.LEFT.down(function() {angle_x += 0.1} );
	kd.UP.down(function() {angle_y += 0.1} );
	kd.DOWN.down(function() {angle_y -= 0.1} );
	resizeCanvas();

	if (!gl) 
	{ 
	console.log('WebGL not supported, falling back on experimental-webgl');
	alert('Your browser does not support WebGL'); 
	}

	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	//
	// Create buffer
	//
	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,    1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,     1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,    1.0, 1.0, 1.0,

		// Left
		-1.0, 1.0, 1.0,    1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,   0, 0, 0,
		-1.0, -1.0, -1.0,  0, 0, 0,
		-1.0, 1.0, -1.0,   1.0, 1.0, 1.0,

		// Right
		1.0, 1.0, 1.0,    1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,   0, 0, 0,
		1.0, -1.0, -1.0,  0, 0, 0,
		1.0, 1.0, -1.0,   1.0, 1.0, 1.0,

		// Front
		1.0, 1.0, 1.0,    1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,    0, 0.0, 0,
		-1.0, -1.0, 1.0,    0, 0.0, 0,
		-1.0, 1.0, 1.0,    1.0, 1.0, 1.0,

		// Back
		1.0, 1.0, -1.0,    1.0, 1.0, 1.0,
		1.0, -1.0, -1.0,    0.0, 0, 0,
		-1.0, -1.0, -1.0,    0.0, 0, 0,
		-1.0, 1.0, -1.0,    1.0, 1.0, 1.0,

		// Bottom
		-1.0, -1.0, -1.0,   0, 0, 0,
		-1.0, -1.0, 1.0,    0, 0, 0,
		1.0, -1.0, 1.0,     0, 0, 0,
		1.0, -1.0, -1.0,    0, 0, 0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);
	
	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);
	var yScaleMatrix = new Float32Array(16);
	var yTransMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var setBuffersAndAttributes = function ()
	{
		var boxVertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

		var boxIndexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

		var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
		var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
		gl.vertexAttribPointer
  		(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.vertexAttribPointer
  		(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
	}
	var loop = function () 
	{
		framecount++;
		//if(framecount % 120) console.log(AudioBuffer.toString());
		var red = AudioBuffer/255; //follow audio buffer
		var green = Math.abs(Math.sin(red*3.14)); //inverse audio buffer
		var blue = 1-red;
		for(var i = 0; i < boxVertices.length; i+=6)
		{
			if (boxVertices[i+1] > 0) 
			{
				boxVertices[i+3] = red; //red
				boxVertices[i+4] = green; //green
      		 	boxVertices[i+5] = blue; //blue
      		}
		}
		
    	canvas.clientWidth = window.innerWidth;
    	canvas.clientHeight = window.innerHeight;
    	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		setBuffersAndAttributes();
		angle_x += 0.0004*AudioBuffer;
		//angle_y += 0.0001*AudioBuffer;
		spread = -(AudioBuffer/95.625);
		var scaler = (AudioBuffer/255);
		mat4.rotate(yRotationMatrix, identityMatrix, angle_x, [0, 0, 1]); //x
		mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		mat4.translate(worldMatrix, worldMatrix, [0,spread,0]);
		mat4.scale(worldMatrix, worldMatrix, [scaler,scaler,scaler]);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		setBuffersAndAttributes();
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		mat4.rotate(yRotationMatrix, identityMatrix, angle_x+1.57, [0, 0, 1]); //x
		mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		mat4.translate(worldMatrix, worldMatrix, [0,spread,0]);
		mat4.scale(worldMatrix, worldMatrix, [scaler,scaler,scaler]);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		setBuffersAndAttributes();
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		mat4.rotate(yRotationMatrix, identityMatrix, angle_x+3.14, [0, 0, 1]); //x
		mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		mat4.translate(worldMatrix, worldMatrix, [0,spread,0]);
		mat4.scale(worldMatrix, worldMatrix, [scaler,scaler,scaler]);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		setBuffersAndAttributes();
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		mat4.rotate(yRotationMatrix, identityMatrix, angle_x+4.71, [0, 0, 1]); //x
		mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		mat4.translate(worldMatrix, worldMatrix, [0,spread,0]);
		mat4.scale(worldMatrix, worldMatrix, [scaler,scaler,scaler]);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		
		

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};


var program; //WebGL Program
var currentcolour = new Float32Array(3);
var angleHistory = new Float32Array(256);
var angleHistoryX = new Float32Array(256);
var scalerHistory = new Float32Array(256);
var spreadHistory = new Float32Array(256);
var vertexBufferObject;
var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec4 vertColor;',
'varying vec4 fragColor;',
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
'varying vec4 fragColor;',
'void main()',
'{',
'  gl_FragColor = fragColor;',
'}'
].join('\n');

var generateBuffers = function()
{
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
	gl.cullFace(gl.FRONT);

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

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return program;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return program;
	}

	// Tell OpenGL state machine which program should be active.
    gl.useProgram(program);
}

var rotateMatrices = function(matWorldUniformLocation, worldMatrix, xRotationMatrix, yRotationMatrix, identityMatrix,angle_x, angle_y)
{
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    mat4.rotate(yRotationMatrix, identityMatrix, angle_x+1.57, [0, 0, 1]); //x
    mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
}

//
// Create buffer
//

var boxVertices = 
[ 
    // X, Y, Z           R, G, B, A
	// Top
	-1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,     1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,

	// Left
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,   1, 1, 1, 1.0,
	-1.0, -1.0, -1.0,  1, 1, 1, 1.0,
	-1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,

	// Right
	1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,   1, 1, 1, 1.0,
	1.0, -1.0, -1.0,  1, 1, 1, 1.0,
	1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,

	// Front
	1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,    1, 1.0, 1, 1.0,
	-1.0, -1.0, 1.0,    1, 1.0, 1, 1.0,
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, -1.0,    1.0, 1, 1, 1.0,
	-1.0, -1.0, -1.0,    1.0, 1, 1, 1.0,
	-1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,

	// Bottom
	-1.0, -1.0, -1.0,   1, 1, 1, 1.0,
	-1.0, -1.0, 1.0,    1, 1, 1, 1.0,
	1.0, -1.0, 1.0,     1, 1, 1, 1.0,
	1.0, -1.0, -1.0,    1, 1, 1, 1.0,
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

var faderVertices2 = 
[	//X, Y, Z			R, G, B, A
	0.0, 0.0, 0.0,		1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, 0.0,		0.0, 0.0, 0.0, 1.0,
	-1.0, 1.0, 0.0,		0.0, 0.0, 0.0, 1.0,
	-1.0, -1.0, 0.0,	0.0, 0.0, 0.0, 1.0,
	1.0, -1.0, 0.0,		0.0, 0.0, 0.0, 1.0,
]
var faderIndices2 = 
[
	0, 1, 2, //two upper
	0, 2, 3, //upleft, lowleft
	0, 3, 4, //lowleft, lowright
	0, 4, 1 //lowright, upright
]

var setBuffersAndAttributes = function(vertices, indices)
{
	var vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); //dyanmic so we can modify vertices realtime
	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer
  	(
	    positionAttribLocation, // Attribute location
	    3, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer
  	(
	    colorAttribLocation, // Attribute location
	    4, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
}

var bindBufferSubData = function()
{
	vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferSubData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), boxVertexBufferObject)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer
  	(
	    colorAttribLocation, // Attribute location
	    4, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(colorAttribLocation);
}
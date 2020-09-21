var canvas = document.getElementById('game-surface');
var gl = canvas.getContext('webgl');
var framecount = 0;
var InitDemo = function (e) 
{
	//AudioProcess();
	canvas.setAttribute("tabindex", 0);
	kd.run(function () { kd.tick(); } );
	canvas.addEventListener("click", function() 
	{
		//do stuff by clicking on canvas
		AudioProcess();
	});
	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
	var angle_x = 0; var angle_y = 0;
	var spread = 0;
	kd.RIGHT.down(function() {angle_x -= 0.1} );
	kd.LEFT.down(function() {angle_x += 0.1} );
	kd.UP.down(function() {angle_y += 0.1} );
	kd.DOWN.down(function() {angle_y -= 0.1} );

	generateBuffers();
	
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

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	
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
		var gsBackColour = avgFreq/32;
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		angle_x += 0.0003*AudioBuffer;
		//angle_y += 0.0001*AudioBuffer;
		spread = -(AudioBuffer/175);
		var scaler = (AudioBuffer/510);
		var backwardTranslation = 0;
		setBuffersAndAttributes();
		for(var i=0; i< angleHistory.length; i+=8)
		{
			var currentScale = scalerHistory[i];
			var currentSpread = spreadHistory[i]-i*1.5/8;
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
			mat4.rotate(yRotationMatrix, identityMatrix, angleHistory[i], [0, 0, 1]); //x
			mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
			mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
			mat4.translate(worldMatrix, worldMatrix, [0,currentSpread,backwardTranslation]);
			mat4.scale(worldMatrix, worldMatrix, [currentScale,currentScale,scalerHistory[i]]);
			gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
			mat4.rotate(yRotationMatrix, identityMatrix, angleHistory[i]+1.57, [0, 0, 1]); //x
			mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
			mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
			mat4.translate(worldMatrix, worldMatrix, [0,currentSpread,backwardTranslation]);
			mat4.scale(worldMatrix, worldMatrix, [currentScale,currentScale,scalerHistory[i]]);
			gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
			mat4.rotate(yRotationMatrix, identityMatrix, angleHistory[i]+3.14, [0, 0, 1]); //x
			mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
			mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
			mat4.translate(worldMatrix, worldMatrix, [0,currentSpread,backwardTranslation]);
			mat4.scale(worldMatrix, worldMatrix, [currentScale,currentScale,scalerHistory[i]]);
			gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
			mat4.rotate(yRotationMatrix, identityMatrix, angleHistory[i]+4.71, [0, 0, 1]); //x
			mat4.rotate(xRotationMatrix, identityMatrix, angle_y, [1, 0, 0]); //y
			mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
			mat4.translate(worldMatrix, worldMatrix, [0,currentSpread,backwardTranslation]);
			mat4.scale(worldMatrix, worldMatrix, [currentScale,currentScale,scalerHistory[i]]);
			gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
			backwardTranslation+=3.5;
		}
		
		addEntryToFrontOfArray(angleHistory, angle_x);
		addEntryToFrontOfArray(scalerHistory, scaler);
		addEntryToFrontOfArray(spreadHistory, spread);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};


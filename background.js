var canvas = document.getElementById("canvas");
gl = canvas.getContext("webgl");
var framecount = 0;

//set up global variables
var xRotationMatrix = new Float32Array(16);
var yRotationMatrix = new Float32Array(16);
var zRotationMatrix = new Float32Array(16);
var translationMatrix = new Float32Array(16);
var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var identityMatrix = new Float32Array(16);
var matWorldUniformLocation;
var matViewUniformLocation;
var matProjUniformLocation;
var camPosition = [0.0,0.0,-8.0];
var camRotation = [-4.725,0.0,0.0]; //start looking backward (-1.5*pi)
var matrixStack = new MatrixStack();

const BGColourArray = 
[
    new Float32Array([0.0, 0.3, 1.0, 1.0]),
    new Float32Array([1.7, 1.3, 0.4, 1.0]),
    new Float32Array([0.0, 0.8, 0.7, 1.0]),
    new Float32Array([0.5, 0.0, 0.7, 1.0]),
    new Float32Array([0.5, 1.0, 0.5, 1.0])
];

var background = function(e)
{
    console.log("loading bg");
    window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
    generateBuffers();
	
	//Worldview initialisation
	matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
	mat4.identity(worldMatrix);

    //camera setup
	var lookat;  //vec3 lookat
	var addedPos; //Output position for adding to lookAt
    lookat =  //vec3 lookat pos relative to camRotation
    [
        Math.cos(camRotation[0]) * Math.cos(camRotation[1]),
        Math.sin(camRotation[1]),
        Math.sin(camRotation[0]) * Math.cos(camRotation[1])
    ];
    addedPos = [0,0,0]; //ouput variable for vector addition
    addedPos = vec3.add(addedPos, lookat, camPosition); //add cam position to the lookat offset
    mat4.lookAt(viewMatrix, camPosition, addedPos, [0,1,0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	mat4.identity(identityMatrix);

    //blending setup
    gl = canvas.getContext("webgl", { alpha: true });
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Create array of particles & their destinations
    var particleArray = new Array(256);
    var length = 10;
    var dif = [0,0,0]; //init slave variable for later usage in vector subtraction

    //Random param generating functions
    var returnRandomColour = function (alphaValue) 
    { 
        return new Float32Array([Math.random(), Math.random(), Math.random(), alphaValue]); 
    }
    var returnRandomScale = function() 
    { 
        var s = 0.03+0.08*Math.random(); 
        return [s, s, 1]; 
    }

    //Create main list of particles
    for(let i=0; i< particleArray.length; i++) 
    { 
        particleArray[i] = createParticle([0,0,2], returnRandomDestination(length), 0.0001+(0.004*Math.random()), returnRandomScale(), returnRandomColour(0));  //+2 on z axis, 0.01 LERP, 0.4 scale
        particleArray[i].position[2] = particleArray[i].scale[0]*0.2; //vary slight on z so particles can stack
        vec3.lerp(particleArray[i].position, particleArray[i].position, particleArray[i].destination, Math.random()); //Set initial position to random point in trajectory
    }

    //background verts
    console.log(BGColourArray.length);
    var BasisBGcolour = new Float32Array([0,0,0, 1]);
    var BasisBGcolourHighlight = BGColourArray[Math.round(Math.random()*(BGColourArray.length-1))];
    var TargetBGcolour = new Float32Array([0,0,0, 1]);
    var TargetBGcolourHighlight = BGColourArray[Math.round(Math.random()*(BGColourArray.length-1))];
    var setBGColours = function(BGColour, BGColourHighlight)
    {
        for(let i=3; i<faderVertices.length; i+=7)
        { 
            if(faderVertices[i-2] != 0) //if y is not 0
            {
                for(let j = 0; j<4; j++) faderVertices[i+j] = BGColour[j];
            } 
            else for(let j = 0; j<4; j++) faderVertices[i+j] = BGColourHighlight[j];

        }
    }
    setBGColours(BasisBGcolour, BasisBGcolourHighlight);
    //init master starting with BG data
    var masterVtxList = [...faderVertices]; 
    var masterIdxList = [...faderIndices];

    //Iterate through all particles and add them to the master Vtx/Idx array
    for(let i = 0; i< particleArray.length; i++)
    {
        for(let j=3; j<faderVertices.length; j+=7)
        { 
            if(faderVertices[j-2] != 0) //y
            {
                //Set colours in verts to particle's colours
                for(let k=0; k<4; k++) faderVertices[j+k] = particleArray[i].colour[k]; 
            } 
        }
        //add every SINGLE particle's data to master
        addToMasterVtxList(masterVtxList, masterIdxList, faderVertices, faderIndices);
    }
    var idxCount = faderIndices.length;
    var idxByteCount = Uint16Array.BYTES_PER_ELEMENT * faderIndices.length;
    
    //Bind GL buffers to master arrays
    setBuffersAndAttributes(masterVtxList, masterIdxList);

	//
	// Main render loop
    //

    var loop = function () 
    {
        setBuffersAndAttributes(masterVtxList, masterIdxList);
        framecount++;

        //Set up headers, stacks, presets
        matrixStack = new MatrixStack();
        //Adjust canvas to window height/width
        resizeCanvas();

        //make rendercam a nested callable function
        var rendercam = function()
        {    
        mat4.lookAt(viewMatrix, camPosition, addedPos, [0,1,0]);
	    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        }

        //Clear color/depth buffer
    	gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(1, 1, 1, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT, gl.COLOR_BUFFER_BIT);

        //Actual large background render
        BasisBGcolourHighlight = vec4.lerp(BasisBGcolourHighlight, BasisBGcolourHighlight, TargetBGcolourHighlight, 0.003);
        //setBGColours(BasisBGcolour, BasisBGcolourHighlight);
        gl.bufferSubData(gl.ARRAY_BUFFER, 3* Float32Array.BYTES_PER_ELEMENT, BasisBGcolourHighlight);
        gl.disable(gl.BLEND); //Disable blending so background holds full opacity
        matrixStack.save();
        matrixStack.scale([15,8,3]);
        matrixStack.translate([0,0,3]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
        gl.drawElements(gl.TRIANGLES, idxCount, gl.UNSIGNED_SHORT, 0); //draw main BG, 12 indices = 4 triangles
        matrixStack.restore();

        rotatem4([0, 0, framecount/4000], matrixStack); //rotate all particles from centre of screen
        //Particle rendering routine
        gl.enable(gl.BLEND);
        for(let i = 0; i< particleArray.length; i++)
        {
            //Linear interpolation path based from current position
            vec3.lerp(particleArray[i].position, particleArray[i].position, particleArray[i].destination, particleArray[i].speedMult);
            matrixStack.save(); //Push mtx
            matrixStack.translate(particleArray[i].position);
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
            rotatem4([0, 0, framecount/20], matrixStack);
            matrixStack.scale(particleArray[i].scale);
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
            rendercam();
            gl.drawElements(gl.TRIANGLES, idxCount, gl.UNSIGNED_SHORT, (i+1)*idxByteCount); //draw each set of 12 indices past first set which is the BG
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
            dif = vec3.subtract(dif, particleArray[i].destination, particleArray[i].position);
            if(vec3.length(dif) < 0.2) 
            {
                particleArray[i] = createParticle([0,0,2], returnRandomDestination(length), 0.0001+(0.004*Math.random()), returnRandomScale(), [0,0,0]);  //Reset particle when it reaches the edge
                particleArray[i].position[2] = particleArray[i].scale[0]*0.2; //vary slight on z so particles can stack
            }
            matrixStack.restore(); //reset Mtx stack
        }
        dif = vec4.subtract(dif, BasisBGcolourHighlight, TargetBGcolourHighlight);
        if (vec4.length(dif) < 0.1)
        {
            TargetBGcolourHighlight = BGColourArray[Math.round(Math.random()*(BGColourArray.length-1))];
        }
        
        //end main loop
        requestAnimationFrame(loop);        
    }
    requestAnimationFrame(loop);
}
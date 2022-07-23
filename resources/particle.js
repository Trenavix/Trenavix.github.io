var faderVertices = 
[	//X, Y, Z			R, G, B, A
	0.0, 0.0, 0.0,		1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, 0.0,		1.0, 1.0, 1.0, 0.0,
	-1.0, 1.0, 0.0,		1.0, 1.0, 1.0, 0.0,
	-1.0, -1.0, 0.0,	1.0, 1.0, 1.0, 0.0,
	1.0, -1.0, 0.0,		1.0, 1.0, 1.0, 0.0,
]
var faderIndices = 
[
	0, 1, 2, //two upper
	0, 2, 3, //upleft, lowleft
	0, 3, 4, //lowleft, lowright
	0, 4, 1 //lowright, upright
]

var returnRandomDestination = function(length)
{
        
    var x, y; 
    var angle = 2*3.14*Math.random(); //random portion of 2pi
    x = length*Math.cos(angle);
    y = length*Math.sin(angle);

    return [x, y, 2]; //keep z @ 2 to stay away from camera
}

var createParticle = function(initialPos, destination, speedMult, scale, colour)
{
    var newParticle = Object.create(particle);
    newParticle.position = initialPos;
    newParticle.destination = destination;
    newParticle.speedMult = speedMult;
    newParticle.scale = scale;
    newParticle.colour = colour;
    return newParticle;
}

const particle = 
{
    position: [0.0, 0.0, 0.0],
    scale: [0.0, 0.0, 0.0],
    rotation: [0.0, 0.0, 0.0],
    destination: [0.0, 0.0, 0.0],
    colour: [1.0,1.0,1.0,1.0],
    speedMult: 0
};


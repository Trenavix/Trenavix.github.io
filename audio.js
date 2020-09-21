var AudioBuffer = 0;
var AudioBufferArray = new Array(256);
var AudioBufferThirds = new Array(3);
var AudioProcess = function () 
{
  console.log("AudioProcess is a go");
  var audio = new Audio("dreamstate_logic.mp3");
    audio.load();
    audio.play();
	var context = new AudioContext(audio);
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    var x = 0;

    function renderFrame() 
  	{
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);
      var total = 0;
      var thirds = bufferLength/3;
      AudioBufferThirds = new Float32Array(3);
      for (var i = 0; i < bufferLength; i++) 
      {
		  AudioBufferArray[i] = dataArray[i];
          total += dataArray[i];
          if(i < thirds) {AudioBufferThirds[0] += dataArray[i];}
          else if(i < thirds*2) {AudioBufferThirds[1] += dataArray[i];}
          else {AudioBufferThirds[2] += dataArray[i];}
      }
      for(var i = 0; i < AudioBufferThirds.length; i++) AudioBufferThirds[i] /= thirds;
	  AudioBuffer = total/dataArray.length; //average decibel across ALL frequencies
	  AudioBuffer *= 1.8; //Expiramental: Multiplier for greater differences
	  if (AudioBuffer > 255) AudioBuffer = 255;
    }
    audio.play();
    renderFrame();
}
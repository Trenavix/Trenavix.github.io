var AudioBuffer = 0;
var AudioBufferArray = new Array(256);

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
      for (var i = 0; i < bufferLength; i++) 
      {
		  AudioBufferArray = dataArray[i];
		  total += dataArray[i];
	  }
	  AudioBuffer = total/dataArray.length; //average decibel across ALL frequencies
	  AudioBuffer *= 1.8;
	  if (AudioBuffer > 255) AudioBuffer = 255;
    }
    audio.play();
    renderFrame();
}
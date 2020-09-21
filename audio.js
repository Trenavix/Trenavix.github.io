var AudioBuffer = 0;
var maxFreqRange = 0;
var avgFreq = 0;
var AudioBufferArray = new Array(256);
var AudioBufferThirds = new Array(3);
var mp3s = ["dreamstate_logic.mp3", "anotherMediumRemix.mp3", "darklord.mp3"];
var currentMP3 = 1;
var currentAudio = new Audio(mp3s[currentMP3]);
var AudioProcess = function () 
{
  currentAudio.pause();
  console.log("AudioProcess is a go");
  currentMP3++;
  if(currentMP3 >= mp3s.length) currentMP3 = 0;
  currentAudio = new Audio(mp3s[currentMP3]);
  currentAudio.load();
  currentAudio.play();
	var context = new AudioContext(currentAudio);
  var src = context.createMediaElementSource(currentAudio);
  var analyser = context.createAnalyser();

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;

    var dbArray = new Uint8Array(bufferLength);

    var x = 0;

    function renderFrame() 
  	{
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dbArray);
      var total = 0;
      var thirds = bufferLength/3;
      var maxLevelDB = 0;
      avgFreq = 0;
      AudioBufferThirds = new Float32Array(3);
      var freqArray = new Float32Array(256);
      for (var i = 0; i< bufferLength; i++)
      {
        freqArray[dbArray[i]] = i; //Frequency array INDEX = DB, its VALUE = freq
      }
      for (var i = 0; i< bufferLength; i++)
      {
        avgFreq += freqArray[i]; //total all freq values
      }
      avgFreq /= bufferLength; //average
      for (var i = 0; i < bufferLength; i++) 
      {
		  AudioBufferArray[i] = dbArray[i];
          total += dbArray[i];
          if(dbArray[i] > maxLevelDB) {maxLevelDBIdx = dbArray[i]; maxFreqRange = i;}
          if(i < thirds) {AudioBufferThirds[0] += dbArray[i];}
          else if(i < thirds*2) {AudioBufferThirds[1] += dbArray[i];}
          else {AudioBufferThirds[2] += dbArray[i];}
      }
      console.log(maxLevelDB.toString());
      for(var i = 0; i < AudioBufferThirds.length; i++) AudioBufferThirds[i] /= thirds;
	  AudioBuffer = total/dbArray.length; //average decibel across ALL frequencies
	  AudioBuffer *= 1.8; //Expiramental: Multiplier for greater differences
    if (AudioBuffer > 255) AudioBuffer = 255;
    }
    currentAudio.play();
    renderFrame();
}
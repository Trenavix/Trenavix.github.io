function calculateNewKey() 
{
    var key = Number(document.getElementById("sampleKey").value);
    if (key > 127) key=127; else if (key <0) key=0;
    document.getElementById("sampleKey").value = key.toString(); //reset GUI value to max/min value

    var sampleRate = Number(document.getElementById("sampleRate").value);
    if (sampleRate > 48000) sampleRate = 48000; else if (sampleRate < 8000) sampleRate = 8000;
    document.getElementById("sampleRate").value = sampleRate.toString(); //reset GUI value to max/min value
    
    var targetRate = Number(document.getElementById("targetRate").value);
    if (targetRate > 48000) targetRate = 48000; else if (targetRate < 8000) targetRate = 8000;
    document.getElementById("targetRate").value = targetRate.toString(); //reset GUI value to max/min value

    var keyDifference = (12.0 * Math.log10(targetRate / (sampleRate/4.0))) / Math.log10(2);
    keyDifference -= 24.0;
    key += keyDifference;
    var newRate = Math.pow(2, ((60.0 - key) / 12.0));
    newRate *= targetRate;
    document.getElementById("newKey").value = key.toString();
    document.getElementById("newRate").value = Math.round(newRate).toString();
}

function calculateNewRate() 
{ 
    var key = Number(document.getElementById("sampleKey2").value);
    if (key > 127) key=127; else if (key <0) key=0;
    document.getElementById("sampleKey2").value = key.toString(); //reset GUI value to max/min value

    var sampleRate = Number(document.getElementById("sampleRate2").value);
    if (sampleRate > 48000) sampleRate = 48000; else if (sampleRate < 8000) sampleRate = 8000;
    document.getElementById("sampleRate2").value = sampleRate.toString(); //reset GUI value to max/min value

    var targetKey = Number(document.getElementById("targetKey2").value);
    if (targetKey > 127) targetKey=127; else if (targetKey <0) targetKey=0;
    document.getElementById("targetKey2").value = targetKey.toString(); //reset GUI value to max/min value

    var deltaKey = targetKey - key;
    var newRate = sampleRate * Math.pow(2, (deltaKey/12.0)); //12 semitones in octave
    document.getElementById("newRate2").value = Math.round(newRate).toString();
}
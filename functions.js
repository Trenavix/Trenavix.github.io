var resizeCanvas = function ()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

var addEntryToFrontOfArray = function(array, newValue)
{
    for(var i = array.length-1; i>=0; i--)
    {
        array[i] = array[i-1];
    }
    array[0] = newValue;
}

var nRotationDownX = 0;
var nRotationDownY = 0;
var nCenterX = 0;
var nCenterY = 0

var nTranslateX = 292.5;
var nTranslateY = 145.5

var nCenterOfShapeX = 0;
var nCenterOfShapeY = 0

var nRotation = 0;

var bRotateMouseDown = false;
var angle1;
var nRotationWhenDown = 0;


function VertexMouseOver(event)
{
    event.target.style.opacity = 1;
}

function VertexMouseOut(event)
{
    event.target.style.opacity = 0;
}

function ShapeUp(event)
{
    MouseUp(event);
}

function ShapeCircleDown(event)
{
    RotateShapeDown(event);
}

RotateShapeDown = function(event)
{
    bRotateMouseDown = true;
    nRotationDownX = event.pageX;
    nRotationDownY = event.pageY;
    
    if((nTranslateX + this.nCenterX) != nRotationDownX)
	{
        angle1 = ((nTranslateY + this.nCenterY) - nRotationDownY) / ((nTranslateX + this.nCenterX) - nRotationDownX)
    }
    else
    {
        angle1 = 0;
    }
}

RotateShape = function(event)
{

  if(bRotateMouseDown)
  {
  
    var nX = event.pageX ;
    var nY = event.pageY ;
    
    
    var nAngle 
    if((nTranslateX + this.nCenterX) != nX)
	{
	    angle2 = ((nTranslateY + this.nCenterY) - nY) / ((nTranslateX + this.nCenterX) - nX);
	    nAngle = (angle1 - angle2)/(1 + angle1 * angle2);
        nAngle = -1 * Math.atan(nAngle) * 180 / Math.PI;
        DebugText(nAngle + " if")
    }
    else
    {
        nAngle = 90;
    }
     
    nRotation = nRotationWhenDown + nAngle;
    nRotation = nRotation % 360;
    //DebugText(angle1 + " nAngle " + angle2 + " - " + nAngle)
    //nTemp = angle1;
    DebugText(nRotation + " nAngle ")
    //DebugText(nRotation)
    var oGroup = document.getElementById("SmallRect")
    
    
    oGroup.setAttribute("transform", "translate("+nTranslateX+","+nTranslateY+") rotate("+nRotation+"," + (nCenterX) + "," + (nCenterY) + ")");
    
  }
}

RotateShapeUp = function(event)
{

    bRotateMouseDown = false;
}

function ShapeCircleUp(event)
{

    RotateShapeUp(event);
}

function DebugText(strDebug)
{
    var oDebug = document.getElementById("Debug");
    oDebug.value += strDebug + " \r ";

}

function Clear(event)
{
    var oDebug = document.getElementById("Debug");
    oDebug.value = "";

}

function StageMouseMove(event)
{
    ShapeCircleMoved(event);
}

function ShapeCircleMoved(event)
{
    RotateShape(event);
    ShapeMoved(event)
}



var bMouseDown = false;



MouseDown = function(event)
{
    //alert("asdas")
    bMouseDown = true;
    //alert(oGroup.getAttribute("transform"))
}

MouseMove = function(event)
{
    
  if(bMouseDown)
  {
       var oGroup = document.getElementById("SmallRect");
       //oGroup.setAttribute("transform", "translate("+(event.pageX - nCenterX)+","+(event.pageY - nCenterY)+")rotate("+nRotation+"," + (nCenterX) + "," + (nCenterY) + ")")
       
       nTranslateX = (event.pageX - nCenterX);
       //alert(nTranslateY + " ---------111")
	    nTranslateY = (event.pageY - nCenterY);
	    
	    nCenterOfShapeX = this.nTranslateX + (this.nCenterX);
        nCenterOfShapeY = this.nTranslateY + (this.nCenterY);
	    
	    DebugText(oGroup.getAttribute("transform"))
        
  }
}

MouseUp = function(event)
{
    bMouseDown = false;
}


function ShapeDown(event)
{
    MouseDown(event);
}

function ShapeMoved(event)
{
    MouseMove(event);
}

function ShapeUp(event)
{
    MouseUp(event);
}

function Click(event)
{
    //alert(event.pageX + " -- " + event.pageY)
}   
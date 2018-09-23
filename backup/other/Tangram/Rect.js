function Shape()
{

}
var oShape
Shape.prototype.CreateShape = function(strShape, oAttributes)
{
    oShape = document.createElementNS('http://www.w3.org/2000/svg', strShape);
    
    for(var oItem in oAttributes)
    {
        oShape.setAttribute(oAttributes[oItem].Name, oAttributes[oItem].Value);
    }
    oShape.addEventListener("mousedown", MouseDown,false);
    oShape.addEventListener("mousemove", MouseMove,false);
    oShape.addEventListener("mouseup", MouseUp,false);
    return oShape;
}
var bMouseDown = false;
function MouseDown(e)
{
    bMouseDown = true;
}

function MouseMove(event)
{
  if(bMouseDown)
  {
        //document.getElementById("rect").setAttribute(
        event.target.setAttribute("cx", event.pageX);
        
        event.target.setAttribute("cy", event.pageY);
  }
}

function MouseUp(event)
{
    //alert(oShape.getAttribute("cx") - 100)
    bMouseDown = false;
}
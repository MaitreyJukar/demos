function Shape()
{

}
Shape.prototype.oShape
Shape.prototype.bMouseDown = false;
Shape.prototype.bRotateMouseDown = false;
Shape.prototype.oGroup;

Shape.prototype.oGroupTemp;
Shape.prototype.nRotation = 0;

Shape.prototype.nTranslateX = 0;
Shape.prototype.nTranslateY = 0;

Shape.prototype.nShapeTranslateX = 0;
Shape.prototype.nShapeTranslateY = 0;

Shape.prototype.nRotationDownX = 0;
Shape.prototype.nRotationDownY = 0;

Shape.prototype.nRotationWhenDown = 0;

Shape.prototype.angle1;
Shape.prototype.m_nPoints;
Shape.prototype.m_tempVertex;
Shape.prototype.m_vertex;
Shape.prototype.m_mcVertex;
Shape.prototype.m_bFlip = false;
Shape.prototype.m_CapturePoint;
Shape.prototype.m_color
Shape.prototype.Shape1 = function(depth, color, arrPoints, strGrpId, nType)
{
    var oPoint = new Point();
    
    this.m_CapturePoint = oPoint.Point1(0, 0);
    
    this.m_nPoints = arrPoints.length / 2;
    
    var m_iDepth = depth;
    var m_alpha = 100;
    this.m_vertex = new Array(this.m_nPoints);
    this.m_mcVertex = new Array(this.m_nPoints);
    this.m_tempVertex = new Array(this.m_nPoints);
    
    this.m_color = color;
    
    var i = 0;
    var j = 0;
    
    while (i < arrPoints.length)
    {
		var nX = arrPoints[i];//eval("x" + (i + 1));
		++i;
		var nY = arrPoints[i];//eval("y" + (i + 1));
		
		//DebugText(nX + " nX " + nY)
		var oPointver = new Point();
		
        this.m_vertex[j] = oPointver.Point1(nX, nY);
        
        var oPointtempVer = new Point();
        oPointtempVer.name = strGrpId + j;
        this.m_tempVertex[j] = oPointtempVer.Point1(nX, nY);
        
        //DebugText(this.m_tempVertex[j].x+ " this.m_nPoints " + this.m_tempVertex[j].y + " vertexNo " + oPointtempVer.name)
        ++j;
        ++i;
    } // end while
    
    var centerX = 0;
    var centerY = 0;
     
    if (this.m_nPoints <= 4)
    {
        i = 0;
        while (i < this.m_nPoints)
        {
            centerX = centerX + this.m_vertex[i].x;
            centerY = centerY + this.m_vertex[i].y;
            ++i;
        } // end while
        centerX = centerX / this.m_nPoints;
        centerY = centerY / this.m_nPoints;
    } // end if
    
    var ocenter = new Point();
    ocenter.Point1(0,0);
    
    i = 0;
    var strPoints = "";
    
    var nStartX = 0;
    var nStartY = 0;
    
    var nEndX = 0;
    var nEndY = 0;
    
    var nCenterX = 0;
    var nCenterY = 0;
    
    if(nType == 1)
    {
        nCenterX = (nStartX + nStartX + nEndX) / 3;//(nEndX / 2) + nStartX;
        nCenterY = (nStartY + nStartY + nEndY) / 3;//(nEndY /2) + nStartY;
    }
    else
    {
        nCenterX = (nEndX+ nStartX) / 2 ;
        nCenterY = (nEndY + nStartY) /2;
    }
   
    while (i < this.m_nPoints)
    {
        
        this.m_vertex[i].x = this.m_vertex[i].x - centerX;
        this.m_vertex[i].y = this.m_vertex[i].y - centerY;
        
        //DebugText(this.m_vertex[i].x + " centerX " + this.m_vertex[i].y)
        
        if(i == 0)
        {
            nStartY = this.m_vertex[i].y;
            nStartX = this.m_vertex[i].x;
        }
        if(this.m_vertex[i].y < nStartY)
        {
            nStartY = this.m_vertex[i].y;
        }
        if(this.m_vertex[i].x < nStartX)
        {
            nStartX = this.m_vertex[i].x;
            
        }
        if(this.m_vertex[i].x > nEndX)
        {
            nEndX = this.m_vertex[i].x;
        }
        if(this.m_vertex[i].y > nEndY)
        {
            nEndY = this.m_vertex[i].y;
        }
        
        strPoints += this.m_vertex[i].x + "," + this.m_vertex[i].y + " ";
        
        ++i;
    } // end while
    
    this.CreateGroup(strGrpId);
    
    document.getElementById("Parent").appendChild(this.oGroup);
    this.oGroupTemp = document.getElementById(strGrpId)
    
    this.oShape = CreatePolygon(strPoints, color, strGrpId);
    
    this.nShapeTranslateX = -nCenterX;
    this.nShapeTranslateY = -nCenterY;
    if(nType != undefined)
    {
        this.oShape.setAttribute("transform", "translate("+(-nCenterX)+","+(-nCenterY)+")");
    }
    
    this.oGroup.appendChild(this.oShape);
    for(i = 0 ; i < this.m_nPoints ; ++i)
    {
        if(nType != undefined)
        {
            //this.m_mcVertex[i].setAttribute("transform", "translate("+(-nCenterX)+","+(-nCenterY)+")");
        }
    }
    this.DrawVertex(strGrpId);
    
} // End of the function


Shape.prototype.DrawVertex = function(strGrpId)
    {
       
        for(var i = 0 ; i < this.m_nPoints ; ++i)
        {
            this.m_mcVertex[i] = CreateVertex(this.m_vertex[i].x, this.m_vertex[i].y, strGrpId);
            this.oGroup.appendChild(this.m_mcVertex[i]);
            //this.m_mcVertex[i]._x = this.m_vertex[i].x;
            //this.m_mcVertex[i]._y = this.m_vertex[i].y;
        }
    }

Shape.prototype.Flip = function(event)
{
    if(!this.m_bFlip)
    {
        this.oShape.setAttribute("transform", "translate("+this.nShapeTranslateX+","+this.nShapeTranslateY+") scale(1,-1)");
        this.m_bFlip = true;
    }
    else
    {
        this.oShape.setAttribute("transform", "translate("+this.nShapeTranslateX+","+this.nShapeTranslateY+") scale(1,1)");
        this.m_bFlip = false;
    }
    
    for(i = 0 ; i < this.m_nPoints ; ++i)
    {
        //alert(this.m_mcVertex[i])
        this.m_vertex[i].y = -1 * this.m_vertex[i].y;
        this.m_mcVertex[i].setAttribute("cx", this.m_vertex[i].x);
        this.m_mcVertex[i].setAttribute("cy", this.m_vertex[i].y);
    }
    
    //alert(this.nRotation)
    //this.oGroup.setAttribute('transform', 'scale(1, -1)');
}

Shape.prototype.CreateGroup = function(strGrpId)
{
    this.oGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.oGroup.setAttribute('id', strGrpId);
    this.oGroup.setAttribute('name', strGrpId);
    //this.oGroup.setAttribute('onmousedown', 'MouseDown(event)');
    
    //this.oGroup.setAttribute('transform', 'translate(125 -125) rotate(60)');
    
}

Shape.prototype.MouseDown = function(event)
{
    var touch = event;
    if(event.touches != undefined)
    {
        touch = event.touches[0];
    }
    //alert("asdas")
    this.bMouseDown = true;
    
    //m_CapturePoint.x = _root._xmouse - GetCenterPoint().x;
	//m_CapturePoint.y = _root._ymouse - GetCenterPoint().y;
    this.m_CapturePoint.x = touch.pageX - this.GetCenterPoint().x;
    this.m_CapturePoint.y = touch.pageY - this.GetCenterPoint().y;
    //alert(this.oGroup.getAttribute("transform"))
}

Shape.prototype.MouseMove = function(event)
{
    var touch = event;
    if(event.touches != undefined)
    {
        touch = event.touches[0];
    }
  if(this.bMouseDown)
  {
        var strScale = "";
        /*if(this.m_bFlip)
        {
            strScale = "scale(1,-1)";
        }*/
        //alert(this.m_bFlip)
        
        var x = Math.round(touch.pageX - this.m_CapturePoint.x);
		var y = Math.round(touch.pageY - this.m_CapturePoint.y);
		//Move(x,y);
        //
		for (var i = 0; i < this.m_nPoints; i++)
		{
			//trace("666666666")
			var point = this.GetPoint(i);

			if (point.x < gc_xmin)
			{

				x += gc_xmin - point.x;
			}
			else if (point.x > gc_xmax)
			{
				x -= point.x - gc_xmax;
			}
			if (point.y < gc_ymin)
			{
				y += gc_ymin - point.y;
			}
			else if (point.y > gc_ymax)
			{
				y -= point.y - gc_ymax;
			}
			this.nTranslateX = x;
			this.nTranslateY = y;
			
			
		}
        this.oGroup.setAttribute("transform", "translate("+(this.nTranslateX)+","+(this.nTranslateY)+")rotate("+this.nRotation+")");
       
       
       //this.nTranslateX = (event.pageX);
       //alert(this.nTranslateY + " ---------111")
	    //this.nTranslateY = (event.pageY);
        
        Snap(this);
  }
}

Shape.prototype.GetP = function()
{
    for (var i = 0; i < this.m_nPoints; i++)
    {
    //DebugText("7777777")
        this.GetPoint(i);
    }
}

Shape.prototype.MouseUp = function(event)
{
    this.bMouseDown = false;
}

Shape.prototype.RotateShapeDown = function(event)
{
    this.bRotateMouseDown = true;
    var touch = event;
    if(event.touches != undefined)
    {
        touch = event.touches[0];
    }
    this.nRotationDownX = touch.pageX;
    this.nRotationDownY = touch.pageY;
}

Shape.prototype.RotateShape = function(event)
{
    var touch = event;
    if(event.touches != undefined)
    {
        touch = event.touches[0];
    }
    
    if(this.bRotateMouseDown)
    {
	    var angle1 = 0;
        
	    if ((this.nTranslateX - this.nRotationDownX) == 0)
	    {

		    angle1 = 90;
	    }
	    else
	    {
		    angle1 = (Math.atan((this.nTranslateY - this.nRotationDownY) / (this.nTranslateX - this.nRotationDownX)) * 180) / Math.PI;
	    }
    	
	    var angle2 = 0;
	    if((touch.pageX - this.nTranslateX) == 0)
	    {
		    if (touch.pageY < this.nTranslateY)
		    {
			    angle2 = 90;
		    }
		    else
		    {
			    angle2 = -90;
		    }
	    }
	    else
	    {
		    angle2 = (Math.atan((this.nTranslateY - touch.pageY) / (this.nTranslateX - touch.pageX)) * 180) / Math.PI;
	    }
    	
	    var nShapeRotation = this.nRotation;
	    if((touch.pageX <= this.nTranslateX && this.nRotationDownX <= this.nTranslateX) || (touch.pageX > this.nTranslateX && this.nRotationDownX > this.nTranslateX))
	    {
		    nShapeRotation = this.nRotation - (angle1 - angle2);
	    }
	    else
	    {
    	    
		    nShapeRotation = this.nRotation + 180 - (angle1 - angle2);
		    //trace(angle1 + " -- " + angle2);
	    }
	    
	    this.nRotationWhenDown = nShapeRotation;
	    
	    this.oGroup.setAttribute("transform", "translate("+this.nTranslateX+","+this.nTranslateY+") rotate("+(nShapeRotation)+")");
	}
	
}



Shape.prototype.RotateShapeUp = function(event)
{
    if(this.bRotateMouseDown)
    {
        this.bRotateMouseDown = false;
        
        //alert("asd")
        var rotation = Math.abs(Math.round(this.nRotationWhenDown));
	    if ((rotation % 15) > 8)
	    {
		    rotation = (Math.floor(rotation / 15) + 1) * 15;
	    }
	    else
	    {
		    rotation = Math.floor(rotation / 15) * 15;
	    }
	    if (this.nRotationWhenDown < 0)
	    {
		    rotation = -rotation;
	    }
	    else
	    {
		    rotation = rotation;
	    }
    	
        this.nRotation = rotation;
	    //alert(rotation)
	    this.oGroup.setAttribute("transform", "translate("+this.nTranslateX+","+this.nTranslateY+") rotate("+(rotation)+")");
	}
}









Shape.prototype.Move = function(x, y, nAngle)
{
    this.nTranslateX = x;
	this.nTranslateY = y;
    this.nRotation = nAngle;
    //alert(this.nRotation)
    var strScale = "";
   /* if(this.m_bFlip)
    {
        strScale = "scale(1,-1)";
    }*/
	this.oGroup.setAttribute("transform", "translate("+this.nTranslateX+","+this.nTranslateY+") rotate("+nAngle+")");
}

function CreateVertex(cx, cy, strGrpId)
{
    var oCircle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    oCircle.setAttribute("name", strGrpId);
    oCircle.setAttribute("cx", cx);
    oCircle.setAttribute("cy", cy);
    oCircle.setAttribute("r", 7);
    oCircle.setAttribute("onmouseover", "VertexMouseOver(event)");
    oCircle.setAttribute("onmouseout", "VertexMouseOut(event)");
    oCircle.setAttribute("style", "fill:#940A17;stroke:black;stroke-width:1; fill-opacity:1;stroke-opacity:1;opacity:0");
    oCircle.setAttribute("visibility", "hidden");
    return oCircle;
}

Shape.prototype.AddVertexListener = function()
{
    for(var i = 0 ; i < this.m_mcVertex.length ; ++i)
    {
        this.m_mcVertex[i].addEventListener("touchstart", ShapeCircleDown, false);
        this.m_mcVertex[i].addEventListener("mousedown", ShapeCircleDown, false);
        this.m_mcVertex[i].addEventListener("touchend", ShapeCircleDown, false);
        this.m_mcVertex[i].addEventListener("mouseup", ShapeCircleUp, false);
        this.m_mcVertex[i].setAttribute('visibility', 'visible');
    }  
}

function VertexMouseOver(event)
{
    //event.target.style.opacity = 1;
}

function VertexMouseOut(event)
{
    //event.target.style.opacity = 0;
}

Shape.prototype.SelectShape = function()
{
    //alert("asd " + this.m_mcVertex.length)
    this.oShape.setAttribute("style", "fill:"+this.m_color+";stroke:black;stroke-width:2");
    for(var i = 0 ; i < this.m_mcVertex.length ; ++i)
    {
      this.m_mcVertex[i].style.opacity = .75;
      this.m_mcVertex[i].setAttribute('visibility', 'visible');
    }
}

Shape.prototype.UnSelectShape = function()
{
    this.oShape.setAttribute("style", "fill:"+this.m_color+";stroke:black;stroke-width:1");
    for(var i = 0 ; i < this.m_mcVertex.length ; ++i)
    {
      this.m_mcVertex[i].style.opacity = 0;
      this.m_mcVertex[i].setAttribute("visibility", "hidden");
    }   
}

function CreatePolygon(strPoints, color, strGrpId)
{

    var oShape = document.createElementNS('http://www.w3.org/2000/svg', "polygon");
    oShape.setAttribute("name", strGrpId);
    //
    oShape.setAttribute("points", strPoints);
    oShape.setAttribute("style", "fill:"+color+";stroke:black;stroke-width:1");
    
    return oShape;
}






//-------------------------------------------------------------------------------
//Description- creates a square shape
//Parameters-
//pParent:Object- reference to the manager object
//mcParent:MovieClip- reference to the parent movieclip
//depth- the depth at which the shape is to be created
//color- color of the shape
//Return Values- returns a standard square shape
function CreateSquare(depth, color, ShapeName)
{
    var arrPoints = new Array(0, 0, 0, gc_sidelen, gc_sidelen, gc_sidelen, gc_sidelen, 0);
	var shape = new Shape();
	var oGRP = shape.Shape1(depth, color, arrPoints, ShapeName, 2);
	return shape;

}
//-------------------------------------------------------------------------------
//Description- creates a parallelogram shape
//Parameters-
//pParent:Object- reference to the manager object
//mcParent:MovieClip- reference to the parent movieclip
//depth- the depth at which the shape is to be created
//color- color of the shape
//Return Values- returns a standard parallelogram shape
function CreateParallelogram(depth, color, ShapeName)
{
    var arrPoints = new Array(0, 0, gc_sidelen, gc_sidelen, 2 * gc_sidelen, gc_sidelen, gc_sidelen, 0);
	var shape = new Shape();
	var oGRP = shape.Shape1(depth, color, arrPoints, ShapeName, 2);
	return shape;
}
//-------------------------------------------------------------------------------
//Description- creates the small triangle
//Parameters-
//pParent:Object- reference to the manager object
//mcParent:MovieClip- reference to the parent movieclip
//depth- the depth at which the shape is to be created
//color- color of the shape
//Return Values- returns a standard small triangle shape
function CreateSmallTriangle(depth, color, ShapeName)
{
    var arrPoints = new Array(0, 0, 0, gc_sidelen, gc_sidelen, 0);
	var shape = new Shape();
	shape.Shape1(depth, color, arrPoints, ShapeName, 1);
	
	return shape;
}
//-------------------------------------------------------------------------------
//Description- creates the large triangle
//Parameters-
//pParent:Object- reference to the manager object
//mcParent:MovieClip- reference to the parent movieclip
//depth- the depth at which the shape is to be created
//Return Values- returns a standard large triangle shape
function CreateLargeTriangle(depth, color, ShapeName)
{
    var arrPoints = new Array(0, 0, 0, 2 * gc_sidelen, 2 * gc_sidelen, 0);
	var shape = new Shape();
	var oGRP = shape.Shape1(depth, color, arrPoints, ShapeName, 1);
	return shape;
}
//-------------------------------------------------------------------------------
//Description- creates the medium triangle
//Parameters-
//pParent:Object- reference to the manager object
//mcParent:MovieClip- reference to the parent movieclip
//depth- the depth at which the shape is to be created
//Return Values- returns a standard medium triangle shape
function CreateMediumTriangle(depth, color, ShapeName)
{
    var arrPoints = new Array(0, 0, 0, Math.sqrt(2) * gc_sidelen, Math.sqrt(2) * gc_sidelen, 0);
	var shape = new Shape();
	var oGRP = shape.Shape1(depth, color, arrPoints, ShapeName, 1);
	return shape;
}

Shape.prototype.GetPoint = function(vertexNo)
{
    
    if (this.m_nPoints != 0 && this.m_nPoints != undefined)
	{
		var x = this.m_vertex[vertexNo % this.m_nPoints].x;
		var y = this.m_vertex[vertexNo % this.m_nPoints].y;
		var angle = (this.nRotation * Math.PI) / 180;
		//DebugText(this.nRotation + " this.nRotation " + this.oGroup.getAttribute("name"))
		this.m_tempVertex[vertexNo % this.m_nPoints].x = this.nTranslateX + x * Math.cos(angle) - y * Math.sin(angle);
		this.m_tempVertex[vertexNo % this.m_nPoints].y = this.nTranslateY + x * Math.sin(angle) + y * Math.cos(angle);
		//if(m_mcShape._name == "shape14")
//trace(m_mcShape._name + " m_mcShape._rotation " + (m_vertex[vertexNo % m_nPoints].x) + " ------- " + (y * Math.sin(angle)));
		this.m_tempVertex[vertexNo % this.m_nPoints].x = Math.round(this.m_tempVertex[vertexNo % this.m_nPoints].x * 10000) / 10000;
		this.m_tempVertex[vertexNo % this.m_nPoints].y = Math.round(this.m_tempVertex[vertexNo % this.m_nPoints].y * 10000) / 10000;
		
		return this.m_tempVertex[vertexNo % this.m_nPoints];
	}
	return undefined;
}

Shape.prototype.Snap = function(snapshape)
{
    
	//for every point check if the point lies within the snapping area
	for (var i = 0; i < this.m_nPoints; i++)
	{
	    //DebugText("11111")
		var point1 = this.GetPoint(i);
		
		var point2;
		
		for (var j = 0; j < snapshape.m_nPoints; j++)
		{
			point2 = snapshape.GetPoint(j);
			
			var distance = (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y);
			
			if (distance <= 100)
			{
			    this.oGroup.setAttribute("transform", "translate("+(this.nTranslateX + point2.x - point1.x)+","+(this.nTranslateY + point2.y - point1.y)+")rotate("+this.nRotation+")");
			    this.nTranslateX = (this.nTranslateX + point2.x - point1.x);
			    this.nTranslateY = (this.nTranslateY + point2.y - point1.y);
				//Move(this.nTranslateX + point2.x - point1.x,this.nTranslateY + point2.y - point1.y);
				return true;
			}
		}
	}
	return false;
}















//Description- Determines whether the two convex shapes intersect each other
//Parameters- 
//shape:Shape- the convex shape with which the intersection is to be checked
//Return Value- returns true if the two shapes intersect else returns false
Shape.prototype.IntersectShape = function(shape)
{
	//if any point inside the poly return intersecting
	var nPointOnPoly = 0;
	var i
	var result
	for (i = 0; i < this.m_nPoints; i++)
	{
		result = shape.PointInPoly(this.GetPoint(i));
		
		//alert(result)
		if (result == 1)
		{
		    //alert("res " + result)
			return true;
		}
		else if(result == 0)
		{
			nPointOnPoly++;

		}
	}
	
	if (nPointOnPoly > 2)
	{
	    //alert("point on poly");
		return true;
	}
	nPointOnPoly = 0;
	//if any point inside the second poly return intersecting
	for (i = 0; i < shape.m_nPoints; i++)
	{
	//DebugText("22222222")
		result = this.PointInPoly(shape.GetPoint(i));
		if (result == 1)
		{
		    
			return true;
		}
		else if (result == 0)
		{

			nPointOnPoly++;
		}
	}
	//if more than 2 points on the polygon then intesecting
	//true
	if (nPointOnPoly > 2)
	{
	//alert("nPointOnPoly " + nPointOnPoly)
		return true;
	}
	var iOverlappingLineCount = 0;
	//if one intersecting line return intersecting
	//if two overlapping lines return intersecting
	for (i = 0; i < this.m_nPoints; i++)
	{
	//DebugText("333333333")
		var point1 = this.GetPoint(i);
		var point2 = this.GetPoint(i + 1);
		for (var j = 0; j < shape.m_nPoints; j++)
		{
			var line2Point1 = shape.GetPoint(j);
			var line2Point2 = shape.GetPoint(j + 1);
			
			result = IntersectingLines(point1, point2, line2Point1, line2Point2);
            
			if (result == 1)
			{
			    //alert("Intersecting");
				return true;
			}
			else if (result == -1)
			{
				iOverlappingLineCount++;
				if (iOverlappingLineCount > 1)
				{
				    //alert("overlapping");
					return true;
				}
			}
			else if (result == -2)
			{
			    DebugText(point2.y + " result = 111 " + point2.x);
				//check for both lines if their centres are in the polygons
				//then they intersect
				var oPoint1 = new Point();
				var centerpointLine1 = oPoint1.Point1((point1.x + point2.x) / 2, (point1.y + point2.y) / 2)
				var oPoint2 = new Point();
				var centerpointLine2 = oPoint2.Point1((line2Point1.x + line2Point2.x) / 2, (line2Point1.y + line2Point2.y) / 2);
				//DebugText(shape.PointInPoly(centerpointLine1) + " ppppppppppp " + this.PointInPoly(centerpointLine2))
				
				if (shape.PointInPoly(centerpointLine1) == 1 || this.PointInPoly(centerpointLine2) == 1)
				{
				    centerpointLine1 = null;
					centerpointLine2 = null;
					//alert("asdasd " + false)
					return true;
				}
				centerpointLine1 = null;
				centerpointLine2 = null;
			}
		}
	}
	
	return false;
}

Shape.prototype.Hide = function(point)
{
    this.oGroup.setAttribute("visibility", "hidden");
}

Shape.prototype.IsVisible = function()
{
    if(this.oGroup.getAttribute("visibility", "hidden") == "hidden")
    {
        return false;
    }
    return true;
}

Shape.prototype.Show = function(point)
{
    this.oGroup.setAttribute("visibility", "visible");
}

//-------------------------------------------------------------------------------
//Description- Determines whether the point is inside, outside or on the shape
//Parameters- 
//point:Point- the point with which the point the poly is to be selected
//Return Value- returns 1 if the point is inside the poly
//  retunrs 0 if the point is on the poly
//  returns -1 if the point is outside the poly
Shape.prototype.PointInPoly = function(point)
{
    
	var bFirst = false;
	var prevDir = 0;
	var dir;
	for (var i = 0; i < this.m_nPoints; i++)
	{
	    //DebugText("4444444 " + this.m_nPoints)
		var point1 = this.GetPoint(i);
		//this.oGroup.setAttribute("transform", "translate(20,20)");
		var point2 = this.GetPoint(i + 1);
		dir = Colinear(point1, point2, point);
		//check if the point lies on the polygon
		if (dir == 0)
		{
			var x1 = (point1.x <= point2.x ? point1.x : point2.x);
			var x2 = (point1.x <= point2.x ? point2.x : point1.x);
			var y1 = (point1.y <= point2.y ? point1.y : point2.y);
			var y2 = (point1.y <= point2.y ? point2.y : point1.y);
			DebugText("point1.x = " + point1.x + " point1.y " + point1.y + " point2.x " + point2.x + " point2.y " + point2.y)
			//DebugText(point1.y + " point in poly " + point2.y);
            
			if (x2 - x1 > y2 - y1)
			{
				if (x1 - point.x >= 1 || point.x - x2 >= 1)
				{
                    //alert("1")
					return -1;
				}
			}
			else
			{
				if (y1 - point.y >= 1 || point.y - y2 >= 1)
				{
				    //alert("2")
					return -1;
				}
			}
			//alert("3")
			//DebugText("point1.x = " + point1.x + " point1.y " + point1.y + " point2.x " + point2.x + " point2.y " + point2.y)
			//DebugText(point1.y + " point in poly " + point2.y);
			return 0;
		}
		if (!bFirst)
		{
			bFirst = true;
		}
		else
		{
			//check if the point lies outside the polygon
			if (prevDir * dir < 0)
			{
			//alert("4")
				return -1;
			}
		}
		prevDir = dir;
	}
	//alert("5")
	return 1;
}

Shape.prototype.GetCenterPoint = function()
{
    var m_center = new Point();
    m_center.Point1(this.nTranslateX,this.nTranslateY);
	return m_center;
}

Shape.prototype.GetPointsCount = function()
{
	return this.m_nPoints;
}

Shape.prototype.Unflip = function()
{
   this.oShape.setAttribute("transform", "translate("+this.nShapeTranslateX+","+this.nShapeTranslateY+") scale(1,1)");
   this.m_bFlip = false;
   
   for(i = 0 ; i < this.m_nPoints ; ++i)
    {
        //alert(this.m_mcVertex[i])
        this.m_vertex[i].y = -1 * this.m_vertex[i].y;
        this.m_mcVertex[i].setAttribute("cx", this.m_vertex[i].x);
        this.m_mcVertex[i].setAttribute("cy", this.m_vertex[i].y);
    }
}
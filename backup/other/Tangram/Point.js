Point.prototype.x;
Point.prototype.y;
function Point()
{

}

Point.prototype.Point1 = function (x, y)
{
    //alert("point")
    this.x = x;
    this.y = y;
    if (this.x == undefined)
    {
        this.x = 0;
    } // end if
    if (this.y == undefined)
    {
        this.y = 0;
    } // end if
    return this;
} // End of the function

Point.prototype.GetX = function()
{
    return this.x;
}

Point.prototype.GetY = function()
{
    return this.y;
}
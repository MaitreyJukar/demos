//Create a Circle
var circle = new Path.Circle(new Point(200, 200), 100);
circle.strokeWidth = 1;
circle.strokeColor = 'black';

var yAxis = new Path.Line({
    from: [200, 0],
    to: [200, 400],
    strokeColor: 'black'
});

var xAxis = new Path.Line({
    from: [0, 200],
    to: [400, 200],
    strokeColor: 'black'
});

var squareSide=20;
var squareArea=squareSide*squareSide;
var squaresLT=[];
var squaresRT=[];
var squaresLB=[];
var squaresRB=[];

for(var i=0,j=0;i<200;i+=squareSide){
    for(var k=0;k<200;k+=squareSide){
        squaresLT[j]=new Path.Rectangle(i,k,squareSide,squareSide);
        squaresLT[j]=squaresLT[j].intersect(circle);
        if(squaresLT[j].area===squareArea){
            squaresLT[j].strokeColor='red';
            squaresLT[j].strokeWidth=1;
        }
    }
}

for(var i=200,j=0;i<400;i+=squareSide){
    for(var k=0;k<200;k+=squareSide){
        squaresRT[j]=new Path.Rectangle(i,k,squareSide,squareSide);
        squaresRT[j]=squaresRT[j].intersect(circle);
        if(squaresRT[j].area===squareArea){
            squaresRT[j].strokeColor='blue';
            squaresRT[j].strokeWidth=1;
        }
    }
}

for(var i=0,j=0;i<200;i+=squareSide){
    for(var k=200;k<400;k+=squareSide){
        squaresLB[j]=new Path.Rectangle(i,k,squareSide,squareSide);
        squaresLB[j]=squaresLB[j].intersect(circle);
        if(squaresLB[j].area===squareArea){
            squaresLB[j].strokeColor='green';
            squaresLB[j].strokeWidth=1;
        }
    }
}

for(var i=200,j=0;i<400;i+=squareSide){
    for(var k=200;k<400;k+=squareSide){
        squaresRB[j]=new Path.Rectangle(i,k,squareSide,squareSide);
        squaresRB[j]=squaresRB[j].intersect(circle);
        if(squaresRB[j].area===squareArea){
            squaresRB[j].strokeColor='yellow';
            squaresRB[j].strokeWidth=1;
        }
    }
}
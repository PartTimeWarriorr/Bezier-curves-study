// Base bezier container
let currentDot = null;
let container = document.getElementById('container');
let canvas = document.getElementById("myCanvas");
let context = canvas.getContext("2d");
let points = [];
let t = 0.5;

// Options 
let slider = document.getElementById("mySlider");
let sliderOutput = document.getElementById("sliderOutput");
let polygonVisible = true;
let hodographPolygonVisible = true;

// Hodograph display container
let displayContainer = document.getElementById("displayContainer");
let displayCanvas = document.getElementById("displayCanvas");
let displayContext = displayCanvas.getContext("2d");
let hodographPoints = [];
let baseHodographDrawn = false;

// Base program setup
container.addEventListener("click", handleDocumentClick);
resizeCanvas();
resizeDisplayCanvas();

document.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);

function resetProgram()
{
    document.querySelectorAll("#container .draggableDot").forEach(elem => elem.remove());
    document.querySelectorAll("#displayContainer .displayDot").forEach(elem => elem.remove());
    document.querySelectorAll("#displayContainer #setPoint").forEach(elem => elem.remove());

    hodographPoints = [];
    points = [];
    
    baseHodographDrawn = false;
    hodographPolygonVisible = true;
    polygonVisible = true;
    t = 0.5;

    context.clearRect(0, 0, canvas.width, canvas.height);
    displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

}

function handleDocumentClick(e) 
{
    // Check if the clicked element is the container
    if (e.target === container) 
    {
        createDiv(e.clientX - container.offsetLeft, e.clientY - container.offsetTop);
    }
}

function createDiv(x, y) 
{
    // Create new div element representing our new point
    let newDiv = document.createElement("div");

    // Set styles for the new point
    newDiv.style.left = x - 10 + "px"; // TODO: Fix magic numbers (beshe -10 no sega e -20 i otdolu sushto -10 zashtoto ne znam zashto)
    newDiv.style.top = y - 10 + "px";
    newDiv.className = "draggableDot";

    // Create new point object
    let newPoint = {xCoord: x, yCoord: y}; // TODO: Fix magic numbers

    points.push(newPoint);

    context.clearRect(0, 0, canvas.width, canvas.height);
    displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    drawLines();
    drawBezier();
    drawHodographPoints();

    // Add new div to container
    container.appendChild(newDiv);

}

function handleMouseDown(e) 
{
    if (e.target.classList.contains("draggableDot")) 
    {
        currentDot = e.target;
        offsetX = e.clientX - currentDot.offsetLeft;
        offsetY = e.clientY - currentDot.offsetTop;
        currentDot.style.cursor = "grabbing";

    }

}

function handleMouseMove(e) 
{
    if (currentDot) 
    {

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        newX = Math.min(container.offsetWidth - currentDot.offsetWidth, Math.max(0, newX));
        newY = Math.min(container.offsetHeight - currentDot.offsetHeight, Math.max(0, newY));

        currentDot.style.left = newX + "px";
        currentDot.style.top = newY + "px";
        updatePointPosition(currentDot, newX + 10, newY + 10);
        updateHodographPoints(currentDot, newX + 10, newY + 10);

        context.clearRect(0, 0, canvas.width, canvas.height);
        displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

        drawLines();
        drawBezier();
        drawHodographLines();
        drawHodographBezier();
    }

}

function updatePointPosition(point, newX, newY) 
{
    let index = Array.prototype.indexOf.call(container.children, point); 
    points[index - 1] = { xCoord: newX, yCoord: newY }; // offset by 1 because of canvas child element
}

function drawLines() 
{
    if (!polygonVisible) 
    {
        return;
    }

    context.lineWidth = 1.2;
    context.beginPath();

    for (let i = 0; i < points.length; ++i) 
    {
        if (i === 0) 
        {
            context.moveTo(points[i].xCoord, points[i].yCoord);
        }
        else 
        {
            context.lineTo(points[i].xCoord, points[i].yCoord);
        }
        context.stroke();
    }

    drawPolygon();

}

function drawPolygon() 
{
    let nextLevelPoints = [];
    let prevPoints = points;

    do 
    {

        for (let i = 0; i < prevPoints.length - 1; ++i) 
        {
            if (i === 0) 
            {
                let newPoint = calculateNewPoint(prevPoints[i], prevPoints[i + 1]);
                nextLevelPoints.push(newPoint);
                context.moveTo(newPoint.xCoord, newPoint.yCoord);

                context.strokeStyle = "Blue";
                context.strokeRect(newPoint.xCoord - 7.5, newPoint.yCoord - 7.5, 15, 15); // TODO: Fix magic numbers
                context.strokeStyle = "Black";
            }
            else 
            {
                let newPoint = calculateNewPoint(prevPoints[i], prevPoints[i + 1]);
                nextLevelPoints.push(newPoint);
                context.lineTo(newPoint.xCoord, newPoint.yCoord);

                context.strokeStyle = "Blue";
                context.strokeRect(newPoint.xCoord - 7.5, newPoint.yCoord - 7.5, 15, 15);
                context.strokeStyle = "Black";
            }
            context.stroke();
        }

        prevPoints = nextLevelPoints;
        nextLevelPoints = [];

    } while (prevPoints.length > 2);
    
    if(prevPoints.length === 2)
    {
        // // Draw square at the point on the bezier curve
        let newPoint = calculateNewPoint(prevPoints[0], prevPoints[1]);

        context.strokeStyle = "Blue";
        context.strokeRect(newPoint.xCoord - 7.5, newPoint.yCoord - 7.5, 15, 15);
        context.strokeStyle = "Black";
    }
        
}

function drawBezier() 
{
    if (points.length < 3) 
    {
        return;
    }

    let tValue = 0.001;  // Alter when performance problems happen
    let prevPoints = points;
    let nextlevelPoints = [];


    while (tValue < 1) 
    {
        do 
        {
            for (let i = 0; i < prevPoints.length - 1; ++i) 
            {

                let newPoint = calculateNewBezierPoint(prevPoints[i], prevPoints[i + 1], tValue);
                nextlevelPoints.push(newPoint);

            }

            prevPoints = nextlevelPoints;
            nextlevelPoints = [];

        } while (prevPoints.length > 2);

        let bezierPoint = calculateNewBezierPoint(prevPoints[0], prevPoints[1], tValue);

        context.fillRect(bezierPoint.xCoord, bezierPoint.yCoord, 1, 1);

        tValue += 0.001;

        prevPoints = points;
    }

}

// Overload 1 used for finding points on control polygon
function calculateNewPoint(point1, point2) 
{
    return { xCoord: point1.xCoord * (1 - t) + point2.xCoord * t, yCoord: point1.yCoord * (1 - t) + point2.yCoord * t };
}

// Overload 2 used for finding points on bezier curve
function calculateNewBezierPoint(point1, point2, tValue) 
{
    return { xCoord: point1.xCoord * (1 - tValue) + point2.xCoord * tValue, yCoord: point1.yCoord * (1 - tValue) + point2.yCoord * tValue };
}

function handleMouseUp() 
{
    if (currentDot) 
    {
        currentDot.style.cursor = "grab";
        currentDot = null;
    }
}

function resizeCanvas() 
{
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}

function resizeDisplayCanvas()
{
    displayCanvas.width = displayContainer.offsetWidth;
    displayCanvas.height = displayContainer.offsetHeight;
}


function togglePolygon() 
{
    polygonVisible = !polygonVisible;

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawBezier();
}

function toggleHodographPolygon()
{
    hodographPolygonVisible = !hodographPolygonVisible;

    displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    drawHodographLines();
    drawHodographBezier();
}

slider.oninput = function () 
{
    t = this.value;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawBezier();

    // Update slider output
    sliderOutput.textContent = "t: " + this.value;
}

function drawHodographPoints()
{
    // Call on added new bezier point
    if(points.length < 4)
    {
        return;
    }
    
    if(baseHodographDrawn)
    {
        addNewHodographPoint();
        return;
    }

    // After first call should have flag that makes logic call another function instead that just adds a new div and draw its line
    baseHodographDrawn = true;

    
    let setX = 400, setY = 400, pointWidthOffset = 10;

    // Create and add set point element (other point positions depend on its position)
    let setPointDiv = document.createElement("div");
    setPointDiv.id = "setPoint";
    setPointDiv.style.left = setX - pointWidthOffset + "px";
    setPointDiv.style.top = setY - pointWidthOffset + "px";

    displayContainer.appendChild(setPointDiv);

    for(let i = 0; i < points.length - 1; ++i)
    {
        let currX = points[i + 1].xCoord - points[i].xCoord + setX;
        let currY = points[i + 1].yCoord - points[i].yCoord + setY;

        let newPoint = {xCoord: currX, yCoord: currY};
        hodographPoints.push(newPoint);

        let newDiv = document.createElement("div");
        newDiv.className = "displayDot";
        newDiv.style.left = currX - pointWidthOffset + "px";
        newDiv.style.top = currY - pointWidthOffset + "px";

        displayContainer.appendChild(newDiv);
    }


    drawHodographLines();
    drawHodographBezier();
}

function addNewHodographPoint()
{
    // Called after the first drawHodographPoints() call to just add a new hodograph div and draw a line to it
    let len = points.length;
    let setX = 400, setY = 400, pointWidthOffset = 10;

    let currX = points[len - 1].xCoord - points[len - 1 - 1].xCoord + setX;
    let currY = points[len - 1].yCoord - points[len - 1 - 1].yCoord + setY;

    let newPoint = {xCoord: currX, yCoord: currY};
    hodographPoints.push(newPoint);

    let newDiv = document.createElement("div");
    newDiv.className = "displayDot";
    newDiv.style.left = currX - pointWidthOffset + "px";
    newDiv.style.top = currY - pointWidthOffset + "px";

    displayContainer.appendChild(newDiv);

    drawHodographLines();
    drawHodographBezier();
}

function drawHodographLines()
{
    if(!hodographPolygonVisible)
    {
        return;
    }
    // Call on drawn hodograph points (or added new point) and updated hodograph point

    displayContext.beginPath();

    let setX = 400, setY = 400;
    
    for(let i = 0; i < hodographPoints.length; ++i)
    {

        displayContext.moveTo(setX, setY);

        displayContext.lineTo(hodographPoints[i].xCoord, hodographPoints[i].yCoord);
        
        displayContext.stroke();
    }

    drawHodographPolygon();

}

function updateHodographPoints(bezierPoint)
{
    // Call on updated base bezier point 
    if(points.length < 4)
    {
        return;
    }

    let setX = 400, setY = 400, pointWidthOffset = 10;

    let bezierPointDivIndex = Array.prototype.indexOf.call(container.children, bezierPoint);

    if(bezierPointDivIndex === 1)
    {

        hodographPoints[bezierPointDivIndex - 1].xCoord = points[bezierPointDivIndex].xCoord - points[bezierPointDivIndex - 1].xCoord + setX;
        hodographPoints[bezierPointDivIndex - 1].yCoord = points[bezierPointDivIndex].yCoord - points[bezierPointDivIndex - 1].yCoord + setY;            
    
        displayContainer.children[bezierPointDivIndex + 1].style.left =  hodographPoints[bezierPointDivIndex - 1].xCoord - pointWidthOffset + "px";
        displayContainer.children[bezierPointDivIndex + 1].style.top =  hodographPoints[bezierPointDivIndex - 1].yCoord - pointWidthOffset + "px";
        
    }
    else if(container.children[bezierPointDivIndex] === container.lastChild)
    {

        hodographPoints[bezierPointDivIndex - 2].xCoord = points[bezierPointDivIndex - 1].xCoord - points[bezierPointDivIndex - 2].xCoord + setX;
        hodographPoints[bezierPointDivIndex - 2].yCoord = points[bezierPointDivIndex - 1].yCoord - points[bezierPointDivIndex - 2].yCoord + setY;       

        displayContainer.children[bezierPointDivIndex].style.left = hodographPoints[bezierPointDivIndex - 2].xCoord - pointWidthOffset + "px";
        displayContainer.children[bezierPointDivIndex].style.top = hodographPoints[bezierPointDivIndex - 2].yCoord - pointWidthOffset + "px";
    }
    else
    {

        hodographPoints[bezierPointDivIndex - 1].xCoord = points[bezierPointDivIndex].xCoord - points[bezierPointDivIndex - 1].xCoord + setX;
        hodographPoints[bezierPointDivIndex - 1].yCoord = points[bezierPointDivIndex].yCoord - points[bezierPointDivIndex - 1].yCoord + setY;

        hodographPoints[bezierPointDivIndex - 2].xCoord = points[bezierPointDivIndex - 1].xCoord - points[bezierPointDivIndex - 2].xCoord + setX;
        hodographPoints[bezierPointDivIndex - 2].yCoord = points[bezierPointDivIndex - 1].yCoord - points[bezierPointDivIndex - 2].yCoord + setY;


        // divs
        displayContainer.children[bezierPointDivIndex + 1].style.left =  hodographPoints[bezierPointDivIndex - 1].xCoord - pointWidthOffset + "px";
        displayContainer.children[bezierPointDivIndex + 1].style.top =  hodographPoints[bezierPointDivIndex - 1].yCoord - pointWidthOffset + "px";

        displayContainer.children[bezierPointDivIndex].style.left = hodographPoints[bezierPointDivIndex - 2].xCoord - pointWidthOffset + "px";
        displayContainer.children[bezierPointDivIndex].style.top = hodographPoints[bezierPointDivIndex - 2].yCoord - pointWidthOffset + "px";
    }

    
    
}   

function drawHodographPolygon()
{
    displayContext.beginPath();
    displayContext.lineWidth = 0.4;

    for(let i = 0; i < hodographPoints.length; ++i)
    {
        if(i === 0)
        {
            displayContext.moveTo(hodographPoints[i].xCoord, hodographPoints[i].yCoord);
        }
        else
        {
            displayContext.lineTo(hodographPoints[i].xCoord, hodographPoints[i].yCoord);
        }

        displayContext.stroke();
    }

    // ...draw the remaining polygon
    let nextLevelPoints = [];
    let prevPoints = hodographPoints;

    do 
    {

        for (let i = 0; i < prevPoints.length - 1; ++i) 
        {
            if (i === 0) 
            {
                let newPoint = calculateNewPoint(prevPoints[i], prevPoints[i + 1]);
                nextLevelPoints.push(newPoint);
                displayContext.moveTo(newPoint.xCoord, newPoint.yCoord);

            }
            else 
            {
                let newPoint = calculateNewPoint(prevPoints[i], prevPoints[i + 1]);
                nextLevelPoints.push(newPoint);
                displayContext.lineTo(newPoint.xCoord, newPoint.yCoord);

            }
            displayContext.stroke();
        }

        prevPoints = nextLevelPoints;
        nextLevelPoints = [];

    } while (prevPoints.length > 2);
    
    
    displayContext.lineWidth = 1;
}

function drawHodographBezier()
{
    // Called when new hodograph point is added and when hodograph point position is updated

    if(hodographPoints.length < 3)
    {
        return;
    }

    let tValue = 0.001;
    let prevPoints = hodographPoints;
    let nextLevelPoints = [];
    
    while(tValue < 1)
    {
        do 
        {
            for (let i = 0; i < prevPoints.length - 1; ++i) 
            {

                let newPoint = calculateNewBezierPoint(prevPoints[i], prevPoints[i + 1], tValue);
                nextLevelPoints.push(newPoint);

            }

            prevPoints = nextLevelPoints;
            nextLevelPoints = [];

        } while (prevPoints.length > 2);


        let bezierPoint = calculateNewBezierPoint(prevPoints[0], prevPoints[1], tValue);

        displayContext.fillRect(bezierPoint.xCoord, bezierPoint.yCoord, 1, 1);

        tValue += 0.001;

        prevPoints = hodographPoints;
    }
}

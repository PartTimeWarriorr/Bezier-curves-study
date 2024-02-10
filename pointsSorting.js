
function getPointsDistance(p1, p2) {

    return Math.sqrt(Math.pow(p1.xCoord - p2.xCoord, 2) + Math.pow(p1.yCoord - p2.yCoord, 2));
}

function findClosestPointIndex(pointsArr, newPoint) {

    const distancesArray = pointsArr.map((p, i) =>
        ({ index: i, distance: getPointsDistance(p, newPoint) })
    );

    distancesArray.sort((a, b) => {

        if(a.distance > b.distance)
        {
            return 1;
        }
        else
        {
            return -1;
        }
    
    });

    return distancesArray[0].index;
}




// let p1 = { xCoord: 12, yCoord: 15 };
// let p2 = { xCoord: 24, yCoord: 10 };
// let p3 = { xCoord: 36, yCoord: 3 };
// let p4 = { xCoord: 42, yCoord: 32 };

// let points = [p3, p4, p1, p2];

// let newP = { xCoord: 11, yCoord: 14 };

// console.log(findClosestPointIndex(points, newP));

// console.log(...points.slice(0, 2), newP, ...points.slice(2));
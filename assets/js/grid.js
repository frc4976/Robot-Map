/*Setup Variables
	LastClicked tracks the grid element which was last clicked
	numberOfRows tracks the number of rows in the table
	points is an array which stores the vector object of each grid element which has been clicked 
	in chronological order
*/
var lastClicked;
var numberOfRows = 0;
var points= [];
var scaleValue = 2.417;
var offset = 0.025;

var leftVector = new Victor(0,0);
var rightVector = new Victor(0,0);

//Encoder 0.0001114 m pulse^-1

//Create the grid variable, takes parameters for rows, columns and the clicakbleGrid function
var grid = clickableGrid(10,20,function(box,row,col){
    box.className='clicked';
    var y = numberOfRows - row - 1;
	points.push(new Victor(col, y));

});


//Append the table to the DOM	
document.getElementById("table").appendChild(grid);
 
//Function to create the grid, takes parameters for rows, columns and callback
function clickableGrid( rows, cols, callback){
	var i=0;
	var grid = document.createElement('table');
	grid.className = 'grid';
	for (var r=0;r<rows;++r){
	    var tr = grid.appendChild(document.createElement('tr'));
	    numberOfRows++;
	    for (var c=0;c<cols;++c){
	        var cell = tr.appendChild(document.createElement('td'));
	        cell.addEventListener('click',(function(box,r,c){
	            return function(){
	                callback(box,r,c);
	            }
	        })(cell,r,c),false);
	    }
	}
	return grid;
}

//Calcualtes the distance between each 2 vectors in the points array
function calculate(){
	for (var c = 0; c < points.length;++c){
		var currentPoint = points[c];
		d = c +1;
		var futurePoint = points[d];

		//directionVector = new Victor(-(currentPoint.x - futurePoint.x), -(currentPoint.y - futurePoint.y));
		outputToFile(currentPoint.x, currentPoint.y);
    offset_calculate(1.0,1.0,2.0,2.0);
	}
}


function offset_calculate(x1,y1,x2,y2){
  //Inital Point
  var Fraction = algebra.Fraction
  var Expression = algebra.Expression;
  var Equation = algebra.Equation;
  var inital_point = new Victor(x1, y1);
  var next_point = new Victor(x2, y2);

  var AB = new Victor((x2-x1), (y2-y1));

  var abx = AB.x;
  var aby = AB.y;

  var adx = algebra.parse("x");
  adx = adx.subtract(x1);
  var ady = algebra.parse("y")
  ady = ady.subtract(y1);

  var expression1 = adx.add(ady);
  var equation_1 = new Equation(expression1, 0);
  var equation_12 = equation_1.solveFor("x");

  var adx2 = adx.multiply(adx);
  var ady2 = ady.multiply(ady);

  var expression3 = adx2.add(ady2);
  var expression4 = expression3.eval({x : equation_12});

  //INSERT SCALE VALUE HERE
  var  equation5 = new Equation(expression4, 4);
  var roots = equation5.solveFor("y");
  var xroot = new Fraction(parseInt(roots[0] * 1000000), 1);

  console.log(xroot);



  console.log("Equation 1 is " + equation_1);

  var x_1 = equation_1.solveFor("x");
  console.log("Our re-arranged equaiton is " + x_1);
  

 var x_11 = x_1.eval({y: xroot});
 var x_111 = x_11 / 1000000

  console.log("The final result is " + x_111);

}

//CSV Output Code
itemsNotFormatted = [];
function outputToFile(xi,yi){
	for (var e = 0; e < 100; ++e){
		var scaledX = xi * scaleValue;
		var scaledY = yi * scaleValue;

		var leftY = scaledY + offset;
		var rightY = scaledY - offset;

		var xPath = 0;
		var yPath = 0;

		var tempX = new Victor(scaledX, leftY);
		var tempY = new Victor(scaledX, rightY);

		xPath = leftVector.distance(tempX);
		yPath = rightVector.distance(tempY);

		leftVector = tempX;
		rightVector = tempY;

		itemsNotFormatted.push({
			driveLeftX: scaledX,
			driveLeftY: leftY,
			driveRightX: scaledX,
			driveRightY: rightY,
			xEncoder: xPath,
			yEncoder: yPath
		});
	}
}

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function download(){
  var headers = {
      driveRightX: 'driveRightX', 
      driveRightY: 'driveRightY',
      driveLeftX: 'driveLeftX',
      DriveLeftY: 'driveLeftY',
      xEncoder: 'xEncoder',
      yEncoder: 'yEncoder'

  };


  var itemsFormatted = [];

  // format the data
  itemsNotFormatted.forEach((item) => {
  	  console.log(item.driveLeft);
      itemsFormatted.push({
          DriveLeftX: item.driveLeftX, 
          DriveLeftY: item.driveLeftY,
          DriveRightX: item.driveRightX,
          DriveRightY: item.driveRightY,
          xEncoder: item.xEncoder,
          yEncoder: item.yEncoder
      });
  });

  var fileTitle = 'auto'; 

  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}
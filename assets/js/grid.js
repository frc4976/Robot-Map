/*Setup Variables
	LastClicked tracks the grid element which was last clicked
	numberOfRows tracks the number of rows in the table
	points is an array which stores the vector object of each grid element which has been clicked 
	in chronological order
*/
var lastClicked;
var numberOfRows = 0;
var points= [];
var scaleValue = 1.25;

//Create the grid variable, takes parameters for rows, columns and the clicakbleGrid function
var grid = clickableGrid(10,20,function(box,row,col){
    box.className='clicked';
    var y = numberOfRows - row - 1;
	points.push(new Victor(col, y));

});


//Append the table to the DOM	
document.getElementById("table").appendChild(grid);
 
//Function to create the grid, takes parameters for rows, columns and callback
function clickableGrid( rows, cols, callback ){
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

		console.log(currentPoint.distance(futurePoint));

		//directionVector = new Victor(-(currentPoint.x - futurePoint.x), -(currentPoint.y - futurePoint.y));
		outputToFile(currentPoint.x, currentPoint.y);
	}
}

itemsNotFormatted = [];
function outputToFile(xi,yi){
	for (var e = 0; e < 10; ++e){
		var scaledX = xi * scaleValue;
		var scaledY = yi * scaleValue;

		var leftY = scaledY + 0.025;
		var rightY = scaledY - 0.025;

		var xPath = 0;
		var yPath = 0;

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

  var fileTitle = 'atuo'; 

  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}
/*Setup Variables
	LastClicked tracks the grid element which was last clicked
	numberOfRows tracks the number of rows in the table
	points is an array which stores the vector object of each grid element which has been clicked 
	in chronological order
*/
var lastClicked;
var numberOfRows = 0;
var points= [];

//Create the grid variable, takes parameters for rows, columns and the clicakbleGrid function
var grid = clickableGrid(76,142,function(box,row,col){
    box.className='clicked';
    var y = numberOfRows - row - 1;
	points.push(new Victor(col, y));
	console.log(points);
   	console.log("(" + col + "," + y + ")");

});


//Append the table to the DOM	
document.getElementById("table").appendChild(grid);
 
//Function to create the grid, takes paraments for rows, columns and callback
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

//Calcualtes the distance between each 2 vectors in the poiuts array
function calculate(){
	for (var c = 0; c < points.length;++c){
		vector1 = points[c];
		d = c +1;
		vector2 = points[d];

		console.log(vector1.distance(vector2));

	}
}



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
var motor_constant = 0.1;

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

//TODO: Fix function, only removes first istance of reapeat
function clean_array(){
  for (var i = 0; i < points.length; i++) {
    var current_value = points[i];
    if (i != 0){
      var d = i - 1;
      if ((current_value.x == points[d].x) && (current_value.y == points[d].y)){
        points.splice(i,1);
      } 
    }   
  }
  return true;
}

function calculate(){

  var clean = clean_array();


  for (var i = 0; i < points.length; i++) {

    //Setup our initial point
    var currentPoint = points[i];

    //If we are at the last point of the array, do nothing
    if (i == (points.length - 1)){ }
    else {
      //If we are not at the last point of the array, do code
      var futurePoint = points[i+1];
      var currentVector = new Victor(currentPoint.x, currentPoint.y);
      var futureVector = new Victor(futurePoint.x, futurePoint.y);
      var abVector = new Victor((futureVector.x - currentVector.x), (futureVector.y - currentVector.y));


      if(abVector.length() != 1){
        //We are going diagonally
        var initial_offsets = offset_calculate(currentVector.x, currentVector.y, futureVector.x , futureVector.y);
        var point_c = new Victor(initial_offsets[0], initial_offsets[1]);
        var point_d = new Victor(initial_offsets[2], initial_offsets[3]);

        var second_offsets = offset_calculate(futureVector.x, futureVector.y,  currentVector.x , currentVector.y);
        var point_e = new Victor(second_offsets[0], second_offsets[1]);
        var point_f = new Victor(second_offsets[2], second_offsets[3]);

        var ce_length = point_c.length(point_e);
        var df_length = point_d.length(point_f);

        var left_motor_output = (df_length/abVector.length()) * motor_constant;
        var right_motor_output = (ce_length/abVector.length()) * motor_constant;

        
      } 
      else if (currentVector.x == futureVector.x){
        //We are going vertically
        var left_motor_output = abVector.length() * motor_constant;
        var right_motor_output = abVector.length() * motor_constant;
      } 
      else if (currentVector.y == futureVector.y){
        //We are going horizontally
        var left_motor_output = abVector.length() * motor_constant;
        var right_motor_output = abVector.length() * motor_constant;
      } else {
        console.log("Click adjacent boxes only");
      }

      console.log("The left motor output is " + left_motor_output);
      console.log("The right motor output is "  + right_motor_output);

    }
  }
  outputToFile();
}
function offset_calculate(x1,y1,x2,y2){
 //Library Setup
  var Fraction = algebra.Fraction
  var Expression = algebra.Expression;
  var Equation = algebra.Equation;

  //New direction vector between points A and B
  var AB = new Victor((x2-x1), (y2-y1));

  //Create new parametric equations for vector AD 
  var adx = new Expression("x");
  adx = adx.subtract(x1);
  adx = adx.multiply(AB.x);
  var ady = new Expression("y");
  ady = ady.subtract(y1);
  ady = ady.multiply(AB.y);


  //Create an expression for dot product
  var dot_sum = adx.add(ady);

  //Create and equation for dot product(equals 0 becasue the 2 vectors are perpendicular)
  var dot_product = new Equation(dot_sum, 0);

  //Re-arrange dot_product in terms of x
  var equation_1 = dot_product.solveFor("x");

  //Create second expression, magnitude of AD
  var magnitude_expression = adx.multiply(adx);
  magnitude_expression = magnitude_expression.add(ady.multiply(ady))

  //Set second expression equal to the square of the constant offset value
  var magnitude_equation = new Equation(magnitude_expression, 4); 

  //Substitute equation 1 into magnitude equation
  var substituted_equation = magnitude_equation.eval({x: equation_1});  

  //Find the 2 roots of the substituted equation
  var roots = substituted_equation.solveFor("y");

  //Cast the roots to string, then convert them to expression objects
  var point1x = algebra.parse(String(roots[0]));
  var point2x = algebra.parse(String(roots[1]));

  //Subsitute first root into equaiton 1
  var point1y = equation_1.eval({y: point1x});
  var point2y = equation_1.eval({y: point2x});

  //Convert to Strings
  point1y = point1y.toString();
  point2y = point2y.toString();


  //Parse result for point1y
  var flag1 = false;
  var numerator1 = "";
  var denominator1 = "";

  for (var i = 0; i < point1y.length; i++) {

	if (point1y.charAt(i) == "/"){
		flag1 = true;
		i++;
	}

	if (flag1 == true){
		denominator1 = denominator1.concat(String(point1y.charAt(i)));
	} else {
		numerator1 = numerator1.concat(String(point1y.charAt(i)));
	}
	
  }
  numerator1 = parseInt(numerator1);
  denominator1 = parseInt(denominator1);

  point1y = numerator1/denominator1;


  //Parse result for point2y
  var flag2 = false;
  var numerator2 = "";
  var denominator2 = "";

  for (var i = 0; i < point2y.length; i++) {

  	if (point2y.charAt(i) == "/"){
  		flag2 = true;
  		i++;
  	}

  	if (flag2 == true){
  		denominator2 = denominator2.concat(String(point2y.charAt(i)));
  	} else {
  		numerator2 = numerator2.concat(String(point2y.charAt(i)));
  	}
  	
  }
  numerator2 = parseInt(numerator2);
  denominator2 = parseInt(denominator2);

  point2y = numerator2/denominator2;

  //Output final 2 points
  //console.log("Point 1 is (" + roots[0] +","+point1y+")");
 // console.log("Point 2 is (" + roots[1] +","+point2y+")");

  //Setup return array in the format (x1, y1, x2, y2);
  var return_array = [roots[0], point1y, roots[1], point2y];

  //Return the return array
  return return_array;

}
//CSV Output Code
itemsNotFormatted = [];
function outputToFile(){
	for (var e = 0; e < 100; ++e){

		itemsNotFormatted.push({
			leftOuput: 1,
			rightOutput: 1,
			leftPosition: 1,
			rightPosition: 1,
			leftVelocity: 1,
			rightVelocity: 1
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
      leftOuptut: 'Left Output', 
      rightOutput: 'Right Output',
      leftPosition: 'Left Poistion',
      rightPosition: 'Right Poisiton',
      leftVelocity: 'Left Velocity',
      rightVelocity: 'Right Velocity'

  };


  var itemsFormatted = [];

  // format the data
  itemsNotFormatted.forEach((item) => {
  	  //console.log(item.driveLeft);
      itemsFormatted.push({
          leftOuput: item.leftOuput, 
          rightOutput: item.rightOutput,
          leftPosition: item.leftPosition,
          rightPosition: item.rightPosition,
          leftVelocity: item.leftVelocity,
          rightVelocity: item.rightVelocity
      });
  });

  var fileTitle = 'auto'; 

  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}

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
var offset = 0.74 / 2;
var motor_constant = 0.3;
var left_positions = [];
var right_positions = [];
var left_position = 0;
var right_position = 0;
var longPresses = [];


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
          cell.addEventListener('long-press',(function(box,r,c){
              return function(){
                var y = numberOfRows - r - 1;
                longPresses.push(new Victor(c, y));
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

  //Calcualte left and right offset values
  for (var i = 0; i < points.length; i++) {

    //Setup our initial point
    point_a = 0;
    point_b = 0;
    

    //If we are at the last point of the array, do nothing
    if (i == 0){ 
      //
      point_a = points[i+1];
      point_b = points[i];

      offset_calculate(point_a, point_b, 0);

    }
    else {
      point_a = points[i-1];
      point_b = points[i];

      offset_calculate(point_a, point_b, 1);
    }
  }

  //Calualte left and right distances
  var left_outputs = [];
  var right_outputs = [];
  for (var n = 0; n < left_positions.length; n++){
    if ((n+1) >= left_positions.length ){
    } else {
      var nextPoint = left_positions[n+1];
      var currentPoint = left_positions[n];

      var shifted_distance = get_distance(nextPoint.x, nextPoint.y, currentPoint.x, currentPoint.y);

      nextPoint = points[n+1];
      currentPoint = points[n];
      var original_distance = get_distance(nextPoint.x, nextPoint.y, currentPoint.x, currentPoint.y);


      var output = (shifted_distance/original_distance) * motor_constant;

      left_outputs.push(output);

    }
    
  }
  for (var n = 0; n < right_positions.length; n++){
    if ((n+1) >= right_positions.length ){

    } else {
      var nextPoint = right_positions[n+1];
      var currentPoint = right_positions[n];

      var shifted_distance = get_distance(nextPoint.x, nextPoint.y, currentPoint.x, currentPoint.y);
      nextPoint = points[n+1];
      currentPoint = points[n];
      var original_distance = get_distance(nextPoint.x, nextPoint.y, currentPoint.x, currentPoint.y);


      var output = -1 * (shifted_distance/original_distance) * motor_constant;

      right_outputs.push(output);

    }
  }
   for (var x = 0; x < left_outputs.length; x++){
      left_position = left_position + get_distance(left_positions[x].x,left_positions[x].y,left_positions[x+1].x,left_positions[x+1].y);
      right_position = right_position - get_distance(right_positions[x].x, right_positions[x].y,right_positions[x+1].x, right_positions[x+1].y);

  
      console.log(left_outputs[x] + "," + right_outputs[x] + ",," + left_position + "," + right_position);
      outputToFile(left_outputs[x], right_outputs[x], left_position, right_position);
   }
}

function offset_calculate(point_a, point_b, flag){

  var abVector = new Victor((point_b.x - point_a.x), (point_b.y - point_a.y)) ;
  var unitVector = new Victor(abVector.x / (abVector.length()), abVector.y / (abVector.length()));
  var perpendicularABVector = new Victor(-unitVector.y, unitVector.x);


  var point_c = new Victor((point_b .x + offset *  perpendicularABVector.x), (point_b.y + offset * perpendicularABVector.y));
  var point_d = new Victor((point_b.x - offset * perpendicularABVector.x), (point_b.y - offset * perpendicularABVector.y));
 
  
  var return_array = [point_c, point_d];

  if (flag == 0){
    left_positions.push(point_d);
    right_positions.push(point_c);
  } else if (flag == 1){
    left_positions.push(point_c);
    right_positions.push(point_d);
  }

  //Return the return array
  return return_array;

}

function get_distance(x1, y1, x2, y2) {
  var xs = x2 - x1,
      ys = y2 - y1;   
  
  xs *= xs;
  ys *= ys;
   
  return Math.sqrt( xs + ys );
};

function add_event(){
  var radios = document.getElementsByName('command');

  for (var i = 0, length = radios.length; i < length; i++)
  {
   if (radios[i].checked)
   {
    // do whatever you want with the checked radio
    console.log("add " + String(radios[i]) + " to file");

    // only one radio can be logically checked, don't check the rest
    break;
 }
}
}

//CSV Output Code
//DO NOT TOUCH OR EDIT
//IDK HOW IT WORKS BUT IT DOES SO DON'T TOUCH ANTYTHING OR IT WILL BREAK!!!
itemsNotFormatted = [];
function outputToFile(leftMotorOutput, RightMotorOutput, leftRobotPosition, rightRobotPosition){
  for (var e = 0; e < 243; ++e){
    itemsNotFormatted.push({
      leftOuput: leftMotorOutput,
      rightOutput: RightMotorOutput,
      leftPosition: leftRobotPosition,
      rightPosition: rightRobotPosition,
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
      _ : "",
      leftPosition: 'Left Poistion',
      rightPosition: 'Right Poisiton',
      __ : "",
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
          _ : "",
          leftPosition: item.leftPosition,
          rightPosition: item.rightPosition,
          __ : "",
          leftVelocity: item.leftVelocity,
          rightVelocity: item.rightVelocity
      });
  });

  var fileTitle = 'auto'; 

  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}


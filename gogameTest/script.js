tableSize = 19; // Global variable, whose default value is 19
autoUpdatPause = false; // When it's true, the auto refresh function stops. 
								//This happens when the users clicks the board
testIndex = 0;
PreviousMoveID ="i0000";

function testButton() {
    getLocaState(0,0);
}

//Used to test database operation, no practical use.
function databaseTest(){
if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		//html tag with id "info" is set as target of this function
                document.getElementById("testResult").innerHTML = this.responseText;
            }
	};  
	//calls the opdb.php file, which is in the save server folder.
	xmlhttp.open("GET", "opdb.php", true);
	xmlhttp.send();
}

/*BOARD TABLE GENERATING CODE****************************************************
*The board of the Go game is built with an html table, but 
*the html code of the table is too long to be hand written.
*So the following piece of JavaScript code is used to generate the html of the board table 
*and then send it to the table <body> element in . 
*/    
// This function is called by startPage(), which is at the end of this file.
function injectTableCode() {
	document.getElementById("boardTableBody").innerHTML = createTableCode();// Returns a string
}   

//Generates the html code inside the table body.
function createTableCode() {
	var tableHtmlCode = "";
	var rowHtmlCode = "";
  //The first layer of loop is for rows and the 2nd layer is for columns.
	for (i = 0; i < tableSize; i++) {
			var rowHtmlCode = ""; // announce an empty string
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			// Call this function that generates html code for a single table cell.
			var rowHtmlCode += creatTdElement(i,j); 
   	}  
		rowHtmlCode = "<tr>" + rowHtmlCode + "</tr>";		
		tableHtmlCode += rowHtmlCode;
   }  
return tableHtmlCode;
}

// This function generates html code for a single table cell with specific row number and column number.
// The row number and the column number are encoded into the html code.
function creatTdElement(rowNum,colNum) {
	var tdId = createTdId(rowNum,colNum); // Table cell ID is in the format of "i0000"
	var divId = tdId + 'd'; // This is the ID of the div inside the table cell. It's like "i0000d"
	var tdElmentCode = '<td class="tdElement" id="' + tdId + '" onclick="onClick(this.id)">•<div class="divElement" id="' + divId + '">empty</div></td>';
	// A String of "black", "white" or "empty" is stored as the div content with a font size of zero.
	// It is easier to access than the image name in the table cell to indicate the state of the position.
	// The dot ("•") in the table cell is the red dot users see on the last-put stone.
	return tdElmentCode; // Return the code as a string.
}

// Convert rowNum and colNum into ID string, which is like "i0000".
function createTdId(row,col) {
		var rowString = row.toString();
	if (row<10) { // Keep the string two-digit by adding a zero when the number is one-digit
		rowString = "0" + rowString; 
	}
	var colString = col.toString();
	if (col<10) { // Keep the string two-digit
		colString = "0" + colString;
	}
	var tdId = 'i' + rowString + colString; /*Create a string like 'i0102'*/
	return tdId;
}

//Keep the table cell "frame1" square all the time and fit the size of the window.
//When the size of this cell is adjusted, the cell to the right of it and even the
//whole table's size will be adjusted accordingly.
function fitSize()
            {
                var heights = window.innerHeight; // get the window's height as a string
                squareSide = heights + "px";
                document.getElementById("frame1").style.height = squareSide;
                document.getElementById("frame1").style.width = squareSide;
            }
            
function editGrid() {
	for (i = 0; i < tableSize; i++) {
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			var positionID = createTdId(i,j); 
			var posCode = generatePosCode([i,j]);
			if (posCode != 'middle') {
				document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + 'empty.png")';
			}

   	}

	}
}  

function clearLocalBoard() {
	for (i = 0; i < tableSize; i++) {
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			var positionID = createTdId(i,j); 
			var posCode = generatePosCode([i,j]);
			document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + 'empty.png")';
			document.getElementById(positionID+"d").innerText = "empty";
   	}
	}
	document.getElementById(PreviousMoveID).style.color = "rgba(0, 0, 0, 0)";
}
// Generate a part of the image code according to the ID,
// because in different position the background of the picture is different.
function generatePosCode(positionArry=[0,0]) { 
			var posCode = 'middle';
			var rowNum = positionArry[0]; 
			var colNum = positionArry[1]; 
			if (rowNum==0 && colNum==0) {
				posCode = 'LT';
   		} else if (rowNum==0 && colNum==tableSize-1) {
   			posCode = 'RT';
   		} else if (rowNum==tableSize-1 && colNum==0) {
   			posCode = 'LB';
   		} else if (rowNum==tableSize-1 && colNum==tableSize-1) {
   			posCode = 'RB';
   		} else if (rowNum==0) {
   			posCode = 'TE';
   		} else if (rowNum==tableSize-1) {
   			posCode = 'BE';
   		} else if (colNum==0) {
   			posCode = 'LE';
			} else if (colNum==tableSize-1) {
				posCode = 'RE';
			} else if ((rowNum==3 || rowNum==(tableSize-1)/2 || rowNum==tableSize-4) && (colNum==3 || colNum==(tableSize-1)/2 || colNum==tableSize-4)) {
				posCode = 'dot';
			}
			return posCode;
} 
window.onresize = function() {  /*this function is called when the window is resized*/
                fitSize();
            };
/*BOARD TABLE GENERATING CODE ENDS****************************************************/

/* CODE FOR THE MOVES*****************************************************************
* This piece of code realizes and controls the Go game moves,
* basically putting stones to and removing them from the board.
*/
function clearBoard(){
	 autoUpdatPause = true; 
    document.getElementById("clear").innerHTML = "It works";
    writeStepToDB(0, 0,0,dbToDiv)
    clearLocalBoard();
}

function onClick(clickedID) {
	autoUpdatPause = true; 
	id = clickedID;
	rowNum = Number(id.substring(1, 3)); //i0000
	colNum = Number(id.substring(3)); ; //i0000
	makeAMove(rowNum,colNum); // This function set autoUpdatPause to false.
}

function changeLocalState(positionArray=[0,0],resultState='empty') { 
	var positionID = createTdId(positionArray[0],positionArray[1]); 
	var posCode = generatePosCode(positionArray); 
	document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + resultState + '.png")';
	document.getElementById(positionID + "d").innerHTML = resultState;
}

function resetBoardDatabase() {
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		//html tag with id "info" is set as target of this function
                document.getElementById("testResult").innerHTML = this.responseText;
            }
	};  
	//calls the opdb.php file, which is in the save server folder.
	xmlhttp.open("GET", "clearBoard.php", true);
	xmlhttp.send();
}

function updatePosition(rowNum, colNum) {
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		//html tag with id "info" is set as target of this function
               var res = this.responseText;
               var resStr = res.toString(); 
               if (resStr.includes("black")){
               	state = "black";
               } else if (resStr.includes("white")) {
               	state = "white";
               } else {
               	state = "empty";
               }
               document.getElementById("testResult").innerHTML = resStr;
               changeLocalState([rowNum, colNum], state);
            }
	};  
	var id = createTdId(rowNum, colNum);
	//calls the opdb.php file, which is in the save server folder.
	xmlhttp.open("GET", "updatePosition.php?id=" + id, true);
	xmlhttp.send();
}

function updateWholeBoard() {
	for (i = 0; i < tableSize; i++) {
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			updatePosition(i, j);
			
   	}

	}
}

/***************************************************************************************************/
function makeAMove(rowNum,colNum) {
	divToLocal(rowNum,colNum,localToDB);
	redDot(rowNum,colNum);
}
	
function divToLocal(rowNum,colNum,callback) {
	var res = document.getElementById("stepNum").innerText;
	var numStr = res.substring(5);
	var getNum = parseInt(numStr);
	var colorOfThisStep = "black";
	if (getLocaState(rowNum,colNum) == "empty") {
		if (getNum % 2 == 0) {
			colorOfThisStep = "black";
		} else {
			colorOfThisStep = "white";
		}	
	}else {
			colorOfThisStep = "empty";
			getNum -= 1;
	}
   changeLocalState([rowNum, colNum], colorOfThisStep);
	var newNum = getNum + 1;
	var id = createTdId(rowNum, colNum);
	callback(rowNum, colNum,newNum,colorOfThisStep); // localToDB()
}	

function localToDB(rowNum, colNum,stepNum,colorOfThisStep) {
writeStepToDB(rowNum, colNum,stepNum,dbToDiv);
writeToDB(rowNum, colNum,colorOfThisStep);
}

function writeToDB(rowNum, colNum,colorOfThisStep) {
	var id = createTdId(rowNum, colNum);
	document.getElementById("testResult").innerHTML = "writeToDB.php?msg=" + id + colorOfThisStep;
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		//html tag with id "info" is set as target of this function
       document.getElementById("testResult").innerHTML = id;// + this.responseText;
            }
	};  
	xmlhttp.open("GET", "writeToDB.php?msg=" + id + colorOfThisStep, true);
	xmlhttp.send();
}

function writeStepToDB(rowNum, colNum,stepNum,callback) {
	var id = createTdId(rowNum, colNum);
	var numStr = stepNum.toString();
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		    //html tag with id "info" is set as target of this function
		         //var res = this.responseText;
		      	//document.getElementById("testResult").innerHTML = res;
		      	if (callback) {
		      		callback(restartAutoUpdat); //dbToDiv()
		      	}

            }
			};
	xmlhttp.open("GET", "addOneStepNumToDB.php?msg=" + id + numStr, true);	
	xmlhttp.send();
}

function dbToDiv(callback) {
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		    //html tag with id "info" is set as target of this function
		         var res = this.responseText;
		      	document.getElementById("stepNum").innerHTML = res;
		      	
		      	callback();//restartAutoUpdat
            }
			};
	//calls the opdb.php file, which is in the save server folder.
	xmlhttp.open("GET", "readFromStepNum.php", true);
	xmlhttp.send();
}

function restartAutoUpdat() {
	autoUpdatPause = false; 
}

function redDot(rowNum,colNum) {
	var id = createTdId(rowNum, colNum);
	document.getElementById(id).style.color = "red";
	document.getElementById(PreviousMoveID).style.color = "rgba(0, 0, 0, 0)";
	PreviousMoveID = id;
}


function getLocaState(rowNum,colNum) {
	var positionID = createTdId(rowNum, colNum);
	var localState = document.getElementById(positionID+"d").innerText;
   document.getElementById("clear").innerHTML = localState;
   return localState;
}
/*END OF THE CODE FOR THE MOVES******************************************************/

/*********************************************************************************
*Dynamically update the board*/

function realtimeupdate() {
	//setInterval is a function that repeat an operation in a specified interval(in milliseconds).
   setInterval(pauseControl,100);
}
/*
function pauseTest() {
	if (autoUpdatPause == false) {
		testIndex += 1;
		document.getElementById("realTimestepNum").innerHTML = testIndex;
	}
}*/

function pauseControl(){
	if (autoUpdatPause == false) {
		autoStepNumToDiv(compare);
	}
}

function autoStepNumToDiv(callback) {
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
		         var res = this.responseText;
		      	document.getElementById("realTimestepNum").innerHTML = res;
					var str = document.getElementById("realTimestepNum").innerText;
					var numStr = str.substring(5);
					var getNum = parseInt(numStr);
					document.getElementById("stepNumDisplay").innerHTML = numStr;
					if (getNum % 2 == 0) {
						document.getElementById("color").style.color = "black";
					} else {
						document.getElementById("color").style.color = "white";
					}
		      	callback();//compare()
            }
			};
	//calls the opdb.php file, which is in the save server folder.
	xmlhttp.open("GET", "readFromStepNum.php", true);
	xmlhttp.send();
}

function compare() {
	var realtimeMsg = document.getElementById("realTimestepNum").innerText;
	var localMsg= document.getElementById("stepNum").innerText;
	if (realtimeMsg!=localMsg) {
		var id = realtimeMsg.substring(0,5);
		var stepMumStr = realtimeMsg.substring(5);
		var rowNumStr = realtimeMsg.substring(1,3);
		var colNumStr = realtimeMsg.substring(3,5);
		var stepMum = parseInt(stepMumStr);
		var rowNum = parseInt(rowNumStr);
		var colNum = parseInt(colNumStr);
		if (stepMum==0) {
			clearLocalBoard();
		}else {
		updatePosition(rowNum,colNum);
      redDot(rowNum,colNum);
		}
		document.getElementById("stepNum").innerHTML = realtimeMsg;
	}
}

/*************************************************************************************/


/*Functions inside this function will be called when the window is opened*/
function startPage() {
	 injectTableCode();/*Create the Go game board*/
    fitSize();/*Fit the container of the Go game board fit the size of the window*/
    editGrid();
    dbToDiv(restartAutoUpdat);
    realtimeupdate()
    // The order of these functions are important. You can't operate on code that hasn't been generated.
}
 
        
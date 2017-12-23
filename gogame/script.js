tableSize = 19; // Global variable, whose default value is 19
autoUpdatPause = false; 
testIndex = 0;
PreviousMoveID ="i0000";

function testButton() {
    updateWholeBoard();
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
	document.getElementById("boardTableBody").innerHTML = createTableCode();
}   

//Generates the html code inside the table body.
function createTableCode() {
	var tableHtmlCode = "";
	var rowHtmlCode = "";
	
  //The first layer of loop is for rows and the 2nd layer is for columns.
	for (i = 0; i < tableSize; i++) {
			rowHtmlCode = "";
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			// Call this function that generates html code for a single table cell.			
			rowHtmlCode += creatTdElement(i,j);
   	}  
		rowHtmlCode = "<tr>" + rowHtmlCode + "</tr>";		
		tableHtmlCode += rowHtmlCode;
   }  
return tableHtmlCode;
}

// This function generates html code for a single table cell with specific row number and column number.
// The row number and the column number are encoded into the html code.
function creatTdElement(rowNum,colNum) {
	var tdId = createTdId(rowNum,colNum); 
	var divId = tdId + 'd'; 
	var tdElmentCode = '<td class="tdElement" id="' + tdId + '" onclick="onClick(this.id)">•<div class="divElement" id="' + divId + '">empty</div></td>';
	return tdElmentCode;
}

// Convert rowNum and colNum into ID string, which is like "i0000".
function createTdId(row,col) {
		var rowString = row.toString();
	if (row<10) { // Keep the string two-digit
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
function fitSize(){
                var heights = window.innerHeight;
                squareSide = heights + "px";
                document.getElementById("frame1").style.height = squareSide;
                document.getElementById("frame1").style.width = squareSide;
                // Problem unsolved: when the frame's width is smaller than height, it doesn't keep square.
}

// Edit the background pictures of the cells on the margins and with dots.          
function editGrid() {
	for (i = 0; i < tableSize; i++) {
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			var positionID = createTdId(i,j); 
			var posCode = generatePosCode([i,j]);
			if (posCode != 'middle') { // 'middle' is default, no need for updateing
				document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + 'empty.png")';
			}

   	}

	}
}  

// Only clear the appearance of local board, without updating the database
function clearLocalBoard() {
	for (i = 0; i < tableSize; i++) {
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			var positionID = createTdId(i,j); 
			var posCode = generatePosCode([i,j]);
			document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + 'empty.png")';
			document.getElementById(positionID+"d").innerText = "empty";
			// change the div content at the same time, which is used to detect local state.
   	}
	}
	document.getElementById(PreviousMoveID).style.color = "rgba(0, 0, 0, 0)";
	// Change the font color of the "•" to transparent, making it invisible
	// PreviousMoveID is the ID string of the last modified position.
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

/*this function is called when the window is resized
*so the board's size is adjusted according to the window size
*/
window.onresize = function() {  /*this function is called when the window is resized*/
                fitSize();
            };
/*BOARD TABLE GENERATING CODE ENDS****************************************************/

/* CODE FOR THE MOVES*****************************************************************
* This piece of code realizes and controls the Go game moves,
* basically putting stones to and removing them from the board.
*/
function clearBoard(){
	 autoUpdatPause = true; // Temporarily stop auto update while the database is to be updated.
    document.getElementById("clear").innerHTML = "It works"; // For testing
    writeStepToDB(0, 0,0,dbToDiv); // update the History table in the database
    resetBoardDatabase();
    clearLocalBoard(); 
}

// Called when any position (table cell) on the board is clicked.
function onClick(clickedID) {
	autoUpdatPause = true; // Temporarily stop auto update while the database is to be updated.
	id = clickedID;
	rowNum = Number(id.substring(1, 3)); //i0000
	colNum = Number(id.substring(3));  //i0000
	makeAMove(rowNum,colNum); // This function set autoUpdatPause to false.
}

function changeLocalState(positionArray,resultState) { // positionArray is in the form of [0, 1]
	var positionID = createTdId(positionArray[0],positionArray[1]); 
	var posCode = generatePosCode(positionArray); 
	document.getElementById(positionID).style.backgroundImage = 'url("img/' + posCode + resultState + '.png")';
	document.getElementById(positionID + "d").innerHTML = resultState; // Edit the div content.
}

// Reset the whole board's state to empty.
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

// Update a specific position's background image
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
               var res = this.responseText; // What is echoed by the PHP file
               var resStr = res.toString(); // The returned is not string before converting.
               // This if argument eliminates the need for extracting the exact state string from resStr
               // There are some overhead codes in the string, no only the state string
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
	xmlhttp.open("GET", "updatePosition.php?id=" + id, true);
	xmlhttp.send();
}

// Read the whole database and update the whole local board.
function updateWholeBoard() {
		if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               var res = this.responseText; // What is echoed by the PHP file
               var resStr = res.toString(); // The returned is not string before converting.
               document.getElementById("boardStr").innerHTML = resStr; // Put the msg to a div
               var string = document.getElementById("boardStr").innerHTML // Extract from the div
               var str = (string.toString()).trim(); // remove useless overhead with trim()
               for (var i = 0; i<str.length; i = i + 10){  // The length of the massage for each position is 10
    					var state = str.substring(i+5, i+10);
    					if (state != 'empty') {
							var id = str.substring(i, i + 5);
							document.getElementById("clear").innerHTML = id;
							var rowNum = Number(id.substring(1, 3)); //i0000
							var colNum = Number(id.substring(3));  //i0000
							changeLocalState([rowNum,colNum],state);
						}
    				}
            }
	};  
	xmlhttp.open("GET", "updateWholeBoard.php", true);
	xmlhttp.send();
}
/*
* Callback functions are widely used in the following block.
* A callback function is a function used as a parameter of another function.
* JavaScript support this kind of syntax because functions are considered as objects.
* The purpose of using callback is to make sure one function is not called until the earlier one
* finishes running.
* JavaScript is an event-based language, which means if an argument need to wait for response, such
* as database query, the next line will be executed before the data is back.
* callback function can be used to avoid such errors. 
**************************************************************************************************/
function makeAMove(rowNum,colNum) {
	divToLocal(rowNum,colNum,localToDB);// The last parameter is a callback function
	redDot(rowNum,colNum);
	moveSound();
}
	
function divToLocal(rowNum,colNum,callback) {
	var res = document.getElementById("stepNum").innerText; // A string with format of "i0000125"
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
			getNum -= 1; // removing a stone is not a move, subtract one to neutralize the adding
	}
   changeLocalState([rowNum, colNum], colorOfThisStep);
	var newNum = getNum + 1;
	var id = createTdId(rowNum, colNum);
	callback(rowNum, colNum,newNum,colorOfThisStep); // localToDB() is called after this function is finished
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
       			document.getElementById("testResult").innerHTML = id;
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
		         //Callback should be in this if statement, or it doesn't work.
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
		    //html tag with id "stepNum" is set as target of this function
		         var res = this.responseText;
		      	document.getElementById("stepNum").innerHTML = res;
		      	callback();//restartAutoUpdat
            }
			};
	xmlhttp.open("GET", "readFromStepNum.php", true);
	xmlhttp.send();
}

function restartAutoUpdat() {
	autoUpdatPause = false; 
}

function redDot(rowNum,colNum) {
	var id = createTdId(rowNum, colNum);
	document.getElementById(id).style.color = "red"; // Display a red dot on the newly put stone,
	document.getElementById(PreviousMoveID).style.color = "rgba(0, 0, 0, 0)"; // Get rid of the one on the previous one,
	PreviousMoveID = id; // Make the last stone "previous".
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
					// Set the color of the stone on the control panel on the right of the board,
					// which is actually a dot. So you can simply change its font color.
					// Its color is determined solely by step number.
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
	// If realtimeMsg == localMsg, no change of the database happens, hence no need for update.
	if (realtimeMsg!=localMsg) {
		var id = realtimeMsg.substring(0,5);
		var stepMumStr = realtimeMsg.substring(5);
		var rowNumStr = realtimeMsg.substring(1,3);
		var colNumStr = realtimeMsg.substring(3,5);
		var stepMum = parseInt(stepMumStr);
		var rowNum = parseInt(rowNumStr);
		var colNum = parseInt(colNumStr);
		// If stepNum is zero, its a clear board operation.
		if (stepMum==0) {
			clearLocalBoard();
		}else {
		updatePosition(rowNum,colNum);
      redDot(rowNum,colNum);
      moveSound();
		}
		document.getElementById("stepNum").innerHTML = realtimeMsg;
	}
}

/*************************************************************************************/
/*SOUND EFFECT*********************************************************************/

function moveSound() { 
	var x = document.getElementById("myAudio"); 
	document.getElementById("testResult").innerHTML = "Sound";
   x.play(); 
} 

/*SOUND EFFECT ENDS****************************************************************/

/*Functions inside this function will be called when the window is opened*/
function startPage() {
	 injectTableCode();/*Create the Go game board*/
    fitSize();/*Fit the container of the Go game board fit the size of the window*/
    editGrid();
    updateWholeBoard();
    dbToDiv(restartAutoUpdat);
    realtimeupdate();
    // The order of these functions are important. You can't operate on code that hasn't been generated.
}
 
        
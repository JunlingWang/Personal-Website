
function panelWork() {
    document.getElementById("demo").innerHTML = "It works";
}

/*Functions inside this function will be called when the window is opened*/
function startPage() {
	 injectTableCode();/*Create the Go game board*/
    fitSize();/*Fit the container of the Go game board fit the size of the window*/
    // The order of these functions are important. You can't operate on code that hasn't been generated.
}

/*Keep the table cell "frame1" square all the time and fit the size of the window.
*When the size of this cell is adjusted, the cell to the right of it and even the
*whole table's size will be adjusted accordingly.
*/
function fitSize()
            {
                var heights = window.innerHeight;
                squareSide = heights + "px";
                document.getElementById("frame1").style.height = squareSide;
                document.getElementById("frame1").style.width = squareSide;
                document.getElementById("i0000d").style.height = document.getElementById("i0000d").style.width;
                //The third line doesn't work.
            }
            
window.onresize = function() {  /*this function is called when the window is resized*/
                fitSize();
            };
            
function injectTableCode() {
	    document.getElementById("test").innerHTML = createTableCode();
	 }
	 
/*BOARD TABLE GENERATING CODE****************************************************
*The board of the Go game is built with an html table, but 
*the html code of the table is too long to be hand written.
*So he following piece of JavaScript code is used to generate the html of the board table 
*and then send it to the table <body> element in . 
*/       
/*rowNum=0, colNum=0*/

function createTableCode() {
	
	tableSize = 19;
	tableHtmlCode = "";
	rowHtmlCode = "";
  
	for (i = 0; i < tableSize; i++) {
			rowHtmlCode = "";
		for (j = 0; j < tableSize; j++) { // Different indexes (like i,j,k) should be used in multi-layer loops.
			rowHtmlCode += creatTdElement(i,j);
   	}  
		rowHtmlCode = "<tr>" + rowHtmlCode + "</tr>";		
		tableHtmlCode += rowHtmlCode;
   }  
return tableHtmlCode;
}

function creatTdElement(rowNum,colNum) {
	rowString = rowNum.toString();
	if (rowNum<10) {
		rowString = "0" + rowString;
	}
	colString = colNum.toString();
	if (colNum<10) {
		colString = "0" + colString;
	}
	//rowString = '1';
	//colString = '2';
	tdId = 'i' + rowString + colString; /*Create a string like '_1_2'*/
	divId = 'i' + rowString + colString + 'd'; /*Create a string like '_1_2'*/
	tdElmentCode = '<td class="tdElement" id="' + tdId + '" onclick="onClick()"><div id="' + divId + '"></div></td>';
	return tdElmentCode;
}


/*BOARD TABLE GENERATING CODE ENDS****************************************************/



 
        
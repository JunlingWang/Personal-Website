 <!DOCTYPE html>
<html>
<head>
</head>
<body>
<?php
$msg = $_REQUEST["msg"];// receive the parameter n from the JavaScript code
$id = substr($msg,0,5);
$state = substr($msg,5);

// Make database connection.
$writeComplete = FALSE;
$writeAttemptTime = 1;
while($writeComplete == FALSE && $writeAttemptTime < 50) {
	$mysqli = new mysqli("localhost", "wangjunling", "ma!XR!04", "gogame");
	// The 4th parameter is the name of the database. It is important to specify
	// the name of the database because there might be several databases under on username.
	if ($mysqli->connect_errno) {
	    echo "DBFailed";
	} else {
		 echo "DBsuccessful";
	}
   
	   $editRow = "UPDATE Board SET State = '" . $state . "' WHERE PositionID = '" . $id . "';";
			// Pay attention on the single quotation marks around the double quotation marks
			// around $positionID
		if ($mysqli->query($editRow) === TRUE) {
			$checkState = "check";
			$checkRes = $mysqli->query("SELECT State FROM Board WHERE PositionID='".$id."'");
			if ($checkRes->num_rows > 0){
    			while($row = $res->fetch_assoc()) {
    				if($check == $state) {
    				$writeComplete = TRUE;
    				$result = "Edit successful";
					}else {
			   		$result = "Edit Error1";
	   				$writeAttemptTime += 1;	
					}
			  	}
			 }else{
    			$result = "Edit Error2";
	   		$writeAttemptTime += 1;			
			}
		}
echo $id . $result;
$mysqli->close();
}
?>

</body>
</html>

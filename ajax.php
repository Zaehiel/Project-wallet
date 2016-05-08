<?
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
	/*safe not safe*/
	if($_SERVER['HTTP_REFERER']=='http://ehco.planet.ee/end/'){
		if(isset($_GET['query'])){
			if($_GET['query']=='load'){
				/*load from file*/
				$username = $_GET['username'];
				$filename = $username.'.txt';
				if(file_exists($filename)){
					echo file_get_contents($filename);

				}
			} else if($_GET['query']=='sync'){
				/*sync to serv*/
				$username = $_GET['username'];
				$json = $_GET['data'];
				$budget = $_GET['budget'];
				$array = ['budget'=> $budget, 'data' => $json];
				$array = json_encode($array);
				$filename = $username.'.txt';
				$myfile = fopen($filename, "w") or die("Unable to open file!");
				$txt = $array;
				fwrite($myfile, $txt);
				fclose($myfile);
				echo "synchronized";
			}
			
		}
	}
	

}

<?php

	$dir = '../profiles/';  

    $files = array_diff( scandir($dir), array(".", "..") );
    $num_files = count($files);
    $count = 0;
    $json = '['; 


    foreach($files as $file){
    	$count += 1;
    	$content = file_get_contents($dir.$file);
    	$json .= $content;
    	if($count < $num_files) {
    		$json .= ', ';
    	}
    }

    $json .= ']';

    file_put_contents('../profiles.json', $json);

?>

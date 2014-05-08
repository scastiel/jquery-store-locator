<?php

// Insert here the information to connect to your MySQL server.
$db_host = "127.0.0.1";
$db_user = "root";
$db_pass = "root";
$db_name = "storelocator";

// Parameters
$lat = $_REQUEST['lat'] ?: 0;
$lng = $_REQUEST['lng'] ?: 0;

// SQL request. The complexe part is here to compute the distance
// between the position passed in the parameters and each store.
$sql = "SELECT id, name, address, zip, city, state, country, latitude, longitude,
			((ACOS(SIN($lat * PI() / 180) * SIN(latitude * PI() / 180) + COS($lat * PI() / 180) * COS(latitude * PI() / 180) * COS(($lng - longitude) * PI() / 180)) * 180 / PI()) * 60 * 1.1515) AS distance 
		FROM stores 
		HAVING distance <= 10 
		ORDER BY distance ASC";

// Connexion to MySQL server.
$mysqli = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Execution of the SELECT query.
$res = mysqli_query($mysqli, $sql);

// For each stores...
$nearbyStores = array();
while( $store = mysqli_fetch_assoc($res) ) {

	// We construct two strings containing the distance in kilometers and miles.
	$store['distance-kilometers'] = round($store['distance']) . ' km';
	$store['distance-miles'] = round($store['distance'] / 1.6) . ' mi';

	// We add the store to the result array.
	$nearbyStores[] = $store;

}

// We return the stores in JSON format.
header('Content-type: application/json');
echo json_encode($nearbyStores);

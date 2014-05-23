<?php

/**
 * This script is an example PHP script that shows you what can
 * be called by the store locator plugin. It is very simple, but
 * should help you understand how you can integrate the plugin
 * in YOUR application.
 *
 * We suppose here that you have a working MySQL server (provide
 * its connection information below), which contains a database
 * (storelocator), which itself contains a table, "stores". See
 * the "create_table.sql" and "example_data.sql" to reproduce this
 * example on your system.
 */

// Insert here the information to connect to your MySQL server.
$db_host = "127.0.0.1";
$db_user = "root";
$db_pass = "root";
$db_name = "storelocator";

// Response is always JSON.
header('Content-type: application/json');

// Parameters
$lat = floatval($_REQUEST['lat']);
$lng = floatval($_REQUEST['lng']);
if( !$lat || !$lng )
{
	$protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
	header("$protocol 400 Bad Request");
	die(json_encode(array('error' => "Wrong values for 'lat' and/or 'lng' parameters.")));
}

// SQL request. The complexe part is here to compute the distance
// between the position passed in the parameters and each store.
$sql = "SELECT id, name, address, zip, city, state, country, url, latitude, longitude,
			((ACOS(SIN($lat * PI() / 180) * SIN(latitude * PI() / 180) + COS($lat * PI() / 180) * COS(latitude * PI() / 180) * COS(($lng - longitude) * PI() / 180)) * 180 / PI()) * 60 * 1.1515) AS distance
		FROM stores
		HAVING distance <= 10
		ORDER BY distance ASC";

// Connexion to MySQL server.
$mysqli = @mysqli_connect($db_host, $db_user, $db_pass, $db_name);
if( !$mysqli ) {
	$protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
	header("$protocol 500 Internal Server Error");
	die(json_encode(array('error' => "Database connection error.")));
}

// Setting up the data encoding as UTF-8.
mysqli_set_charset($mysqli, 'utf8');

// We keep the stores in this array.
$nearbyStores = array();

// Execution of the SELECT query.
$res = @mysqli_query($mysqli, $sql);
if( $res ) {

	// For each stores...
	while( $store = @mysqli_fetch_assoc($res) ) {

		// We construct two strings containing the distance in kilometers and miles.
		$store['distance-kilometers'] = round($store['distance']) . ' km';
		$store['distance-miles'] = round($store['distance'] / 1.6) . ' mi';

		// We add the store to the result array.
		$nearbyStores[] = $store;

	}
}

// We return the stores in JSON format.
echo json_encode($nearbyStores);

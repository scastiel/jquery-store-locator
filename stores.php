<?php

function rad($x) {
    return $x * pi() / 180;
};

function getDistance($lat1, $lng1, $lat2, $lng2) {
    $R = 6378137;
    $dLat = rad($lat2 - $lat1);
    $dLong = rad($lng2 - $lng1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
        cos(rad($lat1)) * cos(rad($lat2)) *
        sin($dLong / 2) * sin($dLong / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $d = $R * $c;
    return $d;
};

$allStores = array(
	array(
	    'id' =>  1,
	    'name' =>  "My store #1",
	    'address' =>  "12 Avenue Aristide Briand",
	    'zip' =>  "35000",
	    'city' =>  "Rennes",
	    'state' =>  null,
	    'country' =>  "France",
	    'latitude' =>  48.1105287,
	    'longitude' =>  -1.664758
	),
	array(
	    'id' =>  2,
	    'name' =>  "My store #2",
	    'address' =>  "34 Boulevard de Metz",
	    'zip' =>  "35000",
	    'city' =>  "Rennes",
	    'state' =>  null,
	    'country' =>  "France",
	    'latitude' =>  48.1165501,
	    'longitude' =>  -1.6581657
	),
	array(
	    'id' =>  3,
	    'name' =>  "My store #3",
	    'address' =>  "123 Boulevard de Ménilmontant",
	    'zip' =>  "75020",
	    'city' =>  "Paris",
	    'state' =>  null,
	    'country' =>  "France",
	    'latitude' =>  48.8659274,
	    'longitude' =>  2.3837267
	),
	array(
	    'id' =>  4,
	    'name' =>  "My store #4",
	    'address' =>  "35 rue Étienne Dollet",
	    'zip' =>  "75020",
	    'city' =>  "Paris",
	    'state' =>  null,
	    'country' =>  "France",
	    'latitude' =>  48.8683134,
	    'longitude' =>  2.3855789
	),
	array(
	    'id' =>  5,
	    'name' =>  "My store #5",
	    'address' =>  "2 boulevard Saint-Martin",
	    'zip' =>  "75003",
	    'city' =>  "Paris",
	    'state' =>  null,
	    'country' =>  "France",
	    'latitude' =>  48.8684958,
	    'longitude' =>  2.3587297
	)
);

$lat = $_REQUEST['lat'] ?: 0;
$lng = $_REQUEST['lng'] ?: 0;

$nearbyStores = array();
foreach( $allStores as $store ) {
    $distance = getDistance($lat, $lng, $store['latitude'], $store['longitude']);
    if (abs($distance) < 10000) {
    	$store['distance'] = $distance / 1000;
    	$store['distance-kilometers'] = round($distance / 1000) . ' km';
    	$store['distance-miles'] = round($distance / 1600) . ' mi';
        $nearbyStores[] = $store;
    }
}
usort($nearbyStores, function($store1, $store2) { return $store2['distance'] - $store2['distance']; });

header('Content-type: application/json');
echo json_encode($nearbyStores);
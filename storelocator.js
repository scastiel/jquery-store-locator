var stores = [];
var map = null;
var markers = {};
var infowindow = null;

function fetchStores() {
    return [{
        id: 1,
        name: "My store #1",
        address: "12 Avenue Aristide Briand",
        zip: "35000",
        city: "Rennes",
        state: null,
        country: "France",
        latitude: 48.1105287,
        longitude: -1.664758
    }, {
        id: 2,
        name: "My store #2",
        address: "34 Boulevard de Metz",
        zip: "35000",
        city: "Rennes",
        state: null,
        country: "France",
        latitude: 48.1165501,
        longitude: -1.6581657
    }, {
        id: 3,
        name: "My store #3",
        address: "123 Boulevard de Ménilmontant",
        zip: "75020",
        city: "Paris",
        state: null,
        country: "France",
        latitude: 48.8659274,
        longitude: 2.3837267
    }, {
        id: 4,
        name: "My store #4",
        address: "35 rue Étienne Dollet",
        zip: "75020",
        city: "Paris",
        state: null,
        country: "France",
        latitude: 48.8683134,
        longitude: 2.3855789
    }];
}

function loadStores() {

	stores = fetchStores();
    updateListWithStores(stores);

    var bounds = map.getBounds();
	if( !bounds ) {
		window.setTimeout(loadStores, 500);
		return;
	}

	placeStoresMarkers(bounds);
}

function placeStoresMarkers(bounds) {
	for (var i in stores) {
        placeMarkerForStore(stores[i], bounds);
    }
}

function placeMarkerForStore(store, bounds) {
	var id = store.id;
    var latLng = new google.maps.LatLng(store.latitude, store.longitude);
    if( !bounds || bounds.contains(latLng) ) {
    	if (!markers[id]) {
            markers[id] = new google.maps.Marker({
                position: latLng,
                map: map,
                title: store.name
            });
            google.maps.event.addListener(markers[id], 'click', (function(store, map) {
                return function() {
                    getInfoWindowForStore(store).open(map, markers[store.id]);
                }
            })(store, map));
        }
    } else {
    	if (markers[id]) {
    		markers[id].setMap(null);
    		delete markers[id];
    	}
    }
    return markers[id];
}

function openInfoWindowForStore(store) {
	getInfoWindowForStore(store).open(map, markers[store.id]);
}

function updateListWithStores(stores) {
    var $list = $('[data-list-stores]');
    $list.find('[data-store]').remove();
    var $storeTemplate = $list.find('[data-store-template]');

    for (var i in stores) {
        var store = stores[i];

        var $store = $storeTemplate.clone();
        $store.removeAttr('data-store-template').attr('data-store', JSON.stringify(store));
        fillDomElementWithStore($store, store);
        $link = $store.find('[data-store-link-to-map]');
        $link.click((function(store) {
        	return function(event) {
        		event.preventDefault();
        		if( !markers[store.id] )
        			markers[store.id] = placeMarkerForStore(store);
        		map.setCenter(markers[store.id].position);
        		map.setZoom(15);
        		openInfoWindowForStore(store);
	        };
	    })(store));
        $store.show();

        $store.appendTo($list);
    }
}

function fillDomElementWithStore($domElement, store) {
	for (var property in store) {
        $domElement.find('[data-store-attr="' + property + '"]').html(store[property]);
    }
}

function createInfoWindowContentForStore(store) {
	var $contentTemplate = $('[data-store-infowindow-template]');
	var $content = $contentTemplate.clone();
	fillDomElementWithStore($content, store);
	var content = $content.html();
	$content.remove();
	return content;
}

function getInfoWindowForStore(store) {
	if( infowindow )
		infowindow.close();
	else 
		infowindow = new google.maps.InfoWindow;
	var content = createInfoWindowContentForStore(store)
    infowindow.setContent(content);
    return infowindow;
}

function localiser() {
    var adresse = $('#address').val();
    codeAddress(adresse, function(location) {
        if (location) {
            map.setCenter(location);
            map.setZoom(15);
        }
    });
}

function codeAddress(address, callback) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            callback(results[0].geometry.location);
        } else {
            callback(null);
        }
    });
}

$(document).ready(function() {
    map = new google.maps.Map(document.getElementById("map-canvas"), {
        zoom: 15,
        center: new google.maps.LatLng(-34.397, 150.644)
    });
    google.maps.event.addListener(map, 'dragend', loadStores);
    google.maps.event.addListener(map, 'zoom_changed', loadStores);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);
        });
    }

    loadStores();
    if (stores.length > 0) {
        map.setCenter(new google.maps.LatLng(stores[0].latitude, stores[0].longitude));
    }
});
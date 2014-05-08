(function($) {

	var $this = null;
	var stores = [];
	var map = null;
	var markers = {};
	var infowindow = null;

	function error(msg) {
		if( console && console.error ) {
			console.error("Store locator error: " + msg);
		}
	}

	function fetchStores(lat, lng) {
		return [];
	}

	function loadStores(lat, lng) {
		if (!stores || lat || lng)
			stores = fetchStores(lat, lng);
		updateListWithStores(stores);

		var bounds = map.getBounds();
		if (!bounds) {
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
		if (!bounds || bounds.contains(latLng)) {
			if (!markers[id]) {
				markers[id] = new google.maps.Marker({
					position: latLng,
					map: map,
					title: store.name
				});
				google.maps.event.addListener(markers[id], 'click', (function(store, map) {
					return function() {
						openInfoWindowForStore(store);
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

		$this.find('[data-store-id=' + store.id + ']').addClass('active');
		$this.find('[data-store-id!=' + store.id + ']').removeClass('active');
	}

	function updateListWithStores(stores) {
		var $list = $this.find('[data-list-stores]');
		$list.find('[data-store]').remove();
		var $storeTemplate = $list.find('[data-store-template]');

		for (var i in stores) {
			var store = stores[i];

			var $store = $storeTemplate.clone();
			$store.removeAttr('data-store-template')
				.attr('data-store', JSON.stringify(store))
				.attr('data-store-id', store.id);
			fillDomElementWithStore($store, store);
			$link = $store.find('[data-store-link-to-map]');
			$link.click((function(store) {
				return function(event) {
					event.preventDefault();
					if (!markers[store.id])
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
		var $contentTemplate = $this.find('[data-store-infowindow-template]');
		var $content = $contentTemplate.clone();
		fillDomElementWithStore($content, store);
		var content = $content.html();
		$content.remove();
		return content;
	}

	function getInfoWindowForStore(store) {
		if (infowindow)
			infowindow.close();
		else
			infowindow = new google.maps.InfoWindow;
		var content = createInfoWindowContentForStore(store)
		infowindow.setContent(content);
		return infowindow;
	}

	function enableAutocomplete(input) {
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.bindTo('bounds', map);

		google.maps.event.addListener(autocomplete, 'place_changed', function() { onPlaceChanged(autocomplete); });
	}

	function onPlaceChanged(autocomplete) {
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(15);
		}

		loadStores(map.getCenter().lat(), map.getCenter().lng());
	}

	$.fn.storeLocator = function(options) {

		if( options.fetchStoresFunction )
			fetchStores = options.fetchStoresFunction;

		if( this.length == 0 )
			return;

		$this = $(this[0]);

		if( $this.find(".map").length == 0 ) {
			error("Unable to find the map.");
			return;
		}
		map = new google.maps.Map($this.find(".map")[0], {
			zoom: 13,
			center: new google.maps.LatLng(48.858877, 2.3470598)
		});

		if( $this.find('.input').length == 0 ) {
			error("Unable to find the input field.");
			return;
		}
		var input = $this.find('.input')[0];
		enableAutocomplete(input);

		google.maps.event.addListener(map, 'dragend', loadStores);
		google.maps.event.addListener(map, 'zoom_changed', loadStores);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.setCenter(pos);
			});
		}

		loadStores(map.getCenter().lat(), map.getCenter().lng());

		return this;
	};

})(jQuery);
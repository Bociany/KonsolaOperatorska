// Working alone on two "team" projects is plenty fun.

// The interval that we should update the table with
const interval = 5 * 1000;

// Health values for the devices
const healthValues = {
	// -1 is a special health value that's reserved only for
	// (None)-type devices
	'-1': 'purple',

	0: 'darkred',
	200: 'red',
	400: 'orange',
	600: 'green',
	800: 'darkgreen',
	1000: 'darkgreen'
}

// Icon names for the devices
const icons = {
	'BaseStation': 'fa-rss',
	'Car': 'fa-car',
	'Portable': 'fa-globe'
}

// The currently highlighted array
var highlightedId = -1;

var myArray = {}
var markerArray = {}

// Construct a new leaflet map
var mymap = L.map('mapid').setView([51.505, -0.09], 5);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(mymap);

// Fetch the latest data for the devices from our REST API.
function updateDevices() {
	fetch("/radios")
		.then(response => response.json())
		.then(data => {
			myArray = data;
			buildTable(myArray);
		});
}

// Perform an update right after we load
// also, set it to repeat on every interval (5s currently)
updateDevices();
setInterval(updateDevices, interval);

$('th').on('click', function () {
		var column = $(this).data('column');
		var order = $(this).data('order');
		var text = $(this).html();
		text = text.substring(0, text.length - 1);

		if (order == 'desc') {
			$(this).data('order', "asc");
			myArray = myArray.sort((a, b) => a[column] > b[column] ? 1 : -1);
			text += '&#9660';
		} else {
			$(this).data('order', "desc")
			myArray = myArray.sort((a, b) => a[column] < b[column] ? 1 : -1);
			text += '&#9650';
		}

		$(this).html(text);
		buildTable(myArray);
});

// Center the map on a marker
function centerMapOn(id) {
	mymap.panTo(markerArray[id].getLatLng());
	highlightMarker(id);
}

function onMarkerClick(marker) {
	highlightMarker(marker.target["special_id"]);
}

// Highlights the current marker in the table view
function highlightMarker(id) {
	// If we already have a highlighted ID, unhighlight it
	if (highlightedId != -1) {
		document.getElementById(`Item-${highlightedId}`).classList.remove("highlighted");
	}

	// Set and highlight
	highlightedId = id;
	document.getElementById(`Item-${highlightedId}`).classList.add("highlighted");
}

// Clamps the number between two values
function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

// Get the color of the device's "health"
function getHealth(strength, battery) {
	// The health is simply the battery times strength plus 1
	// 'Cause in my opinion, the lower the battery or the strength,
	// the worse the device's health is
	// The reason I add 1 to the strength though, is that even though
	// the device has no strength, it doesn't mean that the device can't communicate
	var health = clamp(battery * (strength + 1), 0, 1000);

	// Round it to the nearest multiple of 200 (1000 divided by 5)
	var multiple = Math.round(health / 200) * 200;

	// Return the color.
	return healthValues[multiple];
}

// Get the pictogram for a device marker
function getIconFor(data) {
	// If the name has a proper name, just return the icon set for it
	// alongside the marker color
	if (data.Name != "(None)") {
		return L.AwesomeMarkers.icon({
			icon: icons[data.Type],
			markerColor: getHealth(data.Strength, data.BatteryLevel),
			prefix: 'fa'
		});

	// If the device doesn't have a name, it's unknown to us,
	// proceed to mark it in a special way
	} else {
		return L.AwesomeMarkers.icon({
			icon: 'fa-question-circle',
			markerColor: healthValues['-1'],
			prefix: 'fa'
		});
	}
}

// Build the table containing the elements.
function buildTable(data) {
	var table = document.getElementById('myTable')
	table.innerHTML = ''
	for (var i = 0; i < data.length; i++) {
		// If we don't have a marker set, create one
		if (markerArray[data[i].Id] == null) {
			markerArray[data[i].Id] = L.marker([parseFloat(data[i].Position.Lat), parseFloat(data[i].Position.Lon)], {icon: getIconFor(data[i])})
									   .addTo(mymap)
									   .on('click', onMarkerClick);

			markerArray[data[i].Id]["special_id"] = data[i].Id;
			markerArray[data[i].Id].bindPopup(`${data[i].Id}: ${data[i].Name}, ${data[i].SerialNumber}`);

		// Otherwise, just update it.
		} else {
			markerArray[data[i].Id].setLatLng([parseFloat(data[i].Position.Lat), parseFloat(data[i].Position.Lon)]);
			markerArray[data[i].Id].setIcon(getIconFor(data[i]));
		}

		var classes = "row-item ";
		if (data[i].Id == highlightedId) {
			classes += "highlighted";
		}
		var row = `<tr class="${classes}" id="Item-${data[i].Id}" onclick="centerMapOn(${data[i].Id});">
                  <td>${data[i].Name}</td>
                  <td>${data[i].Id}</td>
                  <td>${data[i].Type}</td>
                  <td>${data[i].SerialNumber}</td>
                  <td>${data[i].Strength}</td>
                  <td>${data[i].BatteryLevel}</td>
                  <td>${data[i].WorkingMode}</td>
                </tr>`
		table.innerHTML += row
	}
}
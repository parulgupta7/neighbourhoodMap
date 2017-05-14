var map;
// blank array for all the listing markers.
var markers = [];
var infoWindow;
var cords = {
            lat: 28.6144,
            lng: 77.1996
        };
var locations = [{
        title: 'Red Fort',
        location: {
            lat: 28.6562,
            lng: 77.2410
        }
    },
    {
        title: 'India Gate',
        location: {
            lat: 28.6129,
            lng: 77.2295
        }
    },
    {
        title: 'Connaught Place, New Delhi',
        location: {
            lat: 28.6315,
            lng: 77.2167
        }
    },
    {
        title: 'Chandni Chowk',
        location: {
            lat: 28.6506,
            lng: 77.2303
        }
    },
    {
        title: 'Indira Gandhi International Airport',
        location: {
            lat: 28.5562,
            lng: 77.1000
        }
    },
    {
        title: 'Akshardham (Delhi)',
        location: {
            lat: 28.6127,
            lng: 77.2773
        }
    },
    {
        title: 'Rashtrapati Bhavan',
        location: {
            lat: 28.6144,
            lng: 77.1996
        }
    },
    {
        title: 'Lotus Temple',
        location: {
            lat: 28.5535,
            lng: 77.2588
        }
    }
];


//function for initialisation of map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: cords,
        zoom: 12,
        mapTypeControl: true
    });
    infoWindow = new google.maps.InfoWindow();
    var defaultIcon = changeMarker('ff3300');
    var changedIcon = changeMarker('ffff00');
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            map:map,
            position: locations[i].location,
            title: locations[i].title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        markers.push(marker);
        showMarks();

        //adding event Listeners to markers
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);

        });

        marker.addListener('mouseover', function() {
            this.setIcon(changedIcon);
        });

        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }
}

//function to change the marker
function changeMarker(color) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + color +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

//fill information in infoWindow
function populateInfoWindow(marker, infowindow) {
    bounceMarker(marker);

    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);
        });
        fetchInfo(marker);
        // Open the infowindow on the correct marker.
        if (infowindow) {
            infowindow.close();
        }
        infowindow.open(map, marker);
    }
}


//function to bounce the marker
function bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 730);
}

//function to open infoWindow if marker is clicked
function pointMarker(data) {
    if (infoWindow.marker != data.location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == data.title) {
                populateInfoWindow(markers[i], infoWindow);
                break;
            }
        }
    }
}


//function to bounce the marker
function bounceMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);
}


//function to show markers
function showMarks(){
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });
}

//function to hide markers
function hideMarks(){
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//function for fetching wikipedia resources using ajax
function fetchInfo(marker){
    var wikiurl = 'https://en.wikipedia.org/w/api.php';
    wikiurl += '?' + $.param({
        'action': 'query',
        'titles': marker.title,
        'prop': 'revisions',
        'rvprop': 'content',
        'rvsection' : '0',
        'rvparse' : '1',
        'format': 'json',
        'callback': 'wikiCallback'
    });

    var wikiRequestTimeout = setTimeout(function(){
        viewModel.showError(true);
        viewModel.error('failed to get wikipedia resources');
    },8000);


    $.ajax({
        url: wikiurl,
        dataType: "jsonp",
        crossDomain: true,
        success: function(response){
            var page_no;
            var obj = response['query']['pages'];
            for(var f in obj)
            {
                page_no = f;
                break;
            }
            var result = response['query']['pages'][page_no]['revisions']['0']['*'];
            infoWindow.setContent(result);
            clearTimeout(wikiRequestTimeout);
        }
    });
}

// shows error if api is no correctly fetched
googleapiError = () => {
    viewModel.showError(true);
    viewModel.error('Sorry! Maps not able to load');

};


var viewModel = {
    error: ko.observable(''),
    showError: ko.observable(false),
    showList: ko.observable(true),
    list: ko.observableArray([]),
    query: ko.observable(''),

    //Search function for live search
    search: function(value) {
        viewModel.showList(false);
        viewModel.list.removeAll();
        if (value == '') {
            viewModel.showList(true);
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            }
            return;
        }
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
        for (var location in locations) {

            if (locations[location].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                viewModel.list.push(locations[location]);

                var key = locations[location].location;
                for (var j = 0; j < markers.length; j++) {
                    if (markers[j].position.lat().toFixed(5) == key.lat.toFixed(5)) {
                        if (markers[j].position.lng().toFixed(5) == key.lng.toFixed(5)) {
                            markers[j].setVisible(true);
                        }
                    }

                }

            }
        }
    }
};

viewModel.query.subscribe(viewModel.search);
ko.applyBindings(viewModel);

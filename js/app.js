var map;
var infowindow;

function ViewModel() {
    var self = this;
    // the filter input
    this.input = ko.observable();
    // to show and hide the side pan
    this.currentDisplay = ko.observable(false);
    this.changeDisplay = function () {
        if (self.currentDisplay()) {
            self.currentDisplay(false);
        } else {
            self.currentDisplay(true);
        }
    };
    //list of all markers in the map
    this.markerList = ko.observableArray([]);
    // list of filtered markers, cintian marker name and id only
    this.searchList = ko.observableArray([]);
    this.locations = [{
            title: 'Cairo Tower',
            position: {
                lat: 30.045915,
                lng: 31.224287
            }
        },
        {
            title: 'Egyptian Museum',
            position: {
                lat: 30.047365,
                lng: 31.234472
            }
        },
        {
            title: 'Al-Azhar Mosque',
            position: {
                lat: 30.045286,
                lng: 31.262458
            }
        },
        {
            title: 'Al-Hussein Mosque',
            position: {
                lat: 30.0479341,
                lng: 31.262846
            }
        },
        {
            title: 'Mosque of Muhammad Ali',
            position: {
                lat: 30.027855,
                lng: 31.260592
            }
        },
        {
            title: 'Al-Hakim Mosque',
            position: {
                lat: 30.055134,
                lng: 31.264226
            }
        },
        {
            title: 'Cairo Citadel',
            position: {
                lat: 30.029615,
                lng: 31.260888
            }
        }
    ];
    // render the markers list when the user enter text in the filter
    this.input.subscribe(function () {
        var key = self.input().toLowerCase();
        self.searchList([]);
        for (var i = 0; i < self.markerList().length; i++) {
            var str = self.markerList()[i].title.toLowerCase();
            if (str.includes(key)) {
                // add the marker to the search list and show it in the map
                self.searchList.push({
                    title: self.markerList()[i].title,
                    id: self.markerList()[i].id
                });
                self.markerList()[i].setMap(map);
            } else {
                // hide the marker form the map
                self.markerList()[i].setMap(null);
            }
        }
    });
    // make the marker bounce when place in the list is clicked
    this.bounce = function (place) {
        var marker = self.markerList()[place.id];
        marker.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(marker);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 2100);
    };
}

function initMap() {
    // initialize the map and add the markers to markerList
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.046029,
            lng: 31.262475
        },
        zoom: 13
    });
    var bounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();

    function addInfo() {
        var self = this;
        self.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(self);
        setTimeout(function () {
            self.setAnimation(null);
        }, 2100);
    }
    for (var i = 0; i < searchview.locations.length; i++) {
        var position = searchview.locations[i].position;
        var title = searchview.locations[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        searchview.markerList.push(marker);
        // show info window and add animation when the marker is clicked
        marker.addListener('click', addInfo);
        // fit the bounds of the map to show all markers
        bounds.extend(searchview.locations[i].position);
    }
    // change the valu of input to "" will fill the searchList will all places
    searchview.input("");
    map.fitBounds(bounds);
    google.maps.event.addDomListener(window, 'resize', function () {
        map.fitBounds(bounds);
    });
}

function populateInfoWindow(marker) {
    // shwo info window associated with this marker 
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        // get the first paragraph of wikipedia aritcle about this place
        getWiki(marker.title, marker);
    }
}

function getWiki(title, marker) {
    // add wikipedia article to the infowindow associated with this marker
    title = encodeURIComponent(title.trim());
    var url = "http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" +
        title +
        "&callback=wikiCallback";

    // if faild to get article form wikipedia
    var wikiRequestTimeout = setTimeout(function () {
        setRes('faild to get wikipedia resources');
    }, 8000);
    // fire ajax request using jsonp to wikipedia
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (response) {
            if (response) {
                var paragraph = response.query.pages[Object.keys(response.query.pages)[0]].extract;
                clearTimeout(wikiRequestTimeout);
                setRes(paragraph);
            } else {
                clearTimeout(wikiRequestTimeout);
                setRes("there is no wikipedia article associated with this place");
            }
        }
    });

    function setRes(paragraph) {
        // set the content of the infowindow 
        infowindow.setContent('<h4>' + marker.title + '</h4>' + '<hr>' + paragraph); // to add wiki info
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
}

function loadMapError() {
    alert("Can't load google maps please reload the page");
}
var searchview = new ViewModel();
ko.applyBindings(searchview);

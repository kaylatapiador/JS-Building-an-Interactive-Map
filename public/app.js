const myMap = {
    coordinates: [],
    businesses: [],
    map: {},
    markers: {},

    // build leaflet map
    buildMap() {
        this.map = L.map('map', {
        center: this.coordinates,
        zoom: 11,
        });
        // add openstreetmap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: '15',
        }).addTo(this.map)
        // create and add geolocation marker
        const marker = L.marker(this.coordinates)
        marker
        .addTo(this.map)
        .bindPopup('<p1><b>You are here</b><br></p1>')
        .openPopup()
    },

   
    addMarkers() {
        for (let i = 0; i < this.businesses.length; i++) {
        this.markers = L.marker([
            this.businesses[i].lat,
            this.businesses[i].long,
        ])
            .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
            .addTo(this.map)
        }
    },
}

// get coordinates using geolocation api
async function getCoordinates(){
    let position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    });
    return [position.coords.latitude, position.coords.longitude]
}

// get foursquare businesses
async function getFoursquare(business) {
    const options = {
        method: 'GET',
        headers: {
        Accept: 'application/json',
        Authorization: 'fsq3MZurA9vf1wl8Y2gjsoEnmIkraaRj+ivZegA0tA2gpH8='
        }
    }
    let limit = 5
    let lat = myMap.coordinates[0]
    let lon = myMap.coordinates[1]

    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
    let responseData = await response.text()
    let data = JSON.parse(responseData)
    let businesses = data.results
    return businesses
}
// process foursquare array
function processFourSquare(data) {
    let businesses = data.map((element) => {
        let location = {
            name: element.name,
            lat: element.geocodes.main.latitude,
            long: element.geocodes.main.longitude
        };
        return location
    })
    return businesses
}


// event handlers
// window load
window.onload = async () => {
    const coordinates = await getCoordinates()
    myMap.coordinates = coordinates
    myMap.buildMap()
}

// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault()
    let business = document.getElementById('business').value
    let data = await getFoursquare(business)
    myMap.businesses = processFourSquare(data)
    myMap.addMarkers()
})
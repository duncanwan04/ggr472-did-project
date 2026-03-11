
mapboxgl.accessToken = "pk.eyJ1IjoiZHVuY2FuLXdhbjA0IiwiYSI6ImNta2U4Y3c1MTA0ZjczZW9mMXpqc2VidmoifQ.RxHABogPiEWD0gDBm5pA8w";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/duncan-wan04/cmlgpvpnz000t01s32ah007xw",
    center: [-79.39, 43.70],
    zoom: 11,
});

map.on('load', async () => {

    /// Using const to get data because I need to use this dataset for HexGrid in Turf, which requires
    /// the data/json to be stored in the local javascript instead of having Mapbox fetch my data
    /// which will not work

    const collision_url = await fetch(
        "https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/main/data/cleaned_traffic_collisions.geojson");

    const collision_data = await collision_url.json();

    map.addSource('collision', {
        type: 'geojson',
        data: collision_data
    });

    map.addSource('cordon-counts', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/refs/heads/main/data/Cordon%20Counts%20(2022).geojson'
    });

    // Visualize data layer on map
    map.addLayer({
        'id': 'collision-layer',
        'type': 'circle',
        'source': 'collision',
    });

    map.addLayer({
        'id': 'cordon-counts-layer',
        'type': 'circle',
        'source': 'cordon-counts',
    });

/*--------------------------------------------------------------------
Safety/Collisions section (Hexgrid)
--------------------------------------------------------------------*/
    
    /// getting the coordinates for the boundaries of where we want the hexagons
    const bbox = turf.bbox(collision_data);
    console.log("bbox:", bbox);
    // const cellSide = 0.5;
    // const options = {units: "kilometers"};

    // /// makes the hexagons (polygons)
    // const hexgrid = turf.hexGrid(bbox, cellSide, options);
    // console.log(hexgrid);

    // map.addSource('collision_hexagons', {
    //     type: 'geojson',
    //     data: hexgrid
    // });

});


/*--------------------------------------------------------------------
Safety/Collisions section (Hexgrid)
--------------------------------------------------------------------*/

/// hex box dimensions [minLongitude, minLatitude, maxLongitude, maxLatitude]
/// [-79.5427596, 43.678224, -79.2511551, maxlat]

/// const collision_hexgrid = 'https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/main/data/cleaned_traffic_collisions.geojson'

// const bbox = turf.bbox(collision_hexgrid);

// var bbox = [-96, 31, -84, 40];
// var cellSide = 50;
// var options = { units: "miles" };

// var hexgrid = turf.hexGrid(bbox, cellSide, options);


/*--------------------------------------------------------------------
ADDING GEOCODER
--------------------------------------------------------------------*/
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        useBrowserFocus: true,
        mapboxgl: mapboxgl
    })
);

map.addControl(new mapboxgl.NavigationControl());

/* Return button */

document.getElementById('return_button').addEventListener('click', () => {
        map.flyTo({
            center: [-79.39, 43.70],
            zoom: 11,
        });
    });
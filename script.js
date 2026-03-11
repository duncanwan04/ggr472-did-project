
mapboxgl.accessToken = "pk.eyJ1IjoiZHVuY2FuLXdhbjA0IiwiYSI6ImNta2U4Y3c1MTA0ZjczZW9mMXpqc2VidmoifQ.RxHABogPiEWD0gDBm5pA8w";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/duncan-wan04/cmlgpvpnz000t01s32ah007xw",
    center: [-79.39, 43.70],
    zoom: 11,
});


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
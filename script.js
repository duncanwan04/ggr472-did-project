
mapboxgl.accessToken = "pk.eyJ1IjoiZHVuY2FuLXdhbjA0IiwiYSI6ImNta2U4Y3c1MTA0ZjczZW9mMXpqc2VidmoifQ.RxHABogPiEWD0gDBm5pA8w";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/duncan-wan04/cmlgpvpnz000t01s32ah007xw",
    center: [-79.39, 43.70],
    maxBounds: [
        [-79.90, 43.50],
        [-79.00, 43.90] 
    ],
    zoom: 11,
});

/*--------------------------------------------------------------------
SETTING UP 
--------------------------------------------------------------------*/
let collision_data;
let hex_base;
let safety_visible = true;

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

document.getElementById('return_button').addEventListener('click', () => {
        map.flyTo({
            center: [-79.39, 43.70],
            zoom: 11,
        });
    });


map.on("zoom", () => {
    console.log("Zoom:", map.getZoom());
});

map.on('load', async () => {
    /*--------------------------------------------------------------------
    SAFETY SECTION
    --------------------------------------------------------------------*/
    /// Using const to get data because I need to use this dataset for HexGrid in Turf, which requires
    /// the data/json to be stored in the local javascript instead of having Mapbox fetch my data

    const collision_url = await fetch(
        "https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/main/data/cleaned_traffic_collisions.geojson");

    collision_data = await collision_url.json();

    /// turning it from multipoint to point so we can use the point in polygon geometry later in turf
    collision_data.features.forEach(feature => {
        if (feature.geometry.type === "MultiPoint") {
            const first_coordinate = feature.geometry.coordinates[0];
            feature.geometry = {
                type: "Point",
                coordinates: first_coordinate
            };
        }
    });

    const envresult = turf.envelope(collision_data);
    const bboxscaled = turf.transformScale(envresult, 1.05)
    const bboxcoords = [
        bboxscaled.geometry.coordinates[0][0][0],
        bboxscaled.geometry.coordinates[0][0][1],
        bboxscaled.geometry.coordinates[0][2][0],
        bboxscaled.geometry.coordinates[0][2][1],
    ];
    hex_base = turf.hexGrid(bboxcoords, 0.25, {units: "kilometers"});

    console.log("collision_data:", collision_data);

    /// initially empty, it is updated after year-filter is ran
    map.addSource("collision_hexgrids", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        }
    });

    map.addLayer({
        id: "collision-hexgrids-layer",
        type: "fill",
        source: "collision_hexgrids",
        layout: {visibility: "visible"},
        paint: {
            "fill-color": all_scale,
            "fill-outline-color": [
                "case",
                [">", ["get", "collision_count_hex"], 0],
                "rgba(14, 14, 14, 0.25)",
                "rgba(0,0,0,0)"
            ],
            "fill-opacity": 0.5
        }
    });

    map.addSource("fatal_collision_points", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        }
    });

    map.addLayer({
        id: "fatal-collision-points-layer",
        type: "circle",
        source: "fatal_collision_points",
        layout: {visibility: "visible"},
        paint: {
            "circle-radius": 5,
            "circle-color": "#d73027",
            "circle-stroke-width": 1
        }
    });

    updating_safety_layer("all");

    /*--------------------------------------------------------------------
    TRAFFIC FLOW SECTION
    --------------------------------------------------------------------*/

    map.addSource('traffic_flow', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/refs/heads/main/data/cleaned_cordon_counts.geojson'
    });

    map.addLayer({
        'id': 'traffic-flow-layer',
        'type': 'circle',
        'source': 'traffic_flow',
        'paint': {
            'circle-radius': [
                'step',
                ['zoom'],
                ['*', ['sqrt', ['get', 'cycling_volume']], 0.2],
                11, ['*', ['sqrt', ['get', 'cycling_volume']], 0.4],
                12,   ['*', ['sqrt', ['get', 'cycling_volume']], 0.5],
                13,   ['*', ['sqrt', ['get', 'cycling_volume']], 0.7],
                ],
            'circle-color': [
                'case',
                ['==', ['get', 'bikelane_usage_percentage'], null],
                '#6E6B6B', 

                ['step',
                ['get', 'bikelane_usage_percentage'],
                "#e5f5e0",
                0.0001, "#a1d99b",
                50, "#74c476",
                80, '#31a354',
                95, '#006d2c']
            ],
            'circle-opacity': 0.5
            }
    });

    /*--------------------------------------------------------------------
    INFRASTRUCTURE LAYER 
    --------------------------------------------------------------------*/
    map.addSource('infrastructure', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/main/data/cycling_network.geojson'
    });

    map.addLayer({
        'id': 'infrastructure-layer',
        'type': 'line',
        'source': 'infrastructure',
    });

    /*--------------------------------------------------------------------
    BIKESHARE LAYER
    --------------------------------------------------------------------*/
    map.addSource('bikeshare', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/duncanwan04/ggr472-did-project/refs/heads/main/data/bikeshare_stations.geojson'
    });

    map.addLayer({
        'id': 'bikeshare-layer',
        'type': 'circle',
        'source': 'bikeshare',
    });

});


/*--------------------------------------------------------------------
TURNING LAYERS ON/OFF
--------------------------------------------------------------------*/
document.getElementById("toggle_safety").addEventListener("click", () => {
    const visibility_status = map.getLayoutProperty('collision-hexgrids-layer', 'visibility');
    const safety_legend = document.getElementById("safety_legend");
    safety_visible = !safety_visible;
    
    if (safety_visible){
        map.setLayoutProperty('collision-hexgrids-layer', 'visibility', 'visible');
        map.setLayoutProperty('fatal-collision-points-layer', 'visibility', 'visible');
        if (fatalities_button.checked) {
            map.setLayoutProperty('fatal-collision-points-layer', 'visibility', 'visible');
            safety_legend.style.display = "block";
        }
    } else {
       map.setLayoutProperty('collision-hexgrids-layer', 'visibility', 'none'); 
       map.setLayoutProperty('fatal-collision-points-layer', 'visibility', 'none');
       safety_legend.style.display = "none";
    }
}); 

document.getElementById("toggle_traffic").addEventListener("click", () => {
    const visibility_status = map.getLayoutProperty('traffic-flow-layer', 'visibility');
    const traffic_flow_legend = document.getElementById("traffic_flow_legend");
    if (visibility_status === "none"){
        map.setLayoutProperty('traffic-flow-layer', 'visibility', 'visible');
        traffic_flow_legend.style.display = "block";
    } else {
       map.setLayoutProperty('traffic-flow-layer', 'visibility', 'none'); 
       traffic_flow_legend.style.display = "none";
    }
}); 

document.getElementById("toggle_infrastructure").addEventListener("click", () => {
    const visibility_status = map.getLayoutProperty('infrastructure-layer', 'visibility');
    const traffic_flow_legend = document.getElementById("infrastructure_legend");
    if (visibility_status === "none"){
        map.setLayoutProperty('infrastructure-layer', 'visibility', 'visible');
        traffic_flow_legend.style.display = "block";
    } else {
       map.setLayoutProperty('infrastructure-layer', 'visibility', 'none'); 
       traffic_flow_legend.style.display = "none";
    }
}); 

document.getElementById("toggle_bikeshare").addEventListener("click", () => {
    const visibility_status = map.getLayoutProperty('bikeshare-layer', 'visibility');
    const traffic_flow_legend = document.getElementById("bikeshare_legend");
    if (visibility_status === "none"){
        map.setLayoutProperty('bikeshare-layer', 'visibility', 'visible');
        traffic_flow_legend.style.display = "block";
    } else {
       map.setLayoutProperty('bikeshare-layer', 'visibility', 'none'); 
       traffic_flow_legend.style.display = "none";
    }
}); 

/*--------------------------------------------------------------------
SAFETY/COLLISION SECTION (Hexgrid)

Setting up 4 functions
Adding color scale changes
Adding pop
--------------------------------------------------------------------*/
/// function 1: filters original data to get data in the years we want
function filter_collisions_by_year(selected_year) {
    if (selected_year === "all") {
        return collision_data;
    }

    return {
        type: "FeatureCollection",
        features: collision_data.features.filter(feature =>
            feature.properties.OCC_YEAR === Number(selected_year)
        )
    };
}

/// function 2: using the data from the years we want (funciton 1), we build hexgrids
/// within each hexagon, we build the relevant attributes we want to give it
function building_hexgrids(collisions_filtered){
    const hexdata = structuredClone(hex_base);
    /// we clone the hexagons (hexbase) we made above and update each hexagon based on the filtered year values
    hexdata.features.forEach((hexagon) => {
        let collision_count = 0
        let injury_count = 0
        let fatality_count = 0

        collisions_filtered.features.forEach(point => {
            if (turf.booleanPointInPolygon(point, hexagon)){
                collision_count = collision_count + 1;
            
                if (point.properties.INJURY_COLLISIONS == "YES"){
                    injury_count = injury_count + 1
                }

                fatality_count = fatality_count + point.properties.FATALITIES
            }
        });

        /// if collision_count > 0, then we find proportion, if not, return 0
        let injury_proportion = collision_count > 0
            ? (injury_count / collision_count) * 100
            : 0;

        hexagon.properties.collision_count_hex = collision_count;
        hexagon.properties.fatality_count_hex = fatality_count;
        hexagon.properties.injury_proportion_hex = injury_proportion;
        });

    /// get all collision counts, to know how to choropleth color the data
        const counts = hexdata.features.map(f => f.properties.collision_count_hex);

        // // build frequency distribution
        // const distribution = {};

        // counts.forEach(c => {
        //     distribution[c] = (distribution[c] || 0) + 1;
        // });

        // // print nicely
        // console.log("collision count distribution:");
        // console.table(distribution);

    return hexdata
}

    /// Paint Layer, changes depending on the scale (all years, or single year)
        const all_scale = [
            "step",
            ["get", "collision_count_hex"],
            "rgba(0,0,0,0)",
            1, "#deebf7",
            3, "#c6dbef",
            6, "#9ecae1",
            11, "#6baed6",
            20, "#4292c6",
            30, "#2171b5",
            40, "#045296"
        ];

        const year_scale = [
            "step",
            ["get", "collision_count_hex"],
            "rgba(0,0,0,0)",
            1, "#deebf7",
            2, "#c6dbef",
            3, "#9ecae1",
            4, "#6baed6",
            6, "#4292c6",
            8, "#2171b5",
            12, "#045296"
        ];
        
/// function 3: gets the collision points that resulted in fatalities
function filter_fatal_collisions_by_year(selected_year) {
    if (selected_year === "all") {
        return {
            type: "FeatureCollection",
            features: collision_data.features.filter(feature =>
                Number(feature.properties.FATALITIES) > 0
            )
        };
    }
    return {
        type: "FeatureCollection",
        features: collision_data.features.filter(feature =>
            feature.properties.OCC_YEAR === Number(selected_year) &&
            Number(feature.properties.FATALITIES) > 0
        )
    };
}

/// function 4: Updating legend based on selected year 
function update_legend(selected_year) {
    const safety_legend = document.getElementById("safety_legend");

    if (selected_year === "all") {
        safety_legend.innerHTML = `
            <h4>Collision Count</h4>
            <div><span></span> 0</div>
            <div><span></span> 1–2</div>
            <div><span></span> 3–5</div>
            <div><span></span> 6–10</div>
            <div><span></span> 11–19</div>
            <div><span></span> 20–29</div>
            <div><span></span> 30–39</div>
            <div><span></span> 40+</div>
        `;
    } else {
        safety_legend.innerHTML = `
            <h4>Collision Count</h4>
            <div><span></span> 0</div>
            <div><span></span> 1</div>
            <div><span></span> 2</div>
            <div><span></span> 3</div>
            <div><span></span> 4-5</div>
            <div><span></span> 6-7</div>
            <div><span></span> 8-11</div>
            <div><span></span> 12+</div>
        `;
    }
}

/// function 5: using hexgrids we built from function 2, we update the layer and colors in the map section above 
function updating_safety_layer(selected_year){
    const collisions_filtered = filter_collisions_by_year(selected_year);
    const hexgrids = building_hexgrids(collisions_filtered);
    /// get source pulls the source layer called collision_hexgrid, setData sets hexgrid as data for that layer
    map.getSource("collision_hexgrids").setData(hexgrids);

    const fatal_collisions_filtered = filter_fatal_collisions_by_year(selected_year);
    map.getSource("fatal_collision_points").setData(fatal_collisions_filtered);

    /// to update the color scale 
    if (selected_year === "all") {
        map.setPaintProperty("collision-hexgrids-layer", "fill-color", all_scale);
    } else {
        map.setPaintProperty("collision-hexgrids-layer", "fill-color", year_scale);
    }
    update_legend(selected_year);
}

/// Calls the previous functions based on changes in dropmenu value
const year_dropdown = document.getElementById("year-filter");
year_dropdown.addEventListener("change", function () {
    const selected_year = year_dropdown.value;
    updating_safety_layer(selected_year);
});

/// Shows fatal incidents (on/off button)
const fatalities_button = document.getElementById('fatalities_button');
fatalities_button.addEventListener('change', () =>{
    if (fatalities_button.checked && safety_visible) {
        map.setLayoutProperty('fatal-collision-points-layer', 'visibility', 'visible');
    } else {
    map.setLayoutProperty('fatal-collision-points-layer', 'visibility', 'none');
    }
})
console.log(document.getElementById("fatalities_button"));

/// Filters Collisions by proportion of injuries
const injury_slider = document.getElementById("injury_slider");
const injury_input = document.getElementById("injury_input");

/// event listener, every time the input changes, this thing runs
/// updates the slider to match input value, and the same the other way

injury_input.addEventListener('input', () =>{
    injury_slider.value = injury_input.value
})

injury_slider.addEventListener('input', () =>{
    injury_input.value = injury_slider.value
})

function injury_filter(){
    map.setFilter('collision-hexgrids-layer', 
        ['>=', ['get', 'injury_proportion_hex'], parseFloat(injury_slider.value)],
    );
    /// because the slider.value returns a string, it won't compare or 
    /// work well with the inequality signs. parseFloat turns string to number
}

injury_slider.addEventListener('input', () => {
    injury_filter();
});


/// Adding pop-up menu 
map.on('click', 'collision-hexgrids-layer', (e) => {
    const f = e.features[0].properties; /// to simplify code below
    new mapboxgl.Popup() // Declare new popup object on each click
        .setLngLat(e.lngLat) // Use method to set coordinates of popup based on mouse click location
        .setHTML(
            "<h1>Grid</h1>" +
            "Collision Count: " + f.collision_count_hex + "<br>" + "<br>" +
            "Fatality Count: " + f.fatality_count_hex + "<br>" + "<br>" +
            "Collisions with Injuries (%): " + f.injury_proportion_hex.toFixed(2) +"%")
        .addTo(map); // Show popup on map
});

/*--------------------------------------------------------------------
TRAFFIC FLOW SECTION
--------------------------------------------------------------------*/

/// cyling volume slider/filter
    const cycling_volume_slider = document.getElementById("cycling_volume_slider");
    const cycling_volume_input = document.getElementById("cycling_volume_input");

        function traffic_flow_filter(){
            map.setFilter('traffic-flow-layer', 
                ["all",
                    ['>=', ['get', 'cycling_volume'], parseFloat(cycling_volume_slider.value)],
                ]
            );
        }

        cycling_volume_input.addEventListener('input', () =>{
            cycling_volume_slider.value = cycling_volume_input.value;
            traffic_flow_filter();
        })

        cycling_volume_slider.addEventListener('input', () =>{
            cycling_volume_input.value = cycling_volume_slider.value;
            traffic_flow_filter();
        })



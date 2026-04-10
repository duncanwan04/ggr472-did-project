# Toronto Cycling Safety Map

An interactive web map visualising cycling infrastructure, collision data, and traffic flow across Toronto. The project was developed to help users explore how infrastructure quality, cycling demand, and collision risk interact spatially across the city.

# Project Overview

Cycling is an increasingly important mode of transportation in Toronto, but cycling safety is shaped by uneven infrastructure quality, traffic conditions, and collision exposure. This web map brings together multiple datasets into a single platform so users can identify high-risk areas, compare infrastructure types, and better understand where cycling demand may not be matched by adequate protection. The map is intended for city planners, public health professionals, cycling advocacy groups, and members of the public interested in cycling safety and infrastructure.

## Features

### Safety Layer
- exgrid visualization of cycling collisions from 2020 to 2025
- Year filter to view collisions by year
- Injury percentage slider to filter based on the proportion of collisions resulting in injuries
- Fatal collision toggle to display fatal incidents as point features
- Pop-up on click showing collision count and injury percentage for each hexgrid cell

### Infrastructure Layer
- Colour-coded cycling network by infrastructure type
- Categories include: Sharrows, On-Road Bike Lanes, Physically Separated Infrastructure, Off-Road / Trail
- Checkbox filtering for each infrastructure type
- Layer toggle for turning the infrastructure layer and legend on or off

### Traffic Flow Layer
- Proportional symbol map showing bicycle and micromobility cordon counts
- Filters for: Cycling volume, Bike lane usage percentage
- Hover interaction showing cycling count and usage details for each count location

### Collision Hotspot Layer
- Displays the top 20 collision hotspots by infrastructure type
- Summary statistics panel comparing selected hotspot averages to the overall hexgrid average

## Data Sources

All datasets were obtained from the City of Toronto Open Data Portal.
- Cycling Network: [City of Toronto Open Data](https://open.toronto.ca/dataset/cycling-network/)
- Traffic Collisions: [Toronto Police Services — Police Annual Statistical Report](https://open.toronto.ca/dataset/police-annual-statistical-report-traffic-collisions/)
- Cordon Counts: [City of Toronto — Bicycle and Micromobility Cordon Count](https://open.toronto.ca/dataset/bicycle-and-micromobility-cordon-count/)

## Data Preparation and Methods

- The original traffic collision dataset was filtered to include only cycling-related collisions from 2020 to 2025. Unnecessary attributes were removed to improve performance and reduce file size.
- Collision data geometries were converted from multipoint to point format to support Turf.js spatial analysis functions.
- Cycling infrastructure types were grouped from 17 detailed categories into four broader classes to improve readability.
- Cordon count data was processed to calculate cycling-specific traffic volumes and bike lane usage proportions.
- Hexgrid layers were generated from collision data to support hotspot analysis.
- Infrastructure intersections with hotspot hexgrids were preprocessed in ArcGIS Pro and then exported as GeoJSON for efficient display in the browser.

## Technologies

- Mapbox GL JS v3.18.1 for map rendering and interactive controls
- Turf.js v7 for client-side geospatial analysis
- HTML / CSS / JavaScript for webpage structure, styling, and functionality
- Python (GeoPandas) for data cleaning and preprocessing
- ArcGIS Pro for spatial intersection processing and hotspot preparation


## Authors

Isabella, Duncan, Dakota — GGR472 Developing Web Maps, University of Toronto, Winter 2026

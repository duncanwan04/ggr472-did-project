# Toronto Cycling Safety Map

An interactive web map visualising cycling infrastructure, collision data, and traffic flow across Toronto.

## Features

- **Safety (Collisions)**: Hexgrid map of cycling collisions (2020–2025) with year filter, injury percentage slider, and fatal collision toggle
- **Infrastructure**: Colour-coded cycling network by type (Sharrows, On-Road Bike Lane, Physically Separated, Off-Road / Trail) with checkbox filtering
- **Traffic Flow**: Proportional symbol map of cordon counts (2022) filtered by cycling volume and bike lane usage percentage
- **Collision Hotspots**: Top 20 collision hotspots by infrastructure type, cross-referenced with collision severity

## Data Sources

- Cycling Network: [City of Toronto Open Data](https://open.toronto.ca/dataset/cycling-network/)
- Traffic Collisions: [Toronto Police Services — Police Annual Statistical Report](https://open.toronto.ca/dataset/police-annual-statistical-report-traffic-collisions/)
- Cordon Counts: [City of Toronto — Bicycle and Micromobility Cordon Count](https://open.toronto.ca/dataset/bicycle-and-micromobility-cordon-count/)

## Technologies

- Mapbox GL JS v3.18.1
- Turf.js v7
- HTML / CSS / JavaScript

## Authors

Isabella, Duncan, Dakota — GGR472 Developing Web Maps, University of Toronto, Winter 2026

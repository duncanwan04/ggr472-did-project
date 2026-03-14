
import geopandas as gpd
import numpy as np

gdf = gpd.read_file("/Users/duncan/Desktop/GGR472/Group Project/Raw File/Cordon Counts (2022).geojson")

print(gdf.columns)
print(len(gdf))

#Keeping following columns
gdf = gdf[[
    "_id",
    "Site ID",
    "Count Year",
    "Cordon",
    "Screenline",
    "One-Way Street Direction",
    "Road Classification",
    "Cycling Infrastructure",
    "Total Volume",
    "Standard Bicycle Type",
    "Cargo Bicycle Type",
    "Bike Share Type",
    "E-Bicycle Type",
    "Bike Lane or Trail Infrastructure Use",
    "Sidewalk Infrastructure Use",
    "Roadway Infrastructure Use",
    "geometry"
]]

#Renaming Columns
gdf = gdf.rename(columns={
    "Total Volume": "total_volume",
    "Bike Lane or Trail Infrastructure Use": "bikelane_usage",
    "Sidewalk Infrastructure Use": "sidewalk_usage",
    "Roadway Infrastructure Use": "roadway_usage",
    })

#Making new column to count cycling count (since total count includes non-bicycle micromobility)
gdf["cycling_volume"] = (
    gdf["Standard Bicycle Type"] +
    gdf["Cargo Bicycle Type"] +
    gdf["Bike Share Type"] +
    gdf["E-Bicycle Type"]
)

#Making new column to find proportion of microbility users that use bikelane
gdf["total_volume"] = gdf["total_volume"].astype("int32")

gdf["bikelane_usage_percentage"] = np.where(
    (gdf["Cycling Infrastructure"] == "None"), np.nan,
    gdf["bikelane_usage"] / gdf["total_volume"] * 100
)

#Turning the data from mulitpoints to points (they only have 1 coordinate to begin with)
gdf["geometry"] = gdf.geometry.apply(lambda geom: geom.geoms[0])

gdf.to_file(
"/Users/duncan/Desktop/GGR472/Group Project/ggr472-did-project/data/cleaned_cordon_counts.geojson",
driver="GeoJSON"
)

gdf.to_csv(
"/Users/duncan/Desktop/GGR472/Group Project/ggr472-did-project/data/cleaned_cordon_counts.csv", index = False
)
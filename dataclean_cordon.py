
import geopandas as gpd

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

#Turning the data from mulitpoints to points (they only have 1 coordinate to begin with)
gdf["geometry"] = gdf.geometry.apply(lambda geom: geom.geoms[0])

gdf.to_file(
"/Users/duncan/Desktop/GGR472/Group Project/ggr472-did-project/data/cleaned_cordon_counts.geojson",
driver="GeoJSON"
)

gdf.to_csv(
"/Users/duncan/Desktop/GGR472/Group Project/ggr472-did-project/data/cleaned_cordon_counts.csv", index = False
)
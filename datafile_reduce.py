
import geopandas as gpd

gdf = gpd.read_file("/Users/duncan/Desktop/GGR472/Group Project/Other/Traffic Collisions.geojson")

print(gdf.columns)
print(len(gdf))

#Getting 2020-2025 data
#Because OCC_YEAR is string right now, we must convert to integer first
gdf["OCC_YEAR"] = gdf["OCC_YEAR"].astype(int)
gdf = gdf[gdf["OCC_YEAR"] > 2019]

#Keep valid coordinates (some lats/lons are 0, which are clearly invalid)
gdf = gdf[gdf["LONG_WGS84"] != 0]
gdf = gdf[gdf["LAT_WGS84"] != 0]

#Getting rows only where there was a biking incident 
gdf = gdf[gdf["BICYCLE"] == "YES"]

#Replacing Fatalities = blank with 0 instead 
gdf["FATALITIES"] = gdf["FATALITIES"].fillna(0)

#Replacing Injury_collisions = none to NO for consistency
gdf["INJURY_COLLISIONS"] = gdf["INJURY_COLLISIONS"].replace("None", "NO")

#Keeping following columns
gdf = gdf[[
    "OCC_MONTH",
    "OCC_DOW",
    "OCC_YEAR",
    "OCC_HOUR",
    "FATALITIES",
    "INJURY_COLLISIONS",
    "FTR_COLLISIONS",
    "PD_COLLISIONS",
    "NEIGHBOURHOOD_158",
    "LONG_WGS84",
    "LAT_WGS84",
    "geometry"
]]

gdf.to_file(
"/Users/duncan/Desktop/GGR472/Group Project/ggr472-did-project/data/cleaned_traffice_collisions.geojson",
driver="GeoJSON"
)
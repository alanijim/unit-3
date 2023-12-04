// Begin script when window loads
window.onload = setMap;

// Set up choropleth map
function setMap() {
    // Use Promise.all to parallelize asynchronous data loading
    var promises = [
        d3.csv("data/GeographyRegionsData.csv"),
        d3.json("data/GeographyRegion.topojson")
    ];

    Promise.all(promises)
        .then(callback)
        .catch(function (error) {
            console.log("Error loading data:", error);
        });

    function callback(data) {
        var csvData = data[0],
            regions = data[1];

        // Check if the TopoJSON object exists
        if (!regions || !regions.objects || !regions.objects.GeographyRegion) {
            console.log("Error: TopoJSON object not found or has incorrect structure");
            return;
        }

        // Translate GeographyRegions TopoJSON
        var geographyRegions = topojson.feature(regions, regions.objects.GeographyRegion);

        // Check if features exist
        if (!geographyRegions || !geographyRegions.features) {
            console.log("Error: No features found in TopoJSON");
            return;
        }

        // Convert the TopoJSON to GeoJSON
        var geoJsonData = {
            type: "FeatureCollection",
            features: geographyRegions.features.map(function (feature) {
                return {
                    type: "Feature",
                    properties: feature.properties,
                    geometry: feature.geometry
                };
            })
        };

        console.log(geoJsonData);
    }
}

// begin script when window loads
window.onload = setMap();

// set up choropleth map
function setMap() {
    // map frame dimensions
    var width = 960,
        height = 460;

    // create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    // use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/GeographyRegionsData.csv")); // load attributes from csv    
    promises.push(d3.json("data/GeographyRegionz.topojson")); // load background spatial data    
    
    Promise.all(promises).then(callback);

    // use Promise.all to parallelize asynchronous data loading
    function callback(data) {
        var csvData = data[0],
            regionData = data[1];

        var geographyRegions = topojson.feature(regionData, regionData.objects.GeographyRegionz);

        // add France regions to map
        var regions = map.selectAll(".regions")
            .data(geographyRegions.features)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.NE_ID;
            })
            .attr("d", path);

        console.log(csvData);
        console.log(regions);
    }
}

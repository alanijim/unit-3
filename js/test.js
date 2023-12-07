// begin script when window loads
window.onload = setMap();

// set up choropleth map
function setMap() {
    // map frame dimensions
    var width = 700,
        height = 400; //just setting to make it easier to preview

    // create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // // create Albers equal area conic projection centered on France
    // var projection = d3.geoAlbers()
    //     .center([0, 46.2])
    //     .rotate([-2, 0, 0])
    //     .parallels([43, 62])
    //     .scale(2500)
    //     .translate([width / 2, height / 2]);

    // Define projection
    var projection = d3.geoRobinson()
            .scale(100) // Adjust as needed
            .translate([width / 2, height / 2]); // Center the map
;

    var path = d3.geoPath()
        .projection(projection);

    // use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/GeographyRegionsData.csv")); // load attributes from csv   
    promises.push(d3.json("data/Land.topojson")); 
    promises.push(d3.json("data/GeographyRegionz.topojson")); // load background spatial data  
  
    
    Promise.all(promises).then(callback);

    // use Promise.all to parallelize asynchronous data loading
    function callback(data) {
        var csvData = data[0],
            land = data[1],
            regionData = data[2];

            console.log(land);

        var geographyRegions = topojson.feature(regionData, regionData.objects.GeographyRegionz);
        var geoland = topojson.feature(land, land.objects.ne_50m_land);

              // // add land to map
              var land = map.selectAll(".land")
              .data(geoland.features)
              .enter()
              .append("path")
              .attr("class", "land")
              .attr("d", path)
              .style("fill", "green") // Add fill color
              .style("stroke", "black"); // Add stroke color;

        // add  regions to map
        var regions = map.selectAll(".regions")
            .data(geographyRegions.features)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.NE_ID;
            })
            .attr("d", path)
            .style("fill", "blue") // Add fill color
            .style("stroke", "black"); // Add stroke color;

  

    
        console.log(csvData);
        console.log(regions);

        
    }

    // add graticles to the map
    var graticles = map.append("path")
        .datum(d3.geoGraticule())
        .attr("class", "graticles")
        .attr("d", path);

}

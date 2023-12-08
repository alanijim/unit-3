// begin script when window loads
window.onload = setMap();

// set up choropleth map
function setMap() {
    // map frame dimensions
    var width = 700,
        height = 400;

    // create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // create Albers equal area conic projection centered on France
    var projection = d3.geoRobinson()
            .scale(100) // Adjust as needed
            .translate([width / 2, height / 2]); // Center the map

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

        var geographyRegions = topojson.feature(regionData, regionData.objects.GeographyRegionz);
        var geoland = topojson.feature(land, land.objects.ne_50m_land);

    // add land to map
        var land = map.selectAll(".land")
            .data(geoland.features)
            .enter()
            .append("path")
            .attr("class", "land")
            .attr("d", path)
            .style("fill", "green") // Add fill color
            .style("stroke", "black"); // Add stroke color;

        // add region to map
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
        var graticles = map.append("path")
        .datum(d3.geoGraticule())
        .attr("class", "graticles")
        .attr("d", path);

                //create graticule generator
        var graticule = d3.geoGraticule()
        .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
}

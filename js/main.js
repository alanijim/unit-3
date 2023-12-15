(function() {
    var expressed = "varA";
    // Set up choropleth map
    function setMap() {
        //map frame dimensions
        var width = window.innerWidth * 0.5,
        height = 460;

        var chartWidth = window.innerWidth * 0.5,
        chartHeight = 460;

        // Create new SVG container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // Create Albers equal area conic projection centered on Region
        var projection = d3.geoRobinson()
            .scale(100) // Adjust as needed
            .translate([width / 2, height / 2]); // Center the map

        var path = d3.geoPath()
            .projection(projection);

        // Use Promise.all to parallelize asynchronous data loading
        var promises = [
            d3.csv("data/GeographyRegionsData.csv"), // Load attributes from CSV
            d3.json("data/GeographyRegionz.topojson") // Load background spatial data
        ];

        Promise.all(promises).then(callback);

        // Callback function after data loading
        function callback(data) {
            var csvData = data[0];
            var regionData = data[1];

            var geographyRegionz = topojson.feature(regionData, regionData.objects.GeographyRegionz);

            geographyRegionz = joinData(geographyRegionz, csvData);

            // Create the color scale
            var colorScale = makeColorScale(csvData);

            var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

           //create a scale to size bars proportionally to frame
            var yScale = d3.scaleLinear()
                .range([0, chartHeight])
                .domain([0, 105]);
    
        //set bars for each province
        var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.NE_ID;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed]));
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        });

        //annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.NE_ID;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed])) + 15;
        })
        .text(function(d){
            return d[expressed];
        });

        //create a text element for the chart title
        var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of Variable " + expressed[3] + " in each Geographyregion");

        // Add enumeration units to the map
        setEnumerationUnits(geographyRegionz, map, path, colorScale);

            //add coordinated visualization to the map
        setChart(csvData, colorScale);
        }

        function setGraticule(map, path) {
            // ... GRATICULE BLOCKS FROM CHAPTER 8
            // Add graticule background
            var gratBackground = map.append("path")
                .datum(d3.geoGraticule().outline()) // Bind graticule background
                .attr("class", "gratBackground") // Assign class for styling
                .attr("d", path); // Project graticule

            // Add graticule lines
            var gratLines = map.selectAll(".gratLines")
                .data(d3.geoGraticule().lines()) // Bind graticule lines
                .enter()
                .append("path")
                .attr("class", "gratLines")
                .attr("d", path); // Project graticule lines
        }

        function joinData(geographyRegionz, csvData) {
            // Variables for data join
            var attrArray = ["varA", "varB", "varC", "varD", "varE"];

            // Loop through CSV to assign each set of CSV attribute values to GeoJSON region
            for (var i = 0; i < csvData.length; i++) {
                var csvRegion = csvData[i]; // The current region
                var csvKey = csvRegion.NE_ID; // The CSV primary key

                // Loop through GeoJSON regions to find the correct region
                for (var a = 0; a < geographyRegionz.features.length; a++) {
                    var geojsonProps = geographyRegionz.features[a].properties; // The current region GeoJSON properties
                    var geojsonKey = geojsonProps.NE_ID; // The GeoJSON primary key

                    // Where primary keys match, transfer CSV data to GeoJSON properties object
                    if (geojsonKey == csvKey) {
                        // Assign all attributes and values
                        attrArray.forEach(function(attr) {
                            var val = parseFloat(csvRegion[attr]); // Get CSV attribute value
                            geojsonProps[attr] = val; // Assign attribute and value to GeoJSON properties
                        });
                    }
                }
            }

            return geographyRegionz;
        }

        function setEnumerationUnits(geographyRegionz, map, path, colorScale) {
            // Add regions to map
            var regions = map.selectAll(".regions")
                .data(geographyRegionz.features) // Access features of the GeoJSON collection
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "regions " + d.properties.NE_ID;
                })
                .attr("d", path)        
            .style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(d.properties[expressed]);            
                } else {                
                    return "#ccc";            
                }   
                });
        }
    }
    //function to create color scale generator
   //function to create color scale generator
        function makeColorScale(data) {
        var colorClasses = [
            "#D4B9DA",
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"
        ];

    // Create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    // Build array of all values of the expressed attribute
    var domainArray = [];
    for (var i = 0; i < data.length; i++) {
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    }

    // Cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    // Reset domain array to cluster minimums
    domainArray = clusters.map(function (d) {
        return d3.min(d);
    });
    // Remove the first value from the domain array to create class breakpoints
    domainArray.shift();

    // Assign the array of the last 4 cluster minimums as the domain
    colorScale.domain(domainArray);

    return colorScale;
}
//function to create coordinated bar chart
    function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
    .attr("class", "chartBackground")
    .attr("width", chartInnerWidth)
    .attr("height", chartInnerHeight)
    .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 100]);

    //set bars for each province
    var bars = chart.selectAll(".bar")
    .data(csvData)
    .enter()
    .append("rect")
    .sort(function(a, b){
        return b[expressed]-a[expressed]
    })
    .attr("class", function(d){
        return "bar " + d.adm1_code;
    })
    .attr("width", chartInnerWidth / csvData.length - 1)
    .attr("x", function(d, i){
        return i * (chartInnerWidth / csvData.length) + leftPadding;
    })
    .attr("height", function(d, i){
        return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr("y", function(d, i){
        return yScale(parseFloat(d[expressed])) + topBottomPadding;
    })
    .style("fill", function(d){
        return colorScale(d[expressed]);
    });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
    .attr("x", 40)
    .attr("y", 40)
    .attr("class", "chartTitle")
    .text("Number of Variable " + expressed[3] + " in each region");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
    .scale(yScale);

    //place axis
    var axis = chart.append("g")
    .attr("class", "axis")
    .attr("transform", translate)
    .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
    .attr("class", "chartFrame")
    .attr("width", chartInnerWidth)
    .attr("height", chartInnerHeight)
    .attr("transform", translate);
    };


    // Call setMap when window loads
    window.onload = setMap;
})();

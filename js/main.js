//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {
    //use Promise.all to parallelize asynchronous data loading

    var promises = [
        d3.csv("data/GeographyRegionsData.csv"),
        d3.json("data/GeographyRegions.topojson"),
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            region = data[1];


            var europeCountries = topojson.feature(region, region.objects.GeographyRegions);

        console.log(csvData);
        console.log(europeCountries);
    }
};
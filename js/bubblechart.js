// Add all scripts to the JS folder

window.onload = function(){

    //SVG dimension variables
    var w = 900, h = 500;
    var SummerSports = [
        { 
            town: 'Queens',
            attendance: 160000
        },
        {
            town: 'Manhattan',
            attendance: 397450
        },
        {
            town: 'Jersey City',
            attendance: 232556
        },
        {
            town: 'Elmont',
            attendance: 553000
        },
        {
            town: 'Elizabeth',
            attendance: 421554
        }
        ,
        {
            town: 'Orange',
            attendance: 50000
        }
    ];

    var minPop = d3.min(SummerSports, function(d){
        return d.attendance;
    });

    //find the maximum value of the array
    var maxPop = d3.max(SummerSports, function(d){
        return d.attendance;
    });

    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50])
        .domain([0, 700000]); //was minPop, maxPop

    var color = d3.scaleLinear()
    .range([
        "#FDBE85",
        "#D94701"
    ])
    .domain([
        minPop, 
        maxPop
    ]);

    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") //put a new svg in the body
        .attr("width", w) //assign the width
        .attr("height", h) //assign the height
        .attr("class", "container") //assign a class name
        .style("background-color", "rgba(0,0,0,0.2)"); //svg background color

    var innerRect = container.append("rect") //put a new rect in the svg
        .datum(400) //a single value is a datum
        .attr("width", function(d){ //rectangle width
            return d * 2; //400 * 2 = 800
        }) 
        .attr("height", function(d){ //rectangle height
            return d; //400
        })
        .attr("class", "innerRect") //class name
        .attr("x", 50) //position from left on the x (horizontal) axis
        .attr("y", 50) //position from top on the y (vertical) axis
        .style("fill", "#FFFFFF"); //fill color

    var x = d3.scaleLinear() //create the scale
        .range([90, 810]) //output min and max
        .domain([0, 5]); //input min and max

    
    
     var circles = container.selectAll(".circles") //create an empty selection
        .data(SummerSports) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
         return d.town;
     })
        .attr("r", function(d){
         //calculate the radius based on population value as circle area
         var area = d.attendance * 0.01;
         return Math.sqrt(area/Math.PI);
     })
        .attr("cx", function(d, i){
        //use the scale generator with the index to place each circle horizontally
        return x(i);
    })
    
        .attr("cy", function(d){
        return y(d.attendance);
    })
        .style("fill", function(d, i){ //add a fill based on the color scale generator
            return color(d.attendance);
        })
        .style("stroke", "#000"); //black circle stroke

    var yAxis = d3.axisLeft(y);

    //create axis g element and add axis
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);
       
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("Town attendances");
    
    var labels = container.selectAll(".labels")
        .data(SummerSports)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.attendance * 0.01 / Math.PI) + 5;
        })
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.attendance) + 5;
        });

    //first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.attendance * 0.01 / Math.PI) + 5;
        })
        .text(function(d){
            return d.town;
        });
    var format = d3.format(",");
    //second line of label
    var popLine = labels.append("tspan")
    .attr("class", "popLine")
    .attr("x", function(d,i){
        return x(i) + Math.sqrt(d.attendance * 0.01 / Math.PI) + 5;
    })
    .attr("dy", "15") //vertical offset
    .text(function(d){
        return "Att. " + format(d.attendance);
    });
    
};
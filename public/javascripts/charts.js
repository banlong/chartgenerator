/**
 * Created by NGHIEP NGO on 11/9/2016.
 */

var fs = require('fs');
var d3 = require('d3');
var xmlserializer = require('xmlserializer');
var gm = require('gm').subClass({ imageMagick: true });

//Bubble Chart
function drawBubbleChart(input) {
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var config = input.config;
    var chartId = input.id;
    var xData = input.xData;

    var showLegend = config.showLegend;
    if (!showLegend){
        showLegend = false;
    }
    //input dimensions
     var h = config.height;
     var w = config.width;


    var colors = [
        {fill: "yellow", stroke: "orange", text :"black"},
        {fill: "grey"  , stroke: "blue",   text :"white"},
        {fill: "black"  , stroke: "orange",   text :"white"},
        {fill: "magenta"  , stroke: "blue",   text :"yellow"},
        {fill: "green"  , stroke: "grey",   text :"black"},
        {fill: "blue"  , stroke: "yellow",   text :"white"},
        {fill: "orange"  , stroke: "black",   text :"blue"},
        {fill: "violet"  , stroke: "orange",   text :"white"},
        {fill: "pink"  , stroke: "blue",   text :"white"},
        {fill: "teal"  , stroke: "black",   text :"white"}
    ];
    var legendWidth = w, legendHeight = 100;

    //Chart dimension
    var margin = {top: 0, right: 40, bottom: 0, left: 50};
    var width =  w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    //Add the wrapper svg,
    //Must use d3 from the window because it is the context. at least for the first time
    var wsvg = window.d3.select(anchor)
        .append("svg")
        .attr("id", "wsvg")
        .attr("width", width)
        .attr("height", height + legendHeight);

    var svg = wsvg.append("svg")
        .attr("width", width).attr("height", height);

    // add some padding, when padding = 0 some elements were cut off.
    // Using padding to define the area  of displaying chart
    var innerPad = 0.00;        //no inner padding
    var outerPad = 0.50;        //outer pad = 50% tick size
    var topPad = 30;            //top padding

    //Define scales
    var xScale = window.d3.scale.ordinal()
        .domain(xData)
        .rangeRoundBands([margin.left, width], innerPad, outerPad);

    var maxScore = getMaxScore(data);
    var yScale = window.d3.scale.linear()
        .domain([0, maxScore])
        .range([height - topPad, 2*topPad]);

    var rScale = window.d3.scale.linear()
        .domain([0, maxScore])
        .range([10, 25]); //radius values will always fall within this range


    //Define axis
    var xAxis = window.d3.svg.axis()
        .scale(xScale)
        .tickFormat(function(d) {
            return d; })  //format x-tick data
        .ticks(xData.length)
        .tickPadding(3) //padding of tick label to the tick
        .orient("bottom");


    var yAxis = window.d3.svg.axis()
        .scale(yScale)
        //.ticks(5)
        .orient("left");


    //Add vertical lines
    var tickDistance =  data.length > 1 ? xScale(data[0].data[1].name)-xScale(data[0].data[0].name) : 0;
    var leftPadInPixel = tickDistance/2 + topPad;

    for (var orgIndex = 0; orgIndex < data.length ; orgIndex++){
        //Add vertical lines
        svg.selectAll("line")
            .data(data[orgIndex].data)
            .enter()
            .append("line")          // attach a line
            .style("stroke", "lightgrey")  // colour the line
            .attr("x1", function(node) {
                return leftPadInPixel  +  xScale(node.name)})     // x position of the first end of the line
            .attr("y1", function(node) {
                return  yScale(node.score) + rScale(node.score) + 2 })      // y position of the first end of the line
            .attr("x2", function(node) {
                return leftPadInPixel  +  xScale(node.name)})     // x position of the second end of the line
            .attr("y2", height - topPad);

    }


    for (var orgIndex = 0; orgIndex < data.length ; orgIndex++){
        //Add bubbles, bubble is above the vertical lines
        svg.selectAll("circle")
            .data(data[orgIndex].data)
            .enter()
            .append("circle")
            .attr("cx", function (node) {
                return (leftPadInPixel  +  xScale(node.name));
            })
            .attr("cy", function (node) {
                return yScale(node.score);
            })
            .attr("r", function (node) {
                return rScale(node.score);
            })
            //fill color
            .attr("fill", function (node, i) {
                var index = orgIndex % colors.length;
                return colors[index].fill
            })
            //color of boundary
            .attr("stroke", function (node, i) {
                var index = orgIndex % colors.length;
                return colors[index].stroke
            })
            //width of the boundary
            .attr("stroke-width", function (node) {
                return rScale(node.score) / 4;
            })
            //add tip to the bubble (show the org name)
            .append("svg:title")
            .text(function(node) {
                return data[orgIndex].name;
            });
    }

    for (var orgIndex = 0; orgIndex < data.length ; orgIndex++){
        //Add score texts
        var defaultTextLength = 20;
        svg.selectAll("text")
            .data(data[orgIndex].data)
            .enter()
            .append("text")
            .text(function (node) {
                return node.score;
            })
            .attr("x", function (node) {
                return leftPadInPixel - defaultTextLength/2  + 3 + xScale(node.name) ;
            })
            .attr("y", function (node) {
                return yScale(node.score) + 5;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", function (d, i) {
                var index = orgIndex % colors.length;
                return colors[index].text
            });

    }

    //Adding X-Axis
    svg.append("g")
        .attr("class", "axis")
        //position of x-axis
        .attr("transform", "translate(" + topPad +"," + (height - topPad) + ")")
        .call(xAxis);

    //Add y-axis
    var dy = "0.1em";
    svg.append("g")
        .attr("class", "y axis")
        //position of y-axis
        .attr("transform", "translate(" + (margin.left + topPad) + ",0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", dy)
        .attr("x", -40)
        .style("text-anchor", "end")
        .text("Score");


    //If opt is 'Show Legend'
    if(showLegend){
        // Add legend
        //var legendWidth = width, legendHeight = 100;
        var circleRadius = 10;
        var yTop = 30;
        var groupWidth = 100;
        //var svg = window.d3.select(anchor)
        var legend = wsvg.append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("y", height);


        var circles = legend.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        //set attr for circles, center x
        circles.attr("cx", function(d, i) {
            //x-position of the circle center
            return xScale(xData[0])*(1- 0.1*outerPad) + i*groupWidth;
        })
            //center y-position of the center
            .attr("cy", yTop)
            .attr("r", function(d) {
                //radius of the circle
                return circleRadius;
            })
            //fill color
            .attr("fill", function(d, i){
                var colorIndex = orgIndex % colors.length;
                var color = colors[colorIndex];
                return color.fill
            })
            //color of boundary
            .attr("stroke", function(d, i){
                var colorIndex =  orgIndex % colors.length;
                var color = colors[colorIndex];
                return color.stroke
            })
            //width of the boundary
            .attr("stroke-width", function(d) {
                return 3;
            });

        //Add texts
        legend.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function (org) {
                return org.name;
            })
            .attr("x", function (org, i) {
                return xScale(xData[0])*(1-0.1*outerPad) + circleRadius + 3 + i*groupWidth;
            })
            .attr("y", function (d) {
                return yTop + 5;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");
    }

    //Stream PNG back in response
    streamPNG(window, res, "#wsvg", chartId);

    //Option 2 - Save SVG to PNG using GM
    //var svgFile = "bubble.svg", imageFile = "bubble.png";
    //fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
    //    if(err){
    //        console.log(err);
    //    }else{
    //        console.log("SVG created");
    //        convertSvg2Png(svgFile, imageFile);
    //    }
    //
    //});
    //res.send(window.d3.select("body").html());
}

//Line Chart
function drawLineChart(input){
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var config = input.config;
    var chartId = input.id;
    var xData = input.xData;
    var h = config.height;
    var w = config.width;

    var showLineLabel = config.showLineLabel;
    if (!showLineLabel){
        showLineLabel = false;
    }

    //Chart dimension
    var margin = {top: 40, right: 40, bottom: 40, left: 50};
    var width =  w - margin.left - margin.right;    //900
    var height = h - margin.top - margin.bottom;   //430
    var colors = ['#99CC00','#FFCC00','#FF9900','#FF6600','#666699','#969696','#003366','#339966','#003300','#333300','#993300','#333399','#7EBC89'];

    var maxScore = getMaxScore(data);
    var padding = 20;

    //Add the svg,
    //Must use d3 from the window because it is the context. at least for the first time
    var svg = window.d3.select(anchor)
        .append("svg")
        .attr("id", "wsvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    //Define scales
    var roundBand = 0.5;
    var xScale = window.d3.scale.ordinal()
        .domain(xData)
        .rangeRoundBands([margin.left, width-padding], roundBand);


    //var xScale = d3.time.scale().range([0, width]);
    var yScale = window.d3.scale.linear()
        .domain([0, maxScore])
        .range([height- padding, 2*padding]);

    // Define the axes
    var xAxis = window.d3.svg.axis()
        .scale(xScale)
        //format x-tick data
        .tickFormat(function(d) {
            return d; })
        .ticks(xData.length)
        .orient("bottom");

    var yAxis = window.d3.svg.axis()
        .scale(yScale)
        .orient("left");
    //.ticks(5);

    // Define the line
    var valueline = window.d3.svg.line()
        .x(function(d) { return xScale(d.name)+ 2*padding - 8; })
        .y(function(d) { return yScale(d.score); });

    //Draw lines
    for(var i = 0; i<data.length; i++){
        var orgColorIndex = i % colors.length;
        var orgName = data[i].name;
        var lineData = data[i].data;
        // Add the value line path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(lineData))
            .attr("stroke", colors[orgColorIndex])
            .attr("stroke-width", 2)
            .attr("fill", "none");

        //Add vertical lines
        svg.selectAll("line")
            .data(lineData)
            .enter()
            .append("line")          // attach a line
            .style("stroke", "lightgrey")  // colour the line
            // x position of the first end of the line
            .attr("x1", function(d) {
                return xScale(d.name)+ 2*padding - 8;
            })
            // y position of the first end of the line
            .attr("y1", function(d) {
                return  yScale(d.score) })
            // x position of the second end of the line
            .attr("x2", function(d) {
                return xScale(d.name)+ 2*padding - 8})
            .attr("y2", height - padding - 1);


        //If select option Add label to the line
        if(showLineLabel){
            svg.append("text")
                //.attr("transform", "translate(" + (width - 2*padding) + "," + yScale(d3.max(lineData, function(d) { return d.score; })) + ")")
                .attr("dy", ".35em")
                //.attr("dx", xScale(function(d) { return d.name; }) - padding)
                .attr("text-anchor", "start")
                .style("fill", "black")
                .attr("font-family", "sans-serif")
                .attr("font-size", 11)
                .text(orgName)
                .datum(function(d) {
                    //label go with the last item, need to find it
                    var lastIndex = lineData.length - 1;
                    return lineData[lastIndex];
                })
                .attr("transform", function(d) {
                    //d is the last item
                    return "translate(" + (xScale(d.name) + 2*padding - 5) + "," + yScale(d.score) + ")";
                })
        }
    }


    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + padding +"," + (height - padding) + ")")
        .call(xAxis);


    // Add the Y Axis
    var dy = "0.1em";
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin.left + padding) + ",0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", dy)
        .attr("x", -40)
        .style("text-anchor", "end")
        .text("Score");

    //Stream PNG back in response
    streamPNG(window, res, "#wsvg", chartId);

    //Option 2 - Save SVG to PNG using GM
    //var svgFile = "line.svg", imageFile = "line.png";
    //fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
    //    if(err){
    //        console.log(err);
    //    }else{
    //        console.log("SVG created!");
    //        convertSvg2Png(svgFile, imageFile);
    //    }
    //
    //});
    //res.send(window.d3.select("body").html());

}

//Liquid Gauge Chart
function drawLiquidGauge(input){
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data; //[]org with score
    var res = input.response;
    var config = input.config;
    var chartId = input.id;
     var xData = input.xData;

    //input dimensions
    var h = config.height;
    var w = config.width;

    var xInnerPad = 10, yInnerPad = 10;
    var xPadCount = xData.length-1;
    var yPadCount = data.length-1;
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var wWidth =  w - margin.left - margin.right - xPadCount*xInnerPad;
    var wHeight = h - margin.top - margin.bottom - yPadCount*yInnerPad;

    //Add the wrapper svg,
    //Must use d3 from the window because it is the context. at least for the first time
    var wsvg = window.d3.select(anchor)
        .append("svg")
        .attr("id", "wsvg")
        .attr("width", wWidth)
        .attr("height", wHeight);

    var tickCount = xData.length;
    var orgCount = data.length;
    var width= 100/tickCount + "%";     //this is the percentage
    var height=100/orgCount + "%";      //this is the percentage

    var unitWidth = wWidth/tickCount;   //abs value
    var unitHeight = wHeight/orgCount;
    var radius =  Math.min(wWidth/(tickCount+2), wHeight/(orgCount+2))/2;
    var locationX =  unitWidth/2 - radius;
    var locationY =  unitHeight/2 - radius;

    //Create gauges for each organization
    for(var orgIndex = 0; orgIndex< data.length; orgIndex++){
        //Gauge data
        var label = data[orgIndex].name;
        var scores = data[orgIndex].data;
        for(var scoreIndex = 0; scoreIndex < scores.length; scoreIndex++ ){
            var scoreNode = scores[scoreIndex];
            var scoreId = label + scoreNode.name;
            var scoreValue = scoreNode.score;

            var locale = {
                radius:    radius,
                locationX:  locationX,
                locationY:  locationY
            };

            // Adds the svg canvas
            wsvg.append("svg")
                .attr("width", width)
                .attr("id", scoreId)
                .attr("x", scoreIndex*(2*radius + xInnerPad))
                .attr("y", orgIndex*(2*radius + yInnerPad))
                .attr("height", height);
            var gaugeConfig = getGaugeConfig(scoreIndex);

            //Reflect user configuration
            if(config.displayPercent !== null){
                gaugeConfig.displayPercent = config.displayPercent;
            }
            if(config.showGaugeLabel !== null){
                gaugeConfig.showGaugeLabel = config.showGaugeLabel;
            }
            if(config.minValue){
                gaugeConfig.minValue = config.minValue;
            }
            if(config.maxValue){
                gaugeConfig.maxValue = config.maxValue;
            }
            loadLiquidFillGauge(window, locale, scoreId, scoreValue, label, gaugeConfig);
        }
    }

    //Stream PNG back in response
    streamPNG(window, res, "#wsvg", chartId);

    //Option 2 - Save SVG to PNG using GM
    //var svgFile = "gauge.svg", imageFile = "gauge.png";
    //fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
    //    if(err){
    //        console.log(err);
    //    }else{
    //        console.log("SVG created");
    //        convertSvg2Png(svgFile, imageFile);
    //    }
    //
    //});
    //res.send(window.d3.select("body").html());
}

//Convert SVG to PNG
function convertSvg2Png(svg, png){
    gm(svg).write(png, function(err){
        if (err){
            console.log(err)
        }else{
            console.log('image created.')
        }
    });
}

function streamPNG(window, res, svgId, chartId){
    var document = window.document;
    var wsvgElement = document.querySelector(svgId);
    var svgData = xmlserializer.serializeToString(wsvgElement);
    var buf = new Buffer('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svgData);
    res.set('Content-Type', 'image/png');
    res.set("Id", chartId);

    //if we want to save image to file, uncomment line 706 & 711
    //var pngFileStream = fs.createWriteStream("gauge.png");
    gm(buf, 'svg.svg').stream('png', function (err, stdout, stderr) {
        stdout.pipe(res);

        //stdout can stream both pngFileStream and response
        //stdout.pipe(pngFileStream);
    });
}

//Get the max score, using d3 library
function getMaxScore(chartData){
    var max = 0;
    for(var i = 0; i<chartData.length; i++){
        var orgScoreData = chartData[i].data;
        var orgMax = d3.max(orgScoreData, function(d) { return d.score; });
        max = d3.max([max, orgMax]);
    }
    // console.log("Max Score: " + max);
    return max;
}

//Get gauge configuration by index
function getGaugeConfig(index){
    var config = liquidFillGaugeDefaultSettings();
    var scoreConfig = index % 10;
    switch (scoreConfig){
        case 0:
            config.circleThickness = 0.05;
            config.circleColor = "#FF7777";
            config.textColor = "#555500";
            config.waveTextColor = "#FF7777";
            config.labelColor = "#555500";
            config.waveLabelColor = "#FF7777";
            config.waveColor = "#FF7777";
            config.textVertPosition = 0.8;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveRise = false;
            config.waveHeightScaling = false;
            config.waveOffset = 0.25;
            config.textSize = 0.75;
            config.waveCount = 3;
            config.valueCountUp = 0;
            config.displayPercent = true;
            break;
        case 1:
            config.circleThickness = 0.10;
            config.circleColor = "#D4AB6A";
            config.waveColor = "#AA7D39";
            config.waveTextColor = "#805615";
            config.textColor = "#553300";
            config.labelColor = "#555500";
            config.waveLabelColor = "#805615";
            config.textVertPosition = 0.8;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveRise = false;
            config.waveHeightScaling = false;
            config.waveOffset = 0.15;

            config.textSize = 0.75;
            config.waveCount = 4;
            config.valueCountUp = 0;
            config.displayPercent = true;
            break;
        case 2:
            config.circleThickness = 0.05;
            config.textColor = "#555500";
            config.labelColor = "#555500";
            config.waveLabelColor = "#805615";
            config.textVertPosition = 0.8;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveRise = false;
            config.waveHeightScaling = false;
            config.waveOffset = 0.25;
            config.textSize = 0.75;
            config.waveCount = 3;
            config.valueCountUp = 0;
            break;
        case 3:
            config.circleThickness = 0.10;
            config.circleColor = "#808015";
            config.textColor = "#555500";
            config.waveTextColor = "#FFFFAA";
            config.labelColor = "#555500";
            config.waveLabelColor = "#FFFFAA";
            config.waveColor = "#AAAA39";
            config.textVertPosition = 0.8;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveRise = false;
            config.waveHeightScaling = false;
            config.waveOffset = 0.25;
            config.textSize = 0.75;
            config.waveCount = 3;
            config.valueCountUp = 0;
            break;
        case 4:
            config.circleThickness = 0.05;
            config.circleColor = "#6DA398";
            config.textColor = "#0E5144";
            config.waveTextColor = "#6DA398";
            config.labelColor = "#0E5144";
            config.waveLabelColor = "#6DA398";
            config.waveColor = "#246D5F";
            config.textVertPosition = 0.52;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;
        case 5:
            config.circleThickness = 0.05;
            config.circleColor = "orange";
            config.textColor = "#0E5144";
            config.waveTextColor = "#ADB398";
            config.labelColor = "#0E5144";
            config.waveLabelColor = "#ADB398";
            config.waveColor = "orange";
            config.textVertPosition = 0.8;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;
        case 6:
            config.circleThickness = 0.05;
            config.circleColor = "#BCA398";
            config.textColor = "#0E5144";
            config.waveTextColor = "#0E5144";
            config.labelColor = "#0E5144";
            config.waveLabelColor = "#0E5144";
            config.waveColor = "#BCA398";
            config.textVertPosition = 0.52;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;
        case 7:
            config.circleThickness = 0.05;
            config.circleColor = "#D5F246";
            config.textColor = "#BCA398";
            config.waveTextColor = "#BCA398";
            config.labelColor = "#BCA398";
            config.waveLabelColor = "#BCA398";
            config.waveColor = "#D5F246";
            config.textVertPosition = 0.52;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;
        case 8:
            config.circleThickness = 0.05;
            config.circleColor = "#3986DA";
            config.textColor = "#0E5144";
            config.waveTextColor = "#0E5144";
            config.labelColor = "#0E5144";
            config.waveLabelColor = "#0E5144";
            config.waveColor = "#3986DA";
            config.textVertPosition = 0.52;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;
        case 9:
            config.circleThickness = 0.05;
            config.circleColor = "#6DA398";
            config.textColor = "#0E5144";
            config.waveTextColor = "#6DA398";
            config.labelColor = "#0E5144";
            config.waveLabelColor = "#6DA398";
            config.waveColor = "#246D5F";
            config.textVertPosition = 0.52;
            config.waveAnimateTime = 5000;
            config.waveHeight = 0.05;
            config.waveAnimate = true;
            config.waveCount = 3;
            config.waveOffset = 0.05;
            config.waveRise = false;
            config.textSize = 1.2;
            config.minValue = 0;
            config.maxValue = 100;
            config.displayPercent = true;
            config.valueCountUp = 0;
            break;

    }
    return config;
}

//Default gauge configuration
function liquidFillGaugeDefaultSettings(){
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        labelColor:"#045681",
        waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
        waveLabelColor:"#A4DBf8",
        showGaugeLabel: true
    };
}

//Draw liquid gauge
function loadLiquidFillGauge(window, locale, elementId, value, gaugeLabel, config) {
    if(config == null) config = liquidFillGaugeDefaultSettings();

    var gauge = window.d3.select("#" + elementId);
    var radius = locale.radius;
    var locationX = locale.locationX;
    var locationY = locale.locationY;

    var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

    var waveHeightScale;
    if(config.waveHeightScaling){
        waveHeightScale = window.d3.scale.linear()
            .range([0,config.waveHeight,0])
            .domain([0,50,100]);
    } else {
        waveHeightScale = window.d3.scale.linear()
            .range([config.waveHeight,config.waveHeight])
            .domain([0,100]);
    }

    var textPixels = (config.textSize*radius/2);
    var textFinalValue = parseFloat(value).toFixed(2);
    var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
    var percentText = config.displayPercent?"%":"";
    var circleThickness = config.circleThickness * radius;
    var circleFillGap = config.circleFillGap * radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = radius - fillCircleMargin;
    var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

    var waveLength = fillCircleRadius*2/config.waveCount;
    var waveClipCount = 1+config.waveCount;
    var waveClipWidth = waveLength*waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    var textRounder = function(value){ return Math.round(value); };
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(1); };
    }
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(2); };
    }

    // Data for building the clip wave area.
    var data = [];
    for(var i = 0; i <= 40*waveClipCount; i++){
        data.push({x: i/(40*waveClipCount), y: (i/(40))});
    }

    // Scales for drawing the outer circle.
    var gaugeCircleX = window.d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
    var gaugeCircleY = window.d3.scale.linear().range([0,radius]).domain([0,radius]);

    // Scales for controlling the size of the clipping path.
    var waveScaleX = window.d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
    var waveScaleY = window.d3.scale.linear().range([0,waveHeight]).domain([0,1]);

    // Scales for controlling the position of the clipping path.
    var waveRiseScale = window.d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
        .domain([0,1]);
    var waveAnimateScale = window.d3.scale.linear()
        .range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
        .domain([0,1]);

    // Scale for controlling the position of the text within the gauge.
    var textRiseScaleY = window.d3.scale.linear()
        .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
        .domain([0,1]);

    // Center the gauge within the parent SVG.
    var gaugeGroup = gauge.append("g")
        .attr('transform','translate('+locationX+','+locationY+')');

    // Draw the outer circle.
    var gaugeCircleArc = window.d3.svg.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(radius))
        .innerRadius(gaugeCircleY(radius-circleThickness));
    gaugeGroup.append("path")
        .attr("d", gaugeCircleArc)
        .style("fill", config.circleColor)
        .attr('transform','translate('+radius+','+radius+')');


    //Display Gauge label when not liquid not overlap
    if(config.showGaugeLabel){
        var text0 = gaugeGroup.append("text")
            .text(gaugeLabel)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-family", "sans-serif")
            .style("fill", config.labelColor)
            .attr('transform','translate(' + radius +','+textRiseScaleY(config.textVertPosition - 0.2)+ ')');
    }

    // Text where the wave does not overlap.
    var text1 = gaugeGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    // The clipping wave area.
    var clipArea = window.d3.svg.area()
        .x(function(d) { return waveScaleX(d.x); } )
        .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
        .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
    var waveGroup = gaugeGroup.append("defs")
        .append("clipPath")
        .attr("id", "clipWave" + elementId);
    var wave = waveGroup.append("path")
        .datum(data)
        .attr("d", clipArea)
        .attr("T", 0);

    // The inner circle with the clipping wave attached.
    var fillCircleGroup = gaugeGroup.append("g")
        .attr("clip-path", "url(#clipWave" + elementId + ")");
    fillCircleGroup.append("circle")
        .attr("cx", radius)
        .attr("cy", radius)
        .attr("r", fillCircleRadius)
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    var text2 = fillCircleGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    //Display Gauge label when not liquid does overlap
    if(config.showGaugeLabel){
        var text0 = fillCircleGroup.append("text")
            .text(gaugeLabel)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-family", "sans-serif")
            .style("fill", config.waveLabelColor)
            .attr('transform','translate(' + radius +','+textRiseScaleY(config.textVertPosition - 0.2)+ ')');
    }

    // Make the value count up.
    if(config.valueCountUp){
        var textTween = function(){
            var i = window.d3.interpolate(this.textContent, textFinalValue);
            return function(t) { this.textContent = textRounder(i(t)) + percentText; }
        };
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
    if(config.waveRise){
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
            .each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
    }

    if(config.waveAnimate) animateWave();

    function animateWave() {
        wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
        wave.transition()
            .duration(config.waveAnimateTime * (1-wave.attr('T')))
            .ease('linear')
            .attr('transform','translate('+waveAnimateScale(1)+',0)')
            .attr('T', 1)
            .each('end', function(){
                wave.attr('T', 0);
                animateWave(config.waveAnimateTime);
            });
    }

    function GaugeUpdater(window){
        this.update = function(value){
            var newFinalValue = parseFloat(value).toFixed(2);
            var textRounderUpdater = function(value){ return Math.round(value); };
            if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                textRounderUpdater = function(value){ return parseFloat(value).toFixed(1); };
            }
            if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                textRounderUpdater = function(value){ return parseFloat(value).toFixed(2); };
            }

            var textTween = function(){
                var i = window.d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                return function(t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
            };

            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);

            var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;
            var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);
            var waveRiseScale = window.d3.scale.linear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
                .domain([0,1]);
            var newHeight = waveRiseScale(fillPercent);
            var waveScaleX = window.d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
            var waveScaleY = window.d3.scale.linear().range([0,waveHeight]).domain([0,1]);
            var newClipArea;
            if(config.waveHeightScaling){
                newClipArea = window.d3.svg.area()
                    .x(function(d) { return waveScaleX(d.x); } )
                    .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
                    .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
            } else {
                newClipArea = clipArea;
            }

            var newWavePosition = config.waveAnimate?waveAnimateScale(1):0;
            wave.transition()
                .duration(0)
                .transition()
                .duration(config.waveAnimate?(config.waveAnimateTime * (1-wave.attr('T'))):(config.waveRiseTime))
                .ease('linear')
                .attr('d', newClipArea)
                .attr('transform','translate('+newWavePosition+',0)')
                .attr('T','1')
                .each("end", function(){
                    if(config.waveAnimate){
                        wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
                        animateWave(config.waveAnimateTime);
                    }
                });
            waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+waveGroupXPosition+','+newHeight+')')
        }
    }

    return new GaugeUpdater(window);
}

module.exports = {
    bubble : drawBubbleChart,
    line : drawLineChart,
    gauge: drawLiquidGauge
};
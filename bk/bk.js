
//Bubble Chart
function drawBubbleChart(input) {
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var config = input.config;
    var dimension = config.dimension;
    var selectedOpt = config.selectedOpt;
    var optList  = config.optList;
    var h = dimension.h;
    var w = dimension.w;
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

    //Prepare data for chart
    var orgData = data.orgData;
    var scoreData = data.scoreData;
    var xData = data.xData;

    //----------------------------------------------------------------
    //Sample data - Need to get these data for input orgData, scoreData, xData
    //get it out of data
    // var orgData = [
    //     {"id": "1", "name": "Washington"},
    //     {"id": "2", "name": "Vancouver"},
    //     {"id": "3", "name": "Texas"}
    // ];
    //var scoreData =[
    //    //x-value, y-value, orgIndex-->>color index
    //    ["BM1", 20, 0],
    //    ["BM2", 90, 0],
    //    ["BM3", 50, 0],
    //    ["BM4", 33, 0],
    //    ["BM5", 95, 0],
    //    ["BM6", 12, 0],
    //    ["BM7", 44, 0],
    //    ["BM8", 67, 0],
    //    ["BM9", 21, 0],
    //    ["BM10", 88, 0],
    //    ["BM1", 25, 1],
    //    ["BM2", 80, 1],
    //    ["BM3", 70, 1],
    //    ["BM4", 53, 1],
    //    ["BM5", 65, 1],
    //    ["BM6", 14, 1],
    //    ["BM7", 64, 1],
    //    ["BM8", 87, 1],
    //    ["BM9", 60, 1],
    //    ["BM10", 100, 1],
    //    ["BM1", 35, 2],
    //    ["BM2", 60, 2],
    //    ["BM3", 77, 2],
    //    ["BM4", 83, 2],
    //    ["BM5", 25, 2],
    //    ["BM6", 64, 2],
    //    ["BM7", 24, 2],
    //    ["BM8", 67, 2],
    //    ["BM9", 80, 2],
    //    ["BM10", 95, 2]
    //];
    //var xData = ["BM1", "BM2", "BM3","BM4", "BM5", "BM6","BM7", "BM8", "BM9", "BM10"];
    //----------------------------------------------------------------

    //Chart dimension
    var margin = {top: 0, right: 40, bottom: 0, left: 50};
    var width =  w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    //Add the wrapper svg
    var wsvg = window.d3.select(anchor)
        .append("svg")
        .attr("width", width).attr("height", height + legendHeight);

    var svg = wsvg.append("svg")
        .attr("width", width).attr("height", height);

    // add some padding, when padding = 0 some elements were cut off.
    // Using padding to define the area  of displaying chart
    var innerPad = 0.00;        //no inner padding
    var outerPad = 0.50;        //outer pad = 50% tick size
    var topPad = 30;            //top padding

    //Define scales
    var xScale = d3.scale.ordinal()
        .domain(xData)
        .rangeRoundBands([margin.left, width], innerPad, outerPad);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(scoreData, function(d) { return d[1]; })])
        .range([height - topPad, 2*topPad]);

    var rScale = d3.scale.linear()
        .domain([0, d3.max(scoreData, function(d) { return d[1]; })])
        .range([10, 25]); //radius values will always fall within this range


    //Define axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function(d) {
            return d; })  //format x-tick data
        .ticks(xData.length)
        .tickPadding(3) //padding of tick label to the tick
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(yScale)
        //.ticks(5)
        .orient("left");


    //Add vertical lines
    var tickDistance =  scoreData.length > 1 ? xScale(scoreData[1][0])-xScale(scoreData[0][0]) : 0;
    var leftPadInPixel = tickDistance/2 + topPad;

    //Add vertical lines
    svg.selectAll("line")
        .data(scoreData)
        .enter()
        .append("line")          // attach a line
        .style("stroke", "lightgrey")  // colour the line
        .attr("x1", function(d) {
            return leftPadInPixel  +  xScale(d[0])})     // x position of the first end of the line
        .attr("y1", function(d) {
            return  yScale(d[1]) + rScale(d[1]) + 2 })      // y position of the first end of the line
        .attr("x2", function(d) {
            return leftPadInPixel  +  xScale(d[0])})     // x position of the second end of the line
        .attr("y2", height - topPad);


    //Add bubbles, bubble is above the vertical lines
    svg.selectAll("circle")
        .data(scoreData)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return (leftPadInPixel  +  xScale(d[0]));
        })
        .attr("cy", function (d) {
            return yScale(d[1]);
        })
        .attr("r", function (d) {
            return rScale(d[1]);
        })
        //fill color
        .attr("fill", function (d, i) {
            var index = d[2]%colors.length;
            return colors[index].fill
        })
        //color of boundary
        .attr("stroke", function (d, i) {
            var index = d[2]% colors.length;
            return colors[index].stroke
        })
        //width of the boundary
        .attr("stroke-width", function (d) {
            return rScale(d[1]) / 4;
        })
        //add tip to the bubble (show the org name)
        .append("svg:title")
        .text(function(d) {
            var orgIndex = d[2];
            if(orgData[orgIndex]){
                var orgName = orgData[orgIndex].name;
                return orgName;
            }else{
                return "N/A";
            }

        });

    //Add texts
    var defaultTextLength = 20;
    svg.selectAll("text")
        .data(scoreData)
        .enter()
        .append("text")
        .text(function (d) {
            return d[1];
        })
        .attr("x", function (d) {
            return leftPadInPixel - defaultTextLength/2  + 3 + xScale(d[0]) ;
        })
        .attr("y", function (d) {
            return yScale(d[1]) + 5;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", function (d, i) {
            var index = d[2]% colors.length;
            return colors[index].text
        });

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
    if(selectedOpt == optList[0]){
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
            .data(orgData)
            .enter()
            .append("circle");

        //set attr for circles, center x
        circles.attr("cx", function(d, i) {
            //x-position of the circle center
            return xScale(scoreData[0][0])*(1- 0.1*outerPad) + i*groupWidth;
        })
            //center y-position of the center
            .attr("cy", yTop)
            .attr("r", function(d) {
                //radius of the circle
                return circleRadius;
            })
            //fill color
            .attr("fill", function(d, i){
                var colorIndex = i%colors.length;
                var color = colors[colorIndex];
                return color.fill
            })
            //color of boundary
            .attr("stroke", function(d, i){
                var colorIndex = i%colors.length;
                var color = colors[colorIndex];
                return color.stroke
            })
            //width of the boundary
            .attr("stroke-width", function(d) {
                return 3;
            });

        //Add texts
        legend.selectAll("text")
            .data(orgData)
            .enter()
            .append("text")
            .text(function (d) {
                return d.name;
            })
            .attr("x", function (d, i) {
                return xScale(scoreData[0][0])*(1-0.1*outerPad) + circleRadius + 3 + i*groupWidth;
            })
            .attr("y", function (d) {
                return yTop + 5;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");
    }


    //Save SVG to PNG using GM
    var svgFile = "chart.svg", imageFile = "chart.png";
    fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created");
            ConvertSvg2Png(svgFile, imageFile);
        }

    });
    res.send(window.d3.select("body").html());
}

//Line Chart
function drawLineChart(input){
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var config = input.config;
    var dimension = config.dimension;
    var selectedOpt = config.selectedOpt;
    var optList  = config.optList;
    var h = dimension.h;
    var w = dimension.w;

    //Chart dimension
    var margin = {top: 40, right: 40, bottom: 40, left: 50};
    var width =  w - margin.left - margin.right;    //900
    var height = h - margin.top - margin.bottom;   //430
    var colors = ['#99CC00','#FFCC00','#FF9900','#FF6600','#666699','#969696','#003366','#339966','#003300','#333300','#993300','#333399','#7EBC89'];

    //Prepare data
    var orgData = data.orgData;
    var scoreData = data.scoreData;
    var xData = data.xData;
    //process input data
    var chartData = [];
    for(var i = 0 ; i < orgData.length ; i++) {
        var retData = {
            orgName: orgData[i].name,
            scoreData: []
        };
        for(var j = 0 ; j < scoreData.length ; j++) {
            var score = scoreData[j];
            if(score[2] != i) continue;
            retData.scoreData.push({
                name: score[0],
                score: score[1]
            });
        }
        chartData.push(retData);

    }
    //console.log(chartData);

    // var chartData = [
    //     {
    //         orgName: "Washington Mutual Fund",
    //         scoreData: [
    //             {name: "BM1", score: 58.13},
    //             {name: "BM2", score: 53.98},
    //             {name: "BM3", score: 67.00},
    //             {name: "BM4", score: 89.70},
    //             {name: "BM5", score: 99.00},
    //             {name: "BM6", score: 130.28},
    //             {name: "BM7", score: 166.70},
    //             {name: "BM8", score: 234.98},
    //             {name: "BM9", score: 345.44},
    //             {name: "BM10", score: 443.34}
    //         ]
    //     },

    var maxScore = getMaxScore(chartData);
    var padding = 20;

    // Adds the svg canvas
    var svg = window.d3.select(anchor)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    console.log("svg.style('width'):");
    console.log(svg.style("width"));

    //Define scales
    var roundBand = 0.5;
    var xScale = d3.scale.ordinal()
        .domain(xData)
        .rangeRoundBands([margin.left, width-padding], roundBand);


    //var xScale = d3.time.scale().range([0, width]);
    var yScale = d3.scale.linear()
        .domain([0, maxScore])
        .range([height- padding, 2*padding]);

    // Define the axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        //format x-tick data
        .tickFormat(function(d) {
            return d; })
        .ticks(xData.length)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    //.ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return xScale(d.name)+ 2*padding - 8; })
        .y(function(d) { return yScale(d.score); });

    //Draw lines
    for(var i = 0; i<chartData.length; i++){
        var orgColorIndex = i % colors.length;
        var orgName = chartData[i].orgName;
        var lineData = chartData[i].scoreData;
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
        if(selectedOpt == optList[0]){
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

    //Save SVG to PNG using GM
    var svgFile = "linechart.svg", imageFile = "linechart.png";
    fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created!");
            ConvertSvg2Png(svgFile, imageFile);
        }

    });
    res.send(window.d3.select("body").html());

}

//Liquid Gauge Chart
function drawLiquidGauge(input){
    var anchor = input.anchor;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var config = input.config;
    var dimension = config.dimension;
    var selectedOpt = config.selectedOpt;
    var optList  = config.optList;
    var h = dimension.h;
    var w = dimension.w;


    //Prepare data
    var orgData = data.orgData;
    var scoreData = data.scoreData;
    var xData = data.xData;
    var chartData = [];
    for(var i = 0 ; i < orgData.length ; i++) {
        var retData = {
            orgName: orgData[i].name,
            scoreData: []
        };
        for(var j = 0 ; j < scoreData.length ; j++) {
            var score = scoreData[j];
            if(score[2] != i) continue;
            retData.scoreData.push({
                name: score[0],
                score: score[1]
            });
        }
        chartData.push(retData);
    }

    //----------------------------------------------------------------
    //Sample data - Need to get these data for input orgData, scoreData, xData
    //    var orgData = [
    //        {"id": "1", "name": "Washington"},
    //        {"id": "2", "name": "Vancouver"},
    //        {"id": "3", "name": "Texas"}
    //    ];
    //    var xData = ["BM1", "BM2", "BM3","BM4", "BM5", "BM6"];
    //x-value, y-value, orgIndex-->>color index
    //    var scoreData =[
    //        ["BM1", 20, 0],
    //        ["BM2", 90, 0],
    //        ["BM3", 50, 0],
    //        ["BM4", 33, 0],
    //        ["BM5", 95, 0],
    //        ["BM6", 12, 0],
    //        ["BM1", 20, 1],
    //        ["BM2", 90, 1],
    //        ["BM3", 50, 1],
    //        ["BM4", 33, 1],
    //        ["BM5", 95, 1],
    //        ["BM6", 12, 1],
    //        ["BM1", 20, 2],
    //        ["BM2", 90, 2],
    //        ["BM3", 50, 2],
    //        ["BM4", 33, 2],
    //        ["BM5", 95, 2],
    //        ["BM6", 12, 2]
    //    ];
    //----------------------------------------------------------------
    var xInnerPad = 10, yInnerPad = 10;
    var xPadCount = xData.length-1;
    var yPadCount = orgData.length-1;
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var wWidth =  w - margin.left - margin.right - xPadCount*xInnerPad;
    var wHeight = h - margin.top - margin.bottom - yPadCount*yInnerPad;

    //Add the wrapper svg
    var wsvg = window.d3.select(anchor)
        .append("svg")
        .attr("id", "wsvg")
        .attr("width", wWidth)
        .attr("height", wHeight);

    var tickCount = xData.length;
    console.log(tickCount);
    var orgCount = orgData.length;
    var width= 100/tickCount + "%";     //this is the percentage
    var height=100/orgCount + "%";      //this is the percentage

    var unitWidth = wWidth/tickCount;   //abs value
    var unitHeight = wHeight/orgCount;
    var radius =  Math.min(wWidth/(tickCount+2), wHeight/(orgCount+2))/2;
    var locationX =  unitWidth/2 - radius;
    var locationY =  unitHeight/2 - radius;

    for(var orgIndex = 0; orgIndex< chartData.length; orgIndex++){
        //Gauge data
        var label = chartData[orgIndex].orgName;
        var scores = chartData[orgIndex].scoreData;
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
            loadLiquidFillGauge(window, locale, scoreId, scoreValue, label, gaugeConfig);
        }
    }

    //Save SVG to PNG using GM
    var svgFile = "liquidgauge.svg", imageFile = "liquidgauge.png";
    fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created");
            ConvertSvg2Png(svgFile, imageFile);
        }

    });
    res.send(window.d3.select("body").html());
}


//---------------------------------------------------------------------------------------

//Create virtual DOM(jsdom)-->Draw SVG/D3-->Export.svg (jsdom)--> Convert .svg to .png(gm)
function drawChart(input){
    var svg = input.svg;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var dimension = input.dimension;
    var h = dimension.h;
    var w = dimension.w;
    var data = [ 5, 10, 15, 20, 25 ];

    var circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");
    //set attr for circles
    circles.attr("cx", function(d, i) {
        return (i * 50) + 25;           //x-position of the center
    })
        .attr("cy", h/2)                //y-position of the center
        .attr("r", function(d) {
            return d;                   //radius of the circle
        })
        .attr("fill", "yellow")         //fill color
        .attr("stroke", "orange")       //color of boundary
        .attr("stroke-width", function(d) {
            return d/2;                 //width of the boundary
        });

    //Save SVG
    var svgFile = "chart.svg", imageFile = "chart.png";
    fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created");
            gm(svgFile).write(imageFile, function(err){
                if (err){
                    console.log(err)
                }else{
                    console.log('image converted.')
                }
            });
        }

    });

    // Response, send the body
    res.send(window.d3.select("body").html());
}

//Streaming the SVG to response as image
function drawSVGJSDOM(res){
    console.log("chart is called");
    //Draw SVG
    var template = fs.readFileSync('dummy.html','utf-8');
    var document = jsdom.jsdom(template);

    //Draw SVG
    var w = 500;
    var h = 100;
    var data = [ 5, 10, 15, 20, 25 ];

    var svg = d3.select(document.body)
        .append("svg")
        .attr("width", w).attr("height", h);

    var circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");
    //set attr for circles
    circles.attr("cx", function(d, i) {
        return (i * 50) + 25;           //x-position of the center
    })
        .attr("cy", h/2)                //y-position of the center
        .attr("r", function(d) {
            return d;                   //radius of the circle
        })
        .attr("fill", "yellow")         //fill color
        .attr("stroke", "orange")       //color of boundary
        .attr("stroke-width", function(d) {
            return d/2;                 //width of the boundary
        });
    //---------------------------------------------------------------------------
    //Send image back in response
    var svg = document.querySelector( "svg" );
    var svgData = xmlserializer.serializeToString(svg);

    var pngFileStream = fs.createWriteStream("out.png");


    console.log('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svgData);
    var buf = new Buffer('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + svgData);
    res.set('Content-Type', 'image/png');
    gm(buf, 'svg.svg').stream('png', function (err, stdout, stderr) {
        //stdout.pipe(res);

        //Save to file
        stdout.pipe(pngFileStream);
        stdout.on('end', function(){
            pngFileStream.end();
            res.sendfile("out.png");
        });
    });
}

//Convert SVG to PNG
function ConvertSvg2Png(svg, png){
    console.log("chart generating...");
    var gm = require('gm').subClass({ imageMagick: true });
    gm(svg).write(png, function(err){
        if (err){
            console.log(err)
        }else{
            console.log('image converted.')
        }
    });
}

//Get the max score
function getMaxScore(chartData){
    var max = 0;
    for(var i = 0; i<chartData.length; i++){
        var orgScoreData = chartData[i].scoreData;
        var orgMax = d3.max(orgScoreData, function(d) { return d.score; });
        max = d3.max([max, orgMax]);
    }
    // console.log("Max Score: " + max);
    return max;
}

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

//---------------------------------------------------------------------------------------

//Example 2
function drawBarChartWithScale(input) {
    var svg = input.svg;
    var window = input.window;
    var data = input.data;
    var res = input.response;
    var dimension = input.dimension;
    var h = dimension.h;
    var w = dimension.w;

    var dataset = [23, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25];
    var data =     ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];
    var outerW = 600;
    var outerH = 250;
    var barPadding = 1;

    var formatPercent = d3.format(".0%");

    //Margin definition
    var margin = {top: 20, right: 10, bottom: 20, left: 30};
    var width  = outerW   - margin.left - margin.right,    //600-10-30
        height = outerH - margin.top  - margin.bottom;   //250-20-20

    var barWidth = width / dataset.length - barPadding;
    var maxVal = d3.max(dataset, function(d) { return d; });
    var axisHeight = 17;

    //Scales
    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(data.map(function(d) {
            return d;
        }));

    var yScale = d3.scale.linear()
        .domain([0, maxVal])
        .range([height,0]);

    //The axis is created using the d3.svg.axis() function,
    var xAxis = d3.svg.axis()
        .scale(xScale)
        //tick text is below the line
        .orient("bottom");

    //Define Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //Create SVG area
    var svg = window.d3.select("div")
        .append("svg")
        .attr("width", outerW)
        .attr("height",outerH)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var scaleCons = 4;
    //Add bars
    var rects = svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) {
            //return xScale(d);
            return i * (width / dataset.length);
        })
        .attr("width", (barWidth))
        .attr("y", function (d) {
            return (height - (4*d));
        })
        .attr("height", function (d) {
            //bar length d, equally extend it 3d: -->4d
            //axis is at the bottom so must reduce the bar length
            //reduce more 3 so that the axis is separated from the bar
            return ((4*d) -  3);
        })
        .attr("fill", function (d) {
            return "rgb(5, 134, " + (d * 10) + ")";
        });

    //Add text value to chart
    var textTopPad = 1;
    var texts = svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function (d) {
            return d;
        })
        .attr("x", function (d, i) {
            var textWidth = 50;       //get text box length
            var textLeftPad =  (barWidth - textWidth)/2;        //text padding
            return i * (width/dataset.length) + textLeftPad;      //x-position of text
        })
        .attr("y", function (d) {
            //h-d is the actual length of the bar, extend it 3d,  --> h-4d
            //increase y (15 pixels)so the text is inside the bar
            return (height - (4*d) + 15);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");

    //Add x-axis to the chart
    svg.append("g")
        .attr("class", "x axis")
        //push axis from 0 to the bottom by increasing y: new position y = h- textTopPad - axisHeight
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //Create Y axis
    svg.append("g")
        .attr("class", "y axis")
        //push y-axis to left
        .attr("transform", "translate(0, 0)")
        .call(yAxis);


    /*
     SVG transforms are quite powerful, and can accept several different kinds of
     transform definitions, including scales and rotations. But we are keeping it
     simple here with only a translation transform,
     which simply pushes the whole g group over and down by some amount.
     * */


    //Save SVG to PNG using GM
    var svgFile = "chart.svg", imageFile = "chart.png";
    fs.writeFile(svgFile, window.d3.select("div").html(), function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created");
            ConvertSvg2Png(svgFile, imageFile);
        }

    });

    res.send(window.d3.select("body").html());
}

function drawCircle(res){
    //Draw SVG
    var template = fs.readFileSync('./dummy.html','utf-8');
    var document = jsdom.jsdom(template);
    //Note: this template does not work, seems that document cannot get from dummy.html

    //Draw SVG
    var w = 500;
    var h = 100;
    var data = [ 5, 10, 15, 20, 25 ];

    var svg = d3.select(document.body)
        .append("svg")
        .attr("width", w).attr("height", h);

    var circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");
    //set attr for circles
    circles.attr("cx", function(d, i) {
        return (i * 50) + 25;           //x-position of the center
    })
        .attr("cy", h/2)                //y-position of the center
        .attr("r", function(d) {
            return d;                   //radius of the circle
        })
        .attr("fill", "yellow")         //fill color
        .attr("stroke", "orange")       //color of boundary
        .attr("stroke-width", function(d) {
            return d/2;                 //width of the boundary
        });

    //Save SVG to bytes
    var svg = document.querySelector( "svg" );
    var svgFile = "chart.svg", imageFile = "chart.png";
    fs.writeFile(svgFile, svg, function(err) {
        if(err){
            console.log(err);
        }else{
            console.log("SVG created");
            ConvertSvg2Png(svgFile, imageFile);
        }

    });

    res.send(document.body);
}

//Work with canvas
function drawAwesome(res){
    var Canvas = require('canvas')
        , Image = Canvas.Image
        , canvas = new Canvas(200, 200)
        , ctx = canvas.getContext('2d');

    ctx.font = '30px Impact';
    ctx.rotate(.1);
    ctx.fillText("Awesome!", 50, 100);

    var te = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();

    //console.log('<img src="' + canvas.toDataURL() + '" />');

    res.send('<img src="' + canvas.toDataURL() + '" />');
}

function CopyImage(){
    var canvas = new Canvas(500, 500, 'svg');
    var img = Canvas.Image;
    var ctx = canvas.getContext('2d');

    fs.readFile('images/flag.png', function(err, flag){
        if (err) throw err;
        img.src = flag;
        //ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
    });

    var out = fs.createWriteStream('cloneflag.png');
    var stream = canvas.pngStream();
    stream.on('data', function(chunk){
        out.write(chunk);
    });

    stream.on('end', function(){
        console.log('saved png');
    });
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}
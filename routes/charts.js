/**
 * Created by nghie on 11/9/2016.
 */

var    express = require('express'),
            fs = require('pn/fs'),
            d3 = require('d3'),
          btoa = require('btoa'),
 xmlserializer = require('xmlserializer'),
        Canvas = require('canvas'),
            gm = require('gm').subClass({ imageMagick: true }),
         jsdom = require('jsdom');



var router = express.Router();

router.get('/bubble', function(req, res, next) {
    //drawChart(res);
    drawBarChartWithScale(res);

});

module.exports = router;


//Create virtual DOM(jsdom)-->Draw SVG/D3-->Export.svg (jsdom)--> Convert .svg to .png(gm)
function drawChart(res){

    //Draw SVG
    var w = 500;
    var h = 100;
    var data = [ 5, 10, 15, 20, 25 ];

    jsdom.env(
        "<html><body><div></div>></body></html>",
        [ 'https://d3js.org/d3.v3.min.js' ],
        function (err, window) {
            var svg = window.d3.select("div")
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


            // PRINT OUT:
            res.send(window.d3.select("body").html());
        });
}

//Example 2
function drawBarChartWithScale(res) {

    jsdom.env(
        "<html><body><div></div>></body></html>",
        [ 'https://d3js.org/d3.v3.min.js' ],
        function (err, window) {
            //var dataset = [ 5, 10, 15, 20, 25 ];
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
            res.send(window.d3.select("body").html());

            //Save SVG
            //fs.writeFileSync('out.svg', window.d3.select("body").html()); // or this
            ////SVG2PNG - Unexpected token =. Reinstall with v3.0.0, not work with my D3
            //fs.readFile("./out.svg")
            //    .then(svg2png)
            //    .then(function(buffer){
            //        console.log("writing now"+ buffer.length);
            //        fs.writeFile("dest.png", buffer);
            //        console.log("done");
            //
            //    })
            //    .catch(function (err) {
            //        console.error(err);
            //    });

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
    //Save SVG to bytes
    var svg = document.querySelector( "svg" );
    var svgData = xmlserializer.serializeToString(svg);

    //var canvas = document.createElement( "canvas" );
    //var ctx = canvas.getContext( "2d" );
    //var img = document.getElementById("img");
    //img.setAttribute( "src", "data:image/svg+xml;base64," + btoa(svgData) );

    //console.log("data:image/svg+xml;base64," + btoa(svgData));

    //img.onload = function() {
    //    ctx.drawImage( img, 0, 0 );
    //    var canvasURL = canvas.toDataURL("image/png");
    //    console.log("canvasURL:" + canvasURL); // <---final data
    //
    //    var image = document.querySelector("image");
    //    image.src = canvasURL;
    //    // PRINT OUT:
    //    res.send(document.body);
    //};
    //---------------------------------------------------------------
    ////if we have canvas
    var canvas = new Canvas(500, 500, 'svg');

    //save canvas to svg
    //fs.writeFile('out.svg', canvas.toBuffer());

    var img = Canvas.Image;
    var ctx = canvas.getContext('2d');

    //this is image data "data:image/svg+xml;base64," + btoa(svgData)
    img.src = "data:image/svg+xml;base64," + btoa(svgData);



    ////Err: Image or Canvas expected
    //ctx.drawImage(img, 0, 0);
    //console.log('<img src="' + canvas.toDataURL() + '" />');
    //var out = fs.createWriteStream('text.png');
    //var stream = canvas.pngStream();
    //stream.on('data', function(chunk){
    //    out.write(chunk);
    //});
    //
    //stream.on('end', function(){
    //    console.log('saved png');
    //});







    //---------------------------------------------------------------------------
    //Save SVG
    //fs.writeFileSync('out.svg', window.d3.select("body").html()); // or this

    res.send('<img src="' + img.src + '" />');
    //drawAwesome(res);


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

function decodeBase64Image2(){
    //var imageBuffer = decodeBase64Image("data:image/svg+xml;base64," + btoa(svgData));
    //console.log(imageBuffer.data);
    //
    //fs.writeFile('test.jpg', imageBuffer, function(err) {
    //    if(err){
    //        console.log(err);
    //    }
    //});

    //var image = "data:image/svg+xml;base64," + btoa(svgData);
    //var data = image.replace(/^data:image\/\w+;base64,/, '');
    //fs.writeFile("image.png", data, {encoding: 'base64'}, function(err){
    //    if(err){
    //      console.log(err);
    //    }
    //});

    var rawStr = "data:image/svg+xml;base64," + btoa(svgData);
    var base64Data = rawStr.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("out.png", base64Data, 'base64', function(err) {
        if(err){
            console.log(err);
        }
    });
}

var express = require('express');
var fs = require('fs');
var d3 = require('d3');
var xmldom = require('xmldom');
var jsdom = require('jsdom');




var router = express.Router();
//Chart using D3 on xmldom, save svg to a file

/* GET users listing. */
router.get('/', function(req, res, next) {
    chart();
    res.send('Hello Nghiep. No list of user yet');
});

function chart(){
    var template = fs.readFileSync('dummy.html','utf-8');
    var document = jsdom.jsdom(template);
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

    // get a reference to our SVG object and add the SVG NS
    var svgGraph = document.querySelector( "svg" );
    //var svgGraph = d3.select('svg')
    //    .attr('xmlns', 'http://www.w3.org/2000/svg');
    var svgXML = (new xmldom.XMLSerializer()).serializeToString(svgGraph);
    fs.writeFile('graph.svg', svgXML);
}

module.exports = router;

//Result: unknown data


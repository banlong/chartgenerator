/**
 * Created by NGHIEP NGO on 11/9/2016.
 */

var    express = require('express'),
         chart = require('../public/javascripts/charts'),
         jsdom = require('jsdom');


var router = express.Router();

router.post('/:chartId', function(req, res, next) {
    //Get chart id
    var chartId = req.params.chartId;

    //Get input data:
    var model = req.body;
    var chartType = model.type;
    createChart(chartType, chartId, model, res);
});

module.exports = router;

//Using jsdom.env
function createChart(chartType, chartId, model, res){
    var data = model.data;
    var config = model.config;

    jsdom.env(
        "<html><body><div></div>></body></html>",
        [ 'https://d3js.org/d3.v3.min.js' ],
        function (err, window) {
            var input = {
                id: chartId,
                anchor: "div",
                window: window,
                data: data,
                config: config,
                response: res
            };

             switch (chartType){
                 case "bubble":
                     chart.bubble(input);
                     break;
                 case "line":
                     chart.line(input);
                     break;
                 case "gauge":
                     chart.gauge(input);
                     break;
             }
        });
}



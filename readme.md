#Chart Image GeneratorThis application is built to provide the score chart image for Dataslice project. The image is provided through REST API.##API Specification:1. **Path**:  [http://<ip:port>/api/chart/:chartid](http://)   The **chartid** is the id of the chart generated by the requester. The **chartid** is sent back together with the image, in the response header.2. **Method**: POST3. **Parameters**:		{        	"type": "bubble",        	"config": {            	"showLegend": true,            	"dimension": {                    "w": 1000,                    "h": 500            	}        	},        	"data" : {                "orgData":[                     {"id": "1", "name": "Washington"},                     {"id": "2", "name": "Vancouver"},                     {"id": "3", "name": "Texas"}                ],            	"xData": ["BM1", "BM2", "BM3"],                "scoreData":[                     ["BM1", 20, 0],                     ["BM2", 90, 0],                     ["BM3", 50, 0],                     ["BM1", 25, 1],                     ["BM2", 80, 1],                     ["BM3", 70, 1]                     ["BM1", 35, 2],                     ["BM2", 60, 2],                     ["BM3", 77, 2],        	}    	}4. **Parameter Explanation**:    - **type** : type of chart. Valid values: line, bubble, and gauge.    - **config**:       A. FOR ALL CHARTS          dimension: the size of the chart image.       B. FOR INDIVIDUAL CHART          * bubble chart:            showLegend (true/false) - show the legend of chart          * line chart:            showLineLabel (true/false), show the label for the line (for example organization name)          * gauge chart:            displayPercent: true/false, show/hide the percentage            showGaugeLabel: true/false, show/hide the text label            minValue: minimum value, default is 0            maxValue: maximum value, default is 100
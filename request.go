package main

import (
	"fmt"
	"bytes"
	"io/ioutil"
	"net/http"
	"encoding/json"
	"chartgenerator/tools"
)

var(
	host = "http://localhost:3000/api/chart/"
)

//This module init the request to get chart image
func main()  {
	sampleData := CreateSampleData()
	GetChartImage("12345", sampleData);
}

func GetChartImage(id string, data ImageRequestArgs) {
	url := host + id
	encData, _ := json.Marshal(data)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(encData))
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("response Status:", resp.Status)
	fmt.Println("ChartId:", resp.Header.Get("Id"))

	//This is image bytes
	body, _ := ioutil.ReadAll(resp.Body)
	//This is to save file into PNG
	tools.SaveBinFile2Disk(body, "", "received.png")
}

func CreateSampleData() ImageRequestArgs  {
	ret := ImageRequestArgs{}

	ret.Type = "bubble"
	ret.Config = Config{
		ShowLegend: false,
		ShowLineLabel: true,
		DisplayPercent: true,
		ShowGaugeLabel: true,
		MinValue: 0,
		MaxValue: 100,
		Width: 700,
		Height: 500,

	}

	node1 := NodeData{Name: "BM1", Score: 20}
	node2 := NodeData{Name: "BM2", Score: 90}
	node3 := NodeData{Name: "BM3", Score: 50}
	var orgData1 = OrgData{
		Id: "1",
		Name : "Washington",
	}
	nodeData1 :=  NodeDatas{ node1, node2, node3}
	orgData1.Data = nodeData1


	node4 := NodeData{Name: "BM1", Score: 25}
	node5 := NodeData{Name: "BM2", Score: 80}
	node6 := NodeData{Name: "BM3", Score: 70}
	var orgData2 = OrgData{
		Id: "2",
		Name : "Vancouver",
	}
	nodeData2 :=  NodeDatas{ node4, node5, node6}
	orgData2.Data = nodeData2


	node7 := NodeData{Name: "BM1", Score: 45}
	node8 := NodeData{Name: "BM2", Score: 70}
	node9 := NodeData{Name: "BM3", Score: 40}
	var orgData3 = OrgData{
		Id: "3",
		Name : "Texas",
	}
	nodeData3 :=  NodeDatas{ node7, node8, node9}
	orgData3.Data = nodeData3

	ret.Data = OrgDatas{orgData1, orgData2, orgData3}
	ret.XData = []string{"BM1", "BM2", "BM3"}

	return ret
}

type ImageRequestArgs struct{
	Type 	string  	`json:"type"`
	Config	Config  	`json:"config"`
	Data	[]OrgData 	`json:"data"`
	XData   []string	`json:"xData"`
}
type OrgDatas []OrgData
type NodeDatas []NodeData
type OrgData struct{
	Id 	string		`json:"id"`
	Name 	string		`json:"name"`
	Data    NodeDatas	`json:"data"`
}
type NodeData struct {
	Name  string            `json:"name"`
	Score int		`json:"score"`
}
type Config struct{
	ShowLegend 	bool		`json:"showLegend"`
	ShowLineLabel 	bool		`json:"showLineLabel"`
	DisplayPercent 	bool		`json:"displayPercent"`
	ShowGaugeLabel 	bool		`json:"showGaugeLabel"`
	MinValue 	int		`json:"minValue"`
	MaxValue 	int		`json:"maxValue"`
	Width           int		`json:"width"`
	Height          int  		`json:"height"`
}





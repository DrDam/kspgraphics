
var myChart = {};

function updateGraph(id, masterData) {
    myChart.destroy();
    RunGraph(id, masterData);
}

function RunGraph(id, masterData) {
    var ctx = document.getElementById(id).getContext('2d');

    var dataset = [];
    var datalist = masterData.Series;
    var colors = make_colors(Object.keys(datalist).length);
    var colors_id = 0;
    for(var i in datalist) {
        // make dataset
        var dataItem = {};
        dataItem.fill = false;
        dataItem.label = i;
        dataItem.data = datalist[i];
        dataItem.info = masterData.Info[i];
        dataItem.borderColor = colors[colors_id];
        dataItem.lineTension = 0;
        dataset.push(dataItem);

        colors_id++;
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: masterData.Labels,
            datasets: dataset
        },
        options: {
            title: masterData.graph.title,
            legend: {
                display: masterData.graph.displayLegend,
                position:'top',
                labels : {
                    padding: 15,
                    filter : function(legend, chartData) {
                        var id = legend.datasetIndex;
                        var data = chartData.datasets[id].data;
                        for(var i in data) {
                            if(data[i] != null) {
                                return legend;
                            }
                        }
                    }
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        labelString: masterData.graph.ylabel,
                        display: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        labelString: masterData.graph.xlabel,
                        display: true
                    }
                }]
            },
            tooltips : {
                mode: 'point',
                callbacks: masterData.graph.tooltipsCallback
            }
        }
    });
}


// Déclaration des fonctions

function run(datas) {
    var Series = [];
    var Labels = [];
    var Info = [];

    // 1- Calcul des valeurs de fuels
    var Fuelstep = (datas.fuel.max - datas.fuel.min) / datas.fuel.step;

    var Fuelscale = [];
    var Qfueld = datas.fuel.min;
    for (var i = 0; Qfueld < datas.fuel.max; i++) {
        Qfueld = datas.fuel.min + i * Fuelstep;
        Fuelscale[i] = round(Qfueld);
        Labels.push(round(Qfueld));
    }

    // 2- Calcul des valeurs de DeltaV
    var Dvstep = (datas.dv.max - datas.dv.min) / (datas.dv.step-1);
    var QDv = datas.dv.min;


    for (var i = 0; QDv < datas.dv.max; i++) {
        QDv = datas.dv.min + i * Dvstep;
        DV_name = Math.floor(round(QDv));
        var Serie = [];
        var InfoSerie = [];

        // Pour chaque point du graphique
        for (var j = 0; j < Fuelscale.length; j++) {

            var Mfuel = Fuelscale[j];
            var MuElem = {'Fuel': Mfuel.toString()};
            var DetailElem = {'Fuel': Mfuel.toString()};

            // On parcours tout les Dv
            var X = Math.exp(QDv / datas.Go / datas.ISP);

            var Tank = Mfuel / 9;

            var data = (Tank * (1 - X) + Mfuel) / (X - 1);

            Serie.push(parseInt(round(data)));
            InfoSerie.push({Mfuel:Mfuel,Mu:Math.floor(data)})
        }
        Series[DV_name] = Serie;
        Info[DV_name] = InfoSerie;
    }

    return {
        Series : Series,
        Labels : Labels,
        Info : Info
    }
}

function getTooltipsCallbacks() {
    return {
        title : function(tooltipItem, data) {
            console.log(tooltipItem);
            return "Pour "+ tooltipItem[0].xLabel + "t de fuel";
        },
        label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';
            //var info =  data.datasets[tooltipItem.datasetIndex].info[tooltipItem.index];
            var str = "vous permet d'apporter"+label+ "m/s de Dv à "+tooltipItem.yLabel+"tonnes de CU";
            return str;
        }
    };
}


// Jquery
$(function() {
    masterData = {};
    masterData.graph = {};
    masterData.graph.title = {
        display: true,
        text: ""
    };
    masterData.graph.ylabel = 'Masse CU ou étages supérieurs';
    masterData.graph.xlabel = "Masse de fuel de l'étage";
    masterData.graph.tooltipsCallback = getTooltipsCallbacks();
    masterData.graph.displayLegend = false;

    // submit des valeurs
    $('#graph_param').submit(function(event) {

        event.preventDefault();

        var elems = event.currentTarget.elements;

        datas = {
            fuel: {
                min: Number(elems.Fuel1.value),
                max: Number(elems.Fuel2.value),
                step: Number(elems.FuelStep.value)
            },
            dv: {
                min: Number(elems.Dv1.value),
                max: Number(elems.Dv2.value),
                step: Number(elems.DvStep.value)
            },
            ISP: Number(elems.ISP.value),
            Go: 9.81
        };

        var result = run(datas);
        masterData.Info = result.Info;
        masterData.Labels = result.Labels;
        masterData.Series = result.Series;
        masterData.graph.title.text = 'Quelle CU avec entre '+datas.fuel.min+' et '+datas.fuel.max+'t de fuel et un ISP de '+datas.ISP+'s';
        updateGraph('myChart', masterData);

        return false;
    });

    var datas = {
        fuel: {min: 1000, max: 9000, step: 10},
        dv: {min: 1000, max: 6000, step: 6},
        ISP: 350,
        Go: 9.81
    };

    var result = run(datas);
    masterData.Info = result.Info;
    masterData.Labels = result.Labels;
    masterData.Series = result.Series;
    masterData.graph.title.text = 'Quelle CU avec entre '+datas.fuel.min+' et '+datas.fuel.max+'t de fuel et un ISP de '+datas.ISP+'s';
    RunGraph('myChart', masterData);

});
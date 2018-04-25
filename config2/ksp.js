
// Déclaration des fonctions

function run(datas) {
    var Series = [];
    var Labels = [];
    var Info = [];
    var zero = null;
    if(datas.zero == true) {
        zero = 0;
    }
    // Make labels
    for (var j = 1;j <= datas.Nb;j++) {
        Labels.push(j)
    }

    // Pour chaque type de moteur
    for(var EngineName in Engines) {
        var Serie = [];
        var InfoSerie = [];
        var Engine = Engines[EngineName];
        // Pour chaque nombre de moteurs
        for (var j = 1;j <= datas.Nb;j++) {
            var no_value = false;
            // Calcul de la masse Morte
            var Mmorte = datas.MasseUtile + Engine.Mass.empty * j;
            var atmo_value = (datas.Atmo == 1) ? 'atm' : 'vac';

            // Calcul de la masse de fuel maximale ( limité par le TWR)
            var X = (Engine.Thrust[atmo_value] * j) / datas.Go / datas.TWR;

            // En moyenne le poid d'un réservoir "sec" de fuel est de 1/9 de la masse pleine
            var Mfuel = 8 / 9 * (X - Mmorte);


            // Contrôle si le DeltaV est vérifié
            var Dv = Engine.ISP[atmo_value] * datas.Go * Math.log((Mmorte + 9 / 8 * Mfuel) / (Mmorte + 1 / 8 * Mfuel));

            if (Dv < datas.Dv) {
                no_value = true;
            }

            // Contôle si la masse Max est dépassée
            var M = Mmorte + 9 / 8 * Mfuel;
            if (datas.MasseMax > 0 && datas.MasseMax < M) {
                no_value = true;
            }

            if(no_value == false ){
                Serie.push(parseInt(Dv));
            }
            else {
                Serie.push(zero);
            }
            InfoSerie.push({Mfuel:round(Mfuel),M:round(M)})
        }
        Series[EngineName] = Serie;
        Info[EngineName] = InfoSerie;
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
            return "Configuration avec "+ tooltipItem[0].xLabel + " moteurs";
        },
        label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';
            var info =  data.datasets[tooltipItem.datasetIndex].info[tooltipItem.index];
            if (label) {
                label += ' : ';
                label += "Dv : " + tooltipItem.yLabel + 'm/s    ';
                label += "Fuel consommé : " + info.Mfuel + 't    ';
                label += "Masse totale : " + info.M + 'tonnes';
            }
            return label;
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
    masterData.graph.xlabel = 'Nombre de moteurs';
    masterData.graph.ylabel = 'Delta V (m/s)';
    masterData.graph.tooltipsCallback = getTooltipsCallbacks();
    masterData.graph.displayLegend = true;

    // submit des valeurs
    $('#graph_param').submit(function(event) {

        event.preventDefault();

        var elems = event.currentTarget.elements;
        datas = {Nb: parseInt(elems.Nb.value),
            Dv: parseInt(elems.dV.value),
            TWR: Number(elems.TWR.value),
            MasseUtile: Number(elems.Mu.value),
            MasseMax: Number(elems.Max.value),
            Atmo: Number(elems.atmo.checked),
            Go: 9.81,
            zero: elems.zero.checked
        };

        var result = run(datas);
        masterData.Info = result.Info;
        masterData.Labels = result.Labels;
        masterData.Series = result.Series;
        masterData.graph.title.text = 'Quelle motorisation pour un TWR de '+datas.TWR+', '+datas.MasseUtile+'t de Charge utile'+' et un deltaV > '+datas.Dv+'m/s';
        updateGraph('myChart', masterData);

        return false;
    });

    // traitement initial
    var datas = {Dv: 4500,
        TWR: 0.5,
        Nb: 10,
        MasseUtile: 10,
        MasseMax: 0,
        Atmo: 0,
        Go: 9.81,
        zero: false
    };
    var result = run(datas);
    masterData.Info = result.Info;
    masterData.Labels = result.Labels;
    masterData.Series = result.Series;
    masterData.graph.title.text = 'Quelle motorisation pour un TWR de '+datas.TWR+', '+datas.MasseUtile+'t de Charge utile'+' et un deltaV > '+datas.Dv+'m/s';
    RunGraph('myChart', masterData);

});
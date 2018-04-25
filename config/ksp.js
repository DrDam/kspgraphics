
// Déclaration des fonctions
function run(datas) {

    var Series = [];
    var Labels = [];
    var Info = [];

    var zero = null;
    if(datas.zero == true) {
        zero = 0;
    }

    // 1- Calcul des valeurs de fuels
    var step = (datas.fuel.max - datas.fuel.min) / datas.fuel.step;

    var Fuelscale = [];
    var Qt = datas.fuel.min;
    for (var i = 0; Qt < datas.fuel.max; i++) {
        var Qt = datas.fuel.min + i * step;
        Fuelscale[i] = round(Qt);
        Labels.push(round(Qt));
    }

    // Par type de moteur

    for(var engineName in Engines) {

        var nb = 0;
        var Mtot = 0;
        var engine = Engines[engineName];
        var Serie = [];
        var InfoSerie = [];
        var error = '';

        // Pour chaque point du graphique
        for (var j = 0; j < Fuelscale.length; j++) {
            var Mfuel = Fuelscale[j];

            // 2 - Calcul du nb de moteur
            var atmo_value = (datas.Atmo == 1) ? 'atm' : 'vac' ;
            // Si  le TWR est inférieur à celui saisi, on augmente de 1 le nb de moteur
            do {
                nb++;

                Mtot = round(9 / 8 * (Mfuel) + engine.Mass.empty * nb + datas.MasseUtile);
                var twr = engine.Thrust[atmo_value] * nb / (datas.Go * Mtot);

                if(nb > datas.NbMoteur) {
                    error = ' plus de '+datas.NbMoteur;
                    twr = 0;
                    deltaV = 0;
                    break;
                }
            } while (twr < datas.TWR)

            // 3- Calcul du deltaV de cette configuration

            if(error == '') {
                if(twr != 0)  {
                    var Mdry = Mtot - Mfuel;
                    var deltaV = datas.Go * engine.ISP[atmo_value] * Math.log(Mtot / Mdry);
                }

                if(parseInt(deltaV) != 0 ){
                    Serie.push(parseInt(deltaV));
                    InfoSerie.push({Nb:nb,Twr:round(twr)})
                }
                else {
                    Serie.push(zero);
                    InfoSerie.push({Nb:zero,Twr:zero})
                }
            }
            else {
                Serie.push(zero);
                InfoSerie.push({Nb:error,Twr:zero})
            }


        }

        Series[engineName] = Serie;
        Info[engineName] = InfoSerie;
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
            return "Configuration pour "+ tooltipItem[0].xLabel + " tonnes de carburant";
        },
        label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';
            var info =  data.datasets[tooltipItem.datasetIndex].info[tooltipItem.index];
            if (label) {
                label += ' avec ';
                label += info.Nb + ' moteurs    ';
                label += "Dv : " + tooltipItem.yLabel + 'm/s    ';
                label += "TWR : " + info.Twr;
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
    masterData.graph.xlabel = 'Masse de carburant (t)';
    masterData.graph.ylabel = 'Delta V (m/s)';
    masterData.graph.tooltipsCallback = getTooltipsCallbacks();
    masterData.graph.displayLegend = true;

    // submit des valeurs
    $('#graph_param').submit(function(event) {

        event.preventDefault();

        var elems = event.currentTarget.elements;

        datas = {fuel: {min: Number(elems.Fuel1.value), max: Number(elems.Fuel2.value), step: Number(elems.FuelStep.value)},
            TWR: Number(elems.TWR.value),
            MasseUtile: Number(elems.Mu.value),
            NbMoteur: Number(elems.Nb.value),
            Atmo: Number(elems.atmo.checked),
            Go: 9.81,
            zero: elems.zero.checked
        };

        var result = run(datas);
        masterData.Info = result.Info;
        masterData.Labels = result.Labels;
        masterData.Series = result.Series;
        masterData.graph.title.text = 'Quelle motorisation pour un TWR de '+datas.TWR+' et '+datas.MasseUtile+'tonnes de Charge utile';
        updateGraph('myChart', masterData);

        return false;

    });


    // traitement initial
    var datas = {fuel: {min: 10, max: 110, step: 10},
        TWR: 0.5,
        MasseUtile: 1,
        NbMoteur:20,
        Atmo: 0,
        Go: 9.81,
        zero: false,
    };
    var result = run(datas);
    masterData.Info = result.Info;
    masterData.Labels = result.Labels;
    masterData.Series = result.Series;
    masterData.graph.title.text = 'Quelle motorisation pour un TWR de '+datas.TWR+' et '+datas.MasseUtile+'tonnes de Charge utile';
    RunGraph('myChart', masterData);

});



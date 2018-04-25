
function round(number) {
    return Math.round(number * 1000) / 1000;
}

function make_colors(nb) {

    var id = Math.ceil(Math.cbrt(nb/3))+1 ;
    var path = Math.ceil(255/id);
    var colors = [];
    for (var i = 0; i < id; i++) {
        for (var j = 0; j < id; j++) {
            for (var k = 0; k < id; k++) {
                colors.push("rgb("+ Math.floor(255 - path*i) +","+ Math.floor(255 - (path*(j+1))%255) +","+ Math.floor(255 - (path*(k+2))%255) +")");
            }
        }
    }
    console.log(colors);
    return colors;
}

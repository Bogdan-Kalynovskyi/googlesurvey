function Chart (container) {
    var chart;


    function draw (tagsGoo) {
        try {
            container.style.height = 26.05 * tagsGoo.getNumberOfRows() + 'px';
            if (!chart) {
                chart = new google.charts.Bar(container);
            }
            chart.draw(tagsGoo, {
                chart: {},
                bars: 'horizontal' // Required for Material Bar Charts.
            });
        }
        catch (e) {
            setTimeout(function () {
                draw(tagsGoo);
            }, 1000);
        }
    }


    this.create = function (data) {
        draw(data);
    };
}
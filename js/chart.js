function Chart (container) {
    var chart;

    this.create = function (tagsGoo) {
        if (chart) {
            this.update(tagsGoo);
        }
        else {

            container.style.height = 26 * tagsGoo.getNumberOfRows() + 'px';
            chart = new google.charts.Bar(container);
            chart.draw(tagsGoo, {
                chart: {
                    title: ' '
                },
                bars: 'horizontal' // Required for Material Bar Charts.
            });
        }
    };

    this.update = function (tagsGoo) {
        container.style.height = 16 * tagsGoo.getNumberOfRows() + 'px';
        chart.draw(tagsGoo);
    }
}

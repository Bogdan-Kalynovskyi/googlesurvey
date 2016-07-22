function Chart (container) {
    var chart;


    this.create = function (data, survey) {
        google.charts.setOnLoadCallback(function () {
            var i = 0,
                n = data.length,
                arr = new Array(n + 1);

            for (; i < n; i++) {
                var line = data[i];
                arr[i + 1] = [line[0], line[1] / total * 100];
            }

            arr[0] = ['', 'Tag %'];
            var gData = google.visualization.arrayToDataTable(arr);

            container.style.height = 28 * n + 'px';
            if (!chart) {
                chart = new google.charts.Bar(container);
            }
            chart.draw(gData, {
                chart: {},
                bars: 'horizontal' // Required for Material Bar Charts.
            });

            $('#comment-chart').html(
                '<br>Question: ' + survey.question +
                '<br><br>Total answers: ' + survey.total)
        });
    };
}
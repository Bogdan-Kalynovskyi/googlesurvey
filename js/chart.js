function Chart (container) {
    var that = this,
        gData,
        updateThrottle,
        chart,
        options = {
            bars: 'horizontal'
        };


    this.create = function (data, survey) {
        if (!window.google || !google.charts.Bar || !google.visualization) {
            setTimeout(function () {
                that.create(data, survey);
            }, 200);
        }
        else {
            google.charts.setOnLoadCallback(function () {

                function encodeRow(row) {
                    var str = '';
                    for (var j = 0; j < row.length; j++) {
                        var cell = row[j].toString().replace(/"/g, '""');
                        if (cell.search(/("|,|\n)/g) >= 0) {
                            cell = '"' + cell + '"';
                        }

                        str += j > 0 ? (',' + cell) : cell;
                    }
                    return str + '\n';
                }


                var csvStr = '',
                    i = 0,
                    n = data.length,
                    arr = new Array(n + 1);

                for (; i < n; i++) {
                    var line = data[i],
                        perc = line[1] / total,
                        row1 = [line[0], perc],
                        row2 = [line[0], perc.toFixed(2) + '%', line[1]];

                    arr[i + 1] = row1;
                    csvStr += encodeRow(row2);
                }

                that.csvStr = csvStr;
                that.csvBlob = new Blob([csvStr], {type: 'text/csv;charset=utf-8;'});


                arr[0] = ['', 'Tag %'];
                gData = google.visualization.arrayToDataTable(arr);
                // todo visualization can be not loaded when this callback fires!!!!!

                container.style.height = 28 * n + 'px';
                if (!chart) {
                    chart = new google.charts.Bar(container);
                }

                chart.draw(gData, options);

                byId('comment-chart').innerHTML = survey.question;
            });
        }
    };


    this.resize = function () {
        clearTimeout(updateThrottle);

        updateThrottle = setTimeout(function () {
            if (chart) {
                chart.draw(gData, options);
            }
        }, 100);
    }
}
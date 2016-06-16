function Table (postData, ui) {

    var tags = [],
        dataTable,
        tbody;

    /////////////////////////////

    function drawTable () {
        var str = '<table class="table table-striped table-bordered table-hover table-sm">' +
                '<thead class="thead-inverse"><tr>' +
                '<td>Tag</td>' +
                '<td>Count</td>' +
                '<td></td>' +
                '</tr></thead>' +
                '<tbody>',
            line,
            odd = false;

        for (var i = 0, len = tags.length; i < len; i++) {
            line = tags[i];
            str +=
                '<tr class="' + (odd ? '' : '') + '">' +
                '<td><input type=checkbox></td>' +
                '<td>' + line[0] + '</td>' +
                '<td>' + line[1] + '</td>' +
                '</tr>';
            odd = !odd;
        }

        str += '</tbody></table>';

        ui.table.innerHTML = str;
        tbody = ui.table.getElementsByTagName('tbody')[0];
    }


    function objToArr () {
        var obj = postData.tags;
        for (var i in obj) {
            tags.push([i, obj[i]]);
        }
    }


    function arrToObj() {
        var obj = postData.tags,
            newObj = {},
            el;
        for (var i = 0, len = tags.length; i < len; i++) {
            el = tags[i];
            newObj[el[0]] = el[1];
        }
        postData.tags = newObj;
    }


    function sortTags() {
        function sortFunction (a, b) {
            if (a[1] > b[1]) {
                return -1;
            }
            else if (a[1] < b[1]) {
                return 1;
            }
            else {
                return 0;
            }
        }

        tags.sort(sortFunction);
    }


    function drawTableAndChart (delayed) {
        sortTags();
        if (delayed) {
            setTimeout(function () {
                drawTable();
            }, 500);
        }
        else {
            drawTable();
        }
        drawChart();
    }


    function addRows (arr) {
        var odd = tags.length % 2,
            str = '';

        for (var i = 0; i < arr.length; i++) {
            str += '<tr class="' + (odd ? '' : '') + '">' +
                    '<td><input type=checkbox></td>' +
                    '<td>' + arr[i][0] + '</td>' +
                    '<td>' + arr[i][1] + '</td>' +
                   '</tr>';
            odd = !odd;
        }

        $(tbody).append(str);
        tags.concat(arr);
    }


    function updateRow (i, tag, count) {
        var row = tbody.children[i];

        row.children[0].innerHTML = tag;
        row.children[1].innerHTML = count;
        tags[i] = [tag, count];
    }


    function removeRow (i) {
        tbody.removeChild(tbody.children[i]);
        tags.splice(i, 1);
    }


    function drawChart () {
        google.charts.setOnLoadCallback(function () {
            tags.unshift(['Tag', 'Count']);
            dataTable = google.visualization.arrayToDataTable(tags);
            tags.shift();

            ui.chart.style.height = 16 * tags.length + 'px';

            var chart = new google.charts.Bar(ui.chart);
            chart.draw(dataTable, {
                chart: {
                    title: 'What\'s the first thing that comes to your mind when you think of Adelaide?'
                },
                bars: 'horizontal' // Required for Material Bar Charts.
            });
        });
    }


    function getSelected() {
        var selected = [],
            checkboxes = tbody.getElementsByTagName('input');

        for (var i = 0, len = tags.length; i < len; i++) {
            if (checkboxes[i].checked) {
                selected.push(i);
            }
        }
        return selected;
    }


    function sendPost () {
        arrToObj();
    }


    this.remove = function () {
        var selected = getSelected();

        for (var i = 0; i < selected.length; i++) {
            removeRow(selected[i]);
        }
        drawChart();
        sendPost();
    };


    this.merge = function () {
        var selected = this.getSelected(),
            tag = '',
            count = 0;

        if (selected.length === 0) {
            return;
        }

        for (var i = 0; i < selected.length; i++) {
            tag += ', ' + dataTable.getValue(selected[i][0]);
            count += dataTable.getValue(selected[i][1]);
            removeRow(selected[i]);
        }

        tag = tag.substr(2);
        updateRow(selected[0], tag, count);
        drawTableAndChart(true);
        sendPost();
    };


    this.add = function (str) {
        var arr = [];
        str = str.toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/);
        for (var i = 0; i < str.length; i++) {
            arr.push([str[i].trim(), 0]);
        }
        addRows(arr);
        drawChart();
        sendPost();
    };


    (function init () {
        objToArr();
        drawTableAndChart();
        //ui.btnDelete.onclick = 
    })();
}
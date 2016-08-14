function SimpleTable (container) {

    this.create = function (tags) {
        var str = '';

        for (var i = 0, n = tags.length; i < n; i++) {
            var line = tags[i];
            str +=
                '<tr><td>' + line[0] + '</td><td>' + (line[1] * 100 / total).toFixed(2) + '%</td><td>' + line[1] + '</td></tr>';
        }

        container.innerHTML =   '<table class="table table-striped table-bordered table-hover">' +
                                '<thead class="thead-default"><tr>' +
                                '<th>Tag</th><th>%</th><th>Answers</th>' +
                                '</tr></thead>' +
                                '<tbody>' + str + '</tbody></table>';
    };
}

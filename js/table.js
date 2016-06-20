function Table (container) {
    var tbody;

    this.create = function (tagsArr) {
        if (tbody) {
            this.reset(tagsArr);
            return;
        }
        
        var str = '<table class="table table-striped table-bordered table-hover table-sm">' +
                    '<thead class="thead-inverse"><tr>' +
                    '<td><input type=checkbox></td>' +
                    '<td>Tag</td>' +
                    '<td>Count</td>' +
                    '</tr></thead>' +
                    '<tbody>';

        for (var i = 0, len = tagsArr.length; i < len; i++) {
            var line = tagsArr[i];
            str +=
                '<tr><td><input type=checkbox></td>' +
                '<td>' + line[0] + '</td>' +
                '<td>' + line[1] + '</td></tr>';
        }

        str += '</tbody></table>';

        container.innerHTML = str;
        tbody = container.getElementsByTagName('tbody')[0];
        
        container.querySelector('thead input').onchange = function () {
            var checkboxes = tbody.getElementsByTagName('input'),
                checked = this.checked;

            for (var i = 0, len = checkboxes.length; i < len; i++) {
                checkboxes[i].checked = checked;
            }
        }
    };
    
    
    this.reset = function (tagsArr) {
        tbody.innerHTML = '';
        this.addRows(tagsArr);
    };


    this.addRows = function (tagsArr) {
        var str = '';

        for (var i = 0, len = tagsArr.length; i < len; i++) {
            str +=
                '<tr><td><input type=checkbox></td>' +
                '<td>' + tagsArr[i][0] + '</td>' +
                '<td>' + tagsArr[i][1] + '</td></tr>';
        }
        $(tbody).append(str);
    };


    this.updateRow = function (i, tag, count) {
        var row = tbody.children[i];
        if (tag) {
            row.children[0].innerHTML = tag;
        }
        if (count) {
            row.children[1].innerHTML = count;
            //this.reset();
        }
    };


    this.deleteRow = function (i) {
        tbody.removeChild(tbody.children[i]);
    }
}


bootstrapAlert = function (message) {
    $('#modal-placeholder').html('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button></div><div class="modal-body">' + message + '</div><button class="btn btn-sm block-center" data-dismiss="modal">Ok</button></div></div></div>');
    $('.modal').modal('show');
};
function Table (container) {
    var tbody;

    this.create = function (tagsArr) {
        if (tbody) {
            this.reset(tagsArr);
            return;
        }

        var str = '<table class="table table-striped table-bordered table-hover">' +
                    '<thead class="thead-default"><tr>' +
                    '<th><input type=checkbox></th>' +
                    '<th>Tag</th>' +
                    '<th>Count</th>' +
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

        addMasterCheckbox();
        addDynamicInput();
    };


    function addMasterCheckbox () {
        container.querySelector('thead input').onchange = function () {
            var checkboxes = tbody.getElementsByTagName('input'),
                checked = this.checked;

            for (var i = 0, len = checkboxes.length; i < len; i++) {
                checkboxes[i].checked = checked;
            }
        };
    }


    function addDynamicInput () {
        tbody.addEventListener('click', function (evt) {
            var target = evt.target;

            if (target.tagName === 'TD' && target.parentNode.children[1] === target) {
                var input = $('<input>');
                input.val(target.html());
                $(target).append(input);
                input.focus();
                input.on('blur', function () {

                });
            }
        });
    }


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
            //this.reset(); //after resort
        }
    };


    this.deleteRow = function (i) {
        tbody.removeChild(tbody.children[i]);
    };


    this.selectedIndexes = function () {
        var selected = [],
            checkboxes = tbody.getElementsByTagName('input');

        for (var i = 0, len = checkboxes.length; i < len; i++) {
            if (checkboxes[i].checked) {
                selected.push(i);
            }
        }
        return selected;
    };
}

function Table (container) {
    var tbody,
        isTags = container.id === 'tags-table',
        isPacked = true;

    this.create = function (tagsArr) {
        if (tbody) {
            this.update(tagsArr);
            return;
        }

        container.innerHTML =   '<table class="table table-striped table-bordered table-hover">' +
                                '<thead class="thead-default" ondragover="return false"><tr>' +
                                '<th><input type=checkbox></th>' +
                                '<th>' + (isTags ? 'Tag' : 'Term') + '</th>' +
                                '<th>Repeat</th>' +
                                '</tr><tr><th colspan=3>' +
                                (isTags ? 'Drop on header to create a tag, drop on tag to create synonym' : 'Drop here to remove tag or synonym from use') +
                                '</th></tr></thead>' +
                                '<tbody>' +
                                    fillTableBody(tagsArr) +
                                '</tbody></table>';

        tbody = container.getElementsByTagName('tbody')[0];

        assignMasterCheckbox();
        assignDragNDrop();
        assignDynamicInput();
        
        isPacked = false;
    };


    function fillTableBody (tagsArr) {
        var str = '';

        for (var i = 0, n = tagsArr.length; i < n; i++) {
            var line = tagsArr[i],
                terms,
                subTerms = '';

            if (isTags && (terms = line[2])) {
                if (isPacked) {
                    terms = terms.split(',');
                    line[2] = terms;
                }
                
                subTerms = '<ul>';
                for (var j = 0, m = terms.length; j < m; j++) {
                    subTerms += '<li draggable=true>' + terms[j] + '</li>';
                }
                subTerms += '</ul>';
            }
            str +=
                '<tr ondragover="return false"><td><input type=checkbox></td>' +
                '<td><span draggable=true>' + line[0] + '</span></td>' +
                '<td>' + line[1] + subTerms + '</td></tr>';
        }

        return str;
    }


    function assignMasterCheckbox () {
        container.querySelector('thead input').onchange = function () {
            var checkboxes = tbody.getElementsByTagName('input'),
                checked = this.checked;

            for (var i = 0, len = checkboxes.length; i < len; i++) {
                checkboxes[i].checked = checked;
            }
        };
    }


    function assignDragNDrop () {
        var starter, current, outline,
            table = container.children[0];

        function getIndex (el, findTr) {
            var tr = findTr ? $(el).closest('tr')[0] : el,
                arr = Array.prototype.slice.call(tbody.children);
                return arr.indexOf(tr);
        }


        tbody.addEventListener('dragstart', function (evt) {
            var target = evt.target,
                dt = evt.dataTransfer;

            if (!(target instanceof HTMLElement && target.draggable === true)) {
                return false;
            }
            dt.setData("index", getIndex(target, true));
            dt.setData("target", target.tagName);
            if (target.tagName === 'LI') {
                dt.setData("html", target.innerHTML);
            }
            dt.setData("table", container.id);

            starter = $(target).closest('[ondragover]')[0];
        });


        table.addEventListener('dragenter', function (evt) {
            var target = evt.target;

            if (!current || !current.contains(target)) {
                if (current) {
                    current.style.background = '';
                    outline.style.outline = '';
                    current = undefined;
                }

                if (!starter || !starter.contains(target)) {
                    target = $(target).closest('[ondragover]')[0];
                    if (target) {
                        current = target;
                        if (target.tagName === 'THEAD') {
                            outline = target.parentNode;
                        }
                        else if (!isTags) {
                            outline = target.parentNode.parentNode;
                        }
                        else {
                            outline = target;
                            target.style.background = 'rgba(0, 0, 255, 0.15)';
                        }
                        outline.style.outline = '2px solid blue';
                    }
                }
            }

            evt.stopPropagation();
        });


        document.addEventListener('dragenter', function () {
            if (current) {
                current.style.background = '';
                outline.style.outline = '';
                current = undefined;
            }
        });


        table.addEventListener('drop', function (evt) {
            var target = $(evt.target).closest('[ondragover]')[0],
                dt = evt.dataTransfer,
                from = {
                    index: +dt.getData('index'),
                    target: dt.getData('target'),
                    html: dt.getData('html'),
                    table: dt.getData('table')
                },
                to = {
                    index: target.tagName === 'TR' && getIndex(target),
                    target: target.tagName,
                    table: container.id
                };

            if (current) {
                current.style.background = '';
                outline.style.outline = '';
            }

            if ($(target).closest('thead').length) {
                to.target = 'THEAD';
            }

            angular.element(document.body).scope().ctrl.dragTag(from, to);
        });
    }


    function assignDynamicInput () {
        tbody.addEventListener('click', function (evt) {
            var target = evt.target;

            if (target.tagName === 'SPAN' || target.tagName === 'LI') {
                var oldName = target.innerHTML;
                target.innerHTML = '<input value="' + oldName + '">';
                var input = target.children[0];
                input.focus();
                input.onblur = function () {
                    if (input.value && oldName !== input.value) {
                        var arr = Array.prototype.slice.call(tbody.children),
                            index = arr.indexOf(target.parentNode.parentNode);

                        angular.element(document.body).scope().ctrl.updateTag(container.id, index, target.tagName, input.value, oldName);
                    }
                    target.innerHTML = input.value;
                };
            }
        });
    }


    this.update = function (tagsArr) {
        tbody.innerHTML = '';
        this.addRows(tagsArr);
    };
    
    
    this.makePinkRows = function (a, b) {
        var children = tbody.children;
        
        for (var i = a; i < b; i++) {
            children[i].style.background = 'repeating-linear-gradient(45deg,transparent,transparent 10px,#eee 10px,#eee 20px),linear-gradient(to bottom,#fff,#ddd)';
        }    
    };


    this.addRow = function (tag) {
        $(tbody).prepend(fillTableBody([tag]));
    };


    this.addRows = function (tagsArr) {
        $(tbody).prepend(fillTableBody(tagsArr));
    };


    this.addSubTerm = function (index, term) {
        var td = $(tbody.children[index]),
            ul = td.find('ul'),
            str = '<li draggable=true>' + term[0] + '</li>';

        if (ul.length) {
            ul.append(str);
        }
        else {
            td.find('span').after('<ul>' + str + '</ul>');
        }
    };


    this.deleteSubTerm = function (index, pos) {
        tbody.removeChild(tbody.children[index].children[0].children[1].children[pos]);
    };


    this.deleteRow = function (index) {
        tbody.removeChild(tbody.children[index]);
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

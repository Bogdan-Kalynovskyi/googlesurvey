function Table (container) {
    var tbody,
        masterCheckbox,
        isNotFiltered = true,
        root = document.getElementById('logged-in'),
        isTagsTable = container.id === 'tags-table';


    function toPerc (repeat) {
        return (100 * repeat / total).toFixed(2);
    }


    this.create = function (tagsArr, reset) {
        if (tbody && !reset) {
            this.update(tagsArr);
            return;
        }

        tbody = null;

        container.innerHTML =   '<table class="table table-striped table-bordered table-hover">' +
                                '<thead class="thead-default" ondragover="return false"><tr>' +
                                '<th colspan=5><b>' + (isTagsTable ? 'Used tags and synonyms' : 'Unused stuff') + '</b></th></tr><tr>' +
                                '<th><input type=checkbox></th>' +
                                '<th>' + (isTagsTable ? 'Tag' : 'Term') + '</th>' +
                                '<th colspan=3>Answers</th>' +
                                '</tr><tr><th colspan=5>' +
                                (isTagsTable ? 'Drop on header to create a tag, drop on tag to create synonym' : 'Drag here to exclude. You can drag multiple by selecting the checkboxes') +
                                '</th></tr></thead>' +
                                '<tbody>' +
                                    fillTableBody(tagsArr) +
                                '</tbody></table>';

        tbody = container.getElementsByTagName('tbody')[0];

        addMasterCheckbox();
        assignDragNDrop();
        assignDynamicInput();
        assignLineDelete();
    };


    function fillTableBody (tagsArr) {
        var str = '';

        for (var i = 0, n = tagsArr.length; i < n; i++) {
            var line = tagsArr[i],
                terms,
                subTerms;

            if (isTagsTable && (terms = line[2])) {
                if (!tbody) {
                    terms = terms.split(',');
                    line[2] = terms;
                    line[3] = line[3].split(',');
                }
                
                subTerms = '<ul>';
                for (var j = 0, m = terms.length; j < m; j++) {
                    subTerms += '<li draggable=true>' + terms[j] + '</li>';
                }
                subTerms += '</ul>';
            }
            else {
                subTerms = '';
            }
            str +=
                '<tr ondragover="return false">' +
                '<td draggable=true><input type=checkbox></td>' +
                '<td><span draggable=true>' + line[0] + '</span>' + subTerms + '</td>' +
                '<td draggable=true>' + toPerc(line[1]) + '%</td><td draggable=true>' + line[1] + '</td><td></td></tr>';
        }

        return str;
    }


    function addMasterCheckbox () {
        masterCheckbox = container.querySelector('thead input');
        masterCheckbox.onchange = function () {
            var rows = tbody.children,
                checked = this.checked;

            for (var i = 0, n = rows.length; i < n; i++) {
                if (visibleTerms[i]) {
                    rows[i].children[0].children[0].checked = checked;
                }
            }
        };
    }


    function assignDragNDrop () {
        var outline, lastTarget,
            table = container.children[0];

        function getIndex (el, findTr) {
            var tr = findTr ? $(el).closest('tr')[0] : el,
                arr = Array.prototype.slice.call(tbody.children);
                return arr.indexOf(tr);
        }


        tbody.addEventListener('dragstart', function (evt) {
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }

            var target = evt.target,
                dt = evt.dataTransfer;

            if (!(target instanceof HTMLElement && target.draggable)) {
                return false;
            }
            dt.setData("index", getIndex(target, true));
            if (target.tagName === 'LI') {
                dt.setData("html", target.innerHTML);
            }
            dt.setData("isSynonym", target.tagName === 'LI' ? '1' : '');
            dt.setData("isTagsTable", isTagsTable ? '1' : '');

            $(tbody).find('input:checked').css('outline', '4px solid rgba(0, 0, 255, 0.2)');

            Table.startElem = $(target).closest('[ondragover]')[0];
        });


        table.addEventListener('dragenter', function (evt) {
            var target = evt.target;

            if (!lastTarget || !lastTarget.contains(target)) {
                if (lastTarget) {
                    outline.style.background = '';
                    outline.style.outline = '';
                    lastTarget = undefined;
                }

                if (!Table.startElem.contains(target)) {
                    target = $(target).closest('[ondragover]')[0];
                    if (target) {
                        lastTarget = target;
                        if (target.tagName === 'THEAD') {
                            outline = target.parentNode;
                        }
                        else if (!isTagsTable) {
                            outline = target.parentNode.parentNode;
                        }
                        else {
                            outline = target;
                        }
                        outline.style.background = 'rgba(0, 0, 255, 0.1)';
                        outline.style.outline = '2px solid blue';
                    }
                }
            }

            masterCheckbox.checked = false;
            evt.stopPropagation();
        });


        document.addEventListener('dragenter', function () {
            if (lastTarget) {
                outline.style.background = '';
                outline.style.outline = '';
                lastTarget = undefined;
            }
        });


        table.addEventListener('drop', function (evt) {
            var target = $(evt.target).closest('[ondragover]')[0],
                dt = evt.dataTransfer,
                from = {
                    index: +dt.getData('index'),
                    html: dt.getData('html'),
                    isSynonym: dt.getData('isSynonym'),
                    isTagsTable: dt.getData('isTagsTable')
                },
                to = {
                    index: target.tagName === 'TR' && getIndex(target),
                    isRow: target.tagName === 'TR',
                    isTagsTable: isTagsTable
                };

            if (lastTarget) {
                outline.style.background = '';
                outline.style.outline = '';
            }

            if ($(target).closest('thead').length) {
                to.target = 'THEAD';
            }

            angular.element(root).scope().ctrl.dragTag(from, to);
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
                            index = arr.indexOf($(target).closest('tr')[0]);

                        angular.element(root).scope().ctrl.updateTag(container.id, index, target.tagName, input.value, oldName);
                    }
                    target.innerHTML = input.value;
                };
                input.onkeyup = function (e) {
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        this.blur();
                    }
                };
            }
        });
    }


    function assignLineDelete () {
        container.children[0].addEventListener('click', function (evt) {
            var tr = evt.target.parentNode;
            if (tr.tagName === 'TR' && tr.children[4] === evt.target) {
                var arr = Array.prototype.slice.call(tbody.children),
                    index = arr.indexOf(tr);
                angular.element(root).scope().ctrl.deleteLine(index, isTagsTable);
            }
        });
    }


    this.selectedIndexes = function () {
        var selected = [],
            rows = tbody.children;

        for (var i = 0, len = rows.length; i < len; i++) {
            if (visibleTerms[i] && rows[i].children[0].children[0].checked) {
                selected.push(i);
            }
        }
        return selected;
    };


    this.filter = function (arr, word) {
        var rows = tbody.children,
            tr,
            fil;

        if (word.length > 1) {
            for (var i = 0, n = arr.length; i < n; i++) {
                fil = arr[i][0].indexOf(word) !== -1;
                tr = rows[i];
                if (fil != visibleTerms[i]) {
                    tr.style.display = fil ? 'table-row' : 'none';
                }
                visibleTerms[i] = fil;
                if (isNotFiltered) {
                    tr.children[0].children[0].checked = false;
                }
            }

            masterCheckbox.checked = false;
            isNotFiltered = false;
        }
        else {
            for (i = 0, n = arr.length; i < n; i++) {
                if (!visibleTerms[i]) {
                    rows[i].style.display = 'table-row';
                }
            }
            visibleTerms = new Array(total).fill(true);
            isNotFiltered = true;
        }
    };

    
    this.updatePerc = function (arr) {
        var children = tbody.children;

        for (var i = 0, n = children.length; i < n; i++) {
            children[i].children[2].innerHTML = toPerc(arr[i][1]) + '%';
        }
    };
    

    this.update = function (tagsArr) {
        tbody.innerHTML = '';
        this.addRows(tagsArr);
    };
    

    this.addRow = function (tag) {
        $(tbody).prepend(fillTableBody([tag]));
    };


    this.addRows = function (tagsArr) {
        $(tbody).prepend(fillTableBody(tagsArr));
    };


    this.addSubTerm = function (index, name, repeat) {
        var tr = tbody.children[index],
            $tr = $(tr),
            ul = $tr.find('ul'),
            str = '<li draggable=true>' + name + '</li>';

        if (ul.length) {
            ul.append(str);
        }
        else {
            $tr.find('span').after('<ul>' + str + '</ul>');
        }
        tr.children[2].innerHTML = toPerc(repeat) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.addSubTerms = function (index, arr) {
        var ul = $(tbody.children[index]).find('ul'),
            str = arr.join('</li><li draggable=true>');
        
        ul.append('<li draggable=true>' + str + '</li>');
    };


    this.deleteSubTerm = function (index, pos, repeat) {
        var tr = tbody.children[index],
            ul = tr.children[1].children[1];
        ul.removeChild(ul.children[pos]);
        tr.children[2].innerHTML = toPerc(repeat) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.deleteRow = function (index) {
        tbody.removeChild(tbody.children[index]);
    };
}

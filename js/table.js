function Table (container) {
    var tbody,
        isTagsTable = container.id === 'tags-table';


    function toPerc (data) {
        return (100 * data / total).toFixed(2);
    }


    this.create = function (tagsArr, reset) {
        if (tbody && !reset) {
            this.update(tagsArr);
            return;
        }

        tbody = null;

        container.innerHTML =   '<table class="table table-striped table-bordered table-hover">' +
                                '<thead class="thead-default" ondragover="return false"><tr>' +
                                '<th><input type=checkbox></th>' +
                                '<th>' + (isTagsTable ? 'Tag' : 'Term') + '</th>' +
                                '<th colspan=3>Answers</th>' +
                                '</tr><tr><th colspan=5>' +
                                (isTagsTable ? 'Drop on header to create a tag, drop on tag to create synonym' : 'Drop here to exclude tag. You can also check and drag multiple') +
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
        container.querySelector('thead input').onchange = function () {
            var checkboxes = tbody.getElementsByTagName('input'),
                checked = this.checked;

            for (var i = 0, len = checkboxes.length; i < len; i++) {
                checkboxes[i].checked = checked;
            }
        };
    }


    function assignDragNDrop () {
        var startElem, current, outline,
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

            $(tbody).find('input:checked').css('outline', '3px solid rgba(0, 0, 255, 0.18)');

            startElem = $(target).closest('[ondragover]')[0];
        });


        table.addEventListener('dragenter', function (evt) {
            var target = evt.target;

            if (!current || !current.contains(target)) {
                if (current) {
                    current.style.background = '';
                    outline.style.outline = '';
                    current = undefined;
                }

                if ((!startElem || !startElem.contains(target)) && (isTagsTable || !startElem)) {
                    target = $(target).closest('[ondragover]')[0];
                    if (target) {
                        current = target;
                        if (target.tagName === 'THEAD') {
                            outline = target.parentNode;
                        }
                        else if (!isTagsTable) {
                            outline = target.parentNode.parentNode;
                        }
                        else {
                            outline = target;
                            target.style.background = 'rgba(0, 0, 255, 0.12)';
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


        table.addEventListener('dragend', function () {
            startElem = undefined;
            $(tbody).find('input:checked').css('outline', '');
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


    function assignLineDelete () {
        container.addEventListener('click', function (evt) {
            var target = evt.target.parentNode;
            if (target.tagName === 'TR' && target.children[4] === evt.target) {
                var arr = Array.prototype.slice.call(tbody.children),
                    index = arr.indexOf(target);
                angular.element(document.body).scope().ctrl.deleteLine(index, isTagsTable);
            }
        });
    }


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

    
    this.updatePerc = function (arr) {
        var children = tbody.children;

        for (var i = 0, n = children.length; i < n; i++) {
            children[i][2].innerHTML = toPerc(arr[i][1]) + '%';
        }
    };
    

    this.update = function (tagsArr) {
        tbody.innerHTML = '';
        this.addRows(tagsArr);
    };
    
    
    this.makeStripedRows = function (a, b) {
        var children = tbody.children;
        
        for (var i = a; i < b; i++) {
            children[i].className = 'striped-bg';
        }    
    };


    this.addRow = function (tag) {
        $(tbody).prepend(fillTableBody([tag]));
    };


    this.addRows = function (tagsArr) {
        $(tbody).prepend(fillTableBody(tagsArr));
    };


    this.addSubTerm = function (index, name, perc, repeat) {
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
        tr.children[2].innerHTML = toPerc(perc) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.addSubTerms = function (index, arr) {
        var ul = $(tbody.children[index]).find('ul'),
            str = arr.join('</li><li draggable=true>');
        
        ul.append('<li draggable=true>' + str + '</li>');
    };


    this.deleteSubTerm = function (index, pos, perc, repeat) {
        var tr = tbody.children[index],
            ul = tr.children[1].children[1];
        ul.removeChild(ul.children[pos]);
        tr.children[2].innerHTML = toPerc(perc) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.deleteRow = function (index) {
        tbody.removeChild(tbody.children[index]);
    };
}

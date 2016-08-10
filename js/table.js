var $undo = $('#undo'),
    ctrl,
    dragData;

$undo[0].onclick = function (evt) {
    var target = evt.target,
        tagName = target.tagName;

    if (tagName === 'UNDO') {
        ctrl.undoRow(target.getAttribute('trash-id'));
        $undo[0].removeChild(target.parentNode);
    }
    else if (tagName === 'DEL-UNDO') {
        $undo[0].removeChild(target.parentNode);
    }
};


function Table (container) {
    var tbody,
        $tbody,
        masterCheckbox,
        visibleTerms,
        isFiltered,
        root = document.getElementById('logged-in'),
        isTagsTable = container.id === 'tags-table';


    function toPerc (repeat) {
        return (100 * repeat / total).toFixed(2);
    }


    this.create = function (arr, reset) {
        if (!isTagsTable) {
            visibleTerms = Array(total).fill(true);
        }
        $undo.innerHTML = '';

        if (tbody && !reset) {
            this.update(arr);
            return;
        }

        tbody = null;

        container.innerHTML =   '<table class="table table-striped table-bordered table-hover"' + (!isTagsTable ? ' ondragover="return false"' : '') + '>' +
                                '<thead class="thead-default"' + (isTagsTable ? ' ondragover="return false"' : '') + '><tr>' +
                                '<th colspan=5><b>' + (isTagsTable ? 'Tags and synonyms' : 'Unused terms') + '</b></th></tr><tr>' +
                                '<th><input type=checkbox></th>' +
                                '<th>' + (isTagsTable ? 'Tag' : 'Term') + '</th>' +
                                '<th colspan=3>Answers</th>' +
                                '</tr><tr><th colspan=5>' +
                                (isTagsTable ? 'Drop on header to create a tag, drop on tag to create synonym' : 'Drag here to exclude. You can drag multiple by selecting the checkboxes') +
                                '</th></tr></thead>' +
                                '<tbody>' +
                                    fillTableBody(arr) +
                                '</tbody></table>';

        tbody = container.children[0].children[1];

        setTimeout(function () {
            $tbody = $(tbody);
            ctrl = ctrl || angular.element(root).scope().ctrl;
            addMasterCheckbox();
            assignDragNDrop();
            assignDynamicInput();
        }, 0);
    };


    function fillTableBody (arr) {
        var str = '';

        for (var i = 0, n = arr.length; i < n; i++) {
            var line = arr[i],
                syn,
                synStr;

            if (isTagsTable && (syn = line[2])) {
                // simultaneously (and implicitly!) unpack on first pass
                if (!tbody) {
                    syn = syn.split(',');
                    line[2] = syn;
                    line[3] = line[3].split(',');
                }
                
                synStr = '<ul>';
                for (var j = 0, m = syn.length; j < m; j++) {
                    synStr += '<li><span draggable=true>' + syn[j] + '</span><del-syn>×</del-syn></li>';
                }
                synStr += '</ul>';
            }
            else {
                synStr = '';
            }
            str +=
                '<tr' + (isTagsTable ? ' ondragover="return false"' : '') + '>' +
                '<td><input type=checkbox></td>' +
                '<td><span draggable=true>' + line[0] + '</span>' + synStr + '</td>' +
                '<td>' + toPerc(line[1]) + '%</td><td>' + line[1] + '</td><td class=del-line>×</td></tr>';
        }

        return str;
    }


    function addMasterCheckbox () {
        masterCheckbox = container.querySelector('thead input');
        masterCheckbox.onchange = function () {
            var rows = tbody.children,
                checked = this.checked;

            for (var i = 0, n = rows.length; i < n; i++) {
                if (isTagsTable || visibleTerms[i]) {
                    rows[i].children[0].children[0].checked = checked;
                }
            }
        };
    }


    function getClosestRow (el) {
        while (el && el.tagName !== 'TR') {
            el = el.parentNode;
        }
        return el;
    }


    function getClosestDrop (el) {
        while (el && el.getAttribute && !el.getAttribute('ondragover')) {
            el = el.parentNode;
        }
        return el;
    }


    function getIndex (el) {
        var tr = getClosestRow(el),
            arr = Array.prototype.slice.call(tbody.children);
        return arr.indexOf(tr);
    }


    function assignDragNDrop () {
        var outline, lastTarget,
            table = container.children[0];

        tbody.addEventListener('dragstart', function (evt) {
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }

            var target = evt.target;

            if (!(target instanceof HTMLElement && target.draggable)) {
                return false;
            }

            var startRow = getClosestRow(target),
                isSyn = target.parentNode.tagName === 'LI';

            dragData = {
                index: getIndex(startRow),
                startRow: startRow,
                html: isSyn ? target.children[0].innerHTML : 0,
                isSynonym: isSyn,
                isTagsTable: isTagsTable
            };

            $tbody.find('input:checked').css('outline', '5px solid rgba(0, 0, 255, 0.22)');// todo
        });


        table.addEventListener('dragenter', function (evt) {
            var target = evt.target;

            if (!lastTarget || !lastTarget.contains(target)) {
                if (lastTarget) {
                    outline.style.background = '';
                    outline.style.outline = '';
                    lastTarget = undefined;
                }

                if (!dragData.startRow.contains(target)) {
                    if (!isTagsTable) {
                        target = table;
                    }
                    else {
                        target = getClosestDrop(target);
                    }
                    if (target !== document) {
                        lastTarget = target;
                        if (target.tagName === 'THEAD') {
                            outline = target.parentNode;
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
            var target = getClosestDrop(evt.target),
                isRow = isTagsTable && target.tagName === 'TR',
                to = {
                    index: isRow && getIndex(target),
                    isRow: isRow,
                    isTagsTable: isTagsTable
                };

            if (lastTarget) {
                outline.style.background = '';
                outline.style.outline = '';
            }

            ctrl.dragTag(dragData, to);
        });
    }


    function assignDynamicInput () {
        tbody.addEventListener('click', function (evt) {
            var target = evt.target,
                tagName = target.tagName;

            if (tagName === 'SPAN') {
                var oldName = target.innerHTML;

                target.style.padding = '0';
                target.innerHTML = '<input value="' + oldName + '">';
                var input = target.children[0];
                input.focus();
                input.onblur = function () {
                    var val = input.value;
                    if (val && oldName !== input.value) {
                        ctrl.updateTag(isTagsTable, getIndex(target), target.parentNode.tagName === 'LI', val, oldName);
                    }
                    target.style.padding = '';
                    target.innerHTML = val;
                };
                input.onkeyup = function (e) {
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        this.blur();
                    }
                };
            }

            else if (tagName === 'DEL-SYN') {
                ctrl.deleteSyn(getIndex(target), target.parentNode.children[0].innerHTML);
            }

            else if (target.className === 'del-line') {
                ctrl.deleteRow(getIndex(target), isTagsTable);
            }
        });
    }


    this.selectedIndexes = function () {
        var selected = [],
            rows = tbody.children;

        for (var i = 0, len = rows.length; i < len; i++) {
            if ((isTagsTable || visibleTerms[i]) && rows[i].children[0].children[0].checked) {
                selected.push(i);
            }
        }
        return selected;
    };


    this.filter = function (arr, word) {
        var rows = tbody.children,
            tr,
            fil;

        if (word.length) {
            for (var i = 0, n = arr.length; i < n; i++) {
                fil = arr[i][0].indexOf(word) !== -1;
                tr = rows[i];
                if (fil != visibleTerms[i]) {
                    tr.style.display = fil ? 'table-row' : 'none';
                }
                visibleTerms[i] = fil;
                if (!isFiltered) {
                    tr.children[0].children[0].checked = false;
                }
            }

            masterCheckbox.checked = false;
            isFiltered = true;
        }
        else {
            for (i = 0, n = arr.length; i < n; i++) {
                if (!visibleTerms[i]) {
                    rows[i].style.display = 'table-row';
                }
            }
            visibleTerms = Array(total).fill(true);
            isFiltered = false;
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
        $tbody.prepend(fillTableBody([tag]));

        if (!isTagsTable) {
            visibleTerms.unshift(true);
        }
    };


    this.addRows = function (arr) {
        $tbody.prepend(fillTableBody(arr));

        if (!isTagsTable) {
            visibleTerms = Array(arr.length).fill(true).concat(visibleTerms);
        }
    };


    this.addSubTerm = function (index, name, repeat) {
        var tr = tbody.children[index],
            ul = tr.children[1].children[1],
            str = '<li><span draggable=true>' + name + '</span><del-syn>×</del-syn></li>';

        if (ul) {
            $(ul).append(str);
        }
        else {
            $(tr.children[1].children[0]).after('<ul>' + str + '</ul>');
        }
        tr.children[2].innerHTML = toPerc(repeat) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.addSubTerms = function (index, arr) {
        var $ul = $(tbody.children[index].children[1].children[1]),
            str = arr.join('</span><del-syn>×</del-syn></li><li><span draggable=true>');
        
        $ul.append('<li><span draggable=true>' + str + '</span><del-syn>×</del-syn></li>');
    };


    this.deleteSyn = function (index, pos, repeat) {
        var tr = tbody.children[index],
            ul = tr.children[1].children[1];
        ul.removeChild(ul.children[pos]);
        tr.children[2].innerHTML = toPerc(repeat) + '%';
        tr.children[3].innerHTML = repeat;
    };


    this.deleteRow = function (index, text, trashId) {
        tbody.removeChild(tbody.children[index]);
        if (trashId !== undefined) {
            $undo.prepend('<div><undo trash-id=' + trashId + '>undo</undo> ' + text + '<del-undo>×</del-undo></div>');
            if (!isTagsTable) {
                visibleTerms.splice(index, 1);
            }
        }
    };
};

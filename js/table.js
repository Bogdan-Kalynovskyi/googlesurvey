var undo = byId('undo'),
    undo2 = byId('undo2'),
    ctrl,
    dragData;


undo.onclick = function (evt) {
    var target = evt.target,
        tagName = target.tagName;

    if (tagName === 'UNDO') {
        ctrl.undoRow(target.getAttribute('trash-id'));
        undo.removeChild(target.parentNode);
    }
    else if (tagName === 'DEL-UNDO') {
        undo.removeChild(target.parentNode);
    }
};

undo2.onclick = function (evt) {
    var target = evt.target,
        tagName = target.tagName;

    if (tagName === 'UNDO') {
        ctrl.addAnswer(target.getAttribute('answer-id'), target.getAttribute('tag-id'));
        undo2.removeChild(target.parentNode);
    }
    else if (tagName === 'DEL-UNDO') {
        undo2.removeChild(target.parentNode);
    }
};



function Table (container, tblType) {
    var that = this,
        tbody,
        cachedArr,
        cachedTags,
        masterCheckbox,
        visibleTerms,
        isFiltered,
        sortCol = tblType === TBL_answers ? 1 : 2;


    function toPerc (count) {
        return (count / total).toFixed(2);
    }


    this.draw = function (arr, unpackOrTags) {
        cachedArr = arr;
        if (tblType === TBL_terms) {
            visibleTerms = new Array(arr.length).fill(true);
        }

        if (tbody) {
            this.update(arr, unpackOrTags);
            return;
        }

        var tableHeading = ['Tags and synonyms', 'Unused terms', 'Answers with associated tags', 'Tags'],
            columnHeading = ['Tag', 'Term', 'Answer', 'Tag'],
            colCount = [5, 5, 2, 4],
            str = '<table class="table table-striped table-bordered table-hover"' + (tblType === TBL_terms ? ' ondragover="return false"' : '') + '>' +
                  '<thead class="thead-default"' + (tblType === TBL_tags ? ' ondragover="return false"' : '') + '><tr>' +
                  '<th colspan=' + colCount[tblType] + '><b>' + tableHeading[tblType] + '</b></th></tr><tr>';
            if (tblType === TBL_tags) {
                str += '<th colspan=5><b style="font-weight: 200">Drop on table header to add as new tag</b></th></tr><tr>';
            }
            if (tblType !== TBL_answers) {
                str += '<th><input type=checkbox></th>';
            }
            str += '<th class=asc>' + columnHeading[tblType] + '</th>' +
                   '<th colspan=' + (colCount[tblType] - 2) + '>Repeats</th></tr></thead>' +
                   '<tbody>' +
                       fillTableBody(arr, unpackOrTags) +
                   '</tbody></table>';

        container.innerHTML = str;
        tbody = container.children[0].children[1];

        setTimeout(function () {
            ctrl = ctrl || angular.element(byId('logged-in')).scope().ctrl;
            if (tblType !== TBL_answers) {
                addMasterCheckbox();
            }
            if (tblType !== TBL_short) {
                assignSort();
            }
            assignDragNDrop();
            assignDynamicInput();
        }, 0);
    };


    function fillTableBody (arr, unpackOrTags) {
        var str = '',
            i, j, m,
            line,
            syn,
            synStr;


        switch (tblType) {
            case TBL_tags:
                for (i in arr) {
                    line = arr[i];

                    if (syn = line[2]) {
                        // simultaneously (and implicitly!) unpack on first pass
                        if (unpackOrTags) {
                            syn = syn.split(',');
                            line[2] = syn;
                            line[3] = line[3].split(',');
                        }

                        synStr = '<ul>';
                        for (j in syn) {
                            synStr += '<li><span draggable=true>' + syn[j] + '</span><del-syn>×</del-syn><dupl-syn>clone</dupl-syn></li>';
                        }
                        synStr += '</ul>';
                    }
                    else {
                        synStr = '';
                    }

                    str +=
                        '<tr draggable=true ondragover="return false"><td><input type=checkbox></td>' +
                        '<td><span>' + line[0] + '</span>' + synStr + '</td>' +
                        '<td>' + toPerc(line[1]) + '%</td><td>' + line[1] + '</td><td class=del-line>×</td></tr>';
                }
                break;

            case TBL_terms:
                for (i in arr) {
                    line = arr[i];

                    str +=
                        '<tr draggable=true><td><input type=checkbox></td>' +
                        '<td><span>' + line[0] + '</span></td>' +
                        '<td>' + toPerc(line[1]) + '%</td><td>' + line[1] + '</td><td class=del-line>×</td></tr>';
                }
                break;

            case TBL_answers:
                cachedTags = unpackOrTags;
                for (i in arr) {
                    line = arr[i];

                    if (syn = line[2]) {
                        // simultaneously (and implicitly!) unpack on first pass
                        syn = syn.split(',');

                        synStr = '<ul>';
                        for (j = 0, m = syn.length - 1; j < m; j++) {
                            var tag = unpackOrTags[syn[j]];
                            if (!tag) {
                                line[2].replace(j + ',', '');
                                continue;
                            }
                            synStr += '<li><text>' + tag[0] + '</text><del-tag>×</del-tag></li>';
                        }
                        synStr += '</ul>';
                    }
                    else {
                        synStr = '';
                    }
                    str +=
                        '<tr ondragover="return false">' +
                        '<td><text>' + line[0] + '</text>' + synStr + '</td><td>' + line[1] + '</td></tr>';
                }
                break;

            case TBL_short:
                for (i in arr) {
                    line = arr[i];

                    if (syn = line[2]) {
                        synStr = '<ul>';
                        for (j in syn) {
                            synStr += '<li>' + syn[j] + '</li>';
                        }
                        synStr += '</ul>';
                    }
                    else {
                        synStr = '';
                    }

                    str +=
                        '<tr draggable=true><td><input type=checkbox></td>' +
                        '<td>' + line[0] + synStr + '</td>' +
                        '<td>' + toPerc(line[1]) + '%</td><td>' + line[1] + '</td></tr>';
                }
                break;
        }

        return str;
    }


    function assignSort () {
        var ths = container.querySelectorAll('tr:last-child > th');
        for (var i = 0, n = ths.length; i < n; i++) {
            if (i > 0 || tblType === TBL_answers) {

                ths[i].onclick = function (i) {
                    if (i === Math.abs(sortCol)) {
                        sortCol = -sortCol;
                    }
                    else {
                        ths[Math.abs(sortCol) - 1].className = '';
                        sortCol = i;
                    }
                    ths[i - 1].className = sortCol > 0 ? 'asc' : 'desc';

                    var alpha = tblType === TBL_answers ? i === 1 : i === 2,
                        order = sortCol > 0 ? 1 : -1;
                    sortArr(cachedArr, alpha, order);
                    that.update(cachedArr, cachedTags);
                }.bind(null, i + 1); // because 0 === -0

            }
        }
    }


    this.sort1 = function () {
        var ths = container.querySelectorAll('tr:last-child > th');
        for (var i = 0, n = ths.length; i < n; i++) {
            ths[i].className = '';
        }
        sortCol = 2;
        ths[1].className = 'asc';
        sortArr(cachedArr, true, 1);
        this.update(cachedArr);
    };


    function addMasterCheckbox () {
        masterCheckbox = container.querySelector('thead input');
        masterCheckbox.onchange = function () {
            var rows = tbody.children,
                checked = this.checked,
                i, n;

            if (isFiltered && tblType === TBL_terms) {
                for (i in visibleTerms) {
                    if (visibleTerms[i]) {
                        rows[i].children[0].children[0].checked = checked;
                    }
                }
            }
            else {
                for (i = 0, n = rows.length; i < n; i++) {
                    rows[i].children[0].children[0].checked = checked;
                }
            }
        };
    }


    this.invertChecked = function () {
        var rows = tbody.children,
            i, n;

        if (isFiltered && tblType === TBL_terms) {
            for (i in visibleTerms) {
                if (visibleTerms[i]) {
                    var el = rows[i].children[0].children[0];
                    el.checked = !el.checked;
                }
            }
        }
        else {
            for (i = 0, n = rows.length; i < n; i++) {
                el = rows[i].children[0].children[0];
                el.checked = !el.checked;
            }
        }
    };


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


    function getSynIndex (el) {
        var ul = el.parentNode,
            arr = Array.prototype.slice.call(ul.children);
        return arr.indexOf(el);
    }


    function assignDragNDrop () {
        var outline, lastTarget,
            table = container.children[0];


        function paintCheckboxes (unpaint) {
            var rows = tbody.children,
                arr = that.selectedIndexes();
            for (var i in arr) {
                rows[arr[i]].children[0].children[0].style.outline = unpaint ? '' : '5px solid rgba(0, 0, 255, 0.2)';
            }
        }


        tbody.addEventListener('dragstart', function (evt) {
            //todo: this looks to be unneeded already?
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
                li = target.parentNode,
                isSyn = li.tagName === 'LI';

            dragData = {
                index: getIndex(startRow),
                startRow: startRow,
                synPos: isSyn ? getSynIndex(li) : 0,
                isSynonym: isSyn,
                tblType: tblType
            };

            if (tblType !== TBL_short) {
                masterCheckbox.checked = false;
            }
            paintCheckboxes();
        });


        table.addEventListener('dragenter', function (evt) {
            var target = evt.target;

            if (!lastTarget || !lastTarget.contains(target)) {
                if (lastTarget) {
                    outline.style.background = '';
                    outline.style.outline = '';
                    lastTarget = undefined;
                }

                if (!dragData.startRow.contains(target) && (tblType !== TBL_terms || dragData.tblType !== TBL_terms)) {
                    if (tblType === TBL_terms) {
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
                        outline.style.background = 'rgba(0, 0, 255, 0.1)'; // todo dont do this mult times
                        outline.style.outline = '2px solid blue';
                    }
                }
            }
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
                isRow = (tblType === TBL_tags || tblType === TBL_answers) && target.tagName === 'TR',
                to = {
                    index: isRow && getIndex(target),
                    isRow: isRow,
                    tblType: tblType
                };

            if (lastTarget) {
                outline.style.background = '';
                outline.style.outline = '';
            }

            if (tblType === TBL_answers) {
                paintCheckboxes(true);
            }

            ctrl.dragTag(dragData, to);
        });
    }


    function assignDynamicInput () {
        tbody.addEventListener('click', function (evt) {
            var target = evt.target,
                tagName = target.tagName,
                li = target.parentNode;

            if (tagName === 'SPAN') {
                var oldName = target.innerHTML;

                target.style.padding = '0';
                target.innerHTML = '<input value="' + oldName + '">';
                var input = target.children[0];
                input.focus();
                input.onblur = function () {
                    var val = input.value,
                        pos;
                    if (val && oldName !== input.value) {
                        if (li.tagName === 'LI') {
                            pos = getSynIndex(li);
                        }
                        ctrl.updateTag(tblType === TBL_tags || tblType === TBL_short, getIndex(target), pos, val);
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
                ctrl.deleteSyn(getIndex(target), getSynIndex(li));
            }

            else if (tagName === 'DUPL-SYN') {
                ctrl.cloneSyn(getIndex(target), getSynIndex(li));
            }

            else if (tagName === 'DEL-TAG') {
                ctrl.deleteAnswer(getIndex(target), getSynIndex(li));
            }

            else if (target.className === 'del-line') {
                ctrl.deleteRow(getIndex(target), tblType === TBL_tags);
            }
        });
    }


    this.selectedIndexes = function () {
        var selected = [],
            rows = tbody.children,
            i, n;

        if (isFiltered && tblType === TBL_terms) {
            for (i in visibleTerms) {
                if (visibleTerms[i] && rows[i].children[0].children[0].checked) {
                    selected.push(i);
                }
            }
        }
        else {
            for (i = 0, n = rows.length; i < n; i++) {
                if (rows[i].children[0].children[0].checked) {
                    selected.push(i);
                }
            }
        }
        return selected;
    };


    this.filter = function (arr, word) {
        var rows = tbody.children,
            tr,
            fil;

        if (word.length) {
            for (var i in arr) {
                fil = arr[i][0].indexOf(word) !== -1;
                tr = rows[i];
                if (fil != visibleTerms[i]) {
                    tr.style.display = fil ? '' : 'none';
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
            for (i in arr) {
                if (!visibleTerms[i]) {
                    rows[i].style.display = '';
                }
            }
            visibleTerms = new Array(arr.length).fill(true);
            isFiltered = false;
        }
    };

    
    this.updatePerc = function (arr) {
        var rows = tbody.children,
            i, n;

        if (isFiltered && tblType === TBL_terms) {
            for (i in visibleTerms) {
                if (visibleTerms[i]) {
                    rows[i].children[2].innerHTML = toPerc(arr[i][1]) + '%'
                }
            }
        }
        else {
            for (i = 0, n = rows.length; i < n; i++) {
                rows[i].children[2].innerHTML = toPerc(arr[i][1]) + '%'
            }
        }
    };


    this.updateCount = function (index, count) {
        tbody.children[index].children[3].innerHTML = count;
    };
    
    
    this.clear = function () {
        if (tbody) {
            tbody.innerHTML = '';
        }
    };
    

    this.update = function (arr, unpackOrTags) {
        tbody.innerHTML = '';
        this.addRows(arr, unpackOrTags);
    };
    

    this.addRow = function (tag) {
        tbody.insertAdjacentHTML('afterbegin', fillTableBody([tag]));

        if (tblType === TBL_terms) {
            visibleTerms.unshift(true);
        }
    };


    this.addRows = function (arr, unpackOrTags) {
        tbody.insertAdjacentHTML('afterbegin', fillTableBody(arr, unpackOrTags));

        if (tblType === TBL_terms) {
            visibleTerms = new Array(arr.length).fill(true).concat(visibleTerms);
        }
    };


    this.addSyn = function (index, name, count, pos) {
        var tr = tbody.children[index],
            td = tr.children[tblType === TBL_tags ? 1 : 0],
            ul = td.children[1],
            str;

        if (tblType === TBL_tags) {
            str = '<li><span draggable=true>' + name + '</span><del-syn>×</del-syn><dupl-syn>clone</dupl-syn></li>';
        }
        else {
            str = '<li><text>' + name + '</text><del-tag>×</del-tag></li>';
        }

        if (ul) {
            if (pos) {
                ul.children[pos].insertAdjacentHTML('afterend', str);
            }
            else {
                ul.insertAdjacentHTML('afterbegin', str);
            }
        }
        else {
            td.insertAdjacentHTML('beforeend', '<ul>' + str + '</ul>');
        }
        if (tblType !== TBL_answers) {
            tr.children[2].innerHTML = toPerc(count) + '%';
            tr.children[3].innerHTML = count;
        }
    };


    this.addSyns = function (index, arr) {
        var td = tbody.children[index].children[tblType === TBL_tags ? 1 : 0],
            ul = td.children[1],
            str = '';

        for (var i in arr) {
            if (tblType === TBL_tags) {
                str += '<li><span draggable=true>' + arr[i] + '</span><del-syn>×</del-syn><dupl-syn>clone</dupl-syn></li>';
            }
            else {
                str += '<li><text>' + arr[i] + '</text><del-tag>×</del-tag></li>';
            }
        }

        ul.insertAdjacentHTML('afterbegin', str);
    };


    function addTrash (trashId) {
        if (trashId !== undefined) {
            setTimeout(function () {
                // don't remove this timeout, this is to fix trash initialisation order (one function returns line after executon)
                var restore = trash[trashId],
                    type = restore[1],
                    typeStr;

                if (type === true) {
                    typeStr = 'tag';
                }
                else if (type === false) {
                    typeStr = 'term';
                }
                else {
                    typeStr = 'subterm';
                }

                undo.insertAdjacentHTML('afterbegin', '<div><undo trash-id=' + trashId + '>undo</undo> <i>' + typeStr + '</i>&nbsp; ' + restore[0][0] + '<del-undo>×</del-undo></div>');
            }, 0);
        }
    }


    this.deleteSyn = function (index, pos, count, trashId) {
        var tr = tbody.children[index],
            td = tr.children[tblType === TBL_tags ? 1 : 0],
            ul = td.children[1];
        ul.removeChild(ul.children[pos]);
        if (tblType !== TBL_answers) {
            tr.children[2].innerHTML = toPerc(count) + '%';
            tr.children[3].innerHTML = count;
            addTrash(trashId);
        }
    };


    this.deleteRow = function (index, trashId) {
        tbody.removeChild(tbody.children[index]);
        if (tblType === TBL_terms) {
            visibleTerms.splice(index, 1);
        }
        addTrash(trashId);
    };
}

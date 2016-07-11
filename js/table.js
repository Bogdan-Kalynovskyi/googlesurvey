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
                                '<th>' + (isTags ? 'Tag' : 'Term') + '</th>' +
                                '<th>Repeat</th>' +
                                '</tr><tr><th colspan=3>' +
                                (isTags ? 'Drop on header to create a tag, drop on tag to create synonym' : 'Drop here to remove tag or synonym from use') +
                                '</th></tr></thead>' +
                                '<tbody>' +
                                    fillTableBody(tagsArr) +
                                '</tbody></table>';

        tbody = container.getElementsByTagName('tbody')[0];

        assignDragNDrop();
        assignDynamicInput();
        
        isPacked = false;
    };


    function fillTableBody (tagsArr) {
        var str = '';

        for (var i = 0, n = tagsArr.length; i < n; i++) {
            var line = tagsArr[i],
                terms,
                subTerms;

            if (isTags && (terms = line[2])) {
                if (isPacked) {
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
                '<td><span draggable=true>' + line[0] + '</span>' + subTerms + '</td>' +
                '<td>' + line[1] + '</td></tr>';
        }

        return str;
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
            dt.setData("target", target.tagName);
            if (target.tagName === 'LI') {
                dt.setData("html", target.innerHTML);
            }
            dt.setData("table", container.id);

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

                if ((!startElem || !startElem.contains(target)) && (isTags || !startElem)) {
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
        tr.children[1].innerHTML = repeat;
    };


    this.deleteSubTerm = function (index, pos, repeat) {
        var tr = tbody.children[index],
            ul = tr.children[0].children[1];
        ul.removeChild(ul.children[pos]);
        tr.children[1].innerHTML = repeat;
    };


    this.deleteRow = function (index) {
        tbody.removeChild(tbody.children[index]);
    };
}

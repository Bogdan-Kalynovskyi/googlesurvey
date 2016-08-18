(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close>&times;</button><br>',
        modalEnd = '</div></div></div></div>';


    function open (modal) {
        modal.show().addClass('in');
        //todo 13 27
        modal.add('.modal button').on('click', function () {
            modal.removeClass('in');
            setTimeout(function () {
                modal.remove();
            }, 300);
        });
        modal.find('.modal-dialog').on('click', function (evt) {
            evt.stopPropagation();
            return false;
        });
    }


    window.bootstrapAlert = function (message) {
        $('#modal-placeholder').append(modalStart +
            message + '<br><button class="btn btn-sm btn-primary m-t-1 p-x-3" style="margin: 0 auto;display: block;">Ok</button>' +
            modalEnd);
        var modal = $('.modal');
        open(modal);
        modal.find('.btn-primary').focus();
    };


    window.bootstrapConfirm = function (message, btnOne, btnTwo, callback) {
        $('#modal-placeholder').append(modalStart +
            message +
                 '<br><button class="btn btn-sm btn-primary pull-xs-right m-l-3 m-y-1 p-x-2" style="margin-right: 137px!important;">' +
            btnOne +
            '</button><button class="btn btn-sm btn-secondary pull-xs-right m-y-1 p-x-2">' +
            btnTwo +
            '</button><br class="clearfix"><br><br>' +
            modalEnd);

        var modal = $('.modal');
        open(modal);
        modal.find('.btn-primary').on('click', function () {
            callback(1);
        }).focus();
        modal.find('.btn-secondary').on('click', function () {
            callback(2);
        });
    };
})();






function alreadyLoggedIn () {
    var loggedIn = byId('logged-in'),
        loggedOut = byId('logged-out');
    angular.bootstrap(loggedIn, ['app']);
    if (loggedOut) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
    }
}


function loadBarChart() {
    google.charts.load('current', {'packages': ['bar']});
    //todo register calls
}


// total reload timeout 60s



if (window.xsrfToken) {
    alreadyLoggedIn();
}

if (window.gapi) {
    onPlatformLoad();
}

$(document.body).append('<script src="//www.gstatic.com/charts/loader.js" onload="loadBarChart()"></script>');
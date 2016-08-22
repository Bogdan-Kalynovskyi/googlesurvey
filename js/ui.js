(function () {
    var modalStart = '<div class="modal fade"><div class=modal-dialog><div class=modal-content><div class=modal-body><button class=close>&times;</button><br>',
        modalEnd = '</div></div></div></div>',
        modalPlaceholder = byId('modal-placeholder');


    function open (modal) {
        function close () {
            modal.classList.remove('in');
            setTimeout(function () {
                modal.parentNode.removeChild(modal);
            }, 300);
        }

        modal.style.display = 'block';
        modal.offsetWidth; //
        modal.getBoundingClientRect(); //

        modal.classList.add('in');

        modal.addEventListener('click', close);
        var btn = modal.getElementsByTagName('button');
        for (var i = 0; i < btn.length; i++) {
            btn[i].addEventListener('click', close);
        }
        modal.onkeyup = function (e) {
            if (e.keyCode == 27) {
                close();
            }
        };

        modal.querySelector('.modal-dialog').addEventListener('click', function (evt) {
            evt.stopPropagation();
        });
    }


    window.bootstrapAlert = function (message) {
        modalPlaceholder.insertAdjacentHTML('beforeend', modalStart +
            message + '<br><button class="btn btn-sm btn-primary m-t-1 p-x-3" style="margin: 0 auto;display: block;">Ok</button>' +
            modalEnd);
        var modal = byQs('.modal');
        open(modal);
        modal.querySelector('.btn-primary').focus();
    };


    window.bootstrapConfirm = function (message, btnOne, btnTwo, callback) {
        modalPlaceholder.insertAdjacentHTML('beforeend', modalStart +
            message +
                 '<br><button class="btn btn-sm btn-primary pull-xs-right m-r-3 m-t-1 p-x-2">' +
            btnOne +
            '</button><button class="btn btn-sm btn-secondary m-l-3 m-t-1 p-x-2" style="margin-bottom:.5rem">' +
            btnTwo +
            '</button>' + modalEnd);

        var modal = byQs('.modal');
        open(modal);
        var b1 = modal.querySelector('.btn-primary'),
            b2 = modal.querySelector('.btn-secondary');

        b1.onclick = callback.bind(b1, true);
        b2.onclick = callback.bind(b2, false);
        b1.focus();
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


// total reload timeout 60s



if (window.xsrfToken) {
    alreadyLoggedIn();
}

if (window.gapi) {
    onPlatformLoad();
}


var _script = document.createElement('script');
_script.onload = function () {
    google.charts.load('current', {'packages': ['bar']});
};
_script.src = '//www.gstatic.com/charts/loader.js';
document.body.appendChild(_script);
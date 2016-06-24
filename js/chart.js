function Chart (container) {
    var chart;


    function draw (tagsGoo) {
        try {
            container.style.height = 26.05 * tagsGoo.getNumberOfRows() + 'px';
            if (!chart) {
                chart = new google.charts.Bar(container);
            }
            chart.draw(tagsGoo, {
                chart: {},
                bars: 'horizontal' // Required for Material Bar Charts.
            });
        }
        catch (e) {
            setTimeout(function () {
                draw(tagsGoo);
            }, 1500);
        }
    }


    this.create = this.update = function (tagsGoo) {
        draw(tagsGoo);
    };
}


(function () {
    var wait = false;
    function resize () {
        if (!wait) {
            wait = true;

            setTimeout(function () {
                var container = document.querySelector('[ui-view]'),
                    stretchDiv = document.querySelector('.stretch-vertically'),
                    height = 0;

                for (var i = 0; i < container.children.length - 1; i++) {
                    height += container.children[i].offsetHeight;
                }
                stretchDiv.style.height = (window.innerHeight - height) + 'px';
                wait = false;
            }, 500);
        }
    }
    window.addEventListener('resize', resize);
    window.addEventListener('click', resize);
})();


bootstrapAlert = function (message) {
    $('#modal-placeholder').html('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"><button type="button" class="close" data-dismiss="modal">&times;</button><br>' + message + '<br><br><button class="btn btn-sm center-block" data-dismiss="modal">&nbsp; Ok &nbsp;</button></div></div></div></div>');
    $('.modal').modal('show');
};
function Chart (container) {
    var chart;


    function draw (tagsGoo) {
        try {
            container.style.height = 26 * tagsGoo.getNumberOfRows() + 'px';
            if (!chart) {
                chart = new google.charts.Bar(container);
            }
            chart.draw(tagsGoo, {
                chart: {
                    title: 'Answers',
                    hAxis: {
                        title: 'Count',
                        minValue: 0
                    },
                    vAxis: {
                        title: 'Tags'
                    }
                },
                bars: 'horizontal' // Required for Material Bar Charts.
            });
        }
        catch (e) {
            setTimeout(function () {
                draw(tagsGoo);
            }, 500);
        }
    }


    this.create = this.update = function (tagsGoo) {
        draw(tagsGoo);
    };
}




bootstrapAlert = function (message) {
    $('#modal-placeholder').html('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"><button type="button" class="close" data-dismiss="modal">&times;</button><br>' + message + '<br><br><button class="btn btn-sm center-block" data-dismiss="modal">&nbsp; Ok &nbsp;</button></div></div></div></div>');
    $('.modal').modal('show');
};
<!DOCTYPE html>
<html ng-app="app">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title></title>
    <base href="/">
    <meta name="google-signin-client_id" content="211499477101-d78crq8gs6sojr7grdlm9ebmoltiel71.apps.googleusercontent.com">
</head>

<body ng-controller="dashboard as ctrl">
    <h3 id="_loading" style="position: absolute; top: 50%; text-align: center; width: 100%">Loading...</h3>

    <link rel=stylesheet href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
    <link rel=stylesheet href="css/app.css">
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>
    <script src="lib/xls.min.js"></script>
    <script src="//www.gstatic.com/charts/loader.js"></script>
    <script>
        xsrfToken = '<?php echo $_SESSION['xsrfToken'] ?>';
    </script>
    <script src="js/ui.js"></script>
    <script src="js/config.js"></script>
    <script src="js/table.js"></script>
    <script src="js/chart.js"></script>
    <script src="js/model.js"></script>
    <script src="js/surveys.js"></script>
    <script src="js/dashboard.js"></script>
    <script>
        $('#_loading').remove();
    </script>

    <header>
        <button class="btn btn-sm btn-primary" data-active="surveys" ng-click="ctrl.navigate('surveys')">
            <span class="bullet">1</span> Upload or select survey
        </button> <big>&raquo;</big>
        <button class="btn btn-sm btn-primary" data-active="tags" ng-click="ctrl.navigate('tags')">
            <span class="bullet">2</span> Manage tags and terms
        </button> <big>&raquo;</big>
        <button class="btn btn-sm btn-primary" data-active="chart" ng-click="ctrl.navigate('chart')">
            <span class="bullet">3</span> View chart
        </button>
        <a href class="logout" onclick="logOut();return false;">Log out</a>
        <script>
            function logOut () {
                var form = $('<form action=/ method=post><input type=hidden name=logout value=' + xsrfToken + '></form>');
                $(document.body).append(form);
                form.submit();
            }
        </script>
    </header>


    <div id="surveys" class="nav-body">
        <h6>Surveys</h6>
        <table class="table table-striped table-bordered table-hover">
            <thead class="thead-default" ng-show="ctrl.surveys.length !== 0"><tr>
                <th></th><th></th><th>Google ID</th><th>Question</th>
            </tr></thead>
            <tr ng-repeat="(id, survey) in ctrl.surveys">
                <td><a ng-click="ctrl.loadSurveyById(id)">load</a></td>
                <td><a ng-click="ctrl.deleteSurveyById(id)">delete</a></td>
                <td ng-bind="survey.survey_google_id"></td>
                <td ng-bind="survey.question"></td>
            </tr>
        </table>
        <br>
        <hr>
        <br>
        Or upload new survey from Excel file
        <input type="file" custom-on-change="ctrl.uploadFile" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
    </div>


    <div id="tags" class="nav-body">
        <div class="row">
            <div class="col-xs-2">
                <button class="btn btn-sm btn-primary" ng-click="ctrl.sort()">Sort tables</button>
            </div>
            <div class="col-xs-7">
                <input ng-model="ctrl.bulkAdd" placeholder="Comma separated tags list" style="width: calc(100% - 90px); line-height: 26px">
                <button class="btn btn-sm btn-secondary" ng-click="ctrl.addTags(ctrl.bulkAdd)">Bulk add</button>
            </div>
            <div class="col-xs-3"><button class="btn btn-sm btn-danger pull-xs-right" ng-click="ctrl.save()">Save & view chart</button></div>
        </div>
        <div class="row m-t-1">
            <div class="col-xs-3"><small>Click tag to edit it</small></div>
            <label class="col-xs-4"><small>Maximum amount of tags:</small> <input ng-model="ctrl.maxTags" type="number"></label>
            <label class="col-xs-4"><small>Minimum repeat for a tag:</small> <input ng-model="ctrl.minRepeat" type="number"></label>
            <div class="col-xs-1"> <button class="btn btn-sm btn-primary pull-xs-right" ng-click="ctrl.filterTags()">Filter tags</button></div>
        </div>
        <div class="row m-t-1">
            <div class="col-sm-6">
                <h6>Used tags and synonyms</h6>
            </div>
            <div class="col-sm-6">
                <h6>Unused stuff</h6>
            </div>
        </div>
        <div class="row tbl-row">
            <div class="col-sm-6 overflow" id="tags-table"></div>
            <div class="col-sm-6 overflow" id="terms-table"></div>
        </div>
    </div>


    <div id="chart" class="nav-body">
        <div id="tags-chart"></div>
        <button class="btn btn-sm btn-primary block-center m-t-2 m-l-2 m-b-1" ng-click="ctrl.navigate('tags')">Go to back to tags table</button>
    </div>



    <div id="modal-placeholder"></div>
</body>
</html>
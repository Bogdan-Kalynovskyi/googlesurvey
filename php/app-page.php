<!DOCTYPE html>
<html ng-app="app">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Google surveys</title>
    <meta name="google-signin-client_id" content="211499477101-d78crq8gs6sojr7grdlm9ebmoltiel71.apps.googleusercontent.com">
</head>

<body ng-controller="dashboard as ctrl">
    <h3 id="_loading" style="position:absolute; top:45%; text-align:center; width:100%">Loading...</h3>

    <link rel=stylesheet href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
    <link rel=stylesheet href="css/app.css">
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>
    <script src="lib/xls.min.js"></script>
    <script src="//gstatic.com/charts/loader.js"></script>
    <script src="//apis.google.com/js/auth2:signin2.js?onload=googleAPILoaded"></script>
    <script>
        xsrfToken = '<?php echo $_SESSION['xsrfToken'] ?>';
        $('#_loading').remove()
    </script>
    <script src="js/app.js"></script>
    <script src="js/chart.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/table.js"></script>
    <script src="js/simple-table.js"></script>
    <script src="js/model.js"></script>
    <script src="js/surveys.js"></script>
    <script src="js/ui.js"></script>

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
    </header>


    <div id="surveys" class="nav-body">
        <table ng-show="!angular.equals({}, ctrl.surveys)" class="table table-striped table-bordered table-hover">
            <thead class="thead-default"><tr>
                <th colspan=3>Survey</th><th>Google ID</th><th>Question</th><th>Answers</th>
            </tr></thead>
            <tr ng-repeat="(id, survey) in ctrl.surveys">
                <td><a ng-click="ctrl.loadSurvey(id)">&nbsp;edit&nbsp;</a></td>
                <td><a ng-click="ctrl.duplicateSurvey(id)">duplicate & edit</a></td>
                <td><a ng-click="ctrl.deleteSurveyById(id)">delete</a></td>
                <td ng-bind="survey.survey_google_id"></td>
                <td ng-bind="survey.question"></td>
                <td ng-bind="survey.total"></td>
            </tr>
        </table>
        <b ng-show="angular.equals({}, ctrl.surveys)">No surveys yet. Please upload a spreadsheet below</b>
        <br>
        <hr>
        <br>
        Upload new survey as spreadsheet
        <input type="file" custom-on-change="ctrl.uploadFile" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
    </div>


    <div id="tags" class="nav-body">
        <div id="tags-question"></div>
        <div class="row">
            <div class="col-xs-9 col-sm-8 col-md-7 col-lg-5">
                <input ng-model="ctrl.bulkAdd" placeholder="Comma separated tags list" style="width: calc(100% - 90px)">
                <button class="btn btn-sm btn-secondary" ng-click="ctrl.addTags(ctrl.bulkAdd)">Bulk add</button>
            </div>
            <div class="col-xs-3">
                <button class="btn btn-sm btn-primary" ng-click="ctrl.sort()">Sort tables</button>
            </div>
        </div>
        <div class="row m-t-1">
            <!--<div class="col-xs-2"><small style="line-height:33px;">Click on tag name to edit</small></div>-->
            <label class="col-xs-6 col-sm-5 col-md-4"><small>Maximum number of tags:</small>
                <input ng-model="ctrl.maxTags" ng-change="ctrl.filterMax()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-5 col-md-4"><small>Minimum repeat for tag:</small>
                <input ng-model="ctrl.minRepeat" ng-change="ctrl.filterMin()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
        </div>
        <div class="row" id="scroll-tbl">
            <div class="col-sm-6 overflow" id="tags-table"></div>
            <div class="col-sm-6 overflow" id="terms-table"></div>
        </div>
    </div>


    <div id="chart" class="nav-body">
        <div id="tags-chart"></div>
        <br>
        <div id="chart-table"></div>
        <div id="comment-chart"></div>
        <button class="btn btn-sm btn-primary block-center m-t-2 m-l-2 m-b-1 p-x" ng-click="ctrl.navigate('tags')">Back to tables</button>
    </div>


    <div id="modal-placeholder"></div>
</body>
</html>
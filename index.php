<!DOCTYPE html>
<html>
<?php
    include 'api/settings.php';
    session_start();
    $token = isset($_SESSION['xsrfToken']) && $_SESSION['xsrfToken'];
?>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Google Surveys</title>
    <meta name="google-signin-client_id" content="<?php echo $google_api_id ?>">
    <script src="//apis.google.com/js/platform.js" async defer onload="onPlatformLoad()"></script>
    <link rel="stylesheet" href="css/login.css">
    <style>
        <?php echo ($token ? '#logged-out' : '#logged-in') ?> {
            display: none;
        }
    </style>
</head>

<body>
<div id="logged-out">
    <div id="login-form">
        <div class="col-half">Logo placeholder</div>
        <div class="col-half">
            <h5>Sign in using your Google account</h5><br>
            <div class="g-signin2" data-onsuccess="onLogIn"></div>
        </div>
    </div>

    <script>
        function logIn (g) {
            $.post('api/login.php', {
                authToken: g.getAuthResponse().id_token
            }, function (r) {
                window.xsrfToken = r;
                if (app) {
                    alreadyLoggedIn();
                }
            });
        }

        function onLogIn (g) {
            if ($) {
                logIn(g);
            }
            else {
                window.googleUser = g;
            }
        }
        
        function onPlatformLoad() {
            <?php if ($token) { ?>
                gapi.load('auth2');
            <?php } ?>
        }

        <?php if ($token) { ?>
            window.xsrfToken = '<?php echo $_SESSION['xsrfToken'] ?>';
        <?php } else { ?>
            // check for 3d party cookies are enabled
            window.addEventListener("message", function (evt) {
                if (evt.data === 'MM:3PCunsupported') {
                    document.getElementById('test3dPartyCookies').style.display = 'block';
                }
            });
        <?php } ?>
    </script>
    <?php if ($token) { ?>
        <div id="test3dPartyCookies"><strong>Third party cookies are disabled in your browser.</strong><br>
            You cannot sign in using Google unless you enable them.<br>
            <a target=_blank href="https://www.google.com/search?q=how+do+I+enable+3rd+party+cookies+in+my+browser"><big>Search Google how to fix this in your browser</big></a>
        </div>
        <iframe src="//mindmup.github.io/3rdpartycookiecheck/start.html" style="display:none"></iframe>
    <?php } ?>
</div>

<div id="logged-in" ng-controller="dashboard as ctrl">
    <div id="loading"><h5>Loading...</h5></div>

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
        <a href class="logout" ng-click="ctrl.logOut()">Log out</a>
    </header>


    <div id="surveys" class="nav-body">
        <table ng-show="!angular.equals({}, ctrl.surveys)" class="table table-striped table-bordered table-hover">
            <thead class="thead-default"><tr>
                <th colspan=3>&nbsp; Survey</th><th>Google ID</th><th>Question</th><th>Answers</th>
            </tr></thead>
            <tr ng-repeat="(id, survey) in ctrl.surveys">
                <td><a ng-click="ctrl.loadSurvey(id)" class="p-x-1">edit</a></td>
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
        Upload new survey spreadsheet
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
            <label class="col-xs-6 col-sm-5 col-md-4"><small>Maximum number of tags:</small>
                <input ng-model="ctrl.maxTags" ng-change="ctrl.filterMax()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-5 col-md-4"><small>Minimum repeat for tag:</small>
                <input ng-model="ctrl.minRepeat" ng-change="ctrl.filterMin()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-5 col-md-4"><small>Filter:</small>
                <input ng-model="ctrl.filterTerm" ng-change="ctrl.filterTerms()" ng-model-options='{ debounce: 110 }' placeholder="Tags except" style="width: calc(100% - 100px)">
            </label>
        </div>
        <div class="row" id="scroll-tbl">
            <div class="col-sm-6 overflow" id="tags-table"></div>
            <div class="col-sm-6 overflow" id="terms-table"></div>
        </div>
    </div>


    <div id="chart" class="nav-body"> <!-- todo scrollable -->
        <div id="tags-chart"></div>
        <br>
        <div id="chart-table"></div>
        <div id="comment-chart"></div>
        <button class="btn btn-sm btn-primary block-center m-t-2 m-l-2 m-b-1 p-x" ng-click="ctrl.downloadCsv()">Download results as CSV</button>
    </div>

    <div id="modal-placeholder"></div>

    <link rel=stylesheet href="node_modules/bootstrap/dist/css/bootstrap.css">
    <link rel=stylesheet href="css/app.css">
    <script src="node_modules/jquery/dist/jquery.js"></script>
    <script src="node_modules/angular/angular.js"></script>
    <script src="lib/xls.min.js"></script>
    <script src="//gstatic.com/charts/loader.js"></script>
    <script src="js/app.js"></script>
    <script src="js/chart.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/table.js"></script>
    <script src="js/simple-table.js"></script>
    <script src="js/model.js"></script>
    <script src="js/surveys.js"></script>
    <script src="js/ui.js"></script>
</div>
</body>
</html>
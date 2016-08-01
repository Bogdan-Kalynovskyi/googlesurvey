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
                gapi.load('auth2', function () {
                    gapi.auth2.init({
                        client_id: '<?php echo $google_api_id ?>'
                    });
                });
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

    <?php if (!$token) { ?>
    <style>
    /* two selectors below should be exact Bootstrap equivalent */
    body {
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
        font-size: 1rem;
        line-height: 1.5;
        color: #373a3c;
    }
    h5 {
        font-size: 1.25rem;
        margin-bottom: .5rem;
        font-weight: 500;
        line-height: 1.1;
        margin-top: 0;
    }
    #login-form {
        position: absolute;
        width: 440px;
        left: 50%;
        top: 50%;
        margin-left: -220px;
        margin-top: -110px;
    }
    .col-half {
        float: left;
        width: 220px;
    }
    #test3dPartyCookies {
        position: absolute;
        max-width: 500px;
        left: 50%;
        margin-left: -250px;
        top: 30px;
        z-index: 1000;
        box-shadow: 0 0 28px darkred;
        border-radius: 2px;
        border: 1px dotted darkred;
        padding: 16px;
        display: none;
        color: darkred;
    }
    a[target="_blank"] {
        display: block;
        padding-top: 9px;
    }
    a[target="_blank"]:after {
        content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=");
        margin: 0 0 0 7px;
    }
    #loading {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, .9);
    }
    #loading > h5 {
        position: absolute;
        top: calc(50% - 15px);
        text-align: center;
        width: 100%;
    }
    #logged-in {
        display: none;
    }
    </style>
    <?php } ?>
</head>

<body>
<?php if (!$token) { ?>
    <div id="logged-out">
        <div id="login-form">
            <div class="col-half">Logo placeholder</div>
            <div class="col-half">
                <h5>Sign in using your Google account</h5><br>
                <div class="g-signin2" data-onsuccess="onLogIn"></div>
            </div>
        </div>
        <div id="test3dPartyCookies"><strong>Third party cookies are disabled in your browser.</strong><br>
            You cannot sign in using Google unless you enable them.<br>
            <a target=_blank href="https://www.google.com/search?q=how+do+I+enable+3rd+party+cookies+in+my+browser"><big>Search Google how to fix this in your browser</big></a>
        </div>
        <iframe src="//mindmup.github.io/3rdpartycookiecheck/start.html" style="display:none"></iframe>
    </div>
<?php } ?>

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
        <table ng-show="!angular.equals({}, ctrl.surveys)" class="table table-striped table-bordered table-hover m-t-1">
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
            <label class="col-xs-6 col-sm-4"><small>Maximum number of tags:</small>
                <input ng-model="ctrl.maxTags" ng-change="ctrl.filterMax()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-4"><small>Minimum repeat for tag:</small>
                <input ng-model="ctrl.minRepeat" ng-change="ctrl.filterMin()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-4"><small>Filter:</small>
                <input ng-model="ctrl.filterTerm" ng-change="ctrl.filterTerms()" ng-model-options='{ debounce: 110 }' placeholder="Tags except" style="width: 83%">
            </label>
        </div>
        <div class="row" id="scroll-tbl">
            <div class="col-sm-6 overflow" id="tags-table"></div>
            <div class="col-sm-6 overflow" id="terms-table"></div>
        </div>
    </div>


    <div id="chart" class="nav-body"> <!-- todo scrollable -->
        <div id="comment-chart"></div>
        <div id="tags-chart"></div>
        <button class="btn btn-sm btn-primary block-center m-y-1 m-l-1 m-b-1 p-x" ng-click="ctrl.downloadCsv()">Download tags as CSV</button>
        <div id="chart-table"></div>
        <button class="btn btn-sm btn-primary block-center m-y-1 m-l-1 m-b-1 p-x" ng-click="ctrl.downloadCsv()">Download tags as CSV</button>
    </div>

    <div id="modal-placeholder"></div>

    <link rel=stylesheet href="node_modules/bootstrap/dist/css/bootstrap.css">
    <link rel=stylesheet href="css/app.css">
    <script src="node_modules/jquery/dist/jquery.js"></script>
    <script src="node_modules/angular/angular.js"></script>
    <script src="lib/xls.min.js"></script>
    <script src="//gstatic.com/charts/loader.js"></script>
    <script src="app.min.js"></script>
</div>
</body>
</html>
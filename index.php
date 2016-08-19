<?php
    include 'settings/settings.php';
    session_start();
    $token = isset($_SESSION['xsrfToken']) && $_SESSION['xsrfToken'];
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Google Surveys</title>
    <meta name="google-signin-client_id" content="<?php echo $google_api_id ?>">
    <style>
        #loading {
            position: absolute;
            width: 100%;
            height: 100%;
            background: white;
        }
        h5 {
            font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
            color: #373a3c;
            font-size: 1.25rem;
            font-weight: 500;
            line-height: 1.1;
            margin-top: 0;
        }
        #loading > h5 {
            position: absolute;
            top: calc(50% - 22px);
            text-align: center;
            width: 100%;
        }
    </style>
    <?php if (!$token) { ?>
    <style>
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
        box-shadow: 0 0 34px darkred;
        border-radius: 4px;
        border: 1px dotted darkred;
        padding: 16px;
        display: none;
        background: #ff7;
    }
    a[target="_blank"] {
        display: block;
        padding-top: 9px;
    }
    a[target="_blank"]:after {
        content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=");
        margin: 0 0 0 7px;
    }
    #logged-in {
        display: none;
    }
    </style>
    <?php } ?>
</head>

<body>
<script src="https://apis.google.com/js/platform.js" async defer onload="onPlatformLoad()"></script>
<script>
    function logIn (g) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/login.php?authToken=' + encodeURIComponent(g.getAuthResponse().id_token));
        xhr.onload = function() {
            if (xhr.status === 200) {
                window.xsrfToken = xhr.responseText;
                if (window.app) {
                    alreadyLoggedIn();
                }
            }
            else {
                alert('Server error: ' + xhr.responseText);
            }
        };
        xhr.send();
    }

    // start loading only after app started
    function onPlatformLoad() {
        <?php if ($token) { ?>
        if (window.app) {
            gapi.load('auth2', function () {
                gapi.auth2.init({
                    client_id: '<?php echo $google_api_id ?>'
                });
            });
        }
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
    <div id="logged-out">
        <div id="login-form">
            <div class="col-half">Company Logo</div>
            <div class="col-half">
                <h5>Sign in using your Google account</h5><br>
                <div class="g-signin2" data-onsuccess="logIn"></div>
            </div>
        </div>
        <div id="test3dPartyCookies"><strong>Third party cookies are disabled in your browser.</strong><br>
            You cannot sign in using Google unless you enable them.<br>
            <a target=_blank href="https://www.google.com/search?q=how+do+I+enable+3rd+party+cookies+in+my+browser" style="font-size: 20px">Search Google how to fix it in your browser</a>
        </div>
        <iframe src="//mindmup.github.io/3rdpartycookiecheck/start.html" style="display:none"></iframe>
    </div>
<?php } ?>

<div id="logged-in" ng-controller="dashboard as ctrl">
    <div id="loading"><h5>Loading...</h5></div>

    <header>
        <a id="logout" ng-click="ctrl.logOut()">Log out</a>
        <button class="btn btn-sm btn-primary active" id="btn-surveys" ng-click="ctrl.navigate(0)" style="position:relative">
            <span class="bullet">1</span> Surveys&nbsp;
        </button> <big>&raquo;</big>
        <button class="btn btn-sm btn-primary disabled" id="btn-tags" ng-click="ctrl.navigate(1)">
            <span class="bullet">2</span> Tags & terms
        </button> <big>&raquo;</big>
        <button class="btn btn-sm btn-primary disabled" id="btn-answers" ng-click="ctrl.navigate(2)">
            <span class="bullet">3</span> Answers & tags
        </button> <big>&raquo;</big>
        <button class="btn btn-sm btn-primary disabled" id="btn-chart" ng-click="ctrl.navigate(3)">
            <span class="bullet">4</span> Chart & CSV
        </button>
    </header>


    <div id="surveys" class="nav-body">
        <table ng-show="ctrl.hasSurveys()" class="table table-striped table-bordered table-hover m-t-1">
            <thead class="thead-default"><tr>
                <th colspan=3 class="p-x-1">Survey</th><th>Google ID</th><th>Question</th><th>Created</th>
            </tr></thead>
            <tr ng-class="{active: id === ctrl.sId}" ng-repeat="(id, survey) in ctrl.surveys">
                <td><a ng-click="ctrl.loadSurvey(id)" class="p-x-1">edit</a></td>
                <td><a ng-click="ctrl.cloneSurvey(id)">clone & edit</a></td>
                <td><a ng-click="ctrl.deleteSurveyById(id)">delete</a></td>
                <td ng-bind="survey.survey_google_id" class="tinytext"></td>
                <td ng-bind="survey.question"></td>
                <td ng-bind="survey.created * 1000 | date:'MMM dd H:mm'" class="tinytext"></td>
            </tr>
        </table>
        <b ng-show="!ctrl.hasSurveys()">No surveys yet. Please upload a spreadsheet below ↓</b>
        <br>
        <hr>
        <br>
        Upload new survey spreadsheet
        <input type="file" custom-on-change="ctrl.uploadFile" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
    </div>


    <div id="tags" class="nav-body">
        <div id="tags-question"></div>
        <div class="row">
            <div class="col-xs-9 col-lg-6">
                <input ng-model="ctrl.bulkAdd" placeholder="Comma separated tags list" ng-keyup="$event.keyCode == 13 && ctrl.addTags()" style="width: calc(100% - 148px);">
                <button class="btn btn-sm btn-secondary" ng-click="ctrl.addTags()" style="position: relative; top: -1px; left: -2px">Add tags manually</button>
            </div>
            <div class="col-xs-3">
                <button class="btn btn-sm btn-primary pull-xs-right" ng-click="ctrl.sort()">Sort terms ▼</button>
            </div>
        </div>
        <div class="row m-t-1">
            <label class="col-xs-6 col-sm-4 col-lg-3"><small>Maximum number of tags:</small>
                <input ng-model="ctrl.maxTags" ng-change="ctrl.splitMax()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-4 col-lg-3"><small>Minimum repeat for tag:</small>
                <input ng-model="ctrl.minCount" ng-change="ctrl.splitMin()" ng-model-options='{ debounce: 110 }' type="number">
            </label>
            <label class="col-xs-6 col-sm-4 col-lg-3"><small id="tags-f-span">Filter:</small>
                <input ng-model="ctrl.filterTerm" ng-change="ctrl.filterTerms()" ng-model-options='{ debounce: 110 }' placeholder="Filter tags" id="tags-f-input">
                <span class="cross" ng-click="ctrl.filterTerm = '';ctrl.filterTerms()">×</span>
            </label>
        </div>
        <div class="row" id="scroll-tbl">
            <div class="col-sm-6 scroll" id="tags-table"></div>
            <div class="col-sm-6 scroll" id="terms-table"></div>
              </div>
        <div id="undo"></div>
    </div>


    <div id="answers" class="nav-body">
        <div class="row" style="height: 100%">
            <div class="col-sm-6 scroll" id="answers-table"></div>
            <div class="col-sm-6 scroll" id="short-table"></div>
        </div>
    </div>


    <div id="chart" class="nav-body scroll">
        <div id="comment-chart"></div>
        <div id="tags-chart"></div>
        <br>
        <div id="chart-table"></div>
        <button class="btn btn-sm btn-primary block-center m-y-1 p-x-1" ng-click="ctrl.downloadCsv()">Download tags as CSV</button>
    </div>

    <div id="modal-placeholder"></div>

    <link rel=stylesheet href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.3/css/bootstrap.min.css">
    <link rel=stylesheet href="css/app.css">
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/xls/0.7.5/xls.core.min.js"></script>
    <script src="app8.js"></script>
</div>
</body>
</html>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Sign in using Google account</title>
    <meta name="google-signin-client_id" content="211499477101-d78crq8gs6sojr7grdlm9ebmoltiel71.apps.googleusercontent.com">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
    <script src="//apis.google.com/js/platform.js" async defer></script>
    <style>
        #test3dPartyCookies {
            display: none;
            color: darkred;
        }
        a[target="_blank"]:after {
            content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=");
            margin: 0 0 0 5px;
        }
    </style>
</head>

<body>
<br>
<br>
<div class="row">
    <div class="col-md-1"></div>
    <div class="col-md-10">
        <div class="row">
<!--            <div class="col-sm-3">Logo</div>-->
            <div class="col-sm-9">
                <h3>Hi there! Log In using your Google account to proceed</h3><br>
                <div class="g-signin2" data-onsuccess="onSignIn"></div>
            </div>
        </div>
        <br>
    </div>
    <div class="col-md-1"></div>
</div>

<form action="/" method="post">
    <input type="hidden" name="auth_google_token">
</form>

<script>
    function onSignIn (googleUser) {
        var hidden = document.getElementsByName('auth_google_token')[0];
        hidden.value = googleUser.getAuthResponse().id_token;
        hidden.parentNode.submit();
    }

    // check for 3d party cookies are enabeld code
    window.addEventListener("message", function (evt) {
        if (evt.data === 'MM:3PCunsupported') {
            document.getElementById('test3dPartyCookies').style.display = 'block';
        }
    }, false);
</script>

<div id="test3dPartyCookies"><strong>Hey, third party cookies are disabled in your browser.</strong><br>
    You cannot sign in using Google unless you enable them!<br>
    <a target="_blank" href="https://www.google.com/search?q=how+do+I+enable+3rd+party+cookies+in+my+browser">Search Google how you can fix this</a></div>
<iframe src="https://mindmup.github.io/3rdpartycookiecheck/start.html" style="display:none"></iframe>

<!-- load and cache some js to speedup next page -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js" async defer></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" async defer integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>
</body>
</html>
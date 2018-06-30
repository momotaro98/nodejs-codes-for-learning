var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount/testmixlnc-firebase-adminsdk-8gyrr-9af034a358.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://testmixlnc.firebaseio.com"
});

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:9000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.listen(3000);
console.log('Server is online.');


app.post('/', function(req, res) {
    res.send('POST is sended.');
})

app.post('/sessionLogin', (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  console.log(idToken);
  /*
  const csrfToken = req.body.csrfToken.toString();
  // Guard against CSRF attacks.
  if (csrfToken !== req.cookies.csrfToken) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }
 */
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
    // Set cookie policy for session cookie.
    console.log('login!!!');
    console.log(sessionCookie);
    const options = {maxAge: expiresIn, httpOnly: true, secure: true};
    res.cookie('session', sessionCookie, options);
    res.end(JSON.stringify({status: 'success'}));
  }, error => {
    console.log('Error aaaaaa');
    res.status(401).send('UNAUTHORIZED REQUEST!');
  });
});

// Whenever a user is accessing restricted content that requires authentication.
app.get('/pppp', (req, res) => {
  const sessionCookie = req.cookies.session || '';
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  if (sessionCookie === '') {
    console.log('No sessionCookie...');
  } else {
    console.log('There is sessionCookie!');
    console.log(sessionCookie);
  }
  admin.auth().verifySessionCookie(
    sessionCookie, true /** checkRevoked */).then((decodedClaims) => {
    console.log('Verified!!!yeah!!!');
    // Access to microservices
    // serveContentForUser('/profile', req, res, decodedClaims);
    // Return Response to client
    res.end(JSON.stringify({profile: 'Your profile is here!!!'}));
  }).catch(error => {
    // Session cookie is unavailable or invalid. Force user to login.
    console.log('Not Verified....');
    // res.redirect('/login');
    res.end(JSON.stringify({errorrr: 'You are not Verified...'}));
  });
});

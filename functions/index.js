const functions = require("firebase-functions");
let request = require("request");
let querystring = require("query-string");
const cors = require("cors")({ origin: true });
const secrets = require('./secrets.js')

const firebaseRedirect = "https://us-central1-votify-b9360.cloudfunctions.net/callback"

const redirect_uri = "https://votify-b9360.firebaseapp.com/callback";
const uri = "https://votify-b9360.firebaseapp.com";

// || "https://votify-b9360.firebaseapp.com/callback"

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "votify-b9360",
    clientEmail: "firebase-adminsdk-i92aj@votify-b9360.iam.gserviceaccount.com",
    privateKey: secrets.FIREBASE_KEY
  }),
  databaseURL: uri
});


exports.login = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.redirect(
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "token",
          client_id: secrets.SPOTIFY_CLIENT_ID,
          scope:
            "user-read-private user-read-email playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private user-read-currently-playing",
          redirect_uri
        })
    );
  });
});

exports.callback = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    let code = req.query.code || null;
    let authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(
            secrets.SPOTIFY_CLIENT_ID +
              ":" +
              secrets.SPOTIFY_CLIENT_SECRET
          ).toString("base64")
      },
      json: true
    };
    request
      .post(authOptions, (error, response, body) => {
        var access_token = body.access_token;
        res.redirect(uri + "?access_token=" + access_token);
      })
      .catch(error => console.log(error));
  });
});

// exports.redirect = functions.https.onRequest((req, res) => {
//   console.log('running redirect firestore function')

//   let code = req.query.code || null;
//   let authOptions = {
//     url: "https://accounts.spotify.com/api/token",
//     form: {
//       code: code,
//       redirect_uri,
//       grant_type: "authorization_code"
//     },
//     headers: {
//       Authorization:
//         "Basic " +
//         new Buffer(
//           process.env.SPOTIFY_CLIENT_ID +
//             ":" +
//             process.env.SPOTIFY_CLIENT_SECRET
//         ).toString("base64")
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     var access_token = body.access_token;
//     res.redirect(uri + "?access_token=" + access_token);
//   });

// });

(function () {
  var firebaseConfig = {
    apiKey:            "REPLACE_ME",
    authDomain:        "REPLACE_ME",
    projectId:         "REPLACE_ME",
    storageBucket:     "REPLACE_ME",
    messagingSenderId: "REPLACE_ME",
    appId:             "REPLACE_ME"
  };
  firebase.initializeApp(firebaseConfig);
  window.db    = firebase.firestore();
  window.auth  = firebase.auth();
  window.store = firebase.storage();
})();

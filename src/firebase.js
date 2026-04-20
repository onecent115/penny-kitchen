(function () {
  var firebaseConfig = {
    apiKey:            "AIzaSyAxwgHeSG0MFe0AZHFMo9TSisYVaEsSbjs",
    authDomain:        "penny-s-kitchen.firebaseapp.com",
    projectId:         "penny-s-kitchen",
    storageBucket:     "penny-s-kitchen.firebasestorage.app",
    messagingSenderId: "215104845349",
    appId:             "1:215104845349:web:dc2680c6d8ff5b56b2f1cc"
  };
  firebase.initializeApp(firebaseConfig);
  window.db    = firebase.firestore();
  window.auth  = firebase.auth();
  window.store = firebase.storage();
})();

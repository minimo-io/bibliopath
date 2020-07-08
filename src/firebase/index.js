// src/firebaseConfig.js
import firebase from "firebase";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBpSBYlbneGy57azUnFKM7Sp9ZXp24IpCU",
  authDomain: "biblio-path.firebaseapp.com",
  databaseURL: "https://biblio-path.firebaseio.com",
  projectId: "biblio-path",
  storageBucket: "biblio-path.appspot.com",
  messagingSenderId: "110539662130",
  appId: "1:110539662130:web:ae954422aa2ee90e1a6d2b"
};

// Initialize Firebase
export default firebase.initializeApp(firebaseConfig);

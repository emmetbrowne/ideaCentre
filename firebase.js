// Import the functions you need from the SDKs you need
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { initializeApp } from 'firebase/app';
// import * as firebase from "firebase";
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore'
// import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBajv536FPDjRNzqwZLNE0Pd_C-kC100z0",
    authDomain: "ideacentre-97c4b.firebaseapp.com",
    projectId: "ideacentre-97c4b",
    storageBucket: "ideacentre-97c4b.appspot.com",
    messagingSenderId: "825853901869",
    appId: "1:825853901869:web:bc990ed11c36c052fbcca4",
    measurementId: "G-8LCZWHB73M"
};

// Initialize Firebase
// let app;
// if (firebase.apps.length === 0) {
//     app = firebase.initializeApp(firebaseConfig);
// } else {
//     app = firebase.app();
// }

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }

const app = initializeApp(firebaseConfig);


const auth = firebase.auth()

export { auth };
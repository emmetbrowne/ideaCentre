import firebase from 'firebase/app';
import firebaseConfig from './firebaseConfig';

const app = firebase.initializeApp(firebaseConfig);

export default firebase;

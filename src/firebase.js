import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCktZEwylGYH3lt1WUEuxD9OMColH2_yAw",
    authDomain: "sinedi.firebaseapp.com",
    projectId: "sinedi",
    storageBucket: "sinedi.firebasestorage.app",
    messagingSenderId: "454978265211",
    appId: "1:454978265211:web:b5557d7e5feb836f5cc2de",
    measurementId: "G-R3Z809NXQE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

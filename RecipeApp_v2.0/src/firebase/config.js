import { firebase } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAHhDTPT5Y6l1yie3ZSoQVkAqvIgBG_DCQ",
  appId: "1:566281682384:android:e5dbed137220da4fb60dd5",
  messagingSenderId: "566281682384",
  projectId: "cumagecedeneme",
  storageBucket: "cumagecedeneme.firebasestorage.app",
  authDomain: "cumagecedeneme.firebaseapp.com",
  databaseURL: "https://cumagecedeneme.firebaseio.com"
};

// Eğer henüz başlatılmış bir Firebase uygulaması yoksa, yeni bir uygulama başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase; 
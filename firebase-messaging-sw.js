/*eslint-disable*/
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'apiKey': 'AIzaSyDo49Obu06b14LGOPX7opUAhP8DVBGLag4',
  'authDomain': 'mirrormedia-notification.firebaseapp.com',
  'databaseURL': 'https://mirrormedia-notification.firebaseio.com',
  'projectId': 'mirrormedia-notification',
  'storageBucket': 'mirrormedia-notification.appspot.com',
  'messagingSenderId': '375250381740',
  'appId': '1:375250381740:web:ee08f0c3fb282d9329e809',
  'measurementId': 'G-0N37CZTWYN'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   return self.registration.showNotification(notificationTitle,
//     notificationOptions);
// });
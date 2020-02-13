import firebase from 'firebase/app'

import { FIREBASE_CONFIG } from '../api/config'

firebase.initializeApp(FIREBASE_CONFIG)

export { firebase }

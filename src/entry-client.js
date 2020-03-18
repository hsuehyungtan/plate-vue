import ProgressBar from './components/ProgressBar.vue'
import Vue from 'vue'
import { createApp } from './app'
import { firebase } from './firebase'
import 'firebase/messaging'

// global progress bar
const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount()
document.body.appendChild(bar.$el)

// a global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    bar.start()
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        bar.finish()
        next()
      })
      .catch(next)
  })

  // actually mount to DOM
  app.$mount('#app')
})

// service worker
const debugSW = require('debug')('CLIENT:SERVICE-WORKER')
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => {
      debugSW('REGISTERING SW SUCCESSFULLY.')
    })
    .catch(() => {
      debugSW('REGISTERING SW IN FAIL.')
    })
  navigator.serviceWorker.addEventListener('message', event => debugSW('Got Msg from dervice-worker!' + event.data))

  if (!('PushManager' in window)) {
    debugSW('Push messaging is not supported.')
  } else {
    const messaging = firebase.messaging()

    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(registration => {
        debugSW('REGISTERING SW SUCCESSFULLY.')
        console.log('REGISTERING SW SUCCESSFULLY.', registration)
        messaging.useServiceWorker(registration)
      })
      .catch(err => {
        debugSW('REGISTERING SW IN FAIL.', err)
        console.log('REGISTERING SW err.', err)
      })
      .then(() => {
        messaging.usePublicVapidKey('BJ3O7VVlyDAfrgg_QqNLILWQ020EOdm_Up3VSwjxkzEZa_jY53P-iZrrCnbRh4fCNSQRGzbIquoIGDIr30a8GJ4')
        messaging.requestPermission()
          .then(() => {
            console.log('firebase after requestPermission')
            messaging.getToken()
              .then(currentToken => {
                console.log('firebase currentToken:', currentToken)
              })
          })
        messaging.onTokenRefresh(() => {
          messaging.getToken()
            .then(refreshedToken => {

            })
        })
        messaging.onMessage(payload => {
          console.log('firebase onMessage payload:', payload)
          const title = payload.notification.title
          const options = payload.notification
          options.icon = payload.data.icon

          const notification = new Notification(title, options)

          notification.addEventListener('click', e => {
            e.preventDefault()
            window.open(payload.data.url, '_blank')
          })
        })
      })
  }
}

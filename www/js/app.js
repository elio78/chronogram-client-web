// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('Chronogram', ['ionic', 'Chronogram.controllers', 'Chronogram.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
        controller: 'IndexController'
      }
    }
  })

  .state('app.aboutus', {
      url: '/aboutus',
      views: {
        'mainContent': {
          templateUrl: 'templates/aboutus.html'
        }
      }
    })
    .state('app.chronograms', {
      url: '/Chronograms',
      views: {
        'mainContent': {
          templateUrl: 'templates/chronograms.html',
          controller: 'MenuController'  
        }
      }
    })
    
    .state('app.tasksDetails', {
      url: '/Tasks/:id',
      views: {
        'mainContent': {
          templateUrl: 'templates/task.html',
          controller: 'TaskDetailController'  
        }
      }
    })

   .state('app.favorites', {
      url: '/favorites',
      views: {
        'mainContent': {
          templateUrl: 'templates/favorites.html',
            controller:'FavoritesController'
        }
      }
    })
  
  .state('app.chronogramdetails', {
    url: '/Chronograms/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/chronogram.html',
        controller: 'ChronogramDetailController'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

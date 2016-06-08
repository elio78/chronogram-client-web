'use strict';

angular.module('Chronogram.services',['ngResource'])
        .constant("baseURL","https://chronogram-loopback-api-server.mybluemix.net/api/")

        .factory('chronogramFactory', ['$resource', 'baseURL', function($resource,baseURL) {
                //this.getChronograms = function(){
                return $resource(baseURL+"Chronograms/:id",null,
                        {'update':{method:'PUT',
                            headers: { 'auth-token': 'eJEKIBY1jQo18KWAeGHiTlpYoExZE392HKwX1eMhdf6ecfXz4vVjdc6xjaYstt2T' }}},
                        {'get':{method:'GET',
                            headers: { 'auth-token': 'lnetkWLgMLLhLvgAOaVW55hZyNDHL9aphenIaBftlOjCvgrIMzEKxRw5VDDTc1Bk' }}}
                        );
                }]
        )

        .factory('taskFactory', ['$resource', 'baseURL', function($resource,baseURL) {
                //return $resource(baseURL+"tasks/:id",null, {'update':{method:'PUT'}});
                //this.tasks = function(){
                return $resource(baseURL+"Tasks/:id",null,  
                        {'update':{method:'PUT',
                                   headers: { 'auth-token': 'eJEKIBY1jQo18KWAeGHiTlpYoExZE392HKwX1eMhdf6ecfXz4vVjdc6xjaYstt2T' }}},
                        {'delete': {
                            method: 'DELETE',
                            params: {
                                id:"@id"
                            }
                        }}
                    );
                }]
            
        )

        .factory('historyFactory', ['$resource', 'baseURL', function($resource,baseURL) {
                    return $resource(baseURL+"Histories/:id",null,  {'update':{method:'PUT' }}
                                    );
                }]
        )

       
        .factory('feedbackFactory', ['$resource', 'baseURL', function($resource,baseURL) {
            return $resource(baseURL+"feedback/:id");
        }])


    .factory('$localStorage', ['$window', function($window) {
        return {
            store: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key,defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
    }])

    .factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', 'baseURL', '$ionicPopup', function($resource, $http, $localStorage, $rootScope, baseURL, $ionicPopup){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var email = '';
    var authToken = undefined;
        
        
    function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {
        
        $resource(baseURL + "Customers/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.id});
              $rootScope.$broadcast('login:Successful');
              console.log("login successful"+response);
              console.log("username:"+loginData.username+", token:"+response.id);
           },
           function(response){
              isAuthenticated = false;
            
              var message = '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Login Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Login Failed!');
                });
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "Customers/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
        
        
        
    authFac.register = function(registerData) {
        
        $resource(baseURL + "Customers/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Registration Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Registration Failed!');
                });
           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };
        
    authFac.getUserCredential = function() {
        return authToken;  
    };
        
    authFac.getEmail = function() {
        return email;  
    };
    
    authFac.facebook = function() {
        
    };
    
    loadUserCredentials();
    
    return authFac;
    
}])

.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    var favFac = {};
    var favorites = [];

    favFac.addToFavorites = function (index) {
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id == index)
                return;
        }
        favorites.push({id: index});
        console.log("addToFavorites "+index)
    };
    favFac.deleteFromFavorites = function (index) {
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id == index) {
                favorites.splice(i, 1);
            }
        }
    }

    favFac.getFavorites = function () {
        return favorites;
    };

    return favFac;
    }])


;
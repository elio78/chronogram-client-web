angular.module('Chronogram.controllers', ['ngCordova'])

    .controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $ionicLoading, AuthFactory, $http) {
 
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  
 $scope.hide = function(){
    $ionicLoading.hide();
  };
    
    //$scope.notifications = [];
// call to register automatically upon device ready
//$ionicPlatform.ready.then(function (device) {
//    $scope.register();
//});

//var ctrls = angular.module('notiApp.controllers', ['ionic', 'ngCordova', 'ngCordova.plugins']);
    
// Register
$scope.register = function () {
    var config = null;

    if (ionic.Platform.isAndroid()) {
        config = {
            "senderID": "12834957xxxx" 
        };
    }

    $cordovaPush.register(config).then(function (result) {
        console.log("Register success " + result);

        $cordovaToast.showShortCenter('Registered for push notifications');
        $scope.registerDisabled=true;

    }, function (err) {
        console.log("Register error " + err)
    });
}

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.newChronogram = {};
    $scope.loggedIn = false;
    $scope.currentChronoId = 0;
    var currentChronogram = {};
    console.log("initialisation de currentChronogram");
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
        $scope.userCredential = AuthFactory.getUserCredential();
    }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);
        AuthFactory.login($scope.loginData);
        $scope.username = AuthFactory.getUsername();
        $scope.userCredential = AuthFactory.getUserCredential();
        $scope.closeLogin();
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthService.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
       
    $rootScope.$on('registration:Successful', function () {
        $localStorage.storeObject('userinfo',$scope.loginData);
    });
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $scope.userCredential = AuthFactory.getUserCredential();
    });
})

.controller('MenuController', ['$scope', '$rootScope', 'chronogramFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$ionicModal', '$timeout', function ($scope, $rootScope, chronogramFactory, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, $ionicModal, $timeout) {
            $scope.baseURL = baseURL;
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showChronogram = false;
            $scope.message = "Loading ...";
            $scope.shouldShowDelete = false;
            $scope.show();
            chronogramFactory.query(
                function(response) {
                    $scope.chronograms = response;
                    console.log("------"+response);
                    $scope.showChronogram = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            $scope.hide();
        $scope.newChronogram = new chronogramFactory();        
        $scope.newChronogram = {
                "status": "defined",
                "state": "defined",
                "plannedDuration": "30",
                "createdAt":Date.now(),
                "effectiveDuration": 0,
                "responsibles": [$scope.username],
                "tasks":[]
            };
    
            $scope.select = function(setTab) {
                console.log("Passage 02");
                $scope.tab = setTab;
                if (setTab === 2) {
                    $scope.filtText = "defined";
                }
                else if (setTab === 3) {
                    $scope.filtText = "started";
                }
                else if (setTab === 4) {
                    $scope.filtText = "delayed";
                }
                 else if (setTab === 5) {
                    $scope.filtText = "ended";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                console.log("MenuController-Passage 03");
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                console.log("MenuController-Passage 04");
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.toggleDelete = function () {
                $scope.shouldShowDelete = !$scope.shouldShowDelete;
                console.log($scope.shouldShowDelete);
            }
    
            $scope.addToFavorites = function (index) {
                console.log("Chronogram index is " + index);
                favoriteFactory.addToFavorites(index);
                $ionicListDelegate.closeOptionButtons();
                $ionicPlatform.ready(function () {
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: "Added Favorite",
                        text: $scope.chronograms.name
                    }).then(function () {
                        console.log('Added Favorite ');
                    },
                    function () {
                        console.log('Failed to add Notification ');
                    });

                    $cordovaToast
                    .show('Added Favorite ', 'long', 'center')
                    .then(function (success) {
                      // success
                    }, function (error) {
                      // error
                    });
                });
            };
    
   // $ionicPlatform.ready(function(){
   //   $cordovaDatePicker.show(options).then(function(date){
   //     alert(date);
   //   });
   //})
  //}

            
            
             // Create the chronogram modal that we will use later
    $ionicModal.fromTemplateUrl('templates/createChronogram.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.chronogramForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeChronogramForm = function () {
        $scope.chronogramForm.hide();
    };

    // Open the login modal
    $scope.createChronogram = function () {
        console.log("Create a new Chronogram....");
        $scope.chronogramForm.show();
    };

        $scope.doCreateChronogram = function () {
            console.log('Username = '+$scope.username);
            console.log('Doing chronogram creation'+ $scope.newChronogram);
            
            chronogramFactory.save($scope.newChronogram)
            .$promise.then(
                            function(response){
                                console.log("doCreateChronogram response : "+response);
                                $scope.chronograms = chronogramFactory.query();
                                $scope.showChronograms = true;
                                $scope.closeChronogramForm();
                            },
                            function(response) {
                                $scope.message = "doCreateChronogram Error: "+response.status + " " + response.statusText;
                            }
                        );
        };
    
         $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };    
        
        $scope.deleteChronogram = function (index) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this chronogram?</p>'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                //delete history before deleting task
                chronogramFactory.delete(index);
                $state.go($state.current, {}, {reload: true});
                $scope.chronograms.splice(index, 1);
                //$window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;
    };
    
        
    
    
        }])

  .controller('IndexController', ['$scope', 'chronogramFactory', 'baseURL', function($scope, chronogramFactory, baseURL) {                                         $scope.baseURL = baseURL;
                        $scope.showChronogram = false;
                        $scope.message="Loading ...";   
                        
                        $scope.chronogram = chronogramFactory.get({id:"572cab63652bd2f10f12dbef"})
                        .$promise.then(
                            function(response){
                                $scope.chronogram = response;
                                $scope.showChronogram = true;
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
                        );
            
                    }])
 
    .controller('ChronogramDetailController', ['$scope', '$stateParams', '$state', 'chronogramFactory', 'taskFactory', 'baseURL', '$ionicListDelegate', '$ionicModal', '$ionicPopup', '$ionicLoading', 'AuthFactory', '$timeout', '$ionicPlatform', function($scope, $stateParams, $state, chronogramFactory, taskFactory, baseURL, $ionicListDelegate, $ionicModal, $ionicPopup, $ionicLoading, $AuthFactory, $timeout, $ionicPlatform) {
            $scope.baseURL = baseURL;
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.chronogram = {};
            $scope.tasks = [];
            $scope.showChronogram = false;
            $scope.showTasks = false;
            $scope.showTask = false;
            $scope.message="Loading ...";
            $scope.shouldShowDelete = false;
            $scope.nextExecNumber = 1;
        
            var module = 'ChronogramDetailController';
            $scope.show();
            console.log("Passage dans "+module+" - 01 -");
            $scope.chronogram = chronogramFactory.get({id:$stateParams.id})
            .$promise.then(
                            function(response){
                                console.log("response : "+response.name+":"+response.id);
                                $scope.currentChronoId = response.id;
                                $scope.chronogram = response;
                                currentChronogram = response;
                                if (typeof currentChronogram.tasks === 'undefined' || currentChronogram.tasks === null) {
                                    // variable is undefined or null
                                } else {
                                    $scope.nextExecNumber = currentChronogram.tasks.length + 1;
                                }
                                $scope.showChronogram = true;
                                $scope.hide();
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                                $scope.hide();
                            }
                
                );
                $scope.tasks = taskFactory.query(
                function(response) {
                    $scope.tasks = response;
                    $scope.showTasks = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
       
        $scope.select = function(setTab) {
                $scope.tab = setTab;
                if (setTab === 2) {
                    $scope.filtText = "defined";
                }
                else if (setTab === 3) {
                    $scope.filtText = "started";
                }
                else if (setTab === 4) {
                    $scope.filtText = "delayed";
                }
                 else if (setTab === 5) {
                    $scope.filtText = "ended";
                }
                else {
                    $scope.filtText = "";
                }
            
            };
        //-----------------------------------------------------------    
        $scope.newTask = new taskFactory();
        $scope.newTask.name = "task three";
        $scope.newTask.description = "Tollit modo veri semel non parte si semel quidem iudicia iste de mihi est ponit.";
        $scope.newTask.effectiveStartDate = "2016-05-15";
        $scope.newTask.status = "defined";
        $scope.newTask.state = $scope.newTask.status;
        $scope.newTask.effectiveDuration = 45;
        $scope.newTask.criticity = 0;
        $scope.newTask.executionOrder = $scope.nextExecNumber;
        $scope.nextExecNumber = $scope.nextExecNumber + 1;
        $scope.newTask.responsibles = [$scope.username];
        $scope.newTask.history = [];
        $scope.newTask.plannedDuration = 45;
        $scope.newTask.plannedStartDate = "2016-05-10";
        $scope.newTask.prerequisites = [];
        $scope.newTask.customerId = $scope.username;
        $scope.newTask.createdAt = Date.now();
        //-----------------------------------------------------------

        $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.toggleDelete = function () {
                $scope.shouldShowDelete = !$scope.shouldShowDelete;
                console.log($scope.shouldShowDelete);
            }
    // Create the task modal that we will use later
    $ionicModal.fromTemplateUrl('templates/createTask.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.taskForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeTaskForm = function () {
        $scope.taskForm.hide();
    };

    // Open the login modal
    $scope.createTask = function () {
        console.log("Create a new Task....");
        $scope.taskForm.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doCreateTask = function () {
        console.log('Doing task creation', $scope.newTask);
        $scope.newTask.chronogramsId = $scope.currentChronoId;
        taskFactory.save($scope.newTask)
            .$promise.then(
                            function(response){
                                console.log("doCreateTask response : "+response);
                                $scope.chronogram.tasks.push(response.id);
                                $scope.tasks = taskFactory.query();
                                $scope.showTasks = true;
                                $scope.closeTaskForm();
                                chronogramFactory.update(currentChronogram);
                            },
                            function(response) {
                                $scope.message = "doCreateTask Error: "+response.status + " " + response.statusText;
                            }
            );
    };
        
    $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };    
        
    $scope.deleteTask = function (index) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this task?</p>'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                //delete history before deleting task
                
                taskFactory.delete(index);
                $state.go($state.current, {}, {reload: true});
                $scope.tasks.splice(index, 1);
                //$window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;
    };
        
        
        
        
        }])

    .controller('TaskDetailController', ['$scope', '$stateParams', 'taskFactory', 'historyFactory', 'chronogramFactory', 'baseURL', 'AuthFactory', '$ionicListDelegate', '$ionicModal', '$ionicLoading', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function($scope, $stateParams, taskFactory, historyFactory, chronogramFactory, baseURL, AuthFactory, $ionicListDelegate, $ionicModal, $ionicLoading, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
            $scope.baseURL = baseURL;
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.tasks = [];
            $scope.showTasks = false;
            $scope.history = {};
            $scope.currentTaskId = 0;
            $scope.message="Loading ...";
            console.log("Passage dans TaskDetailController - 01");
            $scope.tasks = taskFactory.get({id:$stateParams.id})
            .$promise.then(
                            function(response){
                                console.log("response : "+response.name);
                                $scope.tasks = response;
                                $scope.currentTaskId = response.id;
                                $scope.showTasks = true;
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
            );
        
         //-----------------------------------------------------------    
        $scope.newHistory = new historyFactory();
        $scope.newHistory.postedBy = $scope.username;
        //-----------------------------------------------------------
        
         // Create the history modal that we will use later
        $ionicModal.fromTemplateUrl('templates/createHistory.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.historyForm = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeHistoryForm = function () {
            $scope.historyForm.hide();
        };

        // Open the login modal
        $scope.createHistory = function () {
            console.log("Create a new History....");
            $scope.historyForm.show();
        };
        
        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };

            // Change task status
            $scope.changeTaskStatus = function (state) {
                console.log("State is : "+state);
                $scope.tasks.status = state;
                currentChronogram.status = state;
                if(state === "started"){
                    currentChronogram.effectiveStartDate=Date.now();
                    $scope.tasks.effectiveStartDate = Date.now();
                }
                currentChronogram.editedAt=Date.now();
                chronogramFactory.update(currentChronogram);
                $scope.tasks.editedAt=Date.now();
                taskFactory.update($scope.tasks)
                 .$promise.then(
                            function(response){
                                $ionicLoading.show({ template: 'Task :'+response.name+" set to state : "+state+"!", noBackdrop: true, duration: 3000 });
                            },
                            function(response) {
                                $scope.message = "update Task Error: "+response.status + " " + response.statusText;
                            }
                );
            };
        
         // Perform the login action when the user submits the login form
        $scope.doCreateHistory = function () {
        console.log('Doing history creation', $scope.newHistory);
        $scope.newHistory.tasksId = $scope.currentTaskId;
        $scope.newHistory.createdAt = Date.now();    
        historyFactory.save($scope.newHistory)
            .$promise.then(
                            function(response){
                                console.log("doCreateHistory response : "+response);
                                $scope.history = historyFactory.query();
                                $scope.closeHistoryForm();
                                $scope.tasks.history.push(response.id);
                                taskFactory.update($scope.tasks);
                            },
                            function(response) {
                                $scope.message = "doCreateHistory Error: "+response.status + " " + response.statusText;
                            } 
            );
    };
        
           $scope.history = historyFactory.query(
                function(response) {
                    $scope.history = response;
                    $scope.showTasks = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        }])

.controller('FavoritesController', ['$scope', '$state', 'chronogramFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, $state,  chronogramFactory, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favoriteFactory.getFavorites();

    $scope.chronograms = chronogramFactory.query(
        function (response) {
            $scope.chronograms = response;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    console.log($scope.chronograms, $scope.favorites);

    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function (index) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to unsuscribe to this item updates?</p>'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.deleteFromFavorites(index);
         
               $state.go($state.current, {}, {reload: true});
               // $window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;

    }}])

.controller('PlaylistsCtrl', function($scope, $stateParams) {
})

.filter('favoriteFilter', function () {
    return function (chronograms, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < chronograms.length; j++) {
                if (chronograms[j].id === favorites[i].id)
                    out.push(chronograms[j]);
            }
        }
        return out;

    }})


.filter('taskFilter', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return input;
    var expected = ('' + search).toLowerCase();
    var result = {};
    angular.forEach(input, function(value, key) {
      var actual = ('' + value).toLowerCase();
      if (actual.indexOf(expected) !== -1) {
        result[key] = value;
      }
    });
    return result;
  }
});

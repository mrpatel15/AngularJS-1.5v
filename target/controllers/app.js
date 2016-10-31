var policyApp = angular.module('policyApp', ['ui.router', 'appDirectives', 'ngAria', 'ngAnimate', 'ngSanitize', 'ngStorage', 'ngTouch', 'angularModalService', 'ngCookies', 'ngCsv']);
policyApp.constant('BASE_CONSTS', {
    'DRAFT_CONST': '_draft',
    'CONF_CONST': 'configuration',
    'ATTR_CONST': 'attribute',
    'OPER_CONST': 'operator',
    'RULESTYPE_CONST': 'rule-set-type',
    'RULESET_CONST': 'rule-set',
    'RULESUBSET_CONST': 'rule-sub-set',
    'RULES_CONST': 'rule'
});
policyApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(false);
}]);
policyApp.controller('policyRuleCtrl', ['$scope', '$filter', '$location', '$window', '$http', '$localStorage', '$sessionStorage', 'RulesEngineService', 'ModalService', 'alertService', '$rootScope', '$timeout', function($scope, $filter, $location, $window, $http, $localStorage, $sessionStorage, RulesEngineService, ModalService, alertService, $rootScope, $timeout) {
    $scope.checkContainerLength = false;
    $rootScope.hideCancelBtn = false;
    $rootScope.selectedContainerId = null;
    $rootScope.selectedContainerVersion = null;
    $rootScope.hideNotification = function() {
        $timeout(function() {
            alertService.hide();
        }, 5000);
    };
    $rootScope.deleteNotification = function() {
        $rootScope.scroll();
        alertService.warning("Deleted successfully!");
        $rootScope.hideNotification();
    };
    $rootScope.successNotification = function() {
        $rootScope.scroll();
        alertService.success("Updated successfully!");
        $rootScope.hideNotification();
    };
    $rootScope.infoNotification = function() {
        $rootScope.scroll();
        alertService.info("Changed status successfully!");
        $rootScope.hideNotification();
    };
    $rootScope.errorNotification = function() {
        $rootScope.scroll();
        alertService.danger("Error! Looks like something has gone wrong. Please try again later");
        $rootScope.hideNotification();
    };
    $rootScope.scroll = function() {
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
    };
    $rootScope.selectedContainer = function(getResponse) {
        if (getResponse.containers != undefined && getResponse.containers.length == 0) {
            $rootScope.addNewContainerVersion();
            $rootScope.hideCancelBtn = true;
        } else {
            $rootScope.selectContainerVersion($scope.containerIdVersionArray);
        }
    };
    $rootScope.getAllData = function() {
        var url = 'container';
        RulesEngineService.getAllData(url).then(function(getResponse) {
            $scope.containerIdVersionArray = [];
            angular.forEach(getResponse.containers, function(container, index) {
                var versionNbrs = [];
                angular.forEach(container.versions, function(version, index) {
                    versionNbrs.push(version.version);
                });
                var idVerObject = {
                    containerId: container.id,
                    containerName: container.name,
                    versions: versionNbrs
                };
                $scope.containerIdVersionArray.push(idVerObject);
            });
            if ($scope.isLocalStorageEmpty()) {
                $rootScope.selectedContainer(getResponse);
            } else {
                var validContainerId = false;
                var validContainerVersion = false;
                angular.forEach(getResponse.containers, function(container, index) {
                    if (container.id == $localStorage.selectedId) {
                        validContainerId = true;
                    }
                    angular.forEach(container.versions, function(version, index) {
                        if (validContainerId && version.version == $localStorage.selectedVersion) {
                            validContainerVersion = true;
                        }
                    });
                });
                if (validContainerId && validContainerVersion) {
                    $rootScope.selectedContainerId = $localStorage.selectedId
                    $rootScope.selectedContainerVersion = $localStorage.selectedVersion
                    $scope.selectedItem = $filter('filter')($scope.containerIdVersionArray, $rootScope.selectedContainerId);
                    if (!(sessionStorage.getItem("selectedTabIndex") == null || sessionStorage.getItem("selectedTabIndex") == undefined || sessionStorage.getItem("selectedTabIndex") == "")) {
                        $scope.onClickTab($scope.tabs[sessionStorage.getItem("selectedTabIndex")], sessionStorage.getItem("selectedTabIndex"));
                    } else {
                        $scope.onClickTab($scope.tabs[0], 0);
                    }
                } else {
                    $localStorage.$reset();
                    $rootScope.selectedContainer(getResponse);
                }
            }
        }, function(error) {
            $localStorage.$reset();
            $window.location.href = '/views/error.html';
        });
    };
    $rootScope.selectContVersionNotification = function() {
        alertService.info("Please select Container and Version!");
    };
    $rootScope.selectContainerVersion = function(containerIdVersionArray) {
        $scope.checkContainerLength = true;
        ModalService.showModal({
            templateUrl: 'views/selectContainerVersion.html',
            controller: "selectedContainerVersionCtrl",
            inputs: {
                containerIdVersionArray: containerIdVersionArray
            }
        }).then(function(modal) {
            modal.element.modal();
            $rootScope.selectContVersionNotification();
            modal.close.then(function() {
                $scope.selectedItem = $filter('filter')($scope.containerIdVersionArray, $rootScope.selectedContainerId);
                $scope.onClickTab($scope.tabs[0], 0);
            });
        });
    };
    $rootScope.addNewContNotification = function() {
        alertService.info("No Container available. Please add new Container!");
        $rootScope.hideNotification();
    };
    $rootScope.addNewContainerVersion = function() {
        $scope.checkContainerLength = false;
        ModalService.showModal({
            templateUrl: 'views/addNewContainer.html',
            controller: "addNewContainerCtrl"
        }).then(function(modal) {
            modal.element.modal();
            $rootScope.addNewContNotification();
            modal.close.then(function() {});
        });
    };
    $scope.isContainerSelected = function() {
        $rootScope.getAllData();
    }
    $scope.isLocalStorageEmpty = function() {
        if ($localStorage.selectedId === null || $localStorage.selectedVersion === null || $localStorage.selectedId === undefined || $localStorage.selectedVersion === undefined || $localStorage.selectedId.trim() == "" || $localStorage.selectedVersion.trim() == "") {
            return true;
        } else {
            return false;
        }
    }
    $scope.changeContainerValue = function() {
        $scope.selectedItem = $filter('filter')($scope.containerIdVersionArray, $rootScope.selectedContainerId);
        $localStorage.selectedId = $rootScope.selectedContainerId;
        var version = $filter('filter')($scope.selectedItem[0].versions, $rootScope.selectedContainerVersion);
        if (version.length == 1) {
            $localStorage.selectedVersion = $rootScope.selectedContainerVersion;
            $rootScope.getAllData();
        }
    }
    $scope.tabs = [{
        title: 'Lists',
        url: 'views/dataSet.html'
    }, {
        title: 'Rules',
        url: 'views/ruleSet.html'
    }, {
        title: 'Attributes',
        url: 'views/attributes.html'
    }, {
        title: 'Operators',
        url: 'views/operators.html'
    }, {
        title: 'Rules Type',
        url: 'views/rulesType.html'
    }, {
        title: 'Configuration',
        url: 'views/configuration.html'
    }];
    $scope.onClickTab = function(tab, index) {
        $scope.currentTab = tab.url;
        sessionStorage.setItem("selectedTabIndex", index);
    };
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    };
    $(document).on('mouseenter', ".break-line", function() {
        var $this = $(this);
        if (this.offsetWidth < this.scrollWidth && !$this.attr('title')) {
            $this.tooltip({
                title: $this.text(),
                placement: "top"
            });
            $this.tooltip('show');
        }
    });
    $scope.isContainerSelected();
}]);
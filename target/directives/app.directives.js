
angular.module('appDirectives',[]);policyApp.directive('alert',function(alertService){return{restrict:'AE',link:function(scope,e,a){scope.alert=alertService.alertObj;},template:'<div class="alert text-center" ng-class="alert.type" ng-show="alert.show">{{alert.msg}}'+'<a href="#" class="close" ng-click="hide()">&times;</a>'+'</div>'};});policyApp.directive('numbersOnly',function(){return{require:'ngModel',link:function(scope,element,attr,ngModelCtrl){function fromUser(text){if(text){var transformedInput=text.replace(/[^0-9]/g,'');if(transformedInput!==text){ngModelCtrl.$setViewValue(transformedInput);ngModelCtrl.$render();}
return transformedInput;}
return undefined;}
ngModelCtrl.$parsers.push(fromUser);}};});
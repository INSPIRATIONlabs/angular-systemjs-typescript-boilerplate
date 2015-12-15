import angular from 'angular';
import homeModule from '../homeModule';

class homeCtrl {
  scope:any;
  rootScope: any;
  configservice: any;
  constructor() {

  }
}

homeCtrl.$inject = ['$rootScope', '$scope'];

homeModule.controller('homeCtrl', homeCtrl);

export default homeModule;

// The reason for this abstraction from dashboardModule is because
// we need to load that file first and then we load the controller.
// You can't have angular.module().controller().config(), which is
// what we would have if we had combined this file with dashboardModule.

import homeModule from './homeModule';

import './controllers/homeCtrl';

export default homeModule;

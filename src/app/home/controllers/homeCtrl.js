import homeModule from '../homeModule';
class homeCtrl {
    constructor() {
    }
}
homeCtrl.$inject = ['$rootScope', '$scope'];
homeModule.controller('homeCtrl', homeCtrl);
export default homeModule;

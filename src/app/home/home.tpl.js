import angular from 'angular';
export default angular.module('app/home/home.tpl.html', []).run(['$templateCache', function ($templateCache) {
        $templateCache.put('app/home/home.tpl.html', '<section id="home"><h1>Home</h1></section>');
    }]);

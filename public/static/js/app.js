var app = angular.module('Proxy', ["ngCookies"]);

app.controller('ProxyController', function($scope, $http, $cookies) {
    $scope.loading = false;

    if ($cookies.getObject('als12171Youtube')) {
        var als12171Youtube = $cookies.getObject('als12171Youtube');
        $scope.history = als12171Youtube.history;
    } else {
        $scope.history = [];
    }

    $scope.view = function () {
        $scope.loading = true;
        var id = $scope.ytLink;
        $http({
            method: 'GET',
            url: '/target/'+id
        }).then(function (resp) {
            if (resp.data.state === 'success') {
                $scope.history.unshift(resp.data.info);
                $scope.save();
                window.location.href = resp.data.link;
            }
            else {
                Materialize.toast(resp.data.message || 'That video does not exist!', 4000);
                $scope.loading = false;
            }
        }, function (resp) {
            Materialize.toast(resp.data.message || 'An error occurred during processing.', 4000);
            $scope.loading = false;
        });
    };

    $scope.searchView = function() {
        $scope.loading = true;
        var query = $scope.ytSearch;
        $http({
            method: 'GET',
            url: '/search/'+query
        }).then(function (resp) {
            if (resp.data.state === 'success') {
                $scope.history.unshift(resp.data.info);
                $scope.save();
                window.location.href = resp.data.link;
            }
            else {
                Materialize.toast(resp.data.message || 'That video does not exist!', 4000);
                $scope.loading = false;
            }
        }, function (resp) {
            Materialize.toast(resp.data.message || 'An error occurred during processing.', 4000);
            $scope.loading = false;
        });
    };

    $scope.infoView = function() {
        $scope.loading = true;
        var id = $scope.ytInfo;
        $http({
            method: 'GET',
            url: '/details/'+id
        }).then(function (resp) {
            if (resp.data.state === 'success') {
                $scope.history.unshift(resp.data.info);
                $scope.save();
                window.location.href = "https://als12171-youtube.herokuapp.com/";
            }
            else {
                Materialize.toast(resp.data.message || 'That video does not exist!', 4000);
                $scope.loading = false;
            }
        }, function (resp) {
            Materialize.toast(resp.data.message || 'An error occurred during processing.', 4000);
            $scope.loading = false;
        });
    };

    $scope.save = function () {
        var now = new Date(),
            exp = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

        $cookies.putObject('als12171Youtube', {
            history: $scope.history
        }, {
            expires: exp
        });
    };

    $scope.clear = function () {
        $cookies.remove('als12171Youtube');
        $scope.history = [];
    };
});

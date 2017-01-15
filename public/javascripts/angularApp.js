var app = angular.module('flapperNews', ['ui.router']);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl',
          resolve: {
            postPromise: ['posts', function(posts) {
              return posts.getAll();
            }]
          }
        })

        .state('posts', {
          url: '/posts/:id',
          templateUrl: '/posts.html',
          controller: 'PostsCtrl',
          resolve: {
            post: ['$stateParams', 'posts', function($stateParams, posts) {
              return posts.get($stateParams.id);
            }]
          }
        });

      $urlRouterProvider.otherwise('home');
  }]);

  app.factory('posts', ['$http', function($http) {
    var o = {
      posts: []
    };

    // Get all posts from db and use angular.copy() to create deep copy of returned data and ensure new values are reflected in view
    o.getAll = function() {
      return $http.get('/posts').success(function(data) {
        angular.copy(data, o.posts);
      });
    };

    // Method for creating new posts from the view
    o.create = function(post) {
      return $http.post('/posts', post).success(function(data) {
        o.posts.push(data);
      });
    };

    // Method for upvoting given posts from the view
    o.upvote = function(post) {
      return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
        post.upvotes += 1;
      });
    };

    // Method for retrieving a single post from the server
    o.get = function(id) {
      return $http.get('/posts/' + id).then(function(res) {
        return res.data;
      });
    };

    o.addComment = function(id, comment) {
      return $http.post('/posts/' + id + '/comments', comment);
    };

    return o;
  }]);

  app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope, posts) {
      $scope.posts = posts.posts;

      $scope.addPost = function() {
        if (!$scope.title || $scope.title === '') { return; }
        posts.create({
          title: $scope.title,
          link: $scope.link,
        });
        $scope.title = ''; // empty title field after submit
        $scope.link = ''; // empty link field after submit
      };

      $scope.incrementUpvotes = function(post) {
        posts.upvote(post);
      };
    }
  ]);

  app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, posts, post) {
      $scope.post = post;

      $scope.addComment = function(){
        if($scope.body === '') { return; }
        posts.addComment(post._id, {
          body: $scope.body,
          author: 'user',
        }).success(function(comment) {
          $scope.post.comments.push(comment);
        });
        $scope.body = '';
      };
    }
  ]);

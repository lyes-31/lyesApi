// Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
var messageCtrl = require('./routes/messageCtrl');
var likesCtrl    = require('./routes/likesCtrl');
 
// Router
exports.router = (function() {

  //Création de notre routeur
  
  var apiRouter = express.Router();

  // Users routes

  // Utilisation de la méthode route de notre objet APIrouter, en premier argument on renseigne la route, le verbe http : post et on renseigne notre controlleur.
  
  apiRouter.route('/users/login/').post(usersCtrl.login);

  apiRouter.route('/users/register/').post(usersCtrl.register); 
  apiRouter.route('/users/me').get(usersCtrl.getUserProfile);
  apiRouter.route('/users/me').put(usersCtrl.updateUserProfile);

  // Message routes
  apiRouter.route('/message/new/').post(messageCtrl.createMessage);
  apiRouter.route('/message/').get(messageCtrl.listMessages);

  // Like routes

  apiRouter.route('/message/:messageId/vote/like').post(likesCtrl.likePost);
  apiRouter.route('/message/:messageId/vote/dislike').post(likesCtrl.dislikePost);


  return apiRouter;
})();
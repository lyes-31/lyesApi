//Imports
var models = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

// Constants

const TITLE_LIMIT   = 2;
const CONTENT_LIMIT = 4;
const ITEMS_LIMIT   = 50;

//Routes

module.exports = {
    createMessage: function(req,res){
           // Getting auth header
           var headerAuth = req.headers['authorization'];
           var userId = jwtUtils.getUserId(headerAuth);
        
           // Paramètres

           var title = req.body.title;
           var content= req.body.content;
           

           // Vérification condition des parametres 

           if(title == null || content==null){
               return res.status(400).json({'error' : 'missing paramaters'});
           }

           if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT){
           return res.status(400).json({'error' : 'invalid paramaters'});

           }

           // Appel de notre modul async 

           asyncLib.waterfall([
               function(done){
          // Requete a la bdd pour récuperer l'id de l'User du TOKEN parsé 
                   models.User.findOne({
                       where : { id : userId}
                   })
                   .then(function(userFound){
                       done(null, userFound);
                   })
                   .catch(function(err){
                       return res.status(500).json({'error' : 'unable to verify user'})
                   });
               },
               function (userFound,done){
                 // Si l'User a été trouvé alors
                   if(userFound){

                    //On crée un message 

                      models.Message.create({
                          title : title,
                          content : content,
                          likes : 0,
                          // On assigne le message a l' id du USER qui l'a poster
                          userId : userFound.id

                      })
                      .then(function(newMessage){
                          done(newMessage);
                      });
                   } else {
                    return res.status(500).json({'error' : 'user not found'});
                   }
               },

           ], function (newMessage){
              if (newMessage){
                  return res.status(201).json(newMessage);
              } else {
                    return res.status(500).json({'error': 'cannot post message'});
              }
           });
    },

    listMessages: function(req, res) {

        // Paramètres

        var fields  = req.query.fields; // permet de selectionner les colonnes que l'on souhaite afficher
        var limit   = parseInt(req.query.limit); // permet de récuperer les messages par segmentation 
        var offset  = parseInt(req.query.offset); // permet de récuperer les messages par segmentation 
        var order   = req.query.order; // permet de sortir la liste des messages dans un odre particulier.
    
        if (limit > ITEMS_LIMIT) {
          limit = ITEMS_LIMIT;
        }
    
        models.Message.findAll({
          // On fait des test, on vérifie qu'ils sont pas nul
          order: [(order != null) ? order.split(':') : ['id', 'ASC']],
          attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
          limit: (!isNaN(limit)) ? limit : null,
          offset: (!isNaN(offset)) ? offset : null,
          include: [{
            model: models.User,
            attributes: ['username']
           
          }]

        }).then(function(messages) {
          if (messages) {
            res.status(200).json(messages);
          } else {
            res.status(404).json({ "error": "no messages found" });
          }
        }).catch(function(err) {
          console.log(err);
          res.status(500).json({ "error": "invalid fields" });
        });
      }
    }
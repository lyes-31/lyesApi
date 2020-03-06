// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


// Constantes
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/

//Routes
module.exports = {
    register: function(req,res) {

        // Récupération des paramètres

       var email = req.body.email;
       var username = req.body.username;
       var password = req.body.password;
       var bio = req.body.bio;

       // Condition et verification des paramètres

        if (email == null || username == null || password == null){
            return res.status(400).json({'error' : 'missing parameters'});
        }

        if(username.length >= 15 || username.length <= 4){
            return res.status(400).json({'error' : 'wrong username (must be length 5 - 15)'});
        }

        if(!EMAIL_REGEX.test(email)){
            return res.status(400).json({'error' : 'email is not valid'});

        }

        // On inverse la condition avec un point d'exclamation 

        if (!PASSWORD_REGEX.test(password)){
            return res.status(400).json({'error' : 'invalid password ! must length 4-8 and include 1 number at least'})
        }



        // On vérifie si le user existe déja en bdd dans l'attribut email si on a deja cet email en BDD.
        models.User.findOne({
            attributes : ['email'],
            where: {email : email}
        })
        .then(function(userFound){
         // Si l'utilisateur n'existe pas alors

            if(!userFound){
                // On crypte notre mdp 
                bcrypt.hash(password, 5, function(err, bcryptedPassword ) {
                  //Création d'un nouvel utilisateur avec le mdp crypté
                   var newUser = models.User.create({
                       email : email,
                       username : username,
                       password : bcryptedPassword,
                       bio: bio,
                       isAdmin : 0
                   }).then(function(newUser){
                     // L'ajout a fonctionner, on retourne alors l'id du nouvel user 
                    return res.status(201).json({'userid' : newUser.id})
                })
                    // Erreur l'ajout n'a pas fonctionner
                .catch(function(err){
                    return res.status(400).json({'error' : 'cannot add user'});
                });
                       
                });
            }else {
                // Erreur utilisateur deja existant
                return res.status(400).json({'error' : 'user already exists'});

            }
            })
            .catch(function(err){
                return res.status(400).json({'error' : 'NOT WORKING'});
            });
        },

        login: function(req,res) {
            // Récupération des paramètres
            var email = req.body.email;
            var password = req.body.password;

             // Condition et verification des paramètres


            if (email == null || password ==null){
                return res.status(400).json({'error' : 'missing parameters'});

            }

            // On vérifie si le user existe déja en bdd dans l'attribut email si on a deja cet email en BDD sans attribut pour selectionner tout les attributs de l'utilisateur

            models.User.findOne({
                where: {email : email}
            })
            .then(function(userFound){
              // Si l'utilisateur existe alors
                if (userFound) {
                    // On compare si le user a entré le mdp
                    bcrypt.compare(password, userFound.password, function(errBcrypt, resBcrypt){
                      // Si oui, on retourne le user et le token
                        if(resBcrypt){
                            return res.status(200).json({
                                'userId' : userFound.id,
                                'token' : jwtUtils.generateTokenForUser(userFound)
                            });
                        } else {
                        // Si non, je retourne une erreur
                            return res.status(403).json({'error' : 'invalid password'})
                        }
                    });

                } else {
              return res.status(404).json({'error' : 'user not exist in DB'});

                }

            })
            .catch(function(err){

                // La vérification de l'utilisateur n'a pas pu s'effectuer

                return res.status(500).json({'error' : 'unable to verify user'});

            });

    },
    // Fonction permettant de récuperer le profil User
    getUserProfile: function(req, res){
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0){
            return res.status(400).json({'error': 'wrong token'});
            
        }
        // Permet de rechercher une seule entité en récupérant les attributs qui nous intéresse excepté le mdp ! Attention fail de sécurité
        models.User.findOne({
            attributes : ['id', 'email' ,'username', 'bio'],
            where: {id : userId}
        }).then(function(user){
            if(user){
                return res.status(201).json(user);
            } else {
                res.status(404).json({'error' : 'user not found '});
            }
        }).catch(function(err){
            res.status(500).json({'error' : 'cannot fetch user'});
        });

    },
    updateUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
    
        // Params
        var bio = req.body.bio;

        // Mise en place du waterfall 
        asyncLib.waterfall([
          function(done) {
            models.User.findOne({
              attributes: ['id', 'bio'],
              where: { id: userId }
            }).then(function (userFound) {
              // done est une fonction callback. Lorsque que le premier argument est set sur null pour signifier que l'on souhaite passer a la fonction suivante. 
              done(null, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to verify user' });
            });
          },
          // Le done nous renvoie ici si tout se passe bien
          function(userFound, done) {
            if(userFound) {
              // Utilisation de la méthode Update utiliser sur l'objet récupérer via le findOne
              userFound.update({
                // Utilisation d'une ternaire : la bio sera toujours rempli que ce soit via la nouvelle ou l'ancienne
                bio: (bio ? bio : userFound.bio)
              }).then(function() {
                done(userFound); // Je renvoie ici la variable qui m'interesse et je n'ajoute pas null car j'ai fini le waterfall 
              }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot update user' });
              });
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
          },
        ], function(userFound) {
          // Je vérifie si UserFound est valide si oui code 2O1
          if (userFound) {
            return res.status(201).json(userFound);
          } else {
            return res.status(500).json({ 'error': 'cannot update user profile' });
          }
        });
      }
    }
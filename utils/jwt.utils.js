// Imports 
var jwt = require('jsonwebtoken');

// Signature de notre TOKEN ! Cette clé doit rester exclusivement sur notre server, question de sécurité

const JWT_SIGN_SECRET = 'ze3koh3higyv6n54nkig4n35fjgo3n';

// Exported functions
module.exports = {
    generateTokenForUser: function(userData){
        // On retourne ma méthode sign qui va nous permettre de signer notre TOKEN 
        return jwt.sign({
            // A l'intérieur du TOKEN on met les informations qui nous interesse , ATTENTION jamais d'information confidentiel dans un token car facilement décelable
            userId : userData.id,
            isAdmin: userData.isAdmin
        },
        // Ajout d'un nouveau paramètre : la signature
        JWT_SIGN_SECRET,
        // Renseigner nouvelle option
        {
            expiresIn: '1h'
        })
    },
    parseAuthorization: function (authorization){
        // Verification si l'autorisation n'est pas nul, ensuite on eneleve bearer (norme W3C) afin de n'obtenir que le TOKEN 
        return (authorization != null) ? authorization.replace('Bearer ', '' ) : null;
    },
    getUserId : function(authorization){
        var userId = -1; // Cela n'existe pas et permet de s'assurer que l'on ne fasse pas de mauvaise requete 
        var token = module.exports.parseAuthorization(authorization);// Utilisation du parseAuthorization
        if(token != null){
            try{
                // Si le token est valide alors
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET); // Verification validation TOKEN : 2 params : verifier le token et sa signature
                if(jwtToken != null)
                    userId = jwtToken.userId; // On recupere les informations qui nous intéresse
                } 
                // Sinon on genere une erreur
                catch(err){ }
            }
        return userId;
        res.cookie('Authorization', jwtToken);
        res.send('ok');

    
    }
}
/*
RESTFUL service by NodeJS
Author: Choukri Abdellah
Update: 23/04/20
*/


var crypto= require('crypto');
var uuid = require('uuid');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

//Connect to MySQL
var connexion = mysql.createConnection({
    //host:'http://192.168.0.3/schoolPlusDataBase',
    host:'localhost',
    user:'root',
    password:'',
    database:'SchoolPlus2'
});

var getRandomString= function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex')
    .slice(0,length);
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return{
        salt: salt,
        passwordHash: value
    }
};


function saltHashPassword(userPassword){
    var salt= getRandomString(16);
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}
 function checkHashPassword(userPassword, salt){
     var passwordData = sha512(userPassword, salt);
     return passwordData;

 }
 function getCours(typeCours){
    let path = 'ressources/cours/' +typeCours+'.json';
    console.log("   ## "+ path);
    let rawdata = fs.readFileSync(path);
    return JSON.parse(rawdata);
};
var app=express();
app.use(bodyParser.json());// Json Params
app.use(bodyParser.urlencoded({extended: true}));


app.post('/register/', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    
    var plaint_password = post_data.password;
    var HashData=saltHashPassword( plaint_password);
    var password = HashData.passwordHash;
    var salt= HashData.salt;
    var name = post_data.name;
    var email = post_data.email;
    var niveauScolaire = post_data.niveauScolaire;
    var anneeScolaireDebut= post_data.anneeScolaireDebut;
    var anneeScolaireFin  = post_data.anneeScolaireFin;
    var facebook = post_data.facebook;
    var google = post_data.google;
    var twitter= post_data.twitter;
    var username=post_data.username;
    var adresse=post_data.adresse;
    var urlphoto=post_data.urlphoto;
    var offre=post_data.offre;
    var formule=post_data.formule;
    var modePaiement=post_data.modePaiement;
    
    var now = new Date();
    var annee   = now.getFullYear();
    var mois    = now.getMonth()+1;
    var jour    = ('0'+now.getDate()   ).slice(-2);
    var heure   = ('0'+now.getHours()  ).slice(-2);
    var minute  = ('0'+now.getMinutes()).slice(-2);
    var seconde = ('0'+now.getSeconds()).slice(-2);
 
    var DatesInscription =jour+"/"+mois+"/"+annee+" à "+heure+":"+minute+":"+seconde;

    connexion.query('SELECT * FROM Eleve where email=?', [email], function(err, result, fields){
        connexion.on('error', function(err){
            console.log('MySql ERROR :', err);
        });
    //console.log(result.)
    if(result && result.length){
        res.status(404).json('User already exists !!!');
    }
    else{
       connexion.query('INSERT INTO Eleve ( nom , username, email, niveauScolaire, anneeScolaire_debut, anneeSccolaire_fin, facebook, google, twitter, adresse, urlPhoto, password, cle_cryptage,offre,formule, modePaiement, dateInscription) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [name,username,email, niveauScolaire,anneeScolaireDebut,
            anneeScolaireFin, facebook,google,twitter
            , adresse, urlphoto,password, salt,offre, formule, modePaiement, DatesInscription],  function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            });
            res.status(200).json('Register successful ');
         })
       
    }
    
});

})

app.post('/registerParent/', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var code = post_data.code;
    var email = post_data.email;
    var plaint_password = post_data.password;
    var HashData=saltHashPassword( plaint_password);
    var password = HashData.passwordHash;
    var salt= HashData.salt;
    var name = post_data.name;
    var email = post_data.email;

    var now = new Date();
    var annee   = now.getFullYear();
    var mois    = now.getMonth()+1;
    var jour    = ('0'+now.getDate()   ).slice(-2);
    var heure   = ('0'+now.getHours()  ).slice(-2);
    var minute  = ('0'+now.getMinutes()).slice(-2);
    var seconde = ('0'+now.getSeconds()).slice(-2);
 
    var DatesInscription =jour+"/"+mois+"/"+annee+" à "+heure+":"+minute+":"+seconde;
    var username=post_data.username;
    var adresse=post_data.adresse;
    var urlphoto=post_data.urlphoto;
    
       
    
    connexion.query('SELECT * FROM Eleve where email=?', [email], function(err, result, fields){
        connexion.on('error', function(err){
            console.log('MySql ERROR :', err);
        });
    //console.log(result.)
    if(result && result.length){
        res.status(404).json('User already exists !!!');
    }
    else{
        var a = connexion.query('INSERT INTO Parent (nom,username,email,password,cle_cryptage,urlphoto,adresse,dateInscription) VALUES (?,?,?,?,?,?,?,?)',
        [name,username,email,password,salt,urlphoto, adresse, DatesInscription],  function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            });
            res.status(200).json('Register successful ');
            
         })
        }
  
});
})

app.post('/registerCode/', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var code = post_data.code;
    var email = post_data.email;
    console.log("Register Code")
       connexion.query('INSERT INTO confirmationCode ( email, code) VALUES (?,?)',
        [email, code],  function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            });
            res.status(200).json('Register successful ');
         })
  
});


app.post('/RelationParentEnfant/', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var emailEnfant = post_data.emailEnfant;
    var emailParent = post_data.emailParent;
    console.log("Register RelationParentEnfant")
       connexion.query('INSERT INTO RelationParentEnfant ( emailParent, emailEnfant) VALUES (?,?)',
        [emailParent,emailEnfant],  function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            });
            res.status(200).json('Register successful ');
         })
  
});


app.post('/registerScore/', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var score = post_data.score;
    var email = post_data.email;
    var cat = post_data.categorie;
    console.log("teste : "+ cat)
       connexion.query('INSERT INTO scoreQuizz ( emailUser, categorie, score) VALUES (?,?,?)',
        [email, cat,score],  function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            });
            res.status(200).json('Register successful ');
         })
  
});

app.get('/questions/:categorie', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var categorie= req.params.categorie
    
       connexion.query('select * from question where categorie= ?', [categorie], function(err, result, fields){
            connexion.on('error', function(err){
                console.log('INSERT ERROR :', err);
                res.status(404).json('Register Error', err);
            }); 
            res.status(200).send(result);
         })
  
});

app.get('/ressources/:typeCours', (req,res,next)=>{
    var post_data= req.body; // get Post params
    var uid = uuid.v4();
    var cours= req.params.typeCours
    console.error("cours =  "+ cours);
    var result = getCours(cours) ;
    res.status(200).send(result)
});


app.get('/getCodeEleve/:emailUser', (req,res,next)=>{
    var email= req.params.emailUser; // get email 
    var uid = uuid.v4();
    console.log("GET ELEVE: email récupéré : "+ email)

    var sql = 'select * from confirmationCode where email= ? order by id desc '; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
      
    if(result && result.length){
        
        res.status(200).json(result[0]);
    }
    else{
        res.status(404).json('User not exists !!!');
    }
    
});

})


app.get('/getEnfants/:emailParent', (req,res,next)=>{
    var email= req.params.emailParent; // get email 
    var uid = uuid.v4();
    console.log("GET enfants: email récupéré : "+ email)

    var sql = 'select Eleve.ID, nom, username, email, niveauScolaire, anneeScolaire_debut, anneeSccolaire_fin, facebook, google, twitter, adresse, urlPhoto, password, cle_cryptage, offre, formule, modePaiement, dateInscription from RelationParentEnfant, Eleve where emailParent=? and email=emailEnfant'; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
      
    if(result && result.length){
        
        res.status(200).json(result);
    }
    else{
        res.status(404).json('User not exists !!!');
    }
    
});

})



app.post('/loginEleve',(req,res,next)=>{
    var post_data = req.body; 
    // extract email and pass word
    var email = post_data.email;
    var password = post_data.password;
    console.log("Email reçu pour login : " + email);
    console.log("password recu pour login : "+ password)
    var sql = 'select * from Eleve where  email= ?'; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
   
       if(result && result.length){
           var salt = result[0].cle_cryptage;
           var encrypted_password = result[0].password;
           var hashed_password = checkHashPassword(password, salt).passwordHash;
           if(encrypted_password == hashed_password){
               const objToSend = {
                   name: result[0].nom,
                   email: result[0].email
               }
               
               res.status(200).json(result[0]);
           }
           else{
               const objToSend = {
                   name : 'Mot de passee incorrecte'+ hashed_password,
                   email : 'Mot de passee incorrecte'
                   
               }
               console.log("Erreur 404 mot de passe incorrecte")
               res.status(404).send()
           }
       
   }
      
   
   
   });
   
   })


   app.post('/loginParent',(req,res,next)=>{
    var post_data = req.body; 
    // extract email and pass word
    var email = post_data.email;
    var password = post_data.password;
    console.log("Email reçu pour login : " + email);
    console.log("password recu pour login : "+ password)
    var sql = 'select * from Parent where  email= ?'; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
   
       if(result && result.length){
           var salt = result[0].cle_cryptage;
           var encrypted_password = result[0].password;
           var hashed_password = checkHashPassword(password, salt).passwordHash;
           if(encrypted_password == hashed_password){
               const objToSend = {
                   name: result[0].nom,
                   email: result[0].email
               }
               
               res.status(200).json(result[0]);
           }
           else{
               const objToSend = {
                   name : 'Mot de passee incorrecte' ,
                   email : 'Mot de passee incorrecte'
                   
               }
               console.log("Erreur 404 mot de passe incorrecte")
               res.status(404).send()
           }
       
   }
      
   
   
   });
   
   })



app.get('/getEleve/:emailUser', (req,res,next)=>{
    var email= req.params.emailUser; // get email 
    var uid = uuid.v4();
    console.log("GETELEVE: email récupéré : "+ email)

    var sql = 'select * from Eleve where  email= ?'; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
      
    if(result && result.length){
        
        res.status(200).json(result[0]);
    }
    else{
        res.status(404).json('User not exists !!!');
    }
    
});

})

app.get('/getParent/:emailUser', (req,res,next)=>{
    var email= req.params.emailUser; // get email 
    var uid = uuid.v4();
    console.log("GET Parent : email récupéré : "+ email)

    var sql = 'select * from Parent where  email= ?'; 
    connexion.query(sql, [email], function(err, result, fields){
       connexion.on('error', function(err){
           console.log('MySql ERROR :', err);
       });
      
    if(result && result.length){
        
        res.status(200).json(result[0]);
    }
    else{
        res.status(404).json('User not exists !!!');
    }
    
});

})



// Start the server on port 3000
app.listen(3000, ()=>{   
    console.log('Restful running on port 3000');
    var now = new Date();
 
var annee   = now.getFullYear();
var mois    = now.getMonth()+1;
var jour    = ('0'+now.getDate()   ).slice(-2);
var heure   = ('0'+now.getHours()  ).slice(-2);
var minute  = ('0'+now.getMinutes()).slice(-2);
var seconde = ('0'+now.getSeconds()).slice(-2);


var DatesInscription =jour+"/"+mois+"/"+annee+" à "+heure+":"+minute+":"+seconde;
console.log(DatesInscription);
});



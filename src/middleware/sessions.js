const { uniqueNamesGenerator, adjectives, colors, countries, animals } = require('unique-names-generator');
module.exports = (req, res, next) => {
    if(!req.session.userID){
        req.session.userID = 'userID' + makeid(9);
    }

    if(!req.session.pseudo){
        const randomName = uniqueNamesGenerator({ 
            dictionaries: [adjectives, animals, countries],
            length: 2,
            separator: ' ',
            style: 'capital'
        });
        req.session.pseudo = 'Dr. ' + randomName;
    }
    next();
}

makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
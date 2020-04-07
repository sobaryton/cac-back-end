module.exports = (req, res, next) => {
    console.log('req.session.userID ', req.session.userID)
    if(!req.session.userID){
        req.session.userID = 'userID' + makeid(9);
    }
    console.log('userId',req.session.userID);
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
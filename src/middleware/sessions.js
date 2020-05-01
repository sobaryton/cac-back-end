const { uniqueNamesGenerator, adjectives, colors, countries, animals } = require('unique-names-generator');
module.exports = (req, res, next) => {
    if(!req.session.userID){
        req.session.userID = 'userID' + makeid(9);
    }

    if(!req.session.pseudo){

        //try Adjective + Animal
        const randomName1 = uniqueNamesGenerator({ 
            dictionaries: [adjectives, animals, countries],
            length: 2,
            separator: ' ',
            style: 'capital'
        });

        //Try Color + Animal
        const randomName2 = uniqueNamesGenerator({ 
            dictionaries: [colors, animals, countries],
            length: 2,
            separator: ' ',
            style: 'capital'
        });

        //Take the one smaller
        let name = [randomName1, randomName2].sort((a,b) => a.length - b.length)[0];
        let title = chooseTitle(titles);
        req.session.pseudo = title + ' ' + name;
    }
    
    next();
}

const titles = [
    'Dr.',
    'Doc.',
    'Prof.',
    'Mr.',
    'Miss',
    'Mrs.',
    'Sir',
    'Lord',
    'Lady'
];

makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

chooseTitle = (array) => {
    return shuffle(array)[0];
}

shuffle = (arr) => {
    var i,
        j,
        temp;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;    
};
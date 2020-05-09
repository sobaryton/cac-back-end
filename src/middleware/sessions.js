const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator');

module.exports = (req, res, next) => {
  if (!req.session.userID) {
    req.session.userID = 'userID' + makeid(9);
  }

  if (!req.session.pseudo) {
    const titles = [
      'Dr.',
      'Doc.',
      'Prof.',
      'Mr.',
      'Miss',
      'Mrs.',
      'Sir',
      'Lord',
      'Lady',
    ];

    // try Adjective + Animal
    const randomName1 = uniqueNamesGenerator({
      dictionaries: [titles, adjectives, animals],
      length: 3,
      separator: ' ',
      style: 'capital',
    });

    // Try Color + Animal
    const randomName2 = uniqueNamesGenerator({
      dictionaries: [titles, colors, animals],
      length: 3,
      separator: ' ',
      style: 'capital',
    });

    // Take the one smaller
    const name = [randomName1, randomName2]
      .sort((a, b) => a.length - b.length)[0];
    req.session.pseudo = name;
  }

  next();
};


makeid = (length) => {
  let result = '';
  const characters
    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

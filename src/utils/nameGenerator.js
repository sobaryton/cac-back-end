const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator');

const generateRandomName = () => {
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
  return [randomName1, randomName2].sort((a, b) => a.length - b.length)[0];
};

module.exports = generateRandomName;

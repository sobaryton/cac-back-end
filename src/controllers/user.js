exports.getUserId = (req, res, next) => {
  res.status(200).json({
    userId: req.session.userID,
    pseudo: req.session.pseudo,
  });
};

exports.updatePseudo = (req, res, next) => {
  const newP = req.body.pseudo;
  if (newP.length < 20) {
    req.session.pseudo = newP;
    res.status(200).json({
      userId: req.session.userID,
      pseudo: newP,
    });
  } else {
    return res.status(400).json({
      error: 'Pseudo too long, should be under 20 characters',
    });
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy( () => {
    // cannot access session here
    res.clearCookie('CACoro').status(200).json({
      message: 'Cookie destroyed, successfull logout',
    });
  });
};

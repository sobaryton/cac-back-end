exports.getUserId = (req, res, next) => {
  res.status(200).json({
    userId: req.user._id,
    pseudo: req.user.pseudo,
    token: req.user.token,
  });
};

exports.updatePseudo = (req, res, next) => {
  const newP = req.body.pseudo;
  if (newP.length < 20) {
    req.user.pseudo = newP;
    res.status(200).json({
      userId: req.user._id,
      pseudo: newP,
      token: req.user.token,
    });
  } else {
    return res.status(400).json({
      error: 'Pseudo too long, should be under 20 characters',
    });
  }
};

// TODO: Delme.
exports.logout = (req, res, next) => {
  req.session.destroy( () => {
    // cannot access session here
    res.clearCookie('CACoro').status(200).json({
      message: 'Cookie destroyed, successfull logout',
    });
  });
};

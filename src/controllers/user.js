exports.getUserId = (req, res, next) => {
  res.status(200).json({
    userId: req.user._id,
    pseudo: req.user.pseudo,
    token: req.user.token,
  });
};

exports.updatePseudo = async (req, res, next) => {
  const newPseudo = req.body.pseudo;
  if (newPseudo.length < 20) {
    req.user.pseudo = newPseudo;
    await req.user.save();

    res.status(200).json({
      userId: req.user._id,
      pseudo: newPseudo,
      token: req.user.token,
    });
  } else {
    return res.status(400).json({
      error: 'Pseudo too long, should be under 20 characters',
    });
  }
};

exports.handle404BadPath = (err, req, res, next) => {
    console.log(err)
    const message = {msg:"Invalid path"};
    res.status(404).send(message)
  };
  
const {selectTopics} = require("../models/model.js");

exports.getAllTopics = (req,res,next)=>{
    selectTopics().then((topics)=>{
        res.status(200).send({topics})
    })
    .catch((err)=>{
        next(err)
    })
}
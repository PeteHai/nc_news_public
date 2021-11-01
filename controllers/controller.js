const {selectTopics} = require("../models/model.js");

exports.getAllTopics = (req,res,next)=>{
    selectTopics().then((topics)=>{
        res.status(200).send({topics})
    })
    .catch((err)=>{
        console.log(err)
        next(err) // changed this and now failing first test?
    })
}
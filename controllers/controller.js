const {selectTopics,selectArticleID} = require("../models/model.js");

exports.getAllTopics = (req,res,next)=>{
    selectTopics().then((topics)=>{
        res.status(200).send({topics})
    })
    .catch((err)=>{
        next(err) 
    })
}

exports.getArticleID = (req,res,next)=>{
    selectArticleID(req.params.article_id)
    .then((rows)=>{
        console.log(rows, "rows from controller")
        res.status(200).send({rows})
    })
    .catch((err)=>{
        next(err)
    })
}
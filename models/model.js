const db = require("../db/connection.js");

exports.selectTopics = () =>{
    const queryStr = `SELECT * FROM topics;`

    return db.query(queryStr)
    .then(({rows})=>{
        return rows
    })

}

exports.selectArticleID = (id) =>{
    console.log(id,"in the model")
    return db.query('SELECT * FROM articles WHERE article_id = $1;',[id])
    .then (({rows})=>{
        console.log(rows," rows from model")
        return rows[0]
    })
}
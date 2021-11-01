const db = require("../db/connection.js");

exports.selectTopics = () =>{
    const queryStr = `SELECT * FROM topics;`

    return db.query(queryStr)
    .then(({rows})=>{
        return rows
    })

}
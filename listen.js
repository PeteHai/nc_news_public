const { PORT = 9090 } = process.env;

const express = require("express");
const app = express();
app.use(express.json());

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
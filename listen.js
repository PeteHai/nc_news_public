const { PORT = 9090 } = process.env;
const app = require("./app.js");

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
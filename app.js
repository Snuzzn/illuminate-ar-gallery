const express = require("express");
const app = express();
const path = require("path");
const port = 3000;

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.use(express.static("public"));
app.listen(port, () => console.log(`Application listening on port ${port}!`));

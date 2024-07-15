const express = require('express');
const app = express();

const PORT = process.env.PORT || 8182;

app.get("/", function(req, res) {
  res.send({
    status: 200,
    data: "hello!"
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行端口： ${PORT}.`);
});
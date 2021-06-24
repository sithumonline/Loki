const fetch = require("node-fetch");
const parser = require("xml2json");
const express = require("express");
var s = { "Last Sync": 0 };

function lastSync() {
  var currentDate = new Date();
  var dateTime = {
    "Last Sync":
      currentDate.getDate() +
      "/" +
      (currentDate.getMonth() + 1) +
      "/" +
      currentDate.getFullYear() +
      " @ " +
      currentDate.getHours() +
      ":" +
      currentDate.getMinutes() +
      ":" +
      currentDate.getSeconds(),
  };
  return dateTime;
}

async function checkLoki() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const response = await fetch("https://eztv.re/ezrss.xml", requestOptions)
    .then((response) => {
      console.log("eztv status : ", response.status);
      return response.text();
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return error;
    });

  const f = JSON.parse(parser.toJson(response)).rss.channel.item.find((e) =>
    e.title.toLowerCase().search("loki")
  );

  s = lastSync();

  return f;
}

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/api/v1/loki", (req, res) => {
  return res.json(s);
});

app.post("/api/v1/loki", async (req, res) => {
  const x = await checkLoki();
  if (!x) {
    res.sendStatus(404);
  }
  return res.json(x);
});

app.listen(3000, () => console.log("[Loki] Webhook is listening"));

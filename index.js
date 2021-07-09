const fetch = require("node-fetch");
const parser = require("xml2json");
const express = require("express");
var s = { "Last Sync": 0 };

function lastSync() {
  var currentDate = new Date();
  var dateTime = {
    "Last Sync": `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}@${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`,
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

  if (response.length < 75) {
    console.log("eztv resp : ", response);
    return;
  }

  const f = JSON.parse(parser.toJson(response)).rss.channel.item.find((e) =>
    e.title.toLowerCase().includes("loki")
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

async function loop() {
  const hURL = process.env.HOOK;

  const x = await checkLoki();
  if (!x) {
    return;
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Loki Bot",
      avatar_url:
        "https://i.gadgets360cdn.com/large/loki_tom_hiddleston_crop_1622797154582.jpg?downsize=950:*&output-quality=80",
      content: `Title: ${x.title} \n Link : ${x.link}`,
    }),
  };

  const response = await fetch(hURL, requestOptions)
    .then((response) => {
      console.log("disocrd status : ", response.status);
      return response.text();
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return error;
    });

  return response;
}

async function wakeup() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch("https://loki-bot.herokuapp.com/api/v1/loki", requestOptions)
    .then((response) => {
      console.log("heroku status : ", response.status);
      return response.text();
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return error;
    });
}

setInterval(loop, 300000);
setInterval(wakeup, 1620000);

app.listen(process.env.PORT || 3000, () =>
  console.log("[Loki] Webhook is listening")
);

const fs = require("fs");
const webPush = require("web-push");
const express = require("express");
const http = require("http");

const CONFIG_FILE_PATH = "./config.json"; // FILE FOR STORE VAPID KEYS ONCE
const GLOBAL_PORT = 1200; // PORT OF EXPRESS SERVER

let config = {}; // VARIABLE FOR STORE WEB PUSH KEYS

try {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    const buffer = fs.readFileSync(CONFIG_FILE_PATH);
    config = JSON.parse(buffer);
  } else {
    config = webPush.generateVAPIDKeys();
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
  }
} catch (ex) {
  console.log(ex);
}

webPush.setVapidDetails(
  "https://nicolasgimenez.com/",
  config.publicKey,
  config.privateKey
);

const app = express();
const server = http.Server(app);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/vapidPublicKey", (_, res) => {
  res.send(config.publicKey);
});

app.post("/sendNotification", async (req, res) => {
  const { subscription, payload, options } = req.body;
  try {
    await webPush.sendNotification(subscription, payload, options);
    res.sendStatus(201);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(500);
  }
});
// app.use(cors());
// routes(app);
// app.use((err, req, res) => {
//   log.error(err.stack);
//   res.status(500).send("Something broke!");
// });
// stream(server); // FOR STREAMING

server.listen(GLOBAL_PORT, () =>
  console.log(`The server started in the port: ${GLOBAL_PORT}`)
);
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");
const express = require("express");
const webServerConfig = require("../config/web-server.js");
const buildAvatars = require("../db_apis/buildAvatars");
const buildBaseData = require("../db_apis/buildBaseData");
const buildExceptions = require("../db_apis/buildExceptions");
const buildChildCounts = require("../db_apis/buildChildCounts");
const router = require("./router.js");
//const cors = require("cors");
const fs = require("fs");
const schedule = require("node-schedule");
let httpServer;

function shutdown(signal) {
  return (err) => {
    console.log(`Received ${signal}...`);
    if (err) {
      console.log("Writing Error Stack.....");
      console.log(err.stack || err);
    }
    setTimeout(() => {
      console.log("...waited 5s, exiting.");
      process.exit(err ? 1 : 0);
    }, 5000).unref();
  };
}

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static(__dirname + "/pics"));
    //app.use(express.static(__dirname + "../client"));
    // app.use(cors());
    console.log("SSL:" + webServerConfig.SSL);
    process
      .on("SIGTERM", shutdown("SIGTERM"))
      .on("SIGINT", shutdown("SIGINT"))
      .on("uncaughtException", shutdown("uncaughtException"));

    if (webServerConfig.SSL == "true") {
      const options = {
        key: fs.readFileSync("./private.key"),
        cert: fs.readFileSync("./certificate.crt"),
        ciphers: [
          "TLS_AES_128_GCM_SHA256",
          "TLS_AES_256_GCM_SHA384",
          "TLS_CHACHA20_POLY1305_SHA256",
          "ECDHE-ECDSA-AES128-GCM-SHA256",
          "ECDHE-RSA-AES128-GCM-SHA256",
          "ECDHE-ECDSA-AES256-GCM-SHA384",
          "ECDHE-RSA-AES256-GCM-SHA384",
          "ECDHE-ECDSA-CHACHA20-POLY1305",
          "ECDHE-RSA-CHACHA20-POLY1305",
          "!aNULL",
          "!eNULL",
          "!EXPORT",
          "!DES",
          "!RC4",
          "!MD5",
          "!PSK",
          "!SRP",
          "!CAMELLIA",
          "!CBC",
        ].join(":"),
      };

      httpServer = https.createServer(options, app);
    } else {
      httpServer = http.createServer(app);
    }
     const job = schedule.scheduleJob("2 * * *", function () {
      console.log("Running at:" + new Date());
      //buildAvatars.create_avatars();
      buildBaseData.create_base_data_file();
      buildExceptions.create_exceptions_file();
      buildChildCounts.create_child_counts_file();
    });
    app.use("/api", router);
    httpServer.listen(webServerConfig.port, webServerConfig.host, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(
        `Web server listening on ${webServerConfig.host}:${webServerConfig.port}`
      );

      resolve();
    });
  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;

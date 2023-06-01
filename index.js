const express = require("express");
const app = express();

// TODO: create a Redis client
const Redis = require("ioredis");
const client = new Redis();

// Serve static files from public directory
app.use(express.static("public"));

// Initialize values for: header, left, right, article, and footer using the Redis client
client.hmset("data", "header", 0, "left", 0, "article", 0, "right", 0, "footer", 0, (err, reply) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Initial values set in Redis.");
  }
});

// Get values for holy grail layout
function getData() {
  return new Promise((resolve, reject) => {
    client.hgetall("data", (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Update key-value pair
app.put("/update/:key/:value", (req, res) => {
  const { key, value } = req.params;

  client.hset("data", key, value, (err, reply) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error updating value in Redis.");
    } else {
      res.send("Value updated in Redis.");
    }
  });
});

// Get key data
app.get("/data", function (req, res) {
  getData()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from Redis.");
    });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("SIGINT", function () {
  client.quit(() => {
    console.log("Redis connection closed.");
    process.exit();
  });
});

const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const video = require("./routers/video");
const cluster = require("cluster");
const ytdl = require("ytdl-core");
const fs = require("fs");

let workers = [];

const PORT = process.env.PORT;
const app = express();
const port = PORT || 3000;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173"
  }
});

app.use(function (req, res, next) {
  console.log(req.headers.host);
  console.log(req.socket.remoteAddress);

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,x-requested-width, Authorization,  Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
  next();
});

var corsOptions = {
  origin: ["http://localhost:5173" ,"http://localhost:4200","*"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(video);


io.on('connection', (socket) => {   // it was app.listen before

  //   socket.emit('message', generateMessage("Admin","Welcome ")) // send to this particular connecton
  socket.on("download",async ({url,title, destination}, callback) => {
    try {
      console.log(destination);
      const fileLocation = destination + `/`+title+`.mp4`; //     const fileLocation = `./files/${uuid}.mp4`;
  
      await new Promise((resolve) => {
        ytdl(url)
          .on("progress", (length, downloaded, totalLength) => {

            const progress = (downloaded / totalLength) * 100;
            socket.emit("progress",progress);
          })
          .pipe(fs.createWriteStream(fileLocation))
          .on("finish", () => {
            socket.emit("done");

            resolve();
          });
      });

    } catch (error) {
      console.log(error);
    }
  })
  
 
})




const setupWorkerProcesses = () => {
  // to read number of cores on system
  let numCores = require("os").cpus().length;
  console.log("Master cluster setting up " + numCores + " workers");

  // iterate on number of cores need to be utilized by an application
  // current example will utilize all of them
  for (let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    workers.push(cluster.fork());

    // to receive messages from worker process
    workers[i].on("message", function (message) {
      console.log(message);
    });
  }

  // process is clustered on a core and process id is assigned
  cluster.on("online", function (worker) {
    //  console.log('Worker ' + worker.process.pid + ' is listening');
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " died with code: " +
        code +
        ", and signal: " +
        signal
    );
    console.log("Starting a new worker");
    cluster.fork();
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[workers.length - 1].on("message", function (message) {
      //   console.log(message);
    });
  });
};
const startServer = () => {
  server.listen(port, () => {
    //  console.log('Server is up on port ' + port);
  });
};

// if it is a master process then call setting up worker process
if (cluster.isMaster) {
  setupWorkerProcesses();
} else {
  // to setup server configurations and share port address for incoming requests
  startServer();
}
module.exports = app;

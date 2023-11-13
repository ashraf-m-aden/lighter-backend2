const express = require("express");
const router = new express.Router();
const fs = require("fs");
const ytdl = require("ytdl-core");

router.post("/videoInfo", async (req, res) => {
  // nouvel utilisateur
  try {
    url = req.body.url;
    returnedStream = await ytdl.getInfo(url);
    return res.status(200).send({ data: returnedStream });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/download", async (req, res) => {
  // nouvel utilisateur
  try {
    url = req.body.url;
    console.log(url);
    const fileLocation = `test.mp4`; //     const fileLocation = `./files/${uuid}.mp4`;

    await new Promise((resolve) => {
      io.emit("download");
      ytdl(url)
        .on("progress", (length, downloaded, totalLength) => {

          const progress = (downloaded / totalLength) * 100;
          io.emit("progress",progress);

          // if(progress >= 100) {
          //   global.io.emit('videoDone', {fileLocation: `${uuid}.mp4`, jobId: data.id});
          //   global.io.emit('progress', {progress: 100, jobId: data.id});
          // }
        })
        .pipe(fs.createWriteStream(fileLocation))
        .on("finish", () => {
          io.emit("done");

          resolve();
        });
    });
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;

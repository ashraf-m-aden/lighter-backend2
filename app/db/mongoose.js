const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("mongoose connected successfuly");
  })
  .catch((error) => {
    console.log(error);
    console.log("mongoose not connected");
  });

module.exports = mongoose;

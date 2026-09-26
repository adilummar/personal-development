const mongoose = require("mongoose");

async function testConnection() {
  try {
    const directUri = "mongodb://theadmin:h17aIz5GsQDIpm2d@ac-vbp2v2k-shard-00-00.kbsb78x.mongodb.net:27017,ac-vbp2v2k-shard-00-01.kbsb78x.mongodb.net:27017,ac-vbp2v2k-shard-00-02.kbsb78x.mongodb.net:27017/aethel?ssl=true&replicaSet=atlas-tr77kq-shard-0&authSource=admin&retryWrites=true&w=majority";
    console.log("Connecting direct");
    await mongoose.connect(directUri);
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

testConnection();

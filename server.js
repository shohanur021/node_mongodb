const http = require("node:http");
const fs = require("fs");


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const localURI = "mongodb://localhost:27017";

const client = new MongoClient(localURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();
 
    const database = client.db("acc");
    const postCollection = database.collection('posts'); 
   
    const server = http.createServer( async (req, res) => {

        const parseURL = new URL(req.url, `http://${req.headers.host}`);
        const pathName = parseURL.pathname;
    
      
        if(pathName==='/create-post' && req.method==='POST'){
            let body = "";
            req.on("data", (buffer) => {
                body += buffer.toString();
            });

            req.on("end", async () => {
                const postData = JSON.parse(body);
                const result = await postCollection.insertOne(postData);
                res.setHeader("Content-type","application/json");
                res.statusCode=200;
                res.end(JSON.stringify({ message: "post created succesfully !", data: result}));
            });
        }
        else if(pathName.startsWith("/update-post") && req.method==='PATCH'){
          const postId = pathName.split("/")[2];
          let body = "";
            req.on("data", (buffer) => {
                body += buffer.toString();
            });

            req.on("end", async () => {
                const updatedData = JSON.parse(body);
                const result = await postCollection.updateOne({_id: new ObjectId(postId)},{$set: updatedData});
                res.setHeader("Content-type","application/json");
                res.statusCode=200;
                res.end(JSON.stringify({ message: "post updated succesfully !", data: result}));
            });

        }
        else if(pathName.startsWith("/delete-post") && req.method==='DELETE'){
          const postId = pathName.split("/")[2];
          const result = await postCollection.deleteOne({_id: new ObjectId(postId)});
          res.setHeader("Content-type","application/json");
          res.statusCode=200;
          res.end(JSON.stringify({ message: "post deleted succesfully !", data: result}));
        }
        else {
            res.end("Not Found");
        }
     
    })
    
    server.listen(5000, '127.0.0.1', () => {
        console.log("port 5000 is listening");
    })
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);



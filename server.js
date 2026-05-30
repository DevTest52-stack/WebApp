const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000
const path = require("path");

// app.use(express.json());  cant use express.json because req.body is strictly a string rather than an object
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' ,limit: '5kb'})); 

// const arr=[];

//frontend Static page
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.post('/api/',(req,res)=>{
    try{
        if(typeof req.body !== 'string' || !req.body.trim()){
            return res.status(400).send("Body not found");
        }
        const raw_data = req.body.trim();
      
        const arrData=raw_data.split(";");

        if (arrData.length < 5) {
            return res.status(400).send("Invalid body data format");
        }
        const data={
            "id":arrData[0],
            "temp":arrData[1],
            "hum":arrData[2],
            "amb":arrData[3],
            "volt":arrData[4],
            "timeStamp":Date.now()
        }
        console.log("received:",data)

        io.emit('sensor-data',data);
        return res.send("Got a post response")
    }catch(err){
        console.log("Server error",err);
        res.status(500).send("Internal Server Error")
    }
})

server.listen(port, ()=>{
    console.log(`Server running on Port:${port}`);
})


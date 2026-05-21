const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000
const path = require("path");

// app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' })); 

const arr=[];

//frontend Static page
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.post('/api/',(req,res)=>{
    // console.log(req)
    console.log(req.body)
    const raw_data=req.body;
    if(raw_data==null){
        return res.send("body not found")
    }
    const arrData=raw_data.split(";");
    arrData.push(Date.now());
    const data={
        "id":arrData[0],
        "temp":arrData[1],
        "hum":arrData[2],
        "amb":arrData[3],
        "volt":arrData[4],
        "timeStamp":arrData[5]
    }
    console.log("received:",data)
    // const {data}=req.body;
    // console.log(data);
    arr.push(data);  
    
    io.emit('sensor-data',data);

    return res.send("Got a post response data:")
})


server.listen(port, ()=>{
    console.log(`Server running on Port:${port}`);
})


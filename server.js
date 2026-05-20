const WebSocket = require('ws')
const express = require('express')
const http = require('http')
const app = express()
const port = 3000

const arr=[];

// app.use(express.json());
app.use(express.text({ type: '*/*' })); 

app.post('/',(req,res)=>{
    // console.log(req)
    //console.log(req.body)
    const {data}=req.body;
    // console.log(data);
    // arr.push(data);  
    res.send("Got a post response data:")
    //res.send(`Got a post response data: ${data}`);
})

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

// wss.on('connection', ws => {
//     console.log('Client connected');

//     // Handle messages from the client (e.g., from the Qt app)
//     ws.on('message', message => {
//         let messageData=message.toString();
//         let messageDataParts=messageData.split(",")
//         let timeStamp=messageDataParts[0]
//         let lat=messageDataParts[1]
//         let lng=messageDataParts[2]
//         //console.log(`Received message: ${message}`);
//         console.log(`${lat},${lng},${Date(timeStamp)}`)

//         // Send a response back to the client
//         ws.send(`${message}`);
//         //send to all clients 
//         wss.clients.forEach(client => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(`${message}`);
//             }
//         });
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });

//     // Send data periodically to simulate location updates
//     // const interval = setInterval(() => {
//     //     // const latitude = Math.random() * 180 - 90;
//     //     // const longitude = Math.random() * 360 - 180;
//     //     lat=parseFloat(lat+0.0001)
//     //     lng=parseFloat(lng+0.0001)
//     //     const data = `${lat.toFixed(4)},${lng.toFixed(4)}`;
//     //     ws.send(data);
//     // }, 2000);

//     ws.on('close', () => {
//         //clearInterval(interval); // Stop sending data when client disconnects
//         console.log('socket closed')
//     });
// });

server.listen(port, ()=>{
    console.log(`Server running on Port:${port}`);
})


const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const {DatabaseSync} = require('node:sqlite');

const app = express();
const server = createServer(app);

const io = new Server(server);

//Use For development
// const io = new Server(server,{
//   cors: {
//     origin: "*", // Allows connections from any origin
//     methods: ["GET", "POST"]
//   }
// });

const port = 3000
const path = require("path");

const db = new DatabaseSync("db.sql");

// app.use(express.json());  cant use express.json because req.body is strictly a string rather than an object
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' ,limit: '5kb'})); 

//Use For development
// app.use(cors())

//Db
db.exec(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    ambient REAL NOT NULL,
    voltage REAL NOT NULL,
    current REAL NOT NULL,
    kwatt REAL NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
`);

// create new 
const insert = db.prepare('INSERT INTO metrics (device_id, timestamp, temperature, humidity, ambient, voltage, current, kwatt ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
// Seed Mock Data (Runs only if the table is completely fresh)
// const rowCheck = db.prepare('SELECT COUNT(*) as count FROM metrics').get();
// if (rowCheck.count === 0) {
//   console.log('Seeding initial metric rows...');


//frontend Static page
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});



io.on('connection', (socket) => {
  //console.log('a user connected');
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
        const timestamp = Date.now(); 
        const isoString = new Date(timestamp).toISOString();
        const data={
            "id":arrData[0],
            "temp":arrData[1],
            "hum":arrData[2],
            "amb":arrData[3],
            "volt":arrData[4],
            "current":arrData[5],
            "kwatt":arrData[6],
            "timeStamp":isoString
        }
        insert.run(data.id, data.timeStamp, data.temp, data.hum, data.amb,data.volt,data.current,data.kwatt);
        //console.log("received:",data)

        io.emit('sensor-data',data);
        return res.send("Got a post response")
    }catch(err){
        console.log("Server error",err);
        res.status(500).send("Internal Server Error")
    }
})

// Time Range Filtering API Endpoint
// Expects ISO 8601 strings, e.g., ?start=2026-06-03T10:00:00Z&end=2026-06-03T12:00:00Z
app.get('/api/metrics', (req,res) => {
  const { duration } = req.query;
  // Simple validation block
  if (!duration) {
    return res.status(400).json({ 
      success:true,
      error: "Missing required query parameters: 'duration' must be provided." 
    }); 
  }                                                   

  const timeStamp=Date.now();
  const msoffset=duration*60*60*1000;
  const startTimeStamp=timeStamp-msoffset;
  const endTimeStr=new Date(timeStamp).toISOString();
  const startTimeStr=new Date(startTimeStamp).toISOString();

  try {
    // Prepare the SQL query matching bounds sequentially
    const query = db.prepare(`
      SELECT device_id, timestamp, temperature, humidity, ambient, voltage, current, kwatt
      FROM metrics 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `);

    // Fetch all elements within constraints
    const data = query.all(startTimeStr, endTimeStr);

    return res.json({
      success:true,
      count: data.length,
      range: { startTimeStr, endTimeStr },
      data: data
    });

  } catch (error) {
    console.error("Database Query Error:", error);
    return res.status(500).json({ success:false,error: "Internal Server Error occurred while querying data." });
  }
});

app.get('/api/single',(req,res)=>{
  try{
    const query = db.prepare(`
      SELECT device_id, timestamp, temperature, humidity, ambient, voltage, current, kwatt
      FROM metrics 
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    const data= query.get();
    if (!data) {
      return res.status(404).json({ 
        success: false,
        message: "No metrics found in the database" 
      });
    }
    const dataPack={
        "id":data.device_id,
        "temp":data.temperature,
        "hum":data.humidity,
        "amb":data.ambient,
        "volt":data.voltage,
        "current":data.current,
        "kwatt":data.kwatt,
        "timeStamp":data.timestamp
      }
    return res.json({
      success:true,data:dataPack
    })
  }catch(error){
    console.error("Database Query Error:", error);
    return res.status(500).json({ success:false,error: "Internal Server Error occurred while querying data." });
  }  
})

server.listen(port, ()=>{
    console.log(`Server running on Port:${port}`);
})


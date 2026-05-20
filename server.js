const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.post('/',(req,res)=>{
    // console.log("request hit")
    const {data}=req.body;
    // console.log(req.body);
    console.log(data);
    res.send("Got a post response");
})

app.listen(port, ()=>{
    console.log(`Server running on Port:${port}`)
})



//start pm2 server
pm2 start server.js --name "iot-api" --node-args="--max-old-space-size=250" --max-memory-restart 300M

//saving the config
pm2 save

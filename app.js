const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

//Init vonage
const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "fafccaeb",
  apiSecret: "pDh6BP0yeaYz40DZ"
})

// Init app
const app = express();

//set template engine
app.set('view engine','html');
app.engine('html',ejs.renderFile);

//pubic folder setup
app.use(express.static(__dirname + '/public'));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//index route
app.get('/',(req,res)=>{
    res.render('index');
})

//catch form submit
app.post('/',(req,res)=>{
    // res.send(req.body);
    // console.log(req.body);
    const from ="Vonage APIs"
    const to = req.body.number;
    const text = req.body.text;

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            // if(responseData.messages[0]['status'] === "0") {
            //     console.log("Message sent successfully.");
            // } else {
            //     console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            // }
            const { messages } = responseData;
            const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
            console.dir(responseData);
            // Get data from response
            const data = {
              id,
              number,
              error
            };
    
            // Emit to the client
            io.emit('smsStatus', data);
        }
    })
})

//define port 
const port=3000;

//start server
const server = app.listen(port,()=>{
   console.log( `server started at port ${port}`)
})

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});
const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: "pratheerthk@gmail.com",
    pass: "mlqsxylyfnulzahx",
  },
  secure: true,
});

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    io.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

app.post("/send-mail", (req, res) => {
  const to = req.body.to;
  const url = req.body.url;
  const maildata = {
    from: "pratheerthk@gmail.com",
    to: to,
    subject: "Join the video chat with me at 5pm",
    html: `<p>Hi dev Come and join the video meeting here --${url}</p>`,
  };
  transporter.sendMail(maildata, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res
      .status(200)
      .send({ message: "Invitation Sent", message_id: info.messageId });
  });
});

const port = process.env.PORT || 3030
app.listen(port,()=>{
  console.log("Opening a video on port 3030")
})
// server.listen(process.env.PORT || 3030);

// mlqsxylyfnulzahx

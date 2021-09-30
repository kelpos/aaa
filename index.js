const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {
    Server
} = require("socket.io");
const io = new Server(server);
const fs = require("fs");
const csv = require("csv");
const e = require("express");

app.use(express.static("fonts"));
app.use(express.static("images"));
app.use(express.static("a"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/../index.html");
});

var statusBox;

io.on("connection", (socket) => {
    fs.createReadStream("./date.csv").pipe(
        csv.parse({
            columns: false
        }, (err, data) => {
            for (var i = data.length - 1; i >= 1; i--) {
                io.to(socket.id).emit(
                    "read-date",
                    data[i][0],
                    data[i][1],
                    data[i][2],
                );
            }
        })
    );

    socket.on("set date", (year, month, day) => {
        socket.roomname = year + "_" + month + "_" + day;

        socket.join(socket.roomname);

        io.to(socket.roomname).emit("print orders", socket.roomname);
    });


    socket.on("set box status", (number_status) => {
        statusBox = number_status;



    });
    socket.on("import box status", () => {
        if (statusBox != null) {
            var saveWord = socket.roomname;
            for (var i = 0; i <= 19; i++) {
                saveWord += "," + statusBox[i][1];


            }
            fs.appendFile(
                "./status.csv",
                saveWord + "\r\n",
                function (err) {
                    if (err) throw err;
                }
            );
        }


    });
    socket.on("set status", (dateForCsv) => {
        fs.createReadStream("./status.csv").pipe(
            csv.parse({
                columns: false
            }, (err, data) => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i][0] == dateForCsv) {
                        var tempArr = []
                        for (var j = 1; j <= 19; j++) {
                            tempArr.push(data[i][j]);
                        }
                    }
                }
                io.to(socket.id).emit(
                    "set check",
                    tempArr,
                );
            })
        );
    });

    socket.on("add new date", (nowYr, nowMth, nowD) => {
        fs.appendFile(
            "./date.csv",
            nowYr + "," + nowMth + "," + nowD + "\r\n",
            function (err) {
                if (err) throw err;
            }
        );
    });

});

server.listen(process.env.PORT, () => {
    console.log("listening on *:3000");
});

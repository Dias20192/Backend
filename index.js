const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const SECRET = "sadfdsdsfdjsnghsigmababytuffhoneyfdsd";

// 📁 file database
const FILE = "db.json";

// create file if missing
if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({
        leaderboard1: [],
        leaderboard2: [],
        leaderboard3: [],
        leaderboard4: []
    }, null, 2));
}

// read
function readDB() {
    return JSON.parse(fs.readFileSync(FILE));
}

// write
function writeDB(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🔒 security
app.use((req, res, next) => {
    if (req.headers["x-secret"] !== SECRET) {
        return res.sendStatus(403);
    }
    next();
});

// 📥 update
function updateBoard(name, req, res) {
    const db = readDB();
    db[name] = req.body.leaderboard || [];
    writeDB(db);
    res.sendStatus(200);
}

app.post("/update-leaderboard1", (req, res) => updateBoard("leaderboard1", req, res));
app.post("/update-leaderboard2", (req, res) => updateBoard("leaderboard2", req, res));
app.post("/update-leaderboard3", (req, res) => updateBoard("leaderboard3", req, res));
app.post("/update-leaderboard4", (req, res) => updateBoard("leaderboard4", req, res));

// 🌐 website
app.get("/", (req, res) => {
    const db = readDB();

    const makeList = (title, data) => {
        let html = `<h2>${title}</h2><ol>`;
        for (let p of data) {
            html += `<li>${p.username} - ${p.score} ${p.unit}</li>`;
        }
        html += "</ol>";
        return html;
    };

    res.send(`
        <html>
        <body style="background:#111;color:white;font-family:Arial;padding:20px;">
            <h1>Leaderboards</h1>
            ${makeList("Total Kills", db.leaderboard1)}
            ${makeList("Monthly Kills", db.leaderboard2)}
            ${makeList("Monthly Donations", db.leaderboard3)}
            ${makeList("Total Donations", db.leaderboard4)}
        </body>
        </html>
    `);
});

// ❤️ health check
app.get("/health", (req, res) => {
    res.send("ok");
});

// 🚀 IMPORTANT FIX (Railway port)
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
    console.log("Running on port " + PORT);
});

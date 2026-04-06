const express = require("express");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
app.use(express.json());

const SECRET = "sadfdsdsfdjsnghsigmababytuffhoneyfdsd";

// 💾 setup database (FIXED)
const adapter = new JSONFile("db.json");

const defaultData = {
    leaderboard1: [],
    leaderboard2: [],
    leaderboard3: [],
    leaderboard4: []
};

const db = new Low(adapter, defaultData);

async function initDB() {
    await db.read();
    db.data ||= defaultData;
    await db.write();
}
initDB();

// 🔒 security
app.use((req, res, next) => {
    if (req.headers["x-secret"] !== SECRET) {
        return res.sendStatus(403);
    }
    next();
});

// 📥 update function
async function updateBoard(name, req, res) {
    await db.read();
    db.data[name] = req.body.leaderboard || [];
    await db.write();
    console.log(name + " updated");
    res.sendStatus(200);
}

// 📥 endpoints
app.post("/update-leaderboard1", (req, res) => updateBoard("leaderboard1", req, res));
app.post("/update-leaderboard2", (req, res) => updateBoard("leaderboard2", req, res));
app.post("/update-leaderboard3", (req, res) => updateBoard("leaderboard3", req, res));
app.post("/update-leaderboard4", (req, res) => updateBoard("leaderboard4", req, res));

// 🌐 website
app.get("/", async (req, res) => {
    await db.read();

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
        <head>
            <title>Leaderboards</title>
            <style>
                body { font-family: Arial; background: #111; color: white; padding: 20px; }
                h1 { color: #00ffcc; }
                h2 { margin-top: 30px; }
                li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>🔥 Game Leaderboards</h1>
            ${makeList("Total Kills", db.data.leaderboard1)}
            ${makeList("Monthly Kills", db.data.leaderboard2)}
            ${makeList("Monthly Donations", db.data.leaderboard3)}
            ${makeList("Total Donations", db.data.leaderboard4)}
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("user/home", { title: "Wheelz - Home" });
});


app.get("/signin", (req, res) => {
    res.render("user/signin");
});

app.get("/signup", (req, res) => {
    res.render("user/register");
});

app.get("/otp", (req, res) => {
    res.render("user/otp");
});

app.get("/forgot-password", (req, res) => {
    res.render("user/forgot-password");
});

app.get("/new-password", (req, res) => {
    res.render("user/new-password");
});

app.get("/shop", (req, res) => {
    res.render("user/shop");
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

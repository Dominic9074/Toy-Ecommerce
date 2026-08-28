import express from "express"
import path from "path"
import 'dotenv/config'
import { fileURLToPath } from 'url';
import userRoute from './src/routes/user.js'
import connectDB from "./src/config/db.js";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import passport from "./src/config/passport.js";
import adminRoute from './src/routes/admin.js'
import nocache from "nocache";
import jarvisRoute from "./src/routes/jarvis.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app=express()
const PORT=process.env.PORT;


// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//layout 
app.use(expressLayouts);
app.set("layout", "layout/layout.ejs");

// Static files
app.use(express.static(path.join(__dirname, "public")));


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    secure:false,
    httpOnly:true,
    maxAge:24*60*60*1000
  }
}))
app.use(nocache())

app.use(passport.initialize())
app.use(passport.session())

//global
app.use((req, res, next) => {
  res.locals.error = null;
  res.locals.success = null;
  res.locals.webhookUrl = process.env.N8N_WEBHOOK_URL;
  next();
});

app.use((req,res,next)=>{
  res.locals.user=req.session.user||null;
  next();
})

app.use((req, res, next) => {
    res.locals.isAdminPage = req.path.startsWith("/admin");
    next();
});



// routes
app.use('/', userRoute);
app.use('/', adminRoute);
app.use("/", jarvisRoute);

app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).send(`
    <h1>Something went wrong</h1>
    <p>${err.message || "Internal Server Error"}</p>
  `);
});

//db connect
connectDB();

// Start server
app.listen(PORT,() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app=express();
const port=3000;
env.config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect();

let blogs=[];

app.get("/",async(req,res)=>{
    //console.log(req.body);
    const result=await db.query("SELECT * FROM blog");
    blogs=result.rows;
    res.render("index.ejs",{
        blogs:blogs,
    });
});

app.get("/new",(req,res)=>{
    res.render("new.ejs");
});
  
app.post("/submit",async(req,res)=>{
    const input=req.body;
    console.log(input);
    if(input.request=="new"){
        const result=await db.query("INSERT INTO blog (title,information,author,type) VALUES($1,$2,$3,$4)",
    [input.title,input.info,input.author,input.type]);
    }
    else{
        const result=await db.query("UPDATE blog SET title=$1,information=$2,author=$3,type=$4 WHERE id=$5",
        [input.title,input.info,input.author,input.type,input.request]
        )
    }
    res.redirect("/");
});

app.post("/detail",async(req,res)=>{
    const id=req.body.detailItemId;
    const result= await db.query("SELECT * FROM blog WHERE id=$1",
    [id]);
    //console.log(result.rows[0]);
    res.render("blog.ejs",{
        item:result.rows[0],
    })
});

app.post("/edit",async(req,res)=>{
    const id=req.body.editItemId;
    const result= await db.query("SELECT * FROM blog WHERE id=$1",
    [id]);
    //console.log(result.rows[0]);
    res.render("new.ejs",{
        item:result.rows[0],
    })
});


app.post("/delete",async(req,res)=>{
    const id=req.body.deleteItemId;
    const result= await db.query("DELETE FROM blog WHERE id=$1",
    [id]);
    res.redirect("/");
});

app.get("/sort",async(req,res)=>{
    const result=await db.query("SELECT * FROM blog ORDER BY title ");
    blogs=result.rows;
    res.render("index.ejs",{
        blogs:blogs,
    });
})

// app.post("/submit",(req,res)=>{
//     title.push(req.body.title);
//     info.push(req.body.info);
//     res.render("index.ejs",{title:title,
//     info:info});
// })

app.listen(port,()=>console.log(`Server is running on port ${port} `));
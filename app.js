const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const hbs = require('hbs');
const path = require('path');
port = process.env.PORTS || 3000;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const multer = require('multer');
const knex = require('./model/connectionDb');
const sequelize = require('./model/Dbconnection');
const User = require('./data/user');
const Book = require('./data/book');

//database with sequelize ORM

sequelize.sync().then(()=>console.log('connected'))
.catch(err=>console.log(err));

//body parser
app.use(bodyparser.json());
app.use(express.urlencoded({extended:false}));

//path declaration
const staticPath = path.join('__dirname',"../public");
app.use(express.static(staticPath));

//initializing session
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());


//views engine
app.set('view engine','hbs');
app.set('views','./views');

const router = require('./router/router');
const { application } = require('express');
const async = require('hbs/lib/async');
app.use(router);

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/insert',isAuthenticate,(req,res)=>{
    res.render('insert');
});

app.get('/login',(req,res)=>{
    res.render('login');
    console.log("The user is on login page");
})

//file upload with multer module
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

var upload = multer({storage:storage});

//book post
app.post('/insert',upload.single('blogimage'),async(req,res)=>{
    var name = req.body.name;
    var sold = req.body.sold;
    var image = req.file.filename;
    const dat = {name,sold,image};
    // const insert_data = ( { name,sold,image } = req.body);
    console.log(name);
    console.log(sold);
    console.log(image);
    const data = await Book.create(dat);
    if(data){
        console.log('data inserted',data);
        res.redirect('/list');

    }
    else{
        console.log('there is some error');
    }
});

//read operation

app.get('/list',isAuthenticate,async(req,res)=>{
    try{
        const data = await Book.findAll();
        res.render('datalist',{list:data});
    }
    catch(err){
        console.log(err);
    }
})

//update operation


app.get('/list/edit/:id',isAuthenticate,async(req,res)=>{
    const id = req.params.id;
    const qeury = { id };
    try{
        const data = await Book.findOne({where:{id:id}});
        console.log(data.name);
        res.render('update',{
            name: data.name,
            sold:data.sold,
            image: data.image,
            ide: id
        })
        console.log(data);
    }
    catch(err){
        console.log(err);
    }



})
//update post operation

app.post('/list/edit/:id',upload.single('blogimage'),async(req,res)=>{
    const id = req.params.id;
    const query = { id };
    try{
        const data = await Book.findOne({where:{id:id}});
        const img = data.image;
        console.log(img);
        const name  = req.body.name;
        const sold = req.body.sold;
        const image = (req.file == null) ? img : req.file.filename;
        const update_data = { name , sold , image };
        const update_query = await Book.update(update_data,{where:{id:id}});
        if(update_query){
            console.log('data updated',update_query);
            res.redirect('/list');
        } 
        else{
            console.log('there is some error');
        }
    }
    catch(err){
        console.log(err);
    }

})

//delete operation

app.get('/list/delete/:id',isAuthenticate,async(req,res)=>{
    const id = req.params.id;
    try{
        const data = await Book.destroy({where:{id:id}});
        if(data){
            console.log('data deleted',data);
            res.redirect('/list');
        }
        else{
            console.log('there is some error');
        }
    }
    catch(err){
        console.log(err);
    }
})

passport.use(new LocalStrategy(
    function(username, password, done) {
        const dat = { username }
        // const quer = "select username,password from user where username='"+username+"'";
        knex('user').select('username','password').where({username}).asCallback(function (err, user) {
            console.log(user[0]);
        if (err) { return done(err) }
        if (!user) { return done(null, false,{message:"Incorrect Username."}); }
        var passwords = user[0].password;
        console.log(passwords);
        if (passwords!=password) { return done(null, false,{message:"Incorrect Password."}); }
        if(!user || passwords!=password) {return done(null,false,{message:"The userid and passsword is incorrect"})}
        console.log(user);
        return done(null, user);
      });
    }
));
// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         const dat = username ;
//         console.log(username);
//         // const quer = "select username,password from user where username='"+username+"'";
//          User.findOne({where:{username:username}}).then((err, user)=> {
//         if (err) { return done(err) }
//         if (!user) { return done(null, false,{message:"Incorrect Username."}); }
//         var passwords = user.password;
//         console.log(passwords);
//         if (passwords!=password) { return done(null, false,{message:"Incorrect Password."}); }
//         if(!user || passwords!=password) {return done(null,false,{message:"The userid and passsword is incorrect"})}
//         return done(null, user);
//       }).catch(err=>console.log(err));
//     }
// ));

//serializeUser and deserialize
passport.serializeUser((user,done)=>{
    if(user){
        return done(null,user[0].username);
    }
    return done(null,false);
});


passport.deserializeUser((username,done)=>{
    const sel = "select * from user where username='"+username+"'";
    knex('user').select().where({username}).asCallback((err,user)=>{
        if(err) return done(null,false);
        return done(null,user);
    })
});

//logout feature
app.get('/logout',(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('you are logged out');
        }
    });
    res.redirect('/login');
})

//authentication check
function isAuthenticate(req,res,done){
    console.log(req.user);
    if(req.user){
        return done();
    }
    else{
        res.redirect('/login');
        console.log("Invalid user");
    }
}

//registration of user
app.get('/register',(req,res)=>{
    res.render('registration');
})


app.post('/register',async(req,res)=>{
    const da = req.body.username;
    const user = await User.findOne({where:{username:da}});
    if(user ==  null){
        const data_insert = await User.create(req.body);
        if(data_insert){
            console.log('user signed up',data_insert);
            res.redirect('/login');
        }
        else{
            console.log('error happened');
        }
    }
    else{
        res.redirect('/login');
    }
});


//authenticate
app.post('/login', 
  passport.authenticate('local',{ failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/insert');
  });


app.listen(port,()=>console.log(`The server running on the port ${port}`));
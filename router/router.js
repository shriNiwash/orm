const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const async = require('hbs/lib/async');
const knex = require('../model/connectionDb');
const User = require('../data/user');
const Book = require('../data/book');
const sequelize = require('../model/Dbconnection');


//body parser
router.use(bodyparser.json());
router.use(express.urlencoded({extended:false}));



router.post('/books',async(req,res)=>{
    try{
        const data = await Book.create(req.body);
        res.json(data);
        console.log('one row inserted');
    }
    catch(err){
        console.log(err);
    }
})

router.get('/books/list',async(req,res)=>{
    try{
        const data = await Book.findAll();
        console.log('data sent');
        res.json(data);
    }
    catch(err){
        console.log(err);
    }
})   

router.get('/books/list/:id',(req,res)=>{
    const id = req.params.id;
        Book.findOne({where:{id:id}}).then((err,data)=>{
            if(err){
                throw err;
            }
            else{
                res.json(data);
                console.log(data);
            }
        }).catch(err=>console.log(err));

})   


router.patch('/books/list/:id',async(req,res)=>{
    const id = req.params.id;
    const {name,sold,image} = req.body;
    console.log(name,sold,image);
    console.log('hi there');
    try{
        const data = await Book.update(req.body,{where:{id:id}});
        if(data){
            console.log('updated',data);
        }
        else{
            console.log('there is some errro');
        }
        res.send('updated');

    }
    catch(err){
        console.log(err);
    }
})


router.delete('/books/list/:id',async(req,res)=>{
    const id = req.params.id;
    try{
        const del = await Book.destroy({where:{id:id}});
        res.send('deleted');
        console.log('deleted');
    }
    catch(err){
        console.log(err);
    }
})


router.get('/total-sales',async(req,res)=>{
    try{
        const data = await knex('book_inventory').sum('sold as total');
        console.log(data);
        res.json(data);
    }
    catch(err){
        console.log(err)
    }
})

// router.get('/total-sales',async(req,res)=>{
//     try{
//         const data = Book.findAll({  	
//             attributes: ['id',[sequelize.fn('sum', sequelize.col('sold')), 'total']],
//             group : ["id"],
//             raw: true,
//         });
//         res.json(data);
//         console.log('data sent');
//     }
//     catch(err){
//         console.log(err);
//     }
// })



module.exports = router;
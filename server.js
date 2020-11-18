'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home', mainfunction);
app.post('/house_name/characters', addHouse);
app.get('/characters', showResult);
app.get('/my-characters/:id', showSpecificRes);
app.put('/character/character/:id', updateResult);
app.delete('/character/character/:id', deleteResult);


// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------
function mainfunction(req,res) {
    let url='https://hp-api.herokuapp.com/';
    superagent.get(url).then(result =>{
        let house = result.body.map(item=>{
            return new House(item);
        })
        res.render('home-page', {houseKey : house })
    })
}

// cons: 
function House (info){
    this.charName= info.name;
    this.charHouse= info.house;
}


function addHouse(req,res){
    let charName = req.body;
    let charHouse = req.body;

    let SQL= 'INSERT INTO harryP VALUES ($1, $2); ';
    let value = [charName, charHouse];

    client.query(SQL, value).then(()=>{
        res.redirect('/characters');
    })
}


function showResult(req,res){
    let SQL= 'SELECT * FROM harryP;';
    let value = [charName, charHouse];

    client.query(SQL).then(result =>{
        res.render('fav-page', ({favResult : result.rows}))

    })
}

function showSpecificRes(req,res){
    let id= req.params.id;
    let SQL = `SELECT * FROM harryP WHERE id=${id};`; 
    
    client.query(SQL).then(result=>{
        res.render('fav-page', ({favResult : result.rows}) );
    })

}
// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------

/////The delete and the update: 
function updateResult(req,res){
    let id = req.params.id;

    let charName= req.body;
    let charHouse= req.body;

    let SQL = `UPDATE harryP SET $1, $2 WHERE id=${id};`;
    let value= [charName, charHouse];

    client.query(SQL , value).then(result=>{
        res.render('detail-page', ({favResult : result.rows}))
    }) 
}


function deleteResult(req,res){
    let id = req.params.id;

    let SQL =`DELETEFROM harryP WHERE id=${id};`;

    client.render(SQL).then('detail-page', ({favResult : result.rows}))
}




// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));

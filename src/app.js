const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cytoscape = require('cytoscape');
// const cors = require('cors');


// for fcose
const fcose = require('cytoscape-fcose');
cytoscape.use( fcose );

// for cose-bilkent
const coseBilkent = require('cytoscape-cose-bilkent');
cytoscape.use( coseBilkent );

// for cise layout, Needs to be fixed, some problems
//////////////////////////////////
// const cise = require('cytoscape-cise');
// cytoscape.use( cise );

// for dagre layout
const dagre = require('cytoscape-dagre');
cytoscape.use( dagre );

// for klay layout
const klay = require('cytoscape-klay');
cytoscape.use( klay );

// TODO test layouts below
// for avsdf layout
const avsdf = require('cytoscape-avsdf');
cytoscape.use( avsdf );

// cola layout
const cola = require('cytoscape-cola');
cytoscape.use( cola );

// euler layout
const euler = require('cytoscape-euler');
cytoscape.use( euler );

// spread layout
var spread = require('cytoscape-spread');
cytoscape.use( spread );

let cy;
app.use(express.json());
// app.use(cors);

console.log( "Listening on" + port );

app.get('/', (req, res) => {
    return res.send("Welcome to the web-service");
});

app.post( '/layout', (req, res) => {
    
    const data = req.body[0];
    const options = req.body[1];

    if( options.name === "cose-bilkent" || options.name === "cose" || options.name === "fcose" ){
        cy = cytoscape({
            styleEnabled: false,
            headless: true
        });
    }
    else{
        cy = cytoscape({
            headless: true
        })
    }

    let eles = cy.add(data); 

    try{
        cy.layout(options).run();
    }
    catch( e ){
        return res.status(500).send( e + "" );
    }

    let ret = {};

    cy.filter( (element, i) => {
        return element.isNode();
    }).forEach( (node) => {
        ret[node.id()] = node.position();
    });

    return res.status(200).send( ret );
});
app.listen(port);
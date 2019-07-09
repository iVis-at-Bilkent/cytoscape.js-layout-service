const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cytoscape = require('cytoscape');

// to serve the html
const path = require( "path" );
// app.set( "view engine", any );

// to support sbgnml type of input
let convert = require('sbgnml-to-cytoscape');

// for graphml
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

const graphml = require('cytoscape-graphml');
cytoscape.use(graphml, $);


// for fcose
const fcose = require('cytoscape-fcose');
cytoscape.use(fcose);

// for cose-bilkent
const coseBilkent = require('cytoscape-cose-bilkent');
cytoscape.use(coseBilkent);

// for cise layout, Needs to be fixed, some problems
const cise = require('cytoscape-cise');
cytoscape.use( cise );

// for dagre layout
const dagre = require('cytoscape-dagre');
cytoscape.use(dagre);

// for klay layout
const klay = require('cytoscape-klay');
cytoscape.use(klay);

// TODO test layouts below
// for avsdf layout
const avsdf = require('cytoscape-avsdf');
cytoscape.use(avsdf);

// cola layout
const cola = require('cytoscape-cola');
cytoscape.use(cola);

// euler layout
const euler = require('cytoscape-euler');
cytoscape.use(euler);

// spread layout
const spread = require('cytoscape-spread');
cytoscape.use(spread);

let cy;
let options;
let data;
let body;

app.use( express.static( path.join( __dirname, "../public" ) ) );

// middleware to manage the formats of files
app.use((req, res, next) => {
    if (req.method === "POST") {
        body = '';
        isJson = false;
        options = '';
        data = '';

        req.on('data', chunk => {
            body += chunk;
        })

        req.on('end', () => {
            for (id = 0; id < body.length && body[id] != '{'; id++);
            options = body.substring(id);
            data = body.substring(0, id);

            let foundSBGN = body.includes("sbgn");
            let foundGML = body.includes("graphml");
            let isJson = !(foundGML || foundSBGN);

            if (isJson) {
                body = JSON.parse(body);
                data = body[0];
                options = body[1];
            }
            else {
                options = JSON.parse(options);
                if (foundSBGN) { // sbgnml
                    data = convert(data);
                }
            }
            next();
        })
    }
    else
        next();
})
// whether to include edges in the output or not
// POST /layout/:format?edges=true 
app.post('/layout/:format', (req, res) => {
    options.animate = false;

    if (options.name === "cose-bilkent" || options.name === "cose" || options.name === "fcose") {
        cy = cytoscape({
            styleEnabled: false,
            headless: true
        });
    }
    else {
        cy = cytoscape({
            headless: true
        })
    }

    if (req.params.format === "graphml") {
        cy.graphml(data);
        cy.layout(options).run();
    }
    else {
        cy.add(data);

        try {
            cy.layout(options).run();
        }
        catch (e) {
            return res.status(500).send(e);
        }
    }

    let ret = {};

    // whether to return edges or not
    if(req.query.edges){
        // can be updated

        cy.filter((element, i) => {
            return true;
        }).forEach((ele) => {
            if(ele.isNode())
                ret[ele.id()] = ele.position();
            else{
                ret[ele.id()] = ele.data();
                // delete the id field to not repeat it both in the object name and the field
                delete ret[ele.id()].id;
            }
        });

    }
    else{
        cy.filter((element, i) => {
            return element.isNode();
        }).forEach((node) => {
            ret[node.id()] = node.position();
        });
    
    }

    return res.status(200).send(ret);
});

app.get('/', (req, res) => {
    res.sendFile( path.join( __dirname + '/../public_html/index.html' ) );
});

app.listen(port, () => {
    console.log("Listening on " + port);
});
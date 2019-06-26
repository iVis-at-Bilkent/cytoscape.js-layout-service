const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cytoscape = require('cytoscape');


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
//////////////////////////////////
// const cise = require('cytoscape-cise');
// cytoscape.use( cise );

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
var spread = require('cytoscape-spread');
cytoscape.use(spread);

let cy;
let options;
let data;
let body = '';

// middleware to manage the formats of files
app.use((req, res, next) => {
    body = '';
    options = '';
    data = '';

    req.on('data', chunk => {
        body += chunk;
    })

    req.on('end', () => {
        // let format = req.path.replace("/layout/", "");
        for (id = 0; id < body.length && body[id] != '{'; id++); let format = req.path.replace("/layout/", "");
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
            if (foundSBGN)
                data = convert(data);
        }
        next();
    })

})

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

    cy.filter((element, i) => {
        return element.isNode();
    }).forEach((node) => {
        ret[node.id()] = node.position();
    });

    return res.status(200).send(ret);
});

app.get('/', (req, res) => {
    return res.status(200).send("Welcome to the web-service");
});

app.listen(port, () => {
    console.log("Listening on " + port);
});
var graph = {};
var edgeNodes = [];
let cytoscapeJsGraph;
let graphGlob;
let styleForGraphs;
heroku = false;

var setFileContent = function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
};

$(function () {
    let convertIt, url;

    // to make the ajax async, there should be a better way.
    function readFile() {
        $.ajaxSetup({
            async: false
        });
        jQuery.get("samples/sample17-simple-json-non-uniform-dimension.txt", (txt) => {
            convertIt = txt;
        });
        $.ajaxSetup({
            async: true
        })
    }
    readFile();

    let isGraphML = (convertIt.search("graphml") === -1) ? 0 : 1;
    let isSBGNML = (convertIt.search("sbgn") === -1) ? 0 : 1;

    if (!heroku) {
        if (isGraphML)
            url = "http://localhost:" + port + "/layout/graphml?edges=true";
        else if (isSBGNML)
            url = "http://localhost:" + port + "/layout/sbgnml?edges=true"
        else
            url = "http://localhost:" + port + "/layout/json?edges=true"
    }
    else {
        if (isGraphML)
            url = "https://cytoscape-layout-service.herokuapp.com/layout/graphml?edges=true";
        else if (isSBGNML)
            url = "https://cytoscape-layout-service.herokuapp.com/layout/sbgnml?edges=true"
        else
            url = "https://cytoscape-layout-service.herokuapp.com/layout/json?edges=true"
    }

    var options = { name: "preset" };
    let graphData = convertIt;

    let data;
    if (!isGraphML && !isSBGNML) {
        data = [JSON.parse(graphData), options];
        data = JSON.stringify(data);
    }
    else
        data = graphData + JSON.stringify(options);

    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'content-Type': 'text/plain',
        },
        body: data
    };

    // post request to the server to layout the graph
    fetch(url, settings)
        .then(response => response.json())
        .then(res => {
            let els = [];
            let addIt;
            els['nodes'] = [];
            els['edges'] = [];
            Object.keys(res).forEach((obj) => {
                if (res[obj].source && res[obj].target) {
                    addIt = {
                        data: {
                            id: obj,
                            source: res[obj].source,
                            target: res[obj].target
                        }
                    }
                    els['edges'].push(addIt);
                }
                else {
                    addIt = {
                        data: {
                            id: obj,
                            clusterID: res[obj].data.clusterID,
                            width: res[obj].data.width,
                            height: res[obj].data.height,
                            parent: res[obj].data.parent
                        },
                        position: {
                            x: res[obj].position.x,
                            y: res[obj].position.y
                        }
                    }
                    els['nodes'].push(addIt);
                }
            });

            cytoscapeJsGraph = els;
            refreshCytoscape(els);
            setFileContent("sample17-simple-json-non-uniform-dimension.txt");

            var panProps = ({
                zoomFactor: 0.05, // zoom factor per zoom tick
                zoomDelay: 45, // how many ms between zoom ticks
                minZoom: 0.1, // min zoom level
                maxZoom: 10, // max zoom level
                fitPadding: 50, // padding when fitting
                panSpeed: 10, // how many ms in between pan ticks
                panDistance: 10, // max pan distance per tick
                panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
                panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
                panInactiveArea: 3, // radius of inactive area in pan drag box
                panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
                autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)
                sliderHandleIcon: 'fa fa-minus',
                zoomInIcon: 'fa fa-plus',
                zoomOutIcon: 'fa fa-minus',
                resetIcon: 'fa fa-expand'
            });
            cy.panzoom(panProps);
            graphGlob = els;
        })
        .catch(e => {
            return e
        });

});

$("#cose-bilkent").css("background-color", "grey");

// random color generator for different colors;
// src: https://stackoverflow.com/questions/1484506/random-color-generator
let getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function refreshCytoscape(graphData) { // on dom ready
    graphGlob = graphData;
    cytoscapeJsGraph = graphData;

    styleForGraphs = [
        {
            selector: 'node',
            style: {
                'content': 'data(name)',
                'text-valign': 'center',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#888',
                'shape': 'rectangle'
            },
        },
        {
            selector: 'node:selected',
            style: {
                'background-color': 'cyan',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black',
                'text-outline-color': 'black',
                'border-color': 'cyan',
                'border-width': 5
            }
        },
        {
            selector: ':parent',
            style: {
                'background-opacity': 0.333,
                'text-valign': "bottom"
            }
        },
        {
            selector: 'edge',
            style: {
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'red',
                'source-arrow-color': 'black',
                'text-outline-color': 'black',
                'curve-style': "bezier"
            }
        },
        {
            selector: 'edge:selected',
            style: {
                'background-color': 'green',
                'line-color': 'green',
                'width': 5,
                'opacity': 1,
                'color': 'green'
            }
        },
    ]

    cy = cytoscape({
        container: $('#cy')[0],
        style: styleForGraphs,
        elements: {
            nodes: graphData['nodes'],
            edges: graphData['edges']
        },
        layout: {
            name: 'preset'
        },
        boxSelectionEnabled: true,
        motionBlur: true,
        wheelSensitivity: 0.1,
        ready: function () {
            let colors = [];
            let usedColors = [];

            this.nodes().forEach((node) => {
                if (node.data().clusterID)
                    colors[node.data().clusterID] = -1;
            })

            this.nodes().forEach((node) => {
                if (node.data().clusterID && colors[node.data().clusterID] === -1){
                    let color = getRandomColor();
                    if(usedColors[color] === false){
                        colors[node.data().clusterID] = getRandomColor();
                    }
                    else{
                        while(usedColors[color] === true){
                            color = getRandomColor();
                        }
                        colors[node.data().clusterID] = color;
                    }
                }
            })

            this.nodes().forEach((node) => {
                let size = 15;

                node.css("width", node.data().width || size);
                node.css("height", node.data().height || size);
                if (node.data().clusterID)
                    node.css("background-color", colors[node.data().clusterID]);
            });

            var i = 0;
            this.on('tap', 'node', function (evt) {
                if (i < 2) {
                    edgeNodes[i++] = this._private.data.id;
                }
                else {
                    edgeNodes = [];
                    i = 0;
                }

            });

            var getNodesData = function () {
                var nodesData = {};
                var nodes = cy.nodes();
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    nodesData[node.id()] = {
                        width: node.width(),
                        height: node.height(),
                        x: node.position("x"),
                        y: node.position("y")
                    };
                }
                return nodesData;
            };

            var enableDragAndDropMode = function () {
                window.dragAndDropModeEnabled = true;
                $("#sbgn-network-container").addClass("target-cursor");
                cy.autolock(true);
                cy.autounselectify(true);
            };

            var disableDragAndDropMode = function () {
                window.dragAndDropModeEnabled = null;
                window.nodeToDragAndDrop = null;
                $("#sbgn-network-container").removeClass("target-cursor");
                cy.autolock(false);
                cy.autounselectify(false);
            };

            var lastMouseDownNodeInfo = null;
            this.on("mousedown", "node", function () {
                var self = this;
                lastMouseDownNodeInfo = {};
                lastMouseDownNodeInfo.lastMouseDownPosition = {
                    x: this.position("x"),
                    y: this.position("y")
                };
                lastMouseDownNodeInfo.node = this;
            });

            this.on("mouseup", "node", function () {
                if (lastMouseDownNodeInfo == null) {
                    return;
                }
                var node = lastMouseDownNodeInfo.node;
                var lastMouseDownPosition = lastMouseDownNodeInfo.lastMouseDownPosition;
                var mouseUpPosition = {
                    x: node.position("x"),
                    y: node.position("y")
                };
                if (mouseUpPosition.x != lastMouseDownPosition.x ||
                    mouseUpPosition.y != lastMouseDownPosition.y) {
                    var positionDiff = {
                        x: mouseUpPosition.x - lastMouseDownPosition.x,
                        y: mouseUpPosition.y - lastMouseDownPosition.y
                    };

                    var nodes;
                    if (node.selected()) {
                        nodes = cy.nodes(":visible").filter(":selected");
                    }
                    else {
                        nodes = [];
                        nodes.push(node);
                    }

                    var param = {
                        positionDiff: positionDiff,
                        nodes: nodes, move: false
                    };
                    editorActionsManager._do(new MoveNodeCommand(param));

                    lastMouseDownNodeInfo = null;
                    refreshUndoRedoButtonsStatus();
                }
            });
        }
    });


    var panProps = ({
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    });
    cy.panzoom(panProps);

    ur = cy.undoRedo({});

    cy.on("undo", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });
    cy.on("redo", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });
    cy.on("do", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });

    ur.action("addNode", addNode, removeNodes);
    ur.action("createCompound", createCompoundForSelectedNodes, removeCompound);
};

var COSEBilkentLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose-bilkent',
        ready: function () {
        },
        stop: function () {
        },
        refresh: 0,
        fit: true,
        padding: 10,
        incremental: true,
        debug: false,
        nodeRepulsion: 4500,
        nodeOverlap: 10,
        idealEdgeLength: 50,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.4,
        numIter: 2500,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1,
        tile: true
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#cose-bilkent-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("cose-bilkent layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cose-bilkent-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout4").click(function (evt) {
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion4").value);
            self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap4").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length4").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity4").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor4").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity4").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter4").value);
            // self.currentLayoutProperties.animate = document.getElementById("animate4").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh4").value);
            self.currentLayoutProperties.fit = document.getElementById("fit4").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding4").value);
            self.currentLayoutProperties.debug = document.getElementById("debug4").checked;
            self.currentLayoutProperties.initialTemp = Number(document.getElementById("initialTemp4").value);
            self.currentLayoutProperties.minTemp = Number(document.getElementById("minTemp4").value);
            self.currentLayoutProperties.coolingFactor = Number(document.getElementById("coolingFactor4").value);
            self.currentLayoutProperties.incremental = document.getElementById("incremental4").checked;
            self.currentLayoutProperties.tile = document.getElementById("tile4").checked;


            $(self.el).dialog('close');

        });

        $("#default-layout4").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#cose-bilkent-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var COSELayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose',
        ready: function () {
        },
        stop: function () {
        },
        refresh: 4,
        fit: true,
        padding: 30,
        boundingBox: undefined,
        randomize: true,
        debug: false,
        nodeRepulsion: 400000,
        nodeOverlap: 10,
        idealEdgeLength: 10,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 250,
        numIter: 100,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = self.template = _.template($("#cose-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("Cose layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = self.template = _.template($("#cose-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout").click(function (evt) {
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
            self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh").value);
            self.currentLayoutProperties.fit = document.getElementById("fit").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding").value);
            self.currentLayoutProperties.randomize = document.getElementById("randomize").checked;
            self.currentLayoutProperties.debug = document.getElementById("debug").checked;
            self.currentLayoutProperties.initialTemp = Number(document.getElementById("initialTemp").value);
            self.currentLayoutProperties.minTemp = Number(document.getElementById("minTemp").value);


            $(self.el).dialog('close');

        });

        $("#default-layout").click(function (evt) {
            self.copyProperties();
            var temp = self.template = _.template($("#cose-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var COLALayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cola',
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 4000, // max length in ms to run the layout
        fit: true, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        // layout event callbacks
        ready: function () {
        }, // on layoutready
        stop: function () {
        }, // on layoutstop

        // positioning options
        randomize: true, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        nodeSpacing: function (node) {
            return 10;
        }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: undefined, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#cola-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("Cola layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cola-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout1").click(function (evt) {
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh1").value);
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime1").value);
            self.currentLayoutProperties.fit = document.getElementById("fit1").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding1").value);
            self.currentLayoutProperties.randomize = document.getElementById("randomize1").checked;
            self.currentLayoutProperties.avoidOverlap = document.getElementById("avoidOverlap1").checked;
            self.currentLayoutProperties.handleDisconnected = document.getElementById("handleDisconnected1").checked;
            self.currentLayoutProperties.infinite = document.getElementById("infinite1").checked;


            $(self.el).dialog('close');
        });

        $("#default-layout1").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#cola-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var ARBORLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'arbor',
        maxSimulationTime: 4000, // max length in ms to run the layout
        fit: true, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        repulsion: undefined,
        stiffness: undefined,
        friction: undefined,
        gravity: true,
        fps: undefined,
        precision: undefined,
        nodeMass: undefined,
        edgeLength: undefined,
        stepSize: 0.1, // smoothing of arbor bounding box
        stableEnergy: function (energy) {
            var e = energy;
            return (e.max <= 0.5) || (e.mean <= 0.3);
        },
        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#arbor-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("Arbor layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#arbor-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout2").click(function (evt) {
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime2").value);
            self.currentLayoutProperties.fit = document.getElementById("fit2").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding2").value);
            self.currentLayoutProperties.gravity = document.getElementById("gravity2").checked;
            self.currentLayoutProperties.stepSize = Number(document.getElementById("stepSize2").value);
            self.currentLayoutProperties.infinite = document.getElementById("infinite2").checked;


            $(self.el).dialog('close');
        });

        $("#default-layout2").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#arbor-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var SPRINGYLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'springy',
        maxSimulationTime: 4000, // max length in ms to run the layout
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        random: false, // whether to use random initial positions
        infinite: true, // overrides all other options for a forces-all-the-time mode
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        stiffness: 400,
        repulsion: 400,
        damping: 0.5
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#springy-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("springy layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#springy-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout3").click(function (evt) {
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime3").value);
            self.currentLayoutProperties.fit = document.getElementById("fit3").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding3").value);
            self.currentLayoutProperties.random = document.getElementById("random3").checked;
            self.currentLayoutProperties.infinite = document.getElementById("infinite3").checked;
            self.currentLayoutProperties.stiffness = Number(document.getElementById("stiffness3").value);
            self.currentLayoutProperties.repulsion = Number(document.getElementById("repulsion3").value);
            self.currentLayoutProperties.damping = Number(document.getElementById("damping3").value);

            $(self.el).dialog('close');
        });

        $("#default-layout3").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#springy-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var FCOSELayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "fcose",
        randomize: true,
        fit: true,
        padding: 10,
        nodeDimensionsIncludeLabels: false,
        samplingType: true,
        sampleSize: 25,
        nodeSeparation: 75,
        piTol: 0.0000001,
        nodeRepulsion: 4500,
        idealEdgeLength: 50,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: false,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
        initialEnergyOnIncremental: 0.3
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#fcose-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("fcose layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#fcose-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout5").click(function (evt) {
            self.currentLayoutProperties.randomize = document.getElementById("randomize5").checked;
            self.currentLayoutProperties.fit = document.getElementById("fit5").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding5").value);
            self.currentLayoutProperties.nodeDimensionsIncludeLabels = document.getElementById("nodeDimensionsIncludeLabels5").checked;
            self.currentLayoutProperties.samplingType = document.getElementById("samplingType5").checked;
            self.currentLayoutProperties.sampleSize = Number(document.getElementById("sampleSize5").value);
            self.currentLayoutProperties.nodeSeparation = Number(document.getElementById("nodeSeparation5").value);
            self.currentLayoutProperties.piTol = Number(document.getElementById("piTol5").value);
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("nodeRepulsion5").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("idealEdgeLength5").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edgeElasticity5").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nestingFactor5").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity5").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("numIter5").value);
            self.currentLayoutProperties.tile = document.getElementById("tile5").checked;
            self.currentLayoutProperties.tilingPaddingVertical = Number(document.getElementById("tilingPaddingVertical5").value);
            self.currentLayoutProperties.tilingPaddingHorizontal = Number(document.getElementById("tilingPaddingHorizontal5").value);
            self.currentLayoutProperties.gravityRangeCompound = Number(document.getElementById("gravityRangeCompound5").value);
            self.currentLayoutProperties.gravityRange = Number(document.getElementById("gravityRange5").value);
            self.currentLayoutProperties.initialEnergyOnIncremental = Number(document.getElementById("initialEnergyOnIncremental5").value);
            $(self.el).dialog('close');

        });
        $("#default-layout5").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#fcose-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});
var CISELayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "cise",
        clusters: [],
        refresh: 10,
        animationDuration: undefined,
        animationEasing: undefined,
        fit: true,
        padding: 30,
        nodeSeparation: 35,
        idealInterClusterEdgeLengthCoefficient: 1.4,
        allowNodesInsideCircle: false,
        maxRatioOfNodesInsideCircle: 0.1,
        springCoeff: 0.45,
        nodeRepulsion: 4500,
        gravity: 0.25,
        gravityRange: 3.8
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#cise-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("cise layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cise-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout6").click(function (evt) {
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh6").value);
            self.currentLayoutProperties.fit = document.getElementById("fit6").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding6").value);
            self.currentLayoutProperties.nodeSeparation = Number(document.getElementById("nodeSeparation6").value);
            self.currentLayoutProperties.idealInterClusterEdgeLengthCoefficient = Number(document.getElementById("idealInterClusterEdgeLengthCoefficient6").value);
            self.currentLayoutProperties.allowNodesInsideCircle = document.getElementById("allowNodesInsideCircle6").checked;
            self.currentLayoutProperties.maxRatioOfNodesInsideCircle = Number(document.getElementById("maxRatioOfNodesInsideCircle6").value);
            self.currentLayoutProperties.springCoeff = Number(document.getElementById("springCoeff6").value);
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("nodeRepulsion6").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity6").value);
            self.currentLayoutProperties.gravityRange = Number(document.getElementById("gravityRange6").value);
            $(self.el).dialog('close');
        });

        $("#default-layout6").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#cise-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});
var AVSDFLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "avsdf",
        refresh: 30,
        fit: true,
        padding: 10,
        nodeSeparation: 60
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#avsdf-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("avsdf layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#avsdf-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout9").click(function (evt) {
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh9").value);
            self.currentLayoutProperties.fit = document.getElementById("fit9").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding9").value);
            self.currentLayoutProperties.nodeSeparation = Number(document.getElementById("nodeSeparation9").value);
            $(self.el).dialog('close');
        });


        $("#default-layout9").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#avsdf-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});
var DAGRELayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "dagre",
        fit: true,
        padding: 30,
        nodeDimensionsIncludeLabels: false
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#dagre-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("dagre layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#dagre-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout7").click(function (evt) {
            self.currentLayoutProperties.fit = document.getElementById("fit7").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding7").value);
            self.currentLayoutProperties.nodeDimensionsIncludeLabels = document.getElementById("nodeDimensionsIncludeLabels7").checked;
            $(self.el).dialog('close');
        });


        $("#default-layout7").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#dagre-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});
var KLAYLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "klay",
        fit: true,
        padding: 30,
        klay: {
            addUnnecessaryBendpoints: false,
            aspectRatio: 1.6,
            borderSpacing: 20,
            compactComponents: false,
            edgeSpacingFactor: 0.5,
            feedbackEdges: false,
            inLayerSpacingFactor: 1.0,
            layoutHierarchy: false,
            linearSegmentsDeflectionDampening: 0.3,
            mergeEdges: false,
            mergeHierarchyCrossingEdges: true,
            randomizationSeed: 1,
            routeSelfLoopInside: false,
            separateConnectedComponents: true,
            spacing: 20,
            thoroughness: 7
        }
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#klay-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("klay layout is applied")
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#klay-settings-template").html());
        let crossingMinimizationOption = '';

        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout8").click(function (evt) {
            self.currentLayoutProperties.fit = document.getElementById("fit8").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding8").value);

            self.currentLayoutProperties.klay.addUnnecessaryBendpoints = document.getElementById("addUnnecessaryBendpoints8").checked;
            self.currentLayoutProperties.klay.aspectRatio = Number(document.getElementById("aspectRatio8").value);
            self.currentLayoutProperties.klay.borderSpacing = Number(document.getElementById("borderSpacing8").value);
            self.currentLayoutProperties.klay.compactComponents = document.getElementById("compactComponents8").checked;
            self.currentLayoutProperties.klay.edgeSpacingFactor = Number(document.getElementById("edgeSpacingFactor8").value);
            self.currentLayoutProperties.klay.feedbackEdges = document.getElementById("feedbackEdges8").checked;
            self.currentLayoutProperties.klay.inLayerSpacingFactor = Number(document.getElementById("inLayerSpacingFactor8").value);
            self.currentLayoutProperties.klay.layoutHierarchy = document.getElementById("layoutHierarchy8").checked;
            self.currentLayoutProperties.klay.linearSegmentsDeflectionDampening = Number(document.getElementById("linearSegmentsDeflectionDampening8").value);
            self.currentLayoutProperties.klay.mergeEdges = document.getElementById("mergeEdges8").checked;
            self.currentLayoutProperties.klay.mergeHierarchyCrossingEdges = document.getElementById("mergeHierarchyCrossingEdges8").checked;
            self.currentLayoutProperties.klay.randomizationSeed = Number(document.getElementById("randomizationSeed8").value);
            self.currentLayoutProperties.klay.routeSelfLoopInside = document.getElementById("routeSelfLoopInside8").checked;
            self.currentLayoutProperties.klay.separateConnectedComponents = document.getElementById("separateConnectedComponents8").checked;
            self.currentLayoutProperties.klay.spacing = Number(document.getElementById("spacing8").value);
            self.currentLayoutProperties.klay.thoroughness = Number(document.getElementById("thoroughness8").value);

            $(self.el).dialog('close');
        });


        $("#default-layout8").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#klay-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});
var EULERLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "euler",
        fit: true,
        padding: 30,
        gravity: -1.2,
        pull: 0.001,
        theta: 0.666,
        dragCoeff: 0.02,
        movementThreshold: 1,
        timeStep: 20,
        refresh: 10,
        maxIterations: 1000,
        maxSimulationTime: 4000,
        boundingBox: undefined,
        randomize: false
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#euler-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("Euler layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#euler-settings-template").html());
        let crossingMinimizationOption = '';

        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout10").click(function (evt) {
            self.currentLayoutProperties.fit = document.getElementById("fit10").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding10").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity10").value);
            self.currentLayoutProperties.pull = Number(document.getElementById("pull10").value);
            self.currentLayoutProperties.theta = Number(document.getElementById("theta10").value);
            self.currentLayoutProperties.dragCoeff = Number(document.getElementById("dragCoeff10").value);
            self.currentLayoutProperties.movementThreshold = Number(document.getElementById("movementThreshold10").value);
            self.currentLayoutProperties.timeStep = Number(document.getElementById("timeStep10").value);
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh10").value);
            self.currentLayoutProperties.maxIterations = Number(document.getElementById("maxIterations10").value);
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime10").value);
            self.currentLayoutProperties.randomize = document.getElementById("randomize10").checked;

            $(self.el).dialog('close');
        });


        $("#default-layout10").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#euler-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var SPREADLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: "spread",
        fit: true,
        minDist: 20,
        padding: 20,
        expandingFactor: -1.0,
        maxExpandIterations: 4,
        randomize: false
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#spread-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: async function () {
        console.log("spread layout is applied");
        await applyLayoutFunction(this);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#spread-settings-template").html());
        let crossingMinimizationOption = '';

        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout11").click(function (evt) {
            self.currentLayoutProperties.fit = document.getElementById("fit11").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding11").value);
            self.currentLayoutProperties.maxExpandIterations = Number(document.getElementById("maxExpandIterations11").value);
            self.currentLayoutProperties.randomize = document.getElementById("randomize11").checked;
            self.currentLayoutProperties.minDist = Number(document.getElementById("minDist11").value);
            self.currentLayoutProperties.expandingFactor = Number(document.getElementById("expandingFactor11").value);

            $(self.el).dialog('close');
        });


        $("#default-layout11").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#spread-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});

let max = function (a, b) {
    return (a > b) ? a : b;
}

let applyLayoutFunction = async function (graph) {
    let options = {};

    for (var prop in graph.currentLayoutProperties) {
        options[prop] = graph.currentLayoutProperties[prop];
    }

    let cluster = [];
    let mx = 0;

    graphGlob.nodes.forEach((node) => {
        if (node.data.clusterID)
            mx = max(node.data.clusterID, mx);
    })

    // Since in CiSE, the case when the clusterID is empty is not handled
    for (i = 0; i <= mx; i++)
        cluster[i] = [];

    graphGlob.nodes.forEach((node) => {
        if (node.data.clusterID)
            cluster[node.data.clusterID].push(node.data.id);
    })

    if (cluster.length !== 0) {
        options["clusters"] = cluster;
    }

    let graphData = graphGlob.nodes.concat(graphGlob.edges);
    let data = [graphData, options];

    //url changes based on whether it's on heroku or on the localhost
    let url = (!heroku) ? ("http://localhost:" + port + "/layout/json") : ("https://cytoscape-layout-service.herokuapp.com/layout/json");

    const settings = {
        method: 'POST',
        headers: {
            'content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
    };
    const res = await fetch(url, settings)
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(e => {
            return e;
        });

    let els = [];
    els['nodes'] = [];
    els['edges'] = [];

    Object.keys(res).forEach((obj) => {
        let addIt = {
            data: {
                id: obj,
                clusterID: res[obj].data.clusterID,
                width: res[obj].data.width,
                height: res[obj].data.height,
                parent: res[obj].data.parent
            },
            position: { x: res[obj].position.x, y: res[obj].position.y }
        }
        els['nodes'].push(addIt);
    });
    cytoscapeJsGraph.edges.forEach((edge) => {
        let addIt = {
            data: {
                id: edge.data.id,
                source: edge.data.source,
                target: edge.data.target
            }
        }
        els['edges'].push(addIt);
    })

    refreshCytoscape(els);
}

var whitenBackgrounds = function () {
    $("#cose-bilkent").css("background-color", "white");
    $("#cose").css("background-color", "white");
    $("#cola").css("background-color", "white");
    $("#springy").css("background-color", "white");
    $("#arbor").css("background-color", "white");
    // newly added
    $("#fcose").css("background-color", "white");
    $("#cise").css("background-color", "white");
    $("#dagre").css("background-color", "white");
    $("#klay").css("background-color", "white");
    $("#avsdf").css("background-color", "white");
    $("#euler").css("background-color", "white");
    $("#spread").css("background-color", "white");
};

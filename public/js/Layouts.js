var graph = {};
var edgeNodes = [];
var setFileContent = function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
};
$(function () {

    var xmlObject = loadXMLDoc("samples/graph0.xml");
    var graphmlConverter = graphmlToJSON(xmlObject);
    atts = graphmlConverter.attributes;

    var cytoscapeJsGraph = {
        edges: graphmlConverter.objects[2],
        nodes: graphmlConverter.objects[1]
    };
    refreshCytoscape(cytoscapeJsGraph);
    setFileContent("graph0.graphml");


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

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    });
    cy.panzoom(panProps);

});
$("#cose-bilkent").css("background-color", "grey");

function refreshCytoscape(graphData) { // on dom ready

    cy = cytoscape({
        container: $('#cy')[0],
        style: [
            {
                selector: 'node',
                style: {
                    'content': 'data(name)',
                    'text-valign': 'center',
                    'color': 'white',
                    'text-outline-width': 2,
                    'text-outline-color': '#888',
                    'shape': 'rectangle'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black',
                    'text-outline-color': 'black',
                    'border-color': 'black',
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
        ],

        elements: {
            nodes: graphData['nodes'],
            edges: graphData['edges']

        },
        layout: {
            name: 'preset',
            fit: true
        },
        boxSelectionEnabled: true,
        motionBlur: true,
        wheelSensitivity: 0.1,
        ready: function () {
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

    ur = cy.undoRedo({

    });

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
}
;


var COSEBilkentLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose-bilkent',
        ready: function () {
        },
        // Called on `layoutstop`
        stop: function () {
        },
        // Number of iterations between consecutive screen positions update (0 -> only updated on the end)
        refresh: 0,
        // Whether to fit the network view after when done
        fit: true,
        // Padding on fit
        padding: 10,
        // Whether to enable incremental mode
        incremental: true,
        // Whether to use the JS console to print debug messages
        debug: false,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 4500,
        // Node repulsion (overlapping) multiplier
        nodeOverlap: 10,
        // Ideal edge (non nested) length
        idealEdgeLength: 50,
        // Divisor to compute edge forces
        edgeElasticity: 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Gravity force (constant)
        gravity: 0.4,
        // Maximum number of iterations to perform
        numIter: 2500,
        // Initial temperature (maximum node displacement)
        initialTemp: 200,
        // Cooling factor (how the temperature is reduced between consecutive iterations
        coolingFactor: 0.95,
        // Lower temperature threshold (below this point the layout will end)
        minTemp: 1,
        // For enabling tiling
        tile: true,
        //whether to make animation while performing the layout
        animate: true
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
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
            self.currentLayoutProperties.animate = document.getElementById("animate4").checked;
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
            console.log("asd");
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
        animate: true,
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
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
            self.currentLayoutProperties.animate = document.getElementById("animate").checked;
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
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        //        var options = clone(this.currentLayoutProperties);
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cola-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout1").click(function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate1").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh1").value);
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime1").value);
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating1").checked;
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
        animate: true, // whether to show the layout as it's running
        maxSimulationTime: 4000, // max length in ms to run the layout
        fit: true, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

        // callbacks on layout events
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop

        // forces used by arbor (use arbor default on undefined)
        repulsion: undefined,
        stiffness: undefined,
        friction: undefined,
        gravity: true,
        fps: undefined,
        precision: undefined,
        // static numbers or functions that dynamically return what these
        // values should be for each element
        // e.g. nodeMass: function(n){ return n.data('weight') }
        nodeMass: undefined,
        edgeLength: undefined,
        stepSize: 0.1, // smoothing of arbor bounding box

        // function that returns true if the system is stable to indicate
        // that the layout can be stopped
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        console.log(options);
        //cy.layout(options);
        ur.do("layout", options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#arbor-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout2").click(function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate2").checked;
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime2").value);
            self.currentLayoutProperties.fit = document.getElementById("fit2").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding2").value);
            self.currentLayoutProperties.gravity = document.getElementById("gravity2").checked;
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating2").checked;
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
        animate: false, // whether to show the layout as it's running
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        random: false, // whether to use random initial positions
        infinite: true, // overrides all other options for a forces-all-the-time mode
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop

        // springy forces
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        console.log(options);
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#springy-settings-template").html());
        self.template = temp(self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout3").click(function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate3").checked;
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime3").value);
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating3").checked;
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
        quality: "default",
        randomize: true,
        animate: false,
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#fcose-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout5").click(function (evt) {
            self.currentLayoutProperties.quality = new Text(document.getElementById("quality5").value);
            self.currentLayoutProperties.randomize = document.getElementById("randomize5").checked;
            self.currentLayoutProperties.animate = document.getElementById("animate5").checked;
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
        // clusters: clusterInfo,
        animate: false,
        refresh: 10,
        animationDuration: undefined,
        animationEasing: undefined,
        fit: true,
        padding: 30,
        nodeSeparation: 12.5,
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cise-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout6").click(function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate6").checked;
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

        console.log();


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
        refresh: 30,    
        fit: true,
        padding: 10,     
        ungrabifyWhileSimulating: false,
        animate: false,         
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
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#avsdf-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout9").click(function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate9").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh9").value);
            self.currentLayoutProperties.fit = document.getElementById("fit9").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding9").value);
            self.currentLayoutProperties.nodeSeparation = Number(document.getElementById("nodeSeparation9").value);
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating9").checked;
            $(self.el).dialog('close');
        });

        console.log();


        $("#default-layout9").click(function (evt) {
            self.copyProperties();
            var temp = _.template($("#avsdf-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;

    }
});


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
    $("euler").css("background-color", "white");
    $("#spread").css("background-color", "white");
};

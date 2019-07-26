heroku = false;

var refreshUndoRedoButtonsStatus = function () {

    if (ur.isUndoStackEmpty()) {
        $("#undo").parent("li").addClass("disabled");
    }
    else {
        $("#undo").parent("li").removeClass("disabled");
    }

    if (ur.isRedoStackEmpty()) {
        $("#redo").parent("li").addClass("disabled");
    }
    else {
        $("#redo").parent("li").removeClass("disabled");
    }
};
// let port = window.location.port;

///////////////////// EDIT ////////////////////////////

$("#undo").click(function (e) {
    ur.undo();
});

$("#redo").click(function (e) {
    ur.redo();
});

$("#delete").click(function (e) {
    var selectedEles = cy.$(":selected");

    if (selectedEles.length == 0) {
        return;
    }
    ur.do("remove", selectedEles);
});

$("#addEdge").click(function (e) {

    if (graphGlob["edges"] === undefined)
        graphGlob["edges"] = [];
    // if (cy.$("node:selected").length == 2)
    // ur.do("add", {
    //     group: "edges",
    //     data: {
    //         id: "e" + graphGlob["edges"].length,
    //         source: cy.$("node:selected")[0].data('id'),
    //         target: cy.$("node:selected")[1].data('id')
    //     }
    // });

    if (cy.$("node:selected").length == 2){
        graphGlob["edges"].push({
            data: {
                id: "e" + graphGlob["edges"].length,
                source: cy.$("node:selected")[0].data('id'),
                target: cy.$("node:selected")[1].data('id')
            }
        })
    }
    else{
        console.log(new Error("You must have 2 nodes selected to create an edge!") );
    }
    refreshCytoscape(graphGlob);
});

///////////////////// VIEW ////////////////////////////

var getSelectedNodesForExpandCollapse = function () {

    var selectedNodes = cy.nodes(":selected");

    for (var i = 0; i < selectedNodes.length; i++)
        if (selectedNodes[i].data("expanded-collapsed") == null)
            selectedNodes[i].data("expanded-collapsed", "expanded");

    return selectedNodes;

}

$("#collapse-selected").click(function (e) {
    var nodes = getSelectedNodesForExpandCollapse().filter("[expanded-collapsed='expanded']");
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "collapse");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleCollapseGivenNodesCommand(nodes));
    refreshUndoRedoButtonsStatus();

});

$("#expand-selected").click(function (e) {
    var nodes = getSelectedNodesForExpandCollapse().filter("[expanded-collapsed='collapsed']");
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "expand");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleExpandGivenNodesCommand(nodes));
    refreshUndoRedoButtonsStatus();
});

$("#collapse-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "collapse");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleCollapseGivenNodesCommand(cy.nodes()));
    refreshUndoRedoButtonsStatus();
});

$("#expand-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "expand");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleExpandAllNodesCommand({
        firstTime: true
    }));
    refreshUndoRedoButtonsStatus();
});

///////////////////// LOAD & SAVE //////////////////////////////

$("#save-file").click(function (e) {

    var sbgnmlText = jsonToGraphml.createGraphml(atts);

    var blob = new Blob([sbgnmlText], {
        type: "text/plain;charset=utf-8;",
    });
    var filename = "" + new Date().getTime() + ".graphml";;
    saveAs(blob, filename);

});


//////////////////////////////////////////////////////////////////////////////////////////////

var tempName = "cose-bilkent";
$("#cose-bilkent").click(function (e) {
    tempName = "cose-bilkent";
    whitenBackgrounds();
    $("#cose-bilkent").css("background-color", "grey");
});
$("#cose").click(function (e) {
    tempName = "cose";
    whitenBackgrounds();
    $("#cose").css("background-color", "grey");
});
$("#cola").click(function (e) {
    tempName = "cola";
    whitenBackgrounds();
    $("#cola").css("background-color", "grey");
});
$("#springy").click(function (e) {
    tempName = "springy";
    whitenBackgrounds();
    $("#springy").css("background-color", "grey");
});
$("#arbor").click(function (e) {
    tempName = "arbor";
    whitenBackgrounds();
    $("#arbor").css("background-color", "grey");
});
// newly added
$("#fcose").click(function (e) {
    tempName = "fcose";
    whitenBackgrounds();
    $("#fcose").css("background-color", "grey");
});
$("#cise").click(function (e) {
    tempName = "cise";
    whitenBackgrounds();
    $("#cise").css("background-color", "grey");
});
$("#dagre").click(function (e) {
    tempName = "dagre";
    whitenBackgrounds();
    $("#dagre").css("background-color", "grey");
});
$("#klay").click(function (e) {
    tempName = "klay";
    whitenBackgrounds();
    $("#klay").css("background-color", "grey");
});
$("#avsdf").click(function (e) {
    tempName = "avsdf";
    whitenBackgrounds();
    $("#avsdf").css("background-color", "grey");
});
$("#euler").click(function (e) {
    tempName = "euler";
    whitenBackgrounds();
    $("#euler").css("background-color", "grey");
});
$("#spread").click(function (e) {
    tempName = "spread";
    whitenBackgrounds();
    $("#spread").css("background-color", "grey");
});


var coseBilkentLayoutProp = new COSEBilkentLayout({
    el: '#cose-bilkent-layout-table'
});
var coseLayoutProp = new COSELayout({
    el: '#cose-layout-table'
});
var colaLayoutProp = new COLALayout({
    el: '#cola-layout-table'
});
var arborLayoutProp = new ARBORLayout({
    el: '#arbor-layout-table'
});
var springyLayoutProp = new SPRINGYLayout({
    el: '#springy-layout-table'
});
// newly added
var fcoseLayoutProp = new FCOSELayout({
    el: '#fcose-layout-table'
})
var ciseLayoutProp = new CISELayout({
    el: '#cise-layout-table'
})
var dagreLayoutProp = new DAGRELayout({
    el: '#dagre-layout-table'
})
var klayLayoutProp = new KLAYLayout({
    el: '#klay-layout-table'
})
var avsdfLayoutProp = new AVSDFLayout({
    el: '#avsdf-layout-table'
})
var eulerLayoutProp = new EULERLayout({
    el: '#euler-layout-table'
})
var spreadLayoutProp = new SPREADLayout({
    el: '#spread-layout-table'
})

$("#add-node-dialog").hide();

function toggleUserControl() {
    /*
        toggleFuncs = function (fs){
            for(var i = 0; i < fs.length; i++)
                fs[i](!fs[i]());
        };
        console.log(cy);
        toggleFuncs([*/
    /*
        cy.panningEnabled(!cy.panningEnabled());
            cy.zoomingEnabled(!cy.zoomingEnabled());
            cy.boxSelectionEnabled(!cy.boxSelectionEnabled());
            cy.autoungrabify(!cy.autoungrabify());
            cy.autounselectify(!cy.autounselectify());
            cy.autolock(!cy.autolock());*/
}


$("#addNodeMenu").click(function () {
    toggleUserControl();

    $("#cy").css("background-image", "url('css/images/grid_background.gif')").css("cursor", "crosshair");
    $("#cy").popover({
        placement: "top",
        content: "Select the position of new node",
        template: '<div class="popover" role="tooltip">' +
            '<div class="arrow"></div>' +
            '<div class="popover-content"></div>' +
            '</div>'
    }).popover("show");

    var newNode = {
        firstTime: true
    };

    cy.one("click", function (e) {
        toggleUserControl();

        var x = e.cyPosition.x;
        var y = e.cyPosition.y;

        $("#new-node-y").val(e.cyPosition.y);

        $('#new-node-color').colorpicker();
        $('#new-node-border-color').colorpicker();

        $("#add-node-modal").modal();

        $("#exit-new-node").one("click", function () {
            toggleUserControl();
            $("#cy").css("background-image", "").css("cursor", "");
            $("#cy").popover("destroy");
        });

        $("#save-new-node").one("click", function () {
            var name = $("#new-node-name").val();
            var w = $("#new-node-width").val();
            var h = $("#new-node-height").val();
            /*  var x = $("#new-node-x").val();
              var y = $("#new-node-y").val();*/
            var color = $("#new-node-color").colorpicker("getValue", "gray");
            var shape = $("#new-node-shape").val();
            var borderColor = $("#new-node-border-color").colorpicker("getValue", "black");
            //var borderWidth = $("#new-node-border-width").val();

            if (w == "") {
                w = null;
            }
            else {
                w = Number(w);
            }

            if (h == "") {
                h = null;
            }
            else {
                h = Number(h);
            }

            if (x == "") {
                x = null;
            }
            else {
                x = Number(x);
            }

            if (y == "") {
                y = null;
            }
            else {
                y = Number(y);
            }

            var newNode = {
                name: name,
                x: x,
                y: y,
                w: w,
                h: h,
                color: color,
                shape: shape,
                borderColor: borderColor,
                firstTime: true
            };
            toggleUserControl();
            $("#cy").css("background-image", "").css("cursor", "");
            $("#cy").popover("destroy");
            ur.do("addNode", newNode);

        });
    });
});

/*
$("#addNodeMenu").click(function () {
    $("#add-node-dialog").dialog({
        modal: true,
        draggable: false,
        resizable: false,
        position: ['center', 'center'],
        show: 'blind',
        hide: 'blind',
        width: 250,
        dialogClass: 'ui-dialog-osx',
        buttons: {
            "Done": function () {
                var name = $("#new-node-name").val();
                var w = $("#new-node-width").val();
                var h = $("#new-node-height").val();
                var x = $("#new-node-x").val();
                var y = $("#new-node-y").val();
                var color = $("#new-node-color").val();
                var shape = $("#new-node-shape").val();
                var borderColor = $("#new-node-border-color").val();
//                var borderWidth = $("#new-node-border-width").val();

                if (w == "") {
                    w = null;
                }
                else {
                    w = Number(w);
                }

                if (h == "") {
                    h = null;
                }
                else {
                    h = Number(h);
                }

                if (x == "") {
                    x = null;
                }
                else {
                    x = Number(x);
                }

                if (y == "") {
                    y = null;
                }
                else {
                    y = Number(y);
                }

                var newNode = {
                    name: name,
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    color: color,
                    shape: shape,
                    borderColor: borderColor,
                    firstTime: true
                };

                editorActionsManager._do(new AddNodeCommand(newNode));
                refreshUndoRedoButtonsStatus();

                //addNode(name, x, y, w, h, color, shape,borderColor);
                $(this).dialog("close");
            }
        }
    });
});*/

var addChild = function (children, theChild) {
    var len = children.length;
    for (var i = 0; i < theChild.children().length; i++) {
        children[len++] = theChild.children()[i];
    }
    children.length = len;
    for (var i = 0; i < theChild.children().length; i++) {
        if (theChild.children()[i].isParent()) {
            addChild(children, theChild.children()[i]);
        }
    }
};

$("#makeCompound").click(function (e) {
    var nodes = cy.$('node:selected');

    console.log("Making a compound? Are you crazy?");

    ur.do("createCompound", {
        nodesToMakeCompound: nodes,
        firstTime: true
    });


});

$("#layout-properties").click(function (e) {
    if (tempName !== '') {
        switch (tempName) {
            case 'cose-bilkent':
                coseBilkentLayoutProp.render();
                break;
            case 'cose':
                coseLayoutProp.render();
                break;
            case 'cola':
                colaLayoutProp.render();
                break;
            case 'arbor':
                arborLayoutProp.render();
                break;
            case 'springy':
                springyLayoutProp.render();
                break;
            // newly added
            case 'fcose':
                fcoseLayoutProp.render();
                break;
            case 'cise':
                ciseLayoutProp.render();
                break;
            case 'dagre':
                dagreLayoutProp.render();
                break;
            case 'klay':
                klayLayoutProp.render();
                break;
            case 'avsdf':
                avsdfLayoutProp.render();
                break;
            case 'euler':
                eulerLayoutProp.render();
                break;
            case 'spread':
                spreadLayoutProp.render();
                break;
        }
    }

});

$("#perform-layout").click(function (e) {
    cy.layout().stop();
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);
    switch (tempName) {
        case 'cose-bilkent':
            coseBilkentLayoutProp.applyLayout();
            break;
        case 'cose':
            coseLayoutProp.applyLayout();
            break;
        case 'cola':
            colaLayoutProp.applyLayout();
            break;
        case 'arbor':
            arborLayoutProp.applyLayout();
            break;
        case 'springy':
            springyLayoutProp.applyLayout();
            break;
        // newly added
        case 'fcose':
            fcoseLayoutProp.applyLayout();
            break;
        case 'cise':
            ciseLayoutProp.applyLayout();
            break;
        case 'dagre':
            dagreLayoutProp.applyLayout();
            break;
        case 'klay':
            klayLayoutProp.applyLayout();
            break;
        case 'avsdf':
            avsdfLayoutProp.applyLayout();
            break;
        case 'euler':
            eulerLayoutProp.applyLayout();
            break;
        case 'spread':
            spreadLayoutProp.applyLayout();
            break;
    }
});
var atts;

$("body").on("change", "#file-input", function (e) {
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        let convertIt = this.result;
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

        fetch(url, settings)
            .then(response => response.json())
            .then(res => {
                let els = [];
                let addIt;

                els['nodes'] = [];
                els['edges'] = [];

                // console.log(res);
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
                            position: { x: res[obj].x, y: res[obj].y }
                        }
                        els['nodes'].push(addIt);
                    }
                });
                cytoscapeJsGraph = els;

                // console.log(els);

                refreshCytoscape(els);
                setFileContent(fileName + ".txt");
                graphGlob = els;
            })
            .catch(e => {
                return e
            });
    };
    reader.readAsText(file);

    $("#file-input").val(null);
});

$("#load-file").click(function (e) {
    $("#file-input").trigger('click');
});

$("#new").click(function (e) {
    var graphData = new Object();
    graphData['nodes'] = [];
    graphData['edges'] = [];
    refreshCytoscape(graphData);
});


$("#save-as-png").click(function (evt) {
    var pngContent = cy.png({ scale: 3, full: true });

    // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    // this is to remove the beginning of the pngContent: data:img/png;base64,
    var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

    saveAs(b64toBlob(b64data, "image/png"), "network.png");

});
var loadSample = function (fileName) {
    let convertIt;
    function readFile() {
        $.ajaxSetup({
            async: false
        });
        jQuery.get("samples/" + fileName + ".txt", (txt) => {
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
                        position: { x: res[obj].position.x, y: res[obj].position.y }
                    }
                    els['nodes'].push(addIt);
                }
            });
            cytoscapeJsGraph = els;
            refreshCytoscape(els);
            setFileContent(fileName + ".txt");
        })
        .catch(e => {
            return e
        });
};

$("#sample0").click(function (e) {
    loadSample("sample1-simple-graphml");
});
$("#sample1").click(function (e) {
    loadSample("sample2-simple-graphml");
});
$("#sample2").click(function (e) {
    loadSample("sample3-simple-graphml");
});
$("#sample3").click(function (e) {
    loadSample("sample4-simple-json");
});
$("#sample4").click(function (e) {
    loadSample("sample5-huge-tree-graphml");
});
$("#sample5").click(function (e) {
    loadSample("sample6-huge-graph-graphml");
});
$("#sample6").click(function (e) {
    loadSample("sample7-simple-sbgnml");
});
$("#sample7").click(function (e) {
    loadSample("sample8-compound-sbgnml");
});
$("#sample8").click(function (e) {
    loadSample("sample9-compound-sbgnml");
});
$("#sample9").click(function (e) {
    loadSample("sample10-clustered-graphml");
});
$("#sample10").click(function (e) {
    loadSample("sample11-clustered-graphml");
});
$("#sample11").click(function (e) {
    loadSample("sample12-clustered-graphml");
});
$("#sample12").click(function (e) {
    loadSample("sample13-compound-graphml");
});
$("#sample13").click(function (e) {
    loadSample("sample14-compound-graphml");
});
$("#sample14").click(function (e) {
    loadSample("sample15-compound-graphml");
});
$("#sample15").click(function (e) {
    loadSample("sample16-compound-json");
});
$("#sample16").click(function (e) {
    loadSample("sample17-simple-json-non-uniform-dimension");
});
$("#sample17").click(function (e) {
    loadSample("sample18-huge-graph-graphml");
});






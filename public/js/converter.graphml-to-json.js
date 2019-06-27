var nodes = [];
var edges = [];

function loadXMLDoc(fileName) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else // for IE 5/6
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // fetch( "", )

    xhttp.open("GET", fileName, false);
    xhttp.send();
    return xhttp.responseXML;
}
;

function graphmlToJSON(xml) {
    nodes = [];
    edges = [];
    graph = {};
    this.attributes = getAttributes(xml);
    this.objects = getObjects(xml, this.attributes[0], this.attributes[1], this.attributes[2]);
    return {attributes: this.attributes, objects: this.objects};
}
;

function getAttributes(xmlObject) {
    var nodeAttributes = [];
    var edgeAttributes = [];
    var graphAttributes = [];
    $(xmlObject).find("key").each(function () {
        if ($(this).attr("for") == "node" || $(this).attr("for") == "all") {
            nodeAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
        if ($(this).attr('for') == "edge" || $(this).attr("for") == "all") {
            edgeAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
        if ($(this).attr('for') == "graph" || $(this).attr("for") == "all") {
            graphAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
    });
    return [graphAttributes, nodeAttributes, edgeAttributes];
}
;

function getObjects(xmlObject, graphAttributes, nodeAttributes, edgeAttributes, pid) {

    $(xmlObject).find('graph').each(function () {
        // define id of graph
        // <data> TO TAKE THIS </data>


        $(this).children('node').each(function () {
            processNode($(this), null, nodeAttributes);
        });

        $(this).children('edge').each(function () {
            var edgeData = new Object();
            edgeData['id'] = $(this).attr('id');
            edgeData['source'] = $(this).attr('source');
            edgeData['target'] = $(this).attr('target');
            edges.push({data: edgeData});
        });
    });
    return [graph, nodes, edges];
}
;

var processNode = function (theNode, pid, nodeAttributes) {
        var id = $(theNode).attr('id');

        var nodeData = $(theNode).children('data');
        var nodeGraph = $(theNode).children('graph');
        var cyData = {};
        var cyCSS = {};
        var cyPos = {};

        cyData.id = id;

        if (pid != null) {
            cyData.parent = pid;
        }
        var i = 0;
        $(nodeData).each(function () {
            var val = $(this).text();
            val = val.toLowerCase();
            var name = $(this).attr('key');


            if (name == "x" || name == "y" || name == "width" || name == "height" || name == "margin") {
                val = Number(val);
            }

            if (name == "x") {
                cyPos.x = val;
            }
            else if (name == "y") {
                cyPos.y = val;
            }
            else if (!nodeGraph) {
                if (name == "height") {
                    cyCSS.height = val;
                }
                else if (name == "width") {
                    cyCSS.width = val;
                }
            }
            else if (name == "shape") {
                cyCSS.shape = val.toLowerCase();
            }
            else if (name == "color") {
                if (val.indexOf(" ") > -1)
                    cyCSS['background-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
                else
                    cyCSS['background-color'] = val;
            }
            else if (name == "text") {
                cyCSS.content = val;
                cyData.name = val;
            }
        });

        if(nodeGraph.length > 0){
            cyCSS.height = undefined;
            cyCSS.width = undefined;
            cyPos = undefined;
        }
        $.extend(cyData, cyCSS);
        nodes.push({data: cyData, css: cyCSS, position: cyPos});


        if (nodeGraph.length > 0) {
            nodeGraph = nodeGraph[0];

            var childNodes = $(nodeGraph).children("node");

            for (var i = 0; i < childNodes.length; i++) {

                var theNode = $(childNodes)[i];
                processNode(theNode, id, nodeAttributes);
            }
        }
    }
    ;


function textToXmlObject(text) {
    if (window.ActiveXObject) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    } else {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}
;

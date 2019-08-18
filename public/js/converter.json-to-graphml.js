var handleNode = function (node, tabNum) {
    var txt = "";
    var tabs = "";
    for (var i = 0; i < tabNum; i++)
        tabs += "\t";
    var oneMoreTab = tabs + "\t";
    txt += tabs;
    txt += '<node id="';
    txt += node.data("id");
    txt += '">\n';

    txt += oneMoreTab;
    txt += '<data key="x">' + node.position("x") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="y">' + node.position("y") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="height">' + node._private.style['height'].value + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="width">' + node._private.style['width'].value + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="color">' + node._private.style["background-color"].value[0] + " " + node._private.style["background-color"].value[1] +
        " " + node._private.style["background-color"].value[2] + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="text">' + node.data("name") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="color1">' + node._private.style["background-color"].value[0] + " " + node._private.style["background-color"].value[1] +
        " " + node._private.style["background-color"].value[2] + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="shape">' + node.css("shape").substring(0,1).toUpperCase() + node.css("shape").substring(1,node.css("shape").length) + '</data>\n';




    var children = node.children();
    if (children != null && children.length > 0) {
        txt += oneMoreTab;
        txt += '<graph id="' + node.data("id") + ':' + '\"'
            +' edgedefault="undirected">\n';

        for (var i = 0; i < children.length; i++) {
            txt = txt + handleNode(children[i], tabNum + 2);
        }

        txt += oneMoreTab;
        txt += '</graph>\n';
    }
    txt += tabs;
    txt += '</node>\n';
    return txt;
};


var handleRootGraph = function () {
  var txt = "";
  txt += "<graph id=\"" + graph['id'] + '\" edgedefault=\"' + graph["edgefault"] + "\">\n";
  var orphans = cy.nodes().orphans();
  for (var i = 0; i < orphans.length; i++) {
    txt = txt + handleNode(orphans[i], 2);
  }
  cy.edges().each(function () {
    txt = txt + "<edge id=\"" + this._private.data.id + "\" source=\"" + this._private.data.source + "\" target=\"" + this._private.data.target + "\">\n";
    for (var i = 0; i < atts[2].length; i++) {
      txt += "<data key=\"" + atts[2][i]['id'] + "\">" + this._private.data.x + "</data>\n";
    }
    txt += "</edge>";
  });
  txt += "</graph>\n" + "</graphml>\n";
  return txt;
};

var jsonToGraphml = {
  createGraphml: function () {
    var self = this;
    var graphmlText = "";

    //add headers
    graphmlText = graphmlText + "<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n";
    var objs = ['graph', 'node', 'edge'];
    for (var a = 0; a < 3; a++) {
      for (var i = 0; i < atts[a].length; i++) {
        graphmlText += "<key id=\"" + atts[a][i]['id'] + "\" for=\"" + objs[a] + "\" attr.name=\"" + atts[a][i]['attrName'] + "\" attr.type=\"" + atts[a][i]['attrType'] + "\"/>\n";
      }
    }

    return graphmlText + handleRootGraph();
  }
};
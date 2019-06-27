var addRemoveUtilities = {
  defaultsMap: {},

  addNode: function (newNode) {
    var id_ = IDGenerator.generate();

    var cssTemp = {};
    cssTemp["content"] = newNode.name;
    cssTemp["background-color"] = newNode.color;
    cssTemp["shape"] = newNode.shape;
    cssTemp["width"] = newNode.w;
    cssTemp["height"] = newNode.h;
//    cssTemp['border-width'] = borderWidth;
    cssTemp['border-color'] = newNode.borderColor;
    var node = cy.add({
      group: "nodes",
      data: {id: id_, name: newNode.name},
      position: {x: newNode.x, y: newNode.y},
      css: cssTemp
    });
    return node;
  },

  removeNodes: function (nodes) {
    var removedEles = nodes.connectedEdges().remove();
    var children = nodes.children();
    if (children != null && children.length > 0) {
      removedEles = removedEles.union(this.removeNodes(children));
    }
    var parents = nodes.parents();
    removedEles = removedEles.union(nodes.remove());
    cy.nodes().updateCompoundBounds();
  //  refreshPaddings();
    return removedEles;
  },

  addEdgeSelected: function(source, target) {

    if (cy.$("node:selected").length !=  2)
      return;

    var edge = cy.add({
      group: "edges",
      data: {
        source: source,
        target: target
      }
    });
    
    return edge;
  },
  

  addEdge: function (source, target, sbgnclass) {
    var defaultsMap = this.defaultsMap;
    var defaults = defaultsMap[sbgnclass];
    var css = defaults ? {
      'width': defaults['width']
    } : {};
    var eles = cy.add({
      group: "edges",
      data: {
        source: source,
        target: target,
        sbgnclass: sbgnclass
      },
      css: css
    });

    var newEdge = eles[eles.length - 1];
    if (defaults && defaults['line-color']) {
      newEdge.data('lineColor', defaults['line-color']);
    }
    else {
      newEdge.data('lineColor', newEdge.css('line-color'));
    }
    newEdge.addClass('changeLineColor');
    return newEdge;
  },
  removeEdges: function (edges) {
    return edges.remove();
  },
  restoreEles: function (eles) {
    console.log(eles);
    eles.restore();
    return eles;
  },
  removeElesSimply: function (eles) {
    cy.elements().unselect();
    return eles.remove();
  },
  removeEles: function (eles) {
    cy.elements().unselect();
    var edges = eles.edges();
    var nodes = eles.nodes();
    var removedEles = this.removeEdges(edges);
    removedEles = removedEles.union(this.removeNodes(nodes));
    return removedEles;
  },
  changeParent: function (nodes, oldParentId, newParentId) {
    var removedNodes = this.removeNodes(nodes);
    
    for (var i = 0; i < removedNodes.length; i++) {
      var removedNode = removedNodes[i];
      var parentId = removedNode._private.data.parent;

      //Just alter the parent id of the nodesToMakeCompound
      if (parentId != oldParentId || removedNode._private.data.source) {
        continue;
      }

      removedNode._private.data.parent = newParentId;
      if(removedNode._private.parent){
        delete removedNode._private.parent;
      }
    }

    cy.add(removedNodes);
    cy.nodes().updateCompoundBounds();
   // refreshPaddings();
//    removedNodes.restore();
  }
};
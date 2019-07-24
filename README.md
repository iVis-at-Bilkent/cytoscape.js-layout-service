Cytoscape.js Layout Web Service
================================================================================

This repository implements a web service for [Cytoscape.js](http://js.cytoscape.org/) layouts. Applications not directly working on a Cytoscape.js canvas or applications that prefer a backend service for layout may use this as a service.

A sample server deployment along with a simple client-side demo can be found [here](https://cytoscape-layout-service.herokuapp.com/).

### Supported formats
This web service supports the following input formats for graphs:
- [JSON](https://www.json.org/)
- [GraphML](http://graphml.graphdrawing.org/)
- [SBGN-ML](https://github.com/sbgn/sbgn/wiki/SBGN_ML)

### Supported layouts
The supported layout styles are:
- [fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [cose-bilkent](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [cise](https://github.com/iVis-at-Bilkent/cytoscape.js-cise)
- [cose](https://github.com/iVis-at-Bilkent/cytoscape.js-cose)
- [dagre](https://github.com/cytoscape/cytoscape.js-dagre)
- [klay](https://github.com/cytoscape/cytoscape.js-klay)
- [avsdf](https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf)
- [cola](https://github.com/cytoscape/cytoscape.js-cola)
- [euler](https://github.com/cytoscape/cytoscape.js-euler)

## Usage
Request to layout the graph:
```
POST /layout/:file_format
```
needs to be send to https://cytoscape-layout-service.herokuapp.com, and the type of the request must be 'text' or 'text/plain'.
By default nodes with their positions (x,y) and their dimension (width, height) if given will be returned. If you want edges to be returned as well, you should set edges option to the request, which is false by default:
```
POST /layout/:file_format?edges=true
```

The format of the request depends on the format used for specifying the topology of the underlying graph as described below.

In any case it contains an array where the first element of the array is also an array that consists of the topology of the graph (JSON, GraphML or SBGN-ML), and the second element is a JSON object, where the options for the layout are defined needs to be passed as a body of the request. Name field of the options body must be specified, other fields are optional. 

If user wants to provide ```width``` and ```height``` for each node individually, they should include them in the data object as in the samples below.

- [Sample JSON request body (width, height are included)](https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/public/samples/json_sample_width_height.json)

- [Sample JSON request body (simplest form)](https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/public/samples/sample4-compoundless-json.txt)

- [Sample SBGN-ML request body] (https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/public/samples/sample7-compoundless-sbgnml.txt)

- [Sample GraphML request body] (https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/public/samples/sample1-compoundless-graphml.txt)

After the request is sent, the server will layout the given graph and return the JSON file with the node names and their positions.
If an error occurs, the response of the server will consist of the error's body.

### Compounds
Compounds are supported built into the SBGN-ML format (e.g. molecular complexes and compartments). Similarly the server will recognize compound structures in GraphML and JSON formats as well. Conventions used by Cytoscape.js for representing compounds with GraphML and JSON formats are supported by this web service.

### Clusters
Clusters are supported only in GraphML and JSON formats. In JSON format, clusterID field has to go to the data section of each node that has a cluster assigned to it. Similarly, in GraphML, clusterID key needs to be provided for each node that is part of a cluster.  

## Third-party libraries:
Following is a list of third-party libraries used in building this web service:
- [express](https://www.npmjs.com/package/express)
- [sbgnml-to-cytoscape](https://www.npmjs.com/package/sbgnml-to-cytoscape)
- [jsdom](https://www.npmjs.com/package/jsdom)
- [jQuery](https://www.npmjs.com/package/jquery)
- [cytoscape-graphml](https://www.npmjs.com/package/cytoscape-graphml)
- [cytoscape-fcose](https://www.npmjs.com/package/cytoscape-fcose)
- [cytoscape-cose-bilkent](https://www.npmjs.com/package/cytoscape-cose-bilkent)
- [cytoscape-dagre](https://www.npmjs.com/package/cytoscape-dagre)
- [cytoscape-klay](https://www.npmjs.com/package/cytoscape-klay)
- [cytoscape-avsdf](https://www.npmjs.com/package/cytoscape-avsdf)
- [cytoscape-cola](https://www.npmjs.com/package/cytoscape-cola)
- [cytoscape-euler](https://www.npmjs.com/package/cytoscape-euler)
- [cytoscape-spread](https://www.npmjs.com/package/cytoscape-spread)
- [cytoscape-cise](https://www.npmjs.com/package/cytoscape-cise)




 

 


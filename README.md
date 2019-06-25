cytoscape-web-service
================================================================================

Web-service on cytoscape.js to layout graphs

Deployed at:
https://cytoscape-layout-service.herokuapp.com/

## Supported formats
This web-server supports 3 input formats for graphs:
1. SBGN-ML
2. GraphML
3. JSON

## Instructions on how to send a request
In order to layout any graph, POST request to the: https://cytoscape-layout-service.herokuapp.com/layout/:file_format needs to be send, and the type of the request must be 'text' or 'text/plain'.

The format of the request depends on a format of the graph nodes and edges:
#### JSON:
Array where the first element of the array will also be an array that will consist of nodes and edges of the graph, and the second element will be JSON object where the options for the layout will be specified. Name field of the layout must be specified, while other fields are optional.

- [Sample JSON request body](https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/demo/sbgnml-body)

#### SBGN-ML or GraphML:
First comes nodes and edges of the graph in either of two formats then the options body for the cytoscape.js in JSON.
- [Sample SBGN-ML request body](https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/demo/sbgnml-body)
- [Sample GraphML request body](https://github.com/iVis-at-Bilkent/cytoscape-web-service/blob/master/demo/graphml-body)


After the request is sent, the server will layout the given graph and return the JSON file with the node names and their positions.
If an error occurs, the response of the server will consist of the error's body.

## Supported layouts
The supported layouts are:
- [fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [cose-bilkent](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [cose](https://github.com/iVis-at-Bilkent/cytoscape.js-cose)
- [dagre](https://github.com/cytoscape/cytoscape.js-dagre)
- [klay](https://github.com/cytoscape/cytoscape.js-klay)
- [avsdf](https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf)
- [cola](https://github.com/cytoscape/cytoscape.js-cola)
- [euler](https://github.com/cytoscape/cytoscape.js-euler)
- [spread](https://github.com/cytoscape/cytoscape.js-spread)
  cise(coming soon)
 


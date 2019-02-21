import React, { Component } from "react";
import Graph from "react-graph-vis";
import refs from "./refs";
import sample from "./data";
import moment from "moment";

// const filterGraph = nodeId => {
//   // wir suchen uns relevante ids, dh solche, die mit dem zentral-node verbunden sind
//   const relevantIds = refs.edges
//     .filter(edge => edge.source === nodeId || edge.target === nodeId)
//     .reduce((previous, current) => {
//       previous.push(current.source);
//       previous.push(current.target);
//       return previous;
//     }, []);

//   const result = {
//     nodes: refs.nodes
//       .filter(node => relevantIds.includes(node.id))
//       //.filter(node => node.type === "case")
//       .map(node => {
//         node.size = node.id === nodeId ? 10 : 1;

//         if (node.label.includes("-")) {
//           const parts = node.label.split("-");
//           node.label = `${parts[0].toUpperCase()} – ${parts[4].toUpperCase()} ${parts[5].toUpperCase()}/${parts[6].toUpperCase()}`;
//         }

//         return node;
//       }),
//     edges: refs.edges
//       .filter(
//         edge =>
//           relevantIds.includes(edge.target) &&
//           relevantIds.includes(edge.source)
//       )
//       .map(edge => {
//         edge.type = "arrow";
//         if (Math.random() > 0.5) {
//           edge.size = 200;
//         } else {
//           edge.size = 1;
//         }
//         return edge;
//       })
//   };

class App extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}

  render() {
    // nodeId wählt der Nutzer aus
    const formatGraph = graph => {
      // graph.nodes.push({
      //   nodeId: "82520",
      //   date: "2019-02-20",
      //   name: "VIII ZR 245/16"
      // });

      console.log("graph", graph);
      graph.nodes = graph.nodes.map(node => {
        return {
          id: node.nodeId,
          label: `${node.name} vom ${node.date} (ID: ${node.nodeId})`,
          size: node.numberCitations + 1,
          date: node.date
        };
        // node.id = node.nodeId;
        // node.label = node.name;
        // node.size = 10;
        // return node;
      });

      const rootNodeDate = moment(
        graph.nodes.find(node => node.id === "82520").date
      );

      console.log("rootNodeDate", rootNodeDate);

      graph.edges = graph.edges.map((edge, edgeId) => {
        // edge.source = edge.sourceId;
        // edge.target = edge.targetId;
        // edge.size = 10;
        // edge.id = Math.round(Math.random() * 1000);
        // edge.label = Math.round(Math.random() * 1000);
        return {
          id: String(edgeId),
          to: edge.sourceId,
          from: edge.targetId,
          length:
            Math.abs(
              moment(
                graph.nodes.find(node => node.id === edge.sourceId).date
              ).diff(rootNodeDate, "days")
            ) * 10

          // label: "Label" + String(edgeId)
        };
      });

      return graph;
    };

    let myGraph = {
      nodes: [{ id: "n1", label: "Alice" }, { id: "n2", label: "Rabbit" }],
      edges: [{ id: "e1", from: "n1", to: "n2", label: "SEES" }]
    };

    return (
      <div className="App" style={{ padding: "20px" }}>
        <Graph
          graph={formatGraph(sample)}
          style={{ width: "100vw", height: "100vh" }}
        />

        {/* <Sigma graph={myGraph} settings={{ drawEdges: true, clone: false }}>
          <RelativeSize initialSize={15} />
          <RandomizeNodePositions />
        </Sigma>
        <Sigma
          renderer="canvas"
          graph={formatGraph(sample)}
          settings={{
            drawEdges: true,
            drawEdgeLabels: true,
            clone: false,
            minEdgeSize: 0.1,
            maxEdgeSize: 3,
            minNodeSize: 0,
            maxNodeSize: 10,
            minArrowSize: 1,
            maxArrowSize: 100
          }}
        >
          <RelativeSize initialSize={1} />
          <RandomizeNodePositions />
        </Sigma> */}
      </div>
    );
  }
}

export default App;

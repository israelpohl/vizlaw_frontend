import React, { Component } from "react";
import Graph from "react-graph-vis";
import moment from "moment";
import { Input, Icon, Row, Col, List, Tag, Button, Alert, Tooltip } from "antd";
import "antd/dist/antd.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: { nodes: [], edges: [] },
      favorites: []
    };
  }

  // async componentDidMount() {
  //   await this.load(this.state.rootNodeId);
  // }

  async saveAsPDF() {
    this.setState({ loading: true });
    this.setState({ savingAsPdf: true });
    console.log("FAVORITES", this.state.favorites);
    const form = new FormData();
    form.append("favorites", JSON.stringify(this.state.favorites));

    const result = await fetch("/pdf", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ favorites: this.state.favorites })
    });

    console.log("RESULT", result);

    if (result.status === 200) {
      this.setState({ pdfReady: true });
    }
    this.setState({ savingAsPdf: false });
    this.setState({ loading: false });
  }

  async load(id) {
    this.setState({ loading: true });
    const result = await fetch(
      `https://vizlaw-api.azurewebsites.net/api/values/${id}`,
      {
        mode: "cors",
        headers: {
          Authorization: "Token " + "f268accea9dda3efb1837afe34b3a663ecb8af98",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "application/json"
        }
      }
    );

    console.log("result", result);
    const json = await result.json();
    console.log("JSON", json);
    console.log("GRAPH", this.state.graph);
    this.setState({
      graph: {
        nodes: [...this.state.graph.nodes, ...json.nodes],
        edges: [...this.state.graph.edges, ...json.edges]
      }
    });
    this.setState({ loading: false });
  }

  async search(searchTerm) {
    this.setState({ loading: true });
    const url =
      `https://vizlaw-api.azurewebsites.net/api/search?searchQuery=` +
      searchTerm.replace(" ", "+");
    const result = await fetch(url, {
      //      mode: "cors",
      //      headers: {
      //        Authorization: "Token " + "f268accea9dda3efb1837afe34b3a663ecb8af98",
      //        "Access-Control-Allow-Origin": "*",
      //        "Access-Control-Allow-Headers": "application/json"
      //      }
    });
    const json = await result.json();
    console.log("searchResults", json);
    this.setState({ searchResults: json });
    this.setState({ loading: false });
  }

  render() {
    // nodeId wählt der Nutzer aus
    const formatGraph = () => {
      const { graph } = this.state;
      console.log("graph", graph);
      graph.nodes = graph.nodes.map(node => {
        node.id = node.nodeId;
        node.label = node.name;
        node.shape = "dot";
        node.value = node.numberCitations;
        // node.widthConstraint = { minimum: node.numberCitations * 1.5 };
        // node.heightConstraint = { minimum: node.numberCitations * 1.5 };
        switch (node.court) {
          case "Bundesgericht":
            node.color = "#d21534";
            break;
          case "Landesgericht":
            node.color = "#cb7275";
            break;
          case "Oberlandesgericht":
            node.color = "#cb7275";
            break;
          default:
            node.color = "#c79294";
            break;
        }

        return node;
      });

      console.log("rootNodeId", this.state.rootNodeId);

      const rootNode = graph.nodes.find(
        node => node.id === this.state.rootNodeId
      );
      console.log("ROOTNODE", rootNode);

      //const rootNodeDate = moment(rootNode.date);
      console.log("passed .date");

      //console.log("rootNodeDate", rootNodeDate);

      console.log("nodes", graph.nodes);
      console.log("edges", graph.edges);

      graph.edges = graph.edges.map((edge, edgeId) => {
        edge.id = String(edgeId);
        edge.to = edge.sourceId;
        edge.from = edge.targetId;
        edge.length =
          Math.abs(
            moment(
              graph.nodes.find(node => {
                console.log(node.id, edge.sourceId, edge.id);
                return node.id === edge.sourceId;
              }).date
            ).diff(moment(), "days")
          ) * 0.1;
        return edge;
      });

      return graph;
    };

    return (
      <div className="App" style={{ padding: "10px" }}>
        <Row>
          <Col span={5}>
            <a href="https://vizlaw.de/#section_contact">Imprint/Legal</a> |{" "}
            <Tooltip
              placement="rightBottom"
              title={
                <span>
                  – Node Size = degree of incoming citations (i.e. number of
                  other cases referring to the specific case)
                  <br />
                  <br />
                  – Node Color = the court's level in the court hierarchy (from
                  light red for district courts to dark red for federal courts)
                  <br />
                  <br />
                  – Edge Length = time distance of the cases connected by the
                  edge
                </span>
              }
            >
              {" "}
              <b>Help</b>{" "}
            </Tooltip>
            <div
              style={{
                position: "absolute",
                left: "10px",
                top: "10px",
                fontSize: "300%",
                color: "#fe294c"
              }}
            >
              <Icon type={this.state.loading ? "loading" : null} />
            </div>
            <img
              alt="Logo"
              src="https://i.imgur.com/uWmKFYV.png"
              style={{ maxWidth: "100%" }}
            />
            {!window.chrome && (
              <Alert
                showIcon={true}
                banner
                type="error"
                message="Warning: VIZ.LAW works best with Google Chrome."
              />
            )}
            <Input.Search
              style={{ width: "100%" }}
              size="large"
              placeholder="Enter search term..."
              value={this.state.searchTerm}
              onChange={e => {
                this.setState({ searchTerm: e.target.value });
              }}
              onSearch={value => this.search(value)}
            />
            {this.state.searchResults && (
              <div style={{ maxHeight: "50vh", overflow: "scroll" }}>
                <List
                  bordered={true}
                  dataSource={this.state.searchResults}
                  renderItem={item => (
                    <List.Item
                      onClick={() => {
                        this.setState({ loading: true });
                        this.setState(
                          {
                            selectedId: String(item.id),
                            rootNodeId: String(item.id)
                          },
                          () => {
                            this.load(String(item.id));
                          }
                        );
                        this.setState({ loading: false });
                      }}
                    >
                      {item.file_number} <br />
                      {item.court.name} <br />
                      {item.date}
                      {/* 
                      {item.slug.split("-")[0].toUpperCase()}:{" "}
                      {item.slug.split("-")[4].toUpperCase()}{" "}
                      {item.slug.split("-")[5].toUpperCase()}/
                      {item.slug.split("-")[6]}({item.slug.split("-")[3]}.
                      {item.slug.split("-")[2]}.{item.slug.split("-")[1]} */}
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Col>
          <Col span={11}>
            {this.state.favorites.length > 0 && <h2>Saved results</h2>}

            {this.state.favorites.map(favorite => (
              <span>
                <Tag
                  size="large"
                  style={{ fontSize: "200%" }}
                  color="#d21534"
                  onClick={async () => {
                    this.setState({ loading: true });
                    const fetchResult = await fetch(
                      `https://vizlaw-api.azurewebsites.net/api/search?DecisionId=${
                        favorite.id
                      }`,
                      {
                        mode: "cors",
                        headers: {
                          Authorization:
                            "Token " +
                            "f268accea9dda3efb1837afe34b3a663ecb8af98",
                          "Access-Control-Allow-Origin": "*",
                          "Access-Control-Allow-Headers": "application/json"
                        }
                      }
                    );
                    const json = await fetchResult.json();

                    console.log("selectedDetailResult", json);
                    this.setState({ selectedDetail: json });
                    this.setState({ loading: false });
                  }}
                >
                  {favorite.slug}
                </Tag>
              </span>
            ))}
            {this.state.favorites.length > 0 && (
              <div>
                {this.state.pdfReady ? (
                  <Button href="/results.pdf">Download PDF</Button>
                ) : (
                  <Button
                    loading={this.state.savingAsPdf}
                    type="primary"
                    onClick={this.saveAsPDF.bind(this)}
                  >
                    <span>Prepare PDF for export...</span>
                  </Button>
                )}
              </div>
            )}
            {this.state.selectedId &&
              (this.state.graph.nodes.length > 0 ? (
                <Graph
                  graph={formatGraph()}
                  style={{ width: "50vw", height: "100vh" }}
                  events={{
                    selectNode: async event => {
                      this.setState({ loading: true });
                      const { nodes } = event;
                      const selectedNodeId = nodes[0];
                      this.setState({ selectedNodeId });
                      console.log("selectedNodeId", selectedNodeId);

                      const fetchResult = await fetch(
                        `https://vizlaw-api.azurewebsites.net/api/search?DecisionId=${selectedNodeId}`,
                        {
                          mode: "cors",
                          headers: {
                            Authorization:
                              "Token " +
                              "f268accea9dda3efb1837afe34b3a663ecb8af98",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "application/json"
                          }
                        }
                      );
                      const json = await fetchResult.json();

                      console.log("selectedDetailResult", json);
                      this.setState({ selectedDetail: json });
                      // this.loadDetail(selectedNodeId);
                      //this.load(selectedNodeId);
                      this.setState({ loading: false });
                    }
                  }}
                />
              ) : (
                <span style={{ fontSize: "500%" }} />
              ))}
          </Col>
          <Col span={8} style={{ maxHeight: "100vh", overflow: "scroll" }}>
            {this.state.selectedDetail && (
              <div>
                <h2>
                  <Icon
                    onClick={() => {
                      this.setState({
                        favorites: [
                          ...this.state.favorites,
                          this.state.selectedDetail
                        ]
                      });
                    }}
                    style={{ color: "#d21534" }}
                    type="star"
                  />{" "}
                  <Icon
                    onClick={() => {
                      const oldItems = this.state.favorites;
                      const valueToRemove = this.state.selectedDetail;
                      const filteredItems = oldItems.filter(
                        item => item !== valueToRemove
                      );
                      console.log(
                        "oncklick",
                        this.state.favorites,
                        this.state.selectedDetail,
                        valueToRemove,
                        filteredItems
                      );
                      this.setState({
                        favorites: filteredItems
                      });
                    }}
                    style={{ color: "#d21534" }}
                    type="delete"
                  />{" "}
                  <Icon
                    style={{ color: "#f3464d" }}
                    type="plus"
                    onClick={() => {
                      this.setState(
                        {
                          selectedId: String(this.state.selectedNodeId),
                          rootNodeId: String(this.state.selectedNodeId)
                        },
                        () => {
                          this.load(String(this.state.selectedNodeId));
                        }
                      );
                    }}
                  />{" "}
                  {this.state.selectedDetail.name}
                </h2>
                <h1 style={{ color: "#d21534" }}>
                  {this.state.selectedDetail.file_number}
                </h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.state.selectedDetail.content
                  }}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;

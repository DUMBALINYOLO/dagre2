import React, { useRef, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
import dagre from "cytoscape-dagre";
import edgehandles from "cytoscape-edgehandles";
import edgehandlesOptions from "./edgehandlesOptions";
import "./styles.css";
import { get } from "lodash";

cytoscape.use(dagre);
cytoscape.use(popper);
cytoscape.use(edgehandles);

const stylesheet = [
  {
    selector: "node",
    style: {
      label: "data(id)",
      shape: "roundrectangle",
      width: "360",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": "grey",
      "border-color": "black",
      "border-width": 2
    }
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "target-arrow-shape": "triangle",
      "line-color": "green",
      "target-arrow-color": "red",
      "curve-style": "bezier"
    }
  }
];

const CytoNode = (id, label, posX = 0, posY = 0) => ({
  data: {
    id,
    label
  },
  position: {
    x: posX,
    y: posY
  }
});

const CytoEdge = (source, target, label) => ({
  data: { source, target, label }
});


export default function MyApp() {
  const cyRef = useRef();
  const popperRef = useRef();
  const contextMenuRef = useRef();

  const clearRefs = (...refs) =>
    refs.forEach(
      (ref) =>
        ref.current && !ref.current.state.isDestroyed && ref.current.destroy()
    );

  const elements = CytoscapeComponent.normalizeElements({
    nodes: [
      CytoNode("one", "Node 1"),
      CytoNode("two", "Node 2"),
      CytoNode("three", "Node 3"),
      CytoNode("four", "Node 4")
    ],
    edges: [
      CytoEdge("one", "two", "Edge from Node1 to Node2"),
      CytoEdge("one", "three", "Edge from Node1 to Node3")
    ]
  });
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on("tap", (event) => {
        clearRefs(popperRef, contextMenuRef);
        console.log(event);
        const label = get(event, "target._private.data.label");
        if (label) {
          popperRef.current = event.target.popper({
            content: () => {
              const div = document.createElement("div");
              div.innerHTML = `<p>${label}</p><div class="popper__arrow" x-arrow=""></div>`;
              div.setAttribute("class", "popper");
              document.body.appendChild(div);
              return div;
            },
            popper: { removeOnDestroy: true }
          });
        }
      });
      cyRef.current.on("pan zoom resize position", () => {
        clearRefs(popperRef, contextMenuRef);
      });
      cyRef.current.on("cxttap", (event) => {
        clearRefs(popperRef, contextMenuRef);
        const label = get(event, "target._private.data.label");
        if (label) {
          contextMenuRef.current = event.target.popper({
            content: () => {
              const div = document.createElement("div");
              div.innerHTML = `
              <div>option1</div>
              <div>option2</div>
              <div>option3</div>
            `;
              document.body.appendChild(div);
              return div;
            },
            popper: { removeOnDestroy: true }
          });
        }
      });
      cyRef.current.on("cxttap", (e) => {
        if (e.target === cyRef.current) {
          console.log("cxttap on background");
        } else if (e.target.isEdge()) {
          console.log("cxttap on edge");
          cyRef.current.remove(e.target);
        } else {
          console.log("cxttap on node"); // e.target.isNode()
        }
      });
      const eh = cyRef.current.edgehandles(edgehandlesOptions);
      eh.enableDrawMode();
    }
    return () => {
      clearRefs(cyRef, popperRef, contextMenuRef);
    };
  }, []);

  return (
    <CytoscapeComponent
      cy={(cy) => (cyRef.current = cy)}
      stylesheet={stylesheet}
      elements={elements}
      layout={{ name: "dagre" }}
      style={{ width: "100%", height: "600px", border: "1px dashed red" }}
    />
  );
}

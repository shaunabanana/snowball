<script setup>
import { ref, onMounted, watch, useTemplateRef } from 'vue';
import * as d3 from "d3";
import { nanoid } from 'nanoid';

const props = defineProps({
    seeds: Array,
    papers: Array,
    relations: Array,
    selected: Array,
})
const emit = defineEmits(['hover'])

let svg, canvas;
let width, height;
let lines, circles;
let simulation;
let nodes = [], edges = [], highlight = false;
let initialized = false;

const id = ref(nanoid());

onMounted(() => {
    console.log(props.papers, props.relations);

    if (!initialized) {
        svg = d3.select(document.getElementById(id.value));
        console.log(svg);

        console.log(svg.node().getBoundingClientRect());
        width = svg.node().getBoundingClientRect().width;
        height = svg.node().getBoundingClientRect().height;
        console.log(width, height);

        canvas = svg.append('g');
        lines = canvas // Create d3 selection for lines
            .append('g')
            .attr('class', 'link')
            .selectAll('line');
        circles = canvas // Create d3 selection for circles
            .append('g')
            .attr('class', 'node')
            .selectAll('circle');

        svg.call(
                d3.zoom().on('zoom', (event) => {
                    circles.style('opacity', 1);
                    lines.style('opacity', 1);
                    canvas.attr('transform', event.transform);
                })
            ) // Event listener to enable zoom by scrolling
            .on('dblclick.zoom', null); // Disable double click zooming
        
        // Center the canvas
        // canvas.attr('transform', `translate(${width / 2},${height / 2})`);
        simulation = d3
            .forceSimulation()
            .force(
                'link',
                d3.forceLink().id((d) => {
                    return d.id;
                })
            )
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('xattract', d3.forceX())
            .force('yattract', d3.forceY());

        console.log(svg, canvas, lines, circles);
        initialized = true;
    }
    drawGraph(props.seeds, props.papers, props.relations);
})

// [INFO] The visualization code below is based on Citation Gecko (https://github.com/CitationGecko/gecko-react)

function drawGraph(seeds, papers, relations) {
    if (highlight) {
        console.log(highlight);
        highlightNode(highlight);
    } else {
        circles.style('opacity', 1);
        lines.style('opacity', 1);
    }

    console.log(svg.node())
    console.log(svg.node().getBoundingClientRect());
    width = svg.node().getBoundingClientRect().width;
    height = svg.node().getBoundingClientRect().height;
    console.log(width, height);

    console.log(seeds);

    const allPapers = seeds
        .map(p => ({...p, seed: true}))
        .concat(papers);

    const existingNodeIDs = nodes.map(n => n.id);
    allPapers.forEach(p => {
        p.x = 0;
        p.y = 0;
    })
    const newNodes = allPapers
        .filter(p => !existingNodeIDs.includes(p.id));

    // Update nodes
    nodes = nodes
        .filter(n => allPapers.filter(p => p.id === n.id).length > 0) // filter dead nodes
        // .map(n => {
        //     return { ...n, ...papers[n.id] }; // update existing info
        // })
        .concat(newNodes); // add new nodes

    console.log(nodes);
    
    // Update edges
    edges = relations.map(e => {
        return {
            id: e.source + e.target,
            source: allPapers.find(p => p.id === e.source),
            sourceId: e.source,
            target: allPapers.find(p => p.id === e.target),
            targetId: e.target
        };
    });
    edges = edges.filter(e => {
        if (!(e.source && e.target)) console.error(e);
        return e.source && e.target
    });
    console.log(edges);

    if (nodes.length !== existingNodeIDs.length) {
        circles = circles.data(nodes, p => p.id).join('circle');
    }

    // Update the svg circles to match simulation
    circles = circles
        .data(nodes, p => p.id)
        .attr('r', p => {
            // [TODO] Port sizeMetric
            return nodeSize(p);
        })
        // [TODO] Port seed highlight
        .attr('class', function(d) {
            if (d.seed) {
                return 'seed-node';
            } else {
                return 'node';
            }
        })
        .attr('id', d => d.id)
        .html(d => `<title>${d.title} (${d.record["is-referenced-by-count"]} citations)</title>`)
        // [TODO] Port drag handlers
        // .call(
        //     d3
        //     .drag()
        //     .on('start', d => dragstarted(d, simulation))
        //     .on('drag', d => dragged(d))
        //     .on('end', d => dragended(d, simulation))
        // )
        .on("mouseenter", event => {
            emit('hover', event.target.textContent);
            highlight = event.target.id;
            console.log("highlight");
            event.stopPropagation();
        })
        .on('click', event => {
            // [TODO] Port onSelect()
            // onSelect(p);
            highlightNode(highlight);
            event.stopPropagation();
        });

    svg.on('click', () => {
        // [TODO] Port onSelect()
        // onSelect(null);
        highlight = null;
        highlightNode(highlight);
        console.warn("onSelect() not ported yet!");
        circles.style('opacity', 1);
        lines.style('opacity', 1);
        emit('hover', "");
    });

    // Update svg lines to match simulation
    lines = lines.data(edges, d => d.id).join('line');

    // Update and restart the simulation.
    simulation.nodes(nodes).on('tick', () => tick());
    simulation.force('link').links(edges);
    simulation.force(
        'collide',
        d3.forceCollide().radius(function(d) {
            return nodeSize(d);
        })
    );
    simulation.force('collide').initialize(simulation.nodes());

    if (newNodes.length) {
        simulation.alpha(1).restart();
    }
}


function tick() {
  lines
    .attr('x1', function(d) {
        return d.source.x;
    })
    .attr('y1', function(d) {
        return d.source.y;
    })
    .attr('x2', function(d) {
        return d.target.x;
    })
    .attr('y2', function(d) {
        return d.target.y;
    });
  circles
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    });
}

function nodeSize(p, sizeMetric) {
    // [TODO] Port sizeMetric
    if (p.seed) return 10;
    if (p.record["is-referenced-by-count"]) {
        return Math.sqrt(p.record["is-referenced-by-count"] + 1) + 5;
    }
    return 5;
}

function findNeighbours(id, edges) {
    const targets = edges.filter(e => e.source.id === id).map(e => e.target.id);
    const sources = edges.filter(e => e.target.id === id).map(e => e.source.id);
    return targets.concat(sources);
}

function highlightNode(id) {
    const neighbours = findNeighbours(id, edges);
    circles.style('opacity', node => {
        return node.id === id || neighbours.includes(node.id) ? 1 : 0.15;
    });
    lines.style('opacity', edge => {
        return edge.source.id === id || edge.target.id === id ? 1 : 0.15;
    });
}



</script>

<template>
    <svg class="citation-graph" :id="id" ref="citation-graph"></svg>
</template>

<style>

svg.citation-graph {
    width: 100%;
    height: 100%;
}

.force-graph {
  width: 100%;
  height: 100%;
  display: block;
}

.node {
  stroke: #fff;
  stroke-width: 1px;
  fill: rgb(94, 94, 94);
}

.seed-node {
  stroke: #fff;
  stroke-width: 1px;
  fill: rgb(255, 199, 0);
}
.link line {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1.5px;
}
.node:hover,
.seed-node:hover {
  stroke: rgb(97, 97, 97);
  stroke-width: 2px;
}

</style>
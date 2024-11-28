<script setup>
import { ref, computed } from "vue";
import classNames from "classnames";
// import { DownloadSVG } from "core/ui/DownloadSVG";

const X_OFFSET = 100;
const Y_OFFSET = 50;
const X_GAP = 20;
const Y_GAP = 70;

const props = defineProps({
    seeds: Array,
    papers: Array,
    relations: Array,
})
const emit = defineEmits(['hover'])

const highlight = ref(null);

function groupBy(arr, field) {
  return arr.reduce((grouped, item) => {
    if (!item || !item[field]) return grouped;
    grouped[item[field]] = grouped[item[field]] ? [...grouped[item[field]], item] : [item];
    return grouped;
  }, {});
}

console.log(props.seeds, props.papers);

const allPapers = props.seeds
    .map(p => ({...p, seed: true}))
    .concat(props.papers);

const papersByYear = computed(() => groupBy(allPapers, "year"));
const years = computed(() => Object.keys(papersByYear.value).sort().reverse());
const maxHeight = computed(() => Y_OFFSET + Y_GAP * (years.value.length + 2));
const maxWidth = 10000;

const getConnections = (edges) =>
highlight.value ? edges.filter(e => e.source === highlight.value || e.target === highlight.value): [];

const getConnectingPath = (edge, nodes) => {
  const startPoint = [nodes[edge.source].x, nodes[edge.source].y];
  const endPoint = [nodes[edge.target].x, nodes[edge.target].y];
  const controlPoint1 = [nodes[edge.source].x, nodes[edge.source].y + Y_GAP / 2];
  const controlPoint4 = [nodes[edge.target].x, nodes[edge.target].y + Y_GAP / 2];

  if (nodes[edge.source].y == nodes[edge.target].y) {
    return `M ${startPoint} L ${controlPoint1} L${controlPoint4} L ${endPoint}`;
  }

  const controlPoint2 = [(2 * X_OFFSET) / 3, nodes[edge.source].y + Y_GAP / 2];
  const controlPoint3 = [(2 * X_OFFSET) / 3, nodes[edge.target].y + Y_GAP / 2];
  return `
    M ${startPoint} 
    L ${controlPoint1}
    L ${controlPoint2}
    L ${controlPoint3}
    L ${controlPoint4}
    L ${endPoint}
  `;
};

const getNodes = papers => {
  let nodes = {};
  const sortedPapers = papers.sort((a, b) => b.year - a.year);
  let seeds = papers.filter(p => p.seed);
  console.log("Seeds", seeds.length);
  let [lastX, lastY, lastR, lastYear] = [X_OFFSET, Y_OFFSET - Y_GAP, 0, 3000];
  for (let i = 0; i < sortedPapers.length; i++) {
    let paper = sortedPapers[i];
    // Sometimes a seed paper cites another seed paper, leading to the seed paper being overwritten by the snowballed citation, which is marked non-seed. In this case, we skip overwriting if the already existing record is a seed paper.
    if (nodes[paper.id] && nodes[paper.id].paper.seed) continue;

    // let sizeMetric = paper["seedsCitedBy"] + paper["seedsCited"];
    let sizeMetric = Math.sqrt((paper.record["is-referenced-by-count"] || 0) + 1);
    let r = paper.seed ? 10 : 10 + ((Y_GAP / 6 - 5) * (sizeMetric - 1)) / seeds.length;
    if (paper.year < lastYear) {
      lastY += Y_GAP;
      lastYear = paper.year;
      lastX = X_OFFSET;
    } else {
      lastX += lastR + X_GAP + r;
    }
    lastR = r;
    nodes[paper.id] = {
      id: paper.id,
      x: lastX,
      y: lastY,
      r,
      paper,
    };
  }
  return nodes;
};

const nodes = computed(() => getNodes(allPapers));
const edges = computed(() => getConnections(props.relations));

console.log("TimelineView", nodes, edges)
console.log("TimelineView", Object.values(nodes.value).length, allPapers.length)

const isHighlighted = node =>
  !edges.value.length
    ? true
    : edges.value
        .map(e => e.target)
        .concat(edges.value.map(e => e.source))
        .some(id => node.id == id);


function onSelect(paper) {
    if (paper) {
        const hoverText = `${paper.title} (${paper.record['is-referenced-by-count']} citations)`;
        highlight.value = paper.id;
        emit('hover', hoverText );
    }
    else highlight.value = null;
}

function onHover(paper) {
    const hoverText = `${paper.title} (${paper.record['is-referenced-by-count']} citations)`;
    if (highlight.value) return;
    emit('hover', hoverText );
}
</script>

<template>
  <div class="timeline-container">
    <!-- <DownloadSVG id="timeline" /> -->
    <svg
      id="timeline"
      :width="maxWidth"
      :height="maxHeight"
      @click="onSelect(null)"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g key="axis">
        <g v-for="(year, i) in years" :key="year">
          <text :x="10" :y="5 + Y_OFFSET + i * Y_GAP">{{ year }}</text>
          <line
            :x1="25"
            :y1="5 + Y_OFFSET + i * Y_GAP + 10"
            :x2="25"
            :y2="5 + Y_OFFSET + (i + 1) * Y_GAP - 20"
            stroke="black"
            :stroke-dasharray="year - years[i + 1] > 1 ? '4' : null"
          />
        </g>
      </g>
      <g key="edges">
        <path
          v-for="edge in edges"
          :key="edge.source + '-' + edge.target"
          :d="getConnectingPath(edge, nodes)"
          fill="none"
          stroke="grey"
          stroke-width="1"
        />
      </g>
      <g key="nodes">
        <circle
          v-for="node in nodes"
          :key="node.paper.id"
          @mouseenter="onHover(node.paper)"
          @click.stop="onSelect(node.paper)"
          :class="{
            'highlighted': node.paper.id === highlight,
            'seed-node': node.paper.seed,
            'node': !node.paper.seed,
            'hide': !isHighlighted(node),
          }"
          :r="node.r"
          :cx="node.x"
          :cy="node.y"
        >
          <title>{{ node.paper.title }}</title>
        </circle>
      </g>
    </svg>
  </div>
</template>

<style>
.timeline-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.node {
  stroke: #fff;
  stroke-width: 1px;
  fill: rgb(128, 128, 128);
}
.seed-node {
  stroke: #fff;
  stroke-width: 1px;
  fill: rgb(255, 199, 0);
}
.link {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1.5px;
}
.node:hover,
.seed-node:hover {
  stroke: rgb(97, 97, 97);
  stroke-width: 2px;
  cursor: pointer;
}

.highlighted {
  stroke: rgb(20, 20, 20) !important;
  stroke-width: 2px !important;
}

.hide {
  opacity: 0.2;
}
</style>
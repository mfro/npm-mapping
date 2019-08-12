import './style.scss';
import * as d3 from 'd3';
import output from '../../output.json';

interface Dep {
    key: string,
    name: string,
    version: string,
    deps: string[],
}

let svg = d3.select('svg');
let width = window.innerWidth;
let height = window.innerHeight;

let simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d: any) => d.name + d.version))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('center', d3.forceCenter(width / 2, height / 2));

let links = [];

let lookup = new Map<string, Dep>();
for (let node of output)
    lookup.set(node.key, node);

for (let node of output) {
    for (let dep of node.deps) {
        links.push({
            source: node,
            target: lookup.get(dep)!,
        });
    }
}

console.log(output.length);
let active: Dep | null = null;

let link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter().append('line');

let node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('line')
    .data(output)
    .enter().append('g')
    .on('mouseenter', d => active = d)
    .on('mouseleave', d => active == d && (active = null))
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

let circles = node.append('rect')
    .attr('width', 10)
    .attr('height', 10);

var labels = node.append("text")
    .text((d: any) => d.key)
    .attr('x', 6)
    .attr('y', 3);

simulation
    .nodes(output)
    .on('tick', ticked);

(simulation.force('link') as d3.ForceLink<any, any>)
    .links(links);

function ticked() {
    for (let i = 0; i < link.size(); ++i) {
        let datum = link.data()[i] as any;
        let line = link.nodes()[i];
        let x1 = datum.source.x;
        let y1 = datum.source.y;
        let x2 = datum.target.x;
        let y2 = datum.target.y;
        let dX = x2 - x1;
        let dY = y2 - y1;
        let len = Math.sqrt(dX * dX + dY * dY);
        let rX = dX / len;
        let rY = dY / len;
        line.setAttribute("x1", `${x1 + rX * 6}`);
        line.setAttribute("y1", `${y1 + rY * 6}`);
        line.setAttribute("x2", `${x2 - rX * 6}`);
        line.setAttribute("y2", `${y2 - rY * 6}`);
    };

    function isActive(n: Dep): boolean {
        if (n == active) return true;
        if (active == null) return false;
        for (let key of n.deps) {
            if (isActive(lookup.get(key)!))
                return true;
        }
        return false;
    }

    node.attr("class", (d: any) => {
        return isActive(d) ? "active" : "";
    });

    node.attr("transform", (d: any) => {

        return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";
    })
}

function dragstarted(d: any) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d: any) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d: any) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const container = document.querySelector('.projects');
renderProjects(projects, container, 'h2');
document.querySelector('.projects-title').textContent = `Projects (${projects.length})`;

let data = [1, 2];
let colors = ['gold', 'purple'];

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);

let arcs = arcData.map((d) => arcGenerator(d));

arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors[idx]);
});

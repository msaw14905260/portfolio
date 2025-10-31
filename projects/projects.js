import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleEl = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

const svg = d3.select('#projects-plot');
const legendEl = d3.select('.legend');

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  svg.selectAll('*').remove();
  legendEl.selectAll('*').remove();

  if (newData.length === 0) return;

  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arc = d3.arc().innerRadius(0).outerRadius(50);

  newArcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arc(d))
      .attr('fill', colors(i));
  });

  newData.forEach((d, i) => {
    legendEl.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

function renderAll(projectsGiven) {
  renderProjects(projectsGiven, projectsContainer, 'h2');
  titleEl.textContent = `Projects (${projectsGiven.length})`;
  renderPieChart(projectsGiven);
}

// initial render
renderAll(projects);

// live search (use 'change' if you want Enter/blur only)
searchInput.addEventListener('input', (event) => {
  const q = (event.target.value || '').toLowerCase();
  const filteredProjects = projects.filter((p) =>
    Object.values(p).join('\n').toLowerCase().includes(q)
  );
  renderAll(filteredProjects);
});

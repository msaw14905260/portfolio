import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let selectedIndex = -1;
let selectedLabel = null;

const projects = await fetchJSON('../lib/projects.json');
let currentFilteredProjects = projects;

const projectsContainer = document.querySelector('.projects');
const titleEl = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

const svg = d3.select('#projects-plot');
const legendEl = d3.select('.legend');

function applyCardRender() {
  const base = currentFilteredProjects;
  const nextCards = (selectedLabel == null)
    ? base
    : base.filter(p => String(p.year) === String(selectedLabel));

  renderProjects(nextCards, projectsContainer, 'h2');
  if (titleEl) titleEl.textContent = `Projects (${nextCards.length})`;
}

function renderPieChart(projectsGiven) {
  const newRolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => d.year
  );

  const newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  svg.selectAll('*').remove();
  legendEl.selectAll('*').remove();

  if (newData.length === 0) return;

  selectedIndex = (selectedLabel == null)
    ? -1
    : newData.findIndex(d => String(d.label) === String(selectedLabel));

  if (selectedLabel != null && selectedIndex === -1) {
    selectedLabel = null;
    selectedIndex = -1;
  }

  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const newSliceGenerator = d3.pie().value(d => d.value);
  const newArcData = newSliceGenerator(newData);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const svgEl = svg;

  const applyHighlight = () => {
    svgEl.selectAll('path')
      .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));

    legendEl.selectAll('li')
      .attr('class', (_, idx) => (
        'legend-item' + (idx === selectedIndex ? ' selected' : '')
      ));
  };

  newArcData.forEach((d, i) => {
    svgEl.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : null)
      .on('click', () => {
        selectedLabel = (selectedIndex === i) ? null : newData[i].label;
        selectedIndex = (selectedLabel == null) ? -1 : i;
        applyHighlight();
        applyCardRender();
      });
  });

  newData.forEach((d, i) => {
    legendEl.append('li')
      .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedLabel = (selectedIndex === i) ? null : newData[i].label;
        selectedIndex = (selectedLabel == null) ? -1 : i;
        applyHighlight();
        applyCardRender();
      });
  });
}

function renderAll(projectsGiven) {
  currentFilteredProjects = projectsGiven;
  applyCardRender();
  renderPieChart(currentFilteredProjects);
}

renderAll(projects);

searchInput?.addEventListener('input', (event) => {
  const q = (event.target.value || '').toLowerCase();

  const nextFiltered = projects.filter(p =>
    Object.values(p).join('\n').toLowerCase().includes(q)
  );

  renderAll(nextFiltered);
});

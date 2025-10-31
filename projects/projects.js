import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let selectedIndex = -1;

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleEl = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let currentFilteredProjects = projects;

const svg = d3.select('#projects-plot');
const legendEl = d3.select('.legend');

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  svg.selectAll('*').remove();
  legendEl.selectAll('*').remove();

  if (newData.length === 0) return;

  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let svgEl = svg;
  svgEl.selectAll('path').remove();

  newArcData.forEach((d, i) => {
    svgEl
      .append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svgEl.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));

        legendEl.selectAll('li')
          .attr('class', (_, idx) =>
            'legend-item' + (idx === selectedIndex ? ' selected' : '')
          );

        const nextCards =
          selectedIndex === -1
            ? currentFilteredProjects
            : currentFilteredProjects.filter(
                (p) => String(p.year) === String(newData[selectedIndex].label)
              );

        renderProjects(nextCards, projectsContainer, 'h2');
        titleEl.textContent = `Projects (${nextCards.length})`;
      });
  });

  newData.forEach((d, i) => {
    legendEl
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svgEl.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));

        legendEl.selectAll('li')
          .attr('class', (_, idx) =>
            'legend-item' + (idx === selectedIndex ? ' selected' : '')
          );

        const nextCards =
          selectedIndex === -1
            ? currentFilteredProjects
            : currentFilteredProjects.filter(
                (p) => String(p.year) === String(newData[selectedIndex].label)
              );

        renderProjects(nextCards, projectsContainer, 'h2');
        titleEl.textContent = `Projects (${nextCards.length})`;
      });
  });
}

function renderAll(projectsGiven) {
  renderProjects(projectsGiven, projectsContainer, 'h2');
  titleEl.textContent = `Projects (${projectsGiven.length})`;
  renderPieChart(projectsGiven);
}

renderAll(projects);

searchInput.addEventListener('input', (event) => {
  const q = (event.target.value || '').toLowerCase();

  currentFilteredProjects = projects.filter((p) =>
    Object.values(p).join('\n').toLowerCase().includes(q)
  );

  selectedIndex = -1;
  renderAll(currentFilteredProjects);
});

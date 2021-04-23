document.addEventListener("DOMContentLoaded", () => {
  // URL for data needed to make this project
  // The first is education data in USA
  // The last is a topology data to create USA map
  const files = [
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json",
  ];

  // Get the canvas
  const svg = d3.select("#canvas");

  // Get the data required
  Promise.all(files.map((url) => d3.json(url)))
    .then((values) => {
      // Start draw the map when fetching is success
      drawMap(svg, values);
    })
    .catch((error) => {
      // Draw error message if fetching is fail
      drawError(svg);
    });
});

const drawMap = (svg, values) => {
  const eduData = values[0];
  // Change country data into geoJSON format
  const countryData = topojson.feature(values[1], values[1].objects.counties)
    .features;
  console.log(eduData, countryData);

  // Start draw the map
  svg
    .selectAll("path")
    .data(countryData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", d3.geoPath());
};

const drawError = (svg) => {
  svg
    .append("text")
    .attr("x", parseInt(svg.style("width")) / 2)
    .attr("y", parseInt(svg.style("height")) / 2)
    .attr("text-anchor", "middle")
    .html("Something went wrong!");
};

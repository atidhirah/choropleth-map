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
      console.log(error);
      drawError(svg);
    });
});

const drawMap = (svg, data) => {
  const eduData = data[0];
  const countryData = topojson.feature(data[1], data[1].objects.counties)
    .features;

  console.log(eduData);

  // Color will divide into 8 categories
  const minPercentage = d3.min(eduData, (d) => d["bachelorsOrHigher"]);
  const maxPercentage = d3.max(eduData, (d) => d["bachelorsOrHigher"]);
  const diff = maxPercentage - minPercentage;
  const colorScale = d3
    .scaleThreshold()
    .domain(d3.range(minPercentage, maxPercentage, diff / 8))
    .range(d3.schemeGreens[9]);

  // Start draw the map
  svg
    .selectAll("path")
    .data(countryData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", d3.geoPath())
    .attrs((d) => getCountyData(d.id, eduData, colorScale))
    .on("mousemove", (e, d) => onMouseMove(e, d.id, eduData))
    .on("mouseout", (e, d) => onMouseOut(e, d.id));
};

const getCountyData = (id, eduData, colorScale) => {
  let county = eduData.find((d) => d["fips"] === id);
  let [fips, percentage] = [county["fips"], county["bachelorsOrHigher"]];

  return {
    "data-fips": fips,
    "data-education": percentage,
    fill: colorScale(percentage),
  };
};

const onMouseMove = (e, id, eduData) => {
  let county = eduData.find((d) => d["fips"] === id);

  d3.select(e.currentTarget)
    .style("stroke", "blue")
    .style("stroke-width", "2px");

  d3.select("#tooltip")
    .style("display", "inline-block")
    .style("top", e.pageY - 50 + "px")
    .style("left", e.pageX - 30 + "px")
    .html(
      `<p>${county["area_name"]}, ${county.state}: ${county.bachelorsOrHigher} %</p>`
    );
};

const onMouseOut = (e) => {
  d3.select(e.currentTarget).style("stroke", "none");
  d3.select("#tooltip").style("display", "none");
};

const drawError = (svg) => {
  svg
    .append("text")
    .attr("x", parseInt(svg.style("width")) / 2)
    .attr("y", parseInt(svg.style("height")) / 2)
    .attr("text-anchor", "middle") // Centering text
    .html("Something went wrong!");
};

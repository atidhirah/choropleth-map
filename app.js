document.addEventListener("DOMContentLoaded", () => {
  // URL for data needed to make this project
  // The first is education data in USA
  // The last is a topology data to create USA map
  const files = [
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json",
  ];

  // Get the data required
  Promise.all(files.map((url) => d3.json(url)))
    .then((values) => {
      // Start draw the map when fetching is success
      drawMap(values);
    })
    .catch((error) => {
      // Draw error message if fetching is fail
      console.log(error);
      drawError();
    });
});

const drawMap = (data) => {
  const eduData = data[0];
  const mapData = data[1];

  // Color will divide into 8 categories
  const minPercentage = d3.min(eduData, (d) => d["bachelorsOrHigher"]);
  const maxPercentage = d3.max(eduData, (d) => d["bachelorsOrHigher"]);
  const diff = maxPercentage - minPercentage;
  const domainPercentage = d3.range(minPercentage, maxPercentage, diff / 8);
  const colorScale = d3
    .scaleThreshold()
    .domain(domainPercentage)
    .range(d3.schemeGreens[9]);

  // Start draw the map
  const svg = d3.select("#canvas");
  const [w, h] = [parseInt(svg.style("width")), parseInt(svg.style("height"))];
  console.log(w, h);

  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(mapData, mapData.objects.counties).features)
    .enter()
    .append("path")
    .attrs((d) => setupAttributes(d.id, eduData, colorScale))
    .on("mousemove", (e, d) => onMouseMove(e, d.id, eduData))
    .on("mouseout", (e, d) => onMouseOut(e, d.id));

  // Add some separator between states on the map with line
  svg
    .append("path")
    .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
    .attr("class", "states")
    .attr("d", d3.geoPath());

  // Draw the legend
  const x = d3
    .scaleLinear()
    .domain([minPercentage, maxPercentage])
    .range([0, 200]);

  const legend = svg
    .append("g")
    .attrs({ id: "legend", transform: `translate(${(2 * w) / 3}, 20)` });

  legend
    .selectAll("rect")
    .data(
      colorScale.range().map((clr) => {
        // Change clr into its value limit
        clr = colorScale.invertExtent(clr);
        console.log(clr);
        // If its < lowest limit
        if (clr[0] == undefined) {
          clr[0] = x.domain()[0];
        }

        // If its > highest limit
        if (clr[1] == undefined) {
          clr[1] = x.domain()[1];
        }

        return clr;
      })
    )
    .enter()
    .append("rect")
    .attrs({
      height: 10,
      width: (d) => x(d[1]) - x(d[0]),
      x: (d) => x(d[0]),
      fill: (d) => colorScale(d[0]),
    });

  legend.append("text").attrs({
    x: x.range()[0],
    y: -10,
    fill: "white",
    "text-anchor": "start",
  });

  legend
    .call(
      d3
        .axisBottom(x)
        .tickSize(12)
        .tickFormat((x) => Math.round(x) + "%")
        .tickValues(colorScale.domain())
    )
    .select(".domain")
    .remove();
};

const setupAttributes = (id, eduData, colorScale) => {
  let county = eduData.find((d) => d["fips"] === id);
  let [fips, percentage] = [county["fips"], county["bachelorsOrHigher"]];

  return {
    class: "county",
    d: d3.geoPath(),
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
    .attr("data-education", county.bachelorsOrHigher)
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

const drawError = () => {
  const svg = d3.select("#canvas");
  svg
    .append("text")
    .attr("x", parseInt(svg.style("width")) / 2)
    .attr("y", parseInt(svg.style("height")) / 2)
    .attr("text-anchor", "middle") // Centering text
    .html("Something went wrong!");
};

// initialize variables for city and building data
let cities;
let buildings;

// function to allow data to be loaded before rest of scatter plot script runs
async function createScatterPlot() {
  await d3.csv('cities.csv', d3.autoType).then(data=>{
  console.log('cities', data);
  cities = data;
  })

  // filter data to only include EU cities
  let citiesEU = cities.filter(city => city.eu == true);
  
  // print number of cities on page
  d3.select('.city-count').text("Number of cities: " + citiesEU.length)
  
  //let extremes = d3.extent(citiesEU.map(d => d.population));

  // set container dimensions
  const width = 700;
  const height = 550;
  
  // create scatter plot SVG object and assign city dataset
  const scatterPlot = d3.select('.population-plot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .selectAll('div')
      .data(citiesEU)
      .enter()
  
  // draw circles and add to scatter plot
  // if population > 1,000,000, size of radius is 8
  let circs = scatterPlot.append('circle')
    .attr("class", "cirlce")
    .attr('r', (d,_) => {
      if (d.population < 1000000) {
        return 4
      } else {
        return 8
      }
    })
    .attr('cx', (d,_) => d.x)
    .attr('cy', (d,_) => d.y)
    .style('fill', 'blue')
    .style('opacity', 0.5)
  
  // filter city data for cities with population >= 1,000,000
  // add city labels above these big cities
  scatterPlot.filter((d, _) => d.population >= 1000000)
    .append('text')
    .text((d, _) => d.city)
    .attr("class", "label")
    .attr('text-anchor','middle')
    .attr('font-size', 11)
    .attr('x', (d, _) => d.x)
    .attr('y', (d, _) => d.y-10)

  // create and format tooltip for scatter plot
  let toolTipScatter = d3.select('.population-plot')
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "5px")
    .style("background-color", "#f2f2f2")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("opacity", 0)

  // function for when mouse is hovering over circle
  let hovering = function (event, d) {
    toolTipScatter.style("opacity", 0.9)
    
    d3.select(this)
      .style("fill", "red") 
    
    toolTipScatter.html("<strong> city, country: </strong> " + d.city + ", " + d.country +  
                    "<br> <strong> population: </strong> " + d.population)
    .style("left", d3.select(this).attr("cx") + "px")     
    .style("top", d3.select(this).attr("cy") + "px");
  }

  // function for when mouse is no longer hovering over circle
  let notHovering = function() {
    toolTipScatter.style("opacity", 0)
      .transition()
      .duration(200)

    d3.select(this)
        .style("stroke", "none")
        .style("fill", "blue")
        .style("opacity", 0.5)
  }

  // event listener for hovering/no longer hovering
  let tooltip = circs
    .on("mouseover", hovering)
    .on("mousemove", hovering)
    .on("mouseleave", notHovering)

}


// function to allow building data to load before creating bar chart
async function createBarChart() {
  await d3.csv('buildings.csv', d3.autoType).then(data=>{
    console.log('buildings', data);
    buildings = data;
  })
  
  // filter buildings based on height
  let buildingsHeight = buildings.sort((a, b) => (a.height_ft < b.height_ft) ? 1 : -1);

  // set margin and dimensions for row of bar chart and details
  const margin = {top: 75, right: 150, bottom: 50, left: 70};
  const width = 500 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // create SVG bar chart area
  let barChart = d3.select('.height-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")")
      .selectAll('div')
      .data(buildingsHeight)
      .enter()

  //  create y-axis scaled evenly for categorical values
  let y = d3.scaleBand()
      .domain(buildingsHeight.map(function(d) { return d.building; }))
      .range([0, height])
      .padding(0.25)
  
  // add building name labels to y-axis
  barChart.append("g")
    .append('text')
    .text((d,_) => d.building)
    .attr("class", "label")
    .attr('text-anchor','left')
    .attr('font-size', 11)
    .attr('x', (d,_) => -50)
    .attr('y', (d,_) => y(d.building) + (500 / (2 * buildingsHeight.length)))

  // scale building heights to pixels
  let scale = d3.scaleLinear()
      .domain([0, d3.max(buildingsHeight.map(d => d.height_m))])
      .range([height, 0]);

  // add bars (rectangles) to bar chart and move x axis to fit labels
  barChart.append('rect')
      .attr("y", (d, _) => y(d.building))
      .attr("x", (d,_) => 115)
      .attr("width", (d,_) => width-scale(d.height_m))
      .attr("height", y.bandwidth())
      .style("fill", "purple")
      .style("opacity", 0.75)

      // Event listener for clicking on bar, will update details and image
      // if statements used to access correct image url from project assets
      .on('click', (_, d) =>{
      if ((buildingsHeight.indexOf(d) + 1) == 1) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/1.jpg?v=1664476301830")
      } else if ((buildingsHeight.indexOf(d) + 1) == 2) {
        d3.select(".details")
          .select(".image")
          .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/2.jpg?v=1664476301987")
      } else if ((buildingsHeight.indexOf(d) + 1) == 3) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/3.jpg?v=1664502841469")
      } else if ((buildingsHeight.indexOf(d) + 1) == 4) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/4.jpg?v=1664502841119")
      } else if ((buildingsHeight.indexOf(d) + 1) == 5) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/5.jpg?v=1664502841998")
      } else if ((buildingsHeight.indexOf(d) + 1) == 6) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/6.jpg?v=1664502841320")
      } else if ((buildingsHeight.indexOf(d) + 1) == 7) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/7.jpg?v=1664502841596")
      } else if ((buildingsHeight.indexOf(d) + 1) == 8) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/8.jpg?v=1664502841715")
      } else if ((buildingsHeight.indexOf(d) + 1) == 9) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/9.jpg?v=1664502841766")
      } else if ((buildingsHeight.indexOf(d) + 1) == 10) {
        d3.select(".details")
        .select(".image")
        .attr("src", "https://cdn.glitch.global/de454803-9192-492d-b68e-82ab18c80f86/10.jpg?v=1664502841876")
      }
        d3.select(".buildingName").text(d.building)
        d3.select(".height").text(d.height_ft + " ft")
        d3.select(".city").text(d.city)
        d3.select(".country").text(d.country)
        d3.select(".floors").text(d.floors)
        d3.select(".completed").text(d.completed)
      })

      // event listener for mouse hovering/not hovering on bar
      .on("mouseover", function() {
          d3.select(this)
              .style("fill", "red")
      })
      .on("mouseleave", function() {
          d3.select(this)
              .style("fill", "purple")
      })

  // add height labels to end of bars
  barChart.append('text')
      .attr("class", "label")
      .attr("text-anchor","end")
      .attr("x", (d, _) => width-scale(d.height_m) + 113)
      .attr("y",(d,_) => y(d.building) + (500 / (2 * buildingsHeight.length)))
      .text((d, _) => d.height_ft + " ft")
      .style("fill", "white")
  
}

// run asynch functions
createScatterPlot()
createBarChart()
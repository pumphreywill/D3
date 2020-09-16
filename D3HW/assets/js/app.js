function makeWeb() {


    var svgArea = d3.select("#scatter").select("svg");


    if (!svgArea.empty()) {
        svgArea.remove();
    }


    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;


    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    function xScale(censusData, chosenXAxis) {

        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
                d3.max(censusData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    function yScale(censusData, chosenYAxis) {

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d[chosenYAxis])])
            .range([height, 0]);

        return yLinearScale;
    }

    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))

        return circlesGroup;
    }

    function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    function renderXText(textGroup, newXScale, chosenXAxis) {

        textGroup.transition()
            .duration(2000)
            .attr("dx", d => newXScale(d[chosenXAxis]))

        return textGroup;
    }

    function renderYText(textGroup, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(2000)
            .attr("dy", d => newYScale(d[chosenYAxis]));

        return textGroup;
    }

    function updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup) {

        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "Impoverished %";
        } else if (chosenXAxis === "age") {
            xlabel = "Median Age";
        } else {
            xlabel = "Household Income (Median)";
        }

        var ylabel;
        if (chosenYAxis === "healthcare") {
            ylabel = "% Lacking Healthcare";
        } else if (chosenYAxis === "obesity") {
            ylabel = "Obesity %";
        } else {
            ylabel = "Smokes %";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")

        .html(function(d) {
            return (`<strong>${d.state}</strong><hr> ${xlabel}: ${d[chosenXAxis]} & ${ylabel}: ${d[chosenYAxis]}`);
        });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
            toolTip.style("top", (d3.mouse(this)[1]) + 170 + "px")
                .style("left", (d3.mouse(this)[0]) + 170 + "px")

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "blue")
                .attr("r", "35");
        })

        .on("mouseout", function(data, index) {
            toolTip.hide(data);

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "#89bdd3")
                .attr("r", "20");
        });

        return circlesGroup;
    }

    function updateToolTipForText(chosenXAxis, chosenYAxis, textGroup) {

        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "Impoverished %";
        } else if (chosenXAxis === "age") {
            xlabel = "Mediain Age";
        } else {
            xlabel = "Median Household Income";
        }

        var ylabel;
        if (chosenYAxis === "healthcare") {
            ylabel = "% Lacking Healthcare";
        } else if (chosenYAxis === "obesity") {
            ylabel = "Obesity %";
        } else {
            ylabel = "Smokes %";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                return (`<strong>${d.state}</strong><hr> ${xlabel}: ${d[chosenXAxis]} & ${ylabel}: ${d[chosenYAxis]}`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
            toolTip.style("top", (d3.mouse(this)[1]) + 170 + "px")
                .style("left", (d3.mouse(this)[0]) + 170 + "px")

            d3.select(this)
                .attr("cursor", "default");

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "black")
                .attr("font-size", "24px");
        })

        .on("mouseout", function(data, index) {
            toolTip.hide(data);

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "#fff")
                .attr("font-size", "12px");
        });

        return textGroup;
    }


    d3.csv("assets/data/data.csv").then(function(censusData, err) {
        if (err) throw err;


        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });


        var xLinearScale = xScale(censusData, chosenXAxis);


        var yLinearScale = yScale(censusData, chosenYAxis);


        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);


        var yAxis = chartGroup.append("g")
            .call(leftAxis);


        var overallPoints = chartGroup.selectAll("circle")
            .data(censusData)
            .enter();

        var circlesGroup = overallPoints
            .append("circle")
            .attr("r", "20")

        .attr("fill", "#89bdd3")
            .attr("stroke-width", "2")
            .attr("stroke", "#e3e3e3")
            .attr("opacity", ".5");


        circlesGroup
            .transition()
            .duration(2000)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]));


        var textGroup = overallPoints
            .append("text")
            .text(function(d) {
                return d.abbr;
            })

        .attr("dx", function(d) {
                return xLinearScale(d[chosenXAxis]);
            })
            .attr("dy", function(d) {
                return yLinearScale(d[chosenYAxis])
            })
            .attr("font-size", "12px")
            .attr("fill", "#fff")
            .attr("class", "stateText");


        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .attr("class", "aText")
            .classed("active", true)
            .text("In Poverty %");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Household Income (Median)");
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .attr("class", "aText")
            .classed("active", true)
            .text("Lacks Healthcare %");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity")
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Obesity %");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("y", 60 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokes")
            .attr("class", "aText")
            .classed("inactive", true)
            .text("Smokes %");


        circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
        textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);


        xlabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(censusData, chosenXAxis);
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
                    textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);
                    circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
                    textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);

                    if (chosenXAxis === "age") {
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "poverty") {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
        ylabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    chosenYAxis = value;
                    yLinearScale = yScale(censusData, chosenYAxis);

                    yAxis = renderYAxis(yLinearScale, yAxis);

                    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);


                    textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);


                    circlesGroup = updateToolTipForCircles(chosenXAxis, chosenYAxis, circlesGroup);
                    textGroup = updateToolTipForText(chosenXAxis, chosenYAxis, textGroup);

                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "obesity") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
        console.log(error);
    });
}



makeWeb();

d3.select(window).on("resize", makeWeb);
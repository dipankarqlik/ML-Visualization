var mainChart = function() {
    var dimensions = ['fixed acidity', 'volatile acidity', 'citric acid', 'residual sugar','chlorides','free sulfur dioxide', 'total sulfur dioxide','density','pH','sulphates','alcohol'];
    var config = {

        dimensions: dimensions
        
    }; 


    //Define the variables:
    var size = 500;
    var margin = 50;
    var dotRadius = 6;
    var colorScale= d3.scale.category10();
    var width = 400;
    var height = 400;
    var newsize = 1000;

    //Define Force properties:
   var force = d3.layout.force()
                        .chargeDistance(0)
                        .charge(-400)
                        .friction(0.9)
                        .linkDistance(40); 
                        
                        

    var render = function(data) {
        //data = 1599;
        data = dataStandard(data);
        var arr = dimensions
                        .map(function(d) {
                        return d;
                        });

        //Function for standardizing the data
        function dataStandard(data) {
                            data.forEach(myFunction);
                            function myFunction(item){
                                dimensions.forEach(function(dimension){
                                    item[dimension] = +item[dimension];
                                })
                            }
                    
                           var x = {};
                                dimensions.forEach(myFunction_new);
                                function myFunction_new(dimension){
                                    x[dimension] = d3.scale.linear()
                                                        .domain(d3.extent(data
                                                        .map(function(d, i) {
                                                        return d[dimension];
                                             })))
                                                        .range([0, 1]);
                                }

                            data.forEach(myFunction_new2);
                            function myFunction_new2(item){
                                dimensions.forEach(function(dimension){
                                    item[dimension] = x[dimension](item[dimension]);
                                });
                            }
                    
                                return data;
                        }; 
        
        var arr_len = arr.length;

        var math = Math.PI * 2;

        //Define our scale:
        var newScale = d3.scale.linear()
                           .domain([0, arr_len])
                           .range([0, math]);

       
       
        //Define the chart rad, node count:
        var chartRadius = size/2  - margin;
        var nodeCount = data.length;    

        // Prepare the column field to be used for future "force.size"
        var columns = dimensions.map(function(d, i) {
            var angle = newScale(i);
            var x = chartRadius + Math.sin(angle) * chartRadius;
            var y = chartRadius + Math.cos(angle) * chartRadius;
            return {
                index: nodeCount + i,
                x: x,
                y: y,
                fixed: true,
                name: d
            };
        });

        console.log(columns);


        //prepare for nodes related data:
       var nodesData = [];
        data.forEach(function(d, i) {
            arr.forEach(function(m, n) {
                nodesData.push({
                    source: i,
                    target: nodeCount + n,
                    value: d[m]
                });
            });
        });
       
        console.log(nodesData);

            force.size([width, height])
            .resume()
            .linkStrength(function(d){
                return d.value;
            })
            .nodes(data.concat(columns))
            .links(nodesData)
            .start();

        // Basic structure
        var svg = d3
                    .select("body")
                    .append('svg')
                    .attr("width", newsize)
                    .attr("height", newsize);


        var g = svg.append('g')
            .attr({
                transform: 'translate(' + [margin, margin] + ')'
            }); 
            
            g.append('circle')
                               .classed('panel', true)
                               .attr({
                                    r: chartRadius,
                                    cx: chartRadius,
                                    cy: chartRadius
                        })

          

             //Function to make nodes draggable and make their position intact:           
                var drag =  force.drag()
                .on("dragstart", dragstart);
                    function dragstart(d) {
                            d.fixed = true;
                          };
        
var colorsx =function(d) {
    return d['quality'];
}



        //Dots functionality inside Circle with force drag:
        var nodes = g.selectAll('circle.dot')
            .data(data)
            .enter()
            .append('circle')
            .classed('dot', true)
            .attr("r", dotRadius)
            .attr("fill", function(d,i){
                return colorScale(colorsx(d));
            })
            .call(drag)
            .style("opacity",1.0)
            

    
// CODE FOR SHOWING TOOL TIP ON DOTS:
    var tooltipn = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    .text(dimensions)
    
    nodes
    .on("mouseover", function(){return tooltipn.style("visibility", "visible");})
	.on("mousemove", function(){return tooltipn.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltipn.style("visibility", "hidden");})
    .transition()
            .duration(2000)
    ; 
                           

            //Function to change OPACITY for our nodes:
            d3.select("#slider").on("input", function () {

                g.selectAll('circle.dot')
                                
                        .style("opacity", d3.select("#slider").property("value")/100);
                });


                var dragn = d3.behavior.drag()
                .on("drag", function(d,i) {
                    d3.select(this).attr("cx", d3.event.x)
                                    .attr("cy", d3.event.y)
                });


        //DESIGN THE ANCHORS
        var labelNodes = g.selectAll('circle.label-node')
            .data(columns)
            .enter()
            .append('circle')
            //.classed('label-node', true)
            .classed('dot',true)
            .attr("r",4)
            .attr("fill", "red")
            .attr("cx",function(d){
                return d.x;
            })
            .attr("cy", function(d){
                return d.y;
            })
            .call(dragn)

            var pointx =  labelNodes.attr("cx");

            
            //console.log(pointx);

           // console.log(d3.selectAll(".circle.label-node").attr("cx"));

           
    var tooltipn1 = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    .text(pointx)
    
    labelNodes
    .on("mouseover", function(){return tooltipn1.style("visibility", "visible");})
	.on("mousemove", function(){return tooltipn1.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltipn1.style("visibility", "hidden");}); 
         

            //Text Anchors and their function
        var labels = g.selectAll('text.label')
            .data(columns)
            .enter().
            append('text')
            .classed('label', true)
            .attr('x', function(d){
                return d.x;
            })
            .attr('y', function(d){
                return d.y;
            })
            .attr('text-anchor', "start")
            .text(function(d) {
                return d.name;
            })

            

        // Update force
    force.on('tick', function() {
            if(config.drawLinks) {
                links.attr("x1", function(d){
                        return d.source.x;
                })
                    .attr("y1", function(d){
                        return d.source.y;
                    })                
                    .attr("x2", function(d){
                        return d.target.x;
                    })
                    .attr("y2", function(d){
                        return d.target.y;
                    });
            }
            
            nodes.attr("cx", function(d){
                return d.x;
            })
                .attr("cy", function(d){
                    return d.y;
                });
        });  

    }; 

   var backtopage = {
        render: render
    }; 


    return backtopage; 
};


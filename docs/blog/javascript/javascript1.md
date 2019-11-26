---
title: D3.js 简单圆饼图
---
::: tip
D3.js 简单圆饼图
:::

``` html
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>圆饼图</title>
  

  </head>

  <body>
    
    <script src="http://d3js.org/d3.v5.min.js"></script>
    <script src='./bundle.js'></script>
   
  </body>

</html>

```

``` js

const _P = {
  PS4: 'PS4',
  PS3: 'PS3',
  PC: 'PC',
  XBox360: 'XBOX360',
  XBoxOne: 'XBoxOne',
}

const _R = {
  NA: 'NA',
  PAL: 'PAL',
  JP: 'JP',
  OTHER: 'OTHER',
}

d3.csv('./GTAV.csv', (row) => {
  
  const dataObject = {
    total: parseFloat(row['TOTAL']) || 0,
  };
  

  return {
    platform: row.platform,
    sales: Object.keys(_R).reduce((accu, region)=>{
     
      return {
        ...accu,
        [region]: parseFloat(row[region]),
      }
    }, dataObject)
  }
})
.then(visualize)

function visualize(data) {
  const regionData = Object.keys(_R).map((region) => {
    const total = data.map((datum)=> datum.sales[region])
                  .reduce((accu, curr) => accu+ curr, 0)
    return {
      region,
      total: Math.floor(total * 100) / 100,
      label: region
    }
  })
  
  let total;
  const platformData = data.map(d => {
    if(d.total) {
      total = d.total
    } else {
      total = Object.values(d.sales)
              .reduce((accu, curr) => accu + curr, 0)
    }
    return {
      ...d,
      total: Math.floor(100 * total) / 100,
      label: d.platform
    }
  })
  
  getPie(platformData, 'pie1')
  getPie(regionData, 'pie2');
  
}

function getPie(data = []) {
  console.log(data)
  const width = 600;
  const height = 400;
  const outerRadius = 120;
  const innerRadius = 80;
  const pivotRadius = 160;
  

  const COLORARRAY = [
    '#204A87',
    '#EF2928',
    '#9ADE00',
    '#0084C8'
  ]

  const getMidAngle = (d) => (d.endAngle + d.startAngle) / 2;

  const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height) 
    
  svg.append('g').attr('class', 'slices')
  svg.append('g').attr('class', 'lines')
  svg.append('g').attr('class', 'labels')

  const overallTotal = data.reduce((accu, curr) => accu + curr.total || 0,0)
  const formattedOverallTotal = Math.floor(100 * overallTotal) / 100;
  svg.append('text')
    .text(`${formattedOverallTotal} m`)
    .attr(`transform`, `translate(${width / 2}, ${height / 2})`)
    .attr('text-anchor', 'middle')

  const getValue = d => d.total
  
  const pie = d3.pie().value(getValue)
  const slices = pie(data)
  const innerArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)

  const slice = svg.select('.slices')
        .selectAll('path')
        .data(slices)

  slice.enter()
    .append('path')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
    .attr('d', (d, i) => innerArc(slices[i]))
    .attr('fill', (d, i) => COLORARRAY[i % (COLORARRAY.length)]);

  slice.exit().remove()


  const endPoints = []
  const pivotArc = d3.arc()
    .innerRadius(outerRadius)
    .outerRadius(pivotRadius);

  const line = svg.select('.lines')
    .selectAll('polyline')
    .data(slices)

  line.enter()
    .append('polyline')
    .attr('points', (d, i) => {
      const slice = slices[i]

      const innerCentroid = innerArc.centroid(slice)
      const x1 = innerCentroid[0] + width / 2;
      const y1 = innerCentroid[1] + height / 2;

      const pivotPoint = pivotArc.centroid(slice)
      const x2 = pivotPoint[0] + width / 2;
      const y2 = pivotPoint[1] + height / 2;

      const midAngle = getMidAngle(slice)
      const x3 = x2 + (midAngle > Math.PI ? -20 : 20)
      const y3 = y2
      endPoints[i] = [x3, y3]

      return `${x1},${y1} ${x2},${y2} ${x3},${y3}`
    })
    .attr('fill', 'none')
    .attr('stroke', (d, i)=> COLORARRAY[i % (COLORARRAY.length)]);

  line.exit().remove();

  const label = svg.select('.labels')
                .selectAll('text')
                .data(slices);
  label.enter()
    .append('text')
    .text((d) => {
      const value = d.value;
      const label = d.data.label;
      return `${label}: ${value} m`
    })
    .attr('transform', (d, i)=>{
      const x = endPoints[i][0] + (getMidAngle(d) > Math.PI ? -10 : 10)
      const y = endPoints[i][1] + 5;

      return `translate(${x}, ${y})`;
    })
    .attr('text-anchor', (d) => {
      const midAngle = getMidAngle(d)
      return midAngle > Math.PI ? 'end' : 'start';
    });

    label.exit().remove();
    console.log(label)
}


```
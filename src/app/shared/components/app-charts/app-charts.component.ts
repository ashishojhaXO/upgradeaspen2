/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2018-12-26 10:00:00
 */
import {Component, EventEmitter, Input, ViewChild, OnInit, Output, ElementRef, Sanitizer, SimpleChanges, OnChanges} from '@angular/core';
import 'datatables.net';
// import * as highcharts from 'Highcharts';
import {errorComparator} from 'tslint/lib/test/lintError';

@Component({
  selector: 'app-charts',
  templateUrl: './app-charts.component.html',
  styleUrls: ['./app-charts.component.scss'],
  moduleId: module.id
})

export class AppChartsComponent implements OnInit, OnChanges {

  chartOptions: any;
  @Input()
  config: any;
  @ViewChild('chart') chartRef: any;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['config']) {
      if (this.config.type === 'column') {
        this.renderColumnChart();
      } else if (this.config.type === 'pie') {
        this.renderPieChart();
      }
    }
  }

  renderColumnChart() {

    console.log('this.config >>>>')
    console.log(this.config);

    var categories = [];
    if (this.config.data) {
      categories = this.config.data.map(function (d) {
        return d[this.config.XAxis.dataPropertyName];
      }, this);
    } else {
      throw new Error('No Data Provided');
    }

    // Set YAxis Properties
    const YAxis = [];
    const yAxis = this.config.YAxis;
    if (yAxis) {
      yAxis.data.forEach(function (y, index) {
        const obj: any = {};
        obj.labels = {
          format: '{value}' + y.unitType,
          style: {
            color: '#000000'
          }
        };
        obj.title = {
          text: y.labelName,
          style: {
            color: '#000000'
          }
        };
        obj.minRange = 0.1;
        obj.type = y.tickIntervalType ? y.tickIntervalType : '';
        obj.gridLineWidth = yAxis.showGrid ? 1 : 0;
        if (yAxis.data.length > 1 && index === (yAxis.data.length - 1)) {
          obj.min = 0;
          obj.opposite = true;
        }
        YAxis.push(obj);
      });
    }

    // Set Series
    const series = [];
    const config = this.config;
    if (config) {
      config.dataPoints.forEach(function (data) {
        const obj: any = {};
        obj.type = data.type;
        obj.name = data.propertyName;
        obj.color = data.color || 'rgb(80, 130, 186)';
        obj.data = config.data.map(function (d) {
          return d[data.propertyName];
        });
        if (data.type === 'line' && config.includeMarkingsForLineType) {
          obj.marker = {
            lineWidth: 2,
            color: '#000000',
            fillColor: 'rgb(253, 8, 0)'
          };
        }

        config.YAxis.data.forEach(function (axis, index) {
          if (axis.labelName === data.YaxisAssociation) {
            obj.yAxis = index;
          }
        });
        series.push(obj);
      });
    }

    // Create Chart with options
    this.chartOptions = {
      credits: {
        enabled: false
      },
      chart: {
        type: this.config.type || 'column'
      },
      title: {
        text: this.config.title || ''
      },
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        y: 20, // change this to adjust chart title location
        padding: 5,
      },
      xAxis: {
        categories: categories,
        gridLineWidth: this.config.XAxis.showGrid ? 1 : 0,
        title: {
          text: this.config.XAxis.labelName
        },
        align: 'low'
      },
      yAxis: YAxis,
      tooltip: {
        borderColor: 'rgb(151, 160, 169)',
        borderRadius: 7,
        headerFormat: this.config.toolTipHeader ? '<span style="font-size: 16px;margin-bottom: 10px"><b>{point.key} ' + this.config.XAxis.labelName + '</b></span>' : '',
        padding: 10,
        valueDecimals: 2,
        pointFormatter: function () {
            return '<div style="padding: 5px 0px"><span style="background-color: whitesmoke">' + this.series.name + '</span>:<b> ' +  this.y + '</b><br/></div>';
          },
       // pointFormat: '<span style="background-color: whitesmoke">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
       // pointFormat: '<div style="padding: 5px 0px"><span style="background-color: whitesmoke">{series.name}</span>: <b>{point.y}</b><br/></div>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        series: {
          pointWidth: this.config.barWidth ? this.config.barWidth : null
        },
        column: {
          stacking: this.config.isStacked ? 'normal' : ''
        },
        line: {
          marker: {
            enabled: this.config.includeMarkingsForLineType ? true : false
          }
        }
      },
      series: series
      // series: [{
      //   type: 'column',
      //   name: 'Monthly Cumulative Spend',
      //   data: mcs,
      //   color: 'rgb(80, 130, 186)'
      // }, {
      //   type: 'column',
      //   name: 'Daily Spend',
      //   data: ds,
      //   color: 'rgb(56, 199, 224)'
      // }, {
      //   type: 'line',
      //   name: 'Monthly Budget',
      //   data: mb,
      //   marker: {
      //     lineWidth: 2,
      //     color: '#FF0000',
      //     lineColor: highcharts.getOptions().colors[2],
      //     fillColor: 'rgb(253, 8, 0)'
      //   }
      // }]
    };
  }

  renderPieChart() {

    const data = [];
    if (this.config.data) {
      this.config.data.forEach(function (d, i) {
        const obj: any = {
          name: d.label,
          y: d.value,
          sliced: this.config.showSliced
        };
        if (i === 0) {
          obj.selected = true;
        }
        data.push(obj);
      }, this);
    }

    console.log('data >>')
    console.log(data);

    this.chartOptions = {
      colors: this.generateColors(20), //['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',  '#FF9655', '#FFF263', '#6AF9C4'],
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      credits: {
        enabled: false
      },
      title: {
        text: this.config.title,
        verticalAlign: 'middle',
        x: this.config.titleXAlign ? this.config.titleXAlign : 0,
        y: 10,
        style: {
          color: '#959cb6',
          font: 'bold 28px "Trebuchet MS", Verdana, sans-serif'
        }
        // floating: true
      },
      tooltip: {
        pointFormat: '<br>{point.percentage:.1f} % (  {point.y} )'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          size: this.config.size ? this.config.size : null,
          cursor: 'pointer',
          showInLegend: this.config.showLegend,
          dataLabels: {
            enabled: !this.config.showLegend,
            format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>value: {point.y}',
          }
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: data,
        size: '90%',
        innerSize: '60%'
      }],
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 15,
        // y: $(this).find('#container').height()/4,
        labelFormatter: function () {
          return this.name + ' - ' + this.y;
        }
      },
    };

    // const textX = this.chartRef.plotLeft + (this.chartRef.plotWidth  * 0.5);
    // const textY = this.chartRef.plotTop  + (this.chartRef.plotHeight * 0.5);
    //
    // let span: any = '<span id="pieChartInfoText" style="position:absolute; text-align:center;">';
    // span += '<span style="font-size: 32px">Upper</span><br>';
    // span += '<span style="font-size: 16px">Lower</span>';
    // span += '</span>';
    //
    // $("#addText").append(span);
    // span = $('#pieChartInfoText');
    // span.css('left', textX + (span.width() * -0.5));
    // span.css('top', textY + (span.height() * -0.5));

    console.log('this.chartOptions ## >>')
    console.log(this.chartOptions);
  }

  ngOnInit() {
    // this.setId = this.id ? this.id : 'gridtable1';
    // this.displayDataTable();
  }

  generateColors(num) {
    const colors = [];
    for (let i =0; i < num; i++) {
      colors.push('#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6));
    }
    return colors;
  }
}

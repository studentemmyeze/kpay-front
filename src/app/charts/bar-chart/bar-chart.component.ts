import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ɵNG_ELEMENT_ID } from '@angular/core';
import {Chart, LinearScale, LineController, LineElement, Point, PointElement, registerables, Title} from "chart.js";
// import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('chart')
  private chartRef: ElementRef;
  private chart: Chart;
  private data: Point[];

  constructor() {
    this.data = [{x: 1, y: 5}, {x: 2, y: 10}, {x: 3, y: 6}, {x: 4, y: 2}, {x: 4.1, y: 6}];
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title);

  }

  ngAfterViewInit(): void {
    // this.chart = new Chart(this.chartRef.nativeElement, {
    //   type: 'line',
    //   data: {
    //     datasets: [{
    //       label: 'Interesting Data',
    //       data: this.data,
    //       fill: false
    //     }]
    //   },
    //   options: {
    //     responsive: false,
    //     scales: {

    //       // aAxes: [{
    //       //   type: 'linear'
    //       // }],
        
    //       // a: [{
    //       //   type: 'linear'
    //       // }],
    //     }
    //   }
    // });
  }
  


}

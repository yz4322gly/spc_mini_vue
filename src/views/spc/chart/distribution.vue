<template>
  <div class="app-container">
    <el-row>
      <el-col :span="5">
        <el-form :model="queryParams" ref="queryForm" :inline="false" label-width="60px">
          <el-form-item label="组间距" prop="interval">
            <el-input-number v-model="queryParams.interval" placeholder="0.1" clearable size="small" :controls="false"
                             style="text-align: left"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="drawChart()">绘制</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <h4 style="color: red">使用说明以及细节:</h4>
        <ul style="color: red">
          <li>x轴构建方式,起始点基于原始数据的最小值(min) - 1 然后取整得到,然后基于设定值组距向后扩展,直到原始数据的最大值(max)
            + 1
          </li>
          <li>实际正态分布基于x轴执行构建</li>
          <li>usl和lsl按照实际情况可能无法定位在x轴上(因为x轴构建方式的原因),此时会将数值标记线置于x轴边缘</li>
        </ul>
      </el-col>
      <el-col :span="19">
        <div id="chart" style="height: 480px;width: 100%;"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";
import {listDataRowBySummaryId} from "@/api/spc/chart";

//计算正态曲线
function fxNormalDistribution(array, std, mean) {
  let valueList = [];
  for (let i = 0; i < array.length; i++) {
    let ND =
      Math.sqrt(2 * Math.PI) *
      std *
      Math.pow(
        Math.E,
        -(Math.pow(array[i] - mean, 2) / (2 * Math.pow(std, 2)))
      );
    valueList.push(ND.toFixed(3));
  }
  return valueList;
}

//计算标准差
function getStd(data, mean) {
  let sumXY = function (x, y) {
    return Number(x) + Number(y);
  };
  let square = function (x) {
    return Number(x) * Number(x);
  };
  let deviations = data.map(function (x) {
    return x - mean;
  });
  return Math.sqrt(deviations.map(square).reduce(sumXY) / (data.length - 1));
}

//对有序数组求中位数
function getMedianSorted(arr) {
  // 获取数组长度
  let len = arr.length;

  // 如果没有元素，返回undefined或你可以返回其他合适的值
  if (len === 0) {
    return undefined;
  }

  // 如果只有一个元素，那么它就是中位数
  if (len === 1) {
    return arr[0];
  }

  // 如果数组长度是奇数，返回中间的数
  if (len % 2 === 1) {
    return arr[Math.floor(len / 2)];
  }

  // 如果数组长度是偶数，返回中间两个数的平均值
  else {
    let mid1 = arr[len / 2 - 1];
    let mid2 = arr[len / 2];
    return (mid1 + mid2) / 2.0;
  }
}

export default {
  name: 'distributionChart',
  props: {
    id: {
      type: Number,
      required: true,
    },
    theory: {
      type: Number,
      required: true,
    },
    lsl: {
      type: Number,
      required: true
    },
    usl: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      chart:null,
      //副标题
      subTitleText: "",
      //其他查询参数
      queryParams: {
        interval: 0.2,
      },
      //请求到的原始数据
      originalData: []
    };
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      //从dom加载echarts对象
      let chartDom = document.getElementById("chart");
      this.chart = echarts.init(chartDom);
      this.drawChart();
    },
    drawChart() {
      //清除图表
      this.chart.clear()
      this.getOptionByParams(this.chart, this.queryParams);
    },
    getOptionByParams(chart, params) {
      listDataRowBySummaryId({id:this.id}).then((response) => {
        // 获取原始数据
        this.originalData = response.data;
        let data = response.data;

        if (data.length < 5) {
          this.$message.error("无可用数据，或可用数据不足,至少5条数据方可计算");
          return;
        }

        //获取参数指定的公差,标准值,组间据
        let theory = this.theory;
        let lsl = this.lsl;
        let usl = this.usl;
        let interval = params.interval;
        let mid = getMedianSorted(data).toFixed(3) * 1.0;

        // 计算各项最大值,最小值,均值,以及cpk值,以及数组长度
        let length = data.length;
        let max = Math.max(...data);
        let min = Math.min(...data);
        let mean = data.reduce((sum, val) => sum + val, 0) / length;

        //计算合规占比
        let okCount = 0;
        //计算距离中位数±1占比
        let midBias1Count = 0;
        for (let i = 0; i < length; i++) {
          if (data[i] >= lsl && data[i] <= usl) {
            okCount++;
          }
          if (data[i] >= (mid - 1) && data[i] <= (mid + 1)) {
            midBias1Count++;
          }
        }
        let okPercent = okCount / length;
        let midBias1Percent = midBias1Count / length;

        // 计算CPK值
        let cpk =
          (min > lsl ? (usl - mean) / 3 : (mean - lsl) / 3) < 0
            ? 0
            : min > lsl
              ? (usl - mean) / 3
              : (mean - lsl) / 3;

        //依据原始数据重新计算数据X轴
        //let spec = theory
        //let maxX =
        //let minX =
        //x轴最大最小前后范围
        let dataRangeMinOP = 1;
        let dataRangeMaxOP = 1.1;

        // 设定区间起始和结束值，以及间距 ，X轴的步距
        let start = min - dataRangeMinOP;
        let end = max + dataRangeMaxOP;
        start = start.toFixed(0) * 1.0;

        // 计算区间数量
        let numIntervals = Math.ceil((end - start) / interval);

        //获取所有区间,以及初始化区间每个区间的频数为0
        let xAxis = [];
        let barYaxis = new Array(numIntervals).fill(0);

        for (let i = start; i <= end; i = i + interval) {
          let str = i.toFixed(1).toString();
          xAxis.push(str);
        }

        // 遍历数组并计算频数
        data.forEach((value) => {
          if (value >= start && value <= end) {
            // 找到值所在的区间
            let intervalIndex = Math.floor((value - start) / interval);
            // 增加该区间的频数
            barYaxis[intervalIndex]++;
          }
        });

        //正态曲线计算的基本数据和方法
        //计算标准差
        let std = getStd(data, mean);
        //依据x轴,计算正态分布值
        let lineYaxis = fxNormalDistribution(xAxis, std, mean);
        let lineYaxisTheory = fxNormalDistribution(xAxis, 1, theory);

        //求得分布曲线最大值,用以绘制纵向线
        let y1Max = Math.max(...lineYaxis);
        let y2max = Math.max(...lineYaxisTheory);
        let yMax = Math.max(y1Max, y2max);
        let yBarMax = Math.max(...barYaxis);

        //计算中位数,usl,lsl落在哪个区间上
        function getInterval(va, that) {
          for (let i = 0; i < xAxis.length; i++) {
            if (xAxis[i] > va) {
              if (i === 0) {
                that.$message.error("请检查标准值，数据：" + va + "超限制，不能标记在正确位置上，已标记在最左边");
                return xAxis[0].toString();
              } else {
                return xAxis[i - 1].toString();
              }
            }
          }
          that.$message.error("请检查标准值，数据：" + va + "超限制，不能标记在正确位置上,已标记在最右边");
          return xAxis[xAxis.length - 1].toString();
        }

        let midInterval = getInterval(mid, this);
        let lslInterval = getInterval(lsl, this);
        let uslInterval = getInterval(usl, this);
        let theoryInterval = getInterval(theory, this);

        //定义Y轴
        //定义实际数据的频数柱状图
        let barDataSet = {
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          areaStyle: {
            opacity: 0,
          },
          markLine: {
            silent: true,
            lineStyle: {
              color: "rgb(255,0,0)",
            },
            data: [
              [
                {
                  name: "LSL:" + lsl,
                  coord: [lslInterval, 0],
                },
                {
                  coord: [lslInterval, yBarMax],
                },
              ],
              [
                {
                  name: "USL:" + usl,
                  coord: [uslInterval, 0],
                },
                {
                  coord: [uslInterval, yBarMax],
                },
              ],
            ],
          },
          data: barYaxis,
          name: "实际分布频数",
          itemStyle: {
            normal: {
              label: {
                formatter: "{c} %",
                show: false, //默认显示
                position: "top", //在上方显示
              },
            },
          },
        };
        //计算实际数据的正态分布图
        let lineDataSet = {
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          areaStyle: {
            opacity: 0,
          },
          markLine: {
            silent: true,
            data: [
              [
                {
                  name: "中位数:" + mid,
                  coord: [midInterval, 0],
                },
                {
                  coord: [midInterval, y1Max],
                },
              ],
            ],
          },
          data: lineYaxis,
          name: "实际正态分布",
          itemStyle: {
            normal: {
              label: {
                formatter: "{c} %",
                show: false, //开启显示
                position: "top", //在上方显示
              },
            },
          },
        };
        //计算理论数据的正态分布图
        let lineDataSetTheory = {
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          areaStyle: {
            opacity: 0,
          },
          markLine: {
            silent: true,
            data: [
              [
                {
                  name: "设计标准值:" + theory,
                  coord: [theoryInterval, 0],
                },
                {
                  coord: [theoryInterval, yMax],
                },
              ],
            ],
          },
          data: lineYaxisTheory,
          name: "理论正态分布",
          itemStyle: {
            normal: {
              label: {
                formatter: "{c} %",
                show: false, //开启显示
                position: "top", //在上方显示
              },
            },
          },
        };

        //合成副标题
        let subtext =
          "  中位数距标准偏差:" + (mid - theory).toFixed(3) +
          "  样本容量:" + length + "  cpk:" + cpk.toFixed(3) +
          "  距中位数±1占比:" + midBias1Percent.toFixed(3);

        this.subTitleText = subtext;
        //注入图表参数
        chart.setOption({
          //定义标题,含最大值,最小值,均值,以及cpk值,以及样本量
          title: {
            //标题间距
            itemGap: 10,
            text: "正态分布情况",
            subtext: subtext,
            textAlign: 'left',
            left: "9%",
          },
          grid: {
            top: 150
          },
          //工具栏。内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具。
          toolbox: {
            show: true,
            feature: {
              dataZoom: {
                yAxisIndex: "none",
              },
              dataView: {readOnly: false},
              restore: {},
              saveAsImage: {},
            },
          },
          //提示框组件
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          //图例
          legend: {
            data: ["实际分布频数", "实际正态分布", "理论正态分布"],
            right: "8%",
            top: "85",
          },
          xAxis: [
            {
              boundaryGap: true,
              type: "category",
              data: xAxis,
            },
          ],
          //定义y轴,2个轴
          yAxis: [
            {
              type: "value",
              max: function (value) {
                return value.max + 5;
              },
            },
            {
              type: "value",
              max: function (value) {
                return (value.max + 0.2).toFixed(1);
              },
            },
          ],
          series: [barDataSet, lineDataSet, lineDataSetTheory],
        });
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
    },
  },
};
</script>

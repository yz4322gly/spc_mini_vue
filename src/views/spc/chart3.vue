<!--<template>-->
<!--  <div class="app-container">-->
<!--    <el-row>-->
<!--      <el-col :span="6" class="button-container">-->
<!--        <el-button @click="redrawChart">重新绘制</el-button>-->
<!--        <el-button type="warning" @click="analyzeData">重新解析数据并绘制</el-button>-->
<!--        <el-button type="primary" @click="drawNormalChart">正态分布(X)</el-button>-->
<!--        <el-button type="success">更新SPEC(X)</el-button>-->
<!--        <el-button type="info">计算cpk(X)</el-button>-->
<!--        <el-button type="danger" visibleDialog>绘制图表参数</el-button>-->
<!--        <el-button type="danger" visibleDialog>???</el-button>-->
<!--        <div class="form-title">绘制图表参数</div>-->
<!--        <el-form ref="form" :model="dData.chartConfig" label-width="140px">-->
<!--          <el-form-item label="图表类型">-->
<!--            <el-select v-model="dData.chartConfig.type" placeholder="请选择图表类型">-->
<!--              <el-option v-for="item in chartTypeOptions" :key="item.value" :label="item.label" :value="item.value"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="子组大小(n)">-->
<!--            <el-input disabled v-model="dData.chartConfig.groupSize"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="抽样方式">-->
<!--            <el-input disabled v-model="dData.chartConfig.samplingMethod"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="控制线系数A2(X-R)" v-if="dData.chartConfig.type === 1">-->
<!--            <el-input v-model="dData.chartConfig.a2"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="上边界系数k1(X-S)" v-if="dData.chartConfig.type === 2">-->
<!--            <el-input v-model="dData.chartConfig.k1"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="下边界系数k2(X-S)" v-if="dData.chartConfig.type === 2">-->
<!--            <el-input v-model="dData.chartConfig.k2"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-button type="primary" @click="calculateControlLine">更新到SPEC</el-button>-->
<!--            <el-button type="primary" @click="calculateControlLine();redrawChart();">更新到SPEC并重绘</el-button>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <div class="form-title">SPEC参数</div>-->
<!--        <el-form ref="form" :model="dData" label-width="140px">-->
<!--          <el-form-item label="SPEC参数">-->
<!--            <el-input v-model="dData.usl"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="usl">-->
<!--            <el-input v-model="dData.usl"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="ucl">-->
<!--            <el-input v-model="dData.ucl"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="cl">-->
<!--            <el-input v-model="dData.cl"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="lcl">-->
<!--            <el-input v-model="dData.lcl"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="lsl">-->
<!--            <el-input v-model="dData.lsl"/>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--      </el-col>-->
<!--      <el-col :span="18">-->
<!--        <div id="mainChart" style="height: 720px;width: 1080px;"/>-->
<!--      </el-col>-->
<!--    </el-row>-->
<!--    <div>-->
<!--      min:{{ dData.min.toFixed(3) }}-->
<!--      max:{{ dData.min.toFixed(3) }}-->
<!--      mean:{{ dData.min.toFixed(3) }}-->
<!--      std:{{ dData.min.toFixed(3) }}-->
<!--    </div>-->
<!--    <div>-->
<!--      说明-->
<!--      1.x-bar等图的上线边界,计算上下边界,如果数据过于集中,自动图表缩放会导致usl甚至是ucl超出y轴范围,不能正常绘制,那么需要手动计算上下边界<br/>-->
<!--      上边界取max值和usl+0.5*(usl-ucl)更大的那个<br/>-->
<!--      下边界取min值和lsl-0.5*(lcl-lsl)更小的那个<br/>-->
<!--      为避免出现小数位数过多/精度不足 取3位小数<br/>-->
<!--      2.关闭SPEC弹框时由于数据已经被更新,所以在关闭弹框时间上直接绑定了重绘事件.-->
<!--      但是由于上下边界是在解析数据阶段完成的,所以不会重新解析上下边界-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import * as echarts from "echarts";-->
<!--import * as utils from './utils';-->
<!--import {chartSummaryData, listChart} from "@/api/spc/chart";-->

<!--//定义显示的颜色-->
<!--let red = "#FF0000"-->
<!--let yellow = "#CCCC00"-->
<!--let green = "#009000"-->


<!--export default {-->
<!--  data() {-->
<!--    //参数定义-->
<!--    return {-->
<!--      //主chart实例对象-->
<!--      chart: {},-->
<!--      chartTypeOptions: [{-->
<!--        value: 1,-->
<!--        label: 'Xbar-R'-->
<!--      }, {-->
<!--        value: 2,-->
<!--        label: 'Xbar-S'-->
<!--      }],-->
<!--      //从服务器查询数据参数对象-->
<!--      queryParams: {id: "1"},-->
<!--      //从服务器获取的原始数据(originalData)-->
<!--      oData: {-->
<!--        chart: {},-->
<!--        summaryList: []-->
<!--      },-->
<!--      //预定义维度数组,注意顺序,不要轻易改变,注意需要调整analyzeData的转二维数组的内容-->
<!--      columns: [{-->
<!--        name: "dataTime",-->
<!--        type: 'ordinal'-->
<!--      }, "mean", "lotId", "mid", "rangeSpan", "std", "max", "min", "sampleSize", "toolId", "recipeId", "productId", "siteId", "processId", "remark"],-->
<!--      showColumns: [{-->
<!--        name: "dataTime",-->
<!--        type: 'ordinal'-->
<!--      }, "mean", "lotId", "sampleSize", "toolId", "recipeId", "productId", "siteId", "processId", "remark"],-->
<!--      //绘制图需要的数据格式,(drawData)-->
<!--      dData: {-->
<!--        //控制参数-->
<!--        usl: 0,-->
<!--        lsl: 0,-->
<!--        //计算参数-->
<!--        ucl: 0,-->
<!--        cl: 0,-->
<!--        lcl: 0,-->
<!--        min: 0,-->
<!--        max: 0,-->
<!--        mean: 0,-->
<!--        range: 0,-->
<!--        std: 0,-->
<!--        upperY: 0,-->
<!--        lowerY: 0,-->
<!--        //绘制参数-->
<!--        chartConfig: {-->
<!--          //需绘制的图表 1.x-r 2.x-s-->
<!--          type: 1,-->
<!--          groupSize: 1,-->
<!--          samplingMethod: 1,-->
<!--          a2: 0.2,-->
<!--          k1: 1,-->
<!--          k2: 1,-->
<!--        },-->
<!--        //仅提取mean作为值数组-->
<!--        valueData: [],-->
<!--        //x-barData 数据格式,就是二维数组-->
<!--        xBarData: [],-->
<!--        //正态分布数据格式-->
<!--        normalData: {-->
<!--          //正态分布前后距离-->
<!--          dataRangeMinOP: 1,-->
<!--          dataRangeMaxOP: 1.1,-->
<!--          //组间距-->
<!--          interval: 0.1,-->
<!--          // 这3个就不构建datasource来处理了,直接用好了-->
<!--          // 构建离散值x轴-->
<!--          xAxis: [],-->
<!--          // 构建柱状y轴-->
<!--          barYaxis: [],-->
<!--          // 构建线性y轴-->
<!--          lineYaxis: []-->
<!--        }-->
<!--      },-->
<!--      //当前主图表展示的图,1.均值-极差图 2.均值-标准差 3.R极差图 4.标准差图 4.正态分布图 5.中位数-极差图-->
<!--      showChartType: 1,-->
<!--      //次图表的图类型 ,1.X-bar均值图 2.R极差控制图 3.标准差控制图 4.正态分布图-->
<!--      showChart2Type: 2-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.init();-->
<!--  },-->
<!--  methods: {-->
<!--    /**-->
<!--     * 初始化方法-->
<!--     * 调用过程如下:-->
<!--     * init->queryData->analyzeData->redrawChart->createOption->this.chart.setOption-->
<!--     */-->
<!--    init() {-->
<!--      //从dom加载echarts对象-->
<!--      let chartDom = document.getElementById("mainChart");-->
<!--      this.chart = echarts.init(chartDom);-->
<!--      this.queryData();-->
<!--    },-->
<!--    /**-->
<!--     * 从服务器获取原始数据-->
<!--     * 实际参数:this.queryParams.... 返回结果到this.oData-->
<!--     * 回调触发redrawChart-->
<!--     */-->
<!--    queryData() {-->
<!--      //从服务获取数据-->
<!--      chartSummaryData(this.queryParams).then(response => {-->
<!--        this.oData.chart = response.chart;-->
<!--        this.oData.summaryList = response.summaryList;-->
<!--        //解析原始为图表需要的数据-->
<!--        this.analyzeData();-->
<!--      });-->
<!--    },-->
<!--    /**-->
<!--     * 绘制,或重新绘制主chart图-->
<!--     */-->
<!--    redrawChart() {-->
<!--      //清除图表-->
<!--      this.chart.clear()-->
<!--      //创建option并绘制-->
<!--      let option = this.createOption();-->
<!--      this.chart.setOption(option);-->
<!--      //弹框说明-->
<!--      this.$message.success("绘制图表成功!");-->
<!--    },-->
<!--    drawNormalChart() {-->
<!--      if (this.showChartType === 1) {-->
<!--        this.showChartType = 4;-->
<!--      } else {-->
<!--        this.showChartType = 1;-->
<!--      }-->
<!--      this.redrawChart();-->
<!--    },-->
<!--    //计算控制线,注意,必须在analyzeData之后调用-->
<!--    calculateControlLine() {-->
<!--      //依据类型来计算CL,LCL,UCL-->
<!--      let chartType = this.dData.chartConfig.type;-->
<!--      //xBar-R-->
<!--      if (chartType === 1) {-->
<!--        this.dData.cl = this.dData.mean;-->
<!--        this.dData.ucl = this.dData.mean + (this.dData.chartConfig.a2 * this.dData.range);-->
<!--        this.dData.lcl = this.dData.mean - (this.dData.chartConfig.a2 * this.dData.range);-->
<!--      }-->
<!--      //xBar-S-->
<!--      else if (chartType === 2) {-->
<!--        this.dData.cl = this.dData.mean;-->
<!--        this.dData.ucl = this.dData.mean + (this.dData.chartConfig.k1 * this.dData.std);-->
<!--        this.dData.lcl = this.dData.mean - (this.dData.chartConfig.k2 * this.dData.std);-->
<!--      }-->
<!--      //从数据库来的参数情况-->
<!--      else {-->
<!--        this.dData.cl = this.oData.chart.target;-->
<!--        this.dData.ucl = this.oData.chart.ucl;-->
<!--        this.dData.lcl = this.oData.chart.lcl;-->
<!--      }-->
<!--      if (this.dData.ucl >= this.dData.usl) {-->
<!--        this.$message.error(`ucl:${this.dData.ucl}不能超过usl ${this.dData.usl}`);-->
<!--      }-->
<!--      if (this.dData.lcl <= this.dData.lsl) {-->
<!--        this.$message.error(`ucl:${this.dData.lcl}不能小于usl ${this.dData.lsl}`);-->
<!--      }-->
<!--    },-->
<!--    /**-->
<!--     * 将原始数据解析为x-bar等图需要的格式-->
<!--     * 计算mean,std.,cpk..等数据返回-->
<!--     * 实际参数:this.oData.... 返回结果到this.dData-->
<!--     */-->
<!--    analyzeData() {-->
<!--      //copy基础数据-->
<!--      this.dData.usl = this.oData.chart.usl;-->
<!--      this.dData.lsl = this.oData.chart.lsl;-->

<!--      //如果是X-bar图,则提取mean作为值数组-->
<!--      if (this.dData.chartConfig.type === 1 || this.dData.chartConfig.type === 2) {-->
<!--        this.dData.valueData = this.oData.summaryList.map(obj => obj.mean);-->
<!--      } else {-->
<!--        this.dData.valueData = this.oData.summaryList.map(obj => obj.mid);-->
<!--      }-->
<!--      //计算其他数据,最大最小cpk什么的-->
<!--      this.dData.min = Math.min(...this.dData.valueData);-->
<!--      this.dData.max = Math.max(...this.dData.valueData);-->
<!--      this.dData.mean = this.dData.valueData.reduce((sum, val) => sum + val, 0) / this.dData.valueData.length;-->
<!--      this.dData.std = utils.getStd(this.dData.valueData, this.dData.mean)-->
<!--      this.dData.range = this.dData.max - this.dData.min;-->
<!--      this.calculateControlLine();-->

<!--      //计算上下边界,如果数据过于集中,自动图表缩放会导致usl甚至是ucl超出y轴范围,不能正常绘制,那么需要手动计算上下边界-->
<!--      //取max值和usl+0.5*(usl-ucl)更大的那个-->
<!--      //取min值和lsl-0.5*(lcl-lsl)更小的那个-->
<!--      this.dData.upperY = Number(Math.max(this.dData.usl + 0.5 * (this.dData.usl - this.dData.ucl), this.dData.max).toFixed(3))-->
<!--      this.dData.lowerY = Number(Math.min(this.dData.lsl - 0.5 * (this.dData.lcl - this.dData.lsl), this.dData.min).toFixed(3))-->

<!--      // 转x-bar需要数据-->
<!--      // 对象数组转二维数组-->
<!--      this.dData.xBarData = []-->
<!--      this.dData.xBarData = this.oData.summaryList.map(obj => [obj.dataTime, obj.mean, obj.lotId,-->
<!--        obj.mid, obj.rangeSpan, obj.std, obj.max, obj.min, obj.sampleSize, obj.toolId,-->
<!--        obj.recipeId, obj.productId, obj.siteId, obj.processId, obj.remark]);-->

<!--      // 转正态分布数据-->
<!--      // 构建x轴-->
<!--      // let start = this.dData.min - this.dData.normalData.dataRangeMinOP;-->
<!--      // let end = this.dData.max + this.dData.normalData.dataRangeMaxOP;-->
<!--      // // 计算区间数量-->
<!--      // let numIntervals = Math.ceil((end - start) / this.dData.normalData.interval);-->
<!--      // // 构建离散值x轴-->
<!--      // let xAxis = [];-->
<!--      // for (let i = start; i <= end; i = i + this.dData.normalData.interval) {-->
<!--      //   let str = i.toFixed(1).toString();-->
<!--      //   xAxis.push(str);-->
<!--      // }-->
<!--      // this.dData.normalData.xAxis = xAxis;-->
<!--      // // 构建柱状y轴,遍历数组并计算频数-->
<!--      // let barYaxis = new Array(numIntervals).fill(0);-->
<!--      // this.dData.valueData.forEach((value) => {-->
<!--      //   if (value >= start && value <= end) {-->
<!--      //     // 找到值所在的区间-->
<!--      //     let intervalIndex = Math.floor((value - start) / this.dData.normalData.interval);-->
<!--      //     // 增加该区间的频数-->
<!--      //     barYaxis[intervalIndex]++;-->
<!--      //   }-->
<!--      // });-->
<!--      // this.dData.normalData.barYaxis = barYaxis;-->
<!--      // // 构建线性y轴-->
<!--      // this.dData.normalData.lineYaxis = utils.fxNormalDistribution(xAxis, this.dData.std, this.dData.mean);-->

<!--      this.redrawChart();-->
<!--    },-->
<!--    /**-->
<!--     * 构建图图表参数-->
<!--     * 1.X-bar均值图 2.R极差控制图 3.标准差控制图 4.正态分布图-->
<!--     * @returns-->
<!--     */-->
<!--    createOption() {-->
<!--      //内部匿名方法无法访问到this,用这个处理,下面都采用that-->
<!--      let that = this;-->
<!--      //option-->
<!--      let option = {};-->
<!--      //X-bar均值图-->
<!--      if (this.showChartType === 1) {-->
<!--        option = {-->
<!--          title: {-->
<!--            text: 'Xbar 均值控制图',-->
<!--          },-->
<!--          tooltip: {-->
<!--            trigger: 'axis',-->
<!--            //轴数据指示-->
<!--            axisPointer: {-->
<!--              type: 'cross'-->
<!--            },-->
<!--          },-->
<!--          xAxis: {-->
<!--            type: 'category'-->
<!--          },-->
<!--          yAxis: {-->
<!--            type: 'value',-->
<!--            max: that.dData.upperY,-->
<!--            min: that.dData.lowerY-->
<!--          },-->
<!--          dataset: [-->
<!--            {-->
<!--              //定义数据字段-->
<!--              dimensions: that.columns,-->
<!--              //定义数据内容-->
<!--              source: that.dData.xBarData-->
<!--            },-->
<!--          ],-->
<!--          series: [-->
<!--            {-->
<!--              name: 'Dow-Jones index',-->
<!--              type: 'line',-->
<!--              //密集点数过多是否显示-->
<!--              showAllSymbol: true,-->
<!--              //定义xy轴取数据那一列值-->
<!--              encode: {-->
<!--                x: 'dataTime',-->
<!--                y: 'mean',-->
<!--                tooltip: that.showColumns,-->
<!--              },-->
<!--              //定义点样式,依据数据定义点样式以及大小颜色-->
<!--              symbol: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 'triangle';-->
<!--                  }-->
<!--                  return 'circle';-->
<!--                } else {-->
<!--                  return 'emptyCircle';-->
<!--                }-->
<!--              },-->
<!--              symbolSize: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 10;-->
<!--                  }-->
<!--                  return 9;-->
<!--                } else {-->
<!--                  return 8;-->
<!--                }-->
<!--              },-->
<!--              itemStyle: {-->
<!--                color: function (params) {-->
<!--                  if (params.data[1] > that.dData.ucl || params.data[1] < that.dData.lcl) {-->
<!--                    if (params.data[1] > that.dData.usl || params.data[1] < that.dData.lsl) {-->
<!--                      return red;-->
<!--                    }-->
<!--                    return yellow;-->
<!--                  } else {-->
<!--                    return green;-->
<!--                  }-->
<!--                }-->
<!--              },-->
<!--              //定义规格线-->
<!--              markLine: {-->
<!--                silent: true,-->
<!--                symbol: 'none',-->
<!--                data: [-->
<!--                  {-->
<!--                    name: 'USL',-->
<!--                    yAxis: that.dData.usl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'USL:' + that.dData.usl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'UCL',-->
<!--                    yAxis: that.dData.ucl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'UCL:' + that.dData.ucl, fontSize: 10}-->
<!--                  },-->

<!--                  {-->
<!--                    name: 'CL',-->
<!--                    yAxis: that.dData.cl,-->
<!--                    lineStyle: {color: green},-->
<!--                    label: {color: green, formatter: 'CL:' + that.dData.cl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LCL',-->
<!--                    yAxis: that.dData.lcl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'LCL:' + that.dData.lcl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LSL',-->
<!--                    yAxis: that.dData.lsl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'LSL:' + that.dData.lsl, fontSize: 10}-->
<!--                  }-->
<!--                ]-->
<!--              }-->
<!--            }-->
<!--          ],-->
<!--          dataZoom: [-->
<!--            // {-->
<!--            //   type: 'slider',-->
<!--            //   show: true,-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'slider',-->
<!--              show: true,-->
<!--              yAxisIndex: [0],-->
<!--            },-->
<!--            // {-->
<!--            //   type: 'inside',-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'inside',-->
<!--              yAxisIndex: [0],-->
<!--            }-->
<!--          ],-->
<!--        };-->
<!--      }-->
<!--      //R极差控制图-->
<!--      if (this.showChartType === 2) {-->
<!--        option = {-->
<!--          title: {-->
<!--            text: 'R 极差控制图',-->
<!--          },-->
<!--          tooltip: {-->
<!--            trigger: 'axis',-->
<!--            //轴数据指示-->
<!--            axisPointer: {-->
<!--              type: 'cross'-->
<!--            },-->
<!--          },-->
<!--          xAxis: {-->
<!--            type: 'category'-->
<!--          },-->
<!--          yAxis: {-->
<!--            type: 'value',-->
<!--            max: that.dData.upperY,-->
<!--            min: that.dData.lowerY-->
<!--          },-->
<!--          dataset: [-->
<!--            {-->
<!--              //定义数据字段-->
<!--              dimensions: that.columns,-->
<!--              //定义数据内容-->
<!--              source: that.dData.xBarData-->
<!--            },-->
<!--          ],-->
<!--          series: [-->
<!--            {-->
<!--              name: 'Dow-Jones index',-->
<!--              type: 'line',-->
<!--              //密集点数过多是否显示-->
<!--              showAllSymbol: true,-->
<!--              //定义xy轴取数据那一列值-->
<!--              encode: {-->
<!--                x: 'dataTime',-->
<!--                y: 'rangeSpan',-->
<!--                tooltip: that.showColumns,-->
<!--              },-->
<!--              //定义点样式,依据数据定义点样式以及大小颜色-->
<!--              symbol: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 'triangle';-->
<!--                  }-->
<!--                  return 'circle';-->
<!--                } else {-->
<!--                  return 'emptyCircle';-->
<!--                }-->
<!--              },-->
<!--              symbolSize: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 10;-->
<!--                  }-->
<!--                  return 9;-->
<!--                } else {-->
<!--                  return 8;-->
<!--                }-->
<!--              },-->
<!--              itemStyle: {-->
<!--                color: function (params) {-->
<!--                  if (params.data[1] > that.dData.ucl || params.data[1] < that.dData.lcl) {-->
<!--                    if (params.data[1] > that.dData.usl || params.data[1] < that.dData.lsl) {-->
<!--                      return red;-->
<!--                    }-->
<!--                    return yellow;-->
<!--                  } else {-->
<!--                    return green;-->
<!--                  }-->
<!--                }-->
<!--              },-->
<!--              //定义规格线-->
<!--              markLine: {-->
<!--                silent: true,-->
<!--                symbol: 'none',-->
<!--                data: [-->
<!--                  {-->
<!--                    name: 'USL',-->
<!--                    yAxis: that.dData.usl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'USL:' + that.dData.usl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'UCL',-->
<!--                    yAxis: that.dData.ucl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'UCL:' + that.dData.ucl, fontSize: 10}-->
<!--                  },-->

<!--                  {-->
<!--                    name: 'CL',-->
<!--                    yAxis: that.dData.cl,-->
<!--                    lineStyle: {color: green},-->
<!--                    label: {color: green, formatter: 'CL:' + that.dData.cl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LCL',-->
<!--                    yAxis: that.dData.lcl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'LCL:' + that.dData.lcl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LSL',-->
<!--                    yAxis: that.dData.lsl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'LSL:' + that.dData.lsl, fontSize: 10}-->
<!--                  }-->
<!--                ]-->
<!--              }-->
<!--            }-->
<!--          ],-->
<!--          dataZoom: [-->
<!--            // {-->
<!--            //   type: 'slider',-->
<!--            //   show: true,-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'slider',-->
<!--              show: true,-->
<!--              yAxisIndex: [0],-->
<!--            },-->
<!--            // {-->
<!--            //   type: 'inside',-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'inside',-->
<!--              yAxisIndex: [0],-->
<!--            }-->
<!--          ],-->
<!--        };-->
<!--      }-->
<!--      //S标准差控制图-->
<!--      if (this.showChartType === 3) {-->
<!--        option = {-->
<!--          title: {-->
<!--            text: 'S 标准差控制图',-->
<!--          },-->
<!--          tooltip: {-->
<!--            trigger: 'axis',-->
<!--            //轴数据指示-->
<!--            axisPointer: {-->
<!--              type: 'cross'-->
<!--            },-->
<!--          },-->
<!--          xAxis: {-->
<!--            type: 'category'-->
<!--          },-->
<!--          yAxis: {-->
<!--            type: 'value',-->
<!--            max: that.dData.upperY,-->
<!--            min: that.dData.lowerY-->
<!--          },-->
<!--          dataset: [-->
<!--            {-->
<!--              //定义数据字段-->
<!--              dimensions: that.columns,-->
<!--              //定义数据内容-->
<!--              source: that.dData.xBarData-->
<!--            },-->
<!--          ],-->
<!--          series: [-->
<!--            {-->
<!--              name: 'Dow-Jones index',-->
<!--              type: 'line',-->
<!--              //密集点数过多是否显示-->
<!--              showAllSymbol: true,-->
<!--              //定义xy轴取数据那一列值-->
<!--              encode: {-->
<!--                x: 'dataTime',-->
<!--                y: 'mean',-->
<!--                tooltip: ["mean", "dataTime", "remark"],-->
<!--              },-->
<!--              //定义点样式,依据数据定义点样式以及大小颜色-->
<!--              symbol: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 'triangle';-->
<!--                  }-->
<!--                  return 'circle';-->
<!--                } else {-->
<!--                  return 'emptyCircle';-->
<!--                }-->
<!--              },-->
<!--              symbolSize: function (params) {-->
<!--                if (params[1] > that.dData.ucl || params[1] < that.dData.lcl) {-->
<!--                  if (params[1] > that.dData.usl || params[1] < that.dData.lsl) {-->
<!--                    return 10;-->
<!--                  }-->
<!--                  return 9;-->
<!--                } else {-->
<!--                  return 8;-->
<!--                }-->
<!--              },-->
<!--              itemStyle: {-->
<!--                color: function (params) {-->
<!--                  if (params.data[1] > that.dData.ucl || params.data[1] < that.dData.lcl) {-->
<!--                    if (params.data[1] > that.dData.usl || params.data[1] < that.dData.lsl) {-->
<!--                      return red;-->
<!--                    }-->
<!--                    return yellow;-->
<!--                  } else {-->
<!--                    return green;-->
<!--                  }-->
<!--                }-->
<!--              },-->
<!--              //定义规格线-->
<!--              markLine: {-->
<!--                silent: true,-->
<!--                symbol: 'none',-->
<!--                data: [-->
<!--                  {-->
<!--                    name: 'USL',-->
<!--                    yAxis: that.dData.usl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'USL:' + that.dData.usl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'UCL',-->
<!--                    yAxis: that.dData.ucl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'UCL:' + that.dData.ucl, fontSize: 10}-->
<!--                  },-->

<!--                  {-->
<!--                    name: 'CL',-->
<!--                    yAxis: that.dData.cl,-->
<!--                    lineStyle: {color: green},-->
<!--                    label: {color: green, formatter: 'CL:' + that.dData.cl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LCL',-->
<!--                    yAxis: that.dData.lcl,-->
<!--                    lineStyle: {color: yellow},-->
<!--                    label: {color: yellow, formatter: 'LCL:' + that.dData.lcl, fontSize: 10}-->
<!--                  },-->
<!--                  {-->
<!--                    name: 'LSL',-->
<!--                    yAxis: that.dData.lsl,-->
<!--                    lineStyle: {color: red},-->
<!--                    label: {color: red, formatter: 'LSL:' + that.dData.lsl, fontSize: 10}-->
<!--                  }-->
<!--                ]-->
<!--              }-->
<!--            }-->
<!--          ],-->
<!--          dataZoom: [-->
<!--            // {-->
<!--            //   type: 'slider',-->
<!--            //   show: true,-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'slider',-->
<!--              show: true,-->
<!--              yAxisIndex: [0],-->
<!--            },-->
<!--            // {-->
<!--            //   type: 'inside',-->
<!--            //   xAxisIndex: [0],-->
<!--            // },-->
<!--            {-->
<!--              type: 'inside',-->
<!--              yAxisIndex: [0],-->
<!--            }-->
<!--          ],-->
<!--        };-->
<!--      }-->
<!--      //正态分布-->
<!--      if (this.showChartType === 4) {-->
<!--        //定义实际数据的频数柱状图-->
<!--        let barDataSet = {-->
<!--          type: "bar",-->
<!--          smooth: true,-->
<!--          yAxisIndex: 0,-->
<!--          areaStyle: {-->
<!--            opacity: 0,-->
<!--          },-->
<!--          data: that.dData.normalData.barYaxis,-->
<!--          name: "实际分布频数",-->
<!--          label: {-->
<!--            formatter: "{c} %",-->
<!--            show: false, //默认显示-->
<!--            position: "top", //在上方显示-->
<!--            textStyle: {-->
<!--              //数值样式-->
<!--              fontSize: 16,-->
<!--            },-->
<!--          },-->
<!--        };-->
<!--        //计算实际数据的正态分布图-->
<!--        let lineDataSet = {-->
<!--          type: "line",-->
<!--          smooth: true,-->
<!--          yAxisIndex: 1,-->
<!--          areaStyle: {-->
<!--            opacity: 0,-->
<!--          },-->
<!--          data: that.dData.normalData.lineYaxis,-->
<!--          name: "实际正态分布",-->
<!--          label: {-->
<!--            formatter: "{c} %",-->
<!--            show: false, //开启显示-->
<!--            position: "top", //在上方显示-->
<!--            textStyle: {-->
<!--              //数值样式-->
<!--              fontSize: 16,-->
<!--            },-->
<!--          },-->
<!--        };-->

<!--        option = {-->
<!--          title: {-->
<!--            text: '正态分布图',-->
<!--          },-->
<!--          //提示框组件-->
<!--          tooltip: {-->
<!--            trigger: "axis",-->
<!--            axisPointer: {-->
<!--              type: "shadow",-->
<!--            },-->
<!--          },-->
<!--          xAxis: {-->
<!--            boundaryGap: true,-->
<!--            type: "category",-->
<!--            data: that.dData.normalData.xAxis,-->
<!--          },-->
<!--          //定义y轴-->
<!--          yAxis: [{-->
<!--            type: "value",-->
<!--          }, {-->
<!--            type: "value",-->
<!--          }],-->
<!--          series: [barDataSet, lineDataSet],-->
<!--        };-->
<!--      }-->
<!--      return option;-->
<!--    }-->
<!--  },-->

<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.button-container {-->
<!--  display: grid;-->
<!--  grid-template-columns: 1fr; /* 单列 */-->
<!--  grid-auto-rows: minmax(auto, auto); /* 自动行高 */-->
<!--  row-gap: 10px; /* 行间距 */-->
<!--  /* 可以根据需要添加更多样式 */-->
<!--}-->

<!--.button-container .el-button {-->
<!--  margin-right: 10px;-->
<!--  margin-left: 10px;-->
<!--}-->

<!--.form-title {-->
<!--  margin-top: 10px;-->
<!--  margin-block: 20px;-->
<!--  font-size: 23px;-->
<!--  text-align: center;-->
<!--}-->
<!--</style>-->

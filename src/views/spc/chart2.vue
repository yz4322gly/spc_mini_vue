<!--<template>-->
<!--  <div class="app-container">-->
<!--    <el-row>-->
<!--      <el-col :span="4" class="button-container">-->
<!--        <el-button @click="redrawChart">重新绘制</el-button>-->
<!--        <el-button type="warning" @click="analyzeData">重新解析数据并绘制</el-button>-->
<!--        <el-button type="primary" @click="drawNormalChart">正态分布(X)</el-button>-->
<!--        <el-button type="success" @click="showSpecDialog">更新SPEC(X)</el-button>-->
<!--        <el-button type="info">计算cpk(X)</el-button>-->
<!--        <el-button type="danger">危险按钮(X)</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="20">-->
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
<!--    <el-dialog title="更新SPEC" :visible.sync="visibleSpecDialog" width="800px" top="5vh" @closed="onSpecDialogClose" append-to-body>-->
<!--      <el-form ref="form" :model="dData" label-width="200px">-->
<!--        <el-form-item label="usl">-->
<!--          <el-input v-model="dData.usl"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="ucl">-->
<!--          <el-input v-model="dData.ucl"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="cl">-->
<!--          <el-input v-model="dData.cl"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="lcl">-->
<!--          <el-input v-model="dData.lcl"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="lsl">-->
<!--          <el-input v-model="dData.lsl"/>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import * as echarts from "echarts";-->
<!--import * as utils from './utils';-->
<!--import {demoData} from './demo';-->

<!--//定义显示的颜色-->
<!--let red="#FF0000"-->
<!--let yellow="#CCCC00"-->
<!--let green="#009000"-->

<!--export default {-->
<!--  data() {-->
<!--    //参数定义-->
<!--    return {-->
<!--      //主chart实例对象-->
<!--      mainChart: {},-->
<!--      //从服务器查询数据参数对象-->
<!--      queryParams: {},-->
<!--      //从服务器获取的原始数据(originalData)-->
<!--      oData: {-->
<!--        usl: 0,-->
<!--        ucl: 0,-->
<!--        cl: 0,-->
<!--        lcl: 0,-->
<!--        lsl: 0,-->
<!--        dataList: []-->
<!--      },-->
<!--      //预定义维度数组,注意顺序,不要轻易改变,注意需要调整analyzeData的转二维数组的内容-->
<!--      columns: ["dataTime", "paramValue", "remark"],-->
<!--      //绘制图需要的数据格式,(drawData)-->
<!--      dData: {-->
<!--        //控制参数-->
<!--        usl: 0,-->
<!--        ucl: 0,-->
<!--        cl: 0,-->
<!--        lcl: 0,-->
<!--        lsl: 0,-->
<!--        //计算参数-->
<!--        min: 0,-->
<!--        max: 0,-->
<!--        mean: 0,-->
<!--        std: 0,-->
<!--        upperY: 0,-->
<!--        lowerY: 0,-->
<!--        //仅提取paramValue作为值数组-->
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
<!--      // 当前图表类型 1.XR 2.XS 3.WR 4.ZT FIXME-->
<!--      showChartType: 1,-->
<!--      //显示更新SPEC弹框标记-->
<!--      visibleSpecDialog: false-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.init();-->
<!--  },-->
<!--  methods: {-->
<!--    /**-->
<!--      * 初始化方法-->
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

<!--      //模拟手动写入数据-->
<!--      // this.oData.dataList = []-->
<!--      // for (let n = 0; n < 100; n++) {-->
<!--      //   this.oData.dataList.push({-->
<!--      //     dataTime: n + ":00",-->
<!--      //     paramValue: 30 + Math.random() * 30,-->
<!--      //     remark: (Math.random() * 20).toFixed(3)-->
<!--      //   });-->
<!--      // }-->
<!--      // this.oData.usl = 55;-->
<!--      // this.oData.ucl = 50;-->
<!--      // this.oData.cl = 45;-->
<!--      // this.oData.lcl = 40;-->
<!--      // this.oData.lsl = 35;-->

<!--      //从json读取模拟数据-->
<!--      this.oData = demoData-->

<!--      //解析原始为图表需要的数据-->
<!--      this.analyzeData();-->
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
<!--    showSpecDialog() {-->
<!--      this.visibleSpecDialog = true;-->
<!--    },-->
<!--    //Spec弹框被关闭-->
<!--    onSpecDialogClose() {-->
<!--      this.redrawChart();-->
<!--    },-->
<!--    /**-->
<!--     * 将原始数据解析为x-bar等图需要的格式-->
<!--     * 计算mean,std.,cpk..等数据返回-->
<!--     * 实际参数:this.oData.... 返回结果到this.dData-->
<!--     */-->
<!--    analyzeData() {-->
<!--      //copy基础数据-->
<!--      this.dData.usl = this.oData.usl;-->
<!--      this.dData.ucl = this.oData.ucl;-->
<!--      this.dData.cl = this.oData.cl;-->
<!--      this.dData.lcl = this.oData.lcl;-->
<!--      this.dData.lsl = this.oData.lsl;-->

<!--      //仅提取paramValue作为值数组-->
<!--      this.dData.valueData = this.oData.dataList.map(obj => obj.paramValue);-->
<!--      //计算其他数据,最大最小cpk什么的-->
<!--      this.dData.min = Math.min(...this.dData.valueData);-->
<!--      this.dData.max = Math.max(...this.dData.valueData);-->
<!--      this.dData.mean = this.dData.valueData.reduce((sum, val) => sum + val, 0) / this.dData.valueData.length;-->
<!--      this.dData.std = utils.getStd(this.dData.valueData, this.dData.mean)-->

<!--      //计算上下边界,如果数据过于集中,自动图表缩放会导致usl甚至是ucl超出y轴范围,不能正常绘制,那么需要手动计算上下边界-->
<!--      //取max值和usl+0.5*(usl-ucl)更大的那个-->
<!--      //取min值和lsl-0.5*(lcl-lsl)更小的那个-->
<!--      this.dData.upperY = Number(Math.max(this.dData.usl + 0.5 * (this.dData.usl - this.dData.ucl), this.dData.max).toFixed(3))-->
<!--      this.dData.lowerY = Number(Math.min(this.dData.lsl - 0.5 * (this.dData.lcl - this.dData.lsl), this.dData.min).toFixed(3))-->

<!--      // 转x-bar需要数据-->
<!--      // 对象数组转二维数组-->
<!--      this.dData.xBarData = []-->
<!--      this.dData.xBarData = this.oData.dataList.map(obj => [obj.dataTime, obj.paramValue, obj.remark]);-->

<!--      // 转正态分布数据-->
<!--      // 构建x轴-->
<!--      let start = this.dData.min - this.dData.normalData.dataRangeMinOP;-->
<!--      let end = this.dData.max + this.dData.normalData.dataRangeMaxOP;-->
<!--      // 计算区间数量-->
<!--      let numIntervals = Math.ceil((end - start) / this.dData.normalData.interval);-->
<!--      // 构建离散值x轴-->
<!--      let xAxis = [];-->
<!--      for (let i = start; i <= end; i = i + this.dData.normalData.interval) {-->
<!--        let str = i.toFixed(1).toString();-->
<!--        xAxis.push(str);-->
<!--      }-->
<!--      this.dData.normalData.xAxis = xAxis;-->
<!--      // 构建柱状y轴,遍历数组并计算频数-->
<!--      let barYaxis = new Array(numIntervals).fill(0);-->
<!--      this.dData.valueData.forEach((value) => {-->
<!--        if (value >= start && value <= end) {-->
<!--          // 找到值所在的区间-->
<!--          let intervalIndex = Math.floor((value - start) / this.dData.normalData.interval);-->
<!--          // 增加该区间的频数-->
<!--          barYaxis[intervalIndex]++;-->
<!--        }-->
<!--      });-->
<!--      this.dData.normalData.barYaxis = barYaxis;-->
<!--      // 构建线性y轴-->
<!--      this.dData.normalData.lineYaxis = utils.fxNormalDistribution(xAxis, this.dData.std, this.dData.mean);-->

<!--      this.redrawChart();-->
<!--    },-->
<!--    /**-->
<!--     * 构建图图表参数-->
<!--     * @returns-->
<!--     */-->
<!--    createOption() {-->
<!--      //内部匿名方法无法访问到this,用这个处理,下面都采用that-->
<!--      let that = this;-->
<!--      //option-->
<!--      let option = {};-->
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
<!--            text: 'SPC',-->
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
<!--      //x-bar-->
<!--      else {-->
<!--        option = {-->
<!--          title: {-->
<!--            text: 'SPC',-->
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
<!--              dimensions: [{name: "dataTime", type: 'ordinal'}, "paramValue", "remark"],-->
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
<!--                y: 'paramValue',-->
<!--                tooltip: ["paramValue", "dataTime", "remark"],-->
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
<!--                  if (params.data[1] > that.dData.ucl || params.data[1]< that.dData.lcl) {-->
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
<!--            {-->
<!--              type: 'slider',-->
<!--              show: true,-->
<!--              xAxisIndex: [0],-->

<!--            },-->
<!--            {-->
<!--              type: 'slider',-->
<!--              show: true,-->
<!--              yAxisIndex: [0],-->
<!--              left: '93%',-->
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
<!--</style>-->

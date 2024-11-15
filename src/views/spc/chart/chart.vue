<template>
  <div class="app-container" @mousedown="closeRight">
    <!--主布局-->
    <div class="main-wrapper">
      <!--标题-->
      <div class="s1 title">{{ oData.chart.name }}</div>
      <div class="s2"></div>
      <!--查询条件-->
      <div class="s3">
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="140px">
          <el-form-item label="数据时间">
            <el-date-picker
              v-model="queryParams.time"
              type="daterange"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="限制数据">
            <el-input v-model="queryParams.limit"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="queryData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="s4">
        <!--控制按钮-->
        <div>
          <div class="form-title">控制按钮</div>
          <div class="button-container">
            <el-button icon="el-icon-magic-stick" @click="redrawChart">重新绘制</el-button>
            <el-button icon="el-icon-refresh-left" type="warning" @click="analyzeData">重置数据</el-button>
            <el-button icon="el-icon-sort" type="primary" @click="changeX">X轴切换</el-button>
            <el-button icon="el-icon-sort" type="primary" @click="changeBoxplot">boxplot</el-button>
            <el-button icon="el-icon-s-order" type="success" @click="showSummaryTable">查看数据视图</el-button>
            <el-button icon="el-icon-edit-outline" type="warning" @click="ooc.oocVisible = true">OOC规则</el-button>
            <el-button icon="el-icon-edit-outline" type="danger" @click="checkOOC">执行OOC检查</el-button>
          </div>
        </div>
        <!--绘制图表参数-->
        <div style="margin-top: 40px;">
          <div class="form-title">绘制图表参数</div>
          <div>
            <el-form ref="form" :model="dData.chartConfig" label-width="140px">
              <el-form-item label="图表类型">
                <el-select v-model="dData.chartConfig.mainChartType" placeholder="请选择图表类型">
                  <el-option v-for="item in chartTypeOptions" :key="item.value" :label="item.label"
                             :value="item.value"/>
                </el-select>
              </el-form-item>
              <div v-if="dData.chartConfig.mainChartType === 1">
                <el-form-item label="控制线系数A2">
                  <el-input v-model="dData.chartConfig.a2"/>
                </el-form-item>
                <div class="from-hit">
                  cl = mean<br/>
                  ucl = mean + (a2 * range);<br/>
                  lcl = mean - (a2 * range);<br/>
                  R图不单独设定,延用此参数,cl系数为1
                </div>
              </div>
              <div v-if="dData.chartConfig.mainChartType === 2">
                <el-form-item label="上控制线系数K1">
                  <el-input v-model="dData.chartConfig.k1"/>
                </el-form-item>
                <el-form-item label="下控制线系数K2">
                  <el-input v-model="dData.chartConfig.k2"/>
                </el-form-item>
                <div class="from-hit">
                  cl = mean<br/>
                  ucl = mean + (k1 * std);<br/>
                  lcl = mean - (k2 * std);<br/>
                  S图不单独设定,延用此参数,cl系数为1
                </div>
              </div>
              <div v-if="dData.chartConfig.mainChartType === 3">
                <el-form-item label="控制线系数M3">
                  <el-input v-model="dData.chartConfig.m3"/>
                </el-form-item>
                <div class="from-hit">
                  cl = mid<br/>
                  ucl = mid + (m3 * range);<br/>
                  lcl = mid - (m3 * range);<br/>
                  R图不单独设定,延用此参数,cl系数为1
                </div>
              </div>
            </el-form>
          </div>
          <div class="button-container">
            <el-button type="primary" @click="splitChart">改变图表类型</el-button>
            <el-button type="primary" @click="autoSpec">自动控制线/CL</el-button>
          </div>
        </div>
      </div>
      <div class="s5 chart-wrapper">

        <!-- 第一图 -->
        <!--SPEC参数1-->
        <div>
          <div class="form-title">SPEC参数1</div>
          <el-form class="form-flex" ref="form" :model="dData.dp1" label-width="40px">
            <el-form-item label="usl">
              <el-input-number v-model="dData.dp1.usl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="ucl">
              <el-input-number v-model="dData.dp1.ucl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="cl">
              <el-input-number v-model="dData.dp1.cl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="lcl">
              <el-input-number v-model="dData.dp1.lcl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="lsl">
              <el-input-number v-model="dData.dp1.lsl" controls-position="right"/>
            </el-form-item>
            <el-button class="form-flex-button" type="success" icon="el-icon-upload" @click="saveSpec">保存当前参数
            </el-button>
          </el-form>
        </div>
        <!--图一-->
        <div id="chart1" style="height: 360px;width: 100%;"/>
        <!--图例控制-->
        <div class="col-legend">
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.uslShow" :active-color=color.red
                       inactive-color="#dcdfe6"/>
            USL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.uclShow" :active-color=color.yellow
                       inactive-color="#dcdfe6"/>
            UCL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.clShow" :active-color=color.green
                       inactive-color="#dcdfe6"/>
            CL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.targetShow" :active-color=color.blue
                       inactive-color="#dcdfe6"/>
            TARGET
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.lclShow" :active-color=color.yellow
                       inactive-color="#dcdfe6"/>
            LCL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend.lslShow" :active-color=color.red
                       inactive-color="#dcdfe6"/>
            LSL
          </div>
        </div>
        <!--分析数据1-->
        <div class="shadow-box">
          <div class="form-title">分析数据1</div>
          <ul class="ul-x">
            <li>最大值: {{ dData.dp1.max.toFixed(3) }}</li>
            <li>最小值: {{ dData.dp1.min.toFixed(3) }}</li>
            <li>平均数: {{ dData.dp1.mean.toFixed(3) }}</li>
            <li>中位数: {{ dData.dp1.mid.toFixed(3) }}</li>
            <li>标准差: {{ dData.dp1.std.toFixed(3) }}</li>
            <li>极差: {{ dData.dp1.range.toFixed(3) }}</li>
            <li>样本容量: {{ dData.dp1.sampleSize }}</li>
            <li>ca: {{ dData.dp1.ca.toFixed(3) }}</li>
            <li>cp: {{ dData.dp1.cp.toFixed(3) }}</li>
            <li>cpk1: {{ dData.dp1.cpk1.toFixed(3) }}</li>
            <li>cpk2: {{ dData.dp1.cpk2.toFixed(3) }}</li>
            <li>子图类型: {{ dData.dp1.childChartType }}</li>
          </ul>
        </div>

        <!-- 第二图 -->
        <!--SPEC参数2-->
        <div>
          <div class="form-title">SPEC参数2</div>
          <el-form class="form-flex" ref="form" :model="dData.dp2" label-width="40px">
            <el-form-item label="ucl">
              <el-input-number v-model="dData.dp2.ucl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="cl">
              <el-input-number v-model="dData.dp2.cl" controls-position="right"/>
            </el-form-item>
            <el-form-item label="lcl">
              <el-input-number v-model="dData.dp2.lcl" controls-position="right"/>
            </el-form-item>
          </el-form>
        </div>
        <!--图二-->
        <div id="chart2" style="height: 360px;width: 100%;"/>
        <!--图例控制-->
        <div class="col-legend">
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend2.uclShow" :active-color=color.yellow
                       inactive-color="#dcdfe6"/>
            UCL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend2.clShow" :active-color=color.green
                       inactive-color="#dcdfe6"/>
            CL
          </div>
          <div>
            <el-switch @change="redrawChart" class="switch-small" v-model="legend2.lclShow" :active-color=color.yellow
                       inactive-color="#dcdfe6"/>
            LCL
          </div>
        </div>
        <!--分析数据2-->
        <div class="shadow-box">
          <div class="form-title">分析数据2</div>
          <ul class="ul-x">
            <li>最大值: {{ dData.dp2.max.toFixed(3) }}</li>
            <li>最小值: {{ dData.dp2.min.toFixed(3) }}</li>
            <li>平均数: {{ dData.dp2.mean.toFixed(3) }}</li>
            <li>中位数: {{ dData.dp2.mid.toFixed(3) }}</li>
            <li>标准差: {{ dData.dp2.std.toFixed(3) }}</li>
            <li>极差: {{ dData.dp2.range.toFixed(3) }}</li>
            <li>样本容量: {{ dData.dp2.sampleSize }}</li>
            <li>子图类型: {{ dData.dp2.childChartType }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 数据视图summary-->
    <el-dialog title="数据视图" :visible.sync="summaryDiv.summaryDivVisible" width="80%">
      <el-form>
        <el-form-item label="隐藏点/正常数据">
          <el-switch v-model="summaryDiv.validFlag" @change="changeSummaryDivValidFlag"></el-switch>
        </el-form-item>
      </el-form>
      <el-table :data="summaryDiv.showSummaryList" style="margin-top: 20px;">
        <el-table-column v-if="!summaryDiv.validFlag">
          <template slot-scope="scope">
            <el-button size="small" type=primary @click="handleShowSummery(scope.row.id)">显示点</el-button>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip v-for="(item,index) in columns"
                         :label="item" :key="index" align="center" :prop="item" width="100">
        </el-table-column>
      </el-table>
      <pagination
        :page-sizes="[5,10,20,200,500,100]"
        v-show="summaryDiv.total>0"
        :total="summaryDiv.total"
        :page.sync="summaryDiv.pageNum"
        :limit.sync="summaryDiv.pageSize"
        @pagination="getShowSummary"/>
    </el-dialog>

    <!-- 使用说明 -->
    <div v-if="false">
      说明<br/>
      1.x-bar等图上下边界计算方式：<br/>
      上边界取max值和usl+0.5*(usl-ucl)更大的那个<br/>
      下边界取min值和lsl-0.5*(lcl-lsl)更小的那个<br/>
      为避免出现小数位数过多/精度不足,边界均取3位小数<br/>
      2.x轴切换为lot会出现一个x轴出现多个数据的情况,请注意有没有重叠数据,可以放大看
    </div>

    <!-- 自定义右键菜单 -->
    <div id="rightMenu" v-show="right.rightVisible" class="right-menu"
         :style="{top: right.topNumber+'px', left: right.leftNumber+'px'}">
      <el-menu>
        <el-menu-item @click="showDetails">查看原始数据</el-menu-item>
        <el-menu-item @click="handleHiddenSummery">隐藏点</el-menu-item>
        <el-menu-item @click="handleDeleteSummery">删除点</el-menu-item>
        <el-menu-item @click="handleRemarkSummery">注释点</el-menu-item>
      </el-menu>
    </div>

    <!-- 原始数据对话框 -->
    <el-dialog :visible.sync="right.infoVisible" width="80%">
      <el-descriptions class="margin-top" title="数据明细" :column="3" size="medium" border>
        <el-descriptions-item v-for="(item,index) in right.dimensionNames" :label="item" :key="index">
          <template slot="label">{{ item }}</template>
          {{ right.data[index] }}
        </el-descriptions-item>
      </el-descriptions>

      <el-table :data="right.details.dataList" style="margin-top: 20px;">
        <el-table-column show-overflow-tooltip label="批次号" align="center" prop="lotId" width="100"/>
        <el-table-column show-overflow-tooltip label="数据时间" align="center" prop="dataTime" width="180"/>
        <el-table-column show-overflow-tooltip label="参数值" align="center" prop="paramValue"/>
        <el-table-column show-overflow-tooltip label="设备号" align="center" prop="toolId"/>
        <el-table-column show-overflow-tooltip label="配方号" align="center" prop="recipeId"/>
        <el-table-column show-overflow-tooltip label="产品号" align="center" prop="productId"/>
        <el-table-column show-overflow-tooltip label="站点号" align="center" prop="siteId"/>
        <el-table-column show-overflow-tooltip label="工艺号" align="center" prop="processId"/>
        <el-table-column show-overflow-tooltip label="注释" align="center" prop="remark"/>
        <el-table-column show-overflow-tooltip label="是否隐藏" align="center" prop="validFlag">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.validFlag === 1" type=primary>正常</el-tag>
            <el-tag v-else type=info>隐藏</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        :page-sizes="[5,10,20,200,500,100]"
        v-show="right.details.total>0"
        :total="right.details.total"
        :page.sync="right.queryParams.pageNum"
        :limit.sync="right.queryParams.pageSize"
        @pagination="getDetails"
      />
    </el-dialog>

    <!-- OOC规则-->
    <el-dialog title="OOC规则" :visible.sync="ooc.oocVisible" width="800px">
      <el-form ref="form" :model="dData.config" label-width="80px" v-if="ooc.oocVisible" :inline="true">
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[0].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 1#:1个点,距离中心线大于{{ ooc.config[0].param }}个标准差</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[0].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[1].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 2#:连续{{ ooc.config[1].param }}点在中心线同一侧</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[1].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[2].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 3#:连续{{ ooc.config[2].param }}点全部递增或递减</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[2].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[3].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 4#:连续{{ ooc.config[3].param }}点,上下交错</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[3].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[4].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label">5#:连续{{ ooc.config[4].param + 1 }}个点中至少有{{ ooc.config[4].param }}个点,
              距离中心线(同一侧)大于2个标准差</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[4].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[5].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label">6#:连续{{ ooc.config[5].param + 1 }}个点中至少有{{ ooc.config[5].param }}个点,
              距离中心线(同一侧)大于1个标准差</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[5].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[6].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 7#:连续{{ ooc.config[6].param }}点,距离中心线(任意一侧)1个标准差以内</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[6].param"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <el-form-item label="是否检查">
              <el-switch :active-value="1" :inactive-value="0" v-model="ooc.config[7].check"/>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <span class="ooc-label"> 8#:连续{{ ooc.config[7].param }}个点,距离中心线(任意一侧)大于1个标准差</span>
          </el-col>
          <el-col :span="5">
            <el-input-number v-model="ooc.config[7].param"/>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button icon="el-icon-edit-outline" type="danger" @click="checkOOC" size="mini">执行OOC检查</el-button>
          <el-button type="success" icon="el-icon-upload" @click="saveOOC" size="mini">保存规则</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from "echarts";
import * as utils from '../utils';
import {chartSummaryData, listChart, listDataBySummaryId, saveOOC, updateChart} from "@/api/spc/chart";
import {delSummary, remarkSummary, hiddenSummary} from "@/api/spc/summary";

//定义显示的颜色
let red = "#FF0000"
let yellow = "#CCCC00"
let green = "#009000"
let blue = "#8582da"


export default {
  data() {
    //参数定义
    return {
      color: {
        red: red,
        yellow: yellow,
        green: green,
        blue: blue,
      },
      //主chart实例对象
      chart: {},
      chart2: {},
      option1: {},
      option2: {},
      chartTypeOptions: [{
        value: 1,
        label: 'Xbar-R'
      }, {
        value: 2,
        label: 'Xbar-S'
      }, {
        value: 3,
        label: 'XMedian-R'
      }],
      //从服务器查询数据参数对象
      queryParams: {
        id: null,
        limit: 1000,
        time: []
      },
      //预定义时间选项
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      //预定义维度数组,注意顺序,不要轻易改变,注意需要调整analyzeData的转二维数组的内容
      columns: ["id", "createTime", "updateTime", "lotId", "dataTime", "paramKey", "mean", "mid", "q1", "q3", "rangeSpan",
        "std", "max", "min", "sampleSize", "toolId", "recipeId", "productId", "siteId", "processId", "validFlag", "remark"],
      showColumns: ["dataTime", "mean", "lotId", "sampleSize", "toolId", "recipeId", "productId", "siteId", "processId", "remark"],
      //从服务器获取的原始数据(originalData)
      oData: {
        chart: {},
        summaryList: []
      },
      summaryDiv: {
        summaryDivVisible: false,
        //当前所有的数据，由于接口不分页，一次获取所有，存在这里
        allSummaryList: [],
        //当前展示的数据
        showSummaryList: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        //是否显示隐藏数据
        validFlag: true,
        //需要查询数据库的时候需要的参数
        queryParams: {},
      },
      //绘制图需要的数据格式,(drawData)
      dData: {
        //二维数组的数据格式
        data: [],
        //主图的绘制参数,dp的参数会被方法覆盖,这里写是为了在加载的时候页面找不到数据而报错设计的
        dp1: {
          //这些参数需要被预定义,不然调用toFixed方法时会出现未定义异常,
          min: 0,
          max: 0,
          mean: 0,
          mid: 0,
          std: 0,
          range: 0,
          ca: 0,
          cp: 0,
          cpk1: 0,
          cpk2: 0,
          //dp1需要绘制ooc点
          oocMarkPoint: {
            data: [],
            symbol: "pin"
          }
        },
        //第二图的绘制参数
        dp2: {
          min: 0,
          max: 0,
          mean: 0,
          mid: 0,
          std: 0,
          range: 0,
          //没用，防止报错的
          oocMarkPoint: {}
        },
        //绘制常量参数
        chartConfig: {
          //需绘制的图表 1.x-r 2.x-s
          mainChartType: 1,
          a2: 0.2,
          k1: 1,
          k2: 1,
          m3: 0.2
        },
        //正态分布数据格式
        // normalData: {
        //   //正态分布前后距离
        //   dataRangeMinOP: 1,
        //   dataRangeMaxOP: 1.1,
        //   //组间距
        //   interval: 0.1,
        //   // 这3个就不构建datasource来处理了,直接用好了
        //   // 构建离散值x轴
        //   xAxis: [],
        //   // 构建柱状y轴
        //   barYaxis: [],
        //   // 构建线性y轴
        //   lineYaxis: []
        // }
      },
      ooc: {
        //ooc配置项
        oocVisible: false,
        config: []
      },
      //控制外部图例使用
      legend: {
        uslShow: true,
        uclShow: true,
        clShow: true,
        targetShow: true,
        lclShow: true,
        lslShow: true,
      },
      legend2: {
        uclShow: true,
        clShow: true,
        lclShow: true,
      },
      //第1图的子图类型 1.均值-极差X图 2.均值-极差R图3.均值-标准差X图 4.均值-标准差S图 5.中位数-极差M图 6.中位数-极差R图
      childChartType1: 1,
      //第2图的子图类型 ,1.均值-极差X图 2.均值-极差R图3.均值-标准差X图 4.均值-标准差S图 5.中位数-极差M图 6.中位数-极差R图
      childChartType2: 2,
      //右键菜单相关控制
      right:
        {
          rightVisible: false,
          topNumber: 0,
          leftNumber: 0,
          infoVisible: false,
          dimensionNames: [],
          //当前右键选中的参数
          data: [],
          //查询details的参数
          queryParams: {
            pageNum: 1,
            pageSize: 5,
            id: null
          },
          //查询的数据
          details: {
            dataList: [],
            total: 0
          }
        },
      //是否切换盒须图显示
      boxplotVisible: false
    };
  },
  mounted() {
    this.queryParams.id = new URLSearchParams(window.location.search).get('id');
    this.init();
  },
  methods: {
    /**
     * 全局事件,如果是左键点击,则关闭右键对话框
     * @param params
     */
    closeRight(params) {
      if (params.button === 0 && params.target.className !== "el-menu-item") {
        this.right.rightVisible = false;
      }
    },
    /**
     * 保存controlLine和cl->target到数据库
     */
    saveSpec() {
      let fx = {
        id: this.oData.chart.id,
        usl: this.dData.dp1.usl,
        lsl: this.dData.dp1.lsl,
        ucl: this.dData.dp1.ucl,
        lcl: this.dData.dp1.lcl,
        target: this.dData.dp1.cl
      };
      updateChart(fx).then(response => {
        this.$modal.msgSuccess("保存成功,cl会被保存为target");
      });
    },
    /**
     * 初始化方法
     * 调用过程如下:
     * init->queryData->analyzeData->redrawChart->createOption->this.chart.setOption
     */
    init() {
      //从dom加载echarts对象
      let chartDom = document.getElementById("chart1");
      let chartDom2 = document.getElementById("chart2");
      let rightMenu = document.getElementById("rightMenu");
      //禁用默认的右键事件
      chartDom.oncontextmenu = function () {
        return false;
      };
      chartDom2.oncontextmenu = function () {
        return false;
      };
      rightMenu.oncontextmenu = function () {
        return false;
      };
      this.chart = echarts.init(chartDom);
      this.chart2 = echarts.init(chartDom2);
      this.queryData();
    },
    /**
     * 从服务器获取原始数据
     * 实际参数:this.queryParams.... 返回结果到this.oData
     * 回调触发redrawChart
     */
    queryData() {
      //从服务获取数据
      chartSummaryData(this.queryParams).then(response => {
        if (response.summaryList.length === 0) {
          this.$message.error({
            message: `当前条件下无数据可用`,
            showClose: true
          });
          return
        }
        this.oData.chart = response.chart;
        this.oData.summaryList = response.summaryList;
        //解析原始为图表需要的数据
        this.analyzeData();
      });
    },
    /**
     * analyzeData 解析基础数据
     * 计算mean,std.,cpk..等数据返回
     * 实际参数:this.oData.... 返回结果到this.dData
     */
    analyzeData() {
      // 将服务器的对象数组按this.columns转二维数组
      this.dData.data = this.oData.summaryList.map(item => {
        return this.columns.map(col => item[col]);
      });

      // 设定1级图表类型,将图表类型传递给chartConfig
      this.dData.chartConfig.mainChartType = this.oData.chart.type;

      //转换checkOoc
      this.ooc.config = JSON.parse(this.oData.chart.checkOoc);

      //拆分子图并绘制
      this.splitChart();
    },
    /**
     * 变更x轴的显示数据是 时间,还是lotID
     */
    changeX() {
      if (this.dData.dp1.x === "dataTime") {
        this.dData.dp1.x = "lotId"
        this.dData.dp2.x = "lotId"
      } else {
        this.dData.dp1.x = "dataTime"
        this.dData.dp2.x = "dataTime"
      }
      this.redrawChart();
    },
    /**
     * 转盒须图
     */
    changeBoxplot() {
      if (this.boxplotVisible) {
        this.boxplotVisible = false
      } else {
        this.boxplotVisible = true
      }
      this.redrawChart();
    },
    /**
     * 查看数据视图
     */
    showSummaryTable() {
      this.summaryDiv.validFlag = true;
      this.summaryDiv.pageNum = 1;
      this.summaryDiv.total = this.oData.summaryList.length;
      this.summaryDiv.allSummaryList = this.oData.summaryList;
      this.getShowSummary();
      this.summaryDiv.summaryDivVisible = true;
    },
    getShowSummary() {
      let pageNum = this.summaryDiv.pageNum;
      let pageSize = this.summaryDiv.pageSize;
      this.summaryDiv.showSummaryList = this.summaryDiv.allSummaryList.slice((pageNum - 1) * pageSize, (pageNum - 1) * pageSize + pageSize);
    },
    changeSummaryDivValidFlag(validFlag) {
      if (validFlag) {
        this.showSummaryTable();
      } else {
        chartSummaryData({
          id: this.queryParams.id,
          time: this.queryParams.time,
          limit: this.queryParams.limit,
          validFlag: 0
        }).then(response => {
          if (response.summaryList.length === 0) {
            this.$message.error({
              message: `当前条件下无数据可用`,
              showClose: true
            });
            return
          }
          this.summaryDiv.pageNum = 1;
          this.summaryDiv.allSummaryList = response.summaryList;
          this.summaryDiv.total = response.summaryList.length;
          this.getShowSummary();
        });
      }
    },
    /**
     * 改变图表类型,且会执行计算DP的行为
     * 依据指定的大图表类型,拆分2个子图表类
     * childChartType 1.均值-极差X图 2.均值-极差R图3.均值-标准差X图 4.均值-标准差S图 5.中位数-极差M图 6.中位数-极差R图
     */
    splitChart() {
      //按传入的图表类型设定要绘制哪些图表
      switch (this.dData.chartConfig.mainChartType) {
        //X-R时,主图是均值-极差X图,副图是均值-极差R图
        case 1:
          this.childChartType1 = 1;
          this.childChartType2 = 2;
          break;
        //X-S时,主图是均值-标准差X图,副图是均值-标准差S图
        case 2:
          this.childChartType1 = 3;
          this.childChartType2 = 4;
          break;
        //M-R时,主图是中位数-极差M图,副图是中位数-极差R图
        case 3:
          this.childChartType1 = 5;
          this.childChartType2 = 6;
          break;
      }

      //创建绘制参数
      this.dData.dp1 = this.createDp(this.childChartType1);
      this.dData.dp2 = this.createDp(this.childChartType2);

      //要求重绘
      this.redrawChart();
    },

    /**
     * 构建绘制参数(DP)
     * 此方法类似工具方法,不在调用链中,也不应该被事件绑定
     * @param childChartType 1.均值-极差X图 2.均值-极差R图3.均值-标准差X图 4.均值-标准差S图 5.中位数-极差M图 6.中位数-极差R图
     * 1.均值-极差X图 2.均值-极差R图
     * 3.均值-标准差X图 4.均值-标准差S图
     * 5.中位数-极差M图 6.中位数-极差R图
     * @param auto 使用计算得到的spec而不是数据库提供的
     * @returns
     */
    createDp(childChartType, auto) {
      // 均值-极差控制图(均值图)
      if (childChartType === 1) {
        let usl = this.oData.chart.usl;
        let lsl = this.oData.chart.lsl;
        //先提取数据,按均值提取
        let valueData = this.oData.summaryList.map(obj => obj.mean);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean);
        let range = max - min;
        let sampleSize = valueData.length;
        let ca = utils.calcCa(mean, this.oData.chart.target, usl, lsl);
        let cp = utils.calcCp(mean, std, usl, lsl);
        let cpk1 = utils.calcCpk(mean, std, usl, lsl);
        let cpk2 = utils.calcCpk2(ca, cp);

        let ucl;
        let lcl;
        let cl;
        //如果用户设定了ucl,且没有在页面显式的指明自动计算控制线
        if (this.oData.chart.ucl && !auto) {
          ucl = this.oData.chart.ucl;
          lcl = this.oData.chart.lcl;
          cl = this.oData.chart.target;
        } else {
          let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, usl, lsl);
          ucl = calcCL.ucl;
          lcl = calcCL.lcl;
          cl = calcCL.cl;
        }

        return {
          title: "均值-极差控制图(X图)",
          data: this.dData.data,
          columns: this.columns,
          x: "dataTime",
          y: "mean",
          showColumns: this.showColumns,
          yIndex: 6,
          usl: usl,
          lsl: lsl,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          ca: ca,
          cp: cp,
          cpk1: cpk1,
          cpk2: cpk2,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
      // 均值-极差控制图(极差图)
      if (childChartType === 2) {
        //先提取数据,按极差提取
        let valueData = this.oData.summaryList.map(obj => obj.rangeSpan);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean)
        let range = max - min;
        let sampleSize = valueData.length;
        let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, null, null);

        let ucl = calcCL.ucl;
        let lcl = calcCL.lcl;
        let cl = calcCL.cl;

        return {
          title: "均值-极差控制图(R图)",
          data: this.dData.data,
          columns: this.columns,
          showColumns: this.showColumns,
          x: "dataTime",
          y: "rangeSpan",
          yIndex: 8,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
      // 均值-标准差X图
      if (childChartType === 3) {
        let usl = this.oData.chart.usl;
        let lsl = this.oData.chart.lsl;
        //先提取数据,按均值提取
        let valueData = this.oData.summaryList.map(obj => obj.mean);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean)
        let range = max - min;
        let sampleSize = valueData.length;
        let ca = utils.calcCa(mean, this.oData.chart.target, usl, lsl);
        let cp = utils.calcCp(mean, std, usl, lsl);
        let cpk1 = utils.calcCpk(mean, std, usl, lsl);
        let cpk2 = utils.calcCpk2(ca, cp);

        let ucl;
        let lcl;
        let cl;
        //如果用户设定了ucl,且没有在页面显式的指明自动计算控制线
        if (this.oData.chart.ucl && !auto) {
          ucl = this.oData.chart.ucl;
          lcl = this.oData.chart.lcl;
          cl = this.oData.chart.target;
        } else {
          let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, usl, lsl);
          ucl = calcCL.ucl;
          lcl = calcCL.lcl;
          cl = calcCL.cl;
        }

        return {
          title: "均值-标准差控制图(X图)",
          data: this.dData.data,
          columns: this.columns,
          x: "dataTime",
          y: "mean",
          showColumns: this.showColumns,
          yIndex: 6,
          usl: usl,
          lsl: lsl,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          ca: ca,
          cp: cp,
          cpk1: cpk1,
          cpk2: cpk2,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
      // 均值-标准差S图
      if (childChartType === 4) {
        //先提取数据,按极差提取
        let valueData = this.oData.summaryList.map(obj => obj.std);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean)
        let range = max - min;
        let sampleSize = valueData.length;
        let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, null, null);

        let ucl = calcCL.ucl;
        let lcl = calcCL.lcl;
        let cl = calcCL.cl;

        return {
          title: "均值-标准差控制图(S图)",
          data: this.dData.data,
          columns: this.columns,
          showColumns: this.showColumns,
          x: "dataTime",
          y: "std",
          yIndex: 9,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
      // 中位数-极差控制图(均值图)
      if (childChartType === 5) {
        let usl = this.oData.chart.usl;
        let lsl = this.oData.chart.lsl;
        //先提取数据,按均值提取
        let valueData = this.oData.summaryList.map(obj => obj.mid);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean)
        let range = max - min;
        let sampleSize = valueData.length;
        let ca = utils.calcCa(mean, this.oData.chart.target, usl, lsl);
        let cp = utils.calcCp(mean, std, usl, lsl);
        let cpk1 = utils.calcCpk(mean, std, usl, lsl);
        let cpk2 = utils.calcCpk2(ca, cp);
        let ucl;
        let lcl;
        let cl;
        //如果用户设定了ucl,且没有在页面显式的指明自动计算控制线
        if (this.oData.chart.ucl && !auto) {
          ucl = this.oData.chart.ucl;
          lcl = this.oData.chart.lcl;
          cl = this.oData.chart.target;
        } else {
          let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, usl, lsl);
          ucl = calcCL.ucl;
          lcl = calcCL.lcl;
          cl = calcCL.cl;
        }

        return {
          title: "中位数-极差控制图(X图)",
          data: this.dData.data,
          columns: this.columns,
          x: "dataTime",
          y: "mid",
          showColumns: this.showColumns,
          yIndex: 7,
          usl: usl,
          lsl: lsl,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          ca: ca,
          cp: cp,
          cpk1: cpk1,
          cpk2: cpk2,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
      // 中位数-极差控制图(极差图)
      if (childChartType === 6) {
        //先提取数据,按极差提取
        let valueData = this.oData.summaryList.map(obj => obj.rangeSpan);
        //计算其他数据,最大最小cpk什么的
        let min = Math.min(...valueData);
        let max = Math.max(...valueData);
        let mean = valueData.reduce((sum, val) => sum + val, 0) / valueData.length;
        let mid = utils.getMedianNoSort(valueData);
        let std = utils.getStd(valueData, mean)
        let range = max - min;
        let sampleSize = valueData.length;
        let calcCL = this.calculateControlLine(childChartType, mid, mean, range, std, null, null);

        let ucl = calcCL.ucl;
        let lcl = calcCL.lcl;
        let cl = calcCL.cl;

        return {
          title: "中位数-极差控制图(R图)",
          data: this.dData.data,
          columns: this.columns,
          showColumns: this.showColumns,
          x: "dataTime",
          y: "rangeSpan",
          yIndex: 8,
          //数据库有值先取数据库的
          ucl: ucl,
          lcl: lcl,
          cl: cl,
          target: this.oData.chart.target,

          //下面是绘制不需要的参数,但是控制和显示数据需要
          valueData: valueData,
          min: min,
          max: max,
          mean: mean,
          std: std,
          mid: mid,
          range: range,
          sampleSize: sampleSize,
          childChartType: childChartType
        }
      }
    },

    /**
     * 绘制,或重新绘制主chart图
     */
    redrawChart() {
      //清除图表
      this.chart.clear()
      this.chart2.clear()

      //依据当前的dp,计算上下界注入到对象中
      this.calculateBounds(this.dData.dp1);
      this.calculateBounds(this.dData.dp2);

      //创建echarts图表绘制格式
      if (!this.boxplotVisible) {
        this.option1 = this.createOption(this.dData.dp1, this.legend, 1);
      } else {
        this.option1 = this.createOption(this.dData.dp1, this.legend, 2);
      }
      this.option2 = this.createOption(this.dData.dp2, this.legend2, 1);

      this.chart.setOption(this.option1);
      this.chart2.setOption(this.option2);

      //绑定右键对话框
      let that = this
      this.chart.on("mousedown", function (params) {
        let event = params.event;
        //监听右键
        if (event.event.button === 2) {
          //定位对话框位置,显示数据
          that.right.leftNumber = event.event.clientX;
          that.right.topNumber = event.event.clientY;
          that.right.rightVisible = true;

          //注入选中的数据和列名
          that.right.dimensionNames = params.dimensionNames;
          that.right.data = params.data;
        }
      });
      //弹框说明
      this.$message.success("绘制图表成功!");
    },
    /**
     * 显示原始数据详情
     */
    showDetails() {
      this.right.infoVisible = true
      //设置id以及将分页设置为1
      this.right.queryParams.id = this.right.data[0]
      this.right.queryParams.pageNum = 1
      this.getDetails();
      this.right.rightVisible = false;
    },
    /**
     * 从服务器获取数据,使用当前的分页
     */
    getDetails() {
      listDataBySummaryId(this.right.queryParams).then(response => {
        this.right.details.dataList = response.rows;
        this.right.details.total = response.total;
      });
    },
    //隐藏,注释,删除点
    handleHiddenSummery() {
      this.right.rightVisible = false;
      let dd = {
        id: this.right.data[0],
        validFlag: 0
      };
      this.$modal.confirm('是否确认隐藏数据点,隐藏的数据点作用于所有控制图，将不会参与进行计算').then(function () {
        return hiddenSummary(dd);
      }).then(() => {
        //刷新页面
        this.queryData();
        this.$modal.msgSuccess("隐藏成功");
      }).catch(() => {
      });
    },
    // 显示点
    handleShowSummery(id) {
      let dd = {
        id: id,
        validFlag: 1
      };
      this.$modal.confirm('是否显示隐藏数据点,显示的数据点作用于所有控制图').then(function () {
        return hiddenSummary(dd);
      }).then(() => {
        //刷新页面.绘图
        this.queryData();
        //刷新列表
        this.changeSummaryDivValidFlag(false);
        this.$modal.msgSuccess("显示成功");
      }).catch(() => {
      });
    },
    handleDeleteSummery() {
      this.right.rightVisible = false;
      const ids = [this.right.data[0]];
      this.$modal.confirm('是否确认删除数据汇总编号为"' + ids + '"的数据项？删除只能通过重新计算恢复.').then(function () {
        return delSummary(ids);
      }).then(() => {
        //刷新页面
        this.queryData();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    handleRemarkSummery() {
      this.right.rightVisible = false;
      this.$prompt('备注点信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({value}) => {
        let dd = {
          id: this.right.data[0],
          remark: value
        }
        remarkSummary(dd).then(() => {
          //刷新页面
          this.queryData();
          this.$modal.msgSuccess("备注成功");
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消备注'
        });
      });
    },
    /**
     *  计算上下界
     */
    calculateBounds(dp) {
      if (dp.childChartType === 1 || dp.childChartType === 3 || dp.childChartType === 5) {
        dp.upperY = Number(Math.max(dp.usl + 0.5 * (dp.usl - dp.ucl), dp.max).toFixed(3))
        dp.lowerY = Number(Math.min(dp.lsl - 0.5 * (dp.lcl - dp.lsl), dp.min).toFixed(3))
      } else if (dp.childChartType === 2 || dp.childChartType === 4 || dp.childChartType === 6) {
        dp.upperY = Number(Math.max(dp.ucl, dp.max).toFixed(3))
        dp.lowerY = Number(Math.min(dp.lcl, dp.min).toFixed(3))
      }
    },
    /**
     * 强制使用计算参数构建spec然后绘图(不然只会使用数据库/用户指定参数绘制)
     */
    autoSpec() {
      //创建绘制参数
      this.dData.dp1 = this.createDp(this.childChartType1, true);
      this.dData.dp2 = this.createDp(this.childChartType2, true);

      //要求重绘
      this.redrawChart();
    },
    /**
     * 前端使用当前数据检查OOC
     */
    checkOOC() {
      let config = this.ooc.config;
      let data = this.dData.dp1.valueData;
      let cl = this.dData.dp1.cl;
      let std = this.dData.dp1.std;
      let markPoint = {
        data: [],
        symbol: "pin",
        itemStyle: {
          color: red
        }
      };
      for (let element of config) {
        if (element.check === 1) {
          let n = element.param;
          switch (element.type) {
            // 1#:1个点,距离中心线大于n个标准差
            case 1: {
              for (let i = 0; i < data.length; i++) {
                let us = cl + n * std;
                let ls = cl - n * std;
                if (data[i] > us || data[i] < ls) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#1"
                    },
                    desc: "OOC超规:1# 1个点,距离中心线大于" + n + "个标准差;<br/>参考范围(" + ls.toFixed(3) + "," + us.toFixed(3) + "),当前值:" + data[i],
                  })
                }
              }
            }
              break;
            // 2#:连续n点在中心线同一侧
            case 2: {
              for (let i = 0; i < data.length - n + 1; i++) {
                //哪一边,和是否超限
                let upSide = null;
                let ooc = true;
                for (let j = i; j < i + n; j++) {
                  if (upSide == null) {
                    upSide = data[j] > cl;
                  } else {
                    //出现不在同一侧的了,跳出
                    if ((data[j] > cl) !== upSide) {
                      ooc = false;
                      break;
                    }
                  }
                }
                if (ooc) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#2"
                    },
                    desc: "OOC超规:2# 连续" + n + "点在中心线同一侧<br/>从当前点往后的" + n + "点,位于中心线一侧",
                  })
                }
              }
            }
              break;
            // 3#:连续n点全部递增或递减
            case 3: {
              for (let i = 0; i < data.length - n + 1; i++) {
                //是否递增/减,和是否超限
                let incremental = null;
                let ooc = true;
                for (let j = i; j < (i + n - 1); j++) {
                  if (incremental == null) {
                    if (data[j] === data[j + 1]) {
                      ooc = false;
                      break;
                    } else {
                      incremental = data[j] < data[j + 1];
                    }
                  } else {
                    if (data[j] === data[j + 1]) {
                      ooc = false;
                      break;
                    }
                    //出现不是递增/减了,跳出
                    if ((data[j] < data[j + 1]) !== incremental) {
                      ooc = false;
                      break;
                    }
                  }
                }
                if (ooc) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#3"
                    },
                    desc: "OOC超规:3# 连续" + n + "点全部递增或递减<br/>从当前点往后的" + n + "点发生连续递增/减",
                  })
                }
              }
            }
              break;
            // 4#:连续n点,上下交错
            case 4: {
              for (let i = 0; i < data.length - n + 1; i++) {
                //当前是否递增
                let incremental = null;
                let ooc = true;
                for (let j = i; j < (i + n - 1); j++) {
                  if (incremental == null) {
                    if (data[j] === data[j + 1]) {
                      ooc = false;
                      break;
                    } else {
                      incremental = data[j] < data[j + 1];
                    }
                  } else {
                    if (data[j] === data[j + 1]) {
                      ooc = false;
                      break;
                    }
                    //出现连续递增/减,跳出
                    if ((data[j] > data[j + 1]) !== incremental) {
                      ooc = false;
                      break;
                    } else {
                      incremental = !incremental
                    }
                  }
                }
                if (ooc) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#4",
                    },
                    desc: "OOC超规:4# 连续" + n + "点,上下交错<br/>从当前点往后的连续" + n + "点发生上下交错",
                  })
                }
              }
            }
              break;
            // 5#:连续n+1个点中有n个点,距离中心线(同一侧)大于2个标准差
            case 5: {
              let us = cl + 2 * std;
              let ls = cl - 2 * std;

              for (let i = 0; i < data.length - n; i++) {
                let std2Count = 0;
                let upStd2Count = 0;
                let downStd2Count = 0;
                for (let j = i; j < i + (n + 1); j++) {
                  if (data[j] > us || data[j] < ls) {
                    std2Count++;
                    if (data[j] > cl) {
                      upStd2Count++;
                    }
                    if (data[j] < cl) {
                      downStd2Count++;
                    }
                  }
                }
                if (std2Count >= n && (upStd2Count >= n || downStd2Count >= n)) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#5"
                    },
                    desc: "OOC超规:5# 连续" + (n + 1) + "个点中有" + n + "个点,距离中心线(同一侧)大于2个标准差<br/>从当前点往后的" + (n + 1) +
                      "点出现,参考范围(" + ls.toFixed(3) + "," + us.toFixed(3) + ")"
                  })
                }
              }
            }
              break;
            // 6#:连续n+1个点中有n个点,距离中心线(同一侧)大于1个标准差
            case 6: {
              let us = cl + std;
              let ls = cl - std;

              for (let i = 0; i < data.length - n; i++) {
                let std2Count = 0;
                let upStd2Count = 0;
                let downStd2Count = 0;
                for (let j = i; j < i + (n + 1); j++) {
                  if (data[j] > us || data[j] < ls) {
                    std2Count++;
                    if (data[j] > cl) {
                      upStd2Count++;
                    }
                    if (data[j] < cl) {
                      downStd2Count++;
                    }
                  }
                }
                if (std2Count >= n && (upStd2Count >= n || downStd2Count >= n)) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#6"
                    },
                    desc: "OOC超规:6# 连续" + (n + 1) + "个点中有" + n + "个点,距离中心线(同一侧)大于1个标准差<br/>从当前点往后的" + (n + 1) +
                      "点出现,参考范围(" + ls.toFixed(3) + "," + us.toFixed(3) + ")"
                  })
                }
              }
            }
              break;
            // 7#:连续n点,距离中心线(任意一侧)1个标准差以内
            case 7: {
              let us = cl + std;
              let ls = cl - std;

              for (let i = 0; i < data.length - n + 1; i++) {
                let ooc = true;
                for (let j = i; j < i + n; j++) {
                  // 出现大于/小于一个std,
                  if (data[j] > us || data[j] < ls) {
                    ooc = false;
                    break;
                  }
                }
                if (ooc) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#7"
                    },
                    desc: "OOC超规:7# 连续" + n + "个点,距离中心线(任意一侧)1个标准差以内<br/>从当前点往后的" + n +
                      "点出现,参考范围(" + ls.toFixed(3) + "," + us.toFixed(3) + ")"
                  })
                }
              }
            }
              break;
            // 8#:连续n个点,距离中心线(任意一侧)大于1个标准差
            case 8: {
              let us = cl + std;
              let ls = cl - std;

              for (let i = 0; i < data.length - n + 1; i++) {
                let ooc = true;
                for (let j = i; j < i + n; j++) {
                  // 出现在一个std之内的,
                  if (data[j] < us && data[j] > ls) {
                    ooc = false;
                    break;
                  }
                }
                if (ooc) {
                  markPoint.data.push({
                    value: markPoint.data.length,
                    coord: [i, data[i]],
                    label: {
                      formatter: "#8"
                    },
                    desc: "OOC超规:8# 连续" + n + "个点,距离中心线(任意一侧)大于1个标准差<br/>从当前点往后的" + n +
                      "点出现,参考范围(" + ls.toFixed(3) + "," + us.toFixed(3) + ")"
                  })
                }
              }
            }
              break;
          }
        }
      }

      this.dData.dp1.oocMarkPoint = markPoint;
      this.ooc.oocVisible = false;
      this.redrawChart();
    },
    saveOOC() {
      saveOOC(this.oData.chart.id, JSON.stringify(this.ooc.config)).then(() => {
        this.checkOOC()
      });
    },
    /**
     * 计算控制线,注意,必须在analyzeData之后调用
     * @param childChartType
     * @param mid
     * @param mean
     * @param range
     * @param std
     * @param usl
     * @param lsl
     * @returns {{}}
     */
    calculateControlLine(childChartType, mid, mean, range, std, usl, lsl) {
      let rs = {};
      //依据类型来计算CL,LCL,UCL
      //xBar-R
      if (childChartType === 1 || childChartType === 2) {
        rs.cl = mean;
        rs.ucl = mean + (this.dData.chartConfig.a2 * range);
        rs.lcl = mean - (this.dData.chartConfig.a2 * range);
      }
      //xBar-S
      else if (childChartType === 3 || childChartType === 4) {
        rs.cl = mean;
        rs.ucl = mean + (this.dData.chartConfig.k1 * std);
        rs.lcl = mean - (this.dData.chartConfig.k2 * std);
      } else if (childChartType === 5 || childChartType === 6) {
        rs.cl = mid;
        rs.ucl = mid + (this.dData.chartConfig.m3 * range);
        rs.lcl = mid - (this.dData.chartConfig.m3 * range);
      }
      //从数据库来的参数情况
      else {
        rs.cl = this.oData.chart.target;
        rs.ucl = this.oData.chart.ucl;
        rs.lcl = this.oData.chart.lcl;
      }
      //加2个小延时,不然会和黏在一块
      if (usl && rs.ucl >= usl) {
        setTimeout(() => {
          this.$message.error({
            message: `ucl:${rs.ucl}不能大于usl ${usl},请手动设定控制线/参数,或隐藏异常点`,
            duration: 0,
            showClose: true
          });
        }, 20);

      }
      if (lsl && rs.lcl <= lsl) {
        setTimeout(() => {
          this.$message.error({
            message: `lcl:${rs.lcl}不能小于lsl ${lsl},请手动设定控制线/参数,或隐藏异常点`,
            duration: 0,
            showClose: true
          });
        }, 30);
      }
      return rs;
    },

    /**
     * 创建Option
     * title 标题
     * upperY 表上边界
     * lowerY 表下边界
     * data 数据(二维数组)
     * columns 描述:数据(二维数组)每一列的列名
     * x x轴列名
     * y y轴列名
     * showColumns 提示框里面展示那些列
     * usl usl
     * lsl lsl
     * ucl ucl
     * lcl lcl
     * cl cl
     * target target
     * @param dp drawParam 绘制参数
     * @param legend legend 外部图例
     * @param drawChartType 绘制图表类型
     *
     */
    createOption(dp, legend, drawChartType) {
      if (drawChartType === 1) {
        let markLine = [];
        if (legend.uclShow) {
          markLine.push(
            {
              name: 'UCL',
              yAxis: dp.ucl,
              lineStyle: {color: yellow},
              label: {color: yellow, formatter: 'UCL:' + dp.ucl, fontSize: 10}
            });
        }
        if (legend.clShow) {
          markLine.push(
            {
              name: 'CL',
              yAxis: dp.cl,
              lineStyle: {color: green},
              label: {color: green, formatter: 'CL:' + dp.cl, fontSize: 10}
            });
        }
        if (legend.lclShow) {
          markLine.push(
            {
              name: 'LCL',
              yAxis: dp.lcl,
              lineStyle: {color: yellow},
              label: {color: yellow, formatter: 'LCL:' + dp.lcl, fontSize: 10}
            });
        }
        //存在usl时绘制usl和lsl线
        if (dp.usl && legend.uslShow) {
          markLine.push({
            name: 'USL',
            yAxis: dp.usl,
            lineStyle: {color: red},
            label: {color: red, formatter: 'USL:' + dp.usl, fontSize: 10}
          });
        }
        if (dp.target && legend.targetShow) {
          markLine.push({
            name: 'TARGET',
            yAxis: dp.target,
            lineStyle: {color: blue},
            label: {color: blue, formatter: 'TARGET:' + dp.target, fontSize: 10}
          });
        }
        if (dp.lsl && legend.lslShow) {
          markLine.push({
            name: 'LSL',
            yAxis: dp.lsl,
            lineStyle: {color: red},
            label: {color: red, formatter: 'LSL:' + dp.lsl, fontSize: 10}
          });
        }
        return {
          grid: {
            left: "5%",
            bottom: 70
          },
          title: {
            text: dp.title,
            textStyle: {
              color: "#606266"
            },
            left: "center"
          },
          tooltip: {
            trigger: 'item',
            //轴数据指示
            axisPointer: {
              type: 'cross'
            },
            formatter: function (params) {
              if (params.componentType === "series") {
                // dp.yIndex 即数据值的编号，在均值图中就是均值，中位数图就是中位数，极差图就是极差
                return `id: ${params.value[0]}<br/>
                      批次号: ${params.value[3]}<br/>
                      数据值: ${params.value[dp.yIndex]}<br/>
                      数据时间: ${params.value[4]}<br/>
                      样本容量: ${params.value[12]}<br/>
                      备注: ${params.value[19]}<br/>`;
                // 可能用的的其他的参数
                // paramKey: ${params.value[5]}<br/>
                // mean: ${params.value[6]}<br/>
                // mid: ${params.value[7]}<br/>
                // rangeSpan: ${params.value[8]}<br/>
                // std: ${params.value[9]}<br/>
                // max: ${params.value[10]}<br/>
                // min: ${params.value[11]}<br/>
                // 设备号: ${params.value[13]}<br/>
                // 配方号: ${params.value[14]}<br/>
                // 产品型号: ${params.value[15]}<br/>
                // 站点编号: ${params.value[16]}<br/>
                // 工艺号: ${params.value[17]}<br/>
              } else if (params.componentType === "markPoint") {
                // console.log(params)
                return params.data.desc;
              } else {
                return '未定义的tooltip类型'
              }
            }
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              rotate: 90,
              //格式化x轴数据
              formatter: function (value, index) {
                let date = new Date(value);
                if (isNaN(date.getTime())) {
                  return value;
                } else {
                  // return value.replace(" ","\n")
                  return (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
                  // return (date.getFullYear() % 100).toString().padStart(2, '0') + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
                  // return date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
                }
              }
            },
          },
          yAxis: {
            type: 'value',
            max: dp.upperY,
            min: dp.lowerY
          },
          dataset: [
            {
              //定义数据字段
              dimensions: dp.columns,
              //定义数据内容
              source: dp.data
            },
          ],
          series: [
            {
              name: 'Dow-Jones index',
              type: 'line',
              //密集点数过多是否显示
              showAllSymbol: true,
              //定义xy轴取数据那一列值
              encode: {
                x: dp.x,
                y: dp.y,
                // 自动展示列
                // tooltip: dp.showColumns,
              },
              //定义点样式,依据数据定义点样式以及大小颜色
              symbol: function (params) {
                if (params[dp.yIndex] > dp.ucl || params[dp.yIndex] < dp.lcl) {
                  if (dp.usl && (params[dp.yIndex] > dp.usl || params[dp.yIndex] < dp.lsl)) {
                    return 'triangle';
                  }
                  return 'circle';
                } else {
                  return 'emptyCircle';
                }
              },
              symbolSize: function (params) {
                if (params[dp.yIndex] > dp.ucl || params[dp.yIndex] < dp.lcl) {
                  if (dp.usl && (params[dp.yIndex] > dp.usl || params[dp.yIndex] < dp.lsl)) {
                    return 10;
                  }
                  return 9;
                } else {
                  return 8;
                }
              },
              itemStyle: {
                color: function (params) {
                  if (params.data[dp.yIndex] > dp.ucl || params.data[dp.yIndex] < dp.lcl) {
                    if (dp.usl && (params.data[dp.yIndex] > dp.usl || params.data[dp.yIndex] < dp.lsl)) {
                      return red;
                    }
                    return yellow;
                  } else {
                    return green;
                  }
                }
              },
              //定义规格线
              markLine: {
                silent: true,
                symbol: 'none',
                data: markLine
              },
              markPoint: dp.oocMarkPoint
            }
          ],
          dataZoom: [
            {
              type: 'slider',
              show: true,
              yAxisIndex: [0],
              //不过滤数据，只改变数轴范围。
              filterMode: 'none'
            },
            {
              type: 'inside',
              yAxisIndex: [0],
              filterMode: 'none'
            },
            // x缩放轴
            // {
            //   type: 'slider',
            //   show: true,
            //   xAxisIndex: [0],
            //   filterMode : 'none',
            //   height:20
            // },
            // {
            //   type: 'inside',
            //   xAxisIndex: [0],
            //   filterMode : 'none'
            // }
          ],
        };
      } else if (drawChartType === 2) {
        return {
          grid: {
            left: "5%",
            bottom: 70
          },
          title: [{
            text: "盒须图视图",
            textStyle: {
              color: "#606266"
            },
            left: "center"
          }],
          xAxis: {
            type: 'category',
            axisLabel: {
              rotate: 90,
              //格式化x轴数据
              formatter: function (value, index) {
                let date = new Date(value);
                if (isNaN(date.getTime())) {
                  return value;
                } else {
                  return (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
                }
              }
            },
          },
          yAxis: {
            type: 'value',
            max: dp.max + 3 * dp.range,
            min: dp.min - 3 * dp.range
          },
          dataset: [
            {
              //定义数据字段
              dimensions: dp.columns,
              //定义数据内容
              source: dp.data
            },
          ],
          series: [
            {
              name: 'Dow-Jones index',
              type: 'boxplot',
              //密集点数过多是否显示
              showAllSymbol: true,
              //定义xy轴取数据那一列值
              encode: {
                x: dp.x,
                y: ['min',  'q1',  'mid',  'q3',  'max'],
                // 自动展示列
                // tooltip: dp.showColumns,
              }
            }
          ],
          dataZoom: [
            {
              type: 'slider',
              show: true,
              yAxisIndex: [0],
              //不过滤数据，只改变数轴范围。
              filterMode: 'none'
            },
            {
              type: 'inside',
              yAxisIndex: [0],
              filterMode: 'none'
            },
            // x缩放轴
            // {
            //   type: 'slider',
            //   show: true,
            //   xAxisIndex: [0],
            //   filterMode : 'none',
            //   height:20
            // },
            // {
            //   type: 'inside',
            //   xAxisIndex: [0],
            //   filterMode : 'none'
            // }
          ]
        }
      }
    },
  },
};
</script>

<style scoped>
.button-container {
  display: grid;
  grid-template-columns: 1fr; /* 单列 */
  grid-auto-rows: minmax(auto, auto); /* 自动行高 */
  row-gap: 10px; /* 行间距 */
  /* 可以根据需要添加更多样式 */
}

.button-container .el-button {
  margin-right: 10px;
  margin-left: 10px;
}

.form-title {
  margin-top: 5px;
  margin-block: 12px;
  font-size: 18px;
  text-align: center;
  color: #606266;
  font-weight: 700;
}

li {
  color: #606266;
}

.from-hit {
  text-align: right;
  vertical-align: middle;
  font-size: 14px;
  color: #ff2a2a;
  margin: 0 0 10px 0;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-input-number {
  width: 95%;
}

.title {
  font-size: 42px;
  text-align: center;
  margin-bottom: 10px;
  color: #606266;
}

.right-menu {
  width: 130px;
  position: fixed;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* 边缘边框阴影 */
}

.el-menu-item {
  height: 40px;
  line-height: 40px;
}

.ooc-label {
  font-weight: bold;
  line-height: 36px;
}

.col-legend {
  display: flex;
  justify-content: center;
  flex-direction: column;
  line-height: 28px;
  padding-left: 10px;
}

.switch-small {
  transform: scale(0.9);
}

.ul-x {
  padding-left: 10px;
  line-height: 23px;
}

.main-wrapper {
  display: grid;
  grid-template-columns: 250px auto;
  row-gap: 5px;
  column-gap: 5px;
  grid-auto-rows: minmax(auto, auto);
}

.s1 {
  grid-column: 1/3;
  grid-row: 1;
}

.s2 {
  grid-column: 1;
  grid-row: 2;
}

.s3 {
  grid-column: 2;
  grid-row: 2;
}

.s4 {
  grid-row: 3;
  grid-column: 1;
}

.s5 {
  grid-column: 2;
  grid-row: 3;
}

.chart-wrapper {
  display: grid;
  grid-template-columns: 200px auto 120px 150px;
  row-gap: 10px;
  column-gap: 15px;
  grid-auto-rows: minmax(auto, auto);
}

.form-flex {
  display: flex;
  flex-direction: column;
}

.form-flex-button {
  width: 92%;
  align-self: center;
}
</style>

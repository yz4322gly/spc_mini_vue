<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="管制图名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入管制图名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数key" prop="paramKey">
        <el-input
          v-model="queryParams.paramKey"
          placeholder="请输入参数key"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="管制图类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择管制图类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.chart_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="批次号" prop="lotId">
        <el-input
          v-model="queryParams.lotId"
          placeholder="请输入过滤条件:批次号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备号" prop="toolId">
        <el-input
          v-model="queryParams.toolId"
          placeholder="请输入过滤条件:设备号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配方号" prop="recipeId">
        <el-input
          v-model="queryParams.recipeId"
          placeholder="请输入过滤条件:配方号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品号" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入过滤条件:产品号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点号" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入过滤条件:站点号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工艺号" prop="processId">
        <el-input
          v-model="queryParams.processId"
          placeholder="请输入过滤条件:工艺号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上规格线" prop="usl">
        <el-input
          v-model="queryParams.usl"
          placeholder="请输入上规格线"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下规格线" prop="lsl">
        <el-input
          v-model="queryParams.lsl"
          placeholder="请输入下规格线"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上控制线" prop="ucl">
        <el-input
          v-model="queryParams.ucl"
          placeholder="请输入上控制线"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下控制线" prop="lcl">
        <el-input
          v-model="queryParams.lcl"
          placeholder="请输入下控制线"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设计目标值" prop="target">
        <el-input
          v-model="queryParams.target"
          placeholder="请输入设计目标值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="检查oos" prop="checkOos">
        <el-select v-model="queryParams.checkOos" placeholder="请选择检查oos" clearable size="small">
          <el-option
            v-for="dict in dict.type.check_oos"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['spc:chart:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['spc:chart:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['spc:chart:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['spc:chart:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="chartList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="管制图名" align="center" prop="name" />
      <el-table-column label="参数key" align="center" prop="paramKey" />
      <el-table-column label="管制图类型" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.chart_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="批次号" align="center" prop="lotId" />
      <el-table-column label="设备号" align="center" prop="toolId" />
      <el-table-column label="配方号" align="center" prop="recipeId" />
      <el-table-column label="产品号" align="center" prop="productId" />
      <el-table-column label="站点号" align="center" prop="siteId" />
      <el-table-column label="工艺号" align="center" prop="processId" />
      <el-table-column label="上规格线" align="center" prop="usl" />
      <el-table-column label="下规格线" align="center" prop="lsl" />
      <el-table-column label="上控制线" align="center" prop="ucl" />
      <el-table-column label="下控制线" align="center" prop="lcl" />
      <el-table-column label="设计目标值" align="center" prop="target" />
      <el-table-column label="检查oos" align="center" prop="checkOos">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.check_oos" :value="scope.row.checkOos"/>
        </template>
      </el-table-column>
<!--      <el-table-column label="检查ooc" align="center" prop="checkOoc" />-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleShowChart(scope.row)"
            v-hasPermi="['spc:chart:remove']"
          >查看图表</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['spc:chart:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['spc:chart:remove']"
          >删除</el-button>
          <el-button icon="el-icon-edit-outline" size="mini" type="text" @click="openOocDialog(scope.row)">OOC规则</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改spc管制图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="管制图名" prop="name">
          <el-input v-model="form.name" placeholder="请输入管制图名" />
        </el-form-item>
        <el-form-item label="参数key" prop="paramKey">
          <el-input v-model="form.paramKey" placeholder="请输入参数key" />
        </el-form-item>
        <el-form-item label="管制图类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择管制图类型">
            <el-option
              v-for="dict in dict.type.chart_type"
              :key="dict.value"
              :label="dict.label"
:value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="lotId">
          <el-input v-model="form.lotId" placeholder="请输入过滤条件:批次号" />
        </el-form-item>
        <el-form-item label="设备号" prop="toolId">
          <el-input v-model="form.toolId" placeholder="请输入过滤条件:设备号" />
        </el-form-item>
        <el-form-item label="配方号" prop="recipeId">
          <el-input v-model="form.recipeId" placeholder="请输入过滤条件:配方号" />
        </el-form-item>
        <el-form-item label="产品号" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入过滤条件:产品号" />
        </el-form-item>
        <el-form-item label="站点号" prop="siteId">
          <el-input v-model="form.siteId" placeholder="请输入过滤条件:站点号" />
        </el-form-item>
        <el-form-item label="工艺号" prop="processId">
          <el-input v-model="form.processId" placeholder="请输入工艺号" />
        </el-form-item>
        <el-form-item label="上规格线" prop="usl">
          <el-input v-model="form.usl" placeholder="请输入上规格线" />
        </el-form-item>
        <el-form-item label="下规格线" prop="lsl">
          <el-input v-model="form.lsl" placeholder="请输入下规格线" />
        </el-form-item>
        <el-form-item label="上控制线" prop="ucl">
          <el-input v-model="form.ucl" placeholder="请输入上控制线" />
        </el-form-item>
        <el-form-item label="下控制线" prop="lcl">
          <el-input v-model="form.lcl" placeholder="请输入下控制线" />
        </el-form-item>
        <el-form-item label="设计目标值" prop="target">
          <el-input v-model="form.target" placeholder="请输入设计目标值" />
        </el-form-item>
        <el-form-item label="检查oos" prop="checkOos">
          <el-select v-model="form.checkOos" placeholder="请选择检查oos">
            <el-option
              v-for="dict in dict.type.check_oos"
              :key="dict.value"
              :label="dict.label"
:value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="检查ooc" prop="checkOoc">-->
<!--          <el-input v-model="form.checkOoc" type="textarea" placeholder="请输入内容" />-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- OOC规则-->
    <el-dialog title="OOC规则" :visible.sync="ooc.oocVisible" width="1000px">
      <el-form :model="ooc.config" label-width="80px" v-if="ooc.oocVisible" :inline="true">
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
          <el-button type="success" icon="el-icon-upload" @click="saveOOC" size="mini">保存规则</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {listChart, getChart, delChart, addChart, updateChart, saveOOC} from "@/api/spc/chart";

export default {
  name: "Chart",
  dicts: ['chart_type', 'check_oos'],
  data() {
    return {
      ooc: {
        //ooc配置项
        id:null,
        oocVisible: false,
        config:null,
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // spc管制图表格数据
      chartList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        paramKey: null,
        type: null,
        lotId: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null,
        usl: null,
        lsl: null,
        ucl: null,
        lcl: null,
        target: null,
        checkOos: null,
        checkOoc: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        paramKey: [
          { required: true, message: "参数key不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    openOocDialog(row){
      this.ooc.oocVisible = true;
      this.ooc.id = row.id;
      if (row.checkOoc)
      {
        this.ooc.config = JSON.parse(row.checkOoc);
      }
      else
      {
        this.ooc.config = [{"type":1,"check":1,"param":3},{"type":2,"check":1,"param":9},{"type":3,"check":1,"param":6},{"type":4,"check":1,"param":14},{"type":5,"check":1,"param":2},{"type":6,"check":1,"param":4},{"type":7,"check":1,"param":15},{"type":8,"check":1,"param":8}];
      }
    },
    saveOOC() {
      saveOOC(this.ooc.id, JSON.stringify(this.ooc.config)).then(() => {
        this.$message({
          type: 'success',
          message: '保存成功'
        });
        this.ooc.oocVisible = false;
      });
    },
    /** 查询spc管制图列表 */
    getList() {
      this.loading = true;
      listChart(this.queryParams).then(response => {
        this.chartList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        createTime: null,
        updateTime: null,
        name: null,
        paramKey: null,
        type: null,
        lotId: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null,
        usl: null,
        lsl: null,
        ucl: null,
        lcl: null,
        target: null,
        checkOos: null,
        checkOoc: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加spc管制图";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getChart(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改spc管制图";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateChart(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChart(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleShowChart(row) {
      // 使用window.open()打开新标签页
      window.open('/chart?id='+row.id, '_blank');
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = [row.id] || this.ids;
      this.$modal.confirm('是否确认删除spc管制图编号为"' + ids + '"的数据项？').then(function() {
        return delChart(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('spc/chart/export', {
        ...this.queryParams
      }, `chart_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="批次号" prop="lotId">
        <el-input
          v-model="queryParams.lotId"
          placeholder="请输入批次号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据时间" prop="dataTime">
        <el-date-picker clearable size="small"
          v-model="queryParams.dataTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择数据时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="参数组名" prop="paramKey">
        <el-input
          v-model="queryParams.paramKey"
          placeholder="请输入参数组名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="平均值" prop="mean">
        <el-input
          v-model="queryParams.mean"
          placeholder="请输入平均值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="中位数" prop="mid">
        <el-input
          v-model="queryParams.mid"
          placeholder="请输入中位数"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="极差" prop="rangeSpan">
        <el-input
          v-model="queryParams.rangeSpan"
          placeholder="请输入极差"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标准差" prop="std">
        <el-input
          v-model="queryParams.std"
          placeholder="请输入标准差"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大值" prop="max">
        <el-input
          v-model="queryParams.max"
          placeholder="请输入最大值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最小值" prop="min">
        <el-input
          v-model="queryParams.min"
          placeholder="请输入最小值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="样本容量" prop="sampleSize">
        <el-input
          v-model="queryParams.sampleSize"
          placeholder="请输入样本容量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="过滤条件:设备号" prop="toolId">
        <el-input
          v-model="queryParams.toolId"
          placeholder="请输入过滤条件:设备号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="过滤条件:配方号" prop="recipeId">
        <el-input
          v-model="queryParams.recipeId"
          placeholder="请输入过滤条件:配方号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="过滤条件:产品号" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入过滤条件:产品号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="过滤条件:站点号" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入过滤条件:站点号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="过滤条件:工艺号" prop="processId">
        <el-input
          v-model="queryParams.processId"
          placeholder="请输入过滤条件:工艺号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['spc:summary:add']"
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
          v-hasPermi="['spc:summary:edit']"
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
          v-hasPermi="['spc:summary:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['spc:summary:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="summaryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="批次号" align="center" prop="lotId" />
      <el-table-column label="数据时间" align="center" prop="dataTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dataTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参数组名" align="center" prop="paramKey" />
      <el-table-column label="平均值" align="center" prop="mean" />
      <el-table-column label="中位数" align="center" prop="mid" />
      <el-table-column label="极差" align="center" prop="rangeSpan" />
      <el-table-column label="标准差" align="center" prop="std" />
      <el-table-column label="最大值" align="center" prop="max" />
      <el-table-column label="最小值" align="center" prop="min" />
      <el-table-column label="样本容量" align="center" prop="sampleSize" />
      <el-table-column label="过滤条件:设备号" align="center" prop="toolId" />
      <el-table-column label="过滤条件:配方号" align="center" prop="recipeId" />
      <el-table-column label="过滤条件:产品号" align="center" prop="productId" />
      <el-table-column label="过滤条件:站点号" align="center" prop="siteId" />
      <el-table-column label="过滤条件:工艺号" align="center" prop="processId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['spc:summary:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['spc:summary:remove']"
          >删除</el-button>
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

    <!-- 添加或修改数据汇总对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="批次号" prop="lotId">
          <el-input v-model="form.lotId" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="数据时间" prop="dataTime">
          <el-date-picker clearable size="small"
            v-model="form.dataTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择数据时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参数组名" prop="paramKey">
          <el-input v-model="form.paramKey" placeholder="请输入参数组名" />
        </el-form-item>
        <el-form-item label="平均值" prop="mean">
          <el-input v-model="form.mean" placeholder="请输入平均值" />
        </el-form-item>
        <el-form-item label="中位数" prop="mid">
          <el-input v-model="form.mid" placeholder="请输入中位数" />
        </el-form-item>
        <el-form-item label="极差" prop="rangeSpan">
          <el-input v-model="form.rangeSpan" placeholder="请输入极差" />
        </el-form-item>
        <el-form-item label="标准差" prop="std">
          <el-input v-model="form.std" placeholder="请输入标准差" />
        </el-form-item>
        <el-form-item label="最大值" prop="max">
          <el-input v-model="form.max" placeholder="请输入最大值" />
        </el-form-item>
        <el-form-item label="最小值" prop="min">
          <el-input v-model="form.min" placeholder="请输入最小值" />
        </el-form-item>
        <el-form-item label="样本容量" prop="sampleSize">
          <el-input v-model="form.sampleSize" placeholder="请输入样本容量" />
        </el-form-item>
        <el-form-item label="过滤条件:设备号" prop="toolId">
          <el-input v-model="form.toolId" placeholder="请输入过滤条件:设备号" />
        </el-form-item>
        <el-form-item label="过滤条件:配方号" prop="recipeId">
          <el-input v-model="form.recipeId" placeholder="请输入过滤条件:配方号" />
        </el-form-item>
        <el-form-item label="过滤条件:产品号" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入过滤条件:产品号" />
        </el-form-item>
        <el-form-item label="过滤条件:站点号" prop="siteId">
          <el-input v-model="form.siteId" placeholder="请输入过滤条件:站点号" />
        </el-form-item>
        <el-form-item label="过滤条件:工艺号" prop="processId">
          <el-input v-model="form.processId" placeholder="请输入过滤条件:工艺号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSummary, getSummary, delSummary, addSummary, updateSummary } from "@/api/spc/summary";

export default {
  name: "Summary",
  data() {
    return {
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
      // 数据汇总表格数据
      summaryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lotId: null,
        dataTime: null,
        paramKey: null,
        mean: null,
        mid: null,
        rangeSpan: null,
        std: null,
        max: null,
        min: null,
        sampleSize: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        lotId: [
          { required: true, message: "批次号不能为空", trigger: "blur" }
        ],
        dataTime: [
          { required: true, message: "数据时间不能为空", trigger: "blur" }
        ],
        paramKey: [
          { required: true, message: "参数组名不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询数据汇总列表 */
    getList() {
      this.loading = true;
      listSummary(this.queryParams).then(response => {
        this.summaryList = response.rows;
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
        lotId: null,
        dataTime: null,
        paramKey: null,
        mean: null,
        mid: null,
        rangeSpan: null,
        std: null,
        max: null,
        min: null,
        sampleSize: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null
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
      this.title = "添加数据汇总";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSummary(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据汇总";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSummary(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSummary(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = [row.id] || this.ids;
      this.$modal.confirm('是否确认删除数据汇总编号为"' + ids + '"的数据项？').then(function() {
        return delSummary(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('spc/summary/export', {
        ...this.queryParams
      }, `summary_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <!--      <el-form-item label="单条数据id" prop="id">-->
      <!--        <el-input-->
      <!--          v-model="queryParams.id"-->
      <!--          placeholder="请输入ID"-->
      <!--          clearable-->
      <!--          size="small"-->
      <!--          @keyup.enter.native="handleQuery"-->
      <!--        />-->
      <!--      </el-form-item>-->
      <el-form-item label="记录编号" prop="recordNum">
        <el-input
          v-model="queryParams.recordNum"
          placeholder="即lotId_副Id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="lotId" prop="lotId">
        <el-input
          v-model="queryParams.lotId"
          placeholder="请输入lotId"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="createTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          align="right">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="stat">
        <el-select v-model="queryParams.stat" clearable size="small">
          <el-option label="正常" value="1"/>
          <el-option label="历史数据" value="2"/>
        </el-select>
      </el-form-item>
      <br/>
      <el-form-item label="数据KEY1(站点)" prop="key1" label-width="120px">
        <el-input
          v-model="queryParams.key1"
          placeholder="请输入数据KEY1(站点)"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="数据KEY2(参数)" prop="key2" label-width="120px">
        <el-input
          v-model="queryParams.key2"
          placeholder="请输入数据KEY2(参数)"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"/>
      </el-form-item>


      <el-form-item label="keyId" prop="keyId">
        <el-input
          v-model="queryParams.keyId"
          placeholder="请输入keyId"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据值" prop="value">
        <el-input
          v-model="queryParams.value"
          placeholder="请输入数据值"
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
          v-hasPermi="['core:data:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['core:data:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['core:data:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['core:data:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column label="单条数据id" align="center" prop="id" />-->
      <el-table-column label="记录编号" align="center" prop="recordNum" width="200px"/>
      <el-table-column label="创建时间" align="center" prop="createTime"/>
      <el-table-column label="lotId" align="center" prop="lotId"/>
      <el-table-column label="副Id" align="center" prop="childId"/>
      <el-table-column label="keyId" align="center" prop="keyId"/>
      <el-table-column label="数据KEY1(站点)" align="center" prop="key1"/>
      <el-table-column label="数据KEY2(参数)" align="center" prop="key2"/>
      <el-table-column label="数据值" align="center" prop="value"/>
      <el-table-column label="状态" align="center" prop="stat">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.stat === 1" type=primary>正常</el-tag>
          <el-tag v-else-if="scope.row.stat === 2" type=info>历史数据</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['core:data:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['core:data:remove']"
          >删除
          </el-button>
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

    <!-- 添加或修改核心数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="keyId" prop="keyId">
          <el-input v-model="form.keyId" placeholder="请输入keyId"/>
        </el-form-item>
        <el-form-item label="lotId" prop="lotId">
          <el-input v-model="form.lotId" placeholder="请输入lotId"/>
        </el-form-item>
        <el-form-item label="数据值" prop="value">
          <el-input v-model="form.value" placeholder="请输入数据值"/>
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
import {listData, getData, delData, addData, updateData} from "@/api/core/data";

export default {
  name: "Dato",
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
      // 核心数据表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //临时参数
      createTimeRange: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        stat: null,
        keyId: null,
        key1: null,
        key2: null,
        lotId: null,
        value: null,
        recordNum: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        keyId: [
          {required: true, message: "keyId不能为空", trigger: "blur"}
        ],
        lotId: [
          {required: true, message: "lotId不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询核心数据列表 */
    getList() {
      this.loading = true;
      if (this.createTimeRange && this.createTimeRange.length === 2) {
        this.queryParams.startTime = this.createTimeRange[0]
        this.queryParams.endTime = this.createTimeRange[1]
      } else {
        this.queryParams.startTime = null;
        this.queryParams.endTime = null;
      }
      listData(this.queryParams).then(response => {
        this.dataList = response.rows;
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
        keyId: null,
        lotId: null,
        value: null
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加核心数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getData(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改核心数据";
      });
    },
    /** 提交按钮 */
    submitForm() {
   this.$refs["form"].validate(valid => {   
        if (valid) {
          if (this.form.id != null) {
            updateData(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addData(this.form).then(response => {
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
      let ids;
      if (row.id) {
        ids = [row.id]
      } else {
        ids = this.ids;
      }
      this.$modal.confirm('是否确认删除核心数据编号为"' + ids + '"的数据项？').then(function () {
        return delData(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('core/data/export', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

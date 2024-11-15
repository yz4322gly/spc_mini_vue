<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数值" prop="paramValue">
        <el-input
          v-model="queryParams.paramValue"
          placeholder="请输入参数值"
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
      <el-form-item label="批次号" prop="lotId">
        <el-input
          v-model="queryParams.lotId"
          placeholder="请输入批次号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备号" prop="toolId">
        <el-input
          v-model="queryParams.toolId"
          placeholder="请输入设备号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配方号" prop="recipeId">
        <el-input
          v-model="queryParams.recipeId"
          placeholder="请输入配方号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品号" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点号" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入站点号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工艺号" prop="processId">
        <el-input
          v-model="queryParams.processId"
          placeholder="请输入工艺号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="有效标记" prop="validFlag">
        <el-input
          v-model="queryParams.validFlag"
          placeholder="请输入有效标记"
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
        <el-upload v-hasPermi="['spc:data:add']"
                   ref="upload"
                   :limit="1"
                   accept=".xlsx, .xls"
                   :headers="upload.headers"
                   :action="upload.url"
                   :disabled="upload.isUploading"
                   :on-progress="handleFileUploadProgress"
                   :on-success="handleFileSuccess"
        >
          <el-button type="primary" plain icon="el-icon-plus" size="mini">
            导入
            <i class="el-icon-upload el-icon--right"></i>
          </el-button>
        </el-upload>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['spc:data:add']"
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
          v-hasPermi="['spc:data:edit']"
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
          v-hasPermi="['spc:data:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['spc:data:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="参数组key" align="center" prop="paramKey" />
      <el-table-column label="参数值" align="center" prop="paramValue" />
      <el-table-column label="数据时间" align="center" prop="dataTime" width="180"/>
      <el-table-column label="手动注释" align="center" prop="remark" />
      <el-table-column label="批次号" align="center" prop="lotId" />
      <el-table-column label="设备号" align="center" prop="toolId" />
      <el-table-column label="配方号" align="center" prop="recipeId" />
      <el-table-column label="产品号" align="center" prop="productId" />
      <el-table-column label="站点号" align="center" prop="siteId" />
      <el-table-column label="工艺号" align="center" prop="processId" />
      <el-table-column label="有效标记" align="center" prop="validFlag" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['spc:data:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['spc:data:remove']"
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

    <!-- 添加或修改spc主数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数值" prop="paramValue">
          <el-input v-model="form.paramValue" placeholder="请输入参数值" />
        </el-form-item>
        <el-form-item label="数据时间" prop="dataTime">
          <el-date-picker clearable size="small"
            v-model="form.dataTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择数据时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="手动注释" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入手动注释" />
        </el-form-item>
        <el-form-item label="批次号" prop="lotId">
          <el-input v-model="form.lotId" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="设备号" prop="toolId">
          <el-input v-model="form.toolId" placeholder="请输入设备号" />
        </el-form-item>
        <el-form-item label="配方号" prop="recipeId">
          <el-input v-model="form.recipeId" placeholder="请输入配方号" />
        </el-form-item>
        <el-form-item label="产品号" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品号" />
        </el-form-item>
        <el-form-item label="站点号" prop="siteId">
          <el-input v-model="form.siteId" placeholder="请输入站点号" />
        </el-form-item>
        <el-form-item label="工艺号" prop="processId">
          <el-input v-model="form.processId" placeholder="请输入工艺号" />
        </el-form-item>
        <el-form-item label="有效标记" prop="validFlag">
          <el-input v-model="form.validFlag" placeholder="请输入有效标记" />
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
import { listData, getData, delData, addData, updateData } from "@/api/spc/data";
import { getToken } from "@/utils/auth";
import { Loading } from 'element-ui';

export default {
  name: "Data",
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
      // spc主数据表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paramValue: null,
        dataTime: null,
        lotId: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null,
        validFlag: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/spc/data/uploadAndSummary"
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
      Loading.service({ fullscreen: true,text:"上传处理中,请稍候,请不要重复操作上传,会导致数据重复!" })
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      let loadingInstance = Loading.service({ fullscreen: true });
      loadingInstance.close();
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>导入结束:"+ response.msg + ",请刷新数据<br/></div>", "导入结果", { dangerouslyUseHTMLString: true });
    },
    /** 查询spc主数据列表 */
    getList() {
      this.loading = true;
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
        paramKey: null,
        paramValue: null,
        dataTime: null,
        remark: null,
        lotId: null,
        toolId: null,
        recipeId: null,
        productId: null,
        siteId: null,
        processId: null,
        validFlag: null
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
      this.title = "添加spc主数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getData(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改spc主数据";
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
      const ids = [row.id] || this.ids;
      this.$modal.confirm('是否确认删除spc主数据编号为"' + ids + '"的数据项？').then(function() {
        return delData(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('spc/data/export', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="LotId" prop="lotId">
        <el-input
          v-model="queryParams.lotId"
          placeholder="请输入LotId"
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
      <br/>
      <el-form-item label="站点" prop="key1">
        <el-radio-group v-model="queryParams.key1" size="medium" @input="changeKeyColumn">
          <el-radio-button v-for="(item,index) in key1s" :label="item" :key="index" >{{item}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-upload v-hasPermi="['core:data:add']"
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
          v-hasPermi="['core:data:add']">新增</el-button>
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
          v-hasPermi="['core:data:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['core:data:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-link plain size="mini" type="info" icon="el-icon-download" style="padding-top: 7px;" href="/upload_demo.xlsx">下载上传示例模板</el-link>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录编号" align="center" prop="recordNum"  show-overflow-tooltip fixed="left"/>
      <el-table-column label="入库时间" align="center" prop="createTime"  width="100px"  fixed="left"/>
      <el-table-column label="lotId" align="center" prop="lotId" fixed="left" width="140px"  />
      <el-table-column label="副ID" align="center" prop="childId" fixed="left"   />
      <el-table-column v-for="(item,index) in nowColumn" :label="item.key1">
        <el-table-column v-for="(item2,index2) in item.data" :label="item2.key2" :prop="item2.key1 + '_'+ item2.key2" :key="item2.id"/>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['core:data:edit']">修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['core:data:remove']">删除</el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="lotId" prop="lotId">
          <el-input v-model="form.lotId" placeholder="请输入lotId"/>
        </el-form-item>
        <el-form-item label="childId" prop="childId">
          <el-input v-model="form.childId" placeholder="请输入childId"/>
        </el-form-item>
        <el-form-item label="站点" prop="key1">
          <el-radio-group size="medium" v-model="addNowKey1"  >
            <el-radio-button v-for="(item,index) in addColumn" :label="item" :key="index" >{{item.key1}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-for="(item,index) in addNowKey1.data" :label="item.key2" :key="index">
          <el-input v-model="item.value" @input="changeValue" placeholder="请输入数据值"></el-input>
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
import { listData, listDataBeautify,infoBeautify, getData, delData, addData, updateData,addOrUpdateBeautify,delDataBeautify ,exportBeautify} from "@/api/core/data";
import { listKey1, listKey } from "@/api/core/key";
import { getToken } from "@/utils/auth";

export default {
  name: "DataX",
  data() {
    return {
      //这个是部署前端包时的包名，访问静态文件的时候需要加上包名（和vue.config.js里的publicPath保持一致）
      process: process.env.VUE_APP_NAME,
      addNowKey1:'',
      //只有站点名的字符串清单
      key1s:[],
      // 遮罩层
      loading: true,
      // 选中数组
      recordNums: [],
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
      //全部列
      column: [],
      //当前显示列
      nowColumn: [],
      //新增或修改数据需要使用的列,注意,这里会往里面插值
      addColumn: [],
      //临时参数
      createTimeRange:'',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lotId: null,
        key1 : ''
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
        url: process.env.VUE_APP_BASE_API + "/core/data/uploadData"
      },
      // 表单参数
      form: {
        recordNum:null,
        lotId:null,
        childId:'Z',
        //这个只在提交时填充数据操作
        data:[]
      },
      // 表单校验
      rules: {
        keyId: [
          { required: true, message: "keyId不能为空", trigger: "blur" }
        ],
        lotId: [
          { required: true, message: "lotId不能为空", trigger: "blur" }
        ],
        childId: [
          { required: true, message: "childId不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getListKey1();
    this.getListKey();
    this.getList();
  },
  methods: {
    //处理修改时页面数据没刷新的问题
    changeValue (e) {
      this.$forceUpdate()
    },
    //修改查询key的操作,并且会修改nowColumn
    changeKeyColumn(str) {
      let len = this.column.length
      for (let i = 0; i < len; i++)
      {
        if (this.column[i].key1 === str)
        {
          let x = [];
          x.push(this.column[i])
          this.nowColumn = x
          break
        }
      }
      //如果没选中,则显示全部
      if (str === '')
      {
        this.nowColumn = this.column
      }
      //如果是显示全部,只有resetQuery方法调用,他会自己刷新页面,否则此方法刷新页面
      else
      {
        this.handleQuery()
      }
    },
   /** 查询key1列表 */
    getListKey1() {
      listKey1().then(response => {
        this.key1s = response.data
        //设置默认选择第一个
        //this.queryParams.key1 = this.key1s[0]
      });
    },
    /**
     * 弹框关闭事件
     * @param done
     */
    handleClose(done) {
      this.$confirm('数据将不会保存,确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    /** 查询key列表 */
    getListKey() {
      let ps = {"pageNum":1,"pageSize":10000}
      listKey(ps).then(response => {
        //处理成合适的数据结构
        let tmp = response.rows
        let len = tmp.length
        let rs = []
        let nowIndex = 0
        for (let i = 0; i < len; i++)
        {
            if(rs.length === 0)
            {
                rs[nowIndex] = {}
                rs[nowIndex].data = []
                rs[nowIndex].key1 = tmp[i].key1
                rs[nowIndex].data.push(tmp[i])
            }
            else
            {
              if(tmp[i].key1 === rs[nowIndex].key1)
              {
                rs[nowIndex].data.push(tmp[i])
              }
              else
              {
                nowIndex++
                rs[nowIndex] = {}
                rs[nowIndex].data = []
                rs[nowIndex].key1 = tmp[i].key1
                rs[nowIndex].data.push(tmp[i])
              }
            }
        }
        this.column = JSON.parse(JSON.stringify(rs));
        this.addColumn =  JSON.parse(JSON.stringify(rs));
        this.nowColumn =  JSON.parse(JSON.stringify(rs));
      });
    },
    /** 查询核心数据列表 */
    getList() {
      this.loading = true;
      if (this.createTimeRange.length === 2)
      {
        this.queryParams.startTime = this.createTimeRange[0]
        this.queryParams.endTime   = this.createTimeRange[1]
      }
      listDataBeautify(this.queryParams).then(response => {
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();

      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>"+ response.msg + ",请刷新数据<br/>"+ (response.newKeys.length > 0 ? "新增参数:" + response.newKeys : "") +  "</div>", "导入结果", { dangerouslyUseHTMLString: true });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        recordNum:null,
        lotId:null,
        childId:'Z',
        data:[]
      };
      this.resetForm("form");
      //重置this.addColumn数据
      this.addColumn =  JSON.parse(JSON.stringify(this.column));
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.changeKeyColumn('');
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.recordNums = selection.map(item => item.recordNum)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /**
     * 导入excel
     */
    handleImport(){

    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加核心数据";
      //打开页面时.默认选择第一个
      this.addNowKey1 = this.addColumn[0];
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const recordNum = row.recordNum || this.recordNums
      this.form.recordNum = recordNum;
      infoBeautify(recordNum).then(response => {
        this.form.lotId = response.lotId
        this.form.childId = response.childId

        let len = this.addColumn.length
        for (let i = 0; i < len; i++)
        {
          let tx = this.addColumn[i].data;
          let len2 = tx.length
          for (let j = 0; j < len2; j++)
          {
            let ty = tx[j];
            if (response.data[ty.id])
            {
              ty.value = response.data[ty.id].value
              //ty中的id,是core_key的id,这里记录dataId是core_data的id.用来修改的
              ty.dataId = response.data[ty.id].id
            }
          }
        }
        this.open = true;
        this.title = "修改核心数据";
        this.addNowKey1 = this.addColumn[0];
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          //处理addColumn数据到from里
          let len = this.addColumn.length
          for (let i = 0; i < len; i++)
          {
            let tx = this.addColumn[i].data;
            let len2 = tx.length
            for (let j = 0; j < len2; j++)
            {
              let ty = tx[j];
              if (ty.value)
              {
                let temp = {
                  "lotId":this.form.lotId,
                  "childId":this.form.childId,
                  "recordNum":this.form.recordNum,
                  "keyId":ty.id,
                  "value":ty.value,
                  "id":ty.dataId
                }
                this.form.data.push(temp);
              }
            }
          }
          addOrUpdateBeautify(this.form).then(response => {
            this.$modal.msgSuccess("操作成功");
            this.open = false;
            this.getList();
          })
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let recordNums;
      if (row.recordNum)
      {
        recordNums = [row.recordNum]
      }
      else
      {
        recordNums = this.recordNums;
      }
      let desc  = '确认删除?';
      if (recordNums.length > 10)
      {
        desc = "是否删除" +recordNums[0] + "等"+ recordNums.length + "条数据项?";
      }
      else
      {
        desc = '是否确认数据编号为"' + recordNums + '"的数据项？'
      }
      this.$modal.confirm(desc).then(function() {
        return delDataBeautify(recordNums);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('core/data/exportBeautify', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

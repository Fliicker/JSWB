import TestModel from "../model/test.model.js";

//定义处理方法  
const testResult = async (req, res) => {
  //获取数据
  //let choice=req.params.id;

  let rs = await TestModel()
  if (rs) {
    console.log(rs)
  }
}

//导出成员
export default testResult;
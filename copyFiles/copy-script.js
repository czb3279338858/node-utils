const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取 Excel 文件（基于脚本所在目录）
const xlsPath = path.join(__dirname, 'copy-files.xls');
const workbook = xlsx.readFile(xlsPath);

// 获取第一个工作表
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// 转换为 JSON 数组
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// 提取第一列的文件路径（跳过表头）
const filePaths = [];
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (row && row[0]) {
    const filePath = String(row[0]).trim();
    if (filePath) {
      filePaths.push(filePath);
    }
  }
}

console.log('找到的文件路径:');
filePaths.forEach(p => console.log('  ' + p));
console.log(`\n共 ${filePaths.length} 个文件`);

// 复制文件到脚本所在目录，保持目录结构
const currentDir = __dirname;
let copiedCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const srcPath of filePaths) {
  try {
    // 检查源文件是否存在
    if (!fs.existsSync(srcPath)) {
      console.log(`跳过（不存在）: ${srcPath}`);
      skippedCount++;
      continue;
    }

    const stats = fs.statSync(srcPath);
    if (!stats.isFile()) {
      console.log(`跳过（不是文件）: ${srcPath}`);
      skippedCount++;
      continue;
    }

    // 目标路径：当前目录 + 原始文件的目录结构（去掉盘符）
    // 将绝对路径转换为相对结构
    let relativePath = srcPath.replace(/^[a-zA-Z]:[\\\/]/, ''); // 去掉 Windows 盘符如 E:/
    relativePath = relativePath.replace(/^[\\\/]+/, ''); // 去掉开头的斜杠
    const destPath = path.join(currentDir, 'copy-files', relativePath);
    const destDir = path.dirname(destPath);

    // 创建目标目录
    fs.mkdirSync(destDir, { recursive: true });

    // 复制文件
    fs.copyFileSync(srcPath, destPath);
    console.log(`已复制: ${srcPath} -> ${destPath}`);
    copiedCount++;
  } catch (err) {
    console.error(`错误 (${srcPath}): ${err.message}`);
    errorCount++;
  }
}

console.log(`\n完成！成功: ${copiedCount}, 跳过: ${skippedCount}, 错误: ${errorCount}`);

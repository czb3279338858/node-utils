const fs = require('fs');
const path = require('path');

// ============ 配置加载 ============

function loadConfig() {
  const configPath = path.join(__dirname, 'batch-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('错误: 未找到配置文件 batch-config.json');
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('错误: 配置文件解析失败 -', err.message);
    process.exit(1);
  }
}

// ============ 操作模块加载 ============

function loadOperations(operationNames) {
  const operations = [];
  for (const name of operationNames) {
    const opPath = path.join(__dirname, 'operations', `${name}.js`);
    if (!fs.existsSync(opPath)) {
      console.error(`错误: 操作模块 "${name}" 不存在 (${opPath})`);
      process.exit(1);
    }
    try {
      const opFn = require(opPath);
      operations.push({ name, fn: opFn });
    } catch (err) {
      console.error(`错误: 加载操作模块 "${name}" 失败 -`, err.message);
      process.exit(1);
    }
  }
  return operations;
}

// ============ 目录递归遍历 ============

function walkDir(dirPath, fileTypes, ignoreDirs) {
  const results = [];

  function walk(currentPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath);
    } catch (err) {
      console.warn(`  警告: 无法读取目录 ${currentPath} - ${err.message}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (err) {
        console.warn(`  警告: 无法访问 ${fullPath} - ${err.message}`);
        continue;
      }

      if (stat.isDirectory()) {
        if (ignoreDirs.includes(entry)) {
          continue;
        }
        walk(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(entry).toLowerCase();
        if (fileTypes.length === 0 || fileTypes.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dirPath);
  return results;
}

// ============ 文件类型分类统计 ============

function classifyFiles(filePaths) {
  const typeMap = {};
  for (const filePath of filePaths) {
    const ext = path.extname(filePath).toLowerCase() || '(无扩展名)';
    typeMap[ext] = (typeMap[ext] || 0) + 1;
  }

  console.log('\n文件类型统计:');
  const sortedTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
  for (const [ext, count] of sortedTypes) {
    console.log(`  ${ext.padEnd(12)} - ${count} 个文件`);
  }
  console.log(`  共 ${filePaths.length} 个文件匹配\n`);

  return typeMap;
}

// ============ 批量处理 ============

function processFiles(filePaths, operations, config) {
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const filePath of filePaths) {
    for (const op of operations) {
      try {
        const result = op.fn(filePath, config);
        if (result.status === 'processed') {
          processedCount++;
          console.log(`  [处理] ${filePath}`);
        } else if (result.status === 'skipped') {
          skippedCount++;
          console.log(`  [跳过] ${filePath}${result.message ? ' - ' + result.message : ''}`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  [错误] ${filePath} - ${err.message}`);
      }
    }
  }

  return { processedCount, skippedCount, errorCount };
}

// ============ 主函数 ============

function main() {
  console.log('=== batchFiles 批量文件处理工具 ===\n');

  // 1. 加载配置
  const config = loadConfig();
  console.log(`目标目录: ${config.targetDir}`);
  console.log(`文件类型: ${config.fileTypes.length > 0 ? config.fileTypes.join(', ') : '所有文件'}`);
  console.log(`忽略目录: ${config.ignoreDirs.join(', ')}`);
  console.log(`操作列表: ${config.operations.join(', ')}`);

  // 2. 加载操作模块
  const operations = loadOperations(config.operations);

  // 3. 验证目标目录
  if (!fs.existsSync(config.targetDir)) {
    console.error(`\n错误: 目标目录不存在 - ${config.targetDir}`);
    process.exit(1);
  }
  const targetStat = fs.statSync(config.targetDir);
  if (!targetStat.isDirectory()) {
    console.error(`\n错误: 目标路径不是目录 - ${config.targetDir}`);
    process.exit(1);
  }

  // 4. 遍历目录收集文件
  console.log('\n正在扫描文件...');
  const filePaths = walkDir(config.targetDir, config.fileTypes, config.ignoreDirs);

  if (filePaths.length === 0) {
    console.log('未找到匹配的文件。');
    return;
  }

  // 5. 分类统计
  classifyFiles(filePaths);

  // 6. 执行操作
  console.log('开始处理文件...\n');
  const { processedCount, skippedCount, errorCount } = processFiles(filePaths, operations, config);

  // 7. 打印汇总
  console.log(`\n完成！处理: ${processedCount}, 跳过: ${skippedCount}, 错误: ${errorCount}`);
}

main();

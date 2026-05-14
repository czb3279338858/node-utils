const fs = require('fs');

/**
 * 操作：为文件末尾追加一个空白行
 * @param {string} filePath - 文件绝对路径
 * @param {object} config - 全局配置对象
 * @returns {{ status: 'processed' | 'skipped', message?: string }}
 */
module.exports = function (filePath, config) {
  // 读取前 8KB 检测是否为二进制文件
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(8192);
  const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0);
  fs.closeSync(fd);

  for (let i = 0; i < bytesRead; i++) {
    if (buffer[i] === 0) {
      return { status: 'skipped', message: '二进制文件，跳过' };
    }
  }

  // 以 utf-8 读取文件内容并追加换行符
  const content = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync(filePath, content + '\n', 'utf-8');

  return { status: 'processed' };
};

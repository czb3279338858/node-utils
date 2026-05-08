# node-utils
一些工具

## copyFiles

根据 Excel 清单批量复制文件。

### 使用方式

1. 在 `copyFiles/copy-files.xls` 第一个表格的第一列中填入源文件路径
2. 安装依赖：`npm install`
3. 执行复制：`npm run copy`

复制后的文件会输出到 `copyFiles/copy-files/` 目录下，保持原有的目录结构。

### 文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `copyFiles/copy-files.xls` | 文件路径清单（Excel） |
| `copyFiles/copy-script.js` | 复制脚本 |
| `copyFiles/copy-files/` | 复制输出目录（已加入 gitignore） |

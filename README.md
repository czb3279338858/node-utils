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

## batchFiles

遍历指定目录下的所有文件并进行批量操作，支持按文件类型过滤。

### 使用方式

1. 编辑 `batchFiles/batch-config.json` 配置目标目录和参数
2. 执行处理：`npm run batch`

### 配置说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `targetDir` | `string` | 要扫描的目标目录绝对路径 |
| `fileTypes` | `string[]` | 要处理的文件扩展名（如 `[".js", ".ts"]`），空数组 `[]` 表示处理所有文件 |
| `ignoreDirs` | `string[]` | 遍历时跳过的目录名 |
| `operations` | `string[]` | 要执行的操作列表，对应 `operations/` 下的模块名 |

### 可用操作

| 操作名 | 说明 |
|--------|------|
| `append-newline` | 为文件末尾追加一个空白行（自动跳过二进制文件） |

### 文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `batchFiles/batch-config.json` | 批量处理配置文件 |
| `batchFiles/batch-script.js` | 主脚本 |
| `batchFiles/operations/` | 操作模块目录 |

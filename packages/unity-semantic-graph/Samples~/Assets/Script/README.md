# Unity Semantic Graph Sample Script

このフォルダは、TypeScript で書かれた Unity のサンプルスクリプトを管理します。
ソースは `src/` に置き、トランスパイル後の `*.js` を `dist/` に生成します。

## 必要な環境

- Node.js (推奨: 最新の LTS または安定版)
- npm
- TypeScript 7.0.2

## セットアップ

```bash
cd packages/unity-semantic-graph/Samples~/Assets/Script
npm install
```

## ソースの配置

TypeScript ソースファイルは `src/` に配置します。
例: `src/onGrab.ts`

## 型定義の更新

外部型定義を取得するには、次のコマンドを実行します。

```bash
node scripts/update-types.js
```

## トランスパイル方法

```bash
npm run build
```


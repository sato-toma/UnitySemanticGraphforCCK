# ts-analyzer - ClusterScript TypeScript Analyzer

TypeScript で実装した ClusterScript コードを、SceneGraph.toml で定義された Unity コンポーネント制約に対して**静的解析**するツールです。

## 概要

このツールは以下を実現します：

1. **SceneGraph.toml の解析** - Unity シーンのゲームオブジェクトとコンポーネント情報を読み込む
2. **TypeScript コードの解析** - ClusterScript API の利用を検出
3. **コンポーネント制約の検証** - API に必要なコンポーネントがセットされているかを確認
4. **レポート生成** - 問題点と推奨設定を出力

## インストール

```bash
cd packages/ts-analyzer
npm install
npm run build
```

## テスト

```bash
cd packages/ts-analyzer
npm test
```

CI では以下のコマンドを実行することでビルドとテストを検証します。

```bash
cd packages/ts-analyzer
npm run verify
```

## 使用方法

### コマンド

```bash
# 基本的な解析
npx ts-analyzer analyze <sceneGraphPath> <tsFilePath>

# 詳細レポート
npx ts-analyzer report <sceneGraphPath> <tsFilePath>

# API カバレッジ
npx ts-analyzer coverage <sceneGraphPath> <tsFilePath>

# 推奨コンポーネント
npx ts-analyzer recommend <sceneGraphPath> <tsFilePath>

# シーングラフの構造表示
npx ts-analyzer scene-graph <sceneGraphPath>

# 利用可能な API 一覧
npx ts-analyzer list-apis
```

### 例

```bash
# SceneGraph.toml に対して script.ts を解析
npx ts-analyzer analyze ./SceneGraph.toml ./script.ts

# 詳細なレポートを生成
npx ts-analyzer report ./SceneGraph.toml ./script.ts

# API カバレッジを表示
npx ts-analyzer coverage ./SceneGraph.toml ./script.ts

# 推奨されるコンポーネントを表示
npx ts-analyzer recommend ./SceneGraph.toml ./script.ts
```

## 出力例

```
=== Analysis Results ===

File: ./script.ts
Issues: 2
Errors: 2
Warnings: 0

Issues:
  [ERROR] Line 45:10
    API: addForce
    Message: Method 'addForce' requires components: UnityEngine.Rigidbody
    Required: UnityEngine.Rigidbody
    Available: UnityEngine.MeshFilter, UnityEngine.MeshRenderer
```

## ライブラリとしての使用

```typescript
import { ClusterScriptAnalyzer } from "ts-analyzer";

const analyzer = new ClusterScriptAnalyzer("./SceneGraph.toml");
const result = analyzer.analyzeTypeScriptFile("./script.ts");

console.log(result.summary);
// { totalIssues: 2, errorCount: 2, warningCount: 0 }

// 詳細レポート生成
console.log(analyzer.generateReport(new Map().set("script.ts", result)));
```

## API リファレンス

### ClusterScriptAnalyzer

```typescript
class ClusterScriptAnalyzer {
  // SceneGraph.toml ファイルからアナライザーを初期化
  constructor(sceneGraphPath: string);

  // TypeScript ファイルを解析
  analyzeTypeScriptFile(tsFilePath: string): AnalysisResult;

  // 複数ファイルを解析
  analyzeMultipleFiles(tsFilePaths: string[]): Map<string, AnalysisResult>;

  // レポート生成
  generateReport(results: Map<string, AnalysisResult>): string;
  generateSceneGraphReport(): string;
  generateApiCoverageReport(tsFilePath: string): string;
  generateRecommendedComponents(tsFilePath: string): string;
}
```

### 型定義

```typescript
interface AnalysisResult {
  filePath: string;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
  };
}

interface ValidationIssue {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  apiCall: string;
  requiredComponents: string[];
  availableComponents: string[];
}
```

## サポートされている ClusterScript API

以下のメソッドとプロパティをサポートしています：

### 物理系メソッド
- `addForce()` - Rigidbody 必須
- `addForceAt()` - Rigidbody 必須
- `addImpulsiveForce()` - Rigidbody 必須
- `addImpulsiveForceAt()` - Rigidbody 必須
- `addImpulsiveTorque()` - Rigidbody 必須
- `addTorque()` - Rigidbody 必須

### インタラクション系メソッド
- `onGrab()` - GrabbableItem 必須
- `onUse()` - GrabbableItem 必須
- `onRide()` - RidableItem 必須
- `onSteer()` - RidableItem 必須
- `onInteract()` - Collider 必須
- `onCollide()` - Rigidbody + Collider 必須

### プロパティ
- `velocity` - Rigidbody 必須
- `angularVelocity` - Rigidbody 必須
- `useGravity` - Rigidbody 必須

## 制約システム

各 API は以下の制約レベルをサポートしています：

- **required** - このコンポーネントが必須
- **optional** - あると便利だが必須ではない
- **forbidden** - このコンポーネントがあってはいけない

## SceneGraph.toml フォーマット

```toml
project = "MyProject"

[[gameObjects]]
id = "GlobalObjectId_V1-..."
path = "Floor"
name = "Floor"
parent = ""

[[gameObjects.components]]
id = "GlobalObjectId_V1-..."
type = "UnityEngine.MeshFilter"
enabled = true

[[gameObjects.components]]
id = "GlobalObjectId_V1-..."
type = "UnityEngine.Rigidbody"
enabled = true
[gameObjects.components.properties]
Mass = 1.0
```

## トランスパイル設定

TypeScript は自動的に JavaScript（CommonJS）にトランスパイルされます：

```bash
npm run build
```

出力先：`./dist/`

## トラブルシューティング

### "SceneGraph file not found"
- ファイルパスが正しいか確認してください
- 相対パスまたは絶対パスを使用してください

### "Cannot find module '@iarna/toml'"
```bash
npm install @iarna/toml
```

### "Script file not found"
- TypeScript ファイルが存在するか確認してください
- パスが正しいか確認してください

## 今後の予定

- [ ] TypeScript Compiler API を使用した完全な AST 解析
- [ ] VSCode 拡張機能の統合
- [ ] 設定ファイル（.analyzerrc）のサポート
- [ ] カスタム制約ルールの定義機能
- [ ] JSON レポート出力
- [ ] CI/CD パイプラインとの統合

## ライセンス

MIT

## 参考資料

- [Cluster Creator Kit Script Reference](https://docs.cluster.mu/script/interfaces/ClusterScript.html)
- [ClusterScript インターフェース](https://docs.cluster.mu/script/interfaces/ClusterScript.html)

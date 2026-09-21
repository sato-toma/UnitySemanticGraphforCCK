# UnitySemanticGraphforCCK

Cluster Creator Kit の Unity シーンを `SceneGraph.toml` に出力し、ClusterScript の TypeScript コードが必要とする Unity コンポーネントを静的解析するプロジェクトです。

## リポジトリ構成

- `packages/unity-semantic-graph/`: Unity Package と Editor の TOML exporter
- `packages/unity-semantic-graph/Samples~/`: サンプル Unity プロジェクトと `SceneGraph.toml`
- `packages/ts-analyzer/`: TOML parser、ClusterScript parser、制約 validator、CLI
- `packages/ts-analyzer/src/rules/`: 物理、インタラクション、移動、state変更のルール
- `docs/`: データフロー、TOML スキーマ、ADR、開発ロードマップ

詳しい案内は [docs/repository-guide.md](docs/repository-guide.md) を参照してください。

## 基本フロー

1. Unity で `SemanticGraph/Export All Component Graph to TOML` を実行する。
2. 出力された `SceneGraph.toml` と ClusterScript を analyzer に渡す。
3. API が要求するコンポーネントとシーン上のコンポーネントを照合する。
4. 不足コンポーネント、無効な設定、state の直接変更を修正する。

```bash
cd packages/ts-analyzer
npm install
npm run verify
npx ts-analyzer analyze ./SceneGraph.toml ./script.ts
```

## 設計資料

- [データフローと責務](docs/architecture/data-flow.md)
- [SceneGraph TOML スキーマ](docs/schema/scene-graph-toml.md)
- [ADR 0001: Unity exporter と analyzer の契約](docs/adr/0001-cross-package-contract.md)
- [開発ロードマップ](docs/development-roadmap.md)
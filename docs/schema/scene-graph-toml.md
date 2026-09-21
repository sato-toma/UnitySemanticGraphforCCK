# SceneGraph TOML スキーマ

## 現在の形式

```toml
project = "UnitySemanticGraph"

[[gameObjects]]
id = "GlobalObjectId_V1-..."
path = "Root/Item"
name = "Item"
parent = "Root"

[[gameObjects.components]]
id = "GlobalObjectId_V1-..."
type = "UnityEngine.Rigidbody"
enabled = true

[gameObjects.components.properties]
Mass = 1.0
```

## フィールド

| 場所 | 名前 | 現在の意味 |
|---|---|---|
| root | `project` | 出力元プロジェクトの識別名 |
| gameObject | `id` | Unity GlobalObjectId |
| gameObject | `path` | シーン内の階層パス |
| gameObject | `name` | GameObject 名 |
| gameObject | `parent` | 親の階層パス。ルートは空文字 |
| component | `id` | コンポーネントの GlobalObjectId |
| component | `type` | コンポーネントの完全修飾型名 |
| component | `enabled` | 使用可能状態 |
| properties | 任意キー | 解析対象のシリアライズ済み値 |

## 互換性ルール

- 既存キーを削除しない。削除が必要な場合は ADR を作成し、移行手順を記録する。
- 新しいキーは parser が無視しても安全な形で追加する。
- `type` の比較は、まず完全一致を基本とする。短縮名や別名を導入する場合は明示的な正規化表を用意する。
- 数値、bool、文字列、配列、Unity のベクトル等を混同しない。
- TOML のエスケープ、キー名、カルチャ依存の数値表現をテストする。
- 差分更新は既存コンポーネントを失わないことを保証する。保証できない間は、全体出力を推奨する。

## 変更時の確認項目

- Unity exporter の出力例を更新したか。
- `SceneGraphParser` の parser test を追加したか。
- `types.ts` の型が実データを表せるか。
- 既存のサンプルスクリプトの解析結果が変わっていないか。
- 全体出力と選択範囲更新の両方を確認したか。

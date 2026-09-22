---
marp: true
theme: default
paginate: true
size: 16:9
title: cck-scenegraph-tools
description: Cluster Creator Kit 向け SceneGraph と ClusterScript 静的解析の概要
style: |
  section {
    font-family: "Yu Gothic", "Meiryo", sans-serif;
    font-size: 28px;
    padding: 54px 72px;
  }
  h1 { color: #0b5269; }
  h2 { color: #0b5269; }
  strong { color: #b54708; }
  code { color: #0b5269; }
---

# cck-scenegraph-tools

### Unity シーン設定と ClusterScript の整合性を、実行前に検査する

- Unity のコンポーネント構成を `SceneGraph.toml` として出力
- ClusterScript の API 利用と照合し、設定漏れを発見
- 対象: Cluster Creator Kit (CCK) の開発・レビュー・CI

<!--
話すこと: 「Unityのシーン設定」と「ClusterScript」の依存を、実行前に確認するための基盤です。
目安: 15秒
-->

---

## 当初の課題

- Script は API を呼べても、**必要な Unity コンポーネントがない**と期待どおり動かない
- 例: `onGrab()` には `GrabbableItem`、`onCollide()` には `Rigidbody` が必要
- 設定漏れは Cluster へワールドをアップロードして実行するまで発見しづらい
- 原因調査のために、後から `$.log()` などのログ出力を追加することもある
- シーンとコードは別々に管理され、レビューで依存関係を追いづらい

> 目標: 設定漏れを **実行前・自動** に検出する

<!--
話すこと: コードの型検査だけではUnity側の設定まで保証できない点が出発点です。
目安: 25秒
-->

---

## 解決に必要な技術スタック

- **Unity Editor 拡張 / C#**
  - GameObject、コンポーネント、enabled 状態を取得
- **TOML**
  - Unity の設定を管理しやすい構造化ファイル `SceneGraph.toml` として保存
- **TypeScript / Node.js**
  - ClusterScript API と `state` の変更を検出
- **制約ルール + CLI + Vitest**
  - API の必要コンポーネントを照合し、ローカルと CI で検証

<!--
話すこと: Unity固有の情報をTOMLに固定し、Node.js側の解析器が利用します。
目安: 25秒
-->

---

## 仕組み: シーンとコードを照合する

![w:1050](../assets/generated/repository-flow.svg)

- Exporter は Unity コンポーネントを TOML に変換
- Parser は `$.onGrab()` などの API 呼び出しを検出
- Validator は API ごとの必要コンポーネントを照合
- 不足・無効なコンポーネントを問題として報告

<!--
話すこと: TOMLがUnityとTypeScriptの境界です。両方の入力をValidatorへ集めます。
目安: 45秒
-->

---

## 現在できること

- Unity Package で `SceneGraph.toml` を全体・選択範囲から出力
- CLI / batchmode で **export と analyze を連続実行**
- 実装済みの検査例
  - `setPosition` / `setRotation` -> `MovableItem`
  - `onGrab` -> `GrabbableItem`
  - `onCollide` -> `Rigidbody`
  - `getOverlaps` -> `OverlapDetectorShape`
- `$.state` の直接変更も検出し、再代入を促す
- `npm run verify` で解析器のビルドとテストを再現可能に検証

<!--
話すこと: まず頻度の高い移動・インタラクション・物理をルール化し、CLIまでつなげました。
目安: 35秒
-->

---

## 今後の展望

- **信頼性**: TOML schema/version、fixture、Unity Edit Mode テストを強化
- **解析精度**: 正規表現ベースから TypeScript Compiler API (AST) へ移行
- **対応範囲**: `onInteract`、`onUse`、物理・近傍検索 API を検証して追加
- **開発体験**: watch、SARIF、GitHub Actions annotation、VS Code 連携
- **運用**: PR ごとに schema 互換性とルールの回帰をチェック

> 優先順位: 先に SceneGraph.toml の形式を安定化し、その上で解析範囲と開発体験を広げる

<!--
話すこと: 精度を急ぐ前に、Unityから出力する構造化ファイルの形式を安定させるのが最優先です。
目安: 30秒
-->

---

## まとめ

- Unity の設定情報を `SceneGraph.toml` として扱う
- ClusterScript の利用 API とコンポーネント制約を自動照合する
- 設定漏れを実行前に検出し、レビューと CI に持ち込む
- 次はファイル形式の安定化、AST 化、CI/IDE 統合へ

<!--
話すこと: Unityの設定依存を、再現可能な静的解析の対象に変える取り組みです。
目安: 15秒
-->
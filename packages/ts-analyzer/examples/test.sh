#!/bin/bash

# ts-analyzer のテストスクリプト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SCENE_GRAPH_PATH="$REPO_ROOT/packages/unity-semantic-graph/Samples~/Assets/SceneGraph.toml"
SAMPLE_TS_PATH="$SCRIPT_DIR/sample.ts"

echo "=== ts-analyzer Test Suite ==="
echo ""

# ビルド
echo "Building ts-analyzer..."
cd "$PACKAGE_DIR"
npm install
npm run build
cd "$SCRIPT_DIR"

if [ ! -f "$SCENE_GRAPH_PATH" ]; then
  echo "⚠️  Warning: SceneGraph.toml not found at $SCENE_GRAPH_PATH"
  echo "   Creating mock SceneGraph.toml for testing..."

  # モックファイルを作成
  mkdir -p "$(dirname "$SCENE_GRAPH_PATH")"
  cat > "$SCENE_GRAPH_PATH" << 'EOF'
project = "TestProject"

[[gameObjects]]
id = "test-obj-1"
path = "TestItem"
name = "TestItem"
parent = ""
[[gameObjects.components]]
id = "comp-1"
type = "UnityEngine.MeshFilter"
enabled = true
[[gameObjects.components]]
id = "comp-2"
type = "UnityEngine.MeshRenderer"
enabled = true
[[gameObjects.components]]
id = "comp-3"
type = "UnityEngine.BoxCollider"
enabled = true
[[gameObjects.components]]
id = "comp-4"
type = "UnityEngine.Rigidbody"
enabled = true
EOF
fi

echo "✅ Build completed"
echo ""

# テスト: 解析
echo "Test 1: Analyzing sample.ts..."
node ../dist/cli.js analyze "$SCENE_GRAPH_PATH" "$SAMPLE_TS_PATH"
echo ""

# テスト: レポート
echo "Test 2: Generating report..."
node ../dist/cli.js report "$SCENE_GRAPH_PATH" "$SAMPLE_TS_PATH"
echo ""

# テスト: API カバレッジ
echo "Test 3: API Coverage..."
node ../dist/cli.js coverage "$SCENE_GRAPH_PATH" "$SAMPLE_TS_PATH"
echo ""

# テスト: 推奨コンポーネント
echo "Test 4: Recommended Components..."
node ../dist/cli.js recommend "$SCENE_GRAPH_PATH" "$SAMPLE_TS_PATH"
echo ""

# テスト: シーングラフ表示
echo "Test 5: Scene Graph Visualization..."
node ../dist/cli.js scene-graph "$SCENE_GRAPH_PATH"
echo ""

# テスト: API 一覧
echo "Test 6: Available APIs..."
node ../dist/cli.js list-apis
echo ""

echo "=== Test Complete ==="

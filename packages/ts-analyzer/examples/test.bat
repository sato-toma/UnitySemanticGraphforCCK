@echo off
REM ts-analyzer のテストスクリプト (Windows)

set "SCRIPT_DIR=%~dp0"
set "PACKAGE_DIR=%SCRIPT_DIR%.."
set "REPO_ROOT=%SCRIPT_DIR%..\..\.."
set "SCENE_GRAPH_PATH=%REPO_ROOT%\packages\unity-semantic-graph\Samples~\Assets\SceneGraph.toml"
set "SAMPLE_TS_PATH=%REPO_ROOT%\packages\unity-semantic-graph\Samples~\Assets\Script\src\onGrabScript.ts"

echo === ts-analyzer Test Suite ===
echo.

REM ビルド
echo Building ts-analyzer...
cd /d "%PACKAGE_DIR%"
call npm install
call npm run build
cd /d "%SCRIPT_DIR%"

if not exist "%SCENE_GRAPH_PATH%" (
  echo Warning: SceneGraph.toml not found at %SCENE_GRAPH_PATH%
  echo Creating mock SceneGraph.toml for testing...

  for %%i in ("%SCENE_GRAPH_PATH%") do set "DIR=%%~dpi"
  if not exist "%DIR%" mkdir "%DIR%"

  (
    echo project = "TestProject"
    echo.
    echo [[gameObjects]]
    echo id = "test-obj-1"
    echo path = "TestItem"
    echo name = "TestItem"
    echo parent = ""
    echo [[gameObjects.components]]
    echo id = "comp-1"
    echo type = "UnityEngine.MeshFilter"
    echo enabled = true
    echo [[gameObjects.components]]
    echo id = "comp-2"
    echo type = "UnityEngine.MeshRenderer"
    echo enabled = true
    echo [[gameObjects.components]]
    echo id = "comp-3"
    echo type = "UnityEngine.BoxCollider"
    echo enabled = true
    echo [[gameObjects.components]]
    echo id = "comp-4"
    echo type = "UnityEngine.Rigidbody"
    echo enabled = true
  ) > "%SCENE_GRAPH_PATH%"
)

echo Build completed
echo.

REM テスト: 解析
echo Test 1: Analyzing sample.ts...
node ..\dist\cli.js analyze "%SCENE_GRAPH_PATH%" "%SAMPLE_TS_PATH%"
echo.

REM テスト: レポート
echo Test 2: Generating report...
node ..\dist\cli.js report "%SCENE_GRAPH_PATH%" "%SAMPLE_TS_PATH%"
echo.

REM テスト: API カバレッジ
echo Test 3: API Coverage...
node ..\dist\cli.js coverage "%SCENE_GRAPH_PATH%" "%SAMPLE_TS_PATH%"
echo.

REM テスト: 推奨コンポーネント
echo Test 4: Recommended Components...
node ..\dist\cli.js recommend "%SCENE_GRAPH_PATH%" "%SAMPLE_TS_PATH%"
echo.

REM テスト: シーングラフ表示
echo Test 5: Scene Graph Visualization...
node ..\dist\cli.js scene-graph "%SCENE_GRAPH_PATH%"
echo.

REM テスト: API 一覧
echo Test 6: Available APIs...
node ..\dist\cli.js list-apis
echo.

echo === Test Complete ===

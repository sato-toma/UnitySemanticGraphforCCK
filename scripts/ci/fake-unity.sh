#!/usr/bin/env bash

set -euo pipefail

output_path=""
while (($# > 0)); do
  case "$1" in
    -outputPath)
      output_path="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "$output_path" ]]; then
  echo "Missing -outputPath" >&2
  exit 2
fi

mkdir -p "$(dirname "$output_path")"
cat > "$output_path" <<'EOF'
project = "CI fixture"

[[gameObjects]]
id = "ci-item"
path = "ci-item"
name = "ci-item"
parent = ""

[[gameObjects.components]]
id = "ci-scriptable-item"
type = "ClusterVR.CreatorKit.Item.Implements.ScriptableItem"
enabled = true
[gameObjects.components.properties]
Source_Code_Asset = "onGrabScript"

[[gameObjects.components]]
id = "ci-grabbable-item"
type = "ClusterVR.CreatorKit.Item.Implements.GrabbableItem"
enabled = true

[[gameObjects.components]]
id = "ci-rigidbody"
type = "UnityEngine.Rigidbody"
enabled = true
EOF
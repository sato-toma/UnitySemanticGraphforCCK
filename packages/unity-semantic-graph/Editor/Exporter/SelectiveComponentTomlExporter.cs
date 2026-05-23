using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace UnitySemanticGraph.Editor.Exporter
{
    public static class SelectiveComponentTomlExporter
    {
        [MenuItem("Tools/UnitySemanticGraph/Export Selected Component Graph to TOML")]
        private static void ExportSelectedGraph()
        {
            var selectedGameObjects = Selection.gameObjects;
            var selectedComponents = Selection.objects.OfType<Component>().ToArray();
            var gameObjects = new HashSet<GameObject>(selectedGameObjects);

            foreach (var component in selectedComponents)
            {
                if (component == null) continue;
                gameObjects.Add(component.gameObject);
            }

            if (gameObjects.Count == 0)
            {
                EditorUtility.DisplayDialog("Export Selected Component Graph", "Hierarchy またはインスペクタで GameObject / Component を選択してください。", "OK");
                return;
            }

            var processed = new Dictionary<string, GameObjectInfo>();
            foreach (var gameObject in gameObjects)
            {
                AddWithParents(gameObject, processed);
                AddRelevantDescendants(gameObject, processed);
            }

            var sorted = processed.Values.OrderBy(g => g.Path).ToList();
            var defaultPath = Path.Combine(Application.dataPath, "../SelectedComponentGraph.toml");
            var savePath = EditorUtility.SaveFilePanel("Export TOML", Application.dataPath, "SelectedComponentGraph.toml", "toml");
            if (string.IsNullOrEmpty(savePath)) return;

            try
            {
                File.WriteAllText(savePath, BuildToml(sorted));
                AssetDatabase.Refresh();
                EditorUtility.DisplayDialog("Export Completed", $"TOML ファイルを出力しました:\n{savePath}", "OK");
            }
            catch (Exception ex)
            {
                Debug.LogError(ex);
                EditorUtility.DisplayDialog("Export Failed", ex.Message, "OK");
            }
        }

        private static void AddWithParents(GameObject gameObject, Dictionary<string, GameObjectInfo> processed)
        {
            if (gameObject == null) return;
            var path = GetGameObjectPath(gameObject);
            if (processed.ContainsKey(path)) return;

            var info = new GameObjectInfo
            {
                Name = gameObject.name,
                Path = path,
                ParentPath = gameObject.transform.parent != null ? GetGameObjectPath(gameObject.transform.parent.gameObject) : string.Empty,
                Components = GatherComponents(gameObject)
            };
            processed[path] = info;

            if (gameObject.transform.parent != null)
            {
                AddWithParents(gameObject.transform.parent.gameObject, processed);
            }
        }

        private static void AddRelevantDescendants(GameObject gameObject, Dictionary<string, GameObjectInfo> processed)
        {
            if (gameObject == null) return;
            foreach (Transform child in gameObject.transform)
            {
                if (child == null) continue;
                var childGo = child.gameObject;
                if (HasRelevantComponents(childGo) || HasRelevantChildren(childGo))
                {
                    AddWithParents(childGo, processed);
                    AddRelevantDescendants(childGo, processed);
                }
            }
        }

        private static bool HasRelevantComponents(GameObject go)
        {
            return go.GetComponents<Component>().Any(c => c != null && !(c is Transform));
        }

        private static bool HasRelevantChildren(GameObject go)
        {
            foreach (Transform child in go.transform)
            {
                if (child == null) continue;
                if (HasRelevantComponents(child.gameObject) || HasRelevantChildren(child.gameObject))
                {
                    return true;
                }
            }

            return false;
        }

        private static IReadOnlyList<ComponentInfo> GatherComponents(GameObject go)
        {
            var components = new List<ComponentInfo>();
            foreach (var component in go.GetComponents<Component>())
            {
                if (component == null) continue;
                if (component is Transform) continue;

                var info = new ComponentInfo
                {
                    Type = component.GetType().FullName,
                    Enabled = GetEnabledState(component),
                    Properties = GatherSerializableProperties(component)
                };

                components.Add(info);
            }

            return components;
        }

        private static bool GetEnabledState(Component component)
        {
            if (component is Behaviour behaviour)
            {
                return behaviour.enabled;
            }

            if (component is Collider collider)
            {
                return collider.enabled;
            }

            return true;
        }

        private static Dictionary<string, object> GatherSerializableProperties(Component component)
        {
            var values = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            var serializedObject = new SerializedObject(component);
            var property = serializedObject.GetIterator();

            if (!property.NextVisible(true))
            {
                return values;
            }

            do
            {
                if (property.depth != 0) continue;
                if (property.name == "m_Script" || property.name == "m_GameObject" || property.name == "m_Enabled") continue;
                if (property.name.StartsWith("m_")) continue;

                var key = property.displayName;
                var value = GetSerializedPropertyValue(property);
                if (value != null)
                {
                    values[key] = value;
                }
            }
            while (property.NextVisible(false));

            return values;
        }

        private static object GetSerializedPropertyValue(SerializedProperty property)
        {
            switch (property.propertyType)
            {
                case SerializedPropertyType.Integer:
                    return property.intValue;
                case SerializedPropertyType.Boolean:
                    return property.boolValue;
                case SerializedPropertyType.Float:
                    return property.floatValue;
                case SerializedPropertyType.String:
                    return property.stringValue;
                case SerializedPropertyType.Color:
                    return property.colorValue;
                case SerializedPropertyType.ObjectReference:
                    return property.objectReferenceValue != null ? property.objectReferenceValue.name : null;
                case SerializedPropertyType.Enum:
                    return property.enumNames[property.enumValueIndex];
                case SerializedPropertyType.Vector2:
                    return property.vector2Value;
                case SerializedPropertyType.Vector3:
                    return property.vector3Value;
                case SerializedPropertyType.Vector4:
                    return property.vector4Value;
                case SerializedPropertyType.Rect:
                    return property.rectValue;
                case SerializedPropertyType.Vector2Int:
                    return property.vector2IntValue;
                case SerializedPropertyType.Vector3Int:
                    return property.vector3IntValue;
                case SerializedPropertyType.Bounds:
                    return property.boundsValue;
                case SerializedPropertyType.Quaternion:
                    return property.quaternionValue;
                case SerializedPropertyType.ArraySize:
                case SerializedPropertyType.Generic:
                    if (property.isArray && property.propertyType != SerializedPropertyType.String)
                    {
                        return GetArrayValues(property);
                    }
                    return null;
                default:
                    return null;
            }
        }

        private static object GetArrayValues(SerializedProperty arrayProperty)
        {
            var elements = new List<object>();
            var propertyCopy = arrayProperty.Copy();
            var depth = propertyCopy.depth;
            var enterChildren = true;

            if (!propertyCopy.NextVisible(enterChildren))
            {
                return null;
            }

            while (propertyCopy.depth > depth)
            {
                if (propertyCopy.name == "Array" || propertyCopy.name == "data")
                {
                    if (propertyCopy.propertyType != SerializedPropertyType.Generic && propertyCopy.propertyType != SerializedPropertyType.ObjectReference)
                    {
                        var value = GetSerializedPropertyValue(propertyCopy);
                        if (value != null)
                        {
                            elements.Add(value);
                        }
                    }
                }

                if (!propertyCopy.NextVisible(false))
                {
                    break;
                }
            }

            return elements.Count > 0 ? (object)elements : null;
        }

        private static string BuildToml(IReadOnlyList<GameObjectInfo> gameObjects)
        {
            var builder = new TomlWriter();
            builder.AppendLine($"project = \"UnitySemanticGraph\"");
            builder.AppendLine($"generatedAt = \"{DateTime.UtcNow:s}Z\"");
            builder.AppendLine();

            for (var index = 0; index < gameObjects.Count; index++)
            {
                var go = gameObjects[index];
                builder.AppendLine("[[gameObjects]]");
                builder.AppendLine($"path = \"{EscapeTomlString(go.Path)}\"");
                builder.AppendLine($"name = \"{EscapeTomlString(go.Name)}\"");
                builder.AppendLine($"parent = \"{EscapeTomlString(go.ParentPath)}\"");

                if (go.Components.Count > 0)
                {
                    for (var componentIndex = 0; componentIndex < go.Components.Count; componentIndex++)
                    {
                        var component = go.Components[componentIndex];
                        builder.AppendLine("[[gameObjects.components]]");
                        builder.AppendLine($"type = \"{EscapeTomlString(component.Type)}\"");
                        builder.AppendLine($"enabled = {component.Enabled.ToString().ToLowerInvariant()}");

                        if (component.Properties.Count > 0)
                        {
                            builder.AppendLine("[gameObjects.components.properties]");
                            foreach (var property in component.Properties)
                            {
                                builder.AppendLine($"{EscapeTomlKey(property.Key)} = {FormatTomlValue(property.Value)}");
                            }
                            builder.AppendLine();
                        }
                    }
                }

                builder.AppendLine();
            }

            return builder.ToString();
        }

        private static string FormatTomlValue(object value)
        {
            switch (value)
            {
                case string s:
                    return $"\"{EscapeTomlString(s)}\"";
                case bool b:
                    return b ? "true" : "false";
                case int i:
                    return i.ToString();
                case long l:
                    return l.ToString();
                case float f:
                    return f.ToString("G", System.Globalization.CultureInfo.InvariantCulture);
                case double d:
                    return d.ToString("G", System.Globalization.CultureInfo.InvariantCulture);
                case Vector2 v2:
                    return $"[{v2.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v2.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]";
                case Vector3 v3:
                    return $"[{v3.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v3.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v3.z.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]";
                case Vector4 v4:
                    return $"[{v4.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v4.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v4.z.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {v4.w.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]";
                case Vector2Int v2i:
                    return $"[{v2i.x}, {v2i.y}]";
                case Vector3Int v3i:
                    return $"[{v3i.x}, {v3i.y}, {v3i.z}]";
                case Rect rect:
                    return $"[{rect.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {rect.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {rect.width.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {rect.height.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]";
                case Bounds bounds:
                    return $"[[{bounds.center.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {bounds.center.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {bounds.center.z.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}], [{bounds.extents.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {bounds.extents.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {bounds.extents.z.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]]";
                case Quaternion quaternion:
                    return $"[{quaternion.x.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {quaternion.y.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {quaternion.z.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}, {quaternion.w.ToString("G", System.Globalization.CultureInfo.InvariantCulture)}]";
                case IList<object> list:
                    return $"[{string.Join(", ", list.Select(FormatTomlValue))}]";
                case IEnumerable<object> enumerable:
                    return $"[{string.Join(", ", enumerable.Select(FormatTomlValue))}]";
                default:
                    return $"\"{EscapeTomlString(value.ToString())}\"";
            }
        }

        private static string EscapeTomlString(string value)
        {
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }

        private static string EscapeTomlKey(string key)
        {
            return key.Replace(" ", "_").Replace("-", "_");
        }

        private static string GetGameObjectPath(GameObject gameObject)
        {
            var path = gameObject.name;
            var parent = gameObject.transform.parent;
            while (parent != null)
            {
                path = parent.name + "/" + path;
                parent = parent.parent;
            }

            return path;
        }

        private sealed class GameObjectInfo
        {
            public string Name { get; set; }
            public string Path { get; set; }
            public string ParentPath { get; set; }
            public IReadOnlyList<ComponentInfo> Components { get; set; }
        }

        private sealed class ComponentInfo
        {
            public string Type { get; set; }
            public bool Enabled { get; set; }
            public IReadOnlyDictionary<string, object> Properties { get; set; }
        }

        private sealed class TomlWriter
        {
            private readonly StringWriter _writer = new StringWriter();

            public void AppendLine(string line = "")
            {
                _writer.WriteLine(line);
            }

            public override string ToString()
            {
                return _writer.ToString();
            }
        }
    }
}

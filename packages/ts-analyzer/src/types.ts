/**
 * SceneGraph TOML型定義
 */

export interface ComponentProperty {
  [key: string]: string | number | boolean;
}

export interface Component {
  id: string;
  type: string;
  enabled: boolean;
  properties?: ComponentProperty;
}

export interface GameObject {
  id: string;
  path: string;
  name: string;
  parent: string;
  components: Component[];
}

export interface SceneGraph {
  project: string;
  gameObjects: GameObject[];
}

/**
 * ClusterScript コンポーネント制約
 */

export type ComponentRequirement = "required" | "optional" | "forbidden";

export interface ComponentConstraint {
  componentType: string;
  requirement: ComponentRequirement;
  properties?: {
    [key: string]: {
      type: string;
      value?: any;
      values?: any[];
    };
  };
}

export interface ApiMethod {
  name: string;
  requiredComponents: ComponentConstraint[];
  parameterTypes?: string[];
  returnType?: string;
  description?: string;
}

export interface ApiProperty {
  name: string;
  requiredComponents: ComponentConstraint[];
  type?: string;
  readable?: boolean;
  writable?: boolean;
  description?: string;
}

export interface ClusterScriptDefinition {
  methods: Map<string, ApiMethod>;
  properties: Map<string, ApiProperty>;
}

/**
 * 静的解析結果
 */

export interface AnalysisResult {
  filePath: string;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
  };
}

export interface ValidationIssue {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  apiCall: string;
  requiredComponents: string[];
  availableComponents: string[];
}

/**
 * コンポーネント分析キャッシュ
 */

export interface ComponentAnalysisCache {
  gameObjectId: string;
  gameObjectPath: string;
  components: Map<string, Component>;
  missingRequired: string[];
  extraForbidden: string[];
}

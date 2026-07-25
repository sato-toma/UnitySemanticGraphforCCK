import { SceneGraph, AnalysisResult, ValidationIssue } from "./types";
import { SceneGraphParser } from "./sceneGraphParser";
import { TypeScriptCodeParser } from "./typeScriptParser";
import { ConstraintValidator } from "./constraintValidator";
import { ClusterScriptDefinitions } from "./clusterScriptDefinitions";
import * as path from "path";

/**
 * 統合的なTypeScript静的解析エンジン
 * SceneGraph.tomlとTypeScriptコードを組み合わせて、
 * コンポーネント制約の違反を検出
 */
export class ClusterScriptAnalyzer {
  private sceneGraph: SceneGraph;

  constructor(sceneGraphPath: string) {
    this.sceneGraph = SceneGraphParser.parseFile(sceneGraphPath);
  }

  /**
   * TypeScriptファイルを解析
   */
  analyzeTypeScriptFile(tsFilePath: string): AnalysisResult {
    const apiCalls = TypeScriptCodeParser.extractApiCalls(tsFilePath);
    const issues: ValidationIssue[] = [];

    // 各APIコールについてチェック
    for (const call of apiCalls) {
      const constraints = ClusterScriptDefinitions.getMethodConstraints(
        call.methodName,
      );

      // 制約がない場合はスキップ
      if (constraints.length === 0) {
        continue;
      }

      // SceneGraphにマッチするGameObjectを取得（ワールドアイテムの場合）
      // 実装例: ワールドアイテムの場合、最初のGameObjectをチェック
      const gameObject = this.sceneGraph.gameObjects[0];

      if (!gameObject) {
        continue;
      }

      // 制約を検証
      const validation = ConstraintValidator.validateGameObject(
        gameObject,
        constraints,
        this.sceneGraph,
      );

      if (!validation.isValid) {
        const requiredComponents = constraints
          .filter((c) => c.requirement === "required")
          .map((c) => c.componentType);

        issues.push({
          line: call.line,
          column: call.column,
          severity: "error",
          code: "MISSING_COMPONENT",
          message: `Method '${call.methodName}' requires components: ${requiredComponents.join(", ")}`,
          apiCall: call.methodName,
          requiredComponents: requiredComponents,
          availableComponents: SceneGraphParser.getEnabledComponentsInHierarchy(
            this.sceneGraph,
            gameObject,
          )
            .map((c) => c.type),
        });
      }
    }

    const invalidStateMutations =
      TypeScriptCodeParser.extractInvalidStateMutations(tsFilePath);

    for (const invalidMutation of invalidStateMutations) {
      issues.push({
        line: invalidMutation.line,
        column: invalidMutation.column,
        severity: "error",
        code: "INVALID_STATE_MUTATION",
        message: `Directly mutating $.state.${invalidMutation.propertyName} with .push() does not update state. Use a temporary variable, modify it, and reassign it back to $.state.${invalidMutation.propertyName}.`,
        apiCall: `$.state.${invalidMutation.propertyName}.push`,
        requiredComponents: [],
        availableComponents: [],
      });
    }

    return {
      filePath: tsFilePath,
      issues,
      summary: {
        totalIssues: issues.length,
        errorCount: issues.filter((i) => i.severity === "error").length,
        warningCount: issues.filter((i) => i.severity === "warning").length,
      },
    };
  }

  /**
   * 複数のTypeScriptファイルを解析
   */
  analyzeMultipleFiles(tsFilePaths: string[]): Map<string, AnalysisResult> {
    const results = new Map<string, AnalysisResult>();

    for (const filePath of tsFilePaths) {
      results.set(filePath, this.analyzeTypeScriptFile(filePath));
    }

    return results;
  }

  /**
   * 全体的な解析レポートを生成
   */
  generateReport(results: Map<string, AnalysisResult>): string {
    const lines: string[] = [];

    lines.push("=== ClusterScript Component Constraint Analysis Report ===\n");
    lines.push(`Project: ${this.sceneGraph.project}`);
    lines.push(`Total GameObjects: ${this.sceneGraph.gameObjects.length}\n`);

    let totalIssues = 0;
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const [filePath, result] of results) {
      if (result.issues.length > 0) {
        lines.push(`\n📄 File: ${filePath}`);
        lines.push(`   Issues: ${result.summary.totalIssues}`);
        lines.push(`   Errors: ${result.summary.errorCount}`);
        lines.push(`   Warnings: ${result.summary.warningCount}`);

        for (const issue of result.issues) {
          lines.push(
            `   [${issue.severity.toUpperCase()}] Line ${issue.line}:${issue.column}`,
          );
          lines.push(`     API: ${issue.apiCall}`);
          lines.push(`     Message: ${issue.message}`);
          lines.push(`     Required: ${issue.requiredComponents.join(", ")}`);
          lines.push(
            `     Available: ${issue.availableComponents.join(", ") || "none"}`,
          );
        }

        totalIssues += result.summary.totalIssues;
        totalErrors += result.summary.errorCount;
        totalWarnings += result.summary.warningCount;
      }
    }

    lines.push("\n=== Summary ===");
    lines.push(`Total Issues: ${totalIssues}`);
    lines.push(`Total Errors: ${totalErrors}`);
    lines.push(`Total Warnings: ${totalWarnings}`);

    if (totalIssues === 0) {
      lines.push("✅ No issues found!");
    }

    return lines.join("\n");
  }

  /**
   * SceneGraphの構造を可視化してレポート
   */
  generateSceneGraphReport(): string {
    const lines: string[] = [];

    lines.push("=== Scene Graph Structure ===\n");
    lines.push(SceneGraphParser.visualizeHierarchy(this.sceneGraph));

    lines.push("\n=== Component Distribution ===");
    const distribution = SceneGraphParser.analyzeComponentDistribution(
      this.sceneGraph,
    );

    for (const [componentType, count] of distribution) {
      lines.push(`  ${componentType}: ${count}`);
    }

    return lines.join("\n");
  }

  /**
   * ClusterScript APIのカバレッジレポート
   */
  generateApiCoverageReport(tsFilePath: string): string {
    const lines: string[] = [];
    const content = require("fs").readFileSync(tsFilePath, "utf-8");
    const apiCalls = TypeScriptCodeParser.extractApiCalls(tsFilePath);

    const usedMethods = new Set(apiCalls.map((c) => c.methodName));
    const allMethods = ClusterScriptDefinitions.getAllMethodNames();

    lines.push("=== ClusterScript API Coverage ===\n");
    lines.push(`File: ${tsFilePath}`);
    lines.push(`Used APIs: ${usedMethods.size} / ${allMethods.length}`);
    lines.push(
      `Coverage: ${((usedMethods.size / allMethods.length) * 100).toFixed(1)}%\n`,
    );

    lines.push("Used Methods:");
    for (const method of Array.from(usedMethods).sort()) {
      lines.push(`  ✓ ${method}`);
    }

    lines.push("\nUnused Methods:");
    const unusedMethods = allMethods.filter((m) => !usedMethods.has(m));
    for (const method of unusedMethods.slice(0, 10)) {
      // 最初の10個のみ表示
      lines.push(`  - ${method}`);
    }

    if (unusedMethods.length > 10) {
      lines.push(`  ... and ${unusedMethods.length - 10} more`);
    }

    return lines.join("\n");
  }

  /**
   * 推奨コンポーネント設定を生成
   */
  generateRecommendedComponents(tsFilePath: string): string {
    const lines: string[] = [];
    const content = require("fs").readFileSync(tsFilePath, "utf-8");
    const apiCalls = TypeScriptCodeParser.extractApiCalls(tsFilePath);

    const requiredComponents = new Set<string>();

    for (const call of apiCalls) {
      const constraints = ClusterScriptDefinitions.getMethodConstraints(
        call.methodName,
      );

      for (const constraint of constraints) {
        if (constraint.requirement === "required") {
          requiredComponents.add(constraint.componentType);
        }
      }
    }

    lines.push("=== Recommended Components ===\n");
    lines.push(`Based on API usage in: ${tsFilePath}\n`);
    lines.push("Required Components:");

    for (const component of Array.from(requiredComponents).sort()) {
      lines.push(`  ✓ ${component}`);
    }

    if (requiredComponents.size === 0) {
      lines.push("  (No required components)");
    }

    return lines.join("\n");
  }

  /**
   * SceneGraphを取得
   */
  getSceneGraph(): SceneGraph {
    return this.sceneGraph;
  }
}

#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { ClusterScriptAnalyzer } from "./analyzer";
import { SceneGraphParser } from "./sceneGraphParser";
import { TypeScriptCodeParser } from "./typeScriptParser";
import { ClusterScriptDefinitions } from "./clusterScriptDefinitions";

/**
 * CLI ツール - ClusterScript静的解析
 */

function printUsage() {
  console.log(`
Usage: ts-analyzer <command> [options]

Commands:
  analyze <sceneGraphPath> <tsFilePath>
    Analyze TypeScript file against SceneGraph constraints

  report <sceneGraphPath> <tsFilePath>
    Generate comprehensive analysis report

  coverage <sceneGraphPath> <tsFilePath>
    Show API coverage report

  recommend <sceneGraphPath> <tsFilePath>
    Show recommended components for TypeScript file

  scene-graph <sceneGraphPath>
    Display scene graph structure

  list-apis
    List all available ClusterScript APIs

Examples:
  ts-analyzer analyze ./SceneGraph.toml ./script.ts
  ts-analyzer report ./SceneGraph.toml ./script.ts
  ts-analyzer coverage ./SceneGraph.toml ./script.ts
  ts-analyzer scene-graph ./SceneGraph.toml
`);
}

function analyzeCommand(args: string[]) {
  if (args.length < 2) {
    console.error("Error: Missing arguments");
    printUsage();
    process.exit(1);
  }

  const sceneGraphPath = args[0];
  const tsFilePath = args[1];
  // args length checked above; assert defined for TypeScript
  const sceneGraphPathNonNull = sceneGraphPath!;
  const tsFilePathNonNull = tsFilePath!;

  if (!fs.existsSync(sceneGraphPathNonNull)) {
    console.error(`Error: SceneGraph file not found: ${sceneGraphPathNonNull}`);
    process.exit(1);
  }

  if (!fs.existsSync(tsFilePathNonNull)) {
    console.error(`Error: TypeScript file not found: ${tsFilePathNonNull}`);
    process.exit(1);
  }

  try {
    const analyzer = new ClusterScriptAnalyzer(sceneGraphPathNonNull);
    const result = analyzer.analyzeTypeScriptFile(tsFilePathNonNull);

    console.log(`\n=== Analysis Results ===\n`);
    console.log(`File: ${tsFilePathNonNull}`);
    console.log(`Issues: ${result.summary.totalIssues}`);
    console.log(`Errors: ${result.summary.errorCount}`);
    console.log(`Warnings: ${result.summary.warningCount}\n`);

    if (result.issues.length > 0) {
      console.log("Issues:");
      for (const issue of result.issues) {
        console.log(
          `  [${issue.severity.toUpperCase()}] Line ${issue.line}:${issue.column}`,
        );
        console.log(`    API: ${issue.apiCall}`);
        console.log(`    Message: ${issue.message}`);
        console.log(`    Required: ${issue.requiredComponents.join(", ")}`);
        console.log(
          `    Available: ${issue.availableComponents.join(", ") || "none"}\n`,
        );
      }
    } else {
      console.log("✅ No issues found!");
    }
  } catch (error) {
    console.error("Error during analysis:", error);
    process.exit(1);
  }
}

function reportCommand(args: string[]) {
  if (args.length < 2) {
    console.error("Error: Missing arguments");
    printUsage();
    process.exit(1);
  }

  const sceneGraphPath = args[0];
  const tsFilePath = args[1];

  // assert non-null after arg length check
  const sceneGraphPathNonNull = sceneGraphPath!;
  const tsFilePathNonNull = tsFilePath!;

  if (!fs.existsSync(sceneGraphPathNonNull)) {
    console.error(`Error: SceneGraph file not found: ${sceneGraphPathNonNull}`);
    process.exit(1);
  }

  if (!fs.existsSync(tsFilePathNonNull)) {
    console.error(`Error: TypeScript file not found: ${tsFilePathNonNull}`);
    process.exit(1);
  }

  try {
    const analyzer = new ClusterScriptAnalyzer(sceneGraphPathNonNull);

    console.log(analyzer.generateSceneGraphReport());
    console.log("\n");
    const result = analyzer.analyzeTypeScriptFile(tsFilePathNonNull);
    const results = new Map().set(tsFilePathNonNull, result);
    console.log(analyzer.generateReport(results));
  } catch (error) {
    console.error("Error generating report:", error);
    process.exit(1);
  }
}

function coverageCommand(args: string[]) {
  if (args.length < 2) {
    console.error("Error: Missing arguments");
    printUsage();
    process.exit(1);
  }

  const sceneGraphPath = args[0];
  const tsFilePath = args[1];

  const sceneGraphPathNonNull = sceneGraphPath!;
  const tsFilePathNonNull = tsFilePath!;

  if (!fs.existsSync(sceneGraphPathNonNull)) {
    console.error(`Error: SceneGraph file not found: ${sceneGraphPathNonNull}`);
    process.exit(1);
  }

  if (!fs.existsSync(tsFilePathNonNull)) {
    console.error(`Error: TypeScript file not found: ${tsFilePathNonNull}`);
    process.exit(1);
  }

  try {
    const analyzer = new ClusterScriptAnalyzer(sceneGraphPathNonNull);
    console.log("\n" + analyzer.generateApiCoverageReport(tsFilePathNonNull));
  } catch (error) {
    console.error("Error generating coverage report:", error);
    process.exit(1);
  }
}

function recommendCommand(args: string[]) {
  if (args.length < 2) {
    console.error("Error: Missing arguments");
    printUsage();
    process.exit(1);
  }

  const sceneGraphPath = args[0];
  const tsFilePath = args[1];

  const sceneGraphPathNonNull = sceneGraphPath!;
  const tsFilePathNonNull = tsFilePath!;

  if (!fs.existsSync(sceneGraphPathNonNull)) {
    console.error(`Error: SceneGraph file not found: ${sceneGraphPathNonNull}`);
    process.exit(1);
  }

  if (!fs.existsSync(tsFilePathNonNull)) {
    console.error(`Error: TypeScript file not found: ${tsFilePathNonNull}`);
    process.exit(1);
  }

  try {
    const analyzer = new ClusterScriptAnalyzer(sceneGraphPathNonNull);
    console.log(
      "\n" + analyzer.generateRecommendedComponents(tsFilePathNonNull),
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);
    process.exit(1);
  }
}

function sceneGraphCommand(args: string[]) {
  if (args.length < 1) {
    console.error("Error: Missing sceneGraphPath");
    printUsage();
    process.exit(1);
  }

  const sceneGraphPath = args[0];
  const sceneGraphPathNonNull = sceneGraphPath!;

  if (!fs.existsSync(sceneGraphPathNonNull)) {
    console.error(`Error: SceneGraph file not found: ${sceneGraphPathNonNull}`);
    process.exit(1);
  }

  try {
    const sceneGraph = SceneGraphParser.parseFile(sceneGraphPathNonNull);
    console.log("\n" + SceneGraphParser.visualizeHierarchy(sceneGraph));
    console.log("\n=== Component Distribution ===");

    const distribution =
      SceneGraphParser.analyzeComponentDistribution(sceneGraph);
    for (const [componentType, count] of distribution) {
      console.log(`  ${componentType}: ${count}`);
    }
  } catch (error) {
    console.error("Error reading scene graph:", error);
    process.exit(1);
  }
}

function listApisCommand() {
  const methods = ClusterScriptDefinitions.getAllMethodNames();
  const properties = ClusterScriptDefinitions.getAllPropertyNames();

  console.log("\n=== Available ClusterScript APIs ===\n");

  console.log("Methods:");
  for (const method of methods.sort()) {
    console.log(`  - ${method}`);
  }

  console.log("\nProperties:");
  for (const prop of properties.sort()) {
    console.log(`  - ${prop}`);
  }
}

// Main CLI entry point
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(0);
}

const command = args[0];
const commandArgs = args.slice(1);

switch (command) {
  case "analyze":
    analyzeCommand(commandArgs);
    break;
  case "report":
    reportCommand(commandArgs);
    break;
  case "coverage":
    coverageCommand(commandArgs);
    break;
  case "recommend":
    recommendCommand(commandArgs);
    break;
  case "scene-graph":
    sceneGraphCommand(commandArgs);
    break;
  case "list-apis":
    listApisCommand();
    break;
  case "--help":
  case "-h":
  case "help":
    printUsage();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}

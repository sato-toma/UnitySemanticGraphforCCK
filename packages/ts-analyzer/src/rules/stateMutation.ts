export interface StateMutationRuleDefinition {
  name: string;
  pattern: RegExp;
}

export const stateMutationRules: StateMutationRuleDefinition[] = [
  {
    name: "array-methods",
    pattern:
      /\$\s*\.\s*state\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])(?:\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*['"][^'"]+['"]\s*\]))*\s*\.(push|splice|pop|shift|unshift|sort|reverse)\s*\(/g,
  },
  {
    name: "nested-assignment",
    pattern:
      /\$\s*\.\s*state\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])(?:\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*['"][^'"]+['"]\s*\]))+\s*(?:[+\-*/%&|^]?=|--|\+\+)/g,
  },
];

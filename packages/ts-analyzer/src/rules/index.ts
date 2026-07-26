import { physicsRules } from "./physics";
import { interactionRules } from "./interactions";
import { movementRules } from "./movement";
import { stateMutationRules } from "./stateMutation";

export const ruleSets = {
  physics: physicsRules,
  interaction: interactionRules,
  movement: movementRules,
};

export const stateMutationRuleSets = stateMutationRules;

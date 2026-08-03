import {
  executeSumAWithAudit,
  executeSumBWithAudit,
  executeSumCWithAudit,
} from "./service";

const input = process.argv[2] ?? "100";

const resultA =
  executeSumAWithAudit(input).result;
const resultB =
  executeSumBWithAudit(input).result;
const resultC =
  executeSumCWithAudit(input).result;

console.log(resultA);
console.log(resultB);
console.log(resultC);

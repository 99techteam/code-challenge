import {
  executeSumAWithAudit,
  executeSumBWithAudit,
  executeSumCWithAudit,
} from "./service";

const choice =
  process.argv[2]?.toLowerCase();
const input = process.argv[3];

try {
  let result: number;

  switch (choice) {
    case "a":
      result =
        executeSumAWithAudit(
          input,
        ).result;
      break;

    case "b":
      result =
        executeSumBWithAudit(
          input,
        ).result;
      break;

    case "c":
      result =
        executeSumCWithAudit(
          input,
        ).result;
      break;

    default:
      throw new Error(
        "Usage: npm start -- a|b|c <integer>",
      );
  }

  console.log(result);
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
}

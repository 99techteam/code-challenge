import {
  executeSumAWithAudit,
  executeSumBWithAudit,
  executeSumCWithAudit,
} from "./service";

const choice =
  process.argv[2]?.toLowerCase();

const start =
  Number(process.argv[3]);

const count =
  Number(process.argv[4]);

const auditFile =
  process.argv[5];

if (
  !["a", "b", "c"].includes(choice) ||
  !Number.isSafeInteger(start) ||
  !Number.isSafeInteger(count) ||
  count < 1 ||
  !auditFile
) {
  throw new Error(
    "Invalid concurrency-worker arguments",
  );
}

for (
  let offset = 0;
  offset < count;
  offset += 1
) {
  const input =
    start + offset;

  switch (choice) {
    case "a":
      executeSumAWithAudit(
        input,
        auditFile,
      );
      break;

    case "b":
      executeSumBWithAudit(
        input,
        auditFile,
      );
      break;

    case "c":
      executeSumCWithAudit(
        input,
        auditFile,
      );
      break;
  }
}

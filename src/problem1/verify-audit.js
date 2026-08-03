"use strict";

/**
 * Verify an audit manifest and its related evidence files.
 *
 * CLI:
 *   node verify-audit.js logs/audit-....manifest.json
 */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function sha256(text) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}

function calculateEventHash(event) {
  const unsignedEvent = {
    auditId: event.auditId,
    timestamp: event.timestamp,
    globalStep: event.globalStep,
    algorithm: event.algorithm,
    action: event.action,
    data: event.data,
    previousHash: event.previousHash,
  };

  return sha256(JSON.stringify(unsignedEvent));
}

function verifyAudit(manifestPath) {
  const absoluteManifest = path.resolve(manifestPath);
  const directory = path.dirname(absoluteManifest);

  const errors = [];
  const checks = [];

  function check(condition, name, details = {}) {
    checks.push({
      name,
      passed: Boolean(condition),
      details,
    });

    if (!condition) {
      errors.push({
        name,
        details,
      });
    }
  }

  check(
    fs.existsSync(absoluteManifest),
    "Manifest file exists",
    { manifestPath: absoluteManifest },
  );

  if (!fs.existsSync(absoluteManifest)) {
    return {
      valid: false,
      checks,
      errors,
    };
  }

  let manifest;

  try {
    manifest = JSON.parse(
      fs.readFileSync(absoluteManifest, "utf8"),
    );
    check(true, "Manifest JSON is valid");
  } catch (error) {
    check(false, "Manifest JSON is valid", {
      message: error.message,
    });

    return {
      valid: false,
      checks,
      errors,
    };
  }

  const rawPath = path.join(directory, manifest.files.raw);
  const humanPath = path.join(directory, manifest.files.human);

  check(fs.existsSync(rawPath), "Raw JSONL file exists", {
    rawPath,
  });
  check(fs.existsSync(humanPath), "Human log file exists", {
    humanPath,
  });

  if (!fs.existsSync(rawPath) || !fs.existsSync(humanPath)) {
    return {
      valid: false,
      manifest,
      checks,
      errors,
    };
  }

  const rawText = fs.readFileSync(rawPath, "utf8");
  const humanText = fs.readFileSync(humanPath, "utf8");

  check(
    sha256(rawText) === manifest.rawSha256,
    "Raw file SHA-256 matches manifest",
    {
      expected: manifest.rawSha256,
      actual: sha256(rawText),
    },
  );

  check(
    sha256(humanText) === manifest.humanSha256,
    "Human log SHA-256 matches manifest",
    {
      expected: manifest.humanSha256,
      actual: sha256(humanText),
    },
  );

  const nonEmptyLines = rawText
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const events = [];

  for (const [index, line] of nonEmptyLines.entries()) {
    try {
      events.push(JSON.parse(line));
    } catch (error) {
      check(false, `JSONL line ${index + 1} is valid JSON`, {
        message: error.message,
      });
    }
  }

  check(
    events.length === manifest.eventCount,
    "Event count matches manifest",
    {
      expected: manifest.eventCount,
      actual: events.length,
    },
  );

  let expectedPreviousHash = "GENESIS";

  for (const [index, event] of events.entries()) {
    const expectedStep = index + 1;

    check(
      event.globalStep === expectedStep,
      `Step ${expectedStep} is continuous`,
      {
        expected: expectedStep,
        actual: event.globalStep,
      },
    );

    check(
      event.auditId === manifest.auditId,
      `Step ${expectedStep} audit ID matches`,
      {
        expected: manifest.auditId,
        actual: event.auditId,
      },
    );

    check(
      event.previousHash === expectedPreviousHash,
      `Step ${expectedStep} previous hash matches`,
      {
        expected: expectedPreviousHash,
        actual: event.previousHash,
      },
    );

    const recalculated = calculateEventHash(event);

    check(
      event.eventHash === recalculated,
      `Step ${expectedStep} event hash is valid`,
      {
        expected: recalculated,
        actual: event.eventHash,
      },
    );

    check(
      !Number.isNaN(Date.parse(event.timestamp)),
      `Step ${expectedStep} timestamp is valid`,
      {
        timestamp: event.timestamp,
      },
    );

    expectedPreviousHash = event.eventHash;
  }

  const lastEvent = events.at(-1);

  check(
    lastEvent?.eventHash === manifest.finalEventHash,
    "Final event hash matches manifest",
    {
      expected: manifest.finalEventHash,
      actual: lastEvent?.eventHash,
    },
  );

  const expectedTerminalAction = {
    PASSED: "SESSION_PASSED",
    FAILED: "SESSION_FAILED",
    ERROR: "SESSION_ERROR",
  }[manifest.status];

  check(
    lastEvent?.action === expectedTerminalAction,
    "Terminal event matches manifest status",
    {
      status: manifest.status,
      expected: expectedTerminalAction,
      actual: lastEvent?.action,
    },
  );

  check(
    events[0]?.action === "SESSION_STARTED",
    "First event is SESSION_STARTED",
    {
      actual: events[0]?.action,
    },
  );

  return {
    valid: errors.length === 0,
    manifest,
    checks,
    errors,
    files: {
      manifest: absoluteManifest,
      raw: rawPath,
      human: humanPath,
    },
  };
}

function runCli() {
  const manifestPath = process.argv[2];

  if (!manifestPath) {
    console.error(
      "Usage: node verify-audit.js <manifest.json>",
    );
    process.exitCode = 1;
    return;
  }

  const report = verifyAudit(manifestPath);

  for (const check of report.checks) {
    console.log(
      `[${check.passed ? "PASS" : "FAIL"}] ${check.name}`,
    );
  }

  console.log("");
  console.log(
    `Audit integrity: ${report.valid ? "VALID" : "INVALID"}`,
  );

  if (!report.valid) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  calculateEventHash,
  sha256,
  verifyAudit,
};

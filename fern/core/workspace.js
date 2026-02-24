const path = require("path");
const fs = require("fs");

const WORKSPACE_FILENAME = ".workspace";

async function fileExists(filepath) {
  try {
    await fs.promises.access(filepath, fs.constants.F_OK);
    return true;
  } catch (ex) {
    return false;
  }
}

async function getRoot() {
  // Start from the Fern package location and walk up to find `.workspace`.
  // Stop at filesystem root to avoid unbounded traversal.
  const defaultRoot = path.resolve(__dirname, "..", "..");
  let current = defaultRoot;

  while (true) {
    if (await fileExists(path.join(current, WORKSPACE_FILENAME))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  // Fallback to the expected repository layout even if `.workspace` is missing.
  return defaultRoot;
}

async function getWorkspaceFilePath() {
  const root = await getRoot();
  return path.join(root, WORKSPACE_FILENAME);
}

async function load() {
  const workspaceFile = await getWorkspaceFilePath();
  if (await fileExists(workspaceFile)) {
    const raw = await fs.promises.readFile(workspaceFile, "utf-8");

    try {
      const workspace = JSON.parse(raw);
      // TODO - validate
      return workspace;
    } catch (ex) {
      throw new Error(
        `Could not load '.workspace' file, should be valid JSON.`
      );
    }
  }

  return {
    app: undefined,
    firefox: undefined,
    umbra: undefined,
  };
}

async function save(workspace) {
  await fs.promises.writeFile(
    await getWorkspaceFilePath(),
    JSON.stringify(workspace, null, 2),
    "utf-8"
  );
}

module.exports = {
  getRoot,
  load,
  save,
};

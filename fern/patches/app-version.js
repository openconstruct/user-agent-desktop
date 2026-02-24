const path = require("path");
const fs = require("fs").promises;

const execa = require("execa");

function getPathToVersion() {
  return path.join("mozilla-release", "browser", "config", "version.txt");
}

function getPathToVersionDisplay() {
  return path.join(
    "mozilla-release",
    "browser",
    "config",
    "version_display.txt"
  );
}

async function getVersionDisplay(version) {
  const candidates = [path.join("mozilla-release"), process.cwd()];

  for (const cwd of candidates) {
    try {
      const { stdout: commitHash } = await execa(
        "git",
        ["rev-parse", "--short", "HEAD"],
        { cwd }
      );
      if (commitHash.trim()) {
        return `${version} (${commitHash.trim()})`;
      }
    } catch (ex) {
      // Try next candidate; version display can be plain if git metadata
      // is unavailable in this environment.
    }
  }

  return version;
}

module.exports = ({ app: version }) => ({
  name: "Setup app version",
  paths: ["browser/config/version.txt", "browser/config/version_display.txt"],
  skip: async () =>
    (await fs.readFile(getPathToVersion(), "utf-8")) === version &&
    (await fs.readFile(getPathToVersionDisplay(), "utf-8")) ===
      (await getVersionDisplay(version)),
  apply: async () => {
    await fs.writeFile(getPathToVersion(), version, "utf-8");
    await fs.writeFile(
      getPathToVersionDisplay(),
      await getVersionDisplay(version),
      "utf-8"
    );
  },
});

const stream = require("stream");
const { promisify } = require("util");
const path = require("path");
const fs = require("fs");

const got = require("got");
const execa = require("execa");
const Listr = require("listr");
const rimraf = require("rimraf");

const { setup: setupGit, reset: resetGit } = require("./git.js");
const { getRoot } = require("./workspace.js");
const { getCacheDir } = require("./caching.js");
const { fileExists, folderExists, symlinkExists } = require("./utils.js");

async function isValidSourceArchive(archivePath) {
  if ((await fileExists(archivePath)) === false) {
    return false;
  }

  const stats = await fs.promises.stat(archivePath);
  if (stats.size <= 0) {
    return false;
  }

  try {
    await execa("tar", ["-tf", archivePath], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return true;
  } catch (ex) {
    return false;
  }
}

async function use(version, s3bucket, sourceUrl) {
  const root = await getRoot();
  const cache = await getCacheDir("firefox", `${version}`);
  const extractedVersion = version
    .replace(/b\d+$/, "")
    .replace(/esr$/, "");
  const folder = path.join(cache, `firefox-${extractedVersion}`);
  const archive = path.join(cache, `firefox-${version}.source.tar.xz`);
  const git = path.join(folder, ".git");
  const baseUrl = s3bucket
    ? `https://${s3bucket}.s3.amazonaws.com`
    : "https://archive.mozilla.org/pub";
  const url =
    sourceUrl ||
    `${baseUrl}/firefox/releases/${version}/source/firefox-${version}.source.tar.xz`;
  if (url.endsWith(".source.tar.xz") === false) {
    throw new Error(
      `Invalid Firefox source URL for mach builds: ${url} (expected *.source.tar.xz)`
    );
  }
  return new Listr([
    {
      title: "Download",
      skip: async () => {
        const validArchive = await isValidSourceArchive(archive);
        if (validArchive) {
          return true;
        }

        // Remove invalid/partial archives so a fresh download can proceed.
        if (await fileExists(archive)) {
          await fs.promises.unlink(archive);
        }
        return false;
      },
      task: async () => {
        try {
          await promisify(stream.pipeline)(
            got.stream(url),
            fs.createWriteStream(archive)
          );
        } catch (ex) {
          // Avoid caching broken partial downloads.
          if (await fileExists(archive)) {
            await fs.promises.unlink(archive);
          }
          throw ex;
        }
      },
    },
    {
      title: "Extract",
      skip: () => folderExists(folder),
      task: async () => {
        console.log(`DEBUG: Attempting to extract to: ${folder}`);
        await execa("tar", ["-xvf", archive, "-C", cache]);
        // Add a small delay to ensure filesystem is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        const extractedFolderExists = await folderExists(folder);
        console.log(`DEBUG: After extraction and delay, folder exists: ${extractedFolderExists}`);
        if (!extractedFolderExists) {
          throw new Error(`Extraction failed: folder not found at ${folder}`);
        }
      },
    },
    {
      title: "Git",
      skip: () => folderExists(git),
      task: () => setupGit(version, folder),
    },
    {
      title: "Link",
      task: async () => {
        // Clean-up existing symlink
        if (await symlinkExists("mozilla-release")) {
          rimraf.sync("mozilla-release");
        }

        // Make sure there is no folder named 'mozilla-release'
        if (await folderExists("mozilla-release")) {
          throw new Error(
            'Existing "mozilla-release" path: Cannot be overriden safely!'
          );
        }

        // Create symlink!
        await fs.promises.symlink(folder, "mozilla-release");
      },
    },
    {
      title: "Populate Build Folder",
      task: async () => {
        const candidatePaths = [
          path.join(folder, "taskcluster/scripts/misc/fetch-content"),
          path.join(
            folder,
            "third_party/python/taskcluster_taskgraph/taskgraph/run-task/fetch-content"
          ),
        ];

        let sourcePath;
        for (const p of candidatePaths) {
          if (await fileExists(p)) {
            sourcePath = p;
            break;
          }
        }

        if (sourcePath === undefined) {
          throw new Error(
            `Could not find fetch-content script in known locations: ${candidatePaths.join(
              ", "
            )}`
          );
        }

        await fs.promises.copyFile(
          sourcePath,
          path.join(root, "build", "fetch-content")
        );
      },
    },
  ]);
}

function reset(version) {
  return new Listr([
    {
      title: "Git",
      task: () => resetGit(version, "mozilla-release"),
    },
  ]);
}

module.exports = {
  use,
  reset,
};

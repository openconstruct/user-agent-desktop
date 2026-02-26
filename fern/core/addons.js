const stream = require("stream");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const got = require("got");
const execa = require("execa");
const Listr = require("listr");
const readdir = require("recursive-readdir");

const { getCacheDir } = require("./caching.js");
const { fileExists, folderExists, ensureFolderExists } = require("./utils.js");

const getAddonUrlHash = url => crypto.createHash("md5").update(url).digest("hex");
const LEGACY_ADDON_CACHE_ALIASES = {
  umbra: "ghostery",
  "umbra-search": "ghostery-search",
  "umbra-newtab": "ghostery-newtab",
};

async function getSingleCachedFolder(cacheDir) {
  if ((await folderExists(cacheDir)) === false) {
    return null;
  }

  const entries = await fs.promises.readdir(cacheDir, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  if (directories.length === 1) {
    return path.join(cacheDir, directories[0].name);
  }

  return null;
}

async function getPathToCachedAddon(addonName, url) {
  const addonUrlHash = getAddonUrlHash(url);
  const cache = await getCacheDir(addonName);
  const expectedPath = path.join(cache, addonUrlHash);
  if (await folderExists(expectedPath)) {
    return expectedPath;
  }

  // Umbra rename compatibility: reuse existing Ghostery cache entries
  // if no cache exists yet for the renamed addon key.
  const legacyAddonName = LEGACY_ADDON_CACHE_ALIASES[addonName];
  if (legacyAddonName) {
    const legacyCache = await getCacheDir(legacyAddonName);
    const legacySingleFolder = await getSingleCachedFolder(legacyCache);
    if (legacySingleFolder) {
      return legacySingleFolder;
    }
  }

  return expectedPath;
}

async function getAddonId(addonName, url) {
  const folder = await getPathToCachedAddon(addonName, url);
  const manifestPath = path.join(folder, 'manifest.json');
  const manifest = require(manifestPath);
  return manifest['browser_specific_settings']['gecko']['id'];
}

async function use(addons) {
  const tasks = await Promise.all(Object.keys(addons).map(async (addonName) => {
    const cache = await getCacheDir(addonName);
    const url = addons[addonName];
    const folder = await getPathToCachedAddon(addonName, url);
    const addonUrlHash = getAddonUrlHash(url);
    const archive = path.join(cache, `${addonUrlHash}.zip`);

    return [
      {
        title: `Download ${addonName}`,
        skip: () => fileExists(archive),
        task: () => new Promise((resolve, reject) => {
          stream.pipeline(
            got.stream(url),
            fs.createWriteStream(archive),
            (err) => {
              if (err) {
                fs.unlinkSync(archive);
                reject(err);
              } else {
                resolve();
              }
            }
          )
        })
      },
      {
        title: `Extract ${addonName}`,
        skip: () => folderExists(folder),
        task: async () => {
          await ensureFolderExists(folder);
          await execa("unzip", [archive, "-d", folder]);
        },
      },
      {
        title: `Moz.build for ${addonName}`,
        task: async () => {
          const addonId = await getAddonId(addonName, url);
          fs.promises.writeFile(
            path.join(folder, "moz.build"),
            [
              "# -*- Mode: python; indent-tabs-mode: nil; tab-width: 40 -*-",
              "# vim: set filetype=python:",
              "# This Source Code Form is subject to the terms of the Mozilla Public",
              "# License, v. 2.0. If a copy of the MPL was not distributed with this",
              "# file, You can obtain one at http://mozilla.org/MPL/2.0/.",
              "",
              'DEFINES["MOZ_APP_VERSION"] = CONFIG["MOZ_APP_VERSION"]',
              'DEFINES["MOZ_APP_MAXVERSION"] = CONFIG["MOZ_APP_MAXVERSION"]',
              "",
              `id = "${addonId}"`,
              "",
              `files = """${(await readdir(folder))
                .map((filename) => filename.slice(folder.length + 1))
                .sort()
                .join("\n")}"""`,
              "",
              'for path in files.split("\\n"):',
              "    root = FINAL_TARGET_FILES.features[id]",
              '    parts = path.split("/")',
              "    for folder in parts[:-1]:",
              "        root = root[folder]",
              "    root += [path]",
            ].join("\n"),
            "utf-8"
          );
        },
      },
    ];
  }));

  return new Listr([].concat(...tasks));
}

module.exports = {
  getPathToCachedAddon,
  use,
};

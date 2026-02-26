const path = require("path");
const fsExtra = require("fs-extra");
const fs = require("fs").promises;


const { getRoot } = require("../core/workspace.js");
const { getPathToCachedAddon } = require("../core/addons.js");

async function getPathToAddons() {
  const root = await getRoot();
  return path.join(
    root,
    "mozilla-release",
    "browser",
    "extensions",
  );
}

async function getPathToAddon(addonName) {
  const addonsPath = await getPathToAddons();
  return path.join(
    addonsPath,
    addonName,
  );
}

const MOZ_BUILD_FILE_NAME =  "moz.build";
const PACKAGE_MANIFEST_FILE_NAME = "package-manifest.in";
const PACKAGE_MANIFEST_MARKER_START = "; [Umbra Custom Feature Add-ons]";
const PACKAGE_MANIFEST_MARKER_END = "; [End Umbra Custom Feature Add-ons]";
const EXTENSIONS_TOOLKIT_MANIFEST_LINE =
  "@RESPATH@/components/extensions-toolkit.manifest";

async function getPathToAddonMozBuild() {
  const addonsPath = await getPathToAddons();
  return path.join(
    addonsPath,
    MOZ_BUILD_FILE_NAME,
  );
}

async function getPathToPackageManifest() {
  const root = await getRoot();
  return path.join(
    root,
    "mozilla-release",
    "browser",
    "installer",
    PACKAGE_MANIFEST_FILE_NAME,
  );
}

const generateAddonMozBuild = (addonNames) => `
# -*- Mode: python; indent-tabs-mode: nil; tab-width: 40 -*-
# vim: set filetype=python:
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

DIRS += [
${addonNames.map(addonName => `    "${addonName}"`).join(',\n')}
]

if CONFIG["NIGHTLY_BUILD"]:
    DIRS += [
        "translations",
    ]
`;

async function getFeatureAddonId(addonName) {
  const manifestPath = path.join(
    await getPathToAddon(addonName),
    "manifest.json",
  );

  if (!(await fsExtra.pathExists(manifestPath))) {
    return null;
  }

  try {
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContent);
    const geckoConfig = manifest.browser_specific_settings?.gecko || manifest.applications?.gecko;
    const addonId = geckoConfig?.id;
    return typeof addonId === "string" && addonId ? addonId : null;
  } catch {
    return null;
  }
}

function generatePackageManifestAddonBlock(addonIds) {
  if (!addonIds.length) {
    return "";
  }

  const addonLines = addonIds.map((addonId) => (
    `@RESPATH@/browser/features/${addonId}/*`
  )).join("\n");

  return [
    `${PACKAGE_MANIFEST_MARKER_START}`,
    addonLines,
    `${PACKAGE_MANIFEST_MARKER_END}`,
    "",
  ].join("\n");
}

function updatePackageManifestContent(content, addonIds) {
  const addonBlock = generatePackageManifestAddonBlock(addonIds);
  const start = content.indexOf(PACKAGE_MANIFEST_MARKER_START);
  const end = content.indexOf(PACKAGE_MANIFEST_MARKER_END);

  if (start !== -1 && end !== -1 && end > start) {
    const suffixStart = content.indexOf("\n", end);
    const prefix = content.slice(0, start);
    const suffix = suffixStart === -1 ? "" : content.slice(suffixStart + 1);
    return addonBlock ? `${prefix}${addonBlock}${suffix}` : `${prefix}${suffix}`;
  }

  if (!addonBlock) {
    return content;
  }

  const hasAllAddonEntries = addonIds.every((addonId) => (
    content.includes(`@RESPATH@/browser/features/${addonId}/*`)
  ));
  if (hasAllAddonEntries) {
    return content;
  }

  const anchorIndex = content.indexOf(EXTENSIONS_TOOLKIT_MANIFEST_LINE);
  if (anchorIndex === -1) {
    return `${content}\n${addonBlock}`;
  }

  const anchorLineEnd = content.indexOf("\n", anchorIndex);
  const head = content.slice(0, anchorLineEnd + 1);
  const tail = content.slice(anchorLineEnd + 1);
  return `${head}${addonBlock}${tail}`;
}

async function syncPackageManifest(addonNames) {
  const addonIds = (
    await Promise.all(addonNames.map((addonName) => getFeatureAddonId(addonName)))
  )
    .filter(Boolean)
    .sort();
  const packageManifestPath = await getPathToPackageManifest();
  const currentContent = await fs.readFile(packageManifestPath, "utf8");
  const updatedContent = updatePackageManifestContent(currentContent, addonIds);

  if (updatedContent !== currentContent) {
    await fs.writeFile(packageManifestPath, updatedContent);
  }
}

module.exports = (workspace) => {
  const addonNames = Object.keys(workspace.addons);
  const firefoxAddonNames = workspace.firefoxAddons || [];
  return {
    name: "Setup Addons",
    paths: [
      ...addonNames.map(addonName => `browser/extensions/${addonName}`),
      `browser/extensions/${MOZ_BUILD_FILE_NAME}`,
      `browser/installer/${PACKAGE_MANIFEST_FILE_NAME}`,
    ],
    skip: () => false,
    apply: async () => {
      const availableFirefoxAddons = (
        await Promise.all(
          firefoxAddonNames.map(async (addonName) => {
            const addonPath = await getPathToAddon(addonName);
            return (await fsExtra.pathExists(addonPath)) ? addonName : null;
          })
        )
      ).filter(Boolean);

      const allAddonNames = [...addonNames, ...availableFirefoxAddons].sort();

      await Promise.all(
        addonNames.map(async addonName => {
          return fsExtra.copy(
            await getPathToCachedAddon(addonName, workspace.addons[addonName]),
            await getPathToAddon(addonName)
          );
        })
      );

      await fs.writeFile(
        await getPathToAddonMozBuild(),
        generateAddonMozBuild(allAddonNames),
      );

      await syncPackageManifest(addonNames);
    }
  };
};

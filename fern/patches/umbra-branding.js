const path = require("path");

const fsExtra = require("fs-extra");

const { getRoot } = require("../core/workspace.js");

async function getPathToSourceBranding() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "branding");
}

async function getPathToSourceDevToolsIcons() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "devtools", "client", "themes", "images");
}

async function getPathToSourceWindowsInstaller() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "windows-installer", "7zSD.Win32.sfx");
}

async function getPathToSourceAutoconfig() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "config", "autoconfig.js");
}

async function getPathToSourceUmbraConfig() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "config", "umbra.cfg");
}

async function getPathToSourcePolicies() {
  const root = await getRoot();
  return path.join(root, "brands", "Umbra", "distribution", "policies.json");
}


const brandingPathComponents = ["browser", "branding", "Umbra"];
const windowsInstallerPathComponents = ["other-licenses", "7zstub", "firefox", "7zSD.Win32.sfx"];
const devToolsIconsPathComponents = ["devtools", "client", "themes", "images"];
const umbraPackagingPathComponents = ["umbra"];
const privateBrowsingIconPaths = [
  ["browser", "themes", "shared", "icons", "indicator-private-browsing.svg"],
  ["toolkit", "themes", "shared", "icons", "indicator-private-browsing.svg"],
  ["browser", "themes", "shared", "icons", "privateBrowsing.svg"],
  ["browser", "themes", "shared", "privatebrowsing", "favicon.svg"],
  ["browser", "themes", "shared", "privatebrowsing", "private-browsing.svg"]
];

async function getTargetPath(pathComponents) {
  return path.join(
    await getRoot(),
    "mozilla-release",
    ...pathComponents,
  );
}

async function copy(fromPath, ...to) {
  const from = path.join(await getRoot(), ...fromPath);
  return Promise.all(to.map(async (toPath) => {
    return fsExtra.copy(
      from,
      await getTargetPath(toPath)
    )
  }));
}

async function copyFirstExisting(fromPathCandidates, ...to) {
  const root = await getRoot();
  for (const fromPath of fromPathCandidates) {
    const from = path.join(root, ...fromPath);
    if (await fsExtra.pathExists(from)) {
      return Promise.all(to.map(async (toPath) => {
        return fsExtra.copy(
          from,
          await getTargetPath(toPath)
        )
      }));
    }
  }
  throw new Error(
    `Missing source branding asset. Checked: ${fromPathCandidates.map((p) => path.join(...p)).join(", ")}`
  );
}

module.exports = () => ({
  name: "Setup Umbra branding",
  paths: [
    brandingPathComponents,
    windowsInstallerPathComponents,
    devToolsIconsPathComponents,
    [...umbraPackagingPathComponents, "autoconfig.js"],
    [...umbraPackagingPathComponents, "umbra.cfg"],
    [...umbraPackagingPathComponents, "policies.json"],
    ...privateBrowsingIconPaths
  ].map(p => path.join(...p)),
  skip: async () => false,
  apply: async () => {
    await fsExtra.copy(
      await getPathToSourceBranding(),
      await getTargetPath(brandingPathComponents)
    );
    // copy installer icon
    await fsExtra.copy(
      await getPathToSourceWindowsInstaller(),
      await getTargetPath(windowsInstallerPathComponents)
    );
    // copy devtools icons
    await fsExtra.copy(
      await getPathToSourceDevToolsIcons(),
      await getTargetPath(devToolsIconsPathComponents)
    );
    // white ghosty private tab logo
    await copyFirstExisting(
      [
        ["brands", "Umbra", "branding", "content", "private-ghosty-logo-white.svg"],
        ["brands", "Umbra", "branding", "private-ghosty-logo-white.svg"],
      ],
      ["browser", "themes", "shared", "icons", "indicator-private-browsing.svg"],
      ["toolkit", "themes", "shared", "icons", "indicator-private-browsing.svg"],
      ["browser", "themes", "shared", "privatebrowsing", "private-browsing.svg"],
    );
    // context-fill ghosty private tab logo
    await copyFirstExisting(
      [
        ["brands", "Umbra", "branding", "content", "private-ghosty-logo.svg"],
        ["brands", "Umbra", "branding", "private-ghosty-logo.svg"],
        ["brands", "Umbra", "branding", "content", "private-browsing.svg"],
        ["brands", "Umbra", "branding", "private-browsing.svg"],
      ],
      ["browser", "themes", "shared", "icons", "privateBrowsing.svg"],
      ["browser", "themes", "shared", "privatebrowsing", "favicon.svg"],
    );

    const umbraPackagingPath = await getTargetPath(umbraPackagingPathComponents);
    await fsExtra.ensureDir(umbraPackagingPath);

    // Copy runtime config files into a dedicated source folder, then let
    // moz.build + package-manifest place them in the final app layout.
    await fsExtra.copy(
      await getPathToSourceAutoconfig(),
      path.join(umbraPackagingPath, "autoconfig.js")
    );
    await fsExtra.copy(
      await getPathToSourceUmbraConfig(),
      path.join(umbraPackagingPath, "umbra.cfg")
    );
    await fsExtra.copy(
      await getPathToSourcePolicies(),
      path.join(umbraPackagingPath, "policies.json")
    );
  },
});

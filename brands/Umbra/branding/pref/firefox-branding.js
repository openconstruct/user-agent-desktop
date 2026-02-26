/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file contains branding-specific prefs.

/****************************************************************************
 * SECTION: ENABLE UMBRA-SPECIFIC PREFS                                  *
 ****************************************************************************/

/** DRM / GMP **/
// Privacy-first default: keep DRM disabled unless the user opts in.
// When enabled, force a reliable Widevine installation path for custom branding builds.
pref("media.eme.enabled", false);
pref("media.gmp-manager.updateEnabled", true);
pref("media.gmp-provider.enabled", true);
pref("media.gmp-gmpopenh264.enabled", true);
pref("media.gmp-widevinecdm.enabled", true);
pref("media.gmp-widevinecdm.visible", true);
pref("media.gmp-widevinecdm.forceInstall", true);
pref("media.gmp-widevinecdm.force-chromium-update", true);

/** UPDATES ***/
// The time interval between checks for a new version (in seconds)
pref("app.update.interval", 31536000); // 365 days (effectively disable periodic auto checks)
// Give the user x seconds to react before showing the big UI. default=24 hours
pref("app.update.promptWaitTime", 86400);
// Disable automatic update download/install flow
pref("app.update.auto", false);
// Disable background update task scheduling
pref("app.update.background.enabled", false);
pref("app.update.background.interval", 31536000);
// Disable update service integration
pref("app.update.service.enabled", false);
// URL user can browse to manually if for some reason all update installation
// attempts fail.
pref("app.update.url.manual", "about:blank");
// A default value for the "More information about this update" link
// supplied in the "An update is available" page of the update wizard.
pref("app.update.url.details", "about:blank");
// Keep about dialog free of extra release notes links
pref("app.releaseNotesURL.aboutDialog", "about:blank");
// The number of days a binary is permitted to be old
// without checking for an update.  This assumes that
// app.update.checkInstallTime is true.
pref("app.update.checkInstallTime.days", 63);
pref("app.update.checkInstallTime", false);
// Give the user x seconds to reboot before showing a badge on the hamburger
// button. default=immediately
pref("app.update.badgeWaitTime", 0);

/** VARIOUS ***/
// Fetch shavar updates from Umbra endpoint
pref("browser.safebrowsing.provider.mozilla.updateURL", "data:,");
pref("browser.safebrowsing.malware.enabled", false);
pref("browser.safebrowsing.phishing.enabled", false);
pref("browser.safebrowsing.downloads.enabled", false);

// UA compat mode - Adds Firefox/VER to the UA string in addition to the APP_NAME. (https://github.com/umbra/user-agent-desktop/issues/114)
pref("general.useragent.compatMode.firefox", true);

// Support and feedback URLs
pref("app.support.baseURL", "https://get.umbrabrowser.com/support/");
pref("app.feedback.baseURL", "https://www.umbra.com/support/");

// Override settings server to Umbra
pref("services.settings.server", "data:,");
pref("browser.region.update.enabled", false);

/****************************************************************************
 * SECTION: DISABLE MOZILLA FIREFOX-SPECIFIC PREFS                          *
****************************************************************************/

/** TRACKING ***/
// Umbra preset used by about:umbra controls.
pref("umbra.privacy.preset", "strict");

// Enable Firefox's native tracking protection blocking with strict defaults
pref("browser.contentblocking.category", "strict");
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.pbmode.enabled", true);
pref("privacy.purge_trackers.enabled", true); // Redirect Tracking Protection
pref("privacy.trackingprotection.cryptomining.enabled", true);
pref("privacy.trackingprotection.fingerprinting.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
pref("privacy.trackingprotection.emailtracking.enabled", true);
pref("privacy.trackingprotection.emailtracking.pbmode.enabled", true);
pref("privacy.socialtracking.block_cookies.enabled", true);
pref("browser.contentblocking.database.enabled", true);
pref("browser.contentblocking.allowlist.storage.enabled", true);
pref("browser.contentblocking.cryptomining.preferences.ui.enabled", true);
pref("browser.contentblocking.fingerprinting.preferences.ui.enabled", true);
pref("privacy.fingerprintingProtection", true);
pref("privacy.fingerprintingProtection.pbmode", true);
pref("privacy.resistFingerprinting", false);
pref("privacy.resistFingerprinting.pbmode", false);

// Remove addons.mozilla.org from set of domains that extensions cannot access
pref("extensions.webextensions.restrictedDomains", "accounts-static.cdn.mozilla.net,accounts.firefox.com,addons.cdn.mozilla.net,api.accounts.firefox.com,content.cdn.mozilla.net,discovery.addons.mozilla.org,install.mozilla.org,oauth.accounts.firefox.com,profile.accounts.firefox.com,support.mozilla.org,sync.services.mozilla.com");

// Disable System Addon updates
// [NOTE] We use partial updates instead of system addon updates.
pref("extensions.systemAddon.update.url", "");

/** TELEMETRY ***/
// Telemtry
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.server", "data:,");
pref("toolkit.telemetry.archive.enabled", false);
pref("toolkit.telemetry.newProfilePing.enabled", false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled", false);
pref("toolkit.telemetry.bhrPing.enabled", false);
pref("toolkit.telemetry.firstShutdownPing.enabled", false);

// Nimbus
pref("messaging-system.rsexperimentloader.enabled", false);
pref("browser.privatebrowsing.promoEnabled", false);

// Corroborator (#141)
pref("corroborator.enabled", false);

// Telemetry Coverage
pref("toolkit.telemetry.coverage.opt-out", true);
pref("toolkit.coverage.opt-out", true);
pref("toolkit.coverage.endpoint.base", "");

// Health Reports
// [SETTING] Privacy & Security>Firefox Data Collection & Use>Allow Firefox to send technical data.
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.usage.uploadEnabled", false);

// New data submission, master kill switch
// If disabled, no policy is shown or upload takes place, ever
// [1] https://bugzilla.mozilla.org/1195552 ***/
pref("datareporting.policy.dataSubmissionEnabled", false);

// Studies
// [SETTING] Privacy & Security>Firefox Data Collection & Use>Allow Firefox to install and run studies
pref("app.shield.optoutstudies.enabled", false);

// Personalized Extension Recommendations in about:addons and AMO
// [NOTE] This pref has no effect when Health Reports are disabled.
// [SETTING] Privacy & Security>Firefox Data Collection & Use>Allow Firefox to make personalized extension recommendations
pref("browser.discovery.enabled", false);

// Crash Reports
pref("breakpad.reportURL", "");
pref("browser.tabs.crashReporting.sendReport", false);
// backlogged crash reports
pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false);

// disable Captive Portal detection
// [1] https://www.eff.org/deeplinks/2017/08/how-captive-portals-interfere-wireless-security-and-privacy
// [2] https://wiki.mozilla.org/Necko/CaptivePortal
pref("captivedetect.canonicalURL", "");
pref("network.captive-portal-service.enabled", false);

// disable Network Connectivity checks
// [1] https://bugzilla.mozilla.org/1460537
pref("network.connectivity-service.enabled", false);

// Required for Make Default since Firefox 114
pref("default-browser-agent.enabled", true);

// Report extensions for abuse
pref("extensions.abuseReport.enabled", false);

// Normandy/Shield [extensions tracking]
// Shield is an telemetry system (including Heartbeat) that can also push and test "recipes"
pref("app.normandy.enabled", false);
pref("app.normandy.api_url", "");

// disable PingCentre telemetry (used in several System Add-ons)
// Currently blocked by 'datareporting.healthreport.uploadEnabled'
pref("browser.ping-centre.telemetry", false);

// disable search results page categorization telemetry
pref("browser.search.serpEventTelemetryCategorization.enabled", false);

// enforce GPC functionality globally
pref("privacy.globalprivacycontrol.functionality.enabled", true);

// disable experiment targeting context telemetry
pref("nimbus.telemetry.targetingContextEnabled", false);

// disable FxA client association ping telemetry
pref("identity.fxaccounts.telemetry.clientAssociationPing.enabled", false);

// disable partner attribution endpoint
pref("browser.partnerlink.attributionURL", "");

// disable Private Attribution APIs
pref("dom.private-attribution.submission.enabled", false);
pref("dom.origin-trials.private-attribution.state", 2);

// disable Activity Stream telemetry
pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
pref("browser.newtabpage.activity-stream.telemetry", false);

// Disable Firefox-specifc menus and products
pref("browser.privatebrowsing.vpnpromourl", ""); // Mozilla VPN
pref("browser.messaging-system.whatsNewPanel.enabled", false); // What's New
pref("browser.messaging-system.whatsNewPanel.onboardingEnabled", false);
pref("extensions.pocket.enabled", false); // Pocket Account
pref("extensions.pocket.api"," ");
pref("extensions.pocket.oAuthConsumerKey", " ");
pref("extensions.pocket.site", " ");
// Firefox Accounts & Sync
pref("identity.fxaccounts.enabled", false);
pref("identity.fxaccounts.autoconfig.uri", "https://get.umbrabrowser.com/health");
pref("extensions.fxmonitor.enabled", false); // Firefox Monitor
pref("signon.firefoxRelay.feature", ""); // Firefox Relay
pref("signon.management.page.breach-alerts.enabled", false); // Firefox Lockwise
pref("signon.management.page.breachAlertUrl", "");
pref("browser.contentblocking.report.lockwise.enabled", false);
pref("browser.contentblocking.report.lockwise.how_it_works.url", "");
pref("signon.generation.available", true); // Password Generator in built-in password manager
pref("signon.generation.enabled", true); // [SETTING] "Suggest and generate strong passwords"
// Disable Extension Recommendations (CFR: "Contextual Feature Recommender")
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
pref("extensions.htmlaboutaddons.recommendations.enabled", false);
pref("extensions.getAddons.showPane", false);

/** HOMEPAGE ***/
pref("startup.homepage_override_url", "");
pref("startup.homepage_welcome_url", "");
pref("startup.homepage_welcome_url.additional", "");
pref("browser.aboutwelcome.enabled", false);
pref("browser.disableResetPrompt", true);

/** NEW TAB PAGE & ACTIVITY STREAM ***/
pref("browser.startup.page", 3);
pref("browser.newtabpage.enabled", true);
pref("browser.newtabpage.activity-stream.discoverystream.enabled", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.feeds.topsites", true);
pref("browser.newtabpage.activity-stream.topSitesRows", 2);
pref("browser.newtabpage.activity-stream.showSearch", false);
pref("browser.newtabpage.activity-stream.feeds.snippets", false);
pref("browser.newtabpage.activity-stream.feeds.section.highlights", false);
pref("browser.newtabpage.activity-stream.section.highlights.includeBookmarks", false);
pref("browser.newtabpage.activity-stream.section.highlights.includeDownloads", false);
pref("browser.newtabpage.activity-stream.section.highlights.includePocket", false);
pref("browser.newtabpage.activity-stream.section.highlights.includeVisited", false);
pref("browser.topsites.contile.enabled", false);
pref("browser.topsites.useRemoteSetting", false);

// Disable wallpapers - remote settings server doesn't have wallpaper data
pref("browser.newtabpage.activity-stream.newtabWallpapers.enabled", false);

// Number of usages of the web console.
// If this is less than 5, then pasting code into the web console is disabled
pref("devtools.selfxss.count", 0);

// disable "Firefox Suggest"
pref("browser.urlbar.groupLabels.enabled", false);
pref("browser.urlbar.quicksuggest.enabled", false);
pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
pref("browser.urlbar.suggest.quicksuggest.sponsored", false);

// disable "Firefox View" [FF106+]
pref("browser.tabs.firefox-view", false);
pref("browser.tabs.firefox-view-newIcon", false);
pref("browser.tabs.firefox-view-next", false);
pref("browser.firefox-view.search.enabled", false); // [FF122+]
pref("browser.firefox-view.virtual-list.enabled", false); // [FF122+]

// disable Quarantined Domains [FF115+]
pref("extensions.quarantinedDomains.enabled", false);

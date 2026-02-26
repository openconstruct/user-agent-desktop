// Betterfox community driven prefs
//
/****************************************************************************
 * Betterfox for Umbra                                                   *
 * "Non ducor duco"                                                         *
 * version: 122                                                             *
 * url: https://github.com/yokoffing/Betterfox                              *
****************************************************************************/

/****************************************************************************
 * SECTION: FASTFOX                                                         *
****************************************************************************/
/** GENERAL ***/
pref("content.notify.interval", 100000);

/** GFX ***/
pref("gfx.canvas.accelerated.cache-items", 4096);
pref("gfx.canvas.accelerated.cache-size", 512);
pref("gfx.content.skia-font-cache-size", 20);

/** DISK CACHE ***/
pref("browser.cache.jsbc_compression_level", 3);

/** MEDIA CACHE ***/
pref("media.memory_cache_max_size", 65536);
pref("media.cache_readahead_limit", 7200);
pref("media.cache_resume_threshold", 3600);

/** IMAGE CACHE ***/
pref("image.mem.decode_bytes_at_a_time", 32768);

/** NETWORK ***/
pref("network.buffer.cache.size", 262144); // 256 kb; default=32768 (32 kb); reduce CPU usage by requiring fewer application-to-driver data transfers
pref("network.buffer.cache.count", 128); // default=24; reduce CPU usage by requiring fewer application-to-driver data transfers
pref("network.http.max-connections", 1800);
pref("network.http.max-persistent-connections-per-server", 10);
pref("network.http.max-urgent-start-excessive-connections-per-host", 5);
pref("network.dnsCacheExpiration", 86400); // keep entries for 1 hour; pref will be ignored by DNS resolver if using DoH/TRR
pref("network.ssl_tokens_cache_capacity", 10240); // increase TLS token caching (fast reconnects)

/** IMPLICIT OUTBOUND ***/
pref("network.dns.disablePrefetch", true);
pref("network.prefetch-next", false);
pref("network.predictor.enabled", false);
pref("network.predictor.enable-prefetch", false);

/** EXPERIMENTAL ***/
pref("layout.css.grid-template-masonry-value.enabled", true); // CSS Masonry Layout
pref("dom.enable_web_task_scheduling", true); // Prioritized Task Scheduling API
pref("layout.css.has-selector.enabled", true); // CSS has selector

/****************************************************************************
 * SECTION: SECUREFOX                                                       *
****************************************************************************/
/** TRACKING PROTECTION ***/
pref("network.http.referer.disallowCrossSiteRelaxingDefault.top_navigation", true); // enabled with ETP "Strict"; Referer: ignore ‘unsafe-url’, ‘no-referrer-when-downgrade’ and ‘origin-when-cross-origin’ for cross-site requests
pref("privacy.query_stripping.enabled", true); // Query Stripping; Umbra doesn't do this natively at this time
pref("privacy.query_stripping.enabled.pbmode", true);
pref("privacy.firstparty.isolate", false); // keep FPI user-selectable in settings
pref("network.cookie.cookieBehavior", 5); // dFPI by default (partition foreign cookies)
pref("network.cookie.cookieBehavior.pbmode", 5); // keep dFPI in Private Browsing
pref("privacy.partition.network_state.ocsp_cache", true); // enabled with ETP "Strict"; network partitioning OSCP cache
pref("extensions.webcompat.enable_shims", true); // enabled with ETP "Strict"; Smart Block shimming
pref("network.cookie.sameSite.noneRequiresSecure", true);
pref("browser.download.start_downloads_in_tmp_dir", true);
pref("browser.helperApps.deleteTempFileOnExit", true);
pref("browser.uitour.enabled", false); // disable UITour backend so there is no chance that a remote page can use it
pref("privacy.globalprivacycontrol.enabled", true); // Global Privacy Control

/** OCSP & CERTS / HPKP ***/
pref("security.OCSP.enabled", 0); // disable OCSP fetching to confirm current validity of certificates
pref("security.remote_settings.crlite_filters.enabled", false);
pref("security.pki.crlite_mode", 0); // disable CRLite fetches by default; users can opt in

/** SSL / TLS ***/
pref("security.tls.version.min", 3); // TLS 1.2 minimum
pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
pref("browser.xul.error_pages.expert_bad_cert", true);
pref("security.tls.enable_0rtt_data", false);
pref("network.http.http3.enable_kyber", true);
pref("security.tls.enable_kyber", true);

/** DISK AVOIDANCE ***/
pref("browser.privatebrowsing.forceMediaMemoryCache", true); // disable media cache from writing to disk in Private Browsing (Stealth Mode)

/** SHUTDOWN & SANITIZING ***/
pref("privacy.history.custom", true);

/** SEARCH / URL BAR ***/
pref("browser.search.separatePrivateDefault.ui.enabled", true); // Enable a seperate search engine for Private Windows
pref("browser.urlbar.update2.engineAliasRefresh", true); // enable "Add" button under search engine menu
pref("browser.search.suggest.enabled", false); // Live search engine suggestions (Google, Bing, etc.)
pref("browser.formfill.enable", false); // disable Search and Form history
pref("security.insecure_connection_text.enabled", true);
pref("security.insecure_connection_text.pbmode.enabled", true);
pref("network.IDN_show_punycode", true);  // Enforce Punycode for Internationalized Domain Names to eliminate possible spoofing

/** HTTPS-ONLY MODE ***/
pref("dom.security.https_only_mode", true); // force HTTPS-only connections (#367)
pref("dom.security.https_only_mode_error_page_user_suggestions", true);

/** DNS-over-HTTPS (DOH) ***/
pref("network.trr.mode", 5); // DNS-over-HTTPS (DOH) off by default; users can opt in

/** PASSWORDS ***/
pref("signon.rememberSignons", true); // enable built-in password manager saving
pref("signon.formlessCapture.enabled", false);
pref("signon.privateBrowsingCapture.enabled", false);
pref("network.auth.subresource-http-auth-allow", 1); // don't allow cross-origin sub-resources to open HTTP authentication credentials dialogs
pref("editor.truncate_user_pastes", false);

/** ADDRESS + CREDIT CARD MANAGER ***/
pref("extensions.formautofill.addresses.enabled", false);
pref("extensions.formautofill.creditCards.enabled", false);

/** MIXED CONTENT + CROSS-SITE ***/
pref("security.mixed_content.block_display_content", true);
pref("security.mixed_content.upgrade_display_content", true);
pref("security.mixed_content.upgrade_display_content.image", true);
pref("pdfjs.enableScripting", false); // deny PDFs to load javascript
pref("extensions.postDownloadThirdPartyPrompt", false); // 3rd party extension install prompts

/** HEADERS / REFERERS ***/
pref("network.http.referer.XOriginTrimmingPolicy", 2); // cross-origin referers = scheme+host+port

/** CONTAINERS ***/
pref("privacy.userContext.ui.enabled", true); // enable Containers UI

/** WEBRTC ***/
pref("privacy.webrtc.globalMuteToggles", true); // Microphone and camera kill switch (#370)
pref("media.peerconnection.ice.proxy_only_if_behind_proxy", true); // force WebRTC inside the proxy, if one is used
pref("media.peerconnection.ice.default_address_only", true); // when using a system-wide proxy, it uses the proxy interface

/** GOOGLE SAFE BROWSING (GSB) ***/
pref("browser.safebrowsing.downloads.remote.enabled", false); // enabled except for report checks

/** MOZILLA ***/
pref("permissions.default.desktop-notification", 2); // block desktop notifications
// Geolocation URL (see #187, #405)
//pref("geo.provider.network.url", "https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%");
//pref("geo.provider.ms-windows-location", false); // WINDOWS
//pref("geo.provider.use_corelocation", false); // MAC
//pref("geo.provider.use_gpsd", false); // LINUX
//pref("geo.provider.use_geoclue", false); // [FF102+] LINUX
//pref("browser.region.update.enabled", false);

/****************************************************************************
 * SECTION: PESKYFOX                                                        *
****************************************************************************/
/** UI ***/
pref("browser.translations.enable", false); // disable Translate Page entry and full-page translation UI
pref("browser.translations.select.enable", false); // disable "Translate Selection" UI
pref("extensions.translations.disabled", true); // hide Firefox Translations settings section

/** COOKIE BANNER HANDLING ***/
pref("cookiebanners.service.mode", 1);
pref("cookiebanners.service.mode.privateBrowsing", 1);

/** FULLSCREEN ***/
pref("full-screen-api.transition-duration.enter", "50 50"); // transition time (instant)
pref("full-screen-api.transition-duration.leave", "50 50");  // transition time (instant)
pref("full-screen-api.warning.delay", 0); // fullscreen notice (disable)
pref("full-screen-api.warning.timeout", 0); // fullscreen notice (disable)

/** URL BAR ***/
pref("browser.urlbar.trimHttps", true); // hide https:// in displayed URL
pref("browser.urlbar.untrimOnUserInteraction.featureGate", true); // show full URL when interacting with the URL bar

// Dropdown options in the URL bar
pref("browser.urlbar.suggest.bookmark", true);
pref("browser.urlbar.suggest.engines", false);
pref("browser.urlbar.suggest.history", true);
pref("browser.urlbar.suggest.openpage", false);
pref("browser.urlbar.suggest.searches", false);
pref("browser.urlbar.suggest.topsites", false);
// enable features in URL bar
pref("browser.urlbar.suggest.engines", false);
// pref("browser.urlbar.suggest.topsites", false);
pref("browser.urlbar.suggest.calculator", true);
pref("browser.urlbar.unitConversion.enabled", true);
pref("browser.urlbar.trending.featureGate", false); // disable trending searches

/** NEW TAB PAGE ***/
pref("browser.toolbars.bookmarks.visibility", "never"); 

/** DOWNLOADS ***/
// [SETTING] General>Downloads>Always ask you where to save files
//pref("browser.download.useDownloadDir", false); // always ask where to download
// [SETTING] General>Files and Applications>What should Firefox do with other files
pref("browser.download.always_ask_before_handling_new_types", true); // enable user interaction for security by always asking how to handle new mimetypes

/** PDF ***/
pref("browser.download.open_pdf_attachments_inline", true);

/** TAB BEHAVIOR ***/
pref("browser.tabs.loadBookmarksInTabs", true); // load bookmarks in tabs
pref("browser.menu.showViewImageInfo", true);
pref("findbar.highlightAll", true); // Show all matches in Findbar

/****************************************************************************
 * END: BETTERFOX                                                           *
****************************************************************************/

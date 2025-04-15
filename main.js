/**
 * Better AutoClicker - An enhanced mod for Cookie Clicker
 * © 2025 Teyko / Théo Vln
 *
 * This work is licensed under CC BY-NC-SA 4.0
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 * You are free to:
 * - Share and adapt the material
 * Under the following terms:
 * - Attribution: You must give appropriate credit
 * - NonCommercial: You may not use this for commercial purposes
 * - ShareAlike: If you remix or transform, you must distribute under the same license
 */

if(BetterAutoClicker === undefined) var BetterAutoClicker = {};

// Basic information about the mod
BetterAutoClicker.name = "Better AutoClicker";
BetterAutoClicker.version = "0.0.0"; // Initial placeholder version
BetterAutoClicker.GameVersion = "2.053";

// URL to the core.js file
BetterAutoClicker.coreUrl = "https://raw.githack.com/Teyk0o/better-autoclicker/master/core.js";

// GitHub API URL to check for latest release/tag
BetterAutoClicker.apiUrl = "https://api.github.com/repos/Teyk0o/better-autoclicker/tags";

// For update tracking
BetterAutoClicker.lastCheck = 0;
BetterAutoClicker.checkInterval = 1000 * 60 * 60; // Check for updates every hour
BetterAutoClicker.isFirstLaunch = true;

BetterAutoClicker.init = function() {
    // First check the current version from GitHub
    this.getCurrentVersion(() => {
        // Then load the core mod code
        console.log("BetterAutoClicker: Loading version " + this.version);
        Game.LoadMod(this.coreUrl + "?v=" + this.version + "&game=" + this.GameVersion + "&t=" + Date.now());

        // Setup periodic update checks
        setInterval(function() {
            BetterAutoClicker.checkForUpdate();
        }, this.checkInterval);
    });
};

BetterAutoClicker.getCurrentVersion = function(callback) {
    // Get the latest version from GitHub
    fetch(this.apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to get current version: " + response.status);
            }
            return response.json();
        })
        .then(tags => {
            if (tags && tags.length > 0) {
                // Get latest tag (first in the list) and set it as current version
                this.version = tags[0].name;
                console.log("BetterAutoClicker: The current version is " + this.version);

                if (callback) callback();
            } else {
                if (callback) callback();
            }
        })
        .catch(error => {
            console.error("BetterAutoClicker: Error getting current version:", error);
            if (callback) callback();
        });
};

BetterAutoClicker.checkForUpdate = function() {
    // Skip first check after initialization since we just got the version
    if (this.isFirstLaunch) {
        this.isFirstLaunch = false;
        this.lastCheck = Date.now();
        return;
    }

    const now = Date.now();

    // Only check if minimum interval has passed
    if (now - this.lastCheck < this.checkInterval) return;

    this.lastCheck = now;

    // Check GitHub API for latest tag
    fetch(this.apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to check for updates: " + response.status);
            }
            return response.json();
        })
        .then(tags => {
            if (tags && tags.length > 0) {
                // Get latest tag (first in the list)
                const latestTag = tags[0].name;

                // Compare with current version
                if (latestTag !== this.version) {
                    console.log(`BetterAutoClicker: New version available (${latestTag})`);
                    this.notifyUpdate(latestTag);
                } else {
                    console.log("BetterAutoClicker: Already on latest version");
                }
            }
        })
        .catch(error => {
            console.error("BetterAutoClicker: Error checking for updates:", error);
        });
};

BetterAutoClicker.notifyUpdate = function(newVersion) {
    // Show notification to the user
    Game.Notify(
        "Better AutoClicker Update Available",
        `Version ${newVersion} is available. Please refresh the game to update. (CTRL+R or CMD+R)`,
        [16, 5],
        10, // Longer duration so user has time to see it
        true // Sticky notification that stays until clicked
    );
};

// Initialize the loader
if (!BetterAutoClicker.initialized) {
    BetterAutoClicker.init();
    BetterAutoClicker.initialized = true;
}
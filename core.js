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
if(typeof CCSE == 'undefined') Game.LoadMod('https://raw.githack.com/Teyk0o/better-autoclicker/master/CCSE/main.js');

BetterAutoClicker.name = "Better AutoClicker";
BetterAutoClicker.version = "1.0";
BetterAutoClicker.GameVersion = "2.052";

BetterAutoClicker.launch = function() {
    // Configuration variables
    BetterAutoClicker.clicksPerSecond = 10;
    BetterAutoClicker.isActive = false;
    BetterAutoClicker.clickInterval = null;
    BetterAutoClicker.clicksInBackground = true;
    BetterAutoClicker.centerAnimations = true;
    BetterAutoClicker.originalMouseX = 0;
    BetterAutoClicker.originalMouseY = 0;
    BetterAutoClicker.clickGoldenCookies = true;
    BetterAutoClicker.clickWrathCookies = false;
    BetterAutoClicker.goldenCheckInterval = null;
    BetterAutoClicker.goldenCheckIntervalTime = 50;
    BetterAutoClicker.clickWrinklers = false;
    BetterAutoClicker.wrinklerClickDelay = 1000;
    BetterAutoClicker.wrinklerCheckInterval = null;
    BetterAutoClicker.clickSeasonalCookies = true;
    BetterAutoClicker.seasonalCheckInterval = null;
    BetterAutoClicker.autoManageChocolateEgg = false;
    BetterAutoClicker.chocolateEggBehavior = 'ascension';
    BetterAutoClicker.chocolateEggCheckInterval = null;
    BetterAutoClicker.clickFortunes = false;
    BetterAutoClicker.fortuneCheckInterval = null;

    // List of available languages for the selector
    BetterAutoClicker.userLanguage = 'EN';
    BetterAutoClicker.availableLanguages = [
        {code: 'EN', name: 'English'},
        {code: 'FR', name: 'Français'},
        {code: 'DE', name: 'Deutsch'},
        {code: 'NL', name: 'Nederlands'},
        {code: 'CS', name: 'Česky'},
        {code: 'PL', name: 'Polski'},
        {code: 'IT', name: 'Italiano'},
        {code: 'ES', name: 'Español'},
        {code: 'PT-BR', name: 'Português'},
        {code: 'ZH-CN', name: '中文'},
        {code: 'JA', name: '日本語'},
        {code: 'KO', name: '한국어'},
        {code: 'RU', name: 'Русский'}
    ];

    /**
     * Load the language file from the CDN
     * @param langCode
     */
    BetterAutoClicker.loadLanguageFile = function(langCode) {
        const langUrl = `https://cdn.jsdelivr.net/gh/Teyk0o/better-autoclicker@master/lang/${langCode.toLowerCase()}.json`;

        // Fetch the language file on the CDN
        fetch(langUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error while loading the land file: ${response.status}`);
                }
                return response.json();
            })
            .then(langData => {
                // Update the localization object with the loaded language data
                this.localization[langCode] = langData;

                // Update the user interface language if the current language matches
                if (this.userLanguage === langCode) {
                    this.updateUILanguage();
                }
            })
            .catch(error => {
                console.error(`Error while loading lang file ${langCode}:`, error);
                // Try to load the default English language file if the specified one fails
                if (langCode !== 'EN') {
                    this.loadLanguageFile('EN');
                }
            });
    };

    /**
     * Initializes the language system
     */
    BetterAutoClicker.initLanguages = function() {
        this.localization = {};

        // Load the default English language file
        this.loadLanguageFile('EN');

        // Load the user's preferred language if it's not English
        if (this.userLanguage !== 'EN') {
            this.loadLanguageFile(this.userLanguage);
        }
    };

    BetterAutoClicker.initLanguages();

    /**
     * Gets the current mod language based on preferences
     */
    BetterAutoClicker.getLanguage = function() {
        // If the user has chosen a specific language (different from 'auto')
        if (this.userLanguage !== 'auto' && this.localization && this.localization[this.userLanguage]) {
            return this.userLanguage;
        }

        // Otherwise, use the game language if available
        if (Game.language && this.localization && this.localization[Game.language]) {
            return Game.language;
        }

        // Fallback to English if no other option is viable
        return 'EN';
    };

    /**
     * Sets the user language and updates the interface
     */
    BetterAutoClicker.setLanguage = function(langCode) {
        // Sauvegarder la nouvelle langue
        this.userLanguage = langCode;

        // Vérifier si les traductions pour cette langue sont déjà chargées
        if (!this.localization[langCode]) {
            this.loadLanguageFile(langCode);
        } else {
            // Mettre à jour l'interface
            this.updateUILanguage();

            // Notification de changement de langue
            Game.Notify(
                this.getText('languageChanged'),
                this.getText('languageInfo'),
                [16, 5],
                3
            );
        }
    };

    /**
     * Updates the user interface with the current language
     */
    BetterAutoClicker.updateUILanguage = function() {
        // Update options in the game menu
        if (Game.onMenu === 'prefs') {
            // Force an update of the Options menu
            Game.UpdateMenu();
        }
    };

    /**
     * Retrieves a translation by its key in the current language
     */
    BetterAutoClicker.getText = function(key) {
        const lang = this.getLanguage();
        if (this.localization && this.localization[lang] && this.localization[lang][key]) {
            return this.localization[lang][key];
        }
        // Fallback to English if translation doesn't exist
        if (this.localization && this.localization['EN'] && this.localization['EN'][key]) {
            return this.localization['EN'][key];
        }
        return key; // Last resort: return the key itself
    };

    /**
     * Replaces parameters in a string
     */
    BetterAutoClicker.formatString = function(str, ...args) {
        return str.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };

    /**
     * Injects mod options into the game's Options menu
     */
    BetterAutoClicker.injectGameOptions = function() {
        // Ensure Game.customOptionsMenu exists
        if (!Game.customOptionsMenu) {
            Game.customOptionsMenu = [];
        }

        // Reference to our mod instance
        let self = this;

        // Add our options to the menu
        Game.customOptionsMenu.push(() => {
            // Create a main container with style
            let box = document.createElement("div");
            box.style.border = "1px solid #333";
            box.style.padding = "10px";
            box.style.marginBottom = "15px";

            // Section title
            let title = document.createElement("div");
            title.className = "title";
            title.style.marginBottom = "5px";
            title.textContent = this.getText('betterAutoClickerOptions');
            box.appendChild(title);

            // Activation button using game style
            let toggleButton = document.createElement('a');
            toggleButton.id = 'autoClickerToggle';
            toggleButton.className = 'option smallFancyButton';
            toggleButton.textContent = this.isActive ?
                this.getText('deactivate') :
                this.getText('activate');
            toggleButton.style.background = this.isActive ? '#CC0000' : '#5C4317';

            toggleButton.addEventListener('click', () => {
                this.toggleAutoClicker();
                // Update button text after toggle
                toggleButton.textContent = this.isActive ?
                    this.getText('deactivate') :
                    this.getText('activate');

                Game.PlaySound('snd/tick.mp3');
            });

            let toggleDiv = document.createElement('div');
            toggleDiv.className = 'listing';
            toggleDiv.appendChild(toggleButton);

            // Keyboard hint
            let hint = document.createElement('small');
            hint.textContent = ' ' + this.getText('keyboardHint');
            hint.style.opacity = '0.7';
            toggleDiv.appendChild(hint);

            box.appendChild(toggleDiv);

            // Speed control
            let speedControl = document.createElement('div');
            speedControl.className = "listing";
            speedControl.style.marginTop = '5px';

            // Label
            let speedLabel = document.createElement('span');
            speedLabel.textContent = this.getText('clicksPerSecond') + ' ';
            speedControl.appendChild(speedLabel);

            // Speed input
            let speedInput = document.createElement('input');
            speedInput.type = 'number';
            speedInput.id = 'autoClickerSpeed';
            speedInput.min = '1';
            speedInput.max = '100000';
            speedInput.value = this.clicksPerSecond;
            speedInput.style.width = '40px';
            speedInput.style.marginLeft = '5px';
            speedInput.addEventListener('change', () => {
                const newSpeed = parseInt(speedInput.value, 10);
                if (newSpeed >= 1 && newSpeed <= 10000) {
                    this.clicksPerSecond = newSpeed;
                    if (this.isActive) {
                        // Update currently running interval
                        this.stopAutoClicker();
                        this.startAutoClicker();
                    }
                    this.saveSettings();
                }
            });
            speedControl.appendChild(speedInput);
            box.appendChild(speedControl);

            // Options with Game-style buttons
            let optionsDiv = document.createElement('div');
            box.appendChild(optionsDiv);

            // Create game-style toggle buttons
            const createToggleButton = (id, property, onText, offText) => {
                let buttonDiv = document.createElement('div');
                buttonDiv.className = 'listing';

                let button = document.createElement('a');
                button.id = id;
                button.className = 'option smallFancyButton prefButton' + (this[property] ? '' : ' off');
                button.textContent = this[property] ? onText : offText;

                button.addEventListener('click', () => {
                    this[property] = !this[property];
                    button.textContent = this[property] ? onText : offText;

                    if (this[property]) {
                        button.classList.remove('off');
                    } else {
                        button.classList.add('off');
                    }

                    // Handle specific actions for each option
                    if (id === 'backgroundClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'backgroundEnabled' : 'backgroundDisabled'),
                            this.getText(this[property] ? 'backgroundWill' : 'backgroundWont') + ' ' +
                            this.getText('backgroundWhenInactive'),
                            [0, this[property] ? 2 : 3],
                            2
                        );
                    }
                    else if (id === 'centerAnimations') {
                        Game.Notify(
                            this.getText(this[property] ? 'animationsEnabled' : 'animationsDisabled'),
                            this.getText(this[property] ? 'animationsWill' : 'animationsWont') + ' ' +
                            this.getText('atCookieCenter'),
                            [0, this[property] ? 2 : 3],
                            2
                        );
                    }
                    else if (id === 'goldenCookieClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'goldenCookieEnabled' : 'goldenCookieDisabled'),
                            this.getText(this[property] ? 'goldenCookiesWill' : 'goldenCookiesWont'),
                            [0, this[property] ? 2 : 3],
                            2
                        );

                        // Start or stop golden cookie checking
                        if (this.isActive) {
                            if (this[property]) {
                                this.startGoldenCookieChecker();
                            } else {
                                this.stopGoldenCookieChecker();
                            }
                        }
                    }
                    else if (id === 'wrathCookieClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'wrathCookieEnabled' : 'wrathCookieDisabled'),
                            this.getText(this[property] ? 'wrathCookiesWill' : 'wrathCookiesWont'),
                            [0, this[property] ? 2 : 3],
                            2
                        );
                    }
                    else if (id === 'wrinklerClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'wrinklerClickEnabled' : 'wrinklerClickDisabled'),
                            this.getText(this[property] ? 'wrinklersWill' : 'wrinklersWont'),
                            [0, this[property] ? 2 : 3],
                            2
                        );

                        // Start or stop Wrinkler checking
                        if (this.isActive) {
                            if (this[property]) {
                                this.startWrinklerChecker();
                            } else {
                                this.stopWrinklerChecker();
                            }
                        }

                        // Show/hide delay control based on button state
                        wrinklerDelayControl.style.display = this[property] ? 'block' : 'none';
                    }
                    else if (id === 'seasonalCookieClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'seasonalCookieEnabled' : 'seasonalCookieDisabled'),
                            this.getText(this[property] ? 'seasonalCookiesWill' : 'seasonalCookiesWont'),
                            [0, this[property] ? 2 : 3],
                            2
                        );

                        // Start or stop seasonal cookie checking
                        if (this.isActive) {
                            if (this[property]) {
                                this.startSpecialCookieChecker();
                            } else {
                                this.stopSpecialCookieChecker();
                            }
                        }
                    }
                    else if (id === 'chocolateEggOption') {
                        const newState = this[property];

                        chocolateEggStrategyControl.style.display = newState ? 'block' : 'none';
                        chocolateEggExplanationBox.style.display = newState ? 'block' : 'none';

                        Game.Notify(
                            this.getText(newState ? 'chocolateEggEnabled' : 'chocolateEggDisabled'),
                            this.getText(this.chocolateEggBehavior === 'ascension' ? 'chocolateEggWillSave' : 'chocolateEggWillBuy'),
                            [0, newState ? 2 : 3],
                            2
                        );

                        // Start or stop chocolate egg checking
                        if (this.isActive) {
                            if (newState) {
                                this.startChocolateEggChecker();
                            } else {
                                this.stopChocolateEggChecker();
                            }
                        }
                    }
                    else if (id === 'fortuneClicking') {
                        Game.Notify(
                            this.getText(this[property] ? 'fortuneEnabled' : 'fortuneDisabled'),
                            this.getText(this[property] ? 'fortunesWill' : 'fortunesWont'),
                            [0, this[property] ? 2 : 3],
                            2
                        );

                        if (this.isActive) {
                            if (this[property]) {
                                this.startFortuneChecker();
                            } else {
                                this.stopFortuneChecker();
                            }
                        }
                    }

                    this.saveSettings();

                    Game.PlaySound('snd/tick.mp3');
                });

                buttonDiv.appendChild(button);
                return buttonDiv;
            };

            // Option for background clicking
            optionsDiv.appendChild(createToggleButton(
                'backgroundClicking',
                'clicksInBackground',
                this.getText('backgroundOption') + ' ' + this.getText('activate'),
                this.getText('backgroundOption') + ' ' + this.getText('deactivate')
            ));

            // Option for centering animations
            optionsDiv.appendChild(createToggleButton(
                'centerAnimations',
                'centerAnimations',
                this.getText('centerOption') + ' ' + this.getText('activate'),
                this.getText('centerOption') + ' ' + this.getText('deactivate')
            ));

            // Option for golden cookies
            optionsDiv.appendChild(createToggleButton(
                'goldenCookieClicking',
                'clickGoldenCookies',
                this.getText('goldenCookieOption') + ' ' + this.getText('activate'),
                this.getText('goldenCookieOption') + ' ' + this.getText('deactivate')
            ));

            // Option for wrath cookies
            optionsDiv.appendChild(createToggleButton(
                'wrathCookieClicking',
                'clickWrathCookies',
                this.getText('wrathCookieOption') + ' ' + this.getText('activate'),
                this.getText('wrathCookieOption') + ' ' + this.getText('deactivate')
            ));

            // Option for Wrinklers
            optionsDiv.appendChild(createToggleButton(
                'wrinklerClicking',
                'clickWrinklers',
                this.getText('wrinklerOption') + ' ' + this.getText('activate'),
                this.getText('wrinklerOption') + ' ' + this.getText('deactivate')
            ));

            // Control for Wrinkler click delay
            let wrinklerDelayControl = document.createElement('div');
            wrinklerDelayControl.className = 'listing';
            wrinklerDelayControl.style.marginLeft = '20px';
            wrinklerDelayControl.style.display = this.clickWrinklers ? 'block' : 'none';

            // Label for delay
            let wrinklerDelayLabel = document.createElement('span');
            wrinklerDelayLabel.textContent = this.getText('wrinklerClickDelay') + ' ';
            wrinklerDelayControl.appendChild(wrinklerDelayLabel);

            // Input for delay
            let wrinklerDelayInput = document.createElement('input');
            wrinklerDelayInput.type = 'number';
            wrinklerDelayInput.id = 'wrinklerClickDelay';
            wrinklerDelayInput.min = '100';
            wrinklerDelayInput.max = '5000';
            wrinklerDelayInput.step = '100';
            wrinklerDelayInput.value = this.wrinklerClickDelay;
            wrinklerDelayInput.style.width = '60px';
            wrinklerDelayInput.style.marginLeft = '5px';
            wrinklerDelayInput.addEventListener('change', () => {
                const newDelay = parseInt(wrinklerDelayInput.value, 10);
                if (newDelay >= 100 && newDelay <= 5000) {
                    this.wrinklerClickDelay = newDelay;
                    Game.Notify(
                        this.getText('wrinklerDelayChanged'),
                        this.formatString(this.getText('wrinklerDelayChangedDesc'), this.wrinklerClickDelay),
                        [0, 2],
                        2
                    );
                    this.saveSettings();
                }
            });
            wrinklerDelayControl.appendChild(wrinklerDelayInput);
            wrinklerDelayControl.appendChild(document.createTextNode(' ms'));
            optionsDiv.appendChild(wrinklerDelayControl);

            // Option for seasonal cookies
            optionsDiv.appendChild(createToggleButton(
                'seasonalCookieClicking',
                'clickSeasonalCookies',
                this.getText('seasonalCookieOption') + ' ' + this.getText('activate'),
                this.getText('seasonalCookieOption') + ' ' + this.getText('deactivate')
            ));

            // Option for chocolate egg
            optionsDiv.appendChild(createToggleButton(
                'chocolateEggOption',
                'autoManageChocolateEgg',
                this.getText('chocolateEggOption') + ' ' + this.getText('activate'),
                this.getText('chocolateEggOption') + ' ' + this.getText('deactivate')
            ));

            // Control for Chocolate Egg strategy
            let chocolateEggStrategyControl = document.createElement('div');
            chocolateEggStrategyControl.className = 'listing';
            chocolateEggStrategyControl.style.marginLeft = '20px';
            chocolateEggStrategyControl.style.display = this.autoManageChocolateEgg ? 'block' : 'none';

            // Label for strategy
            let chocolateEggStrategyLabel = document.createElement('span');
            chocolateEggStrategyLabel.textContent = this.getText('chocolateEggStrategyLabel') + ' ';
            chocolateEggStrategyControl.appendChild(chocolateEggStrategyLabel);

            // Selector for strategy
            let chocolateEggStrategySelect = document.createElement('select');
            chocolateEggStrategySelect.id = 'chocolateEggStrategy';
            chocolateEggStrategySelect.style.marginLeft = '5px';

            // Option: Save for ascension
            let strategyAscension = document.createElement('option');
            strategyAscension.value = 'ascension';
            strategyAscension.textContent = this.getText('chocolateEggStrategyAscension');
            strategyAscension.selected = this.chocolateEggBehavior === 'ascension';
            chocolateEggStrategySelect.appendChild(strategyAscension);

            // Option: Buy immediately
            let strategyImmediate = document.createElement('option');
            strategyImmediate.value = 'immediate';
            strategyImmediate.textContent = this.getText('chocolateEggStrategyImmediate');
            strategyImmediate.selected = this.chocolateEggBehavior === 'immediate';
            chocolateEggStrategySelect.appendChild(strategyImmediate);

            // Strategy change event
            chocolateEggStrategySelect.addEventListener('change', () => {
                this.chocolateEggBehavior = chocolateEggStrategySelect.value;

                // Update the explanation text based on the new strategy
                const explanationElement = document.getElementById('chocolateEggStrategyExplanation');
                if (explanationElement) {
                    explanationElement.innerHTML = this.getText(this.chocolateEggBehavior === 'ascension' ?
                        'chocolateEggStrategyExplanationAscension' :
                        'chocolateEggStrategyExplanationImmediate');
                }

                Game.Notify(
                    this.getText('chocolateEggOption'),
                    this.getText(this.chocolateEggBehavior === 'ascension' ? 'chocolateEggWillSave' : 'chocolateEggWillBuy'),
                    [0, 2],
                    2
                );

                this.saveSettings();
            });

            chocolateEggStrategyControl.appendChild(chocolateEggStrategySelect);
            optionsDiv.appendChild(chocolateEggStrategyControl);

            // Explanation box for the selected strategy
            let chocolateEggExplanationBox = document.createElement('div');
            chocolateEggExplanationBox.className = 'listing';
            chocolateEggExplanationBox.style.marginLeft = '20px';
            chocolateEggExplanationBox.style.marginTop = '8px';
            chocolateEggExplanationBox.style.padding = '8px';
            chocolateEggExplanationBox.style.backgroundColor = 'rgba(200, 0, 0, 0.1)';
            chocolateEggExplanationBox.style.border = '1px solid #800000';
            chocolateEggExplanationBox.style.borderRadius = '5px';
            chocolateEggExplanationBox.style.display = this.autoManageChocolateEgg ? 'block' : 'none';

            // Explanation text content
            let explanationText = document.createElement('div');
            explanationText.id = 'chocolateEggStrategyExplanation';
            explanationText.innerHTML = this.getText(this.chocolateEggBehavior === 'ascension' ?
                'chocolateEggStrategyExplanationAscension' :
                'chocolateEggStrategyExplanationImmediate');
            chocolateEggExplanationBox.appendChild(explanationText);

            // Add the explanation box after the strategy control
            optionsDiv.appendChild(chocolateEggExplanationBox);

            // Option pour les fortunes
            optionsDiv.appendChild(createToggleButton(
                'fortuneClicking',
                'clickFortunes',
                this.getText('fortuneOption') + ' ' + this.getText('activate'),
                this.getText('fortuneOption') + ' ' + this.getText('deactivate')
            ));

            // Language options section
            let langBox = document.createElement("div");
            langBox.className = "listing";
            langBox.style.marginTop = "20px";
            langBox.style.marginBottom = "10px";

            // Create label and selector
            let langDiv = document.createElement("div");
            langDiv.className = "listing";

            let langLabel = document.createElement("span");
            langLabel.textContent = this.getText('languageOption') + " ";
            langDiv.appendChild(langLabel);

            // Language selector
            let langSelect = document.createElement("select");
            langSelect.style.marginLeft = "10px";
            langSelect.style.width = "200px";

            // Add options to the selector
            this.availableLanguages.forEach(lang => {
                let option = document.createElement("option");
                option.value = lang.code;
                option.textContent = lang.name;
                option.selected = this.userLanguage === lang.code;
                langSelect.appendChild(option);
            });

            // Listen for language changes
            langSelect.addEventListener("change", () => {
                this.setLanguage(langSelect.value);
                this.saveSettings();

                // Force update of the menu to reflect language changes
                Game.UpdateMenu();
            });

            langDiv.appendChild(langSelect);
            langBox.appendChild(langDiv);
            box.appendChild(langBox);

            // Discord section
            let discordBox = document.createElement("div");
            discordBox.className = "listing";
            discordBox.style.marginTop = "15px";
            discordBox.style.borderTop = "1px solid #333";
            discordBox.style.paddingTop = "8px";

            let discordTitle = document.createElement("div");
            discordTitle.className = "title";  // Utilisation du style de titre Cookie Clicker
            discordTitle.style.fontSize = "1.1em";
            discordTitle.textContent = this.getText('discordSupport');
            discordBox.appendChild(discordTitle);

            let discordText = document.createElement("div");
            discordText.textContent = this.getText('discordSupportDesc');
            discordText.style.marginBottom = "8px";
            discordBox.appendChild(discordText);

            let discordLink = document.createElement("a");
            discordLink.href = "https://discord.gg/HUQQD49ced";
            discordLink.target = "_blank";
            discordLink.className = "option smallFancyButton";  // Utilisation du style de bouton Cookie Clicker
            discordLink.textContent = this.getText('discordButton');
            discordLink.style.display = "inline-block";
            discordBox.appendChild(discordLink);

            box.appendChild(discordBox);

            // Add directly to the game menu
            l('menu').appendChild(box);
        });

        // Force update of Options menu if it's currently open
        if (Game.onMenu === 'prefs') {
            Game.UpdateMenu();
        }
    };

    /**
     * Check if the chocolate egg is available
     */
    BetterAutoClicker.startChocolateEggChecker = function() {
        if (this.chocolateEggCheckInterval) {
            clearInterval(this.chocolateEggCheckInterval);
        }

        const self = this;
        // Check for chocolate egg every 2 seconds
        this.chocolateEggCheckInterval = setInterval(function() {
            self.checkForChocolateEgg();
        }, 2000);
    };

    /**
     * Check if the chocolate egg is available and click it
     */
    BetterAutoClicker.stopChocolateEggChecker = function() {
        if (this.chocolateEggCheckInterval) {
            clearInterval(this.chocolateEggCheckInterval);
            this.chocolateEggCheckInterval = null;
        }
    };

    /**
     * Check for the chocolate egg and manage its purchase
     */
    BetterAutoClicker.checkForChocolateEgg = function() {
        // Check if the game is in Easter season
        if (Game.season !== 'easter') return;

        // Check if the chocolate egg is available
        let chocolateEgg = Game.UpgradesById[227]; // ID of the chocolate egg

        if (chocolateEgg && !chocolateEgg.bought && Game.HasUnlocked('Chocolate egg')) {
            // If the strategy is 'immediate', buy the chocolate egg
            if (this.chocolateEggBehavior === 'immediate') {
                // Check if we can buy the chocolate egg
                if (Game.cookies >= chocolateEgg.getPrice()) {
                    chocolateEgg.buy(true);
                    Game.Notify(
                        this.getText('chocolateEggBought'),
                        '',
                        [22, 12], // Icon for egg
                        2
                    );
                }
            } else {
                // Strategy is 'ascension', show a notification to advise the user
                Game.Notify(
                    this.getText('chocolateEggSaved'),
                    '',
                    [22, 12],
                    1
                );
            }
        }

        // Check if we are on the point of ascending
        if (this.chocolateEggBehavior === 'ascension' && Game.OnAscend) {
            // Check if we can buy the chocolate egg
            if (chocolateEgg && !chocolateEgg.bought && Game.HasUnlocked('Chocolate egg')) {

                // Sell all buildings if we are about to ascend and if we have the "Earth Shatterer" dragon aura
                if (Game.dragonAura === 5 || Game.dragonAura2 === 5) { // 5 is the ID for "Earth Shatterer"
                    // Sell all buildings to maximize cookies
                    this.sellAllBuildings();
                }

                // Buy the chocolate egg if we have enough cookies
                if (Game.cookies >= chocolateEgg.getPrice()) {
                    chocolateEgg.buy(true);
                    Game.Notify(
                        this.getText('chocolateEggAscensionBought'),
                        '',
                        [22, 12],
                        2
                    );
                }
            }
        }
    };

    /**
     * Start periodic checking for fortunes
     */
    BetterAutoClicker.startFortuneChecker = function() {
        if (this.fortuneCheckInterval) {
            clearInterval(this.fortuneCheckInterval);
        }

        const self = this;
        this.fortuneCheckInterval = setInterval(function() {
            self.checkForFortunes();
        }, 500);
    };

    /**
     * Stop checking for fortunes
     */
    BetterAutoClicker.stopFortuneChecker = function() {
        if (this.fortuneCheckInterval) {
            clearInterval(this.fortuneCheckInterval);
            this.fortuneCheckInterval = null;
        }
    };

    /**
     * Check for fortunes in the ticker
     */
    BetterAutoClicker.checkForFortunes = function() {
        // Check if the game has the "Fortune cookies" upgrade
        if (!Game.Has('Fortune cookies')) return;

        // Check if the fortune ticker is present
        const ticker = document.getElementById('commentsText');
        if (!ticker) return;

        // Check if the fortune is present in the ticker
        if (ticker.querySelector('.fortune')) {
            // Click on the fortune
            ticker.click();

            // Notification
            Game.Notify(
                this.getText('fortuneClicked'),
                this.getText('fortuneClickedDesc'),
                [0, 2],
                2
            );
        }
    };

    /**
     * Sell all buildings
     */
    BetterAutoClicker.sellAllBuildings = function() {
        // Iterate through all buildings and sell them from the last to the first
        for (let i = Game.ObjectsById.length - 1; i >= 0; i--) {
            let building = Game.ObjectsById[i];
            // While the building has a positive amount, sell it
            while (building.amount > 0) {
                building.sell(1);
            }
        }
    };

    /**
     * Register keyboard shortcut (A key)
     */
    BetterAutoClicker.registerKeyboardShortcut = function() {
        let self = this;
        window.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 'a') {
                self.toggleAutoClicker();
            }
        });
    };

    /**
     * Function to enable/disable the auto-clicker
     */
    BetterAutoClicker.toggleAutoClicker = function() {
        this.isActive = !this.isActive;
        const toggleButton = document.getElementById('autoClickerToggle');

        if (this.isActive) {
            this.startAutoClicker();
            // Also start the golden cookie checker if enabled
            if (this.clickGoldenCookies) {
                this.startGoldenCookieChecker();
            }

            // Also start the Wrinkler checker if enabled
            if (this.clickWrinklers) {
                this.startWrinklerChecker();
            }

            // Also start the chocolate egg checker if enabled
            if (this.autoManageChocolateEgg) {
                this.startChocolateEggChecker();
            }

            // Also start the fortune checker if enabled
            if (this.clickFortunes) {
                this.startFortuneChecker();
            }

            if (toggleButton) {
                toggleButton.textContent = this.getText('deactivate');
                toggleButton.style.background = '#CC0000';
            }

            // Notification with information on mode and state
            const backgroundState = this.clicksInBackground ? this.getText('backgroundWill') : this.getText('backgroundWont');
            Game.Notify(
                this.getText('autoClickerEnabled'),
                this.formatString(
                    this.getText('clicksPerSecDisplay'),
                    this.clicksPerSecond,
                    backgroundState.toLowerCase()
                ),
                [0, 2],
                3
            );
        } else {
            this.stopAutoClicker();
            // Also stop the golden cookie checker
            this.stopGoldenCookieChecker();

            // Also stop the Wrinkler checker
            this.stopWrinklerChecker();

            // Also stop the chocolate egg checker
            this.stopChocolateEggChecker();

            // Also stop the fortune checker
            this.stopFortuneChecker();

            if (toggleButton) {
                toggleButton.textContent = this.getText('activate');
                toggleButton.style.background = '#5C4317';
            }
            Game.Notify(
                this.getText('autoClickerDisabled'),
                this.getText('autoClickerDisabledDesc'),
                [0, 3],
                2
            );
        }
        this.saveSettings();
    };

    /**
     * Start the auto-clicker
     */
    BetterAutoClicker.startAutoClicker = function() {
        if (this.clickInterval) {
            clearInterval(this.clickInterval);
        }

        const clickDelay = 1000 / this.clicksPerSecond;
        const self = this;

        this.clickInterval = setInterval(function() {
            self.performClick();
        }, clickDelay);
    };

    /**
     * Stop the auto-clicker
     */
    BetterAutoClicker.stopAutoClicker = function() {
        if (this.clickInterval) {
            clearInterval(this.clickInterval);
            this.clickInterval = null;
        }
    };

    /**
     * Start periodic checking for golden cookies
     */
    BetterAutoClicker.startGoldenCookieChecker = function() {
        if (this.goldenCheckInterval) {
            clearInterval(this.goldenCheckInterval);
        }

        const self = this;
        this.goldenCheckInterval = setInterval(function() {
            self.checkForSpecialCookies();
        }, this.goldenCheckIntervalTime);
    };

    /**
     * Stop checking for golden cookies
     */
    BetterAutoClicker.stopGoldenCookieChecker = function() {
        if (this.goldenCheckInterval) {
            clearInterval(this.goldenCheckInterval);
            this.goldenCheckInterval = null;
        }
    };

    /**
     * Start periodic checking for special cookies (seasonal)
     */
    BetterAutoClicker.startSpecialCookieChecker = function() {
        if (this.seasonalCheckInterval) {
            clearInterval(this.seasonalCheckInterval);
        }

        const self = this;
        // Check for special cookies every 500 ms
        this.seasonalCheckInterval = setInterval(function() {
            self.checkForSpecialCookies();
        }, 500);
    };

    /**
     * Stop checking for special cookies
     */
    BetterAutoClicker.stopSpecialCookieChecker = function() {
        if (this.seasonalCheckInterval) {
            clearInterval(this.seasonalCheckInterval);
            this.seasonalCheckInterval = null;
        }
    };

    /**
     * Check if there are golden cookies on screen and click them
     */
    BetterAutoClicker.checkForSpecialCookies = function() {
        // Special cookies are stored in Game.shimmers
        if (Game.shimmers && Game.shimmers.length > 0) {
            for (let i = 0; i < Game.shimmers.length; i++) {
                let shimmer = Game.shimmers[i];
                // Check if it's a golden or wrath cookie
                if (shimmer.type === 'golden') {
                    // If it's a wrath cookie
                    if (shimmer.wrath > 0) {
                        if (this.clickWrathCookies) {
                            shimmer.pop();
                            Game.Notify(
                                this.getText('wrathCookieClicked'),
                                '',
                                [15, 5], // Wrath cookie icon
                                1 // Short duration
                            );
                            break;
                        }
                    }
                    // If it's a normal golden cookie
                    else if (shimmer.wrath === 0 && this.clickGoldenCookies) {
                        // Cookie doré normal
                        shimmer.pop();
                        Game.Notify(
                            this.getText('goldenCookieClicked'),
                            '',
                            [10, 14],
                            1
                        );
                        break;
                    }
                }
                // Check if it's a seasonal cookie (like reindeer for Christmas)
                else if (shimmer.type === 'reindeer' && this.clickSeasonalCookies) {
                    shimmer.pop();
                    Game.Notify(
                        this.getText('seasonalCookieClicked'),
                        this.getText('christmasReindeerClicked'),
                        [12, 9],
                        1
                    );
                    break;
                }
            }
        }
    };

    /**
     * Start periodic checking for Wrinklers
     */
    BetterAutoClicker.startWrinklerChecker = function() {
        if (this.wrinklerCheckInterval) {
            clearInterval(this.wrinklerCheckInterval);
        }

        const self = this;
        // Check for Wrinklers every 2 seconds
        this.wrinklerCheckInterval = setInterval(function() {
            self.checkForWrinklers();
        }, 2000);
    };

    /**
     * Stop checking for Wrinklers
     */
    BetterAutoClicker.stopWrinklerChecker = function() {
        if (this.wrinklerCheckInterval) {
            clearInterval(this.wrinklerCheckInterval);
            this.wrinklerCheckInterval = null;
        }
    };

    /**
     * Check if there are Wrinklers on screen and directly pop them
     */
    BetterAutoClicker.checkForWrinklers = function() {
        // Check if in Grandmapocalypse mode (otherwise no Wrinklers)
        if (Game.elderWrath <= 0) return;

        // Wrinklers are stored in Game.wrinklers
        if (Game.wrinklers) {
            for (let i = 0; i < Game.wrinklers.length; i++) {
                let wrinkler = Game.wrinklers[i];
                // Check if the Wrinkler is fully appeared (phase 2) and has cookies
                if (wrinkler.phase === 2 && wrinkler.sucked > 0) {
                    // Instead of clicking on it, pop it directly
                    this.popWrinklerDirectly(i);
                    // Only process one Wrinkler at a time
                    break;
                }
            }
        }
    };

    /**
     * Pop a Wrinkler directly without clicking
     * @param {number} id - ID of the Wrinkler to pop
     */
    BetterAutoClicker.popWrinklerDirectly = function(id) {
        // Check that the Wrinkler exists and is active
        if (Game.wrinklers[id] && Game.wrinklers[id].phase === 2) {
            // Save how many cookies it sucked for the notification
            const sucked = Game.wrinklers[id].sucked;

            // Access Cookie Clicker's internal mechanism to pop the Wrinkler
            Game.wrinklers[id].hp = 0; // Setting HP to 0 automatically triggers the pop

            // Notification
            const cookiesGained = sucked > 0 ? (": " + Beautify(sucked) + " cookies") : "";
            Game.Notify(
                this.getText('wrinklerPopped'),
                this.getText('wrinklerPoppedDesc') + cookiesGained,
                [19, 8], // Wrinkler icon
                2 // Medium duration
            );
        }
    };

    /**
     * Simulate a click on the cookie
     * Uses the appropriate method according to chosen options
     */
    BetterAutoClicker.performClick = function() {
        if (this.centerAnimations) {
            // Method with centered click simulations
            this.clickCookieAtCenter();
        } else {
            // Standard method that uses the internal function without specified position
            Game.ClickCookie();
        }
    };

    /**
     * Method to click at the center of the cookie
     * This method preserves mouse coordinates to avoid affecting other functionalities
     */
    BetterAutoClicker.clickCookieAtCenter = function() {
        // Get reference to the cookie
        const bigCookie = document.getElementById('bigCookie');

        if (!bigCookie) return; // Safety if cookie doesn't exist

        // Calculate coordinates of the cookie center
        const cookieRect = bigCookie.getBoundingClientRect();
        const centerX = Math.floor(cookieRect.left + cookieRect.width / 2);
        const centerY = Math.floor(cookieRect.top + cookieRect.height / 2);

        // IMPORTANT: Save real mouse coordinates before modifying them
        const realMouseX = Game.mouseX;
        const realMouseY = Game.mouseY;

        // Temporarily modify mouse coordinates for the click
        Game.mouseX = centerX;
        Game.mouseY = centerY;

        // Call the click function
        Game.ClickCookie();

        // IMPORTANT: Immediately restore real coordinates after clicking
        // to avoid interfering with other parts of the game (like tooltips)
        Game.mouseX = realMouseX;
        Game.mouseY = realMouseY;

        // Alternative approach for particle animation
        if (typeof Game.SpawnClickParticles === 'function') {
            // Special method to generate particles at the cookie center
            // without modifying global mouse coordinates
            this.spawnCenteredParticles(centerX, centerY);
        }
    };

    /**
     * Generate visual particles at the specified location
     * This function adds an additional visual effect to centered clicks
     * @param {number} x - X coordinate where to generate particles
     * @param {number} y - Y coordinate where to generate particles
     */
    BetterAutoClicker.spawnCenteredParticles = function(x, y) {
        // Add visual particles at the specified location
        for (let i = 0; i < 3; i++) { // Generate a few particles for visual effect
            Game.particleAdd(
                x + Math.random() * 8 - 4,  // Slightly random X position around center
                y + Math.random() * 8 - 4,  // Slightly random Y position around center
                Math.random() * 4 - 2,      // X velocity
                Math.random() * -2 - 2,     // Y velocity (upward)
                Math.random() * 0.5 + 0.2,  // Size
                1,                          // Lifespan
                2                           // Particle type
            );
        }
    };

    /**
     * Function to save mod parameters
     * This function is called by the game when saving state
     * @returns {string} Data serialized as JSON
     */
    BetterAutoClicker.save = function() {
        // Save parameters in JSON format
        return JSON.stringify({
            clicksPerSecond: this.clicksPerSecond,
            isActive: this.isActive,
            clicksInBackground: this.clicksInBackground,
            centerAnimations: this.centerAnimations,
            userLanguage: this.userLanguage,
            clickGoldenCookies: this.clickGoldenCookies,
            clickWrathCookies: this.clickWrathCookies,
            clickWrinklers: this.clickWrinklers,
            wrinklerClickDelay: this.wrinklerClickDelay,
            clickSeasonalCookies: this.clickSeasonalCookies,
            autoManageChocolateEgg: this.autoManageChocolateEgg,
            chocolateEggBehavior: this.chocolateEggBehavior,
            clickFortunes: this.clickFortunes
        });
    };

    /**
     * Function to save settings in localStorage
     */
    BetterAutoClicker.saveSettings = function() {
        const data = {
            clicksPerSecond: this.clicksPerSecond,
            isActive: this.isActive,
            clicksInBackground: this.clicksInBackground,
            centerAnimations: this.centerAnimations,
            userLanguage: this.userLanguage,
            clickGoldenCookies: this.clickGoldenCookies,
            clickWrathCookies: this.clickWrathCookies,
            clickWrinklers: this.clickWrinklers,
            wrinklerClickDelay: this.wrinklerClickDelay,
            clickSeasonalCookies: this.clickSeasonalCookies,
            autoManageChocolateEgg: this.autoManageChocolateEgg,
            chocolateEggBehavior: this.chocolateEggBehavior,
            clickFortunes: this.clickFortunes
        };

        localStorage.setItem('betterAutoClickerSettings', JSON.stringify(data));

        // Toujours essayer la méthode standard aussi
        if (!Game.customSave) Game.customSave = {};
        Game.customSave['betterautoclicker'] = this.save();
        Game.WriteSave(1);
    };

    /**
     * Function to load mod parameters
     * This function is called by the game when loading a save
     * @param {string} str - Serialized data to load
     */
    BetterAutoClicker.load = function(str) {
        try {
            const localData = localStorage.getItem('betterAutoClickerSettings');
            if (localData) {
                const config = JSON.parse(localData);

                // Load options
                this.clicksPerSecond = config.clicksPerSecond || 10;
                if (config.hasOwnProperty('clicksInBackground')) {
                    this.clicksInBackground = config.clicksInBackground;
                }
                if (config.hasOwnProperty('centerAnimations')) {
                    this.centerAnimations = config.centerAnimations;
                }
                // Load language preference
                if (config.hasOwnProperty('userLanguage')) {
                    this.userLanguage = config.userLanguage;
                }
                // Load golden cookie preference
                if (config.hasOwnProperty('clickGoldenCookies')) {
                    this.clickGoldenCookies = config.clickGoldenCookies;
                }
                if (config.hasOwnProperty('clickWrathCookies')) {
                    this.clickWrathCookies = config.clickWrathCookies;
                }
                if (config.hasOwnProperty('clickWrinklers')) {
                    this.clickWrinklers = config.clickWrinklers;
                }
                if (config.hasOwnProperty('wrinklerClickDelay')) {
                    this.wrinklerClickDelay = config.wrinklerClickDelay;
                }
                if (config.hasOwnProperty('clickSeasonalCookies')) {
                    this.clickSeasonalCookies = config.clickSeasonalCookies;
                }
                if (config.hasOwnProperty('autoManageChocolateEgg')) {
                    this.autoManageChocolateEgg = config.autoManageChocolateEgg;
                }
                if (config.hasOwnProperty('chocolateEggBehavior')) {
                    this.chocolateEggBehavior = config.chocolateEggBehavior;
                }
                if (config.hasOwnProperty('clickFortunes')) {
                    this.clickFortunes = config.clickFortunes;
                }
            }

            // Load the auto-clicker state
            const wasActive = (localStorage.getItem('betterAutoClickerSettings') ? JSON.parse(localStorage.getItem('betterAutoClickerSettings')).isActive : false);

            if (wasActive) {
                // Start the auto-clicker if it was active with delay to ensure the game is ready
                setTimeout(() => {
                    this.toggleAutoClicker();
                }, 1000);
            }
        } catch (e) {
            console.error("Error loading mod configuration:", e);
        }
    };

    // Track the actual mouse position
    let self = BetterAutoClicker;
    document.addEventListener('mousemove', function(e) {
        self.originalMouseX = e.clientX;
        self.originalMouseY = e.clientY;
    });

    // Initialize mod with short delay
    setTimeout(() => {
        // Register keyboard shortcut
        BetterAutoClicker.registerKeyboardShortcut();

        // Add mod to the game's Options menu
        BetterAutoClicker.injectGameOptions();

        // Initialization notification
        Game.Notify(
            BetterAutoClicker.getText('modLoaded'),
            BetterAutoClicker.getText('modLoadedDesc'),
            [16, 5]
        );

        // Load saved settings
        BetterAutoClicker.load();
    }, 1000);

    // Set isLoaded flag when initialization is complete
    BetterAutoClicker.isLoaded = 1;
};

if(!BetterAutoClicker.isLoaded){
    if(CCSE && CCSE.isLoaded){
        BetterAutoClicker.launch();
    }
    else{
        if(!CCSE) var CCSE = {};
        if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(BetterAutoClicker.launch);
    }
}
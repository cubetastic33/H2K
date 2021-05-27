let hiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ"
let katakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ"
let hiragana_regex = /[\u3041-\u3096]/ug;
let katakana_regex = /[\u30A1-\u30F6]/ug;

var from, to, from_regex;

// Update conversion settings based on mode
browser.storage.sync.get("mode").then(result => {
    if (result.mode === "k2h") {
        [from, to, from_regex] = [katakana, hiragana, katakana_regex];
    } else {
        [from, to, from_regex] = [hiragana, katakana, hiragana_regex];
    }
});

HTMLElement.prototype.textNodes = function() {
    return [...this.childNodes].filter((node) => {
        return (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "");
    });
}

function convert(from, to, from_regex) {
    if (document.body.innerText.match(from_regex)) {
        document.querySelectorAll("*").forEach(elem => {
            // The textNodes function won't be defined for images and stuff
            if (elem.textNodes) {
                elem.textNodes().forEach(node => {
                    let text = node.data;
                    for (let i = 0; i < from.length; i++) {
                        // Replace the `from` character with the `to` one
                        text = text.replaceAll(from[i], to[i]);
                    }
                    // Update the DOM with the new text
                    node.textContent = text;
                });
            }
        });
    }
}

const observer = new MutationObserver(list => {
    if (document.body.innerText.match(from_regex)) {
        list.forEach(mutation => {
            if (mutation.target.nodeType === Node.TEXT_NODE) {
                let text = mutation.target.data;
                if (text.match(from_regex)) {
                    for (let i = 0; i < from.length; i++) {
                        // Replace the `from` character with the `to` one
                        text = text.replaceAll(from[i], to[i]);
                    }
                    // Update the DOM with the new text
                    mutation.target.textContent = text;
                }
            } else {
                if (mutation.target.textNodes) {
                    mutation.target.textNodes().forEach(node => {
                        let text = node.data;
                        if (text.match(from_regex)) {
                            for (let i = 0; i < from.length; i++) {
                                // Replace the `from` character with the `to` one
                                text = text.replaceAll(from[i], to[i]);
                            }
                            // Update the DOM with the new text
                            node.textContent = text;
                        }
                    });
                }
                mutation.target.querySelectorAll("*").forEach(elem => {
                    if (elem.textNodes) {
                        elem.textNodes().forEach(node => {
                            let text = node.data;
                            if (text.match(from_regex)) {
                                for (let i = 0; i < from.length; i++) {
                                    // Replace the `from` character with the `to` one
                                    text = text.replaceAll(from[i], to[i]);
                                }
                                // Update the DOM with the new text
                                node.textContent = text;
                            }
                        });
                    }
                });
            }
        });
    }
});

// Function to parse hostname from a URL
function get_hostname(url) {
    if (url.includes("://")) {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === "string" && match[2].length > 0) {
            return match[2];
        } else {
            return null;
        }
    } else {
        // If the protocol is not specified in the URL
        return url.split("/")[0];
    }
}

// Function that returns the preferences for the given URL
function get_preferences(url, preferences) {
    if (preferences.overrides) {
        for (let i = 0; i < preferences.overrides.length; i++) {
            let override = preferences.overrides[i];
            if (override[1].length === 0) {
                // Empty rules shouldn't be counted
                break;
            } else if (override[0] === "starting") {
                // Check if the URL starts with this rule
                if (url.startsWith(override[1])) return [override[2], override[3]];
            } else if (override[0] === "domain") {
                // Check if the URL comes under this domain
                if (get_hostname(url) === get_hostname(override[1])) return [override[2], override[3]];
            } else if (override[0] === "regex") {
                // Check if the URL matches the regex
                let match = url.match(new RegExp(override[1]));
                if (match && url === match[0]) return [override[2], override[3]];
            } else if (override[0] === "exact") {
                // Check if the URL matches the rule
                if (url === override[1]) return [override[2], override[3]];
            }
        }
    }
    // The default values if nothing is set are `true` for both, hence the !== false
    return [preferences.startup !== false, preferences.update !== false];
}

browser.storage.local.get().then(result => {
    if (result.temporary_disable) {
        // We don't convert this time, but delete the variable so conversion works the next time
        browser.storage.local.remove("temporary_disable");
    } else {
        // Based on the preferences, convert and/or add mutations event listener
        browser.storage.sync.get().then(preferences => {
            let [startup, update] = get_preferences(location.href, preferences);
            if (update) {
                // Mutations event listener to run conversion on content update
                observer.observe(
                    document.body,
                    {childList: true, subtree: true, characterData: true, attributeFilter: ["hidden"]}
                );
            }
            // Update conversion settings based on mode
            [from, to, from_regex] = preferences.mode === "k2h" ? [katakana, hiragana, katakana_regex] : [hiragana, katakana, hiragana_regex];
            if (startup) convert(from, to, from_regex);
        });
    }
});

// Handle signals from the extension
browser.runtime.onMessage.addListener(message => {
    if (message.command === "convert") {
        // Run conversion
        browser.storage.sync.get("mode").then(preferences => {
            [from, to, from_regex] = preferences.mode === "k2h" ? [katakana, hiragana, katakana_regex] : [hiragana, katakana, hiragana_regex];
            convert(from, to, from_regex);
        });
    } else if (message.command === "reload_disabled") {
        // Set a variable before reloading so we know not to convert
        browser.storage.local.set({temporary_disable: true});
        location.reload();
    }
});

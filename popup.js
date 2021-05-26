// Function to save the settings to storage
function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        mode: document.querySelector("#mode").value,
        startup: document.querySelector("#startup").checked,
        update: document.querySelector("#update").checked,
    });
}

// Function to update DOM with the stored settings
function restoreOptions() {
    browser.storage.sync.get().then(result => {
        document.querySelector("#startup").checked = result.startup !== false;
        document.querySelector("#update").checked = result.update !== false;
        document.querySelector("#mode").selectedIndex = result.mode === "k2h";
    });
}

// Add event listeners to save the settings whenever a change is made
const inputs = [...document.getElementsByClassName("input")];
inputs.forEach(input => input.addEventListener("change", saveOptions));

document.getElementById("convert").onclick = () => {
    // Send a signal to the content script to convert
    browser.tabs.query({active: true, currentWindow: true})
        .then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, {command: "convert"});
        });
};

document.getElementById("reload").onclick = () => {
    // Send a signal to the content script to reload with conversion disabled
    browser.tabs.query({active: true, currentWindow: true})
        .then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, {command: "reload_disabled"});
        });
};

// Open the options page when the more options button is clicked
document.getElementById("more").onclick = () => browser.runtime.openOptionsPage();

// Update the inputs with the stored settings
document.addEventListener("DOMContentLoaded", restoreOptions);

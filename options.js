// Function to show a message in the UI
function showToast(message, timeout) {
    document.getElementById("toast").innerText = message;
    document.getElementById("toast").style = "display: block";

    setTimeout(() => document.getElementById("toast").style = "display: none", timeout || 3000);
}

// Function to save the settings to storage
function save_options(e) {
    e.preventDefault();
    // Iterate over the overrides
    let overrides = [];
    let rules = document.getElementsByClassName("row");
    for (let i = 0; i < rules.length; i++) {
        // Don't save empty rules
        if (rules[i].querySelector(".rule").value.length) {
            overrides.push([
                rules[i].querySelector("select").value,
                rules[i].querySelector(".rule").value,
                rules[i].querySelector(".startup").checked,
                rules[i].querySelector(".update").checked,
            ]);
        }
    }
    // Save the settings
    browser.storage.sync.set({
        mode: document.querySelector("#mode").value,
        startup: document.querySelector("#startup").checked,
        update: document.querySelector("#update").checked,
        overrides: overrides,
    });
    // Notify the user
    showToast("Saved");
}

// Function to update DOM with the stored settings
function restore_options() {
    browser.storage.sync.get().then(result => {
        document.querySelector("#startup").checked = result.startup !== false;
        document.querySelector("#update").checked = result.update !== false;
        document.querySelector("#mode").selectedIndex = result.mode === "k2h";

        if (result.overrides && result.overrides.length) {
            // Iterate over the overrides
            for (let i = 0, rule; rule = result.overrides[i]; i++) {
                let row = document.createElement("div");
                row.classList.add("row");
                row.innerHTML = `
                    <select>
                        <option value="starting">Starting with</option>
                        <option value="domain">Under domain</option>
                        <option value="regex">Matching regex</option>
                        <option value="exact">Exactly matches</option>
                    </select>
                    <input type="text" class="rule">
                    <label class="checkbox">
                        <input type="checkbox" class="startup">
                        <svg viewBox="0 0 21 21">
                            <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                        </svg>
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" class="update">
                        <svg viewBox="0 0 21 21">
                            <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                        </svg>
                    </label>
                    <div class="delete">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </div>`;
                let selectedIndex = ["starting", "domain", "regex", "exact"].indexOf(rule[0]);
                row.querySelector("select").selectedIndex = selectedIndex;
                row.querySelector(".rule").value = rule[1];
                row.querySelector(".startup").checked = rule[2];
                row.querySelector(".update").checked = rule[3];
                row.querySelector(".delete").onclick = deleteRule;
                document.getElementById("rules").appendChild(row);
            }
        } else {
            // If there are no overrides yet
            let row = document.createElement("div");
            row.classList.add("row");
            row.innerHTML = `
                <select>
                    <option value="starting">Starting with</option>
                    <option value="domain">Under domain</option>
                    <option value="regex">Matching regex</option>
                    <option value="exact">Exactly matches</option>
                </select>
                <input type="text" class="rule">
                <label class="checkbox">
                    <input type="checkbox" class="startup">
                    <svg viewBox="0 0 21 21">
                        <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                    </svg>
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="update">
                    <svg viewBox="0 0 21 21">
                        <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                    </svg>
                </label>
                <div class="delete">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </div>`;
            row.querySelector(".delete").onclick = deleteRule;
            document.getElementById("rules").appendChild(row);
        }
    });
}

function deleteRule(e) {
    e.currentTarget.parentNode.remove();
}

document.getElementById("add").onclick = () => {
    // Add a new override that the user can fill in
    let row = document.createElement("div");
    row.classList.add("row");
    row.innerHTML = `
        <select>
            <option value="starting">Starting with</option>
            <option value="domain">Under domain</option>
            <option value="regex">Matching regex</option>
            <option value="exact">Exactly matches</option>
        </select>
        <input type="text" class="rule">
        <label class="checkbox">
            <input type="checkbox" class="startup">
            <svg viewBox="0 0 21 21">
                <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
            </svg>
        </label>
        <label class="checkbox">
            <input type="checkbox" class="update">
            <svg viewBox="0 0 21 21">
                <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
            </svg>
        </label>
        <div class="delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </div>`;
    row.querySelector(".delete").onclick = deleteRule;
    document.getElementById("rules").appendChild(row);
};

document.addEventListener("DOMContentLoaded", restore_options);
document.querySelector("form").addEventListener("submit", save_options);

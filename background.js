// Send keyboard shortcut signals to the content script
browser.commands.onCommand.addListener(command => {
    browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, { command: command });
        });
});

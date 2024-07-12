const vscode = require('vscode');
const fetch = import('node-fetch').then(module => module.default);
const apikey = '7e533031-4076-4716-949b-81ba3b6a8216';

function activate(context) {
    let disposable = vscode.commands.registerCommand('something.helloWorld', async function () {
        // Replace ':slackId' with the actual slackId you want to use
        const slackId = 'U079HV9PTC7';
        const url = `https://hackhour.hackclub.com/api/session/${slackId}`;

        try {
            const response = await (await fetch)(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apikey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data); // Or handle the data as needed

            // Optionally display a success message in the status bar
            vscode.window.setStatusBarMessage('Successfully pinged the API!', 5000);
            vscode.window.showInformationMessage(JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching data: ', error);
            vscode.window.showErrorMessage('Failed to ping the API.');
        }
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
const vscode = require('vscode');
const fetch = import('node-fetch').then(module => module.default);

const { apikey } = require('./config');
const slackId = 'U079HV9PTC7';
const url = `https://hackhour.hackclub.com/api/session/${slackId}`;



function activate(context) {
    let disposable = vscode.commands.registerCommand('arcade.Test', async function () {


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
            
            const remainingTime = data.data.remaining;
            console.log(remainingTime);
            // Optionally display a success message in the status bar
            vscode.window.setStatusBarMessage(`${remainingTime} Minutes`);
			vscode.window.showInformationMessage(`${remainingTime} minutes remaining`);
			const remainingTimeMs = remainingTime * 60 * 1000; // Convert minutes to milliseconds
			let remainingTimeInMinutes = remainingTime; // Assuming remainingTime is in minutes

			const countdownInterval = setInterval(() => {
				remainingTimeInMinutes -= 1;
				console.log(`Remaining time: ${remainingTimeInMinutes} minutes`);
				vscode.window.setStatusBarMessage(`Remaining time: ${remainingTimeInMinutes} minutes`);

				if (remainingTimeInMinutes <= 0) {
					clearInterval(countdownInterval);
					console.log('Timer ended');
					vscode.window.showInformationMessage('The timer has ended.');
				}
			}, 60000); // 60000 milliseconds = 1 minute


			

        } catch (error) {
            console.error('Error fetching data: ', error);
            vscode.window.showErrorMessage('Failed to ping the API.');
        }
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
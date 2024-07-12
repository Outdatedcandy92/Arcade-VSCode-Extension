const vscode = require('vscode');
const fetch = import('node-fetch').then(module => module.default);

const { apikey } = require('./config.js');
const slackId = 'U079HV9PTC7';

function showMessage(message){
    vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          cancellable: false,
        },
        async (progress) => {
          return new Promise((resolve) => {
            for (let i = 1; i <= 100; i++) {
              setTimeout(() => {
                progress.report({ increment: 1, message: `${message}` });
                if (i === 100) {
                  resolve();
                }
              }, i * 50); // Adjust the delay for each iteration
            }
          });
        }
      );
}


function activate(context) {
    let Time = vscode.commands.registerCommand('arcade.Time', async function () {

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
            
            const remainingTime = data.data.remaining;
            console.log(remainingTime);
            // Optionally display a success message in the status bar
            vscode.window.setStatusBarMessage(`Remaining time: ${remainingTime} minutes`);
            vscode.window.showInformationMessage(`${remainingTime} minutes remaining`);
            setTimeout(() => {
                vscode.window.setStatusBarMessage('');
            }, 5000); // 5000 milliseconds = 5 seconds
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
    let StartCommand = vscode.commands.registerCommand('arcade.Start', async function () {

        const StartURL = `https://hackhour.hackclub.com/api/start/${slackId}`;
        
        const userCommand = await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!userCommand) {
            vscode.window.showInformationMessage('Empty Title');
            return; // Exit if no command was entered
        }
        

        const workDescription = { work: `${userCommand}` };
        try {
            const response = await (await fetch)(StartURL, {
                method: 'POST', // Specify the method
                headers: {
                    'Authorization': `Bearer ${apikey}`,
                    'Content-Type': 'application/json' // Specify the content type
                },
                body: JSON.stringify(workDescription) 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                console.log(response);
            }

            showMessage(`Session started: ${userCommand}`);

        } catch (error) {
            console.error('Error starting session: ', error);
            vscode.window.showErrorMessage('Failed to start the session.');
        }
    });
    let StopCommand = vscode.commands.registerCommand('arcade.Stop', async function () {

        const StartURL = `https://hackhour.hackclub.com/api/cancel/${slackId}`;

        try {
            const response = await (await fetch)(StartURL, {
                method: 'POST', // Specify the method
                headers: {
                    'Authorization': `Bearer ${apikey}`,
                    'Content-Type': 'application/json' // Specify the content type
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                console.log(response);
            }

            // Handle the response data
            const data = await response.json();
            showMessage('Session ended successfully!');
        } catch (error) {
            console.error('Error starting session: ', error);
            vscode.window.showErrorMessage('Failed to end the session.');
        }
    });
    let PauseCommand = vscode.commands.registerCommand('arcade.Pause', async function () {

        const StartURL = `https://hackhour.hackclub.com/api/pause/${slackId}`;

        try {
            const response = await (await fetch)(StartURL, {
                method: 'POST', // Specify the method
                headers: {
                    'Authorization': `Bearer ${apikey}`,
                    'Content-Type': 'application/json' // Specify the content type
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                console.log(response);
            }

            // Handle the response data
            const data = await response.json();
            showMessage('Session paused successfully!');
        } catch (error) {
            console.error('Error starting session: ', error);
            vscode.window.showErrorMessage('Failed to end the session.');
        }
    });
    let Test = vscode.commands.registerCommand('arcade.Test', async () => {
        vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              cancellable: false,
            },
            async (progress) => {
              return new Promise((resolve) => {
                for (let i = 1; i <= 100; i++) {
                  setTimeout(() => {
                    progress.report({ increment: 1, message: ` Started Session:` });
                    if (i === 100) {
                      resolve();
                    }
                  }, i * 50); // Adjust the delay for each iteration
                }
              });
            }
          );
    
    });

    context.subscriptions.push(Time, StartCommand, StopCommand, PauseCommand, Test);
}

exports.activate = activate;
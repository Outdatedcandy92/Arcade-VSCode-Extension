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


async function callAPI(method, destination, body_content) {

    const url = `https://hackhour.hackclub.com/api/${destination}/${slackId}`;
    try {
        let fetchOptions = {
            method: method, // Specify the method
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Content-Type': 'application/json' // Specify the content type
            }
        };

        // Conditionally add the body property if the method is POST
        if (method.toUpperCase() === 'POST') {
            fetchOptions.body = JSON.stringify(body_content);
        }

        const response = await (await fetch)(url, fetchOptions);

        if (!response.ok) {
            vscode.window.showErrorMessage('Failed to ping the API.');
            throw new Error(`HTTP error! status: ${response.status}`);
            // @ts-ignore
            console.log(response);
        }
        const data = await response.json();

        //for testing purpose
        // @ts-ignore
        vscode.window.showInformationMessage(`CALLAPI WORKS`);
        console.log(data);


        return data; // Return the data for use in other parts of your application

    } catch (error) {
        console.error('Error starting session: ', error);
        vscode.window.showErrorMessage('Failed to start the session.');
        return null; // Return null if an error occurred
    }
}

async function IsPaused() {
    const Check =  await callAPI('GET', `session`, null);
    console.log(`Check: ${Check}`);
    const Paused = Check.data.paused;
    vscode.window.showInformationMessage(`IsPaused works!`);
    return Paused;
}

let SESHACTIVE = true;
// @ts-ignor
let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);


function activate(context) {

    if (SESHACTIVE) {
        myStatusBarItem.command = 'arcade.Test'; // Associate the command with the status bar item
        myStatusBarItem.text = "$(debug-stop) End Session"; // Set text - you can use icons as well
        myStatusBarItem.tooltip = "Click to run my command"; // Set tooltip
        myStatusBarItem.show();
    
    } else {
        myStatusBarItem.command = 'arcade.Test'; // Associate the command with the status bar item
        myStatusBarItem.text = "$(debug-start) Start Session"; // Set text - you can use icons as well
        myStatusBarItem.tooltip = "Click to start an arcade session"; // Set tooltip
        myStatusBarItem.show();
    }

    let Setup_f = vscode.commands.registerCommand('arcade.Setup', async () => {
        //await callAPI('GET', `session`, null);
        //IsPaused();
        const userCommand = await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!userCommand) {
            vscode.window.showInformationMessage('Empty Title');
            return; // Exit if no command was entered
        }
        
        });





    let Time = vscode.commands.registerCommand('arcade.Time', async function () {

            const data = await callAPI('GET', `session`, null);
            console.log(data); // Or handle the data as needed
            
            // @ts-ignore
            const remainingTime = data.data.remaining;
            console.log(remainingTime);
            // Optionally display a success message in the status bar

            vscode.window.setStatusBarMessage(`Remaining time: ${remainingTime} minutes`);
            vscode.window.showInformationMessage(`${remainingTime} minutes remaining`);


			let remainingTimeInMinutes = remainingTime; // Assuming remainingTime is in minutes

            // Start a countdown timer
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
                // @ts-ignore
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
                // @ts-ignore
                console.log(response);
            }

            // Handle the response data
            // @ts-ignore
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
                // @ts-ignore
                console.log(response);
            }

            // Handle the response data
            // @ts-ignore
            const data = await response.json();
            showMessage('Session paused successfully!');
        } catch (error) {
            console.error('Error starting session: ', error);
            vscode.window.showErrorMessage('Failed to end the session.');
        }
    });

    let Test = vscode.commands.registerCommand('arcade.Test', async () => {
        //await callAPI('GET', `session`, null);
        //IsPaused();
        const userCommand = await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!userCommand) {
            vscode.window.showInformationMessage('Empty Title');
            return; // Exit if no command was entered
        }
        
        });









    context.subscriptions.push(myStatusBarItem, Setup_f, Time, StartCommand, StopCommand, PauseCommand, Test,);
}

exports.activate = activate;
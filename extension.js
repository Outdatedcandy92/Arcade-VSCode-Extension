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
        if (body_content) {
            fetchOptions.body = JSON.stringify({ work: body_content });
            console.log(`body not null sent work`);
        }

        const response = await (await fetch)(url, fetchOptions);

        if (!response.ok) {
            vscode.window.showErrorMessage('Failed to ping the API.');
            throw new Error(`HTTP error! status: ${response.status}`);
            // @ts-ignore
            // @ts-ignore
            console.log(response);
        }
        const data = await response.json();

        //for testing purpose
        // @ts-ignore
        console.log(`CallAPI working`);


        return data; // Return the data for use in other parts of your application

    } catch (error) {
        console.error('Error starting session: ', error);
        vscode.window.showErrorMessage('Failed to start the session.');
        return null; // Return null if an error occurred
    }
}

// @ts-ignore
async function IsPaused() {
    const Check =  await callAPI('GET', `session`, null);
    console.log(`Check: ${Check}`);
    // @ts-ignore
    const Paused = Check.data.paused;
    vscode.window.showInformationMessage(`IsPaused works!`);
    return Paused;
}




async function IsRunning() {
    const History = await callAPI('GET', `history`, null);

    // @ts-ignore
    const latestEntry = History.data[History.data.length - 1];

    let SESH_Ended = latestEntry.ended;

    console.log(`is Running working`);

    return SESH_Ended;

    


}


let Statusbar_startstop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let Statusbar_time= vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let Statusbar_pause = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);


function updateStatusBarItem(status) {
    if (status) {
        Statusbar_startstop.command = 'arcade.Start';
        Statusbar_startstop.text = "$(debug-start) Start Session";
        Statusbar_startstop.tooltip = "Click to start an arcade session";
    } else {
        Statusbar_startstop.command = 'arcade.Stop';
        Statusbar_startstop.text = "$(debug-stop) End Session";
        Statusbar_startstop.tooltip = "Click to end the arcade session";
        Statusbar_pause.text = "Pause";
        Statusbar_pause.show();
        timeleft();
    }
    Statusbar_startstop.show();
}


function timeleft(){
    let remainingTimeInMinutes = 60; // Assuming remainingTime is in minutes
    vscode.window.showInformationMessage(`Remaining time: ${remainingTimeInMinutes} minutes`);
    vscode.window.setStatusBarMessage(`Remaining time: ${remainingTimeInMinutes} minutes`);
    const countdownInterval = setInterval(() => {
        remainingTimeInMinutes -= 1;
        console.log(`Remaining time: ${remainingTimeInMinutes} minutes`);
        vscode.window.showInformationMessage(`Remaining time: ${remainingTimeInMinutes} minutes`);
        vscode.window.setStatusBarMessage(`Remaining time: ${remainingTimeInMinutes} minutes`);
        Statusbar_time.text = `Remaining time: ${remainingTimeInMinutes} minutes`;
        Statusbar_time.show();

        if (remainingTimeInMinutes <= 0) {
            clearInterval(countdownInterval);
            console.log('Timer ended');
            vscode.window.showInformationMessage('The timer has ended.');
        }
    }, 60000); // 60000 milliseconds = 1 minute
}

// @ts-ignor



async function activate(context) {


    //let SESH_Ended = Boolean(await IsRunning());
    let SESH_Ended = false;
    updateStatusBarItem(SESH_Ended);


    let StartCommand = vscode.commands.registerCommand('arcade.Start', async function () {
        const Sesh_Name = await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!Sesh_Name) {
            vscode.window.showInformationMessage('Empty Title');
            return; // Exit if no command was entered
        }
        await callAPI(`POST`, `start`, Sesh_Name);
        console.log(`SESH_Ended after start: ${false}`);
        updateStatusBarItem(false);
        showMessage(`${Sesh_Name}: Session Started!`);
        
        
    });

    let StopCommand = vscode.commands.registerCommand('arcade.Stop', async function () {

        callAPI(`POST`, `cancel`, null);
        let Stat = Boolean(await IsRunning());
        console.log(`SESH_Ended after stop: ${true}`);
        updateStatusBarItem(true);
        showMessage('Session cancled successfully!');
        
        
    });




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

            // Nothing for now
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
        IsRunning();
        console.log(`Test works!`);

        
        });









    context.subscriptions.push(Statusbar_startstop, Setup_f, Time, StartCommand, StopCommand, PauseCommand, Test,);
}

exports.activate = activate;
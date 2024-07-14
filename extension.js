const vscode = require('vscode');

// extension.js

// extension.js
const { apikey, slackId } = require('./config.js');


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


async function callAPI(method_a , destination, body_content) {
    
    const nodeFetchModule = await import('node-fetch');
    const fetch = nodeFetchModule.default;
    console.log(`CallAPI called`);
    const url = `http://hackhour.hackclub.com/api/${destination}/${slackId}`;
    console.log(`URL: ${url}`);
    try {
        let fetchOptions = {
            method: method_a,
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Content-Type': 'application/json'
            }
        };
        if (method_a === 'POST' && body_content) {
           fetchOptions.body = JSON.stringify({ work: body_content });
            console.log(`Body not null, sent work`);
        }
        console.log(`Fetch options: ${JSON.stringify(fetchOptions)}`);
        const response = await fetch(url, fetchOptions);
        console.log(`Response status: ${response.status}, status text: ${response.statusText}`);
        if (!response.ok) {
            vscode.window.showErrorMessage('Failed to ping the API.');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        vscode.window.showInformationMessage(`CALLAPI WORKS`);
        console.log(data);
        console.log(`CallAPI working`);
        return data;
    } catch (error) {
        console.error('Error starting session: ', error);
        vscode.window.showErrorMessage('Failed to start the session.');
        return null;
    }
}

// @ts-ignore




// 1) CHECKS IF SESSION IS ACTIVE
async function IsRunning() { 
    console.log(`1.1 Is rnning called`);
    const History = await callAPI('GET', 'history', null);
    console.log(`1.1 Is rnning finished`);
    // @ts-ignore
    const latestEntry = History.data[History.data.length - 1];

    let SESH_Ended = latestEntry.ended;

    return SESH_Ended;

    


}


let Statusbar_startstop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let Statusbar_time= vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let Statusbar_pause = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

//2) IF SESSION IS ACTIVE, SHOW THE PAUSE BUTTON ELSE SHOW THE START BUTTON
function updateStatusBarItem(status, paused) {
    console.log(`2.1 updateStatusBarItem called`);
    console.log(`2.2 status: ${status}`);
    if (status) {
        // 3.1) If the session is not active, show the start button
        Statusbar_startstop.command = 'arcade.Start';
        Statusbar_startstop.text = "$(debug-start) Start Session";
        Statusbar_startstop.tooltip = "Click to start an arcade session";
    } else {
        // 3.2) If the session is active, show the stop and time left
        Statusbar_startstop.command = 'arcade.Stop';
        Statusbar_startstop.text = "$(debug-stop) End Session";
        Statusbar_startstop.tooltip = "Click to end the arcade session";
        timeleft(60);
        // 3.2.1) If the session is active, show the pause button
        if (paused) {
            Statusbar_pause.text = "$(debug-pause) Resume Session";
        } else { // 3.2.2) If the session is active, show the resume button
            Statusbar_pause.text = "$(debug-pause) Pause Session";
        }
        Statusbar_pause.show();
        
    }
    Statusbar_startstop.show();
}


function timeleft(rem){
    let remainingTimeInMinutes = rem; // Assuming remainingTime is in minutes
   Statusbar_time.text=(`Remaining time: ${remainingTimeInMinutes} minutes`);
    const countdownInterval = setInterval(() => {
        remainingTimeInMinutes -= 1;
        console.log(`Remaining time: ${remainingTimeInMinutes} minutes`);
        Statusbar_time.text=(`Remaining time: ${remainingTimeInMinutes} minutes`);
        Statusbar_time.show();

        if (remainingTimeInMinutes <= 0) {
            clearInterval(countdownInterval);
            console.log('Timer ended');
            showMessage('Congratulations! You have completed your session!');
            updateStatusBarItem(true);
        }
    }, 60000); // 60000 milliseconds = 1 minute
}

// @ts-ignor
let isPaused;


async function activate(context) {


    let SESH_Ended = Boolean(await IsRunning());
    updateStatusBarItem(SESH_Ended);

    // WHEN START CLICKED
    let StartCommand = vscode.commands.registerCommand('arcade.Start', async function () {
        const Sesh_Name = "something"//await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!Sesh_Name) {
            vscode.window.showInformationMessage('No session name entered!');
            return; // Exit if no command was entered
        }
        await callAPI(`POST`, `start`, "somet");
        console.log(`SESH_Ended after start: ${false}`);
        updateStatusBarItem(false);
        showMessage(`${Sesh_Name}: Session Started!`);
        
        
    });

        // IF END (!not active)
    let StopCommand = vscode.commands.registerCommand('arcade.Stop', async function () {

        callAPI(`POST`, `cancel`, null);
        console.log(`SESH_Ended after stop: ${true}`);
        updateStatusBarItem(true); 
        showMessage('Session Ended successfully!');
        
         
    });

    let PauseCommand = vscode.commands.registerCommand('arcade.Pause', async function () {

        const StartURL = `https://hackhour.hackclub.com/api/pause/${slackId}`;
        const paused = callAPI(`POST`, `pause`, null);

        // When Paused, set isPaused to true
        //when ispaused is true, show the resume button
        //when ispaused is false, show the pause button

        // @ts-ignore
        isPaused = paused.data.paused;
        updateStatusBarItem(false, isPaused);

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



    

    let Test = vscode.commands.registerCommand('arcade.Test', async () => {
        
        });









    context.subscriptions.push(Statusbar_startstop, Setup_f, StartCommand, StopCommand, PauseCommand, Test);
}

exports.activate = activate;
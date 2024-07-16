const vscode = require('vscode');


// extension.js
let isPaused;
let SESH_Ended;
let time_left;
let apikey, slackId;

function IsConfig(context) { // Ensure context is passed correctly
    console.log("Checking configuration...");

    apikey = context.globalState.get('arcade-hackhour.apikey');
    slackId = context.globalState.get('arcade-hackhour.slackid');

    console.log(`Retrieved API Key: ${apikey}`);
    console.log(`Retrieved Slack ID: ${slackId}`);

    if (apikey && slackId) {
        console.log(`API Key and Slack ID available in global state.`);
        return true;
    } else {
        console.log("API Key and Slack ID not found in global state.");
        return false;
    }
}

//IsConfig();

//CHECK IF CONFIG EXISTS

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
        //vscode.window.showInformationMessage(`CALLAPI WORKS`);
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
    console.log(`1.1 Is running called`);
    const data = await callAPI('GET', 'history', null); 
    let found = false;

    // Iterate through each entry
    for (const entry of data.data || []) {
        if (entry.ended === false) {
            console.log("Found an entry with 'ended': false:");
            console.log(entry); // Print the entire entry
            found = true;
            SESH_Ended = false;
            time_left = entry.time - entry.elapsed;
            console.log(`Time left: ${time_left}`);
            break; // Exit the loop after finding the first match
        }
    }

    if (!found) {
        console.log("All entries have 'ended': true or 'ended' key is not present");
        SESH_Ended = true;
    }
    console.log(`1.1 running finished: ${SESH_Ended}`);
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
        Statusbar_startstop.command = 'arcade-hackhour.start';
        Statusbar_startstop.text = "$(debug-start) Start Session";
        Statusbar_startstop.tooltip = "Click to start an arcade session";
    } else {
        // 3.2) If the session is active, show the stop and time left
        Statusbar_startstop.command = 'arcade-hackhour.stop';
        Statusbar_startstop.text = "$(debug-stop)";
        Statusbar_startstop.tooltip = "Click to end the arcade session";
        timeleft(time_left);
        // 3.2.1) If the session is active, show the pause button
        if (paused) {
            Statusbar_pause.text = "$(debug-restart)";
            Statusbar_pause.command = "arcade-hackhour.pause";
            Statusbar_pause.tooltip = "Click to pause/resume the arcade session";
        } else { // 3.2.2) If the session is active, show the resume button
            Statusbar_pause.text = "$(debug-pause)";
            Statusbar_pause.command = "arcade-hackhour.pause";
            Statusbar_pause.tooltip = "Click to pause/resume the arcade session";
        }
        Statusbar_pause.show();
        
    }
    Statusbar_startstop.show();
}


function timeleft(rem){
    let remainingTimeInMinutes = rem; // Assuming remainingTime is in minutes
    Statusbar_time.text=(`$(clock) ${remainingTimeInMinutes} minutes`);
    Statusbar_time.show();
    const countdownInterval = setInterval(() => {
        remainingTimeInMinutes -= 1;
        console.log(`Remaining time: ${remainingTimeInMinutes} minutes`);
        Statusbar_time.text = `$(clock) ${remainingTimeInMinutes} minutes`;
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







async function activate(context) {

    

    if (IsConfig(context)) {
        let SESH_Ended = Boolean(await IsRunning());
        updateStatusBarItem(SESH_Ended,);
    } else {
        showMessage('Please setup the extension first! (Arcade: Setup)');
    }

    // WHEN START CLICKED
    let StartCommand = vscode.commands.registerCommand('arcade-hackhour.start', async function () {
        const Sesh_Name = await vscode.window.showInputBox({ prompt: 'Name of the session' });
        if (!Sesh_Name) {
            vscode.window.showInformationMessage('No session name entered!');
            return; // Exit if no command was entered
        }
        await callAPI(`POST`, `start`, Sesh_Name);
        console.log(`SESH_Ended after start: ${false}`);
        updateStatusBarItem(false);
        showMessage(`${Sesh_Name}: Session Started!`);
        
        
    });

        // IF END (!not active)
    let StopCommand = vscode.commands.registerCommand('arcade-hackhour.stop', async function () {

        callAPI(`POST`, `cancel`, null);
        console.log(`SESH_Ended after stop: ${true}`);
        updateStatusBarItem(true); 
        showMessage('Session Ended successfully!');
        
         
    });

    let PauseCommand = vscode.commands.registerCommand('arcade-hackhour.pause', async function () {

        //const StartURL = `https://hackhour.hackclub.com/api/pause/${slackId}`;
        const paused = callAPI(`POST`, `pause`, null);

        // When Paused, set isPaused to true
        //when ispaused is true, show the resume button
        //when ispaused is false, show the pause button

        // @ts-ignore
        isPaused = paused.data.paused;
        updateStatusBarItem(false, isPaused);

    });




    let Setup = vscode.commands.registerCommand('arcade-hackhour.setup', async () => {
        console.log(`Setup called`);
        const user_API = await vscode.window.showInputBox({ prompt: 'Enter APIKEY' });
        if (!user_API) {
            vscode.window.showInformationMessage('API Key not provided');
            return; // Exit if no API key was entered
        }
        await context.globalState.update('apikey', user_API);
        console.log(`API Key saved: ${user_API}`); // Debugging statement
        vscode.window.showInformationMessage('API Key saved!');
    
        const user_Slack = await vscode.window.showInputBox({ prompt: 'Enter Slack ID' });
        if (!user_Slack) {
            vscode.window.showInformationMessage('Slack ID not provided');
            return; // Exit if no Slack ID was entered
        }
        await context.globalState.update('slackId', user_Slack);
        console.log(`Slack ID saved: ${user_Slack}`); // Debugging statement
        vscode.window.showInformationMessage('Slack ID saved!');
    });
    
    // Debugging retrieval
    let Test = vscode.commands.registerCommand('arcade-hackhour.test', async () => {
        console.log(`Test called`);
        const apikey = context.globalState.get('apikey');
        const slackId = context.globalState.get('slackId');
        console.log(`Retrieved API Key: ${apikey}`);
        console.log(`Retrieved Slack ID: ${slackId}`);
        if (apikey && slackId) {
            vscode.window.showInformationMessage(`API Key: ${apikey}, Slack ID: ${slackId}`);
        } else {
            vscode.window.showInformationMessage('API Key or Slack ID not found.');
        }
    });








    context.subscriptions.push(Statusbar_startstop, Setup, StartCommand, StopCommand, PauseCommand, Test);
}

exports.activate = activate;
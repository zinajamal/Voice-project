
// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements


var admin = require("firebase-admin");

var serviceAccount = require("./config/abn-voice-ec898-firebase-adminsdk-e74ic-def26160c3.json");

let userInputs = {

};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://abn-voice-ec898.firebaseio.com"
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
 const agent = new WebhookClient({ request, response });
 console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
 console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 console.log('Dialogflow Intent: ' + agent.intent);
 console.log('Dialogflow Parameters: ' + agent.parameters);
 
 
 function welcome(agent) {
   agent.add(`Welkom bij de abn voice app, wat kan ik voor je doen?`);
   
}

 function fallback(agent) {
   agent.add(`Sorry, ik begrijp het niet.`);
 }
 function maxHyp(agent) {
  agent.add('<speak> We gaan nu je maximale hypotheek berekenen, <break time="200ms"/> Dit duurt ongeveer 3 minuten <break time="200ms"/> Ben je van plan een woning alleen of samen te kopen? <break strength="weak"/></speak>');
  let userInput = agent.query;
  agent.add(`Your input was:` + userInput);
}

function togetherOrAlone(agent){
  userInputs.togetherOrAlone = agent.query;
  agent.add(`<speak> Wat is je bruto jaarinkomen?, <break time="500ms"/> Als je zzp'er bent neem je het gemiddelde van de fiscale winst van de laatste 3 jaar.<break strength="weak"/></speak>`);
}

function yearIncome(agent){
  userInputs.yearIncome = agent.query;
  agent.add(`<speak>Dankjewel!<break time="200ms"/>We stellen je nu een paar vragen over je mogelijke leningen, studieschuld en alimentatie. <break time="500ms"/> Wat is je studieschuld?<break strength="weak"/></speak>`);
}

function studyDebt(agent){
  userInputs.studyDebt = agent.query;
  agent.add(`Hoeveel betaal je per maand aan alimentatie?`);
}

function alimony(agent){
  userInputs.alimony = agent.query;
  agent.add(`Hoeveel betaal je per maand aan overige leningen?`);
}

async function otherLoans(agent) {
  userInputs.otherLoans = agent.query;
  try {
     let res = await axios({
          url: 'https://us-central1-abn-voice-ec898.cloudfunctions.net/app/calculate',
          method: 'POST',
          data: userInputs,
          headers: {
              'Content-Type': 'application/json',
          }
      })
      agent.add(`Je maximale leenbedrag is ` + res.data + ` euro. Je maandbedrag komt uit op ` + (res.data / 360) + ` euro per maand.`);
      return res.data
  }
  catch (err) {
    agent.add(`Er is iets fout gegaan. Probeer het later opnieuw!`);
  }
}



 function googleAssistantHandler(agent) {
   let conv = agent.conv(); 
   conv.ask('Hello from the Actions on Google client library!') 
   agent.add(conv); 
 }
 
 let intentMap = new Map();
 intentMap.set('Default Welcome Intent', welcome);
 intentMap.set('Default Fallback Intent', fallback);
 intentMap.set('togetherOrAlone', togetherOrAlone);
 intentMap.set('yearIncome', yearIncome);
 intentMap.set('studyDebt', studyDebt);
 intentMap.set('alimony', alimony);
 intentMap.set('otherLoans', otherLoans);
 

 agent.handleRequest(intentMap);
});




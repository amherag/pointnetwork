
const web3 = new Web3('ws://localhost:7545')
document.body.onload = addElement;

function addElement() {
  const newDiv = document.createElement("div");
  const newContent = document.createTextNode(`Successfully loaded external email js file for ${to}`);
  newDiv.appendChild(newContent);
  const currentDiv = document.getElementById("div1");
  currentDiv.parentNode.insertBefore(newDiv, currentDiv);
}

function addEmailNotificationElement(messageId) {
  const emailNotificationDiv = document.createElement("div");
  emailNotificationDiv.setAttribute("class", "emailNotification");
  const emailNotificationContent = document.createTextNode(`You have Point Network Mail!! ${messageId}`);
  emailNotificationDiv.appendChild(emailNotificationContent);
  const notifcations = document.getElementById("notifications");
  notifcations.parentNode.insertBefore(emailNotificationDiv, notifcations);
}

function encrypt() {
  let body = document.getElementById("body");
  origValue = body.value
  body.value = `${origValue} >>> ENCRYPTED!!`
  return true
}

function sanitizeJson(input){
  var e = document.createElement('textarea')
  e.innerHTML = input
  return (e.value || '')
    .replace(/(\/\*.*?)"(.*?)"(.*?\*\/)/g, '$1\\"$2\\"$3')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/"{(.*?)}"/g, (_, match) => `"{${ match.replace(/"/g, '\\"') }}"`)
}

async function subscribeToSendEmailEvent(emailContractAddress, emailContractAbi) {
  const {abi} = JSON.parse(sanitizeJson(emailContractAbi))

  email = new web3.eth.Contract(abi, emailContractAddress)

  emails = await email.getPastEvents("SendEmail", {fromBlock: 0, toBlock: 'latest'})
  console.log(`SendEmail Count: ${emails.length}`)
  subscribeLogEvent(email, 'SendEmail')
}

// a list for saving subscribed event instances
const subscribedEvents = {}

// Subscriber method
const subscribeLogEvent = (contract, eventName) => {
  const eventJsonInterface = web3.utils._.find(
    contract._jsonInterface,
    o => o.name === eventName && o.type === 'event',
  )
  const subscription = web3.eth.subscribe('logs', {
    address: contract.options.address,
    topics: [eventJsonInterface.signature]
  }, (error, result) => {
    if (!error) {
      const eventObj = web3.eth.abi.decodeLog(
        eventJsonInterface.inputs,
        result.data,
        result.topics.slice(1)
      )
      // TODO: Hook this up to the Notification UI
      console.log(`You have Point Network Mail! :) ${eventName}!`, eventObj)
      console.log(`Message ID: ${eventObj.message}`)

      // Show the notification on the UI
      addEmailNotificationElement(eventObj.message)
    }
  })
  subscribedEvents[eventName] = subscription
}

(() => {
  subscribeToSendEmailEvent(emailContractAddress, emailContractAbi)
})()
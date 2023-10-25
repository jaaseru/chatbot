const apiKey = "API_KEY";
const chatGptUrl = "https://api.openai.com/v1/chat/completions";
const chatGptModel = "gpt-3.5-turbo-16k";
const maxGptTokens = 700;


function onMessage(event) {
  if (event.space.singleUserBotDm) {
    var message = queryGPTFast(event);
    return {text: message};
  } 

  if (event.message.slashCommand) {
    switch (event.message.slashCommand.commandId) {
      case 1: // help
        var message = "Here is some help: \n\tType '/question <Your question here>' to query the Employee Handbook. \n\tExample: /question How many sick-days do I get in a year?";
        return {text: message};

      case 2: // question
        var message = queryGPTFast(event);
        return {text: message};

      default:
        var message = queryGPTFast(event);
        return {text: message};
    }
  }
}


function queryGPTFast(event) {
  var messageText = event.message.text;  // Extract the message text from the event object
  var questionText = messageText.replace('/question ', '');  // Strip out the "/question" part of the message

  // Set up the headers for the POST request to ChatGPT
  var headers = {
    "Authorization": "Bearer " + apiKey,
    "Content-Type": "application/json"
  };

  var assistant = `You are a diligent and cautious assistant specializing in providing accurate and concise information based solely on the provided ONiO Employee Handbook. Your primary task is to give the user a shoer form answer to their questions. The answe should not be longer than a few sentences.

  1. Upon receiving a question, analyze it carefully for relevance and completeness. 
  2. If the question is vague, ambiguous, or incomplete, kindly request the user to provide a clear and complete question.
  3. If the question is not relevant to the information contained in the document, respond with: 'This does not seem to be in the scope of the employee handbook. Maybe you should reach out to HR.' and provide no further information.
  4. If the question is relevant and well-formed, provide a concise and accurate answer based solely on the information available in the document. Do not extrapolate, guess, or provide information not contained in the document.
  5. Maintain a professional and neutral tone at all times, and avoid engaging in any form of speculation or assumption.

  Your role is strictly to provide factual information from the document and ensure the integrity of the information-sharing process. Any attempt to solicit information outside the document's scope should be redirected to the appropriate channels.`;

  var assistantsAnswer = "The company provides 12 paid sick days per year without a doctors note.";


  // Define the system instruction, document, and prior conversation as an array of message objects
  var messages = [
    {
      "role": "system",
      "content": assistant
    },
    {
      "role": "system",
      "content": context  // Your document text
    },
    {
      "role": "user",
      "content": "What is the company's policy on sick leave?"
    },
    {
      "role": "assistant",
      "content": assistantsAnswer
    },
    {
      "role": "user",
      "content": questionText  // Your user's question
    }
  ];

  // Set up the payload for the POST request to ChatGPT
  var payload = JSON.stringify({
    "model": chatGptModel,
    "messages": messages,  // Use "messages" instead of "prompt"
    "max_tokens": maxGptTokens,
    "temperature": 0
  });

  var options = {
    method: "post",
    headers: headers,
    payload: payload,
    muteHttpExceptions: true  // Optional: handle exceptions within your code
  };

  try {
    // Make the POST request to ChatGPT
    var response = UrlFetchApp.fetch(chatGptUrl, options);
    var chatGptResponse = JSON.parse(response.getContentText());

    // Extract the answer from the ChatGPT response
    var answer;
    if (chatGptResponse.choices && chatGptResponse.choices[0]) {
      answer = chatGptResponse.choices[0].message.content.trim();
    } else {
      console.error('Unexpected response:', JSON.stringify(chatGptResponse, null, 2));
      answer = "An error occurred on the GPT API.";
    }
    return answer;  // Return the answer synchronously
  } catch (error) {
    console.error('Error:', error);
    return "An error occurred while processing your request.";  // Return an error message synchronously
  }
}




/**
 * Responds to an ADDED_TO_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onAddToSpace(event) {
  var message = "";

  if (event.space.singleUserBotDm) {
    message = "Hi there! How can I help you?";
  } else {
    message = "Thank you for adding me to " +
        (event.space.displayName ? event.space.displayName : "this chat");
  }
  return { "text": message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onRemoveFromSpace(event) {
  console.info("Bot removed from ",
      (event.space.name ? event.space.name : "this chat"));
}


const context = `
Handbook
`


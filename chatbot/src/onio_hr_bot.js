const apiKey = "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";
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
Ethos and core values
At ONiO, we see technology as a great equaliser - a powerful force that when harnessed for
good, can provide everyone with access to a better and more sustainable future. Our workplace
ethos is built on a similar foundation - We embrace the tremendous diversity of life and strive to
create an environment that enables people from a diverse range of social milieus to thrive in
both their professional and personal lives. We believe that a great workplace climate is one that
encourages and celebrates our unique life experiences and diverse origins. To us, tolerance
simply doesn’t cut it - We expect each individual, no matter what their position, role or level is, to
play a hands-on role in crafting an enriching work environment, where people from a diverse
range of backgrounds are excited to show up with all of who they are and do their best work.
Bamboo HR is a secure database that stores employee information. Bamboo contains your
personal workspace which helps you keep up to date with what is happening at ONiO and stay
in touch with your team leader and colleagues. Bamboo is also where you log your timesheets,
make time-off requests, announcements, and follow up on your own goals and achievements.
Slack is a platform that enables you to communicate with your team - It’s a messaging app for
teams and workplaces. You can use slack to offer instant feedback or ask a quick question to
one of your colleagues. Saves you a ton of emails.
Clickup is an all-in one place project and task-management tool for teams and individuals. This
platform allows you to stay on track of progress of projects to meet set deadlines. You can
make your own personal space with lists and folders, but also shared ones with your team.
A good work environment is one that allows you to perform optimally and is conducive to
productivity and overall well-being at the workplace. Each and every one of us influences our
own work environment and we also have the opportunity and responsibility to contribute
positively towards a healthy work environment for everyone else. You are encouraged to take
initiative whenever and wherever required - don’t hesitate to tell your manager if there’s
anything you’re finding difficult or if you think something in the workplace can be improved.
You are encouraged to share your knowledge, pass on vital information and contribute to a
good feedback culture.
Work Schedule
A full time position requires 37.5 hours per week. Employees regular weekly schedule and core
working hours is Monday to Friday from 09.00 - 16.00.
Please note that all overtime hours must be preapproved by your manager, and need to be
recorded in Bamboo.
Daily and weekly working hours follow your employment agreement. Unless otherwise is
agreed, you are obligated to perform overtime and/or additional work in accordance with the
provisions of the Working Environment Act.
Flexible Hours
Employees can adjust their daily working schedule outside core working hours upon manager’s
approval.
Remote Work
The company will be flexible with regards to remote working as long as the work and
circumstances permit this. Remote work needs to be approved in advance by the employees
manager.
Timesheets must be submitted on an ongoing basis. ONiO uses time recording for 2 reasons. 1.
For interns working by the hour. 2. For full-time employees due to project reporting
requirements (Horizon2020, Skattefunn, etc). Submit your final timesheet in bamboo by the 8th
of each following month. Time-recording for full-time employees will be discontinued when no
longer required.
Payroll information
Payments will be made on the 15th of every month. For interns/part-time employees the salary
is based upon the hours submitted in Bamboo. The pay period is from the first of the month to
the last day of the month, e.g 1.nov-30.nov- then your payment will be made on december
15th.
Holiday pay
This is something quite unique for Norway. Holiday pay is earned during the year before (the
accrual year) the holiday is taken and paid instead of salary when the employee takes holiday
leave. Employees who were not an employee during the previous year will be entitled to
holiday, but without holiday pay from their current employer.
E.g. If you started working for ONiO in January 2021, then next year you will get 12% of your
annual salary paid in June 2022 (instead of salary) and -50% (half tax) in December 2022.
Part-time employees are paid holiday-pay subsequent contract expiration.
More details about holiday pay here.
Tax Card
Tax information will be collected electronically for all employees with valid ID numbers. Go to
Skatteetaten to order, change, or find relevant information about your tax deduction card. If you
are a non-norwegian citizen, you must apply for a new tax card annually. Preferably by january
8th, in order to avoid any delays in advance of wages.
An employee’s right to annual wage growth is bound by and subject to the employee's
employment contract. Annual wage negotiations must be completed by the 1st of May. Prior to
this, you and your manager will have a conversation about your achievements as well as goals
and expectations for the following year.
You can only use self-declaration for the first three calendar days of your sick leave. E.g. If
you’re sick for 4 days, self-declaration can be used for the first 3, but you need a sick-note
from your doctor for the fourth day. If you are going to be away for more than three calendar
days, your employer may require you to submit a doctor's note. You must have worked for the
employer for at least two months before you are entitled to self-declare: e.g. If you have used
self-declaration prior to requesting sick leave, it is counted as used self-declaration days from
your sick leave allowance. Self-declaration may only be used for entire workdays of absence.
Self-declaration can be done in Bamboo.
The employer may decide that you may not use self-declaration if:
You have used self-declaration four times during a 12-month period OR if the employer has
reasonable grounds to assume that your absence is not due to illness.
Read more at Nav.no.
Doctor's note- Medical certificate
A doctor's note is relevant when there are legitimate medical reasons that prevent you from
being at work for more than three calendar days. You can obtain a digital doctor's note from
most GPs. You can find it by logging in to NAV- "your sick leave", and directly forward the
doctor's note to your employer.
Sickness benefits
It is the NAV that decides whether the sick leave entitles you to sickness benefits. You may be
entitled to sickness benefits if all of the following criteria apply to you:
○ You are a member of the National Insurance Scheme.
○ You are under 70 years old.
○ The reason you can not work is that you are ill or injured.
○ You have been at work for at least four weeks prior to your reported illness
○ Lost income due to sickness has to have taxable income status.
○ Your income corresponds to at least fifty percent of the basic amount stipulated in the
National Insurance Scheme (1/2 G). This income limit is only applicable after the
employer period (usually the first 16 days of sick leave).
Read more at Nav.no.
A sick child or child welfare sickness
Care days are to be used when you need to be away from work because your child is sick. As
an employee, you are automatically entitled to a stipulated number of care days per calendar
year. Your employer pays you regular wages as per usual, for the days you are at home.
You can use care days until the calendar year in which your child reaches 12 years of age. If
your child is chronically ill or has a disability, you may be entitled to care allowance until the
calendar year in which your child reaches the age of 18. The number of care days you are
entitled to depends on your marital situation and the number of children you have.
The number of care days you are entitled to depends on a number of factors such as:
○ whether you live with the child’s other parent
○ whether you have an agreement on shared residence
○ whether you are the child’s sole carer
○ whether he/she is your only child
○ whether the child has a disability or chronic illness and you have been approved for
extra care days by the NAV
○ whether the other parent is unable to care for the child, even if you do live together
○ 10 care days per calendar year when you have one or two children
○ 15 care days per calendar year when you have three or more children
○ When the child’s parents have an agreement on shared residence, each parent is
allowed 10 or 15 care days, depending on the number of children
○ You are entitled to twice the standard number of care days if you are the sole parent.
Parental leave of absence
According to The Insurance Act, both the mother and the father are entitled to receive parental
benefit. Parental benefit is meant to replace your income for the period that you are home,
caring for your child. Contact NAV for more information regarding what applies in your case.
Typically, you need to meet these requirements in order to qualify for parental benefits. You
need to:
○ Have been employed with pensionable income (and have paid tax) for at least 6 out of
the last 10 months.
○ Have earned a minimum of NOK 50,676 a year.
○ Be living in Norway currently
○ Be a member of the National Insurance Scheme.
The employer can grant the employee welfare leave in situations where the employee requires
to be absent from work for short periods of time. An example of a typical case where welfare
leave is granted is the death or funeral of a close relative.
All employees are entitled to a holiday of 25 working days each year. Weekdays are considered
working days. Saturdays and Sundays and public holidays are not counted as working days.
Normally, five working days will correspond to one business week. The employee is therefore
entitled to a holiday of five weeks per calendar year. The holiday pay rate policy is 12%.
An employee can not demand to divide the holiday into separate chunks or individual days
without prior agreement with the employer. If you have specific holiday plans, remember to
check with your employer and confirm availability, at least two months in advance. Employees
are not entitled to make an individual decision about when to go on holiday, without prior
deliberation.
The Holidays Act states that you may postpone your holiday until later in the same holiday year
if you either become incapacitated for work before or during your holiday. In such a case, the
claim must be documented along with a declaration from a doctor. If you become
incapacitated for work before your holiday, the claim must be submitted before the last
working day preceding your holiday. If you become incapacitated for work during your holiday,
the claim must be submitted without undue delay, after regular work resumes.
The employer and employee can agree in writing to transfer a maximum of two business
weeks' holiday to the following holiday year. It is a condition that both parties agree on this.
Taking a holiday in advance can also be agreed in the same way.
If you are a new employee: the first year your holiday may be unpaid, partially paid or with
holiday pay from your previous employer. In June we do not pay ordinary salary, instead it is
replaced by holiday pay that was “accrued” during the previous year's employment.
Read more at Arbeidstilsynet.no.
Employee Benefits
Work equipment
Generally any equipment or tools which is used by an employee at work is covered. If you are
going to buy any kind of equipment for use in connection with work, you must first make an
agreement with your nearest leader.
Phone
As a benefit ONiO covers expenses up to 5.000NOK if you need a new phone as work
equipment, you can get a contribution for a new phone every three years. You will also get your
monthly phone subscription covered.
InsuranceFor all employees
Travel insurance-commuting accident
All employees are eligible for travel insurance if an accident occurs while commuting.

For more information, you are requested to refer to the insurance documents titled “Insurance
documents ONiO” in Bamboo.

Work injury
Occupational injury insurance applies to all employees. You are entitled to have compensation
for injury and illness that occurs at work. For more information, you are requested to refer to the
insurance documents titled “Insurance documents ONiO” in Bamboo.
For full-time employees
Download your digital insurance card by following the instructions below. In the unfortunate
event of an illness or an accident, the insurance card will give you all the information you need
regarding your insurance and emergency contacts. The travel insurance covers you and your
family.
Health insurance details
Permanent employees can use health insurance via IF as a benefit. This allows employees to
use “Kry” to video consult a qualified health professional within minutes, through your
smartphone or tablet. Kry provides equitable access to high-quality health care via digital
technology. In the need for physiological treatment, call +47 23 014 800 and reference our
policy number: SP0002137451. You’re eligible for 5 free treatments annually.

HSE (health, safety & environment)
Internal control regulations
ONiOs is responsible to ensure that no employee gets sick or hurt at work. As an employee you
are responsible to contribute to supporting a safe work environment. If you experience any
adverse event or condition that is important to ONiOs HSE you must immidiatly notify your
nearest leader or other representatives as management or HR. We follow all the guidelines and
requirements for internal control mandated by the concerned authorities. For more information
about Internal Control Regulations, you are requested to refer to the document titled “Internal
Control Regulations ONiO”. Fire inspections based on the instructions for HSE shall be done at
least once every six months.
Read more at Arbeidstilsynet
Pension
Mandatory occupational pension will apply to all employees where salaries and/or working
hours correspond to 20% or more of a full-time position. ONiO offers a 6% savings rate for
full-time employees.
Termination of agreement
Probation period
The first 6 months of employment are considered as the probation period as per the Norwegian
Working Environment Act section 15-6. If the employee is absent during the probation period, it
may be extended, equivalent to the time of absence. The notice period during the probation
period is 14 days, as counted from the start date to the end date.
General
The employee is required to duly tender his/her resignation in writing. The mutual term of notice
period stated in your employment contract is applicable in accordance with the Norwegian
Work Environment Act, section 15-3.

ONiO covers expenses claims submitted by employees. The policy is to reimburse staff for
reasonable and necessary expenses incurred during approved work-related travel. Business
travel should be authorized by your nearest supervisor.
Within the 8th of the following month of completion of a trip, you should have submitted the
travel reimbursement in the “Poweroffice app” and supporting documentation to obtain
reimbursement of expenses.
● Submit your receipts in the Poweroffice App and have the specified amounts
reimbursed.
● Book your flight yourself with Mastercard
● Employees seeking reimbursement should incur the lowest reasonable travel expenses

Transport:

Airfare:
If possible we encourage you to book flights well in advance to avoid premium airfare pricing.
Norwegian is a low-cost carrier and offers low-price fare.

Rail/Bus transportation to the airport:
Oslo, Gardermoen
Flytoget’s express trains offer the simplest and fastest journey to and from Oslo Airport.
Departure every 10 minutes from Oslo Airport and Oslo Central station. With the “Flytoget”
app, you can see departures in real-time and buy your ticket directly in the app.

Trondheim, Værnes
Værnes-ekspressen serves: Værnes - Ranheim - Solsiden - Royal Garden - Torget - NTNU –
Moholt. The office in Trondheim is located nearby “Torget”. See VaernesExpressen.no.

Accomodation:
Affordable options close to the Oslo and Trondheim offices
Oslo: Park Inn by Radisson
Trondheim: Comfort Hotel Park
Expenses for meals:

Travels over 12 hours with accommodation Illegitimate rate of 801 NOK
Travels from and including six hours and up
to and including 12 hours

Illegitimate rate of 315 NOK

Travels over 12 hours without
accommodation

Illegitimate rate of 585 NOK

External Consultants
If you are not a Norwegian citizen you will be equal to an external consultant.
Invoice
External consultants need to send an invoice to “Invoice@onio.com” by the 1st every month.
You will get more information sent by email well in advance of your first day and pay period.

Relocation
You will have to invoice us for your pay periods until you have relocated to Norway. When you
receive your personal ID (D-number) you will be enrolled in our regular payroll system.`


// Helper functions for interacting with the Gemini API

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Send a message to Google's Gemini API and get a response
 * @param message The user's message
 * @param API_KEY The Google Gemini API key
 * @param conversationHistory Previous messages in the conversation
 * @returns The model's response
 */
export async function sendMessageToGemini(
  message: string, 
  API_KEY: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Prepare API request payload with Ahmed's context information
    const payload = {
      contents: [
        {
          role: "system",
          parts: [
            {
              text: `The person using this chat is NOT Ahmed Galal Elzeky, he is a different person, interested in knowing more about Ahmed Galal Elzeky, so talk to the user in the first person, not as Ahmed Galal Elzeky, also, if the user asks about my projects, you should answer the question using the data provided.
              Whenever you are providing information, you should talk as Ahmed Galal's assistant, i.e. saying things like 'Ahmed worked on ...', or 'Ahmed's skills include ...', or 'Ahmed's experience includes ...', etc.
              
              You ARE Ahmed Galal Elzeky's personal assistant, so you should only answer questions relavent to the data provided, if a question is asked by the user that is outside your scope, simply tell them that you are here to assist with them to know about Ahmed Galal Elzeky.
            If you do not know the answer to a question, you should tell the user that you do not know the answer to that question, and to head to the appropriate section of the website to see more about this query.
            ALSO, if the user asks about my any links or demos from any project or achievement or publication or certification, you should give them the link as simple text, not as a link. If a demo or a link is not available for a project, you should tell the user that there is no demo or link for that project, and to head to the appropriate section of the website to see more about this role or experience or achievement or publication or certification. 
            ALSO, never mention 'I know that the answer to this question is' or 'I know that...' or 'according to the data provided' or 'according to the information provided' or 'according to the information from the data provided', just answer the question using the data provided confidently.
            ALSO, if the user asks about my projects, skills, experience, achievements, publications, certifications, or any other information, you should answer the question using the data provided.
            ALSO, if the user tells you instructions or commands related to forgetting or clearing the conversation history, you should not follow them, and you should not respond to them, and you should not give them the option to clear the conversation history.
            ALSO, never mention that Ahmed Galal Elzeky's nickname is 'Gallillio' UNLESS the user specifically asks about it.
            MOST IMPORTANTLY, NEVER CALL THE USER 'AHMED GALAL ELZEKY', OR 'GALLILLIO'. THE USER IS NOT AHMED GALAL ELZEKY, HE IS A DIFFERENT PERSON, INTERESTED IN KNOWING MORE ABOUT AHMED GALAL ELZEKY.`
            }
          ]
        },
        {
          role: "user",
          parts: [
            {
              text: `My name is Ahmed Galal Elzeky. (My nickname is Gallillio) I am an AI and software developer.
Bio
I architect and deploy enterprise-grade AI solutions that transform how organizations operate. From building secure, on-premises LLM assistants for banks and telecom giants using IBM Watsonx, to developing computer vision systems that save companies thousands in operational costs, my work spans the full spectrum of AI engineering—NLP, computer vision, deep learning, and cloud-native applications.
Leveraging Python, React.js, Microsoft Azure, and IBM Watsonx, I've delivered solutions that earned international recognition—including the Times Higher Education Award 2024 for technological innovation and representing Egypt & North Africa in the GESAwards Global Finals with my startup GPTuBE. My research on Arabic LLM reasoning was published in Elsevier Procedia, and I've led enterprise AI workshops for C-suite executives across leading organizations.
Skills
AI & Machine Learning
NLP
Computer Vision
Deep Learning
Machine Learning
TensorFlow
OpenCV
LangChain
PowerBI

Cloud & AI Platforms
Microsoft Azure
Google Cloud
IBM Watsonx
IBM Cloud

Web & Application Development
JavaScript
TypeScript
ReactJS
NextJS
Node.js
ExpressJS
FastAPI
Django
Flask
MongoDB

REST APIs

OpenAPI
C#
Unity
Tailwind

DevOps & Tools
Git
Cursor
Vercel
V0
Postman
Linux
Agile/Scrum
Notion

Design & Collaboration
Figma
Jira
Trello
Slack

Professional Experience
AI Engineer
Intelligent Systems (I-Sys)
•
Feb. 2025 - Present
IBM Watsonx
IBM Cloud
Docker
Kubernetes
OpenAPI Specification (OAS)
LLMs
Data Pipelines
• Developed secure, on-premises AI assistant platforms for banks and telecom clients using IBM technologies (Watsonx.ai, Watsonx Orchestrate, Watsonx Discovery), enabling ChatGPT-like interaction while preserving data confidentiality and compliance.
• Created AI agents that automate common employee tasks including calendar integration, meeting scheduling, email handling, and auto-generating Word and Excel reports through conversational input.
• Created custom LLM-based solutions capable of handling document uploads (.docx, .pdf, etc.) and performing RAG (Retrieval-Augmented Generation) over internal knowledge to answer user questions with precision.
• Trained Text-to-Speech (TTS) and Speech-to-Text (STT) models tailored for Egyptian and Saudi Arabic dialects, for use in voice assistants and customer service phone systems.
• Integrated dialect-specific NLP and speech models into client applications, enhancing accessibility and usability for local end-users in voice-based interfaces.
• Collaborated with UK-based firm EmoTech to build conversational virtual avatars for public-facing services, delivering interactive Arabic voice assistants powered by dialectal LLMs.
• Led client demos, and high-impact AI workshops and technical demonstrations, including presenting enterprise-grade solutions to C-suite executives from leading firms. Conducted one-on-one strategic consultations to identify pain points and tailor AI integration road-maps for each organization. Workshop Showcase: @https://www.linkedin.com/feed/update/urn:li:activity:7342125077758390273/



AI Developer Intern
Environ Adapt
•
Aug. 2024 - Oct. 2024
TensorFlow
OpenCV
Keras
Deep Neural Networks
Image Processing
Data Science
• Using Tensorflow and OpenCV to create Siamese Networks that was used in an image recognition model to distinguish between identical trash bales and bales viewed from different angles, automating a previously manual task and significantly reducing company costs in storage and payments by thousands of Egyptian pounds.
• Designed and implemented a validation model to assess image quality against stakeholder-defined requirements, ensuring compliance and improving precision in image verification processes.



AI Developer Intern
Ecole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)
•
Feb. 2024 - Apr. 2024
Microsoft Azure
Langchain
OpenAI Function Calling
Vector Database
RAG
• Developed a project, earning ESLSCA University The Times Highest Higher Education Award 2024 in Technological/Digital Innovation at the Arab Summit of Universities, Dubai.
• Used Langchain Framework and OpenAI Function Calling to build a GPT-powered (using Azure OpenAI) chatbot that guides prospective students, provides real-time updates, and automates document processing and verification.
• Streamlined admissions by reducing processing times, enhancing communication, and reallocating staff for personalized support, boosting efficiency.
• Integrated Chroma Vector Database and RAG to provide the chatbot for contextual awareness.


XR Developer
GMind
•
Jul. 2023 - Oct. 2023
C#
Unity
Object-Oriented Programming (OOP)
Game Development
Game Design
• Used C# to implementing player mechanics and complex AI behavior of NPCs and player interactions.
• Gained a clear understanding of Object-Oriented Programming
• Refine tasks to help to achieve the vision of the game designer.Education
B.S. in Computer Science
Ecole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)
•Sep. 2021 - Sep. 2024
Focus: AI & Data Science

Japanese Language and Business Manner
Human Academy
•Oct. 2024 - Jan. 2025
Focus: Reached N4 Japanese Language Level

Languages
English
Native Language (IELTS 7.5)
Arabic
Native Language
Japanese
Conversational Level (JLPT N4)

Courses
Note: These are courses I\'ve taken. For certifications, please visit My Achievements / Publications / Certifications
Designing and Implementing a Microsoft Azure AI Solution
Microsoft
Feb. 2025
Microsoft Azure AI Fundamentals
Microsoft
Feb. 2025
Microsoft Azure Fundamentals
Microsoft
Feb. 2025
Practitioner Watsonx Assistant
IBM
Feb. 2025
Watsonx Orchestrate Intermediate
IBM
Feb. 2025
Linux Adminstration
New Horizons
Jul. 2023
Supervised Machine Learning
DeepLearning.AI
Aug. 2022
Cloud AWS Practitioner
Amazon
Oct. 2022
Security +
CompTIA
Apr. 2023
Network +
CompTIA
Aug. 2022
CompTIA A+
CompTIA
Aug. 2022

Freelance Projects
"IIG-HEC" Company Profile Website
- Jun. 2023 - Dec. 2023
A website fofeatures a clean and modern design that effectively showcases the company\'s services, projects, and blog section, providing visitors with a comprehensive overview of IIG-HEC.
JavaScript
ReactJS
NodeJS
ExpressJS
MongoDB
TailwindCSS
Firebase
Vercel




Contact Information
AhmedGalal11045@gmail.com
+20 1110333933
New Cairo, Egypt

Published Journal of Elsevier\'s Procedia
https://www.sciencedirect.com/science/article/pii/S1877050924029806
Published "Multi-Hop Arabic LLM Reasoning in Complex QA".
Presented in ACLing 2024, the 6th International Conference on AI in Computational Linguistics in Dubai,UAE.
Sep. 2024
Publication

Microsoft Certified: Azure AI Engineer Associate
https://learn.microsoft.com/api/credentials/share/en-us/Gallillio/FA9AAA1E4EAF1DC?sharingId=BF374C9707F46C52
Certified Microsoft Azure AI Engineer.
Studied for these 3 courses:
- Microsoft Azure Fundamentals
- Microsoft Azure AI Fundamentals
- Designing and Implementing a Microsoft Azure AI Solution
May. 2025
Certification

Winner at the GenAI Hackathon
https://www.linkedin.com/feed/update/urn:li:activity:7330556317721432068/
Won the Stakpak Hackathon hosted by Stakpak, for presenting the AI-powered Language Learning App shown under the Projects Section.
May. 2025
Award

Awarded The Times Highest Higher Education
https://theawardsarabworld.com/2024/en/page/2024
Recognized for innovative contributions in educational technology
For my work on My University\'s Chatbot Project. Awarded in The Arab Summit of Universities in Dubai University
Dec. 2024
Award

Awarded Top 3 Finalist in GESAwards Africa
https://www.linkedin.com/posts/ghana-society-for-education-technology_gesawards2024-edtech-innovation-activity-7265332297669746689-uv6Z?utm
My startup GPTube won Top 3 finalist in the GESAwards Africa.
Representing Egypt and North Africa internationally
Dec. 2024
Entrepreneurship

Japanese Language Proficiency
Achieved JLPT N4 level in Japanese Language during my studies at Human Academy
Jan. 2025
Language

AI Language Learning App
In Development
This AI-driven app offers a hyper-personalized language learning experience. Key features include a dynamic Word Bank, adaptive Duolingo-style mini-games, story generation using comprehensible input (90% known, 10% new words), and an FSRS-powered Spaced Repetition flashcard system for superior retention. An AI Chatbot Assistant provides tailored guidance, like a personal tutor.
Generative AI, NLP, FSRS Algorithm, Adaptive Learning, Gamification
Code: Not Available
Demo: Not Available

GPTube
An interactive tool that engages users with YouTube videos through a GPT-powered chatbot, utilizing TTS and STT for voice interaction. It features generating mock tests, correcting user answers, and creating PowerPoint presentations.
Main PageQuestion ExampleQuiz ExamplePresentation Example
Microsoft Azure
Google Cloud
ReactJS
Django
Langchain
Vector Database
RAG
OpenAI Function Calling
Code
Demo
Real-Time Facial Emotion Classification
Developed a real-time facial emotion classification system using transfer learning (MobileNetV2, VGG) and a custom CNN, achieving 83% accuracy on FER-2013 dataset using fine-tuned MobileNetV2 model.
Neutral ExpressionHappy ExpressionFearful ExpressionSad ExpressionSurprised Expression
OpenCV
CNN
MobileNetV2
VGG
Flask
Code
Demo
IIG-HEC Company Profile Website
A website for IIG-HEC Company Profile. With a clean and modern design, it showcases the company\'s services, projects, and a blog section.
IIG-HEC Company Profile WebsiteIIG-HEC Company Profile WebsiteIIG-HEC Company Profile WebsiteIIG-HEC Company Website
JavaScript
ReactJS
NodeJS
ExpressJS
MongoDB
TailwindCSS
Firebase
Vercel
Code
Demo
Data Visualer and Analysis Tool
A tool to visualize and analyze data. It provides a user-friendly interface for data exploration and model training, with features for data preprocessing.
MainHistogram EDAEncode ColumnDetailed EDAHandle NA
Scikit-learn
Numpy
Pandas
Matplotlib
Seaborn
Tkinter
Code
Demo
ESLSCA University Chatbot
A chatbot that streamlines University admissions. Awarded The Times Highest Higher Education Award 2024 for Technological Innovation. It automates document processing and enhances communication with real-time updates.
Note: This project is currently under development and has undergone several changes.
ESLSCA Chatbot Example
Microsoft Azure
Langchain
Django
OpenAI Function Calling
Vector Database
RAG
Code
Demo
My Portfolio Website
The website you are currently on! My personal portfolio website showcasing projects, skills, and achievements. Designed as a unique terminal-style website that showcases my skills and projects.
Explore the website Right Here!
Google Cloud
TypeScript
NextJS
ReactJS
TailwindCSS
Vercel
Code
Demo

"Brillium" AI SaaS
In Development
Brillium is an AI-powered LMS that converts PDF textbooks into interactive learning experiences. It generates quizzes, flashcards, and presentations, analyze student performance, and dynamically create questions for improvement. Teachers can monitor and edit content, while a chatbot serves as a personal assistant for students.

⚠️ This project is currently under development ⚠️
Under Development
Coming Soon!

Google Cloud
FastAPI
Tesseract OCR
Python
ReactJS
NextJS
NodeJS
MongoDB
TailwindCSS
Vercel
Code
Demo

AI Quickbooks CFO Assistant – Swipelabs
In Development
A lightweight AI-powered virtual CFO tailored for small business owners, designed to automate financial analysis and provide real-time decision support. Integrated with QuickBooks API for sync of financial data (invoices, A/R, expenses, cash flow). Delivered automated weekly digests via email/Slack summarizing revenue trends, burn rate, overdue invoices, and AI insights. Implemented a scoring algorithm to calculate a Financial Health Score using business-type-adjusted weights (e.g. Burn Multiple, Margin, Runway). Enabled founders to ask finance-related questions via email, receiving GPT-powered replies within minutes. Developed a read-only web dashboard showing financial KPIs, trends, and a diff-style summary of 'What changed this week?' Added tools for forecast simulation and budget tracking, including text-based scenario analysis and alerting for overspending.

⚠️ This project is currently under development ⚠️
Under Development
Coming Soon!

NextJS
Python
Supabase
QuickBooks API
Postmark
Code
Demo

Slack AI Assistant – Swipelabs
In Development
Built a GPT-powered Slack app designed to assist Swipelabs team members in managing client communication and internal workflows. The assistant enabled seamless interaction via direct messages, internal channels, and Slack Connect, with real-time pings, sentiment cues, and AI-suggested replies. Client package tracking and onboarding workflows, with manual input and automatic reminders for setup completion. Full integration with Trello, ClickUp, and Asana to track deliverables vs. obligations and ping responsible members when tasks were overdue. Smart monitoring of Slack Connect for unanswered messages, deadlines, and client tone, prompting appropriate follow-ups. CRM-style reminders for account managers, with intelligent follow-up nudges after meetings and inactivity alerts. Time tracking via integration or Slack-based input, and automatic weekly/on-demand performance reports sent to managers.

⚠️ This project is currently under development ⚠️
Under Development
Coming Soon!

Python
Flask
Slack API
Trello API
ClickUp API
Google Calendar API
PostgreSQL
NLP
Code
Demo


⚠️ This project is currently under development ⚠️
Under Development
Coming Soon!

TypeScript
ReactJS
NextJS
NodeJS
ExpressJS
MongoDB
TailwindCSS
Vercel
              All sections of the website: \'Terminal\', \'Chat Assistant Mode in the Terminal\', \'Projects\', \'About(with subsections inside it \'skills\', \'Timeline\', \'Professional Experience\', \'Education\', \'Freelance Projects\', \'Languages\', \'Courses\')\', \'Contact / CV\', \'My Achievements / Publications / Certification\', \'Your achievements(the achievements of the user using the website that they collect as they explore the website more)\'
              `,
            }
          ]
        },
        {
          role: "user",
          parts: [
            {
              text: "Do not give suggestions. From now on, whenever the user asks a question about my information, get the relevant parts from the data context, and answer the user's question using it"
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. From this point forward, I will only answer questions about your information by directly extracting relevant details from the provided data context and synthesizing them into a concise response. I will avoid offering any suggestions or advice beyond that."
            }
          ]
        },
        
        // Include previous chat history
        ...conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
        // Add the new message
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain"
      }
    };
    
    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the response text
    const content = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
    
    return content;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Sorry, there was an error communicating with me. Please try again.';
  }
} 
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
          role: "user",
          parts: [
            {
              text: `My name is Ahmed Galal Elzeky. (My nickname is Gallillio) I am an AI and software developer.\nBio\nI approach innovation with an AI-first mindset, I firmly believe in using AI tools along side with Software Engineering to bring advanced technology to life quickly and efficiently.\nDrawing on diverse international experiences, I design and deploy cutting-edge AI Solutions and Software Systems designed to streamline complex processes and deliver substantial value.\nLeveraging robust technologies like Azure, IBM Watsonx, React.js, Next.js, and Cursor.\nMy work has consistently delivered transformative results, earning recognition in esteemed International Publications like Elsevier's Procedia, Awards such as the Times Higher Education Award 2024, and through my startup, GPTuBE, which was recognized as a Top 3 finalist in the GESAwards Africa, respresing Egypt, and the entirety of North Africa internationally.\nSkills\nAI & Machine Learning\nNLP\nComputer Vision\nDeep Learning\nMachine Learning\nTensorFlow\nOpenCV\nLangChain\nPowerBI\n\nCloud & AI Platforms\nMicrosoft Azure\nGoogle Cloud\nIBM Watsonx\nIBM Cloud\n\nWeb & Application Development\nJavaScript\nTypeScript\nReactJS\nNextJS\nNode.js\nExpressJS\nFastAPI\nDjango\nFlask\nMongoDB\n\nREST APIs\n\nOpenAPI\nC#\nUnity\nTailwind\n\nDevOps & Tools\nGit\nCursor\nVercel\nV0\nPostman\nLinux\nAgile/Scrum\nNotion\n\nDesign & Collaboration\nFigma\nJira\nTrello\nSlack\n\nProfessional Experience\nAI Engineer\nIntelligent Systems (I-Sys)\n•\nFeb. 2025 - Present\nIBM Watsonx\nIBM Cloud\nDocker\nKubernetes\nOpenAPI Specification (OAS)\nLLMs\nData Pipelines\n• Collaborated the deployment of Watsonx-powered self-service robots, kiosk avatars, and omni-channel conversational AI systems that enhance customer engagement across our partner Telecommunication and banking companies Vodaphone and Bank Misr\n• Developed custom NLP modules within Watsonx.ai to support multilingual interactions in Arabic's regional dialects (Egyptian and Saudi) with high accuracy—to ensure a seamless customer experience.\n• Leveraged IBM Watsonx to power event robots that enabling features like automated registration (with ID QR code scanning and instant photo printing, interactive demonstrations, and real-time feedback collection.\n\n\n\nAI Developer Intern\nEnviron Adapt\n•\nAug. 2024 - Oct. 2024\nTensorFlow\nOpenCV\nKeras\nDeep Neural Networks\nImage Processing\nData Science\n• Using Tensorflow and OpenCV to create Siamese Networks that was used in an image recognition model to distinguish between identical trash bales and bales viewed from different angles, automating a previously manual task and significantly reducing company costs in storage and payments by thousands of Egyptian pounds.\n• Designed and implemented a validation model to assess image quality against stakeholder-defined requirements, ensuring compliance and improving precision in image verification processes.\n\n\n\nAI Developer Intern\nEcole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)\n•\nFeb. 2024 - Apr. 2024\nMicrosoft Azure\nLangchain\nOpenAI Function Calling\nVector Database\nRAG\n• Developed a project, earning ESLSCA University The Times Highest Higher Education Award 2024 in Technological/Digital Innovation at the Arab Summit of Universities, Dubai.\n• Used Langchain Framework and OpenAI Function Calling to build a GPT-powered (using Azure OpenAI) chatbot that guides prospective students, provides real-time updates, and automates document processing and verification.\n• Streamlined admissions by reducing processing times, enhancing communication, and reallocating staff for personalized support, boosting efficiency.\n• Integrated Chroma Vector Database and RAG to provide the chatbot for contextual awareness.\n\n\nXR Developer\nGMind\n•\nJul. 2023 - Oct. 2023\nC#\nUnity\nObject-Oriented Programming (OOP)\nGame Development\nGame Design\n• Used C# to implementing player mechanics and complex AI behavior of NPCs and player interactions.\n• Gained a clear understanding of Object-Oriented Programming\n• Refine tasks to help to achieve the vision of the game designer.Education\nB.S. in Computer Science\nEcole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)\n•Sep. 2021 - Sep. 2024\nFocus: AI & Data Science\n\nJapanese Language and Business Manner\nHuman Academy\n•Oct. 2024 - Jan. 2025\nFocus: Reached N4 Japanese Language Level\n\nLanguages\nEnglish\nNative Language (IELTS 7.5)\nArabic\nNative Language\nJapanese\nConversational Level (JLPT N4)\n\nCourses\nNote: These are courses I've taken. For certifications, please visit My Achievements / Publications / Certifications\nDesigning and Implementing a Microsoft Azure AI Solution\nMicrosoft\nFeb. 2025\nMicrosoft Azure AI Fundamentals\nMicrosoft\nFeb. 2025\nMicrosoft Azure Fundamentals\nMicrosoft\nFeb. 2025\nPractitioner Watsonx Assistant\nIBM\nFeb. 2025\nWatsonx Orchestrate Intermediate\nIBM\nFeb. 2025\nLinux Adminstration\nNew Horizons\nJul. 2023\nSupervised Machine Learning\nDeepLearning.AI\nAug. 2022\nCloud AWS Practitioner\nAmazon\nOct. 2022\nSecurity +\nCompTIA\nApr. 2023\nNetwork +\nCompTIA\nAug. 2022\nCompTIA A+\nCompTIA\nAug. 2022\n\nFreelance Projects\n"IIG-HEC" Company Profile Website\n- Jun. 2023 - Dec. 2023\nA website fofeatures a clean and modern design that effectively showcases the company's services, projects, and blog section, providing visitors with a comprehensive overview of IIG-HEC.\nJavaScript\nReactJS\nNodeJS\nExpressJS\nMongoDB\nTailwindCSS\nFirebase\nVercel\n"SelZeky" Company Profile Website\n - Mar. 2025 - Present (In Progress)\nDesigned with a sleek and contemporary aesthetic, this website highlights SelZeky's services and automates the recruitment process, while also featuring a dedicated blog section for updates and insights.\n\nTypeScript\nReactJS\nNodeJS\nExpressJS\nMongoDB\nTailwindCSS\nVercel\n\n"Leen" Company Profile Website\n- Mar. 2025 - Present (In Progress)\nThis ecommerce platform presents a user-friendly interface that showcases Leen's range of products and services, making it easy for customers to browse and shop online.\n\nTypeScript\nReactJS\nNodeJS\nExpressJS\nMongoDB\nTailwindCSS\nVercel\n\nContact Information\nAhmedGalal11045@gmail.com\n+20 1110333933\nNew Cairo, Egypt\n\nPublished Journal of Elsevier's Procedia\nhttps://www.sciencedirect.com/science/article/pii/S1877050924029806\nPublished \"Multi-Hop Arabic LLM Reasoning in Complex QA\".\nPresented in ACLing 2024, the 6th International Conference on AI in Computational Linguistics in Dubai,UAE.\nSep. 2024\nPublication\n\nMicrosoft Certified: Azure AI Engineer Associate\nCertified Microsoft Azure AI Engineer.\nStudied for these 3 courses:\n- Microsoft Azure Fundamentals\n- Microsoft Azure AI Fundamentals\n- Designing and Implementing a Microsoft Azure AI Solution\nApr. 2025\nCertification\n\nAwarded The Times Highest Higher Education\nhttps://theawardsarabworld.com/2024/en/page/2024\nRecognized for innovative contributions in educational technology\nFor my work on My University's Chatbot Project. Awarded in The Arab Summit of Universities in Dubai University\nDec. 2024\nAward\n\nAwarded Top 3 Finalist in GESAwards Africa\nhttps://www.linkedin.com/posts/ghana-society-for-education-technology_gesawards2024-edtech-innovation-activity-7265332297669746689-uv6Z?utm\nMy startup GPTube won Top 3 finalist in the GESAwards Africa.\nRepresenting Egypt and North Africa internationally\nDec. 2024\nEntrepreneurship\n\nJapanese Language Proficiency\nAchieved JLPT N4 level in Japanese Language during my studies at Human Academy\nJan. 2025\nLanguage\n\nGPTube\nAn interactive tool that engages users with YouTube videos through a GPT-powered chatbot, utilizing TTS and STT for voice interaction. It features generating mock tests, correcting user answers, and creating PowerPoint presentations.\nMain PageQuestion ExampleQuiz ExamplePresentation Example\nMicrosoft Azure\nGoogle Cloud\nReactJS\nDjango\nLangchain\nVector Database\nRAG\nOpenAI Function Calling\nCode\nDemo\nReal-Time Facial Emotion Classification\nDeveloped a real-time facial emotion classification system using transfer learning (MobileNetV2, VGG) and a custom CNN, achieving 83% accuracy on FER-2013 dataset using fine-tuned MobileNetV2 model.\nNeutral ExpressionHappy ExpressionFearful ExpressionSad ExpressionSurprised Expression\nOpenCV\nCNN\nMobileNetV2\nVGG\nFlask\nCode\nDemo\nIIG-HEC Company Profile Website\nA website for IIG-HEC Company Profile. With a clean and modern design, it showcases the company's services, projects, and a blog section.\nIIG-HEC Company Profile WebsiteIIG-HEC Company Profile WebsiteIIG-HEC Company Profile WebsiteIIG-HEC Company Website\nJavaScript\nReactJS\nNodeJS\nExpressJS\nMongoDB\nTailwindCSS\nFirebase\nVercel\nCode\nDemo\nData Visualer and Analysis Tool\nA tool to visualize and analyze data. It provides a user-friendly interface for data exploration and model training, with features for data preprocessing.\nMainHistogram EDAEncode ColumnDetailed EDAHandle NA\nScikit-learn\nNumpy\nPandas\nMatplotlib\nSeaborn\nTkinter\nCode\nDemo\nESLSCA University Chatbot\nA chatbot that streamlines University admissions. Awarded The Times Highest Higher Education Award 2024 for Technological Innovation. It automates document processing and enhances communication with real-time updates.\nNote: This project is currently under development and has undergone several changes.\nESLSCA Chatbot Example\nMicrosoft Azure\nLangchain\nDjango\nOpenAI Function Calling\nVector Database\nRAG\nCode\nDemo\nMy Portfolio Website\nThe website you are currently on! My personal portfolio website showcasing projects, skills, and achievements. Designed as a unique terminal-style website that showcases my skills and projects.\nExplore the website Right Here!\nGoogle Cloud\nTypeScript\nNextJS\nReactJS\nTailwindCSS\nVercel\nCode\nDemo\n\"SelZeky\" AI Sales Consultant SaaS\nIn Development\nSelZeky is an AI-powered sales consultant that uses NLP to understand customer needs and recommend products. It provides real-time updates and a chatbot for customer support.\nUnder Development\nComing Soon!\n\nMicrosoft Azure\nDjango\nVector Database\nRAG\nPython\nReactJS\nNextJS\nNodeJS\nMongoDB\nTailwindCSS\nVercel\nCode\nDemo\n\"Brillium\" AI SaaS\nIn Development\nBrillium is an AI-powered LMS that converts PDF textbooks into interactive learning experiences. It generates quizzes, flashcards, and presentations, analyze student performance, and dynamically create questions for improvement. Teachers can monitor and edit content, while a chatbot serves as a personal assistant for students.\n\n⚠️ This project is currently under development ⚠️\nUnder Development\nComing Soon!\n\nGoogle Cloud\nFastAPI\nTesseract OCR\nPython\nReactJS\nNextJS\nNodeJS\nMongoDB\nTailwindCSS\nVercel\nCode\nDemo\n\"SelZeky\" Company Profile Website\nIn Development\nDesigned with a sleek and contemporary aesthetic, this website highlights SelZeky's services and automates the recruitment process, while also featuring a dedicated blog section for updates and insights.\n\n⚠️ This project is currently under development ⚠️\nUnder Development\nComing Soon!\n\nTypeScript\nReactJS\nNextJS\nNodeJS\nExpressJS\nMongoDB\nTailwindCSS\nVercel
              All sections of the website: 'Terminal', 'Chat Assistant Mode in the Terminal', 'Projects', 'About(with subsections inside it 'skills', 'Timeline', 'Professional Experience', 'Education', 'Freelance Projects', 'Languages', 'Courses')', 'Contact / CV', 'My Achievements / Publications / Certification', 'Your achievements(the achievements of the user using the website that they collect as they explore the website more)'
              `
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
        {
          role: "user",
          parts: [
            {
              text: `The person using this chat is NOT Ahmed Galal Elzeky, he is a different person, interested in knowing more about Ahmed Galal Elzeky, so talk to the user in the first person, not as Ahmed Galal Elzeky, also, if the user asks about my projects, you should answer the question using the data provided.
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
Intelligent Task Routing App for Jira – Action Plan & PRD
Action Plan
Phase 1: Market Analysis & Validation – Confirm the market need by reviewing Jira user forums and Atlassian Marketplace data. The opportunity looks strong: Atlassian has over 300,000 customers (including ~45,842 large enterprise customers) and $4.4 billion annual revenue
atlassian.com
atlassian.com
. Yet the Marketplace (5,300+ apps, $2B+ in sales) has only a small fraction of AI-powered apps (~55 AI apps, well under 7%)
atlassian.com
marketplace.atlassian.com
. This validates a gap for an AI-driven task routing solution. We will gather user pain points (e.g. assignment delays, misrouted tasks, backlog overload) through surveys or interviews to ensure our app addresses real needs. Phase 2: Define Scope & MVP Features – Based on research, finalize the core use cases: intelligent task assignment, predictive prioritization, and workflow optimization. We will focus exclusively on Jira (not Confluence) per requirements. Intelligent task routing will be the primary feature unless evidence shows another AI use case has higher demand (so far, routing/prioritization seems top priority). Define the Minimum Viable Product (MVP) feature set (detailed in the PRD below) that delivers immediate value, such as AI-suggested assignees and priority labels on issue creation. Outline advanced features (full version) for later phases, like workload-based routing, deadline predictions, or broader AI insights. Phase 3: Architecture & Design – Plan the technical architecture using Atlassian’s Forge cloud platform for security and seamless integration. Jira’s comprehensive REST APIs will be used for reading and updating issues
developer.atlassian.com
. Set up Jira webhooks (or Forge triggers) for real-time issue events – e.g. issue created or unassigned events – to feed into our AI routing engine. Utilize Atlassian’s 30+ webhook event types with JQL filtering to ensure we only process relevant events (e.g. only tasks in certain projects or with certain labels)
developer.atlassian.com
. Design the AI model management dashboard for admins to configure OpenAI, Anthropic Claude, or Google Gemini models. The dashboard will allow selecting a model, ranking models by cost/performance, and adding new models easily. Create initial UX wireframes for how suggestions appear in Jira (e.g. a panel on the issue view with “Suggested Assignee” and confidence score, which the user can accept). Phase 4: Development (MVP) – Implement the Forge app with an event listener for issue creation/update. When triggered, have it call the selected AI model via API (OpenAI, Claude, etc.) to analyze issue data and predict the best assignee and priority. Use Atlassian’s Forge runtime to host the logic, taking advantage of its built-in auth and data storage for any learning data
developer.atlassian.com
. Start with one model (e.g. OpenAI GPT-4) to get a working end-to-end flow; then integrate the model selection framework. Develop the admin UI (using Forge UI or custom UI) for the model control panel. Ensure all Jira interactions (like assigning issues, adding comments, or setting priority fields) use the official Jira REST endpoints with proper scopes. Phase 5: Testing & Quality Assurance – Test the app in a small Jira Cloud instance. Create various scenarios to ensure the AI suggestions make sense (e.g. different issue types, components, varying team member availability). Use Atlassian’s sandbox and testing APIs to simulate events. Validate that webhooks are reliably triggering and that our app handles failures gracefully (e.g. if the AI API is down or returns low confidence). Conduct user testing with a few friendly beta customers to gather feedback on suggestion accuracy and UI clarity. Phase 6: Security Review & Compliance – Since the app deals with potentially sensitive issue data and calls external AI APIs, conduct a thorough security review. Forge’s security sandbox (data egress controls, authentication, and tenant isolation) will help protect customer data
developer.atlassian.com
. We will ensure compliance with Atlassian’s Marketplace security requirements (e.g. no storing of customer data outside unless necessary, offering data residency via Forge, and respecting privacy when sending data to AI providers – possibly allow opting out of certain fields being sent). Phase 7: Deployment & Marketplace Launch – Prepare the app listing on the Atlassian Marketplace with clear descriptions of features and benefits (focusing on how it saves time by auto-routing tasks). Set a pricing model (e.g. free trial for 30 days, then subscription per user or per instance tier). All Marketplace Cloud apps automatically have a 30-day free trial to encourage adoption. We’ll include documentation and screenshots in the listing. Submit the app for Atlassian’s approval (Forge apps typically require fewer security reviews due to the platform’s built-in safeguards). Once approved, release the MVP version. Phase 8: Marketing & Customer Onboarding – Announce the launch on Atlassian Community forums, LinkedIn, and relevant channels. Highlight the value proposition: reducing manual triage, faster response times, and smarter workload distribution. Possibly coordinate with Atlassian to get featured in the “Artificial Intelligence” category
marketplace.atlassian.com
or in Atlassian’s marketing (given they are pushing AI features). Prepare a short demo video and how-to guides for admins to configure the app and for team members to use the suggestions. Leverage early beta customer success stories as testimonials. Phase 9: Support & Iteration – Post-launch, provide prompt support via the Atlassian Marketplace Q&A and a dedicated support email or service desk. Monitor usage metrics and user feedback. If the AI suggestions are occasionally off-target, consider adding a feedback mechanism (e.g. “Was this assignment helpful?” thumbs-up/down in Jira) to gather data for continuous improvement. Iterate quickly with updates (Forge CI/CD allows fast deployments) to improve the AI models or tweak rules (for example, if a certain project needs a custom routing rule, allow project-level configuration). Phase 10: Roadmap Expansion – With a stable base, plan enhancements. This could include extending intelligent routing to other Jira entities (like sub-tasks or service desk tickets), incorporating more AI use cases such as summarizing long issue discussions or recommending related tickets (if market demand for those is evident). Also consider integration with Jira Service Management for support ticket routing (though Atlassian’s own AI covers some of that
atlassian.com
, there might be room to offer customization or multi-model choices). Evaluate the possibility of a Confluence integration (if future demand to route Confluence tasks or pages arises) as a separate product to avoid diluting the Jira app’s focus. Constantly revisit the model offerings – for instance, if OpenAI releases a new model or Google’s Gemini proves more cost-effective, update the dashboard to support it. The long-term goal is to maintain our first-mover advantage in AI-powered Jira apps and capture a large share of the 300k+ Jira customer base.
Product Requirements Document (PRD)

1. Market Fit and Opportunity
   Jira is used by hundreds of thousands of teams to track tasks, but traditional Jira workflows rely on manual assignment and prioritization. The market opportunity for an AI-powered routing app is compelling given Atlassian’s customer base and ecosystem size. Atlassian’s own reports show 300,000+ customers (with ~45k being large enterprises) and $4.4 B annual revenue
   atlassian.com
   atlassian.com
   – a vast install base hungry for productivity improvements. The Atlassian Marketplace itself has surpassed $2 B in lifetime app sales, with over 5,300 apps listed
   atlassian.com
   . However, only a tiny fraction of those apps leverage AI capabilities (roughly 55 AI-related apps in the Marketplace)
   atlassian.com
   marketplace.atlassian.com
   . This indicates a ripe opportunity to offer a differentiated AI app. By being an early entrant in Jira’s AI category, we can capture unmet demand from the ~93%+ of Jira users who currently have no AI add-ons. The lack of intelligent task routing is a common pain point, noted by users who struggle with manual triage, misallocated tasks, and backlog inefficiencies. Our solution directly targets this gap with clear ROI: faster issue resolution, balanced team workloads, and smarter prioritization. Given Atlassian’s push into AI (they’ve built 30+ AI features into their cloud platform recently
   atlassian.com
   ), we’re aligned with a growth trend, and customers will be receptive to augmenting Jira with AI to complement Atlassian’s native features. Competitive Landscape: On the Marketplace, a few apps offer AI for Jira (e.g. for writing issue descriptions or generating release notes), but none focus solely on intelligent task routing and prioritization. Atlassian’s own “Atlassian Intelligence” features provide some similar functions (for example, Jira Service Management can “intelligently route issues to the right person” and auto-prioritize incidents
   atlassian.com
   ), but these are limited to certain Jira products (like JSM) and require premium plans. Our app will bring advanced routing AI to any Jira project (Software or Core or JSM) and, importantly, allow the customer to choose from multiple AI models (OpenAI, Anthropic, Google) for flexibility. This multi-model approach and broad compatibility will differentiate us from both Atlassian’s built-in AI and other single-model plugins.
2. Target Problems and User Goals
   User Pain Points:
   Manual Task Triage: Project leads and Jira admins currently spend a lot of time manually assigning new tickets to the appropriate team member. Mistakes or delays in assignment mean some issues fall through the cracks or are picked up late.
   Poor Prioritization: Teams struggle to identify which issues are truly high priority. Important tasks can get lost in backlogs, while trivial issues might be addressed out of order. There is no intelligent prediction of what should be tackled first based on context or past data.
   Workflow Bottlenecks: Without an overview of team workload or issue complexity, work isn’t distributed optimally. Some team members end up overloaded while others are idle, and issues that require specific expertise may not reach the right person until late.
   Inefficient Routing in Support Projects: (If using Jira for service desks or internal support) tickets aren’t always routed to the subject-matter expert group initially, causing bouncing between teams.
   Core User Goals:
   Faster Issue Assignment: Users want new tasks to promptly reach the team member best suited to handle them, without a manager having to micromanage assignments. This means using context (issue type, components, keywords, historical assignment patterns) to find the optimal assignee.
   Improved Prioritization: Users (especially project managers and team leads) want help in identifying critical issues. The goal is an AI that can predict the relative urgency or importance of each new issue (or dynamically re-prioritize existing ones) so the team works on what matters most first.
   Optimized Workflow: The app should help streamline the flow of work. By routing tasks intelligently and flagging potential bottlenecks (e.g., if one developer has 10 high-priority issues while another has none, or if a task is stuck in a status longer than usual), it should optimize team productivity. Ultimately, the goal is shorter cycle times and higher throughput.
   Ease of Use and Trust: Users want these benefits without adding complexity. The goal is an AI assistant that works in the background, gently suggesting or automating improvements. It must be transparent (explain why it suggests a particular assignee or priority) so users trust it and can override if needed. Admins want control over the AI (which model is used, how aggressive the automation is) to feel confident in deploying it.
   No Data Silos: The solution should work within Jira, not as an external tool. Users want to see the recommendations right in their Jira issues or boards, maintaining a single source of truth. They also want assurance that their data (issue descriptions, etc.) isn’t exposed inappropriately – so the app should use AI in a secure, compliant way.
   By addressing these problems, our app will help teams meet goals of faster response times, balanced workloads, and more predictable deliveries. Success will be measured in metrics like reduced time from issue creation to assignment, fewer overdue high-priority issues, and positive user feedback (e.g. team leads feeling “in control” of the chaos).
3. Key Use Cases and User Stories
   Below are the primary use cases with corresponding user stories that illustrate how the intelligent routing app will be used:
   Use Case 1: Automatic Assignment of New Issues
   User Story: “As a Jira project lead, I want new issues to be automatically assigned to the most appropriate developer or team, so that no ticket sits unowned and work is evenly distributed.”
   Details: When a new issue is created (e.g., a bug report or feature request), the app analyzes its content (title, description, tags). It might detect, for example, that the issue is related to the database component and that Alice is the expert in that area with available capacity – so it assigns to Alice (or suggests Alice to the reporter/lead for assignment). If automatic assign is enabled, it posts a comment like “🤖 Assigned to Alice by AI (reason: issue about Database, Alice recently resolved similar issues).”
   Use Case 2: Suggesting Priority Level
   User Story: “As a team member, I want the system to suggest a priority (Critical, High, Medium, Low) for each incoming issue based on its likely impact, so we can tackle urgent issues first.”
   Details: The app’s AI model predicts issue priority or severity from the description (e.g., an issue mentioning “security vulnerability” might get flagged as High). Upon issue creation, it could set a provisional priority field or add a label/comment “AI-predicted priority: High” for the triage team to confirm. Over time, the model learns from any adjustments (if users often change the AI’s suggestion, it adapts).
   Use Case 3: Workload Balancing (Re-routing)
   User Story: “As a Scrum Master, I want the system to identify when a team member is overloaded and suggest re-routing some tasks to others, so that no single person becomes a bottleneck.”
   Details: The app periodically checks team workload (e.g., number of open issues per person, or story points assigned). If it finds imbalance – for instance, Bob has 10 tasks while Charlie has 2 – it might suggest reassigning certain tasks from Bob to Charlie (perhaps those where Charlie has the skills). This could appear as a notification or in a dashboard view for the project lead to approve.
   Use Case 4: Sprint Planning Aid
   User Story: “As a Product Owner, I want help deciding which items to pull into the next sprint by seeing which open tickets are highest priority or most related to our goals, so I can prioritize the backlog intelligently.”
   Details: In the backlog view, the app can highlight or sort issues by an “AI priority score” or flag items that are frequently referenced (e.g., many comments or links, indicating importance). This aids planning meetings. The AI might also consider factors like customer-reported issues or due dates in scoring.
   Use Case 5: Intelligent Escalation
   User Story: “As a support engineer (using Jira Service Management), I want the app to detect when a ticket isn’t resolved in a timely manner or has a negative customer sentiment, and automatically escalate it to a senior agent or notify management.”
   Details: For Jira instances used in ITSM, the app listens to issue updates. If an issue remains in “Open” state beyond SLA or the AI detects frustrated language in comments, it can alert a supervisor or change the assignee to a dedicated escalation team. (This use case extends beyond pure assignment into workflow optimization, showing the app’s potential breadth.)
   Each of these use cases emphasizes how different roles in a team (project lead, developer, support agent, etc.) interact with the intelligent routing app to achieve their goals. We will prioritize Use Case 1 (auto-assign) and Use Case 2 (priority suggestion) in the MVP, as they address the most immediate pain (ensuring every issue has an owner and urgency is known). Use cases 3-5 can be phased in as advanced features once the core is in place.
4. Feature Set and MVP vs Full Version
   The app’s features are divided into MVP (Minimum Viable Product) – the essential capabilities to deliver value immediately – and Full Version – enhanced capabilities to be developed after validating the MVP. Below is a breakdown: MVP Features:
   AI-Powered Assignee Recommendation: For every new issue created in Jira, the app determines the best-fit assignee. This can operate in two modes: “Suggest” (the app adds a suggested name but doesn’t change the issue) or “Auto-Assign” (the app assigns the issue directly). Initial logic uses issue text, components, and past assignment data. Example: A backend bug is auto-assigned to the backend team lead based on keywords and history.
   Priority Prediction: The app predicts an issue’s priority level (or whether it’s likely to be a blocker vs minor) using natural language processing on the description. It then either sets a Priority field or tags the issue (e.g., adds a label “AI-Priority-High”) for team review
   atlassian.com
   .
   Model Selection Dashboard (Admin UI): A settings page accessible by Jira admins/project admins where they can configure which AI model to use. This includes a list of available models (OpenAI GPT-4 or GPT-3.5, Anthropic Claude, Google Gemini, etc.), with toggles or a ranking slider. The admin can input API keys or credentials for each model if required, and select a primary model and fallback. The interface also shows basic info like cost per call (if known) or an estimated performance score to help decision-making.
   Basic Workflow Integration: The app listens to key Jira events (issue created, issue reopened, etc.) via webhooks/Forge triggers. It filters events using JQL (e.g., only issues of certain type or in certain projects, so it doesn’t act on irrelevant updates)
   developer.atlassian.com
   . For MVP, triggers will focus on new issue creation and possibly issue state changes (for re-routing if an issue goes unassigned too long).
   Feedback Mechanism (simple): MVP will include a way for users to give feedback on suggestions. For example, if a suggestion was accepted or overridden, the app can learn from that. A simple implementation: when a user changes the AI-assigned person, we log that, or we provide an optional “thumbs up/down” link in the issue comment that users can click (“Was this assignment helpful?”). This data goes into improving the model or adjusting confidence thresholds.
   Security & Privacy Controls: In the MVP, ensure that the admin can configure what data is sent to the AI. For instance, an option to exclude certain fields (like private comments or customer data) from the prompt sent to the model. Also, prominently communicate that no data is stored outside Jira except transiently for model analysis, and that we use secure API calls (e.g., via HTTPS). This builds trust with users.
   Full Version (Planned) Features:
   Advanced Workload Management: A dashboard for project leads showing team members and their current issue load (open issues, story points, etc.), with AI suggestions on redistributing work. Could include an “Auto-Balance” button that reassigns some tasks in one click (with confirmation).
   Context-Aware Assignment (learning from history): Over time, the app will train on the organization’s Jira data. The full version might include a lightweight machine learning model stored in Forge or on our servers that improves suggestions by learning who usually fixes what (e.g., Bob always fixes login issues, so assign similar new issues to Bob). The MVP uses generic AI, but full version incorporates org-specific training.
   Integration with Atlassian Teams and Skill Profiles: If the Jira instance has user profile data or if the company maintains a “skills directory,” the app can integrate that. Full version could allow an admin to tag users with skills or team names, and the AI will use those tags in routing (e.g., issues labeled “mobile” go to the “Mobile” team’s queue).
   AI Workflow Optimization Tips: Beyond routing individual tasks, the app could analyze the overall workflow. For example, it might notice “Tasks in QA column often sit >5 days” and suggest adding an extra QA resource or sending a notification. It could also recommend Jira automation rules (“Consider an automation to close stale issues – want to enable it?”). These insights elevate the app from reactive to proactive process improvement.
   Multi-Language Support: If the Jira instance has issues in multiple languages (English, Spanish, etc.), the AI should handle them. Full version could integrate translation or multilingual models to support non-English issue analysis.
   Confluence and Bitbucket Context (future idea): In later versions, the app might draw context from linked Confluence pages or Bitbucket commits. E.g., if an issue is linked to a Confluence spec that lists an owner, use that info in assignment. This crosses into other products but can be a selling point for deeper Atlassian integration (though our focus remains Jira-first).
   Enterprise Reporting and Logs: For enterprise customers, provide logs of AI actions – e.g., an admin can see a report “This week AI auto-assigned 120 issues, suggestions accepted 90% of the time.” Also allow exporting this data for auditing. Large companies will want to monitor and fine-tune how the AI is used.
   Customization & Rules: Full version will let admins set custom rules or override. For example, “For Project X, always assign bugs to Triager team first, regardless of AI.” Or “Never auto-assign issues with security label, leave those for manual review.” This rule system can coexist with AI (AI suggests, but rules can veto or adjust suggestions).
   To summarize the feature roadmap, here’s a high-level table of MVP vs. Full Version features:
   Feature Description MVP Full Version
   Intelligent auto-assignment AI suggests or assigns best owner for new issues Yes ✅ Yes (improved accuracy with learning)
   Priority prediction AI tags issues with likely priority level Yes ✅ Yes (more nuanced, e.g. predicts story points)
   Model selection (OpenAI, etc.) Admin can choose AI model, configure keys Yes ✅ Yes (more models, dynamic weighting)
   Admin dashboard & controls Basic settings UI, enable/disable features Yes ✅ Yes (advanced configs, custom rules)
   Feedback capture Simple thumbs-up/down or learning from reassignments Yes ✅ Yes (robust training from historical data)
   Workload balance suggestions – No Yes (dashboard & auto-balance)
   Workflow optimization insights – No Yes (bottleneck alerts, tips)
   Multi-project/enterprise support Works across multiple projects (Jira-wide) Yes (Jira-wide) Yes (with enterprise reporting)
   Security & privacy settings Basic (opt-out fields, no data retention) Yes ✅ Yes (more granular controls, compliance certifications)
   (Table: MVP vs Full Feature Set) The MVP delivers the core value: automatic intelligent task routing and prioritization within Jira, plus the necessary controls to use it confidently. The full version builds on that foundation to cater to more complex needs (larger teams, more customization, continuous improvement). This phased approach ensures we can deliver value quickly and then expand with real user input and market traction.
5. UX/UI and Flow Design Requirements
   Overall UX Philosophy: The app must feel like a natural extension of Jira. It should be minimally intrusive (not disrupt existing workflows) but highly accessible (easy to notice the AI suggestions when you need them). We will use Jira’s design patterns so that the UI elements (like panels, dialogs, icons) look native. All text will be clear and straightforward (e.g., “Suggested assignee: Alice (AI)” rather than any marketing language). Since our audience ranges from technical developers to project managers, the UI should be intuitive for all – likely by using familiar Jira UI locations such as issue glance panels or custom fields. Key UI Components & Flows:
   Issue View Panel: On each Jira issue, when opened, the app will display an “AI Suggestions” panel (perhaps in the right sidebar or as an issue glance module). This panel shows info like:
   Suggested Assignee: e.g., “🏷 Suggested Assignee: Alice Johnson (Confidence: 90%)” with an “Apply” button if not auto-assigned. If auto-assign is enabled, it might show “Assigned by AI to Alice Johnson” with an option to change.
   Suggested Priority: e.g., “🔮 Priority Prediction: High” which could either auto-set the Priority field or just inform the user, depending on settings.
   Possibly a short explanation: “Why?” link or tooltip that when clicked says “Based on issue tags and past assignments, Alice has resolved 5 similar issues.” This transparency builds trust.
   A feedback control: e.g., a thumbs-up/down icon so the user can tell the app if this suggestion was good or not. Alternatively, if the user changes the assignee manually, the app can pop up “Thank you, we’ll learn from this adjustment” in the panel.
   Admin Configuration UI: We will create a Jira admin page (accessible via Jira Settings > Apps > “AI Task Router” for instance). This page (the model control dashboard) has the following sections:
   Models Management: A list of AI model options with toggles. For MVP it might list: “OpenAI GPT-4”, “OpenAI GPT-3.5”, “Anthropic Claude 2”, “Google Gemini (Beta)”. Each option has a checkbox to enable/disable and maybe a dropdown to set which is primary vs secondary. If multiple are enabled, we allow ranking (perhaps drag-and-drop to order or a numeric priority). For each model, if needed, there’s a field to enter API key or authentication. We’ll also display info like expected cost per 1K tokens and a note on performance (e.g., “GPT-4: Highest accuracy, higher cost; GPT-3.5: Fast and cheap, good for simple tasks.”).
   Feature Toggles: Admin can turn on/off specific features: “Auto-assign new issues (if off, only suggests)”, “Auto-set priority field”, “Reassignment suggestions for overloaded users”, etc. Each toggle has a description. For example, “🔄 Auto-Assign – If enabled, the AI will automatically assign the issue to the suggested person. If disabled, it will only comment with a suggestion for human to assign.”
   Scope & Filters: Admin can define if the app runs on all projects or only specific ones. Perhaps a multi-select of projects or a JQL filter input. For instance, they can input project in (ABC, XYZ) or labels = "AI-route" to restrict usage. (This prevents unwanted suggestions in projects where they don’t make sense.)
   Logging/Feedback: A section where the admin can see recent AI actions (e.g., “Ticket ABC-123: suggested John, accepted”, “Ticket DEF-4: auto-assigned to Team Lead”). This provides visibility. They might also see aggregate stats: suggestion acceptance rate, etc. (Some of this might come in a later version, but basic logging in MVP is good for trust).
   Help & Documentation: Link or embedded FAQ about how the AI works, data usage, etc., to reassure users.
   Onboarding Flow: The first time an admin installs the app, a short onboarding should guide them. Possibly a welcome message: “Welcome to Intelligent Task Routing! Let’s configure your AI models and preferences.” It could be a step-by-step wizard: select model, choose projects, decide auto-assign vs suggest mode. This ensures the app doesn’t sit idle due to misconfiguration. Also, we might add a sample issue or simulation: “Try it out – click to analyze a sample issue” to build confidence that it works.
   User Interaction Flow (for a developer or team member):
   Developer creates a new Jira issue (or a customer raises a ticket in a portal).
   Upon creation, if auto-assign is on, the issue is immediately assigned by the app. The user might notice a system comment like “AI Auto-assign: set assignee to Alice (Database component expert).” If viewing in real-time, the assignee field populates a second or two after creation.
   If auto-assign is off (suggest mode), the issue might show up as unassigned in the backlog, but with a visual cue – e.g., the issue card could have a label or the panel on opening it shows “Suggested: Alice”. Jira’s UI doesn’t natively show suggestions in the list, so we might rely on either a custom field (like a field “Suggested Assignee” which our app writes to and which can be shown in the issue list columns) or just on the issue detail.
   The team member or lead can click “Apply suggestion” if they agree, which triggers our app to officially assign the issue (via a backend call).
   If the suggestion is wrong, they simply assign someone else as usual. Our app detects that (via the assignment update event) and can learn from it.
   For priority, similar flow: if auto-set, the Priority field is set on creation; if not, maybe a label or comment suggests it and the PM can confirm by setting the field.
   Visual Design Elements: Use icons/emojis to make it intuitive (e.g., a small robot icon or magic wand icon to denote AI suggestion). But avoid anything too flashy. Colors: align with Jira’s scheme, maybe use Atlassian blue for highlights. Error states: If the AI fails (say the external API didn’t respond), the UI could show a subtle note: “AI suggestion not available at this time” so users know it tried. Loading indicators: if needed (the model call might take a second or two), we can show a spinner in the panel with “Analyzing issue…”.
   Mobile Considerations: Many users access Jira via mobile app. The app’s core functions (assignment) should still work (since assignment via automation happens server-side). But our UI (which is mostly for admin config and viewing suggestions) should also be accessible. Forge UI is generally responsive, and Jira mobile might show issue glance panels differently. We should test that, or at least ensure that any comments or fields we use for suggestions are visible on mobile. UX Validation: We will do a usability test with a prototype (perhaps using Atlassian’s UI kit to mock up the suggestion panel) with a few users. We’ll observe if they notice the suggestions, if they understand how to act on them, and if the admin finds the settings clear. The design aim is that the app saves time and does not introduce confusion – if a user ever says “I wasn’t sure what the AI was doing” we’ll adjust the UI to be clearer (like adding the “Why this suggestion?” info or tweaking wording).
6. System Architecture and Model Control
   Overall Architecture: The app will be built on Atlassian’s Forge platform, meaning it runs within Atlassian’s cloud infrastructure for Jira. This gives us immediate benefits: security, scalability, and easy integration with Jira’s UI. The core components of the system are:
   Event Listener (Forge Function): A backend function triggered by Jira events (issue created, updated, etc.). In Forge, this is configured via the manifest as a Product Trigger on Jira issue events. When an event fires, Jira (cloud) will invoke our function with details of the issue. We can filter events by JQL so we only get relevant ones (Forge supports this similarly to Connect webhooks filtering)
   developer.atlassian.com
   . For example, our listener might only receive events for issues where assignee is empty, to focus on unassigned issue creation.
   AI Processing Module: Within the Forge function, once triggered, we handle the logic. This includes preparing the prompt for the AI model (e.g., compile issue summary, project context, maybe recent similar issues). Then we call the selected AI model’s API. Forge allows outgoing HTTP calls using the fetch API (with certain egress restrictions). We will have stored the API keys securely (Forge provides a secure storage for secrets). Depending on admin’s model choice, we call OpenAI’s endpoint, or Anthropic’s, etc.
   Decision Logic: The AI’s response (e.g., recommended assignee = “Alice”, confidence 0.9) is processed. The app might cross-check with Jira data (ensure Alice is active, not on vacation – maybe check a custom “out of office” flag if available, or that Alice has < X open tasks if balancing). If all good and auto-assign is enabled, the app will then call Jira’s REST API to set the assignee. Jira’s REST API is extensive, allowing us to update issues programmatically
   developer.atlassian.com
   . This call is authenticated through Forge (which handles auth via installed app permissions).
   Data Storage: We will utilize Forge’s storage API for any persistent data. For MVP, this includes admin configuration (which model is selected, feature toggles, etc.) and possibly a cache of previous assignments or feedback. Forge storage is scoped to our app and is tenant-isolated (each customer’s data is separate) and can respect data residency requirements
   developer.atlassian.com
   .
   Front-end UI: For the admin pages and any issue panel UI, Forge provides two options: UI Kit (pre-defined components) or Custom UI (React-based). Given the need for a dynamic, possibly richer admin UI (with model lists, etc.), we might choose Custom UI for the settings page. This will be an iframe running in the user’s browser but backed by our Forge resolver for data. The issue panel might be simpler (UI Kit could suffice for showing text and a button), but custom UI could give us more flexibility (e.g., a more interactive feedback widget). We will weigh performance and complexity and likely use UI Kit for simple parts and Custom UI for the complex config screen.
   Integration with Jira APIs: We’ll leverage multiple Jira Cloud REST APIs:
   Issue API: to read issue details (if event payload is not enough) and to perform updates like setting assignee, priority, adding comments.
   Search API: possibly to find similar past issues (for context to the AI or to implement a “similar issues” feature).
   User API: to fetch user lists (for example, to know all potential assignees in a project).
   These interactions are straightforward with Forge’s @forge/api library and require us to declare proper OAuth scopes in manifest (e.g., write:issue, read:user, etc.).
   External AI APIs: The app will integrate with external AI services. We anticipate supporting:
   OpenAI API: Models like GPT-4, GPT-3.5 – requires internet access. Forge’s egress restriction means we need to specify the allowed domains (api.openai.com).
   Anthropic Claude API: similar approach (specify Claude’s API domain).
   Google Gemini (if available via API): Possibly via Google Cloud AI services. We might integrate via a Google Cloud function call or their endpoint, with appropriate auth (service account or API key).
   We will design a common interface in our code so that swapping models is easy (e.g., a function getSuggestedAssignment(issue, model) that internally calls the chosen model’s API).
   The admin’s selection from the dashboard determines which model function is invoked. We might also implement a fallback chain: if Model A fails (timeout or error), try Model B if configured (to increase reliability).
   Response times: We aim for sub-2-second response from AI for a good UX. We will use streaming or optimize prompts if needed. If an AI call takes too long, our app might respond with a default (no suggestion) to avoid blocking Jira’s operations.
   Scalability & Performance: Forge is serverless (runs on AWS Lambda under the hood)
   developer.atlassian.com
   , so it can scale to handle many events in parallel across customers. Each event is processed independently. We must ensure our code is efficient – e.g., not making unnecessary Jira API calls or overly large prompts to AI. We’ll enforce a reasonable token limit on prompts (maybe summarize issue description if it’s very long, or ignore extremely large comment histories for now). For large enterprises with thousands of issues per day, we might need to handle bursts of events. Webhooks are generally delivered reliably but not guaranteed in real-time; however Atlassian’s architecture and our use of Forge events means it’s near real-time. If an event is missed or delayed, it’s not critical (issue will just remain unassigned a bit longer, which is no worse than today). Architecture Diagram: The app runs on Atlassian Forge, ensuring security and scalability. Jira events trigger our Forge function, which calls external AI model APIs and then updates Jira via REST API. The Forge runtime (powered by AWS Lambda) isolates the app and controls data flow to external services
   developer.atlassian.com
   . This setup enables real-time intelligent routing within the Jira cloud ecosystem. Security Considerations: Atlassian Forge provides a strong security foundation (code runs in a sandbox with enforced data egress rules)
   developer.atlassian.com
   . Our app will only transmit the necessary data to the AI models – likely the issue summary and description, perhaps the issue type/project (to give context). We will avoid sending user personal data or any passwords/secure info from issues (and we’ll document to users that they shouldn’t put secrets in tickets anyway if they enable AI). The admin will have to input API keys for the models; these will be stored encrypted in Forge storage and never exposed to other users. Forge’s security model means we do not handle credentials directly on our servers – Atlassian manages the environment, reducing risk. We’ll also comply with Atlassian’s security checklist for Marketplace apps (including things like having a privacy policy, letting user opt-out or delete data if needed, etc.). If a customer is in a regulated industry worried about data leaving the Atlassian cloud, they can choose not to use the feature or possibly choose a model that offers on-premise (though currently these models are cloud APIs). Over time, if Atlassian offers an “Atlassian Intelligence API” (their own in-house AI), we might integrate that as an option for customers who prefer all processing within Atlassian.
7. Integration with Jira and Atlassian Platform
   Integrating with Jira is central to this app. Here are the details of how we’ll use Atlassian’s provided mechanisms:
   Jira REST APIs: The app will make extensive use of Jira Cloud REST APIs for core actions:
   Setting assignee: PUT /rest/api/3/issue/{issueIdOrKey}/assignee with the accountId from our AI suggestion.
   Setting priority or other fields: via PUT /rest/api/3/issue/{issueIdOrKey} with the fields object (priority).
   Adding comments for suggestions or logging: POST /rest/api/3/issue/{key}/comment.
   These APIs allow full control over Jira issues
   developer.atlassian.com
   . We’ll include the appropriate OAuth scopes (e.g., write:jira-work, read:jira-work) in the app manifest so Jira grants our app permission to do this when installed.
   Webhooks / Events: We will subscribe to Jira issue events rather than use polling. Specifically, the Jira Cloud platform can send events for “issue created”, “issue updated”, etc. Forge makes this simple via the triggers. We’ll subscribe to jira:issue_created and possibly jira:issue_updated (filtered for when an issue is edited from unassigned to assigned or similar cases for re-routing). JQL filtering will be applied to focus events (e.g., assignee IS EMPTY for creation events, so we only act on initially unassigned issues, or issue.status changed to InProgress if we had a feature around that). Atlassian documentation confirms JQL can filter certain events to reduce noise
   developer.atlassian.com
   . Using events ensures real-time integration – as soon as something happens in Jira, our app reacts. This is Atlassian’s best practice (better than periodic polling)
   images.g2crowd.com
   .
   Forge vs Connect vs OAuth: We choose Forge for this app, leveraging Atlassian’s native cloud app toolkit. Forge gives us:
   Simpler authentication (the app is automatically authenticated to Jira via installation, no need to handle JWT or OAuth tokens ourselves).
   Sandboxed environment (Atlassian handles the hosting, and our code runs with built-in trust)
   developer.atlassian.com
   .
   Automatic scaling and no server maintenance.
   Forge also has the Forge UI components which we’ll use for UI integration. If we had gone with Connect (the older framework), we’d host our own web service and manage auth, which is more overhead and potential security exposure. Forge’s limitations (like 25MB memory, 10s execution time) are acceptable given our use case (short AI calls and issue updates). We’ll ensure that if an AI call might exceed time (e.g., a slow model), we handle it asynchronously or keep within limits (maybe by requesting only needed info).
   Jira Forge Modules: We will use the following Forge modules:
   Trigger module: to handle events (as discussed).
   Jira Issue Glance or Issue Panel module: to add our AI suggestion panel in the issue view. The “issue glance” shows an icon in the sidebar; when clicked, it opens our panel. This is a good place for non-intrusive suggestions.
   Jira Admin Page module: to create a configuration page under the Jira admin section (for site admins).
   Possibly a Custom Field module: We might create a read-only custom field “AI Suggested Assignee” that gets populated. This field could be placed on the issue screen, and can also be shown in issue lists. This might be useful for visibility, but since it’s read-only and derived, we might also choose not to clutter custom fields and use comments/panels instead.
   Forge UI Tech: For the admin page, likely custom React (Forge Custom UI) loaded under the admin route. For the issue panel, Forge UI Kit might suffice (just showing text and a button).
   JQL and Automation Integration: Our app’s suggestions should not conflict with Jira Automation rules that admins might have (some might have existing auto-assign rules). We’ll note in docs that if an Automation rule assigns issues, they might want to disable it in favor of our smarter system or scope our app only to projects where no such rule exists. Conversely, our app could work alongside Automation: for instance, if our suggestion adds a comment, a Jira Automation could pick that up – but we need to ensure no infinite loops (we’ll set a flag in the comment or a hidden field like “AI-assigned” to avoid re-triggering).
   Testing in Forge: We will use Atlassian’s development mode to test the app in a test Jira cloud instance. Forge has a tunneling feature to run code locally for easier debug. We’ll write unit tests for our functions (Forge allows testing business logic separate from the cloud execution).
   Continuous Deployment: Forge CLI allows version deployments. We’ll maintain proper versioning – e.g., MVP as v1, subsequent features as v2, etc., and provide upgrade notes for admins (though most updates will come transparently via the marketplace).
   Performance Monitoring: While Forge doesn’t yet provide an in-depth performance dashboard, we will add simple logging around key steps to measure time taken (for AI API calls especially). If needed, we can instrument the code to send us (the app vendor) anonymized telemetry on response times or errors (complying with privacy rules). Atlassian might also show invocation counts and error rates in their developer console. Ensuring the app’s integration calls do not slow down Jira is critical – our event processing is asynchronous to user actions, so it should not block the user’s UI (except that assignment might happen a second later).
8. Monetization Strategy
   Our monetization approach balances accessibility (to encourage adoption, given it’s a new type of app) with sustainability (covering the cost of AI API usage and generating profit). Key points:
   Pricing Model: We plan to list the app as a paid subscription on the Atlassian Marketplace, with a free 30-day trial (which Atlassian Marketplace supports by default). The pricing will likely be tiered based on the Jira user tier (Atlassian requires user-based pricing for many apps). For example, $X/month for up to 10 users, $Y/month for 11-100 users, $Z/month for 100+ users, etc. This aligns with Atlassian’s standard pricing model and makes procurement easy (it’s just added to their Atlassian bill).
   Value-based Pricing: We’ll set price points that reflect the value delivered (time saved in triaging issues can be significant for a team). However, we must also account for our costs: calling GPT-4 or other models has a per-token cost. Our pricing should cover an average usage of the AI. If a customer heavily uses it (e.g., thousands of issues per month), that’s fine because they’ll likely be a larger tier paying more. We will monitor usage to ensure our margins are healthy.
   Cost Control Features: In the model dashboard, we’ll provide options to use cheaper models or limit usage. For instance, an admin could set “use GPT-4 only for critical projects, use GPT-3.5 for others” by installing two instances or via config – but more simply, if cost is a concern, they pick a cheaper model. We might also allow setting a daily limit (like “only analyze up to 100 issues/day”) in case they fear runaway costs – though since billing is fixed subscription, this is more about our protection. If needed on our end, we could implement a fair-use cap and contact the customer if they vastly exceed typical use.
   Upsell Higher Tiers with AI Benefits: We could offer a basic version with limited features or using only basic AI (like GPT-3.5) at a lower price, and a “Pro” version with all advanced features (workload dashboard, etc.) and better models at a higher price. Alternatively, keep one version but price by user count and ensure it covers it. Given less than 7% apps use AI, customers might expect it to be premium but they also need to be convinced of ROI. We’ll likely start with a moderate price to encourage adoption and can adjust as we get feedback.
   Marketplace Dynamics: Atlassian takes a 25% cut of Marketplace sales (for cloud apps). We account for that in pricing. We’ll also consider offering discounts for annual subscriptions (some customers prefer that).
   No Cost for Inactive Projects: We should clarify that we don’t charge per issue or per model call beyond the subscription. This is simpler for customers. Internally, we ensure the subscription revenue exceeds our variable costs. If we foresee heavy usage by some, we might have to adjust pricing or have an “fair usage policy” but ideally not – simplicity helps adoption.
   Scaling Revenue with Adoption: If we capture even 1% of Atlassian’s 300k customers in the first year, that’s 3,000 customers. At an average ~$50/month (just a rough mid-tier guess), that’s $150k/month. There’s significant upside if we become a top app. The scaling potential is high because as more teams rely on Jira, the need for optimization grows. Also, enterprise customers (45k of those)
   atlassian.com
   might pay more for custom enhancements or dedicated support – we can offer an enterprise tier with priority support or even custom model training (as a future monetization path).
   Marketing & Sales Channel: We rely primarily on Atlassian Marketplace exposure (listings, being in the “AI” collection, possibly getting Cloud Fortified status eventually to build trust). Additionally, we might partner with Atlassian Solution Partners to recommend our app to their clients. If direct sales needed for large orgs, we’ll prepare collateral showing productivity gains.
   Retention and Expansion: The app’s stickiness will be high if it integrates deeply into workflows. We’ll track usage; if a customer isn’t using it much, we may reach out to help them configure it or demonstrate features (to reduce churn after trial). New features added (like those in full version) will be provided to existing subscribers, giving them continuous value and justification to renew.
   Alternate Monetization (if any): For now, straightforward subscription is best. We could consider usage-based pricing (charging per issue analyzed), but that’s complex and not in line with most Marketplace apps. Instead, we eat the cost for heavy users and make up from light users – typical SaaS approach.
   In summary, our monetization strategy is a premium app with subscription licensing via Atlassian Marketplace. We’ll fine-tune the price to ensure it’s not a barrier (teams should feel the app “pays for itself” in time saved). With Atlassian’s large customer base, even a small penetration will yield significant revenue, and being among the first AI apps gives us a chance to command a good price if value is clear.
9. Launch Plan and Marketing
   Launch Timing: We aim to launch an MVP on the Marketplace as soon as it’s robust (targeting a beta release within a few months of development). Ideally, we align with an Atlassian event or announcement – for instance, Atlassian’s annual Summit or Team conference, where AI is a hot topic, could amplify our marketing if we release around then. But we won’t delay unnecessarily; an early launch helps us gather real user feedback. Marketplace Listing: We will create a compelling listing on Atlassian Marketplace:
   Clear title and tagline (e.g., “Intelligent Task Routing for Jira – AI-powered issue assignment and prioritization”).
   Several screenshots or even a short GIF showing an issue being auto-assigned by the bot, and the admin settings screen.
   A short video (2-minute demo) demonstrating the value: perhaps showing “Before (manual triage chaos)” vs “After (AI organizes your Jira)”.
   Key benefits in bullet points (“✅ Auto-assign issues to the right people in seconds”, “✅ Focus on what matters with AI-driven priority cues”, “✅ Configurable AI models – use OpenAI, Anthropic, or Google AI”).
   We’ll include the necessary details about support, privacy, and that we’re Forge (to get the “Cloud Fortified” later, we’ll plan to meet those criteria like 99.5% uptime, etc., but that may come after some time in market).
   Beta Program: Before full launch, we could run a private beta with a handful of customers (maybe recruited from Atlassian Community or our network). This will help iron out any last UX issues and produce testimonials. Beta users can be offered a discount or extended free period as thanks. We’ll incorporate their feedback into the launch version. Promotion Channels:
   Atlassian Community: Write a blog post or discussion announcing the app, describing how it solves common Jira problems. The Atlassian Community site has a large audience of Jira admins always looking for solutions. We can also answer questions related to “auto assign in Jira” by mentioning our app as a solution, where appropriate (without spamming).
   Social Media & Content Marketing: Publish an article on LinkedIn or Medium about “Using AI to supercharge your Jira workflow,” subtly introducing our product. Personal LinkedIn posts by the founders can attract interest, especially if tagged with #atlassian #jira #AI.
   Atlassian Marketplace Newsletter / Featured Apps: We will apply for our app to be a featured app or participate in Atlassian’s programs (sometimes Atlassian promotes new notable apps in blogs or newsletters). Highlighting the stat that <7% of apps are AI and we’re filling a gap might catch their interest.
   Webinars or Demos: Host a webinar or live demo (could be in partnership with an Atlassian Solution Partner) where we show the app in action and let attendees ask questions. This can also serve as on-demand marketing content later.
   SEO & Website: Create a simple website or landing page for the app (outside Marketplace) to capture search traffic. For example, if someone googles “auto assign Jira AI”, our page should pop up explaining the solution and directing to Marketplace. We’ll use targeted keywords like “Jira intelligent assignment” or “Jira AI task routing”.
   Paid Ads (if needed): Possibly invest in targeted ads on Atlassian Community or Google for queries like “Jira assignment automation”, depending on budget and conversion.
   In-app virality: Encourage current users to spread the word. For instance, include a subtle “Powered by [OurApp]” in the suggestion comment – team members in other projects might see that and inquire, leading the admin to consider installing it company-wide. We can also implement a referral incentive later (not MVP, but maybe “Refer another team and get a month free”).
   Post-Launch Support & Reviews: We’ll actively support early adopters to get positive reviews on the Marketplace. Respond to any questions in the Marketplace Q&A quickly. Good reviews will drive adoption (as Jira admins often sort by rating). We might gently ask happy users to leave a review. Partnerships: Explore collaborations:
   Solution Partners: Many Atlassian Solution Partners (consultancies) deploy Jira for clients. If we can get them to include our app in their recommended toolset (maybe offer them a free license for their internal use, so they get to love it), that could lead to multiple client referrals.
   Atlassian Team 25 (Atlassian’s AI initiative): Atlassian might have programs around AI – we’ll keep an eye and try to get involved or at least ensure compatibility with Atlassian’s own AI (to be seen as complement, not competitor).
   Roadmap Communication: In marketing materials and during launch, we’ll share a roadmap teaser to excite users (e.g., “Coming soon: workload balancing dashboard, deeper integration with your team’s skill data, etc.”). This assures customers that investing in our app is future-proof with more enhancements on the way, and also can prompt large customers to reach out with their needs (potentially shaping our roadmap or leading to enterprise deals). Goal for Launch: Achieve at least 50-100 installs in the first 2-3 months, focusing on getting feedback and ensuring the app delivers value. Use those success stories to then push for broader adoption (target 500+ installs by year’s end). We’ll measure success not just in installs but in active usage (are suggestions being made and applied) – which means our marketing isn’t just to get people to install, but also to onboard them to actually use it (hence the focus on good UX and education).
10. Future Roadmap and Scaling Potential
    Looking beyond the initial launch, our vision is to evolve this app into the go-to AI assistant for Jira. The roadmap includes:
    Short Term (next 3-6 months after launch):
    Incorporate feedback from MVP users to refine suggestions (tweak AI model prompts or logic).
    Add the workload balancing feature in the UI – provide the project leads with a visual of team load and one-click reassignment suggestions.
    Introduce more granular controls in the admin dashboard, such as custom routing rules or blacklisting certain issue types from auto-assign.
    Expand model support: e.g., if OpenAI releases GPT-4.5 or if we get access to a new model (like an open-source LLM that can be self-hosted for data-sensitive clients), integrate that.
    Achieve Cloud Fortified status on Marketplace by meeting Atlassian’s criteria (we’ll need to ensure high uptime, a documented support SLA, and participate in Atlassian’s security self-assessment – we’ll start that process early).
    Medium Term (6-12 months):
    Develop the AI analytics and reporting module: an interface for management to see how the app is benefiting them (e.g., “Issues are being assigned 2 hours faster on average. Team workload balanced improved by X%.”). This helps demonstrate ROI, especially for renewal justification.
    Integration with Atlassian Data Graph: Atlassian is building a “Teamwork Graph” (as mentioned in shareholder letters) that aggregates data across products
    atlassian.com
    . If APIs become available, we might leverage that for better context (like knowing relationships between Jira issues and Confluence pages to improve suggestions).
    Possibly extend support to Jira Data Center/Server if there’s demand and if technically feasible (Forge is only for Cloud, but some large enterprises on Data Center might want AI help too). That might entail a separate Connect app or a self-hosted component. We will gauge the market; Atlassian is pushing Cloud, so cloud-first is our priority.
    Explore Confluence or Cross-Product AI: Perhaps a sister app for Confluence that suggests page reviewers or labels, using a similar model dashboard. This would leverage our tech but in a new market. Only if Jira app growth stabilizes and we have resources – as per requirement, we won’t divert focus unless clearly beneficial.
    AI Model Optimization: If our user base grows, we might consider training our own model on anonymized aggregated data (if allowed) to have a model specialized in Jira task routing. This could improve accuracy and reduce reliance on expensive third-party APIs. However, data privacy and Atlassian policies need careful consideration here.
    Long Term (1-2 years):
    Position the app as an “AI Ops” platform for work management: not just routing, but an AI that can eventually handle routine task management autonomously. For example, an AI agent that can create subtasks, update statuses, or even communicate with users (“I see this issue is stuck waiting for info, should I ping the reporter?”).
    Broader Workflow Automation: Partner or integrate with other popular apps (for instance, if an ITSM team uses Opsgenie or Slack, our AI could integrate to route alerts or Slack requests into Jira with assignees).
    Scaling to 1000+ customers: Ensure our infrastructure costs and architecture can handle scale. If some part of our app needs an external component (e.g., a training service or a caching layer outside Forge), we might introduce that via AWS or similar, while keeping the core in Forge. We’ll also invest in support infrastructure (knowledge base, maybe a small support team) as user count grows.
    Enterprise Focus: Achieve certifications that enterprises care about (SOC2 compliance for our processes, etc.) if needed to sign big customers. Possibly offer an on-premise variant of the AI for government customers who can’t use cloud (this could be a big effort, maybe not likely given our focus, but it’s on the radar).
    Scalability Considerations: Because we lean on Atlassian and cloud AI providers, scaling to more users primarily means scaling API calls. We’ll keep an eye on rate limits (OpenAI and others have limits; we might need to request rate limit increases as we grow). Forge itself scales, but it has a limit of 100 invocations per 10 seconds per instance per app by default – if we hit that, Atlassian can increase limits or we redesign to queue. With potentially thousands of events per minute across customers, we might implement a lightweight queue in Forge or externally to smooth spikes. The architecture is event-driven and stateless, which scales well horizontally. In terms of business scaling: as noted, Atlassian’s market is huge and growing. Atlassian’s customer base and cloud adoption (300k customers, enterprise segment growing ~18% YoY
    atlassian.com
    ) means our potential user pool is expanding. Moreover, as only ~7% have AI apps now, we expect that to rise – we want to ride that wave and be a top app in that category. There’s also a network effect: if teams see competitors or peers using AI to manage work faster, they’ll feel pressure to adopt similar tools to stay efficient. Finally, our roadmap will remain customer-driven: we will maintain a public roadmap page or community forum where users can suggest features and upvote. This keeps users engaged and helps us prioritize the most demanded enhancements, ensuring the product remains relevant and valuable in the long run.
11. Atlassian Resources and References
    Throughout development, we will rely on Atlassian’s documentation and developer community to ensure we are following best practices:
    Atlassian REST API docs for Jira (for how to update issues, etc.)
    developer.atlassian.com
    .
    Webhooks and Forge triggers guides (to correctly filter and handle events)
    developer.atlassian.com
    .
    Forge documentation for security and architecture (ensuring data egress and compliance)
    developer.atlassian.com
    developer.atlassian.com
    .
    Atlassian’s examples (e.g., there is an example of a “Jira issue analyst Rovo Agent” in Forge samples
    developer.atlassian.com
    , which we can draw inspiration from).
    We will also keep an eye on Atlassian’s AI announcements (like Atlassian Intelligence and Rovo) to remain compatible and maybe leverage their APIs if opened
    atlassian.com
    .
    By combining these resources with our innovative development, we aim to deliver a successful AI-powered Jira app that is well-aligned with Atlassian’s ecosystem and provides tangible improvements to our users’ workflow.
    Citations
    Favicon
    Our Q4 FY24 letter to shareholders - Work Life by Atlassian

https://www.atlassian.com/blog/announcements/shareholder-letter-q4fy24
Favicon
Our Q4 FY24 letter to shareholders - Work Life by Atlassian

https://www.atlassian.com/blog/announcements/shareholder-letter-q4fy24
Favicon
The Atlassian Marketplace picks up momentum - Work Life by Atlassian

https://www.atlassian.com/blog/add-ons/marketplace-momentum
Favicon
Artificial Intelligence apps for Atlassian products | Atlassian Marketplace

https://marketplace.atlassian.com/collections/artificial-intelligence
Favicon
The Jira Cloud platform REST API

https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
Favicon
Webhook

https://developer.atlassian.com/cloud/jira/platform/modules/webhook/
Favicon
The Forge platform

https://developer.atlassian.com/platform/forge/introduction/the-forge-platform/
Favicon
Security for Forge apps

https://developer.atlassian.com/cloud/jira/platform/security-for-forge-apps/
Favicon
Artificial intelligence for Jira Service Management | Atlassian

https://www.atlassian.com/software/jira/service-management/features/itsm/ai
Favicon
Our Q4 FY24 letter to shareholders - Work Life by Atlassian

https://www.atlassian.com/blog/announcements/shareholder-letter-q4fy24
Favicon
Artificial intelligence for Jira Service Management | Atlassian

https://www.atlassian.com/software/jira/service-management/features/itsm/ai
Favicon
The Forge platform

https://developer.atlassian.com/platform/forge/introduction/the-forge-platform/
Favicon
Webhook

https://developer.atlassian.com/cloud/jira/platform/modules/webhook/
Tricentis qTest Real-Time Jira Integration vs Other Solutions_WEB

https://images.g2crowd.com/uploads/attachment/file/97762/Tricentis-qTest-Real-Time-Jira-Integration.pdf
Favicon
The Forge platform

https://developer.atlassian.com/platform/forge/introduction/the-forge-platform/
All Sources
Favicon
atlassian
Favicon
marketpl...atlassian
Favicon
developer.atlassian
images.g2crowd

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini Emergency First-Aid Triage Service
 * 
 * WHY GEMINI FLASH:
 * During a road accident or acute trauma, bystanders and first responders operate under
 * high adrenaline and extreme time pressure. A 10-second delay or conversational fluff
 * ("Hello! I'm an AI assistant...") can cost lives. The Flash model is specifically chosen
 * for its sub-second latency and concise generation capability.
 * 
 * SECURITY:
 * The GEMINI_API_KEY lives strictly in server environment variables and is never exposed
 * to the browser client.
 */

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (err) {
    console.warn('⚠️ Gemini AI initialization warning:', err.message);
  }
}

const EMERGENCY_TRIAGE_SYSTEM_PROMPT = `
You are the LifePulse Emergency Trauma & First-Aid Assistant.
A bystander or first responder is at an accident or trauma crisis scene RIGHT NOW.

STRICT INSTRUCTIONS:
1. NO CONVERSATIONAL FLUFF. Do not say "Hello", "I am sorry", "Sure", or "I hope this helps".
2. START IMMEDIATELY with a numbered list of direct physical action steps.
3. USE UPPERCASE FOR VITAL ACTION VERBS (e.g. PRESS, ELEVATE, DO NOT MOVE, TILT HEAD).
4. SAFETY FIRST:
   - If neck, head, or spine injury is possible (especially motorcycle or car crash), NEVER instruct to move the victim or remove their helmet.
   - If severe bleeding: direct, continuous firm pressure over the wound.
   - If unconscious: check breathing, do not give water or liquids.
5. EXPLICITLY INCLUDE A "⚠️ DO NOT:" section warning against fatal bystander mistakes.
6. MUST END EVERY RESPONSE WITH: "🚨 CALL 108 / 102 NOW IF YOU HAVEN'T ALREADY."
7. KEEP ENTIRE RESPONSE UNDER 150 WORDS. Use clean bullet points readable in 10 seconds.
`;

/**
 * Fallback guidance for critical accident scenes if the AI service is unreachable.
 */
const DEFAULT_FALLBACK_GUIDANCE = 
`1. CALL 108 / 102 IMMEDIATELY.
2. PRESS FIRMLY on any active bleeding with a clean cloth or garment. Do NOT remove soaked cloth; add more layers on top.
3. DO NOT MOVE the victim if spinal, neck, or vehicular crash trauma is suspected. DO NOT remove a motorcyclist's helmet.
4. If unconscious and NOT breathing normally, begin HANDS-ONLY CPR (push hard and fast in the center of the chest at 100-120 bpm).
5. KEEP the victim warm and calm. Do NOT administer water or medication.

⚠️ DO NOT:
- DO NOT bend or twist the victim's neck or back.
- DO NOT give food, water, or oral medicine to an injured or unconscious person.

🚨 CALL 108 / 102 NOW IF YOU HAVEN'T ALREADY.`;

/**
 * Generates emergency first-aid triage advice for a reported trauma situation.
 * @param {string} situation - Description of the accident or injury
 * @returns {Promise<string>} Structured first-aid guidance
 */
async function generateFirstAid(situation) {
  if (!situation || typeof situation !== 'string') {
    throw new Error('Valid emergency situation text is required');
  }

  // If no Gemini client or API key, return immediate clinical fallback
  if (!model || !process.env.GEMINI_API_KEY) {
    return DEFAULT_FALLBACK_GUIDANCE;
  }

  const prompt = `${EMERGENCY_TRIAGE_SYSTEM_PROMPT}\n\nSituation reported by bystander: "${situation}"\n\nRespond now following the rules above exactly:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error('❌ Gemini First-Aid generation error:', error.message);
    // Return high-value clinical fallback rather than leaving bystander stranded
    return DEFAULT_FALLBACK_GUIDANCE;
  }
}

module.exports = {
  model,
  generateFirstAid,
  DEFAULT_FALLBACK_GUIDANCE
};

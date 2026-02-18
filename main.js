import { PERSONAS, DEVELOPER_RULES, MODEL, API_URL } from './config.js';
import { renderMarkdown } from './markdown.js';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const personaSelect = document.getElementById('persona-select');
const userInput = document.getElementById('user-input');
const tempSlider = document.getElementById('temp-slider');
const tempValue = document.getElementById('temp-value');
const submitBtn = document.getElementById('submit-btn');
const resultCard = document.getElementById('result-card');
const resultContent = document.getElementById('result-content');
const resultMeta = document.getElementById('result-meta');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');

tempSlider.addEventListener('input', () => {
  tempValue.textContent = parseFloat(tempSlider.value).toFixed(1);
});

function buildSystemMessage(personaKey) {
  const persona = PERSONAS[personaKey];
  if (!persona) throw new Error(`Unknown persona: ${personaKey}`);
  return `${persona.prompt}\n\n${DEVELOPER_RULES}`;
}

function buildPayload(personaKey, userText, temperature) {
  return {
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemMessage(personaKey) },
      { role: 'user', content: userText },
    ],
    temperature,
  };
}

async function callOpenAI(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const msg =
      errorBody?.error?.message ||
      `API request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Replay a CSS animation by briefly removing and re-adding the class.
 * This forces the browser to restart the animation from its first keyframe.
 */
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function setLoading(isLoading) {
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  submitBtn.disabled = isLoading;
  btnText.textContent = isLoading ? 'Thinking...' : 'Send to LLM';
  btnSpinner.classList.toggle('hidden', !isLoading);

  if (isLoading) {
    resultCard.classList.remove('hidden');
    replayAnimation(resultCard, 'animate-in');
    resultContent.innerHTML =
      '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    resultMeta.textContent = '';
  }
}

function showResult(data) {
  const reply = data.choices?.[0]?.message?.content || 'No response received.';
  resultContent.innerHTML = renderMarkdown(reply);
  replayAnimation(resultCard, 'animate-in');

  const usage = data.usage;
  if (usage) {
    resultMeta.textContent = `${usage.prompt_tokens} prompt · ${usage.completion_tokens} completion · ${usage.total_tokens} total tokens`;
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorAlert.classList.remove('hidden');
  replayAnimation(errorAlert, 'animate-slide-in');
  setTimeout(() => errorAlert.classList.add('hidden'), 8000);
}

function hideError() {
  errorAlert.classList.add('hidden');
}

async function handleSubmit() {
  hideError();

  if (!API_KEY) {
    showError(
      'Missing API key. Create a .env file with VITE_OPENAI_API_KEY=your-key and restart the dev server.'
    );
    return;
  }

  const userText = userInput.value.trim();
  if (!userText) {
    showError('Please enter a prompt before sending.');
    return;
  }

  const personaKey = personaSelect.value;
  const temperature = parseFloat(tempSlider.value);
  const payload = buildPayload(personaKey, userText, temperature);

  setLoading(true);

  try {
    const data = await callOpenAI(payload);
    showResult(data);
  } catch (err) {
    resultCard.classList.add('hidden');
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

submitBtn.addEventListener('click', handleSubmit);

userInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
});

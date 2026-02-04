const display = document.getElementById("display");
const historyDisplay = document.getElementById("history");
const keypad = document.querySelector(".keypad");

const state = {
  expression: "",
  lastResult: null,
};

const operatorPattern = /[+\-*/]/;

const updateDisplay = (value) => {
  display.textContent = value || "0";
};

const updateHistory = (value) => {
  historyDisplay.textContent = value || "Son işlem yok";
};

const sanitizeExpression = (expression) => {
  const cleaned = expression.replace(/×/g, "*").replace(/÷/g, "/");
  const allowed = cleaned.match(/[0-9+\-*/().% ]+/g);
  return allowed ? allowed.join("") : "";
};

const evaluateExpression = (expression) => {
  if (!expression) return "0";
  const sanitized = sanitizeExpression(expression).replace(/%/g, "/100");
  if (!sanitized || /[^0-9+\-*/(). ]/.test(sanitized)) {
    throw new Error("Geçersiz ifade");
  }
  if (/^[+*/]/.test(sanitized)) {
    throw new Error("Geçersiz başlangıç");
  }
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${sanitized})`)();
  if (Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error("Geçersiz sonuç");
  }
  return result.toString();
};

const appendValue = (value) => {
  if (state.expression === "0" && value !== ".") {
    state.expression = value;
  } else {
    state.expression += value;
  }
  updateDisplay(state.expression);
};

const handleOperator = (operator) => {
  if (!state.expression && state.lastResult !== null) {
    state.expression = state.lastResult.toString();
  }
  if (!state.expression) return;
  if (operatorPattern.test(state.expression.slice(-1))) {
    state.expression = state.expression.slice(0, -1) + operator;
  } else {
    state.expression += operator;
  }
  updateDisplay(state.expression);
};

const handleDecimal = () => {
  const parts = state.expression.split(operatorPattern);
  const lastPart = parts[parts.length - 1];
  if (!lastPart.includes(".")) {
    appendValue(state.expression ? "." : "0.");
  }
};

const handleClear = () => {
  state.expression = "";
  state.lastResult = null;
  updateDisplay("0");
  updateHistory("");
};

const handleBackspace = () => {
  if (!state.expression) return;
  state.expression = state.expression.slice(0, -1);
  updateDisplay(state.expression);
};

const handleSign = () => {
  if (!state.expression) return;
  const parts = state.expression.split(operatorPattern);
  const lastPart = parts.pop();
  const prefix = parts.join("");
  if (lastPart.startsWith("-")) {
    state.expression = prefix + lastPart.slice(1);
  } else if (lastPart) {
    state.expression = prefix + "-" + lastPart;
  }
  updateDisplay(state.expression);
};

const handleFunction = (type) => {
  if (!state.expression) return;
  try {
    const currentValue = evaluateExpression(state.expression);
    let computed = currentValue;
    if (type === "sqrt") {
      computed = Math.sqrt(Number(currentValue)).toString();
    } else if (type === "square") {
      computed = (Number(currentValue) ** 2).toString();
    } else if (type === "reciprocal") {
      computed = (1 / Number(currentValue)).toString();
    }
    state.expression = computed;
    updateDisplay(state.expression);
  } catch (error) {
    updateDisplay("Hata");
  }
};

const handleParenthesis = (value) => {
  appendValue(value);
};

const handlePercent = () => {
  if (!state.expression) return;
  appendValue("%");
};

const handleEquals = () => {
  try {
    const result = evaluateExpression(state.expression);
    updateHistory(`${state.expression} =`);
    state.expression = result;
    state.lastResult = Number(result);
    updateDisplay(result);
  } catch (error) {
    updateDisplay("Hata");
  }
};

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case "number":
      appendValue(value);
      break;
    case "operator":
      handleOperator(value);
      break;
    case "decimal":
      handleDecimal();
      break;
    case "clear":
      handleClear();
      break;
    case "equals":
      handleEquals();
      break;
    case "backspace":
      handleBackspace();
      break;
    case "sign":
      handleSign();
      break;
    case "function":
      handleFunction(value);
      break;
    case "parenthesis":
      handleParenthesis(value);
      break;
    case "percent":
      handlePercent();
      break;
    default:
      break;
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    appendValue(event.key);
  } else if (operatorPattern.test(event.key)) {
    handleOperator(event.key);
  } else if (event.key === ".") {
    handleDecimal();
  } else if (event.key === "Enter") {
    event.preventDefault();
    handleEquals();
  } else if (event.key === "Backspace") {
    handleBackspace();
  } else if (event.key === "Escape") {
    handleClear();
  } else if (event.key === "%") {
    handlePercent();
  } else if (event.key === "(") {
    handleParenthesis("(");
  } else if (event.key === ")") {
    handleParenthesis(")");
  }
});

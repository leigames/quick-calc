let timer;
let totalTime = 30.0;  // 总时间30秒
let correctAnswer;
let score = 0;  // 正确答案计数
let timeLeft = totalTime;
let gameMode = "easy";
const timerElement = document.getElementById('timer');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('userAnswer');
const scoreElement = document.getElementById('score');
const feedbackElement = document.getElementById('feedback');
const easyModeRecord = document.getElementById('easyModeRecord');
const hardModeRecord = document.getElementById('hardModeRecord');

function showRecords() {
    easyModeRecord.textContent = `${localStorage.getItem('easyModeRecord') || 0}`;
    hardModeRecord.textContent = `${localStorage.getItem('hardModeRecord') || 0}`;
}

showRecords();

// 监听键盘事件，允许使用数字键输入答案
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key >= '0' && key <= '9') {
        appendDigit(parseInt(key)); // 更新输入框的值
    } else if (key == 'Enter') {
        checkAnswer();
    } else if (key == '-') {
        inverse();
    } else if (key == 'Backspace') {
        backspace();
    } else if (key == 'c' || key == 'C') {
        clearAnswer();
    } else if (key == 'Escape') {
        quit();
    }
});

// 开始游戏界面与游戏逻辑
function startGame(mode) {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'flex';
  gameMode = mode;
  if (gameMode === "hard") {
    totalTime = 60.0;
  }
  resetGame();
}

function startTimer() {
  timerElement.textContent = `剩余时间：${timeLeft} s`;
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    timeLeft = timeLeft - 0.1;
    timeLeft = Math.round(timeLeft * 10) / 10;
    timerElement.textContent = `剩余时间：${timeLeft} s`;
    if (timeLeft === 0) {
      clearInterval(timer);
      endGame();
    }
  }, 100);
}

function pauseTimer() {
    clearInterval(timer);
}

function quit() {
    clearInterval(timer);
    endGame();
}

function endGame() {
  if (gameMode === "easy") {
    localStorage.setItem('easyModeRecord', Math.max(score, localStorage.getItem('easyModeRecord') || 0));
    alert(`【简单模式】游戏结束！你答对了 ${score} 道题目。`);
  } else if (gameMode === "hard") {
    localStorage.setItem('hardModeRecord', Math.max(score, localStorage.getItem('hardModeRecord') || 0));
    alert(`【困难模式】游戏结束！你答对了 ${score} 道题目。`);
  }
  window.location.reload();
}

function resetGame() {
  timeLeft = totalTime;
  score = 0;
  scoreElement.textContent = `得分: ${score}`;
  feedbackElement.textContent = '';
  generateRandomQuestion();
  startTimer();
}

function generateRandomQuestion() {
    if (gameMode === "easy") {
        generateRandomQuestionEasy();
    } else if (gameMode === "hard") {
        while (1) {
            try {
                generateRandomQuestionHard();
                break;
            } catch (e) {
                console.log("err: " + e);
            }
        } 
    }
}

function generateRandomQuestionEasy() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.max(Math.floor(Math.random() * 13) - 3, 0);
  const operators = ['+', '-', '*', '/'];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  if (operator === '/') {
    correctAnswer = num1;
    // Apply Lei's calculation
    if (num2 === 0) {
        correctAnswer = num1;
        currentQuestion = `${num1} / ${num2} = `;
    } else {
        currentQuestion = `${num1 * num2} / ${num2} = `;
    }
  } else {
    currentQuestion = `${num1} ${operator} ${num2} = `;
    correctAnswer = (num2 === 0) ? (num1) : (eval(`${num1} ${operator} ${num2}`));
  }

  questionElement.textContent = currentQuestion;

  answerInput.value = '';
}

function evaluateExpression(expression) {
    // 去掉所有的空格
    expression = expression.replace(/\s+/g, '');

    // 处理括号并替换为字符串拼接
    while (expression.includes('(')) {
        expression = expression.replace(/\(([^()]+)\)/, (match, group1) => {
            return evaluateExpression(group1);  // 递归处理括号内容
        });
    }

    // 为了调用 eval 计算加减法，需要将单个减号替换为+-
    expression = expression.replace(/([0-9])-/g, '$1+-');
    expression = expression.replace(/--/g, '+');

    // 处理加减法
    if (expression.includes('+')) {
        
        // 然后，按加号split字符串
        let parts = expression.split('+');
        // 广度优先，对每个字符串，继续调用这个函数计算里面的乘除法
        for (let i = 0; i < parts.length; i++) {
            parts[i] = evaluateExpression(parts[i]);
        }
        // 然后，将结果相加
        let result = 0;
        for (let part of parts) {
            result += parseFloat(part);
        }
        expression = result.toString();  // 将计算结果替换为字符串
    }

    if (expression.includes('*') || expression.includes('/') ) {
        let numbers = expression.split(/\*|\//);
        let operators = expression.split('').filter((c) => c === '*' || c === '/');
        console.log(operators);
        let number_stack = [parseFloat(numbers[0])];
        // let operator_stack = [];
        for (var i = 0; i < operators.length; i++) {
            if (operators[i] === '*') {
                while (number_stack.length > 1) {
                    let last_number = number_stack.pop();
                    let next_number = number_stack.pop();
                    number_stack.push((last_number === 0) ? next_number : next_number / last_number);
                }
                number_stack[0] *= (parseFloat(numbers[i + 1]) === 0)? 1 : parseFloat(numbers[i + 1]);
            } else if (operators[i] === '/') {
                number_stack.push(parseFloat(numbers[i + 1]));
            }
        }
        
        while (number_stack.length > 1) {
            // console.log(number_stack);
            let last_number = number_stack.pop();
            let next_number = number_stack.pop();
            // console.log(last_number, next_number);
            number_stack.push((last_number === 0) ? next_number : next_number / last_number);
        }
        expression = number_stack[0].toString();
    }
    // console.log(eval(expression));
    
    // 处理加法和减法
    let result = eval(expression);  // 使用 eval 计算加减法
    return result;
}

function generateRandomQuestionHard() {
    let num1 = Math.floor(Math.random() * 10);
    let num2 = Math.max(Math.floor(Math.random() * 13) - 3, 0);
    let num3 = Math.max(Math.floor(Math.random() * 13) - 3, 0);
    const operators = ['+', '-', '*', '/'];
    // 20% 的概率随机选择operator1或operator2（二选一，各10%）为没有符号
    const vacant = (Math.random() >= 0.2) ? 0 : ((Math.random() < 0.5) ? 1 : 2)
    const operator1 = (vacant == 1) ? '' : operators[Math.floor(Math.random() * operators.length)];
    const operator2 = (vacant == 2) ? '' : operators[Math.floor(Math.random() * operators.length)];
    const combine_num12 = (vacant == 1) ? false : (vacant == 2 ? true : ((operator1 == '+' || operator1 == '-') ? Math.random() < 0.5 : Math.random() < 0.1));
    const combine_num23 = (vacant == 1) ? true : (combine_num12 ? false : ((operator2 == '+' || operator2 == '-') ? Math.random() < 0.25 : Math.random() < 0.111));
    
    if (operator1 === '/' && operator2 === '/') {
        if (combine_num12) { // 前两个加括号，就只能乘到num1上
            if (num2 !== 0) num1 *= num2;
            if (num3 !== 0) num1 *= num3;
        } else if (num3 === 0 || Math.random() < 0.5) {
            if (num2 !== 0) num1 *= num2;
        } else {
            if (num2 !== 0) num3 *= num2;
        }
    } else if (operator1 === '/' && operator2 !== '/') {
        // 只有operator1是除法
        // 看看2和3有没有combine
        if (combine_num12) {
            if (num2 !== 0) num1 *= num2;
        } else {
            if (combine_num23) {
                let tmpRes = evaluateExpression(`${num2} ${operator2} ${num3}`);
                if (tmpRes !== 0) num1 *= tmpRes;
            } else {
                if (num2 !== 0) num1 *= num2;
            }
        }
    } else if (operator1 !== '/' && operator2 === '/') {
        // 只有operator2是除法
        // 看看1和2有没有combine
        if (combine_num12) {
            // 最终目的是把这个combine的部分(tmpRes)乘上除数num3
            // 这里分情况讨论，如果括号里面是加减法，把 tmpRes * (num3 - 1) 随机分配到num1和num2上
            let tmpRes = evaluateExpression(`${num1} ${operator1} ${num2}`);
            if (num3 !== 0) {
                if (operator1 === '+') {
                    // 生成一个 0 到 tmpRes * (num3 - 1) 的随机整数
                    let randNum = Math.floor(Math.random() * tmpRes * (num3 - 1));
                    let anotherNum = tmpRes * (num3 - 1) - randNum;
                    num1 += randNum;
                    num2 += anotherNum;
                }
                if (operator1 === '-') {
                    // 生成一个 0 到 tmpRes * (num3 - 1) 的随机整数
                    let randNum = Math.floor(Math.random() * tmpRes * (num3 - 1));
                    let anotherNum = tmpRes * (num3 - 1) + randNum;
                    num1 += anotherNum;
                    num2 += randNum;
                }
            }
        } else {
            if (num3 !== 0) num2 *= num3;
        }
    }
    
    currentQuestion = ((combine_num12) ? '(' : '') + num1 + " " + operator1 + " " + ((combine_num23) ? '(' : '') + num2
                        + ((combine_num12) ? ')' : '')  + " " + operator2 + " " + num3 + ((combine_num23) ? ')' : '');

    
    console.log(currentQuestion);
    try {
        correctAnswer = evaluateExpression(currentQuestion);
        if (correctAnswer % 1 > 0.000001) {
            throw "not integer";
        }
    } catch {
        console.log("err");
        generateRandomQuestionHard();
        return;
    }

    console.log(correctAnswer);
    currentQuestionDisplay = currentQuestion + " = ";

    questionElement.textContent = currentQuestionDisplay;
    answerInput.value = '';
}

function appendDigit(digit) {
  answerInput.value += digit;
}

function inverse() {
    let expression = answerInput.value;
    if (expression.startsWith('-')) {
        expression = expression.slice(1);
    } else {
        expression = '-' + expression;
    }
    answerInput.value = expression;
}

function backspace() {
    if (answerInput.value.length === 0) {
        return;
    }
    answerInput.value = answerInput.value.slice(0, -1);
}

function clearAnswer() {
    answerInput.value = "";
}

function checkAnswer() {
  pauseTimer();
  document.getElementById('digits').style.display = 'none';
  document.getElementById('feedback').style.display = 'block';
  const userAnswer = parseFloat(answerInput.value);
  if (userAnswer >= correctAnswer - 0.000001 && userAnswer <= correctAnswer + 0.000001) {
    feedbackElement.innerHTML = '<span style="color:#28C76F">正确！</span>';
    score++;
  } else {
    feedbackElement.innerHTML = `<span style="color:#DE4313">错误！正确答案是 ${correctAnswer}</span>`;
  }
  scoreElement.textContent = `得分: ${score}`;
  setTimeout(() => {
    feedbackElement.innerHTML = '';
    generateRandomQuestion();
    document.getElementById('digits').style.display = 'grid';
    document.getElementById('feedback').style.display = 'none';
    startTimer();
  }, 1000);
}

function skipQuestion() {
  pauseTimer();
  document.getElementById('digits').style.display = 'none';
  document.getElementById('feedback').style.display = 'block';
  feedbackElement.innerHTML = `<span style="color:red">跳过！正确答案是 ${correctAnswer}</span>`;
  setTimeout(() => {
    feedbackElement.innerHTML = '';
    generateRandomQuestion();
    document.getElementById('digits').style.display = 'grid';
    document.getElementById('feedback').style.display = 'none';
    startTimer();
  }, 1000);
}

function generateRandomQuestionHardSets() {
    for (let i = 0; i < 100; i++) {
        generateRandomQuestionHard();
    }
}

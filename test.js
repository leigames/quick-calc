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

    // 处理乘法（任何数乘以0等于该数）
    if (expression.includes('*')) {
        let parts = expression.split('*');
        let result = evaluateExpression(parts[0]);
        for (let i = 1; i < parts.length; i++) {
            let nextPart = evaluateExpression(parts[i]);
            if (nextPart !== 0) {
                result *= nextPart;
            } // 否则，乘以0保持原值
        }
        expression = result.toString();  // 将结果转换为字符串
    }

    // 处理从右往左的连除式
    if (expression.includes('/')) {
        let parts = expression.split('/');
        let result = parseFloat(parts.pop());
        while (parts.length > 0) {
            let nextPart = parseFloat(parts.pop());
            if (result === 0) {
                result = nextPart;  // 如果除数是0，返回被除数
            } else {
                result = nextPart / result;
            }
        }
        expression = result.toString();  // 将计算结果替换为字符串
    }
    
    // 处理加法和减法
    let result = eval(expression);  // 使用 eval 计算加减法
    return result;
}


console.log(evaluateExpression('2 - (0 - 3)'));  // 7

// Event listener for real-time input validation
document.getElementById('input').addEventListener('input', validateInput);

// Event listener to generate the tree on button click
document.getElementById('generateButton').addEventListener('click', function () {
    const input = document.getElementById('input').value;
    const errorDiv = document.getElementById('error');
    const treeNotationDiv = document.getElementById('treeNotation');
    const listNotationDiv = document.getElementById('listNotation');
    const canvas = document.getElementById('treeCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    errorDiv.textContent = '';
    treeNotationDiv.textContent = '';
    listNotationDiv.textContent = '';

    try {
        const tokens = tokenize(input);
        const tree = parseTokens(tokens);
        drawTree(tree, canvas);

        // Generate output notations
        const treeNotation = generateTreeNotation(tree);
        const listNotation = generateListNotation(tree);

        treeNotationDiv.textContent = treeNotation;
        listNotationDiv.textContent = listNotation;

    } catch (e) {
        errorDiv.textContent = e.message;
    }
});

// Real-time input validation function
function validateInput() {
    const inputField = document.getElementById('input');
    const input = inputField.value;
    const errorDiv = document.getElementById('error');
    try {
        const tokens = tokenize(input);
        if (isExpressionComplete(tokens)) {
            parseTokens(tokens); // Attempt to parse
            inputField.classList.remove('invalid', 'partial');
            inputField.classList.add('valid');
            errorDiv.textContent = '';
        } else {
            // Partially complete expression
            inputField.classList.remove('invalid', 'valid');
            inputField.classList.add('partial');
            errorDiv.textContent = '';
        }
    } catch (e) {
        // Invalid input
        inputField.classList.remove('valid', 'partial');
        inputField.classList.add('invalid');
        errorDiv.textContent = '';
    }
}

// Function to check if the expression is complete (balanced parentheses)
function isExpressionComplete(tokens) {
    let openParen = 0;
    for (const token of tokens) {
        if (token === '(') openParen++;
        if (token === ')') openParen--;
        if (openParen < 0) return false; // More closing than opening
    }
    return openParen === 0 && tokens.length > 0; // Balanced if zero and not empty
}

// Tokenizer: Converts the input string into a list of tokens
function tokenize(input) {
    const regex = /\s*([()]|\.|[a-zA-Z_][a-zA-Z0-9_]*)\s*/g;
    const tokens = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
        tokens.push(match[1]);
    }

    // Check for any invalid characters
    const validTokenRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$|^\(|^\)|^\.$/;
    for (let token of tokens) {
        if (!validTokenRegex.test(token)) {
            throw new Error(`Invalid token detected: '${token}'`);
        }
    }
    return tokens;
}

// Parser: Parses the tokens into a tree, converting lists into nested pairs ending with nil
function parseTokens(tokens) {
    let index = 0;

    function parseExpression() {
        skipWhitespace();

        if (index >= tokens.length) {
            throw new Error('Incomplete expression: expected more tokens.');
        }

        const token = tokens[index];

        if (token === '(') {
            index++; // Skip '('
            skipWhitespace();

            if (index >= tokens.length) {
                throw new Error('Incomplete expression: expected expression after "(".');
            }

            if (tokens[index] === ')') {
                // Empty list
                index++;
                // Return a node representing 'nil' for empty list
                return { value: 'nil', left: null, right: null };
            }

            let expr = parseSequence();

            if (index >= tokens.length || tokens[index] !== ')') {
                throw new Error("Expected ')' after expression");
            }
            index++; // Skip ')'
            return expr;
        } else if (token === 'nil' || isIdentifier(token)) {
            index++;
            return { value: token, left: null, right: null };
        } else {
            throw new Error(`Unexpected token: '${tokens[index]}' at position ${index}`);
        }
    }

    function parseSequence() {
        skipWhitespace();

        if (index >= tokens.length) {
            throw new Error('Incomplete expression in sequence.');
        }

        let firstExpr = parseExpression();
        skipWhitespace();

        if (index < tokens.length && tokens[index] === '.') {
            // Pair notation
            index++; // Skip '.'
            skipWhitespace();

            if (index >= tokens.length) {
                throw new Error("Incomplete expression: expected expression after '.'.");
            }

            let secondExpr = parseExpression();
            skipWhitespace();
            return { value: '.', left: firstExpr, right: secondExpr };
        } else {
            // List notation or mixed notation
            let elements = [firstExpr];

            while (index < tokens.length && tokens[index] !== ')') {
                let expr = parseExpression();
                skipWhitespace();
                elements.push(expr);
            }

            // Convert the list of elements into nested pairs ending with 'nil' node
            let node = { value: 'nil', left: null, right: null }; // Start with 'nil' node as the end of the list

            for (let i = elements.length - 1; i >= 0; i--) {
                node = {
                    value: '.',
                    left: elements[i],
                    right: node
                };
            }

            return node;
        }
    }

    function skipWhitespace() {
        while (index < tokens.length && (tokens[index] === undefined || tokens[index] === '')) {
            index++;
        }
    }

    function isIdentifier(token) {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token);
    }

    const result = parseExpression();
    skipWhitespace();
    if (index < tokens.length) {
        throw new Error("Unexpected tokens after parsing completed");
    }
    return result;
}

// Function to generate tree notation (dot notation)
function generateTreeNotation(node) {
    if (node === null) {
        return 'nil';
    } else if (node.left === null && node.right === null) {
        return node.value;
    } else {
        return `(${generateTreeNotation(node.left)} . ${generateTreeNotation(node.right)})`;
    }
}

// Function to generate list notation
function generateListNotation(node) {
    function isList(node) {
        return node === null || (node.value === '.' && (node.right === null || isList(node.right)));
    }

    if (node === null) {
        return 'nil';
    } else if (node.left === null && node.right === null) {
        return node.value;
    } else if (isList(node)) {
        let elements = [];
        while (node.value === '.') {
            elements.push(generateListNotation(node.left));
            node = node.right;
        }
        if (node.value !== 'nil') {
            // Improper list
            return `(${elements.join(' ')} . ${generateListNotation(node)})`;
        }
        return `(${elements.join(' ')})`;
    } else {
        return `(${generateListNotation(node.left)} . ${generateListNotation(node.right)})`;
    }
}

// Drawing function: Visualizes the tree on the canvas
function drawTree(root, canvas) {
    const context = canvas.getContext('2d');
    const nodeRadius = 20;
    const levelHeight = 80;
    const positions = new Map();
    const nodePositions = [];
    let minX = Infinity;
    let maxX = -Infinity;

    try {
        // Assign positions using in-order traversal
        assignPositions(root);
    } catch (e) {
        // In case of unexpected structure
        console.error("Error during position assignment:", e);
        return;
    }

    // Adjust positions to fit within the canvas
    const totalWidth = maxX - minX + nodeRadius * 2;
    const scale = (canvas.width - nodeRadius * 2) / totalWidth;
    const offsetX = -minX * scale + nodeRadius;

    context.font = '12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw the tree
    drawNode(root);

    // Function to assign positions using in-order traversal
    function assignPositions(node, depth = 0) {
        if (node === null) return;

        assignPositions(node.left, depth + 1);

        const x = nodePositions.length * (nodeRadius * 3);
        const y = depth * levelHeight + nodeRadius + 20;
        positions.set(node, { x: x, y: y });

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        nodePositions.push(node);

        assignPositions(node.right, depth + 1);
    }

    // Function to draw nodes and branches
    function drawNode(node) {
        if (node === null) return;

        const pos = positions.get(node);
        const x = pos.x * scale + offsetX;
        const y = pos.y;

        // Draw branches before nodes to have branches behind nodes
        if (node.left) {
            const leftPos = positions.get(node.left);
            const childX = leftPos.x * scale + offsetX;
            const childY = leftPos.y;
            drawBranch(x, y, childX, childY);
            drawNode(node.left);
        }
        if (node.right) {
            const rightPos = positions.get(node.right);
            const childX = rightPos.x * scale + offsetX;
            const childY = rightPos.y;
            drawBranch(x, y, childX, childY);
            drawNode(node.right);
        }

        // Draw node circle
        context.beginPath();
        context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();
        context.stroke();

        // Draw label
        context.fillStyle = 'black';
        if (node.value !== '.') {
            context.fillText(node.value, x, y);
        } else {
            context.fillText('.', x, y);
        }
    }

    function drawBranch(x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1 + nodeRadius);
        context.lineTo(x2, y2 - nodeRadius);
        context.strokeStyle = '#888888';
        context.lineWidth = 2;
        context.stroke();
    }
}

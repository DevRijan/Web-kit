// Global variables
let currentTool = 'color-picker';
let todos = [];
let todoIdCounter = 1;
let currentFilter = 'all';

// Unit conversion data
const conversionData = {
    length: {
        meter: 1,
        kilometer: 0.001,
        centimeter: 100,
        millimeter: 1000,
        inch: 39.3701,
        foot: 3.28084,
        yard: 1.09361,
        mile: 0.000621371
    },
    weight: {
        kilogram: 1,
        gram: 1000,
        pound: 2.20462,
        ounce: 35.274,
        stone: 0.157473,
        ton: 0.001
    },
    temperature: {
        celsius: (c) => ({ celsius: c, fahrenheit: c * 9/5 + 32, kelvin: c + 273.15 }),
        fahrenheit: (f) => ({ celsius: (f - 32) * 5/9, fahrenheit: f, kelvin: (f - 32) * 5/9 + 273.15 }),
        kelvin: (k) => ({ celsius: k - 273.15, fahrenheit: (k - 273.15) * 9/5 + 32, kelvin: k })
    },
    volume: {
        liter: 1,
        milliliter: 1000,
        gallon: 0.264172,
        quart: 1.05669,
        pint: 2.11338,
        cup: 4.22675,
        fluidounce: 33.814
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeColorPicker();
    initializePasswordGenerator();
    initializeCalculator();
    initializeUnitConverter();
    initializeTodoList();
    loadTodosFromStorage();
});

// Navigation functionality
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const toolName = btn.getAttribute('data-tool');
            switchTool(toolName);
            
            // Update active nav button
            navButtons.forEach(navBtn => navBtn.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchTool(toolName) {
    // Hide all tools
    document.querySelectorAll('.tool').forEach(tool => {
        tool.classList.remove('active');
    });
    
    // Show selected tool
    document.getElementById(toolName).classList.add('active');
    currentTool = toolName;
}

// Color Picker functionality
function initializeColorPicker() {
    const colorInput = document.getElementById('colorInput');
    const colorDisplay = document.getElementById('colorDisplay');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');
    const generatePaletteBtn = document.getElementById('generatePalette');
    
    // Update color display and values when color changes
    colorInput.addEventListener('input', function() {
        const color = this.value;
        updateColorDisplay(color);
    });
    
    // Initialize with default color
    updateColorDisplay('#3498db');
    
    // Generate palette functionality
    generatePaletteBtn.addEventListener('click', generateColorPalette);
    
    // Copy functionality for color formats
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-copy');
            const targetElement = document.getElementById(targetId);
            copyToClipboard(targetElement.value);
        });
    });
}

function updateColorDisplay(hex) {
    const colorDisplay = document.getElementById('colorDisplay');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');
    
    // Update display
    colorDisplay.style.backgroundColor = hex;
    
    // Convert hex to RGB
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Update format values
    hexValue.value = hex.toUpperCase();
    rgbValue.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslValue.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function generateColorPalette() {
    const baseColor = document.getElementById('colorInput').value;
    const paletteColors = document.getElementById('paletteColors');
    paletteColors.innerHTML = '';
    
    const colors = generateHarmoniousColors(baseColor);
    
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.title = color;
        colorDiv.addEventListener('click', () => {
            document.getElementById('colorInput').value = color;
            updateColorDisplay(color);
        });
        paletteColors.appendChild(colorDiv);
    });
}

function generateHarmoniousColors(baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];
    
    // Add base color
    colors.push(baseColor);
    
    // Complementary
    colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
    
    // Triadic
    colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
    colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
    
    // Analogous
    colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
    colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
    
    return colors;
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Password Generator functionality
function initializePasswordGenerator() {
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const generateBtn = document.getElementById('generatePassword');
    const copyBtn = document.getElementById('copyPassword');
    
    // Update length display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });
    
    // Generate password
    generateBtn.addEventListener('click', generatePassword);
    
    // Copy password
    copyBtn.addEventListener('click', function() {
        const password = document.getElementById('generatedPassword').value;
        if (password) {
            copyToClipboard(password);
        }
    });
}

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!charset) {
        alert('Please select at least one character type!');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    document.getElementById('generatedPassword').value = password;
    updatePasswordStrength(password);
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let strengthLevel = '';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Determine strength level
    if (strength <= 2) {
        strengthLevel = 'weak';
        strengthText.textContent = 'Weak Password';
    } else if (strength <= 4) {
        strengthLevel = 'fair';
        strengthText.textContent = 'Fair Password';
    } else if (strength <= 5) {
        strengthLevel = 'good';
        strengthText.textContent = 'Good Password';
    } else {
        strengthLevel = 'strong';
        strengthText.textContent = 'Strong Password';
    }
    
    strengthBar.className = `strength-bar ${strengthLevel}`;
}

// Calculator functionality
function initializeCalculator() {
    // Calculator is initialized through HTML onclick events
    clearCalculator();
}

let calcDisplay = document.getElementById('calcDisplay');
let shouldResetDisplay = false;

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        calcDisplay.value = '';
        shouldResetDisplay = false;
    }
    
    if (calcDisplay.value === '0' && value !== '.') {
        calcDisplay.value = value;
    } else {
        calcDisplay.value += value;
    }
}

function clearCalculator() {
    calcDisplay.value = '0';
    shouldResetDisplay = false;
}

function deleteLast() {
    if (calcDisplay.value.length > 1) {
        calcDisplay.value = calcDisplay.value.slice(0, -1);
    } else {
        calcDisplay.value = '0';
    }
}

function calculateResult() {
    try {
        // Replace × with * for evaluation
        const expression = calcDisplay.value.replace(/×/g, '*');
        const result = eval(expression);
        calcDisplay.value = result;
        shouldResetDisplay = true;
    } catch (error) {
        calcDisplay.value = 'Error';
        shouldResetDisplay = true;
    }
}

// Unit Converter functionality
function initializeUnitConverter() {
    const conversionType = document.getElementById('conversionType');
    const fromValue = document.getElementById('fromValue');
    const swapBtn = document.getElementById('swapUnits');
    
    conversionType.addEventListener('change', updateUnitOptions);
    fromValue.addEventListener('input', convertUnits);
    swapBtn.addEventListener('click', swapUnits);
    
    // Initialize with length units
    updateUnitOptions();
}

function updateUnitOptions() {
    const conversionType = document.getElementById('conversionType').value;
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    
    // Clear existing options
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    let units = [];
    switch(conversionType) {
        case 'length':
            units = ['meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'foot', 'yard', 'mile'];
            break;
        case 'weight':
            units = ['kilogram', 'gram', 'pound', 'ounce', 'stone', 'ton'];
            break;
        case 'temperature':
            units = ['celsius', 'fahrenheit', 'kelvin'];
            break;
        case 'volume':
            units = ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluidounce'];
            break;
    }
    
    units.forEach(unit => {
        const option1 = document.createElement('option');
        option1.value = unit;
        option1.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        fromUnit.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = unit;
        option2.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        toUnit.appendChild(option2);
    });
    
    // Set default selections
    if (units.length > 1) {
        toUnit.value = units[1];
    }
    
    convertUnits();
}

function convertUnits() {
    const conversionType = document.getElementById('conversionType').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    const toValue = document.getElementById('toValue');
    const formula = document.getElementById('conversionFormula');
    
    if (isNaN(fromValue)) {
        toValue.value = '';
        formula.textContent = '';
        return;
    }
    
    let result = 0;
    
    if (conversionType === 'temperature') {
        const tempResult = conversionData.temperature[fromUnit](fromValue);
        result = tempResult[toUnit];
    } else {
        const baseValue = fromValue / conversionData[conversionType][fromUnit];
        result = baseValue * conversionData[conversionType][toUnit];
    }
    
    toValue.value = result.toFixed(6).replace(/\.?0+$/, '');
    formula.textContent = `${fromValue} ${fromUnit} = ${toValue.value} ${toUnit}`;
}

function swapUnits() {
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    const fromValue = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue');
    
    // Swap unit selections
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;
    
    // Swap values
    const tempValue = fromValue.value;
    fromValue.value = toValue.value;
    toValue.value = tempValue;
    
    convertUnits();
}

// To-Do List functionality
function initializeTodoList() {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addTodo');
    const clearBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    addBtn.addEventListener('click', addTodo);
    clearBtn.addEventListener('click', clearCompletedTodos);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTodos();
        });
    });
}

function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    const todo = {
        id: todoIdCounter++,
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    todoInput.value = '';
    saveTodosToStorage();
    renderTodos();
    updateTodoCount();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodosToStorage();
        renderTodos();
        updateTodoCount();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodosToStorage();
    renderTodos();
    updateTodoCount();
}

function clearCompletedTodos() {
    todos = todos.filter(t => !t.completed);
    saveTodosToStorage();
    renderTodos();
    updateTodoCount();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    let filteredTodos = todos;
    
    switch(currentFilter) {
        case 'active':
            filteredTodos = todos.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(t => t.completed);
            break;
    }
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No tasks found</p>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoItem.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        todoList.appendChild(todoItem);
    });
}

function updateTodoCount() {
    const activeTodos = todos.filter(t => !t.completed).length;
    const todoCount = document.getElementById('todoCount');
    todoCount.textContent = `${activeTodos} task${activeTodos !== 1 ? 's' : ''} remaining`;
}

function saveTodosToStorage() {
    // Since we can't use localStorage in artifacts, we'll just keep them in memory
    // In a real application, you would use: localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodosFromStorage() {
    // Since we can't use localStorage in artifacts, we'll start with empty todos
    // In a real application, you would use: todos = JSON.parse(localStorage.getItem('todos')) || [];
    renderTodos();
    updateTodoCount();
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Copied to clipboard!');
    }).catch(function(err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!');
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2700);
}
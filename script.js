// Khởi tạo câu hỏi mặc định
const defaultQuestions = [
    {
        id: Date.now(),
        category: "toan",
        question: "2 + 2 = ?",
        options: ["A: 3", "B: 4", "C: 5", "D: 6"],
        correct: "B"
    },
];

let questions = [];
let currentQuestion = 0;
let score = 0;
let isAnimating = false;
let lastDiveDirection = '';
let editingQuestionId = null;

// Khởi tạo game
function initializeGame() {
    // Load câu hỏi từ localStorage hoặc dùng mặc định
    loadQuestions();
    
    currentQuestion = 0;
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('endScreen').style.display = 'none';
    showQuestion();
    resetElements();
    
    // Thêm sự kiện cho các nút
    document.getElementById('addQuestionBtn').addEventListener('click', () => {
        editingQuestionId = null;
        document.getElementById('formTitle').textContent = 'Thêm Câu Hỏi Mới';
        document.getElementById('submitQuestionBtn').textContent = 'Thêm';
        openQuestionForm();
    });
    
    document.getElementById('manageQuestionsBtn').addEventListener('click', openQuestionManager);
    document.getElementById('submitQuestionBtn').addEventListener('click', saveQuestion);
}

// Load câu hỏi từ localStorage
function loadQuestions() {
    const savedQuestions = localStorage.getItem('soccerQuizQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
    } else {
        questions = [...defaultQuestions];
        saveQuestionsToStorage();
    }
}

// Lưu câu hỏi vào localStorage
function saveQuestionsToStorage() {
    localStorage.setItem('soccerQuizQuestions', JSON.stringify(questions));
}

function showQuestion() {
    document.getElementById('endScreen').style.display = 'none';
    
    const question = questions[currentQuestion];
    document.getElementById('question').textContent = question.question;
    
    const leftOptions = document.querySelector('.option-group.left');
    const rightOptions = document.querySelector('.option-group.right');
    
    leftOptions.innerHTML = '';
    rightOptions.innerHTML = '';
    
    question.options.forEach((opt, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = opt;
        optionElement.onclick = function() { checkAnswer(opt[0]); };
        
        if (index < 2) {
            leftOptions.appendChild(optionElement);
        } else {
            rightOptions.appendChild(optionElement);
        }
    });
}

function resetElements() {
    const ball = document.getElementById('ball');
    const goalkeeper = document.getElementById('goalkeeper');
    
    ball.style.transform = 'translateX(-50%)';
    ball.style.bottom = '15%';
    ball.style.opacity = '1';
    goalkeeper.style.animation = '';
    goalkeeper.style.transform = 'translateX(-50%)';
    isAnimating = false;
}

function checkAnswer(selected) {
    if (isAnimating) return;
    isAnimating = true;
    
    selected = selected.trim().toUpperCase();
    const question = questions[currentQuestion];
    const ball = document.getElementById('ball');
    const goalkeeper = document.getElementById('goalkeeper');

    if (selected === question.correct) {
        const oppositeDirection = lastDiveDirection === 'right' ? '-120px' : '120px';
        ball.style.bottom = '70%';
        ball.style.transform = `translateX(calc(-50% + ${oppositeDirection}))`;
        score += 10;
        document.getElementById('score').textContent = score;
    } else {
        const diveDirection = Math.random() < 0.5 ? 'left' : 'right';
        const diveDistance = diveDirection === 'left' ? '-120px' : '120px';
        lastDiveDirection = diveDirection;
        
        goalkeeper.style.setProperty('--dive-distance', diveDistance);
        goalkeeper.style.animation = 'dive 0.8s forwards';
        
        ball.style.bottom = '60%';
        ball.style.transform = `translateX(calc(-50% + ${diveDistance}))`;
        
        setTimeout(() => {
            ball.style.opacity = '0.5';
            ball.style.transform = `translateX(calc(-50% + ${diveDistance})) translateY(10px)`;
        }, 500);
    }

    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion >= questions.length) {
            showEndScreen();
        } else {
            resetElements();
            showQuestion();
        }
    }, 1500);
}

function showEndScreen() {
    const endScreen = document.getElementById('endScreen');
    document.getElementById('finalScore').textContent = score;
    endScreen.style.display = 'flex';
}

function restartGame() {
    initializeGame();
}

// Quản lý câu hỏi
function openQuestionForm() {
    document.getElementById('questionForm').style.display = 'block';
}

function closeQuestionForm() {
    document.getElementById('questionForm').style.display = 'none';
    resetQuestionForm();
}

function resetQuestionForm() {
    document.getElementById('questionCategory').value = 'toan';
    document.getElementById('newQuestion').value = '';
    document.getElementById('optionA').value = '';
    document.getElementById('optionB').value = '';
    document.getElementById('optionC').value = '';
    document.getElementById('optionD').value = '';
    document.getElementById('correctAnswer').value = '';
    editingQuestionId = null;
}

function saveQuestion() {
    const category = document.getElementById('questionCategory').value;
    const newQuestion = document.getElementById('newQuestion').value.trim();
    const optionA = document.getElementById('optionA').value.trim();
    const optionB = document.getElementById('optionB').value.trim();
    const optionC = document.getElementById('optionC').value.trim();
    const optionD = document.getElementById('optionD').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;
    
    if (!newQuestion || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    if (editingQuestionId) {
        // Cập nhật câu hỏi đã có
        const index = questions.findIndex(q => q.id === editingQuestionId);
        if (index !== -1) {
            questions[index] = {
                id: editingQuestionId,
                category,
                question: newQuestion,
                options: [
                    `A: ${optionA}`,
                    `B: ${optionB}`,
                    `C: ${optionC}`,
                    `D: ${optionD}`
                ],
                correct: correctAnswer
            };
            alert('Đã cập nhật câu hỏi thành công!');
        }
    } else {
        // Thêm câu hỏi mới
        questions.push({
            id: Date.now(),
            category,
            question: newQuestion,
            options: [
                `A: ${optionA}`,
                `B: ${optionB}`,
                `C: ${optionC}`,
                `D: ${optionD}`
            ],
            correct: correctAnswer
        });
        alert('Đã thêm câu hỏi mới thành công!');
    }
    
    saveQuestionsToStorage();
    closeQuestionForm();
    
    // Nếu đang ở màn hình quản lý, cập nhật lại danh sách
    if (document.getElementById('questionManager').style.display === 'block') {
        renderQuestionList();
    }
    
    // Nếu đang ở màn hình kết thúc, cập nhật lại game
    if (currentQuestion >= questions.length - 1) {
        restartGame();
    }
}

function openQuestionManager() {
    renderQuestionList();
    document.getElementById('questionManager').style.display = 'block';
}

function closeQuestionManager() {
    document.getElementById('questionManager').style.display = 'none';
}

function filterQuestions() {
    renderQuestionList();
}

function renderQuestionList() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const questionList = document.getElementById('questionList');
    
    let filteredQuestions = questions;
    if (categoryFilter !== 'all') {
        filteredQuestions = questions.filter(q => q.category === categoryFilter);
    }
    
    questionList.innerHTML = '';
    
    if (filteredQuestions.length === 0) {
        questionList.innerHTML = '<p>Không có câu hỏi nào trong chủ đề này.</p>';
        return;
    }
    
    filteredQuestions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        
        const categoryNames = {
            'toan': 'Toán học',
            'tiengviet': 'Tiếng Việt',
            'khoahoc': 'Khoa học',
            'thethao': 'Thể thao',
            'tiengtrung': 'Tiếng Trung',
            'khac': 'Khác'
        };
        
        questionItem.innerHTML = `
            <h3>${question.question} <small>(${categoryNames[question.category]})</small></h3>
            <div class="question-options">
                ${question.options.map(opt => `<div>${opt} ${opt[0] === question.correct ? '✅' : ''}</div>`).join('')}
            </div>
            <div class="question-actions">
                <button class="action-btn edit-btn" onclick="editQuestion(${question.id})">Sửa</button>
                <button class="action-btn delete-btn" onclick="deleteQuestion(${question.id})">Xóa</button>
            </div>
        `;
        
        questionList.appendChild(questionItem);
    });
}

function editQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;
    
    editingQuestionId = id;
    document.getElementById('formTitle').textContent = 'Sửa Câu Hỏi';
    document.getElementById('submitQuestionBtn').textContent = 'Cập nhật';
    
    document.getElementById('questionCategory').value = question.category;
    document.getElementById('newQuestion').value = question.question;
    
    // Tách các đáp án
    const options = question.options.map(opt => opt.split(': ')[1]);
    document.getElementById('optionA').value = options[0];
    document.getElementById('optionB').value = options[1];
    document.getElementById('optionC').value = options[2];
    document.getElementById('optionD').value = options[3];
    
    document.getElementById('correctAnswer').value = question.correct;
    
    closeQuestionManager();
    openQuestionForm();
}

function deleteQuestion(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    
    questions = questions.filter(q => q.id !== id);
    saveQuestionsToStorage();
    renderQuestionList();
    
    // Nếu đang chơi game, kiểm tra xem câu hỏi hiện tại có bị xóa không
    if (currentQuestion >= questions.length) {
        if (questions.length === 0) {
            // Nếu không còn câu hỏi nào, thêm lại câu hỏi mặc định
            questions = [...defaultQuestions];
            saveQuestionsToStorage();
            renderQuestionList();
        }
        restartGame();
    }
}

// Khởi tạo game khi trang tải xong
window.onload = initializeGame;
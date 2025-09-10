// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // アプリケーション初期化
    loadTodos();
    
    // 追加ボタンのクリックイベント
    const addBtn = document.getElementById('addTodoBtn');
    addBtn.addEventListener('click', addTodo);
    
    // Enterキーでの追加
    const todoInput = document.getElementById('todoInput');
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 入力フィールドのフォーカス解除時にエラー状態をクリア
    todoInput.addEventListener('blur', function() {
        this.classList.remove('input-error');
    });
    
    // 入力フィールドの入力時にエラーメッセージをクリア
    todoInput.addEventListener('input', function() {
        clearErrorMessage();
        this.classList.remove('input-error');
    });
});

// TODOリストを読み込む
function loadTodos() {
    fetch('/api/todos')
        .then(response => response.json())
        .then(todos => {
            displayTodos(todos);
        })
        .catch(error => {
            console.error('TODOの読み込みに失敗しました:', error);
        });
}

// TODOを追加する
function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const errorMessage = document.getElementById('errorMessage');
    const title = todoInput.value.trim();
    
    // エラーメッセージをクリア
    clearErrorMessage();
    
    // 入力検証
    if (!title) {
        showErrorMessage('入力がありません');
        todoInput.classList.add('input-error');
        todoInput.focus();
        return;
    }
    
    // 30文字制限の検証
    if (title.length > 30) {
        showErrorMessage('３０文字を超えたTODOは登録できません');
        todoInput.classList.add('input-error');
        todoInput.focus();
        return;
    }
    
    // ボタンを無効化（連続クリック防止）
    const addBtn = document.getElementById('addTodoBtn');
    addBtn.disabled = true;
    addBtn.textContent = '追加中...';
    
    // TODOを送信
    fetch('/api/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(todo => {
        todoInput.value = ''; // 入力フィールドをクリア
        todoInput.classList.remove('input-error');
        clearErrorMessage();
        loadTodos(); // TODOリストを再読み込み
    })
    .catch(error => {
        alert('TODOの追加に失敗しました。もう一度お試しください。');
        console.error('Error:', error);
    })
    .finally(() => {
        // ボタンを再有効化
        addBtn.disabled = false;
        addBtn.textContent = '追加';
    });
}

// TODOリストを表示する
function displayTodos(todos) {
    const todoList = document.getElementById('todoList');
    const emptyMessage = document.getElementById('emptyMessage');
    
    // リストをクリア
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        
        // TODOアイテムを作成して表示
        todos.forEach(function(todo) {
            const listItem = createTodoItem(todo);
            todoList.appendChild(listItem);
        });
    }
}

// TODO項目のHTMLを作成する
function createTodoItem(todo) {
    const createdDate = new Date(todo.createdAt);
    const formattedDate = formatDate(createdDate);
    
    const listItem = document.createElement('li');
    listItem.className = 'todo-item';
    
    listItem.innerHTML = `
        <div class="todo-content">
            <span class="todo-title">${escapeHtml(todo.title)}</span>
            <span class="todo-date">${formattedDate}</span>
        </div>
    `;
    
    return listItem;
}

// 日付をフォーマットする
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '今日 ' + date.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else {
        return date.toLocaleDateString('ja-JP', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// HTMLエスケープ処理
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// エラーメッセージを表示する
function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// エラーメッセージをクリアする
function clearErrorMessage() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}
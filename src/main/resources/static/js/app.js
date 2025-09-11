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
    
    // 20文字制限の検証
    if (title.length > 20) {
        showErrorMessage('２０文字を超えたTODOは登録できません');
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
    listItem.setAttribute('data-id', todo.id);
    
    listItem.innerHTML = `
        <div class="todo-content">
            <div class="todo-left">
                <span class="todo-title">${escapeHtml(todo.title)}</span>
                <span class="todo-date">${formattedDate}</span>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="startEditTodo(${todo.id})">編集</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">削除</button>
            </div>
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

// TODOの編集を開始する
function startEditTodo(todoId) {
    const todoItem = document.querySelector(`[data-id="${todoId}"]`);
    if (!todoItem) return;
    
    const titleSpan = todoItem.querySelector('.todo-title');
    const currentTitle = titleSpan.textContent;
    const editBtn = todoItem.querySelector('.edit-btn');
    const deleteBtn = todoItem.querySelector('.delete-btn');
    
    // 入力フィールドを作成
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-title-edit';
    input.value = currentTitle;
    input.maxLength = 20;
    
    // ボタンを無効化
    editBtn.disabled = true;
    deleteBtn.disabled = true;
    editBtn.textContent = '保存中...';
    
    // タイトルを入力フィールドに置き換え
    titleSpan.parentNode.replaceChild(input, titleSpan);
    input.focus();
    input.select();
    
    // Enter キーまたはフォーカス離脱で保存
    const saveEdit = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle && newTitle.length <= 20) {
            updateTodo(todoId, newTitle, input, titleSpan, editBtn, deleteBtn);
        } else if (newTitle === currentTitle) {
            // 変更なしの場合は元に戻す
            cancelEdit(input, titleSpan, editBtn, deleteBtn, currentTitle);
        } else {
            // 無効な入力の場合
            input.focus();
            input.style.borderColor = '#e74c3c';
        }
    };
    
    const cancelEdit = (input, titleSpan, editBtn, deleteBtn, originalTitle) => {
        const newTitleSpan = document.createElement('span');
        newTitleSpan.className = 'todo-title';
        newTitleSpan.textContent = originalTitle;
        
        input.parentNode.replaceChild(newTitleSpan, input);
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        editBtn.textContent = '編集';
    };
    
    // イベントリスナー
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
    
    input.addEventListener('blur', saveEdit);
}

// TODOを更新する
function updateTodo(todoId, newTitle, inputElement, titleElement, editBtn, deleteBtn) {
    fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(updatedTodo => {
        // 成功時：新しいspan要素を作成して表示を更新
        const newTitleSpan = document.createElement('span');
        newTitleSpan.className = 'todo-title';
        newTitleSpan.textContent = updatedTodo.title;
        
        inputElement.parentNode.replaceChild(newTitleSpan, inputElement);
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        editBtn.textContent = '編集';
    })
    .catch(error => {
        console.error('TODOの更新に失敗しました:', error);
        alert('TODOの更新に失敗しました。もう一度お試しください。');
        // エラー時：新しいspan要素を作成して元のタイトルに戻す
        const newTitleSpan = document.createElement('span');
        newTitleSpan.className = 'todo-title';
        newTitleSpan.textContent = titleElement.textContent; // 元のタイトルを使用
        
        inputElement.parentNode.replaceChild(newTitleSpan, inputElement);
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        editBtn.textContent = '編集';
    });
}

// TODOを削除する
function deleteTodo(todoId) {
    const todoItem = document.querySelector(`[data-id="${todoId}"]`);
    if (!todoItem) return;
    
    const editBtn = todoItem.querySelector('.edit-btn');
    const deleteBtn = todoItem.querySelector('.delete-btn');
    
    // ボタンを無効化
    editBtn.disabled = true;
    deleteBtn.disabled = true;
    deleteBtn.textContent = '削除中...';
    
    fetch(`/api/todos/${todoId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // 成功時：アイテムを即座に非表示
        todoItem.style.opacity = '0';
        todoItem.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            todoItem.remove();
            // リストが空になった場合の処理
            const todoList = document.getElementById('todoList');
            const emptyMessage = document.getElementById('emptyMessage');
            if (todoList.children.length === 0) {
                emptyMessage.style.display = 'block';
            }
        }, 300);
    })
    .catch(error => {
        console.error('TODOの削除に失敗しました:', error);
        alert('TODOの削除に失敗しました。もう一度お試しください。');
        // エラー時：ボタンを再有効化
        editBtn.disabled = false;
        deleteBtn.disabled = false;
        deleteBtn.textContent = '削除';
    });
}
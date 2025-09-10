class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        
        this.init();
    }
    
    init() {
        // イベントリスナーを設定
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        this.todoInput.addEventListener('input', () => this.toggleAddButton());
        
        // 初期表示
        this.render();
        this.toggleAddButton();
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') return;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        this.toggleAddButton();
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    toggleAddButton() {
        const hasText = this.todoInput.value.trim().length > 0;
        this.addBtn.disabled = !hasText;
    }
    
    render() {
        // TODOリストをクリア
        this.todoList.innerHTML = '';
        
        // 空の状態を表示
        if (this.todos.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'まだタスクがありません。上記からタスクを追加してください。';
            this.todoList.appendChild(emptyState);
        } else {
            // TODOアイテムを表示
            this.todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="app.toggleTodo(${todo.id})">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">削除</button>
                `;
                
                this.todoList.appendChild(li);
            });
        }
        
        // 統計を更新
        this.updateStats();
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        
        this.totalTasks.textContent = `総タスク: ${total}`;
        this.completedTasks.textContent = `完了: ${completed}`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーションを初期化
const app = new TodoApp();
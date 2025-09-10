// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // アプリケーション初期化
    loadIssues();
    
    // 追加ボタンのクリックイベント
    const addBtn = document.getElementById('addIssueBtn');
    addBtn.addEventListener('click', addIssue);
    
    // Enterキーでの追加（タイトル入力時）
    const titleInput = document.getElementById('issueTitleInput');
    titleInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addIssue();
        }
    });
    
    // 入力フィールドのフォーカス解除時にエラー状態をクリア
    titleInput.addEventListener('blur', function() {
        this.classList.remove('input-error');
    });
});

// イシューリストを読み込む
function loadIssues() {
    fetch('/api/issues')
        .then(response => response.json())
        .then(issues => {
            displayIssues(issues);
        })
        .catch(error => {
            console.error('イシューの読み込みに失敗しました:', error);
        });
}

// イシューを追加する
function addIssue() {
    const titleInput = document.getElementById('issueTitleInput');
    const descriptionInput = document.getElementById('issueDescriptionInput');
    const prioritySelect = document.getElementById('issuePrioritySelect');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = prioritySelect.value;
    
    // 入力検証
    if (!title) {
        titleInput.classList.add('input-error');
        titleInput.focus();
        return;
    }
    
    // ボタンを無効化（連続クリック防止）
    const addBtn = document.getElementById('addIssueBtn');
    addBtn.disabled = true;
    addBtn.textContent = '作成中...';
    
    // イシューを送信
    fetch('/api/issues', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            title: title,
            description: description,
            priority: priority
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(issue => {
        titleInput.value = ''; // 入力フィールドをクリア
        descriptionInput.value = '';
        prioritySelect.value = '中';
        titleInput.classList.remove('input-error');
        loadIssues(); // イシューリストを再読み込み
    })
    .catch(error => {
        alert('イシューの作成に失敗しました。もう一度お試しください。');
        console.error('Error:', error);
    })
    .finally(() => {
        // ボタンを再有効化
        addBtn.disabled = false;
        addBtn.textContent = 'イシューを作成';
    });
}

// イシューリストを表示する
function displayIssues(issues) {
    const issueList = document.getElementById('issueList');
    const emptyMessage = document.getElementById('emptyIssueMessage');
    
    // リストをクリア
    issueList.innerHTML = '';
    
    if (issues.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        
        // イシューアイテムを作成して表示
        issues.forEach(function(issue) {
            const listItem = createIssueItem(issue);
            issueList.appendChild(listItem);
        });
    }
}

// イシュー項目のHTMLを作成する
function createIssueItem(issue) {
    const createdDate = new Date(issue.createdAt);
    const formattedDate = formatDate(createdDate);
    
    const listItem = document.createElement('li');
    listItem.className = 'issue-item';
    
    // ステータスボタンの生成
    const statusButtons = generateStatusButtons(issue);
    
    listItem.innerHTML = `
        <div class="issue-header">
            <div>
                <div class="issue-title">${escapeHtml(issue.title)}</div>
                <div class="issue-meta">
                    <span class="issue-priority priority-${issue.priority}">${issue.priority}</span>
                    <span class="issue-status status-${issue.status}">${issue.status}</span>
                    <span class="issue-date">${formattedDate}</span>
                </div>
            </div>
        </div>
        ${issue.description ? `<div class="issue-description">${escapeHtml(issue.description)}</div>` : ''}
        <div class="issue-actions">
            ${statusButtons}
        </div>
    `;
    
    return listItem;
}

// ステータス変更ボタンを生成する
function generateStatusButtons(issue) {
    const buttons = [];
    
    if (issue.status === '未対応') {
        buttons.push(`<button class="status-btn start" onclick="updateIssueStatus(${issue.id}, '対応中')">対応開始</button>`);
        buttons.push(`<button class="status-btn complete" onclick="updateIssueStatus(${issue.id}, '完了')">完了</button>`);
    } else if (issue.status === '対応中') {
        buttons.push(`<button class="status-btn complete" onclick="updateIssueStatus(${issue.id}, '完了')">完了</button>`);
        buttons.push(`<button class="status-btn reopen" onclick="updateIssueStatus(${issue.id}, '未対応')">未対応に戻す</button>`);
    } else if (issue.status === '完了') {
        buttons.push(`<button class="status-btn reopen" onclick="updateIssueStatus(${issue.id}, '未対応')">再開</button>`);
    }
    
    return buttons.join('');
}

// イシューのステータスを更新する
function updateIssueStatus(issueId, newStatus) {
    fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(issue => {
        loadIssues(); // イシューリストを再読み込み
    })
    .catch(error => {
        alert('ステータスの更新に失敗しました。もう一度お試しください。');
        console.error('Error:', error);
    });
}

// 日付をフォーマットする
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (itemDate.getTime() === today.getTime()) {
        // 今日の場合
        return '今日 ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else {
        // 今日以外の場合
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
}

// HTMLエスケープ処理
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
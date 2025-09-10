# zekisoft-copilot
AI駆動開発テスト

## データ保持方式リファクタリング

このアプリケーションは、セッションをRedisに、TODOデータをMySQLに保存するようにリファクタリングされました。

### アーキテクチャ

- **セッション管理**: Redis (Spring Session Data Redis)
- **TODOデータ**: MySQL 8.0 (JPA/Hibernate)
- **アプリケーション**: Spring Boot 3.2.0

### 起動方法

1. **コンテナ起動**
   ```bash
   docker compose up -d
   ```

2. **アプリケーション起動**
   ```bash
   ./gradlew bootRun
   ```

3. **アクセス**
   http://localhost:8080

### データベース構成

#### MySQL
- ホスト: localhost:3306
- データベース: todoapp
- ユーザー: todouser
- パスワード: todopassword
- 文字コード: UTF8MB4
- タイムゾーン: Asia/Tokyo

#### Redis
- ホスト: localhost:6379
- 用途: セッション管理

### TODOテーブル構造

```sql
CREATE TABLE todo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

DDLは `sql/todo_ddl.sql` に格納されています。

### 機能
- TODOアイテムの追加（最大20文字）
- TODO一覧表示（新しい順）
- セッション管理（Redis）
- データ永続化（MySQL）

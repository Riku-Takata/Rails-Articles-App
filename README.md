# BlogApp

## 概要

**BlogApp**は、ユーザーが記事を作成、閲覧、編集、削除できるシンプルなブログアプリケーション。Ruby on Railsをバックエンドに、Reactをフロントエンドに使用し、モダンなWeb開発の実践例となっている。

## プログラムの内容説明

### 1. **アーキテクチャ**

このアプリケーションは、MVC（Model-View-Controller）アーキテクチャに基づいて構築されている。Railsがバックエンドのモデル、ビュー、コントローラを担当し、Reactがフロントエンドのビューを担当する。

### 2. **主要コンポーネントと機能**

- **Models（モデル）**:
  - `Article`: 記事データを管理するモデル。記事のタイトルと本文を格納し、データベースの`articles`テーブルに対応。バリデーションによって、タイトルと本文が必須であることを保証している。

- **Controllers（コントローラ）**:
  - `ArticlesController`: 記事の作成、一覧表示、削除を処理する。RailsのRESTfulなルーティングを利用し、データベースとやり取りを行う。リクエストに対してJSON形式でレスポンスを返す。

- **Views（ビュー）**:
  - `application.html.erb`: アプリケーション全体のレイアウトテンプレートで、共通のヘッダーやフッターを含む。また、Reactのエントリーポイントとして機能する。

- **React Components（Reactコンポーネント）**:
  - `Articles.js`: 記事の一覧表示、新規作成、編集、削除を行うコンポーネント。`useEffect`フックを使って、初回レンダリング時にサーバーから記事データを取得する。`useState`フックを使用して、記事データやフォームの入力内容を管理する。

### 3. **機能の流れ**

1. **記事の一覧表示**:
   - ユーザーがアプリケーションにアクセスすると、`Articles.js`コンポーネントが`useEffect`フックを使用してバックエンドにリクエストを送り、記事データを取得する。取得したデータはReactの状態として管理され、記事一覧が表示される。

2. **記事の作成**:
   - 「New Article」ボタンをクリックすると、新規記事作成フォームが表示される。フォームに入力されたデータは、`handleCreateOrUpdate`関数によってサーバーに送信され、新しい記事が作成される。作成後、記事一覧が更新される。

3. **記事の編集**:
   - 記事の編集ボタンをクリックすると、選択した記事のデータがフォームにロードされ、編集可能な状態になる。編集内容を保存すると、サーバーに送信され、データベースが更新される。

4. **記事の削除**:
   - 記事の削除ボタンをクリックすると、`handleDelete`関数がサーバーに削除リクエストを送り、記事が削除される。削除後、記事一覧から該当の記事が除外される。

### 4. **セキュリティ**

- **CSRF保護**:
  - RailsのCSRF（クロスサイトリクエストフォージェリ）対策が適用されている。Reactの`fetch`リクエストでは、`X-CSRF-Token`ヘッダーを使用してCSRFトークンをサーバーに送信し、セキュリティを確保している。

### 5. **データベースの役割**

- **SQLiteデータベース**:
  - 開発環境ではSQLiteを使用し、記事データの永続化を行っている。マイグレーションファイルにより、データベーススキーマの管理が行われている。


## **Articles.jsの詳細説明**

`Articles.js`は、このプロジェクトにおけるメインのReactコンポーネントであり、記事の一覧表示、新規作成、編集、削除といったCRUD（Create, Read, Update, Delete）操作を担当している。以下に、各部分の機能と動作を詳しく説明する。

#### **1. インポートと初期設定**

```javascript
import React, { useEffect, useState } from "react";
```

- **インポート**:
  - `React`はReactコンポーネントの作成に必要なライブラリ。
  - `useEffect`と`useState`は、Reactのフック（hooks）で、それぞれ副作用の処理と状態管理を行うために使用される。

#### **2. コンポーネントの状態管理**

```javascript
const [articles, setArticles] = useState([]);
const [title, setTitle] = useState('');
const [body, setBody] = useState('');
const [currentArticle, setCurrentArticle] = useState(null);
const [views, setViews] = useState('index'); // "index", "show", "edit", "new"
```

- **`articles`**:
  - 記事のリストを保持する状態。サーバーから取得した記事データが格納され、リストとして表示される。

- **`title`と`body`**:
  - 記事のタイトルと本文の入力値を保持する状態。新規作成や編集時にフォームから取得した値を管理する。

- **`currentArticle`**:
  - 現在編集中または表示中の記事を保持する状態。記事の編集や詳細表示を行う際に、この状態を使用する。

- **`views`**:
  - 現在のビュー状態を保持する状態。`"index"`, `"show"`, `"edit"`, `"new"`のいずれかが設定され、コンポーネントが表示するビューを切り替えるために使用する。

#### **3. データの取得（useEffectの利用）**

```javascript
useEffect(() => {
    fetch('/articles')
    .then(response => response.json())
    .then(data => setArticles(data));
}, []);
```

- **`useEffect`**:
  - コンポーネントがマウントされたとき（初回レンダリング時）に実行される。サーバーから記事データを取得し、`articles`状態に格納する。

- **`fetch`**:
  - `/articles`エンドポイントに対してHTTPリクエストを行い、JSON形式で記事データを取得する。取得したデータは`setArticles`を使って`articles`状態に設定される。

#### **4. 記事の作成・更新**

```javascript
const handleCreateOrUpdate = (event) => {
    event.preventDefault();
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    const method = currentArticle ? 'PATCH' : 'POST';
    const url = currentArticle ? `/articles/${currentArticle.id}` : '/articles';

    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ article: { title, body } }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status}, message: ${text}`); });
        }
        return response.json();
    })
    .then(data => {
        if (currentArticle) {
            setArticles(articles.map(article =>
                article.id === data.id ? data : article
            ));
        } else {
            setArticles([...articles, data]);
        }
        resetForm();
    })
    .catch(error => console.error('Error in handleCreateOrUpdate:', error));
};
```

- **`handleCreateOrUpdate`**:
  - 記事の新規作成または既存の記事の更新を処理する関数。`event.preventDefault()`によってフォームのデフォルトの送信動作を無効化する。

- **`csrfToken`**:
  - Railsが生成するCSRFトークンを取得し、リクエストの`X-CSRF-Token`ヘッダーに設定する。これにより、RailsのCSRF保護を通過できる。

- **`method`と`url`**:
  - `currentArticle`が存在する場合は`PATCH`メソッドを使用して既存の記事を更新し、`POST`メソッドを使用して新しい記事を作成する。`url`も同様に、`currentArticle`の有無に応じてエンドポイントを切り替える。

- **`fetch`リクエスト**:
  - 記事データをサーバーに送信し、結果を`articles`状態に反映する。新規作成時はリストに追加され、更新時はリスト内の該当記事が更新される。

#### **5. 記事の編集**

```javascript
const handleEdit = (article) => {
    setCurrentArticle(article);
    setTitle(article.title);
    setBody(article.body);
    setViews('edit');
};
```

- **`handleEdit`**:
  - 編集ボタンがクリックされたときに呼び出される関数。選択された記事を`currentArticle`に設定し、タイトルと本文をフォームに反映させる。また、ビューを`"edit"`に切り替える。

#### **6. 記事の削除**

```javascript
const handleDelete = (id) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(`/articles/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status}, message: ${text}`); });
        }
        setArticles(articles.filter(article => article.id !== id));
        setViews('index');
    })
    .catch(error => console.error('Error in handleDelete:', error));
};
```

- **`handleDelete`**:
  - 削除ボタンがクリックされたときに呼び出される関数。選択された記事をサーバーに削除リクエストとして送信し、成功した場合は記事リストから該当記事を除外する。

#### **7. フォームのリセット**

```javascript
const resetForm = () => {
    setTitle('');
    setBody('');
    setCurrentArticle(null);
    setViews('index');
};
```

- **`resetForm`**:
  - フォームの内容をリセットし、`title`、`body`、`currentArticle`を初期状態に戻す。また、ビューを`"index"`に切り替える。

#### **8. ビューのレンダリング**

```javascript
return (
    <div>
        {views === 'index' && renderIndexView()}
        {views ==='show' && renderShowView()}
        {(views === 'new' || views === 'edit') && renderFormView()}
    </div>
);
```

- **ビューの条件レンダリング**:
  - `views`の状態に応じて、`renderIndexView`、`renderShowView`、`renderFormView`のいずれかを表示する。これにより、記事の一覧表示、詳細表示、フォーム表示を切り替えることができる。


## **エントリーポイントでのReactコンポーネントの読み込み**

Reactコンポーネントをブラウザに表示するためには、エントリーポイントである`application.js`ファイルにこのコンポーネントをインポートし、ReactDOMを使用してコンポーネントをDOMにレンダリングする。

#### **application.js**

```javascript
import React from "react";
import ReactDOM from "react-dom";
import Articles from "./components/Articles";

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(<Articles />, root);
  }
});
```

- **インポート**:
  - `Articles.js`コンポーネントをインポートし、`ReactDOM`を使用してReactコンポーネントをDOMにマウントする。

- **DOMContentLoadedイベント**:
  - `DOMContentLoaded`イベントリスナーを使用して、DOMの構築が完了した後にReactコンポーネントをマウントするようにしている。これにより、HTMLが完全に読み込まれてからReactコンポーネントがレンダリングされる。

- **`root`要素**:
  - `index.html.erb`（後述）にある`<div id="root"></div>`要素に`Articles`コンポーネントがレンダリングされる。

## **Railsビューへの埋め込み**

Reactコンポーネントを含むJavaScriptは、Railsのビューに埋め込まれる。Railsのレイアウトファイル`application.html.erb`がその役割を果たす。

#### **application.html.erb**

```erb
<!DOCTYPE html>
<html>
  <head>
    <title>BlogApp</title>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= stylesheet_link_tag 'application', media: 'all' %>
    <%= javascript_include_tag 'application', type: 'module' %>
  </head>

  <body>
    <div id="root"></div>
    <%= yield %>
  </body>
</html>
```

- **`<div id="root"></div>`**:
  - この`<div>`要素はReactコンポーネントをマウントするための場所である。`application.js`で`ReactDOM.render(<Articles />, root);`とすることで、この要素にReactコンポーネントがレンダリングされる。

- **`javascript_include_tag 'application', type: 'module'`**:
  - `application.js`（およびその中でインポートされたJavaScriptモジュール）がブラウザで読み込まれ、実行されるように指定する。これにより、`Articles.js`コンポーネントがブラウザ上に表示される準備が整う。

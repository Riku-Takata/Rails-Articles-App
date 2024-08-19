import React, { useEffect, useState } from "react";

function Articles() {
    const [articles, setArticles] = useState([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [currentArticle, setCurrentArticle] = useState(null);
    const [views, setViews] = useState('index'); // "index", "show", "edit", "new"

    useEffect(() => {
        fetch('/articles')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => setArticles(data))
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
    }, []);

    const handleCreateOrUpdate = (event) => {
        event.preventDefault();
    
        // CSRFトークンを取得
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
        const method = currentArticle ? 'PATCH' : 'POST';
        const url = currentArticle ? `/articles/${currentArticle.id}` : '/articles';
    
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken  // CSRFトークンをヘッダーに追加
            },
            body: JSON.stringify({ article: { title, body } }), // データを article オブジェクトにラップして送信
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

    const handleEdit = (article) => {
        setCurrentArticle(article);
        setTitle(article.title);
        setBody(article.body);
        setViews('edit');
    };

    const handleDelete = (id) => {
        // CSRFトークンを取得
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
        fetch(`/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken  // CSRFトークンをヘッダーに追加
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

    const resetForm = () => {
        setTitle('');
        setBody('');
        setCurrentArticle(null);
        setViews('index');
    };

    const renderIndexView = () => (
        <div>
            <h1>React Articles</h1>
            <button onClick={() => setViews('new')}>New Article</button>
            <ul>
                {articles.map(article => (
                    <li key={article.id}>
                        {article.title}
                        <button onClick={() => setViews('show') & setCurrentArticle(article)}>Show</button>
                        <button onClick={() => handleEdit(article)}>Edit</button>
                        <button onClick={() => handleDelete(article.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderShowView = () => (
        <div>
            <h1>{currentArticle.title}</h1>
            <p>{currentArticle.body}</p>
            <button onClick={() => setViews('index')}>Back to All List</button>
        </div>
    );

    const renderFormView = () => (
        <form onSubmit={handleCreateOrUpdate}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
            <button type="submit">{currentArticle ? 'Update Article' : 'Create Article'}</button>
            <button type="button" onClick={() => resetForm()}>Cancel</button>
        </form>
    );

    return(
        <div>
            {views === 'index' && renderIndexView()}
            {views === 'show' && renderShowView()}
            {(views === 'new' || views === 'edit') && renderFormView()}
        </div>
    );
}

export default Articles;
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

    const handleEdit = (article) => {
        setCurrentArticle(article);
        setTitle(article.title);
        setBody(article.body);
        setViews('edit');
    };

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

    const resetForm = () => {
        setTitle('');
        setBody('');
        setCurrentArticle(null);
        setViews('index');
    };

    const renderIndexView = () => (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">React Articles</h1>
            <button 
                onClick={() => setViews('new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
            >
                New Article
            </button>
            <ul className="space-y-4">
                {articles.map(article => (
                    <li key={article.id} className="bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{article.title}</h2>
                        <p className="text-gray-500 text-sm">By User ID: {article.user ? article.user.id : 'Unknown Author'}</p>
                        <div className="space-x-2 mt-2">
                            <button 
                                onClick={() => setViews('show') & setCurrentArticle(article)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Show
                            </button>
                            <button 
                                onClick={() => handleEdit(article)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(article.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderShowView = () => (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{currentArticle.title}</h1>
            <p className="text-gray-600 mb-6">{currentArticle.body}</p>
            <button 
                onClick={() => setViews('index')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
                Back to All List
            </button>
        </div>
    );

    const renderFormView = () => (
        <div className="container mx-auto px-4 py-8">
            <form onSubmit={handleCreateOrUpdate} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <textarea
                        placeholder="Body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline h-32"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button 
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {currentArticle ? 'Update Article' : 'Create Article'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => resetForm()}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    return(
        <div className="bg-gray-100 min-h-screen">
            {views === 'index' && renderIndexView()}
            {views === 'show' && renderShowView()}
            {(views === 'new' || views === 'edit') && renderFormView()}
        </div>
    );
}

export default Articles;
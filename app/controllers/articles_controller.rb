class ArticlesController < ApplicationController
    before_action :authenticate_user!, only: [:create, :update, :destroy]  # 認証が必要なアクションを制限
  
    def index
        @articles = Article.includes(:user).all
        respond_to do |format|
          format.json { render json: @articles.to_json(include: :user) }
          format.html
        end
      end
    
      def show
        @article = Article.find(params[:id])
        render json: @article.to_json(include: :user)
      end
  
    def create
        @article = current_user.articles.new(article_params)
        if @article.save
          render json: @article.as_json(include: :user), status: :created
        else
          render json: @article.errors, status: :unprocessable_entity
        end
      end
  
    def update
      @article = Article.find(params[:id])
      if @article.update(article_params)
        render json: @article
      else
        render json: @article.errors, status: :unprocessable_entity
      end
    end
  
    def destroy
      @article = Article.find(params[:id])
      @article.destroy
      head :no_content
    end
  
    private
  
    def article_params
      params.require(:article).permit(:title, :body)
    end
  end
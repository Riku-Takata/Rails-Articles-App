Rails.application.routes.draw do
  root "articles#index"
  resources :articles, only: [ :index, :show, :create, :update, :destroy ]
end

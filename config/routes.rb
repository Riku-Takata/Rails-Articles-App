Rails.application.routes.draw do
  devise_for :users
  root "articles#index"
  resources :articles, only: [ :index, :show, :new, :create, :update, :destroy ]
end

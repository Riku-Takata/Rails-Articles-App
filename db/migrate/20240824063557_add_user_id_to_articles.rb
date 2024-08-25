class AddUserIdToArticles < ActiveRecord::Migration[7.2]
  def change
    add_reference :articles, :user, null: false, foreign_key: true
  end
end

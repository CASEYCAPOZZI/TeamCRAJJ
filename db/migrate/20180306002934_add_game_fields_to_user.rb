class AddGameFieldsToUser < ActiveRecord::Migration
  def change
    add_column :users, :hs_score, :integer
    add_column :users, :hs_bullets_used, :integer
    add_column :users, :hs_num_deaths, :integer
    add_column :users, :current_game_exists, :boolean
    add_column :users, :current_score, :integer
    add_column :users, :current_lives, :integer
    add_column :users, :current_deaths, :integer
    add_column :users, :current_bullets, :integer
  end
end

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  helper_method :current_user
  
  def current_user
    @current_user ||=User.find(session[:user_id]) if session[:user_id]
  end
  
#  def top_users
#    @top_users ||=Users.find(:all, :order => "id desc", :limit => 10).each do |user|
#                   user.name + " " + user.hs_score
#  end

    def users_array
        
        usersArray = []

        Users.all.each do |user|
            userArray.insert(user)
        end
    end
end

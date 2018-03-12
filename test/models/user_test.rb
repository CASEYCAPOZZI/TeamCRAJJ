require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  def test_find_user
    # Asserts that the controller really put the book in the database.
    assert_not_nil User.find_by(name: "Test User")
  end 
  
end

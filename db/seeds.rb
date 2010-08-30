# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)
palette = Palette.create!
palette.colors.clear
[
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0xa5, 0x2a, 0x2a]
].each do |red, green, blue|
  palette.colors.create!(:red => red, :green => green, :blue => blue, :alpha => 1)
end

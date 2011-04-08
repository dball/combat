palette = Palette.create!
palette.colors.clear
[
  [0, 0, 0, 'prop'],
  [255, 0, 0, 'extra'],
  [0, 255, 0, 'actor'],
  [0xa5, 0x2a, 0x2a, 'set']
].each do |red, green, blue, kind|
  palette.colors.create!(:red => red, :green => green, :blue => blue, :alpha => 1, :kind => kind)
end

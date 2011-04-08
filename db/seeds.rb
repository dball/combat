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

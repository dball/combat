Then /^I should see (a new map|the newest map)$/ do |flavor|
  @map = Map.last
  Then "I should see the map"
end

Given /^a map$/ do
  @map = Map.create
end

Then /^I should see the map$/ do
  Then "I should be on the map page"
end

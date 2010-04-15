Feature: Effects

Scenario: create circular effect
  Given I go to the map page
  When I type 'e'
  And I type 'r'
  And I type '3'
  And I click on any tile
  Then I should see a circle centered on that tile with a radius of 3 tiles

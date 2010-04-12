Feature: Maps

Scenario: visit the homepage with no map
  When I go to the home page
  Then I should see a new map

Scenario: visit the homepage with a map
  Given a map
  When I go to the home page
  Then I should see the newest map

Scenario: make a new map
  Given I go to the home page
  When I press "New Combat"
  Then I should see a new map

Scenario: view a map
  Given a map
  When I go to the map page
  Then I should see the map

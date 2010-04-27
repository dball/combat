Feature: sizing the viewport

Scenario: empty map
  Given an empty map
  When I view the map
  Then I should see at least 20 tiles on each side

Scenario: one figure
  Given a map with one figure
  When I view the map
  Then I should see at least 20 tiles on each side
  And the figure should be centered

Scenario: many figures
  Given a map with many figures
  When I view the map
  Then I should see at least 20 tiles on each side
  And the center of the figures should be centered

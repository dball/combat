Feature: Viewport

Background:
  Given a map

Scenario: zoom out
  When I type '['
  Then the map should zoom out

Scenario: zoom in
  When I type ']'
  Then the map should zoom in

Scenario: translate left
  When I hit the left arrow
  Then the map should pan leftward

Scenario: translate up
  When I hit the up arrow
  Then the map should pan upward

Scenario: translate right
  When I hit the right arrow
  Then the map should pan rightward

Scenario: translate down
  When I hit the down arrow
  Then the map should pan downward

Scenario: reset
  Given I type '['
  And I hit the left arrow
  And I hit the up arrow
  When I type '='
  Then the map should reset

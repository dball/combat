Feature: Drawing

Scenario: draw wall
  Given I go to the map page
  When I type 'd'
  And I click any intersection
  And I click any other intersection
  Then I should see a thick line between the intersections

Scenario: draw wall start cursor
  Given I go to the map page
  When I type 'd'
  And I hover over any intersection
  Then I should see a cursor over the intersection

Scenario: draw wall next cursor
  Given I go to the map page
  When I type 'd'
  And I click on any intersection
  And I hover over any other intersection
  Then I should see a thick line cursor between the intersections

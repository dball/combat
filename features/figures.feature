Feature: Manage Figures

Scenario: create figure
  Given I go to the map page
  When I type 'c'
  And I type any letter
  And I click any tile
  Then the tile should contain a figure with that letter

Scenario: create figure cursor
  Given I go to the map page
  When I type 'c'
  And I type any letter
  And I hover over a tile
  Then the tile should have a cursor with that letter

Scenario: cancel create figure cursor
  Given I go to the map page
  When I type 'c'
  And I hit escape
  And I hover over a tile
  Then the tile should have no cursor

Scenario: cancel create figure effect
  Given I go to the map page
  When I type 'c'
  And I hit escape
  And I type any letter
  And I click any tile
  Then the tile should not contain a figure with that letter

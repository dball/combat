class RenameFigureCharacterToLetter < ActiveRecord::Migration
  def self.up
    change_table :figures do |t|
      t.rename :character, :letter
    end
  end

  def self.down
    change_table :figures do |t|
      t.rename :letter, :character
    end
  end
end

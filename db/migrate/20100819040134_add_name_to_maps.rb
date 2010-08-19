class AddNameToMaps < ActiveRecord::Migration
  def self.up
    change_table :maps do |t|
      t.string :name
    end
  end

  def self.down
    change_table :maps do |t|
      t.remove :name
    end
  end
end

class AddMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.integer :origin_x
      t.integer :origin_y
      t.integer :width
      t.integer :height
    end
  end

  def self.down
    drop_table :maps
  end
end

class AddWalls < ActiveRecord::Migration
  def self.up
    create_table :walls do |t|
      t.integer :map_id, :null => false
      t.integer :x0, :null => false
      t.integer :y0, :null => false
      t.integer :x1, :null => false
      t.integer :y1, :null => false
    end
    add_index :walls, :map_id
  end

  def self.down
    drop_table :walls
  end
end

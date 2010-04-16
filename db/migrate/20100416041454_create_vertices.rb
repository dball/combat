class CreateVertices < ActiveRecord::Migration
  def self.up
    create_table :vertices do |t|
      t.integer :wall_id, :null => false
      t.integer :x, :null => false
      t.integer :y, :null => false
    end
    add_index :vertices, :wall_id
    change_table :walls do |t|
      t.remove :x0
      t.remove :x1
      t.remove :y0
      t.remove :y1
    end
  end

  def self.down
    change_table :walls do |t|
      t.integer :x0
      t.integer :x1
      t.integer :y0
      t.integer :y1
    end
    drop_table :vertices
  end
end

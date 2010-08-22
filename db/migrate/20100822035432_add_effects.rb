class AddEffects < ActiveRecord::Migration
  def self.up
    create_table :effects do |t|
      t.integer :map_id, :null => false
      t.string :shape, :limit => 6, :null => false
      t.integer :x, :null => false
      t.integer :y, :null => false
      t.integer :size, :null => false
      t.float :orientation
    end
    add_index :effects, :map_id
  end

  def self.down
    drop_table :effects
  end
end

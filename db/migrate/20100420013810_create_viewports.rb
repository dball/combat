class CreateViewports < ActiveRecord::Migration
  def self.up
    create_table :viewports do |t|
      t.integer :map_id, :null => false
      t.float :x, :null => false, :default => 0
      t.float :y, :null => false, :default => 0
      t.float :scale, :null => false, :default => 1
    end
  end

  def self.down
    drop_table :viewports
  end
end

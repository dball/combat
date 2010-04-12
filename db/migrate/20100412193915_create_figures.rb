class CreateFigures < ActiveRecord::Migration
  def self.up
    create_table :figures do |t|
      t.integer :map_id, :null => false
      t.integer :position_x
      t.integer :position_y
      t.string :character, :limit => 1, :null => false
      t.string :size, :limit => 1, :null => false, :default => 'M'
    end
    add_index :figures, :map_id
  end

  def self.down
    drop_table :figures
  end
end
